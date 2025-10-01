
import mysql2, { type Pool, type PoolConnection } from 'mysql2/promise'
import type { ConnectionAction } from '../interfaces/api.db.interface';
import { logger } from '../utils/logger';
import { appConfigs } from '../configs/api.config';



const dbconfig = appConfigs.dbConfig;
export const dbName = dbconfig['database'];

export class DatabaseService {

    private pool!: Pool;
    constructor() {
    }

    public async getConnectionPool() {
        if (!this.pool) {
            this.initializePool();
        }
        return new Promise<ConnectionAction>(async (resolve, reject) => {
            this.pool.getConnection().then(connection => {
                logger.info("MySQL pool is connected! ThreadId:" + connection.threadId);
                const query = (sql: string, binding: any) => {
                    return new Promise((resolve, reject) => {
                        connection.query(sql, binding).then(result => {
                            resolve(result)
                        }).catch(error => {
                            logger.error(error.message, `sql: ${sql}`);
                            reject(error);
                        })
                    });
                };

                const querySingle = (sql: string, binding: any) => {
                    return new Promise((resolve, reject) => {
                        connection.query(sql, binding).then(result => {
                            resolve(result ? result[0] : result);
                        }).catch(error => {
                            logger.error(error.message, `sql: ${sql}`);
                            reject(error);
                        })
                    });
                };

                const release = () => {
                    logger.info("MySQL pool is released! ThreadId: " + connection.threadId);
                    return connection.release();
                };

                const commit = () => {
                    logger.info("MySQL pool is committed! ThreadId: " + connection.threadId);
                    return connection.commit();
                }

                const beginTransaction = () => {
                    logger.info("MySQL pool is begin transaction! ThreadId: " + connection.threadId);
                    return connection.beginTransaction();
                }

                const rollback = () => {
                    logger.info("MySQL pool is roll back! ThreadId: " + connection.threadId);
                    return connection.rollback();
                }
                resolve({ ...connection, query, querySingle, release, commit, beginTransaction, rollback });
            }).catch(error => {
                logger.error("MySQL initialize is failed!", error);
                reject(error);
            })
        })
        // });
    }

    private initializePool() {
        logger.info(`Initializing MySQL pool...`);
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
        this.pool = mysql2.createPool(config);
        logger.info(`MySQL pool is Initialized!`)
    }

}

