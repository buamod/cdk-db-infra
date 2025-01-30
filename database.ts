import { Construct } from 'constructs';
import { Postgresql, PostgresqlSpecPostgresqlVersion, PostgresqlSpecUsers } from './imports/acid.zalan.do';

export interface PostgresDatabaseProps {
  name: string;
  owner?: string;
  size?: string;
  version?: PostgresqlSpecPostgresqlVersion;
}

export class PostgresDatabase extends Construct {
  constructor(scope: Construct, id: string, props: PostgresDatabaseProps) {
    super(scope, id);

    new Postgresql(this, 'postgresql-instance', {
      metadata: { 
        name: props.name 
      },
      spec: {
        teamId: 'acid',
        postgresql: {
          version: props.version || PostgresqlSpecPostgresqlVersion.VALUE_14
        },
        volume: {
          size: props.size || '10Gi',
          storageClass: 'local-path'
        },
        numberOfInstances: 1,
        databases: {
          [props.name]: props.owner || 'postgres'
        },
        users: {
          'postgres': [
            PostgresqlSpecUsers.SUPERUSER
          ]
        }
      }
    });
  }
}