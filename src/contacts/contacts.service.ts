import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}
<<<<<<< HEAD
 async create(createContactDto: CreateContactDto){

  const contacts = await this.prisma.contact.findMany({
    where:{
     OR:[{phoneNumber: createContactDto.phoneNumber},{emailId:createContactDto.email},]
    },
    orderBy:{
      createdAt:'asc'
    }
  })
  const linkedIdSet = new Set(
        contacts
          .filter((contact) => contact.linPrecedence === 'secondary')
        .map((contact) => contact.linkedId),
      );
    
      const linkedIdArr =[...linkedIdSet]
      const primaryIdsArr = contacts.filter((contact) => contact.linPrecedence === 'primary')
      if(primaryIdsArr.length > 0){
        for(let ele of primaryIdsArr){
          if(!linkedIdSet.has(ele.id)){
            linkedIdArr.push(ele.id)
          }
        }
      }

  if(contacts.length === 0){
    const newContact =await this.prisma.contact.create({
      data:{
        emailId:createContactDto.email,
        phoneNumber:createContactDto.phoneNumber,
        linkedId: null,
        linPrecedence: 'primary',
        deletedAt: null,
      }
    })

      return {
        contact: {
          primaryContactId: newContact.id,
          emails: [createContactDto.email],
          phoneNumbers: [createContactDto.phoneNumber],
          secondaryContactIds: [],
        },
      };
  }
    const primaryContact = contacts.find(
      (contact) => contact.linPrecedence === 'primary',
    );
    let primaryId = primaryContact ? primaryContact.id : contacts[0].id;

    let contactByEm = await this.prisma.contact.findMany({
      where:{
        emailId:createContactDto.email,
        linPrecedence:'primary'
      }
    })

    let contactByPn = await this.prisma.contact.findMany({
      where:{
        phoneNumber:createContactDto.phoneNumber,
        linPrecedence:'primary'
      }
    })

    if(linkedIdArr.length !== 0){
      const flag =await this.prisma.contact.findMany({
        where:{
          linPrecedence:'primary',
         OR:[{phoneNumber: createContactDto.phoneNumber},{emailId:createContactDto.email},]
        },
        orderBy:{
          createdAt:'asc'
        }
      })

      if(flag.length >=2 ){
        const contactUpdate = await this.prisma.contact.findMany({
          where:{
            linPrecedence:'primary',
            OR:[
              {emailId:createContactDto.email},
              {phoneNumber: createContactDto.phoneNumber}
            ]
          },
          orderBy:{
            createdAt:'desc'
          }
        })
  
        await this.prisma.contact.update({
          where:{
            id:contactUpdate[0].id
          },
          data:{
            linkedId:contactUpdate[contactUpdate.length-1].id,
            linPrecedence:'secondary'
          }
        })
  
        await this.prisma.contact.updateMany({
          where:{
            linkedId:contactUpdate[0].id
          },
          data:{
            linkedId:contactUpdate[contactUpdate.length-1].id,
            linPrecedence:'secondary'
          }
  
        })
  
        const allRelatedContacts = await this.prisma.contact.findMany({
          where: {
           OR: [{ id: contactUpdate[contactUpdate.length-1].id }, { linkedId: contactUpdate[contactUpdate.length-1].id }],
          },
        });
  
        const emails = new Set(
          allRelatedContacts.map((contact) => contact.emailId),
        );
        const phoneNumbers = new Set(
          allRelatedContacts.map((contact) => contact.phoneNumber),
        );
        const secondaryContactIds = new Set(
          allRelatedContacts
            .filter((contact) => contact.linPrecedence === 'secondary')
          .map((contact) => contact.id),
        );
  
        return {
          contact: {
            primaryContactId: primaryId,
            emails: [...emails],
            phoneNumbers: [...phoneNumbers],
            secondaryContactIds: [...secondaryContactIds],
         },
        }
      }
      
      if(linkedIdArr.length >1  ){

        
        await this.prisma.contact.create({
          data:{
            emailId:createContactDto.email,
        phoneNumber:createContactDto.phoneNumber,
        linkedId: primaryContact.id,
        linPrecedence: 'secondary',
        deletedAt: null,
          }
        })

        for(let i=1;i<linkedIdArr.length;i++){
          await this.prisma.contact.update({
            where:{
              id:linkedIdArr[i]
            },
            data:{
              linPrecedence:'secondary',
              linkedId:linkedIdArr[0]
            }
          })
  
          await this.prisma.contact.updateMany({
            where:{
                linkedId:linkedIdArr[i]
              // ]
            },
            data:{
              linPrecedence: 'secondary',
              linkedId: linkedIdArr[0],
            }
          })
        }
        const allRelatedContacts = await this.prisma.contact.findMany({
          where: {
           OR: [{ id: linkedIdArr[0] }, { linkedId: linkedIdArr[0] }],
          },
        });
        const emails = new Set(
          allRelatedContacts.map((contact) => contact.emailId),
        );
        const phoneNumbers = new Set(
          allRelatedContacts.map((contact) => contact.phoneNumber),
        );
        const secondaryContactIds = new Set(
          allRelatedContacts
            .filter((contact) => contact.linPrecedence === 'secondary')
          .map((contact) => contact.id),
        );
        return {
          contact: {
            primaryContactId: linkedIdArr[0],
            emails: [...emails],
            phoneNumbers: [...phoneNumbers],
            secondaryContactIds: [...secondaryContactIds],
         },
        }
      }
    }

    await this.prisma.contact.create({
      data:{
        emailId:createContactDto.email,
        phoneNumber:createContactDto.phoneNumber,
        linkedId: linkedIdArr[0],
        linPrecedence: 'secondary',
        deletedAt: null,
      }
    })

    await this.prisma.contact.updateMany({
      where:{
        OR:[
          {linkedId:linkedIdArr[0]}
        ]
      },
      data:{
        linkedId: linkedIdArr[0],
        linPrecedence: 'secondary',
      }
    })

    const allRelatedContacts = await this.prisma.contact.findMany({
      where: {
       OR: [{ id: linkedIdArr[0] }, { linkedId: linkedIdArr[0] }],
      },
    });

    const emails = new Set(
      allRelatedContacts.map((contact) => contact.emailId),
    );
    const phoneNumbers = new Set(
      allRelatedContacts.map((contact) => contact.phoneNumber),
    );
    const secondaryContactIds = new Set(
      allRelatedContacts
        .filter((contact) => contact.linPrecedence === 'secondary')
      .map((contact) => contact.id),
    );

    return {
      contact: {
        primaryContactId: linkedIdArr[0],
        emails: [...emails],
        phoneNumbers: [...phoneNumbers],
        secondaryContactIds: [...secondaryContactIds],
     },
    }
 }
=======
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
      const result = await this.prisma.contact.create({
        data: {
          Id: count,
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
      let emails = [];
      let phoneNumbers = [];
      let secondaryContactIds = [];

      for (let ele of allContacts) {
        emails.push(ele.emailId);
        phoneNumbers.push(ele.phoneNumber);

        if (ele.linPrecedence !== 'primary') {
          secondaryContactIds.push(ele.linkedId);
        }
      }

      return {
        contact: {
          primaryContactId: resultByPn[0].id,
          emails: emails,
          phoneNumbers: phoneNumbers,
          secondaryContactIds: secondaryContactIds,
        },
      };
    } else {
      if (
        resultByPn.length === 1 &&
        resultByEm.length === 1 &&
        resultByPn[0].linPrecedence === 'primary' &&
        resultByEm[0].linPrecedence === 'primary'
      ) {
        if (
          resultByPn[0].linPrecedence === 'primary' &&
          resultByEm[0].linPrecedence === 'primary'
        ) {
          await this.prisma.contact.update({
            where: {
              id: resultByPn[0].id,
            },
            data: {
              linkedId: resultByEm[0].Id,
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
              secondaryContactIds.push(ele.linkedId);
            }
          }

          return {
            contact: {
              primaryContactId: resultByPn[0].id,
              emails: emails,
              phoneNumbers: phoneNumbers,
              secondaryContactIds: secondaryContactIds,
            },
          };
        }
      }
      const result = await this.prisma.contact.create({
        data: {
          Id: count,
          emailId: createContactDto.email,
          phoneNumber: createContactDto.phoneNumber,
          linkedId: primaryResult[0].Id,
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
      let emails = [];
      let phoneNumbers = [];
      let secondaryContactIds = [];

      for (let ele of allContacts) {
        emails.push(ele.emailId);
        phoneNumbers.push(ele.phoneNumber);

        if (ele.linPrecedence !== 'primary') {
          secondaryContactIds.push(ele.linkedId);
        }
      }

      return {
        contact: {
          primaryContactId: resultByPn[0].id,
          emails: emails,
          phoneNumbers: phoneNumbers,
          secondaryContactIds: secondaryContactIds,
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
>>>>>>> 8cb2c44 (feat: contacts)
}
