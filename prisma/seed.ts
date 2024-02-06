import { PrismaClient, JobListingPositionLoc } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

interface SkillCategoryData {
  skill_category_id: string;
  category_name: string;
  category_description: string;
}

function generateSkillCategoryData(): SkillCategoryData {
  return {
    skill_category_id: faker.string.uuid(),
    category_name: faker.commerce.department(), // Generates a department name as a category name
    category_description: faker.lorem.sentence(), // Generates a simple description
  };
}

async function createSkillCategory(): Promise<SkillCategoryData> {
  const skillCategoryData = generateSkillCategoryData();

  const skillCategory = await prisma.skill_category.create({
    data: skillCategoryData,
  });
  console.log(`Created skill_category with ID: ${skillCategory.skill_category_id}`);
  return skillCategory;
}

interface JobListingSkillCategoryData {
  job_listing_has_skill_category_id: string;
  job_listing_id: string;
  skill_category_id: string;
}

function generateJobListingSkillCategoryData(
  jobListingId: string,
  skillCategoryId: string,
): JobListingSkillCategoryData {
  return {
    job_listing_has_skill_category_id: faker.string.uuid(),
    job_listing_id: jobListingId,
    skill_category_id: skillCategoryId,
  };
}

async function createJobListingSkillCategory(
  jobListingId: string,
  skillCategoryId: string,
): Promise<void> {
  const jobListingSkillCategoryData = generateJobListingSkillCategoryData(
    jobListingId,
    skillCategoryId,
  );

  const jobListingSkillCategory = await prisma.jobListingSkillCategory.create({
    data: jobListingSkillCategoryData,
  });
  console.log(
    `Created JobListingSkillCategory with ID: ${jobListingSkillCategory.job_listing_has_skill_category_id}`,
  );
}

interface JobListingData {
  job_listing_id: string;
  employer_id: string;
  position_loc: JobListingPositionLoc;
  salary_range: string;
  region: string;
}

function generateJobListingData(employerId: string): JobListingData {
  return {
    job_listing_id: faker.string.uuid(),
    employer_id: employerId,
    position_loc: faker.helpers.arrayElement(Object.values(JobListingPositionLoc)), // Example usage of enum
    salary_range: `${faker.number.int({ min: 50000, max: 200000 })}`,
    region: faker.location.country(),
  };
}

async function createJobListing(employerId: string): Promise<JobListingData> {
  const jobListingData: JobListingData = generateJobListingData(employerId);
  const jobListing: JobListingData = await prisma.jobListing.create({
    data: jobListingData,
  });
  console.log(`Created JobListing with ID: ${jobListing.job_listing_id}`);
  return jobListingData;
}

interface EdInstitutionData {
  edInstitutionId: string;
  name: string | null;
  address: string;
  contactEmail: string;
  edUrl: string;
}

function generateEdInstitutionData(): EdInstitutionData {
  return {
    edInstitutionId: faker.string.uuid(),
    name: faker.company.name(),
    address: faker.location.streetAddress(true),
    contactEmail: faker.internet.email(),
    edUrl: faker.internet.url(),
  };
}
async function createEdInstitution(): Promise<EdInstitutionData> {
  // Generate a single EdInstitution entry
  const edInstitutionData = generateEdInstitutionData();

  // Create EdInstitution entry in the database
  const edInstitution = await prisma.edInstitution.create({
    data: edInstitutionData,
  });
  console.log(`Created EdInstitution with ID: ${edInstitution.edInstitutionId}`);
  return edInstitution;
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

interface EmployerData {
  employerId: string;
  user_id: string;
  title: string;
  home_office_location: string | null;
  employer_url: string | null;
  logo_url: string | null;
}

function generateEmployerData(userId: string): EmployerData {
  return {
    employerId: faker.string.uuid(),
    user_id: userId,
    title: faker.person.jobTitle(),
    home_office_location: faker.location.city(),
    employer_url: faker.internet.url(),
    logo_url: faker.image.urlPicsumPhotos({ width: 480, height: 480 }),
  };
}

async function createEmployer(userId: string): Promise<EmployerData> {
  const employerData: EmployerData = generateEmployerData(userId);

  const employer = await prisma.employer.create({
    data: employerData,
  });
  console.log(`Created Employer with ID: ${employer.employerId} for User ID: ${userId}`);
  return employer;
}

async function main(): Promise<void> {
  const entries = 3; // Number of entries you want to create
  for (let i = 0; i < entries; i++) {
    const user: { userId: string } = await createUser();
    const employer: EmployerData = await createEmployer(user.userId);
    const jobListing: JobListingData = await createJobListing(employer.employerId);
    /* const edInstitution: EdInstitutionData = */ await createEdInstitution();
    const skillCategory = await createSkillCategory();
    await createJobListingSkillCategory(jobListing.job_listing_id, skillCategory.skill_category_id);
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
