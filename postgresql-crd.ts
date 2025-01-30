// postgresql-crd.ts
import { Construct } from 'constructs';
import { ApiObject } from 'cdk8s';
import { PostgresqlSpecPostgresqlVersion } from './imports/acid.zalan.do';

export interface PostgresqlCrdProps {
  group: string;                  // The API group for the CRD
  versions: string[];             // List of versions (e.g., ['v1'])
  scope: 'Namespaced' | 'Cluster'; // Scope of the CRD
}

export class PostgresqlCrd extends Construct {
  constructor(scope: Construct, id: string, props: PostgresqlCrdProps) {
    super(scope, id);

    new ApiObject(this, 'PostgresqlCRD', {
      apiVersion: 'apiextensions.k8s.io/v1',
      kind: 'CustomResourceDefinition',
      metadata: {
        name: 'postgresqls.acid.zalan.do',
        annotations: {
          'cdk8s.io/force': 'true'
        }
      },
      spec: {
        group: props.group,
        names: {
          kind: 'Postgresql',
          plural: 'postgresqls',
          singular: 'postgresql',
          shortNames: ['pg']
        },
        scope: props.scope,
        versions: props.versions.map(version => ({
          name: version,
          served: true,
          storage: true,
          schema: {
            openAPIV3Schema: {
              type: 'object',
              properties: {
                spec: {
                  type: 'object',
                  properties: {
                    teamId: { type: 'string' },
                    postgresql: {
                      type: 'object',
                      properties: {
                        version: { 
                          type: 'string',
                          enum: Object.values(PostgresqlSpecPostgresqlVersion)
                        }
                      }
                    },
                    volume: {
                      type: 'object',
                      properties: {
                        size: { type: 'string' },
                        storageClass: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }))
      }
    });
  }
}