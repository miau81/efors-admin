

import { ErrorCode } from "../interfaces/api.enum";
import { logger } from "../utils/logger";

export class BadRequestException extends Error {
  public status: number;
  public override message: string;
  public code:string;

  constructor(message: string,code?:string) {
    super(message);
    this.status = 400;
    this.message = message;
    this.code=code || ErrorCode.BAD_REQUEST;
    logger.error(`[${this.status}]${message}`);
  }

}
