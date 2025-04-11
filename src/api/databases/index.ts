
import mysql, { MysqlError, Pool, PoolConnection } from 'mysql'

import { ConnectionAction } from '../interfaces/api.db.interface';
import { logger } from '../utils/logger';
import { appConfigs } from '../configs/api.config';


//----------------MYSQL----------------------
const db: mysql.Connection | null = null
// var pool: mysql.Connection | null = null;
// var pingInterval: NodeJS.Timeout;
const config = appConfigs.dbConfig
export const dbName = config.database

export const connection = connectionPool();
export default db;

let pool: Pool;

function initializePool() {
    pool = mysql.createPool({
        connectionLimit: 100, // default 10
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        charset: config.charset,
        typeCast: function castTinyToBoolean(field, next) {
            if ((field.type === "TINY") && (field.length === 1)) {
                return field.string() === '1';
            }
            return next();

        }
    });
    logger.info(`Mysql pool is Initialized!`);
}


export function connectionPool() {
    if (!pool) {
        logger.info(`Initializing mysql pool...`);
        initializePool();
    }

    return new Promise<ConnectionAction>(async (resolve, reject) => {

        pool.getConnection((error: MysqlError, connection: PoolConnection) => {
            if (error) {
                logger.error("Mysql initialize is failed!", error);
                reject(error);
            }
            logger.info("MySQL pool is connected! ThreadId:" + connection.threadId);

            const query = (sql: string, binding: any) => {
                return new Promise((resolve, reject) => {
                    connection.query(sql, binding, (error, result) => {
                        if (error) {
                            console.log(error)
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
                            console.log(error)
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

};

