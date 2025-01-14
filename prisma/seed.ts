import { PrismaClient } from '@prisma/client';
import * as cpf from 'gerador-validador-cpf';
import { fakerPT_BR as faker } from '@faker-js/faker';

faker.seed(0);

const prisma = new PrismaClient();

const batchHex = () => faker.string.hexadecimal({ length: 7, prefix: '' }).toUpperCase();

async function seed() {
  await prisma.vaccine.create({
    data: {
      name: 'Pfizer',
    },
  });

  await prisma.vaccine.create({
    data: {
      name: 'Coronavac',
    },
  });

  await prisma.vaccine.create({
    data: {
      name: 'Astazeneca',
    },
  });

  const vaccines = await prisma.vaccine.findMany();

  const howManyEmployees = faker.number.int({ min: 3, max: 10 });

  for (let i = 0; i < howManyEmployees; i++) {
    const howManyDoses = faker.number.int({ min: 0, max: 3 });

    const doses: { dateAdministered: Date; vaccineId: number, batch: string, expirationDate: Date }[] = [];
    for (let j = 0; j < howManyDoses; j++) {
      doses.push({
        dateAdministered: faker.date.past(),
        vaccineId: faker.helpers.arrayElement(vaccines).id,
        batch: batchHex(),
        expirationDate: faker.date.future(),
      });
    }

    await prisma.employee.create({
      data: {
        document: cpf.generate(),
        fullName: faker.person.fullName(),
        birthDate: faker.date.birthdate(),
        hasComorbidity: faker.datatype.boolean(0.2),
        doses: {
          createMany: {
            data: doses
          }
        }
      },
    });

  }
}

seed().catch(error => {
  console.error(error);
  prisma.$disconnect();
})
