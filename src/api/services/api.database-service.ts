
import mysql, { type MysqlError, type Pool, type PoolConnection } from 'mysql'
import type { ConnectionAction } from '../interfaces/api.db.interface';
import { logger } from '../utils/logger';
import { appConfigs } from '../configs/api.config';



const dbconfig = appConfigs.dbConfig;
export const dbName = dbconfig['database'];

export class Database {
    static connectionAction: ConnectionAction;
    private pool!: Pool;
    constructor() {
    }

    async init() {
        Database.connectionAction = await this.connectionPool();
    }
    public connectionPool() {
        if (!this.pool) {
            logger.info(`Initializing mysql pool...`);
            this.initializePool();
        }
        return new Promise<ConnectionAction>(async (resolve, reject) => {
            this.pool.getConnection((error: MysqlError, connection: PoolConnection) => {
                if (error) {
                    logger.error("Mysql initialize is failed!", error);
                    reject(error);
                }

                logger.info("MySQL pool is connected! ThreadId:" + connection.threadId);

                const query = (sql: string, binding: any) => {
                    return new Promise((resolve, reject) => {
                        connection.query(sql, binding, (error, result) => {
                            if (error) {
                                logger.error(error.message, `sql: ${sql}`);
                                reject(error);
                            }
                            resolve(result);
                        });
                    });
                };

                const querySingle = (sql: string, binding: any) => {
                    return new Promise((resolve, reject) => {
                        connection.query(sql, binding, (err, result) => {
                            if (error) {
                                logger.error(error.message, `sql: ${sql}`);
                                reject(error);
                            }
                            resolve(result ? result[0] : result);
                        });
                    });
                };

                const release = () => {
                    logger.info("MySQL pool is released! ThreadId: " + connection.threadId);
                    connection.release();
                };

                const commit = () => {
                    logger.info("MySQL pool is committed! ThreadId: " + connection.threadId);
                    connection.commit();
                }

                const beginTransaction = () => {
                    logger.info("MySQL pool is begin transaction! ThreadId: " + connection.threadId);
                    connection.beginTransaction();
                }

                const rollback = () => {
                    logger.info("MySQL pool is roll back! ThreadId: " + connection.threadId);
                    connection.rollback();
                }
                resolve({ query, querySingle, release, commit, beginTransaction, rollback });
            })
        });
    }

    private initializePool() {
        const config = {
            connectionLimit: 100, // default 10
            host: dbconfig['host'],
            user: dbconfig['user'],
            password: dbconfig['password'],
            // database: dbconfig['database'],
            charset: dbconfig['charset'],
            typeCast: function castTinyToBoolean(field: any, next: any) {
                if ((field.type === "TINY") && (field.length === 1)) {
                    return field.string() === '1';
                }
                return next();
            }
        }
        this.pool = mysql.createPool(config);
        logger.info(`Mysql pool is Initialized!`);
    }

}
export default Database;

