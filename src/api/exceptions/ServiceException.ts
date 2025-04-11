import { ErrorCode } from "../interfaces/api.enum";
import { logger } from "../utils/logger";

export class ServiceException extends Error {
  public status: number;
  public override message: string;
  public code:string;

  constructor(message: string,code?:string) {
    super(message);
    this.status = 500;
    this.message = message;
    this.code=code || ErrorCode.SERVER_ERROR;
    logger.error(`[${this.status}]${message}`);
  }

}
