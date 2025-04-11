import { ErrorCode } from "../interfaces/api.enum";
import { logger } from "../utils/logger";

export class NotFoundException extends Error {
  public status: number;
  public override message: string;
  public code:string;

  constructor(message: string,code?:string) {
    super(message);
    this.status = 404;
    this.message = message;
    this.code=code||ErrorCode.NOT_FOUND;
    logger.error(`[${this.status}]${message}`);
  }

}
