import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function createEdInstitution(): Promise<void> {
  // Generate a single EdInstitution entry
  const edInstitutionData = {
    edInstitutionId: faker.string.uuid(),
    name: faker.company.name(),
    address: faker.location.streetAddress(true),
    contactEmail: faker.internet.email(),
    edUrl: faker.internet.url(),
  };

  // Create EdInstitution entry in the database
  const edInstitution = await prisma.edInstitution.create({
    data: edInstitutionData,
  });
  console.log(`Created EdInstitution with ID: ${edInstitution.edInstitutionId}`);
}

async function createUser(): Promise<any> {
  const userData = {
    userId: faker.string.uuid(),
    userName: faker.internet.userName(),
    password: faker.string.hexadecimal({ length: 64, casing: 'lower' }), // 32-byte hashed password
    email: faker.internet.email(),
  };

  const user = await prisma.user.create({
    data: userData,
  });
  console.log(`Created User with ID: ${user.userId} with mock hashed password`);
  return user; // Return the created user for possible relational data seeding
}

function generateEmployerData(userId: string) {
  return {
    employerId: faker.string.uuid(),
    user_id: userId,
    title: faker.person.jobTitle(),
    home_office_location: faker.location.city(),
    employer_url: faker.internet.url(),
    logo_url: faker.image.urlPicsumPhotos({ width: 480, height: 480 }),
  };
}

async function createEmployer(userId: string) {
  const employerData = generateEmployerData(userId);

  const employer = await prisma.employer.create({
    data: employerData,
  });
  console.log(`Created Employer with ID: ${employer.employerId} for User ID: ${userId}`);
}

async function main(): Promise<void> {
  const entries = 3; // Number of entries you want to create
  for (let i = 0; i < entries; i++) {
    const user: { userId: string } = await createUser();
    await createEmployer(user.userId);
    await createEdInstitution();
  }
  console.log(`Seeded ${entries} entries for each table.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
