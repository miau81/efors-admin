import dayjs from "dayjs";
const rfs = require('rotating-file-stream');

class BunLogger {
    public stream!: any;
    private loggers: {
        level: BunLoggerType;
        stream: any;
    }[] = [];
    constructor(loggerOption: BunLoggerOption) {
        this.createLogger(loggerOption)
    }

    private createLogger(loggerOption: BunLoggerOption) {
        if (!loggerOption.transports) {
            throw Error("BunLogger: No transpoters found.");
        }
        for (let transport of loggerOption.transports) {
            this.createRotate(transport)
        }
    }

    private createRotate(transport: BunLoggerTransport) {
        // const logFile = this.generateFile(transport.filePath, transport.fileName);
        // console.log(logFile)
        const stream = rfs.createStream(transport.fileName, {
            path: transport.filePath,
            size: transport.maxSize || "10M",
            interval: transport.rotateInteval || '1d',
            maxFiles: transport.maxFiles || 30,
            // compress: transport.zippedArchive == false ? false : true,
            encoding: "utf8",
            maxSize: transport.maxSize || "100M",
        });
        this.loggers.push({
            stream: stream,
            level: transport.level
        })
        this.stream = stream;
    }


    private generateMessage(type: BunLoggerType, args: any[], displayTime: boolean = true) {
        if (!args) {
            return;
        }
        const currentDateTime = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
        let arg = displayTime ? `${currentDateTime} [${type}]:` : '';
        if (args.length == 1 && typeof args[0] != 'object') {
            return `${arg} ${args.toString()}\n`;
        }
        const arg2 = args.map((a: any) => {
            if (typeof a == 'object') {
                const js = JSON.stringify(a, null, 2);
                return js.replace(/"(\w+)":/g, '$1:');
            } else {
                return a?.toString();
            }
        }).join("\n");
        return `${arg}\n${arg2}\n`;
    }

    log(...args: any[]) {
        this.logging(args, "log");
        this.logging(args, "debug", false);
    }

    error(...args: any[]) {
        this.logging(args, "error");
        this.logging(args, "debug", false);
    }
    warn(...args: any[]) {
        this.logging(args, "warn");
        this.logging(args, "debug", false);
    }

    info(...args: any[]) {
        this.logging(args, "info");
        this.logging(args, "debug", false);
    }

    debug(...args: any[]) {
        this.logging(args, "debug");
    }

    notimeLog(...args: any[]) {
        this.logging(args, "debug", true, false);
    }

    private logging(args: any[], type: BunLoggerType, consoleLog: boolean = true, displayTime: boolean = true) {
        const message = this.generateMessage(type, args, displayTime);
        if (consoleLog) {
            console.log(message?.slice(0,message.length-1));
        }
        const logger = this.loggers.find(l => l.level == type);
        if (logger) {
            logger.stream.write(message);
        }
    }









}

const log = new BunLogger({
    transports: [{
        fileName: 'error.log',
        filePath: 'files/logs/error',
        level: "error"
    },
    {
        fileName: 'debug.log',
        filePath: 'files/logs/debug',
        level: "debug"
    }]
});

const logger = log;
const stream = log.stream;
export { logger, stream };


interface BunLoggerOption {
    transports: BunLoggerTransport[];
}

interface BunLoggerTransport {
    level: BunLoggerType;
    datePattern?: string;
    filePath: string
    fileName: string;
    maxFiles?: number;
    maxSize?: string;
    zippedArchive?: boolean;
    rotateInteval?: string;
    rotateSize?: string;
}
type BunLoggerType = 'info' | 'error' | 'debug' | 'warn' | 'log'