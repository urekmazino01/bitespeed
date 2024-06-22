import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}
 async create(createContactDto: CreateContactDto){

  const contacts = await this.prisma.contact.findMany({
    where:{
     OR:[{phoneNumber: createContactDto.phoneNumber},{emailId:createContactDto.email},]
    },
    orderBy:{
      createdAt:'asc'
    }
  })

  

  console.log('contacts',contacts )
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
      console.log('linkedIdArr',linkedIdArr)

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
    console.log('contactByEm',contactByEm)

    let contactByPn = await this.prisma.contact.findMany({
      where:{
        phoneNumber:createContactDto.phoneNumber,
        linPrecedence:'primary'
      }
    })
    console.log('contactByPn',contactByPn)

    if(primaryContact){
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
        console.log('i am inside')
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
  
        console.log('allRelatedContacts', allRelatedContacts)
  
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
      if((primaryContact.emailId === createContactDto.email || primaryContact.phoneNumber === createContactDto.phoneNumber)  ){

        
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
      

           // Gather all unique emails and phone numbers linked to the primary contact
        const allRelatedContacts = await this.prisma.contact.findMany({
          where: {
           OR: [{ id: linkedIdArr[0] }, { linkedId: linkedIdArr[0] }],
          },
        });

        // linkedIdArr[0]
        console.log('allRelatedContacts',allRelatedContacts)


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
        linkedId: contacts[0].linkedId,
        linPrecedence: 'secondary',
        deletedAt: null,
      }
    })

    await this.prisma.contact.updateMany({
      where:{
        OR:[
          // {id:contacts[0].linkedId},
          {emailId:createContactDto.email},
          {phoneNumber:createContactDto.phoneNumber},
          {linkedId:contacts[0].linkedId}
        ]
      },
      data:{
        linkedId: contacts[0].linkedId,
        linPrecedence: 'secondary',
      }
    })

    const allRelatedContacts = await this.prisma.contact.findMany({
      where: {
       OR: [{ id: contacts[0].linkedId }, { linkedId: contacts[0].linkedId }],
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

//  if((primaryContact.emailId === createContactDto.email || primaryContact.phoneNumber === createContactDto.phoneNumber) && ((contactByEm.length=== 0 && contactByPn.length >0) || (contactByEm.length> 0 && contactByPn.length ===0) ) )

  // async create(createContactDto: CreateContactDto) {
  //   const { email, phoneNumber } = createContactDto;

  //   // Fetch all contacts with either the given email or phone number
  //   const contacts = await this.prisma.contact.findMany({
  //     where: {
  //       OR: [{ emailId: email }, { phoneNumber: phoneNumber }],
  //     },
  //     orderBy: {
  //       createdAt: 'asc',
  //     },
  //   });

  //   // If no contacts are found, create a new primary contact
  //   if (contacts.length === 0) {
  //     const newContact = await this.prisma.contact.create({
  //       data: {
  //         emailId: email,
  //         phoneNumber: phoneNumber,
  //         linkedId: null,
  //         linPrecedence: 'primary',
  //         deletedAt: null,
  //       },
  //     });

  //     return {
  //       contact: {
  //         primaryContactId: newContact.id,
  //         emails: [email],
  //         phoneNumbers: [phoneNumber],
  //         secondaryContactIds: [],
  //       },
  //     };
  //   }

  //   // Check if there is a primary contact in the existing contacts
  //   const primaryContact = contacts.find(
  //     (contact) => contact.linPrecedence === 'primary',
  //   );
  //   let primaryId = primaryContact ? primaryContact.id : contacts[0].id;

  //   // If no primary contact, set the first contact as primary
  //   if (!primaryContact) {
  //     await this.prisma.contact.update({
  //       where: { id: primaryId },
  //       data: { linPrecedence: 'primary' },
  //     });
  //   }

  //   // Update linkedId and linPrecedence for new secondary contact if necessary
  //   const existingContact = contacts.find(
  //     (contact) =>
  //       contact.emailId === email || contact.phoneNumber === phoneNumber,
  //   );
  //   if (!existingContact) {
  //     await this.prisma.contact.create({
  //       data: {
  //         emailId: email,
  //         phoneNumber: phoneNumber,
  //         linkedId: primaryId,
  //         linPrecedence: 'secondary',
  //         deletedAt: null,
  //       },
  //     });
  //   } else if (
  //     existingContact.linPrecedence === 'primary' &&
  //     existingContact.phoneNumber === phoneNumber
  //   ) {
  //     await this.prisma.contact.update({
  //       where: { id: existingContact.id },
  //       data: { linkedId: primaryId, linPrecedence: 'secondary' },
  //     });
  //   }

  //   // Gather all unique emails and phone numbers linked to the primary contact
  //   const allRelatedContacts = await this.prisma.contact.findMany({
  //     where: {
  //       OR: [{ id: primaryId }, { linkedId: primaryId }],
  //     },
  //   });

  //   const emails = new Set(
  //     allRelatedContacts.map((contact) => contact.emailId),
  //   );
  //   const phoneNumbers = new Set(
  //     allRelatedContacts.map((contact) => contact.phoneNumber),
  //   );
  //   const secondaryContactIds = new Set(
  //     allRelatedContacts
  //       .filter((contact) => contact.linPrecedence === 'secondary')
  //       .map((contact) => contact.id),
  //   );

  //   return {
  //     contact: {
  //       primaryContactId: primaryId,
  //       emails: [...emails],
  //       phoneNumbers: [...phoneNumbers],
  //       secondaryContactIds: [...secondaryContactIds],
  //     },
  //   };
  // }




  // 

  // async create(createContactDto: CreateContactDto) {
  //   const count = (await this.prisma.contact.findMany()).length;
  //   const primaryResult = await this.prisma.contact.findMany({
  //     where: {
  //       linPrecedence: 'primary',
  //       OR: [
  //         { emailId: createContactDto.email },
  //         { phoneNumber: createContactDto.phoneNumber },
  //       ],
  //     },
  //   });
  //   const secondaryResult = await this.prisma.contact.findMany({
  //     where: {
  //       OR: [
  //         { emailId: createContactDto.email },
  //         { phoneNumber: createContactDto.phoneNumber },
  //       ],
  //     },
  //     orderBy: {
  //       createdAt: 'asc',
  //     },
  //   });

  //   const resultByPn = await this.prisma.contact.findMany({
  //     where: {
  //       phoneNumber: createContactDto.phoneNumber,
  //     },
  //     orderBy: {
  //       createdAt: 'asc',
  //     },
  //   });

  //   const resultByEm = await this.prisma.contact.findMany({
  //     where: {
  //       emailId: createContactDto.email,
  //     },
  //     orderBy: {
  //       createdAt: 'asc',
  //     },
  //   });

  //   if (resultByPn.length === 0 && resultByEm.length === 0) {
  //     const result = await this.prisma.contact.create({
  //       data: {
  //         emailId: createContactDto.email,
  //         phoneNumber: createContactDto.phoneNumber,
  //         linkedId: null,
  //         linPrecedence: 'primary',
  //         deletedAt: null,
  //       },
  //     });

  //     const allContacts = await this.prisma.contact.findMany({
  //       where: {
  //         OR: [
  //           { emailId: createContactDto.email },
  //           { phoneNumber: createContactDto.phoneNumber },
  //         ],
  //       },
  //       orderBy: {
  //         createdAt: 'asc',
  //       },
  //     });
  //     let emails = new Set();
  //     let phoneNumbers = new Set();
  //     let secondaryContactIds = new Set();
  //     let primaryId;

  //     for (let ele of allContacts) {
  //       emails.add(ele.emailId);
  //       phoneNumbers.add(ele.phoneNumber);

  //       if (ele.linPrecedence !== 'primary') {
  //         secondaryContactIds.add(ele.id);
  //       } else {
  //         primaryId = ele.id;
  //       }
  //     }

  //     return {
  //       contact: {
  //         primaryContactId: primaryId,
  //         emails: [...emails],
  //         phoneNumbers: [...phoneNumbers],
  //         secondaryContactIds: [...secondaryContactIds],
  //       },
  //     };
  //   } else {
  //     if (
  //       resultByPn.length >= 1 &&
  //       resultByEm.length >= 1 &&
  //       (resultByPn[0]?.linPrecedence === 'primary' ||
  //         resultByEm[0]?.linPrecedence === 'primary')
  //     ) {
  //       const updateContacts = await this.prisma.contact.findMany({
  //         where: {
  //           OR: [
  //             { emailId: createContactDto.email },
  //             { phoneNumber: createContactDto.phoneNumber },
  //           ],
  //         },
  //         orderBy: {
  //           createdAt: 'asc',
  //         },
  //       });
  //       const primaryContact = await this.prisma.contact.findMany({
  //         where: {
  //           linPrecedence: 'secondary',
  //           OR: [
  //             { emailId: createContactDto.email },
  //             { phoneNumber: createContactDto.phoneNumber },
  //           ],
  //         },
  //       });
  //       console.log('here iside i am  ');
  //       if( updateContacts[0]?.linPrecedence === 'primary'){
  //         await this.prisma.contact.update({
  //           where: {
  //             id: updateContacts[0]?.linPrecedence === 'primary'?updateContacts[updateContacts.length-1].id:updateContacts[0].id,
  //           },
  //           data: {
  //             linkedId: primaryContact[0]?.linkedId
  //               ? primaryContact[0]?.linkedId
  //               : resultByEm[0].id,
  //             linPrecedence: updateContacts[0]?.linPrecedence === 'primary'?'primary':'secondary',
  //           },
  //         });
  //       }else{
  //         await this.prisma.contact.update({
  //           where: {
  //             id: updateContacts[updateContacts.length-1].id,
  //           },
  //           data: {
  //             linkedId: primaryContact[0]?.linkedId
  //               ? primaryContact[0]?.linkedId
  //               : resultByEm[0].id,
  //             linPrecedence: 'secondary',
  //           },
  //         });
  //       }
        

  //       const allContacts = await this.prisma.contact.findMany({
  //         where: {
  //           linkedId: primaryContact[0]?.linkedId,
  //         },
  //       });
  //       let emails = new Set();
  //       let phoneNumbers = new Set();
  //       let secondaryContactIds = new Set();
  //       let primaryId;

  //       for (let ele of allContacts) {
  //         emails.add(ele.emailId);
  //         phoneNumbers.add(ele.phoneNumber);

  //         if (ele.linPrecedence !== 'primary') {
  //           secondaryContactIds.add(ele.id);
  //         } else {
  //           primaryId = ele?.id;
  //         }
  //       }

  //       const parentResult = await this.prisma.contact.findMany({
  //         where: {
  //           id: primaryId
  //             ? primaryId
  //             : secondaryResult[0]?.linkedId
  //               ? secondaryResult[0]?.linkedId
  //               : secondaryResult[0]?.id,
  //         },
  //       });

  //       for (let ele of parentResult) {
  //         emails.add(ele.emailId);
  //         phoneNumbers.add(ele.phoneNumber);
  //       }

  //       return {
  //         contact: {
  //           primaryContactId: resultByEm[0]?.id,
  //           emails: [...emails],
  //           phoneNumbers: [...phoneNumbers],
  //           secondaryContactIds: [...secondaryContactIds],
  //         },
  //       };
  //     }
  //     const result = await this.prisma.contact.create({
  //       data: {
  //         emailId: createContactDto?.email,
  //         phoneNumber: createContactDto?.phoneNumber,
  //         linkedId: primaryResult[0]?.id
  //           ? primaryResult[0]?.id
  //           : secondaryResult[0]?.linkedId,
  //         linPrecedence: 'secondary',
  //         deletedAt: null,
  //       },
  //     });

  //     const allContacts = await this.prisma.contact.findMany({
  //       where: {
  //         linkedId: secondaryResult[0]?.linkedId
  //           ? secondaryResult[0]?.linkedId
  //           : secondaryResult[0].id,
  //       },
  //     });

  //     let emails = new Set();
  //     let phoneNumbers = new Set();
  //     let secondaryContactIds = new Set();
  //     let primaryId;

  //     for (let ele of allContacts) {
  //       emails.add(ele.emailId);
  //       phoneNumbers.add(ele.phoneNumber);

  //       if (ele.linPrecedence !== 'primary') {
  //         secondaryContactIds.add(ele?.id);
  //       } else {
  //         primaryId = ele?.id;
  //       }
  //     }

  //     const parentResult = await this.prisma.contact.findMany({
  //       where: {
  //         id: primaryId
  //           ? primaryId
  //           : secondaryResult[0]?.linkedId
  //             ? secondaryResult[0]?.linkedId
  //             : secondaryResult[0]?.id,
  //       },
  //     });

  //     for (let ele of parentResult) {
  //       emails.add(ele.emailId);
  //       phoneNumbers.add(ele.phoneNumber);
  //     }

  //     return {
  //       contact: {
  //         primaryContactId: parentResult[0].id,
  //         emails: [...emails],
  //         phoneNumbers: [...phoneNumbers],
  //         secondaryContactIds: [...secondaryContactIds],
  //       },
  //     };
  //   }
  // }
}
