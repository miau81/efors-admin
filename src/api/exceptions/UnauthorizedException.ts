import { ErrorCode } from "../interfaces/api.enum";
import { logger } from "../utils/logger";

export class UnauthorizedException extends Error {
  public status: number;
  public override message: string;
  public code:string;

  constructor(message: string,code?:string) {
    super(message);
    this.status = 401;
    this.message = message;
    this.code=code || ErrorCode.UNAUTHORIZE;
    logger.error(`[${this.status}]${message}`);
  }

}
