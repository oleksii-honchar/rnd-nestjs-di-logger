import { Module } from "@nestjs/common";

import { TestService } from "./test.service";
import { InjectPinoLogger } from "nestjs-pino";
import { BasePinoLogger } from "../logger/base-pino-logger";

@Module({
  providers: [
    TestService,
  ],
})
export class TestModule {
  constructor(@InjectPinoLogger(TestModule.name) private readonly logger: BasePinoLogger) {
    this.logger.info('TestModule initialized');
  }
}