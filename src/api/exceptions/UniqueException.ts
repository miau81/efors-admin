import { ErrorCode } from "../interfaces/api.enum";
import { logger } from "../utils/logger";

export class UniqueException extends Error {
  public status: number;
  public override message: string;
  public code:string;

  constructor(message: string) {
    super(message);
    this.status = 403;
    this.message = message;
    this.code=ErrorCode.IS_EXISTS;
    logger.error(`[${this.status}]${message}`);
  }

}
