import { ConfigModule } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { Module } from "@nestjs/common";

import { TestService } from "./test.service";

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
  providers: [
    TestService,
  ],
})
export class TestModule {
  private readonly logger = new Logger(TestModule.name);

  constructor() {
    this.logger.log('TestModule initialized');
  }
}