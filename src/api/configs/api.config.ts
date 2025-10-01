export const appConfigs = {
    dbConfig: {
        host: "localhost",
        user: "myerpdb",
        password: "myerpdb",
        database: "myerpdb_ezeinvoice",
        charset: "utf8mb4",
        pool: {
            min: 10,
            max: 30
        }
    },
    cors: {
        origin: [
            "http://localhost:4200",
            "http://localhost:8100",
            "http://localhost:8101",
            "http://localhost",
            "capacitor://localhost"
        ],
        credentials: true
    },
    io: {
        connectionStateRecovery: {},
        cors: {
            origin: [
                "http://localhost:4200",
                "http://localhost:8100",
                "http://localhost",
                "capacitor://localhost"
            ],
            methods: [
                "GET",
                "POST"
            ],
            credentials: true
        },
        transports: [
            "websocket",
            "polling"
        ]

    },
    logger: {
        dir: "files"
    },
    log: {
        format: "dev",
        dir: "../logs"
    },
    jwt: {
        JWT_PASS: "@MYERP#",
        JWT_EXP: "1 hour",
        JWT_REFRESH_EXP: "10 days",
    },
    fileLimit: {
        singleFile: 1000,
        multiFiles: 3000
    }
}