import { logger } from "../utils/logger";

export class HttpException extends Error {
  public status: number;
  public override message: string;
  public code:string;

  constructor(status: number, message: string,code:string) {
    super(message);
    this.status = status;
    this.message = message;
    this.code=code;
    logger.error(`[${this.status}]${message}`);
  }

}
