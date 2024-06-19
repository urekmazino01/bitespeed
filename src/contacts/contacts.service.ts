import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createContactDto: CreateContactDto) {
    const count = (await this.prisma.contact.findMany()).length;
    const primaryResult = await this.prisma.contact.findMany({
      where: {
        linPrecedence: 'primary',
        OR: [
          { emailId: createContactDto.email },
          { phoneNumber: createContactDto.phoneNumber },
        ],
      },
    });
    const secondaryResult = await this.prisma.contact.findMany({
      where: {
        OR: [
          { emailId: createContactDto.email },
          { phoneNumber: createContactDto.phoneNumber },
        ],
      },
      orderBy:{
        createdAt:'asc'
      }
    })

    const resultByPn = await this.prisma.contact.findMany({
      where: {
        phoneNumber: createContactDto.phoneNumber,
      },
    });

    const resultByEm = await this.prisma.contact.findMany({
      where: {
        emailId: createContactDto.email,
      },
    });

    if (resultByPn.length === 0 && resultByEm.length === 0) {
      console.log('gere inside we are');
      const result = await this.prisma.contact.create({
        data: {
          emailId: createContactDto.email,
          phoneNumber: createContactDto.phoneNumber,
          linkedId: null,
          linPrecedence: 'primary',
          deletedAt: null,
        },
      });

      const allContacts = await this.prisma.contact.findMany({
        where: {
          OR: [
            { emailId: createContactDto.email },
            { phoneNumber: createContactDto.phoneNumber },
          ],
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      let emails = new Set();
      let phoneNumbers = new Set();
      let secondaryContactIds = new Set();
      let primaryId;

      for (let ele of allContacts) {
        emails.add(ele.emailId);
        phoneNumbers.add(ele.phoneNumber);

        if (ele.linPrecedence !== 'primary') {
          secondaryContactIds.add(ele.id);
        } else {
          primaryId = ele.id;
        }
      }

      return {
        contact: {
          primaryContactId: primaryId,
          emails: [...emails],
          phoneNumbers: [...phoneNumbers],
          secondaryContactIds: [...secondaryContactIds],
        },
      };
    } else {
      if (
        resultByPn.length === 1 &&
        resultByEm.length === 1 &&
        resultByPn[0].linPrecedence === 'primary' &&
        resultByEm[0].linPrecedence === 'primary'
      ) {
          await this.prisma.contact.update({
            where: {
              id: resultByPn[0].id,
            },
            data: {
              linkedId: resultByEm[0]?.id,
              linPrecedence: 'secondary',
            },
          });

          const allContacts = await this.prisma.contact.findMany({
            where: {
              OR: [
                { emailId: createContactDto.email },
                { phoneNumber: createContactDto.phoneNumber },
              ],
            },
          });
          let emails = [];
          let phoneNumbers = [];
          let secondaryContactIds = [];

          for (let ele of allContacts) {
            emails.push(ele.emailId);
            phoneNumbers.push(ele.phoneNumber);

            if (ele.linPrecedence !== 'primary') {
              secondaryContactIds.push(ele.id);
            }
          }

          return {
            contact: {
              primaryContactId: resultByEm[0].id,
              emails: emails,
              phoneNumbers: phoneNumbers,
              secondaryContactIds: secondaryContactIds,
            },
          };
      }
      console.log('inisde herere');
      const result = await this.prisma.contact.create({
        data: {
          emailId: createContactDto.email,
          phoneNumber: createContactDto.phoneNumber,
          linkedId: primaryResult[0]?.id ? primaryResult[0].id :secondaryResult[0].linkedId ,
          linPrecedence: 'secondary',
          deletedAt: null,
        },
      });

      const allContacts = await this.prisma.contact.findMany({
        where: {
          OR: [
            { emailId: createContactDto.email },
            { phoneNumber: createContactDto.phoneNumber },
          ],
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      let emails = new Set();
      let phoneNumbers = new Set();
      let secondaryContactIds = new Set();
      let primaryId;

      for (let ele of allContacts) {
        emails.add(ele.emailId);
        phoneNumbers.add(ele.phoneNumber);

        if (ele.linPrecedence !== 'primary') {
          secondaryContactIds.add(ele.id);
        }else{
          primaryId=ele.id
        }
      }

      return {
        contact: {
          primaryContactId: primaryId ? primaryId : secondaryResult[0].linkedId,
          emails: [...emails],
          phoneNumbers: [...phoneNumbers],
          secondaryContactIds: [...secondaryContactIds],
        },
      };
    }
  }

  findAll() {
    return `This action returns all contacts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contact`;
  }

  update(id: number, updateContactDto: UpdateContactDto) {
    return `This action updates a #${id} contact`;
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }
}
