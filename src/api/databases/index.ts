
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
            if (field.type === 'DECIMAL' || field.type === 'NEWDECIMAL') {
                // Use parseFloat() to convert the stored string to a JS number
                return parseFloat(field.string());
            }
            return next();
        }
    }
    pool = mysql2.createPool(config);
    logger.info(`MySQL pool is Initialized!`)
}


export async function ConnectionPool(): Promise<ConnectionAction> {
    if (!pool) {
        initializePool();
    }
    try {
        const connection = await pool.getConnection();
        logger.info("MySQL pool is connected! ThreadId:" + connection.threadId);
        const query = async (sql: string, binding: any) => {
            const rows = await connection.query<any>(sql, binding);
            console.log("query",sql)
            return rows[0];
        };

        const querySingle = async (sql: string, binding: any) => {
            const rows = await connection.query<any>(sql, binding);
            console.log("querySingle",sql)
            return rows[0]?.[0];
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
        return { ...connection, query, querySingle, release, commit, beginTransaction, rollback };
    } catch (error) {
        logger.error("MySQL pool connection is failed!", error);
        throw error;
    }
    // return new Promise<ConnectionAction>(async (resolve, reject) => {
    //     pool.getConnection().then(connection => {

    //     }).catch(error => {

    //         reject(error);
    //     })
    // })
};

