import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // Connect to the database
    await this.$connect()
      .then(() => this.logger.log('Database connection established.'))
      .catch((error: any) => {
        this.logger.log(error);
        console.log('error =================================');
      });
  }
}
