
import mysql2, { type Pool, type PoolConnection } from 'mysql2/promise'
import { ConnectionAction } from '../interfaces/api.db.interface';
import { logger } from '../utils/logger';
import { appConfigs } from '../configs/api.config';



const dbconfig = appConfigs.dbConfig;
export const dbName = dbconfig['database'];

let pool: Pool;

function initializePool() {
    logger.info(`Initializing MySQL pool...`);
    const config = {
        connectionLimit: 100, // default 10
        host: dbconfig['host'],
        user: dbconfig['user'],
        password: dbconfig['password'],
        database: dbconfig['database'],
        charset: dbconfig['charset'],
        typeCast: function castTinyToBoolean(field: any, next: any) {
            if ((field.type === "TINY") && (field.length === 1)) {
                return field.string() === '1';
            }
            return next();
        }
    }
    pool = mysql2.createPool(config);
    logger.info(`MySQL pool is Initialized!`)
}


export function ConnectionPool(): Promise<ConnectionAction> {
    if (!pool) {
        logger.info(`Initializing MySQL pool...`);
        initializePool();
    }
    return new Promise<ConnectionAction>(async (resolve, reject) => {
        pool.getConnection().then(connection => {
            logger.info("MySQL pool is connected! ThreadId:" + connection.threadId);
            const query = (sql: string, binding: any) => {
                return new Promise((resolve, reject) => {
                    // console.log("sql:",sql)
                    connection.query<any>(sql, binding).then(result => {
                        resolve(result[0])
                    }).catch(error => {
                        logger.error(error.message, `sql: ${sql}`);
                        reject(error);
                    })
                });
            };

            const querySingle = (sql: string, binding: any) => {
                return new Promise<any>((resolve, reject) => {
                    // console.log("sql:",sql)
                    connection.query(sql, binding).then(result => {
                        resolve(result? (result[0] as any[])[0] : result);
                    }).catch(error => {
                        logger.error(error.message, `sql: ${sql}`);
                        reject(error);
                    })
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
            resolve({ ...connection, query, querySingle, release, commit, beginTransaction, rollback });
        }).catch(error => {
            logger.error("MySQL initialize is failed!", error);
            reject(error);
        })
    })
};

