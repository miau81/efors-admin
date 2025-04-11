
export interface DBConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  pool: {
    min: number;
    max: number;
  };
}

export interface ConnectionRID {
  rid: string,
  connection: ConnectionAction
}

export interface ConnectionAction {
  query(sql: string, binding?: any): Promise<any>,
  querySingle(sql: string, binding?: any): Promise<any>,
  release(): void,
  beginTransaction(): void,
  commit(): void,
  rollback(): void
}