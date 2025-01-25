import { Construct } from 'constructs';
import { App, Chart } from 'cdk8s';
import { KubeDeployment, KubeConfigMap, KubeSecret} from './imports/k8s';
import { PostgresDatabase } from './database';

export class PostgresOperatorChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Operator secret
    new KubeSecret(this, 'postgres-operator-secret', {
      metadata: {
        name: 'postgresql-operator'
      },
      stringData: {
        username: 'postgres',
        password: 'postgres'
      }
    });

    // Operator configuration
    new KubeConfigMap(this, 'postgres-operator-config', {
      metadata: {
        name: 'postgres-operator'
      },
      data: {
        enable_team_superuser: 'false',
        enable_teams_api: 'false',
        enable_team_member_deprecation: 'false',
        username: 'postgres',
        password: 'postgres'
      }
    });

    // Basic operator deployment
    new KubeDeployment(this, 'postgres-operator', {
      metadata: {
        name: 'postgres-operator'
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'postgres-operator'
          }
        },
        template: {
          metadata: {
            labels: {
              app: 'postgres-operator'
            }
          },
          spec: {
            containers: [{
              name: 'postgres-operator',
              image: 'registry.opensource.zalan.do/acid/postgres-operator:latest'
            }],
            serviceAccountName: 'postgres-operator'  // Add this line
          }
        }
      }
    });

    // Example database deployment
    new PostgresDatabase(this, 'example-db', {
      name: 'example-db',
      size: '10Gi',
      version: '14'
    });
  }
}

const app = new App();
new PostgresOperatorChart(app, 'postgres-operator');
app.synth();