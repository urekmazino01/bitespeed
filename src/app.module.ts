import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { ContactsModule } from './contacts/contacts.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [DatabaseModule, ProductsModule, ContactsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
