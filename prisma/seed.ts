import { PrismaClient, JobListingPositionLoc } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const NUM_SKILL_CATEGORIES = 15;
const NUM_SKILLS = 15 * 5; // five skills in each category
const NUM_ED_INSTITUTIONS = 10;
const NUM_LEARNERS = 20;

interface SkillData {
  skill_id: string;
  skill_category_id: string;
  skill_name: string;
  skill_description: string;
}

function generateSkillData(skillCategoryId: string): SkillData {
  return {
    skill_id: faker.string.uuid(),
    skill_category_id: skillCategoryId,
    skill_name: faker.commerce.productName(),
    skill_description: faker.lorem.sentence(),
  };
}

async function createSkillData(skillCategories: SkillCategoryData[]): Promise<SkillData> {
  // TODO: fix mapping to skill category ids
  const skill = generateSkillData(skillCategories[0].skill_category_id);
  await prisma.skill.create({
    data: skill,
  });
  console.log(`Created skill with ID: ${skill.skill_id}`);
  return skill;
}
interface LearnerData {
  learnerId: string;
  user_id: string;
  is_enrolled_college: number;
  edu_institution_id?: string | null; // Optional
  degree_type: string;
  intern_hours_required: number;
  major: string | null;
  minor: string | null;
}

function generateLearnerData(userId: string, eduInstitutionId?: string | null): LearnerData {
  const isEnrolledInCollege = faker.number.int({ min: 0, max: 1 });
  return {
    learnerId: faker.string.uuid(),
    user_id: userId,
    is_enrolled_college: isEnrolledInCollege,
    edu_institution_id: isEnrolledInCollege === 0 ? null : eduInstitutionId,
    degree_type: faker.helpers.arrayElement([
      'Associate',
      'Bachelors',
      'Certification',
      'Online-Course',
    ]),
    intern_hours_required: faker.number.int({ min: 0, max: 1 }),
    major: faker.person.jobArea(),
    minor: faker.datatype.boolean() ? faker.person.jobArea() : 'none',
  };
}

async function createLearner(
  userId: string,
  eduInstitutionId?: string | null,
): Promise<LearnerData> {
  const learnerData = generateLearnerData(userId, eduInstitutionId);

  const learner = await prisma.learner.create({
    data: learnerData,
  });
  console.log(`Created Learner with ID: ${learner.learnerId}`);
  return learner;
}
async function seedLearners(
  users: UserData[],
  eduInstitutions: EdInstitutionData[],
): Promise<void> {
  for (let i = 0; i < NUM_LEARNERS; i++) {
    // TODO: fix: if NUM_LEARNERS > users.length will create duplicated users as learners.
    const userId = users[i % users.length].userId; // Cycle through users
    // TODO: fix logic here
    const eduInstitutionId =
      i % 2 === 0 ? eduInstitutions[i % eduInstitutions.length].edInstitutionId : undefined;
    await createLearner(userId, eduInstitutionId);
  }
}

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
  const skillCategoryData: SkillCategoryData = generateSkillCategoryData();
  const skillCategory: SkillCategoryData = await prisma.skill_category.create({
    data: skillCategoryData,
  });
  console.log(`Created skill_category with ID: ${skillCategory.skill_category_id}`);
  return skillCategory;
}

async function seedSkillCategories(): Promise<void> {
  for (let i = 0; i < NUM_SKILL_CATEGORIES; i++) {
    await createSkillCategory();
  }
}
interface JobListingHasSkillCategoryData {
  job_listing_has_skill_category_id: string;
  job_listing_id: string;
  skill_category_id: string;
}

function generateJobListingSkillCategoryData(
  jobListingId: string,
  skillCategoryId: string,
): JobListingHasSkillCategoryData {
  return {
    job_listing_has_skill_category_id: faker.string.uuid(),
    job_listing_id: jobListingId,
    skill_category_id: skillCategoryId,
  };
}

async function createJobListingHasSkillCategory(
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

async function seedEdInstitution(): Promise<void> {
  for (let i = 0; i < NUM_ED_INSTITUTIONS; i++) {
    await createEdInstitution();
  }
}

interface UserData {
  userId: string;
  userName: string;
  password: string;
  email: string;
}

function generateUserData(): UserData {
  return {
    userId: faker.string.uuid(),
    userName: faker.internet.userName(),
    password: faker.string.hexadecimal({ length: 64, casing: 'lower' }), // 32-byte hashed password
    email: faker.internet.email(),
  };
}
async function createUser(): Promise<UserData> {
  const userData = generateUserData();

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
    const edInstitution: EdInstitutionData = await createEdInstitution();
    const employer: EmployerData = await createEmployer(user.userId);
    /* const learner: LearnerData = */ await createLearner(
      user.userId,
      edInstitution.edInstitutionId,
    );
    const jobListing: JobListingData = await createJobListing(employer.employerId);

    const skillCategory = await createSkillCategory();
    await createJobListingHasSkillCategory(
      jobListing.job_listing_id,
      skillCategory.skill_category_id,
    );
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
