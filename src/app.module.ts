import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
<<<<<<< HEAD
=======
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
>>>>>>> 8cb2c44 (feat: contacts)
import { ContactsModule } from './contacts/contacts.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
<<<<<<< HEAD
  imports: [ContactsModule, PrismaModule],
=======
  imports: [DatabaseModule, ProductsModule, ContactsModule, PrismaModule],
>>>>>>> 8cb2c44 (feat: contacts)
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
