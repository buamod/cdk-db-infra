// database.ts
import { Construct } from 'constructs';
import { ApiObject } from 'cdk8s';

export interface PostgresDatabaseProps {
  name: string;
  owner?: string;
  size?: string;
  version?: string;
}

export class PostgresDatabase extends Construct {
  constructor(scope: Construct, id: string, props: PostgresDatabaseProps) {
    super(scope, id);

    new ApiObject(this, 'postgresql', {
      apiVersion: 'acid.zalan.do/v1',
      kind: 'postgresql',
      metadata: {
        name: props.name
      },
      spec: {
        teamId: 'acid',
        postgresql: {
          version: props.version || '14',
        },
        volume: {
          size: props.size || '10Gi'
        },
        users: {
          [props.owner || 'postgres']: ['superuser']
        },
        numberOfInstances: 1,
        databases: {
          [props.name]: props.owner || 'postgres'
        }
      }
    });
  }
}