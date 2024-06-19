import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ContactsModule } from './contacts/contacts.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [DatabaseModule, ContactsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
