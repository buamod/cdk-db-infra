import { Construct } from 'constructs';
import { App, Chart } from 'cdk8s';
import { 
  KubeDeployment, 
  KubeConfigMap, 
  KubeSecret, 
  KubeServiceAccount, 
  KubeClusterRole, 
  KubeClusterRoleBinding 
} from './imports/k8s';
import { PostgresDatabase } from './database';
import { PostgresqlSpecPostgresqlVersion } from './imports/acid.zalan.do';
import { PostgresqlCrd } from './postgresql-crd'; 

export class PostgresOperatorChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // ==============================================
    // 1. Operator Secret
    // ==============================================
    const operatorSecret = new KubeSecret(this, 'postgresql-operator-secret', {
      metadata: {
        name: 'postgresql-operator'
      },
      stringData: {
        superuser_username: 'postgres',
        superuser_password: 'postgres'
      }
    });

    // ==============================================
    // 2. CRD Definition (Refactored)
    // ==============================================
    new PostgresqlCrd(this, 'PostgresqlCRD', {
      group: 'acid.zalan.do',
      versions: ['v1'],
      scope: 'Namespaced'
    });

    // ==============================================
    // 3. RBAC Configuration
    // ==============================================
    const serviceAccount = new KubeServiceAccount(this, 'postgres-operator-sa', {
      metadata: { name: 'postgres-operator' }
    });

    const clusterRole = new KubeClusterRole(this, 'postgres-operator-role', {
      metadata: { name: 'postgres-operator' },
      rules: [
        {
          apiGroups: ['acid.zalan.do'],
          resources: ['postgresqls'],
          verbs: ['*']
        },
        {
          apiGroups: [''],
          resources: ['pods', 'services', 'configmaps', 'secrets'],
          verbs: ['*']
        },
        {
          apiGroups: ['apps'],
          resources: ['statefulsets'],
          verbs: ['*']
        }
      ]
    });

    new KubeClusterRoleBinding(this, 'postgres-operator-rolebinding', {
      metadata: { name: 'postgres-operator' },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: clusterRole.name
      },
      subjects: [{
        kind: 'ServiceAccount',
        name: serviceAccount.name,
        namespace: 'default'
      }]
    });

    // ==============================================
    // 4. Operator Configuration
    // ==============================================
    new KubeConfigMap(this, 'postgres-operator-config', {
      metadata: { name: 'postgres-operator' },
      data: {
        'config.yaml': `
          enable_team_superuser: false
          enable_teams_api: false
          teams_api_url: ""
          kubernetes:
            cluster_name: "default"
          docker_image: registry.opensource.zalan.do/acid/spilo-14:2.1-p3
        `
      }
    });

    // ==============================================
    // 5. Operator Deployment
    // ==============================================
    new KubeDeployment(this, 'postgres-operator-deployment', {
      metadata: { name: 'postgres-operator' },
      spec: {
        replicas: 1,
        selector: { matchLabels: { app: 'postgres-operator' } },
        template: {
          metadata: { labels: { app: 'postgres-operator' } },
          spec: {
            serviceAccountName: serviceAccount.name,
            containers: [{
              name: 'postgres-operator',
              image: 'registry.opensource.zalan.do/acid/postgres-operator:latest',
              env: [
                {
                  name: 'POD_NAME',
                  valueFrom: { fieldRef: { fieldPath: 'metadata.name' } }
                },
                {
                  name: 'KUBERNETES_POD_NAMESPACE',
                  valueFrom: { fieldRef: { fieldPath: 'metadata.namespace' } }
                },
                {
                  name: 'POSTGRES_SUPERUSER_USERNAME',
                  valueFrom: {
                    secretKeyRef: {
                      name: operatorSecret.name,
                      key: 'superuser_username'
                    }
                  }
                },
                {
                  name: 'POSTGRES_SUPERUSER_PASSWORD',
                  valueFrom: {
                    secretKeyRef: {
                      name: operatorSecret.name,
                      key: 'superuser_password'
                    }
                  }
                }
              ],
              volumeMounts: [{
                name: 'config',
                mountPath: '/etc/postgres-operator'
              }]
            }],
            volumes: [{
              name: 'config',
              configMap: { name: 'postgres-operator' }
            }]
          }
        }
      }
    });

    // ==============================================
    // 6. Database Instance
    // ==============================================
    new PostgresDatabase(this, 'example-db', {
      name: 'example-db',
      size: '10Gi',
      version: PostgresqlSpecPostgresqlVersion.VALUE_14  
    });
  }
}

const app = new App();
new PostgresOperatorChart(app, 'postgres-operator');
app.synth();