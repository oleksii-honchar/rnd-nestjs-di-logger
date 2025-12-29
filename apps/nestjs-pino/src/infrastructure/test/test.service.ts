import { Injectable } from "@nestjs/common";
import { InjectPinoLogger } from "nestjs-pino";
import { BasePinoLogger } from "../logger/base-pino-logger";

@Injectable()
export class TestService {
  constructor(@InjectPinoLogger(TestService.name) private readonly logger: BasePinoLogger) {
    this.logger.info('TestService initialized');
  }
}