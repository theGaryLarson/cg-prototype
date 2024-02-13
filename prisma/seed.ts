import { PrismaClient, JobListingPositionLoc } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const NUM_USERS = 15;
const NUM_LEARNERS = NUM_USERS % 3;
const NUM_EMPLOYERS = NUM_USERS % 3;
const NUM_MENTORS = NUM_USERS % 3;
const NUM_SKILL_CATEGORIES = 10;
const NUM_SKILLS = NUM_SKILL_CATEGORIES * 5; // five skills in each category
const NUM_JOB_SKILL_RELATIONSHIPS = 50;
const NUM_ED_INSTITUTIONS = 10;

/// ///////////////////////////////////////////////////////////

interface TrainingProviderData {
  training_provider_id: string;
  user_id: string;
  edu_institution_id: string;
}

function generateTrainingProviderData(
  userId: string,
  edInstitutionId: string,
): TrainingProviderData {
  return {
    training_provider_id: faker.string.uuid(),
    user_id: userId,
    edu_institution_id: edInstitutionId,
  };
}

async function createTrainingProvider(
  userId: string,
  edInstitutionId: string,
): Promise<TrainingProviderData> {
  const trainingProviderData = generateTrainingProviderData(userId, edInstitutionId);
  const trainingProvider = await prisma.trainingProvider.create({
    data: trainingProviderData,
  });
  console.log(`Created TrainingProvider with ID: ${trainingProvider.training_provider_id}`);
  return trainingProvider;
}

async function fetchUsersAndEdInstitutions(): Promise<{
  users: UserData[];
  eduInstitutions: EdInstitutionData[];
}> {
  const users = await prisma.user.findMany({
    take: 10,
  });
  const eduInstitutions = await prisma.edInstitution.findMany({
    take: 10,
  });
  return { users, eduInstitutions };
}

async function seedTrainingProviders(): Promise<void> {
  const { users, eduInstitutions } = await fetchUsersAndEdInstitutions();

  // TODO: make meaningful. Assuming you want to create a training provider for each user
  for (const user of users) {
    // TODO: make meaningful. Randomly assign an educational institution or null
    const eduInstitutionId: string =
      eduInstitutions[Math.floor(Math.random() * eduInstitutions.length)].edInstitutionId;

    await createTrainingProvider(user.userId, eduInstitutionId);
  }
}

/// ///////////////////////////////////////////////////////////

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

async function createSkill(skillCategoryId: string): Promise<SkillData> {
  const skill: SkillData = generateSkillData(skillCategoryId);
  await prisma.skill.create({
    data: skill,
  });
  console.log(`Created skill with ID: ${skill.skill_id}`);
  return skill;
}

async function seedSkillData(skillCategories: SkillCategoryData[]): Promise<void> {
  for (let i = 0; i < NUM_SKILLS; i++) {
    await createSkill(skillCategories[i % skillCategories.length].skill_category_id);
  }
}

/// ///////////////////////////////////////////////////////////

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

/// ///////////////////////////////////////////////////////////

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

/// ///////////////////////////////////////////////////////////

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

async function seedJobListingHasSkillCategory(
  jobListings: JobListingData[],
  skillCategories: SkillCategoryData[],
): Promise<void> {
  for (let i = 0; i < NUM_JOB_SKILL_RELATIONSHIPS; i++) {
    await createJobListingHasSkillCategory(
      // TODO: fine tune mapping of these to be more meaningful
      jobListings[i % jobListings.length].job_listing_id,
      skillCategories[i % skillCategories.length].skill_category_id,
    );
  }
}

/// ///////////////////////////////////////////////////////////

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

async function seedJobListings() {}

/// ///////////////////////////////////////////////////////////

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

async function seedEdInstitutions(): Promise<void> {
  for (let i = 0; i < NUM_ED_INSTITUTIONS; i++) {
    await createEdInstitution();
  }
}

/// ///////////////////////////////////////////////////////////

interface MentorHasSkillData {
  mentor_has_skill_id: string;
  skill_category_id: string;
  mentor_id: string;
}

function generateMentorHasSkillData(mentorId: string, skillCategoryId: string): MentorHasSkillData {
  return {
    mentor_has_skill_id: faker.string.uuid(),
    skill_category_id: skillCategoryId,
    mentor_id: mentorId,
  };
}

async function createMentorSkillRelation(
  mentorId: string,
  skillCategoryId: string,
): Promise<MentorHasSkillData> {
  const mentorSkillData: MentorHasSkillData = generateMentorHasSkillData(mentorId, skillCategoryId);
  // Note the change here from mentor_has_skill to mentorHasSkill
  await prisma.mentor_has_skill.create({
    data: {
      mentor_has_skill_id: mentorSkillData.mentor_has_skill_id,
      mentor: {
        connect: { mentor_id: mentorId },
      },
      skill_category: {
        connect: { skill_category_id: skillCategoryId },
      },
    },
  });
  console.log(`MentorHasSkill created with ID: ${mentorSkillData.mentor_has_skill_id}`);
  return mentorSkillData;
}

async function seedMentorSKills() {
  const mentors = await prisma.mentor.findMany();
  const skillCategories = await prisma.skill_category.findMany();

  for (const mentor of mentors) {
    // assign random category as mentor expertise
    const randomSkillCategory =
      skillCategories[Math.floor(Math.random() * skillCategories.length)].skill_category_id;
    await createMentorSkillRelation(mentor.mentor_id, randomSkillCategory);
  }
}

/// ///////////////////////////////////////////////////////////

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

async function seedEmployers(users: UserData[]): Promise<void> {
  for (let i = 0; i < NUM_EMPLOYERS; i++) {
    await createEmployer(users[i % users.length].userId);
  }
}

/// ///////////////////////////////////////////////////////////

interface MentorData {
  mentor_id: string;
  user_id: string;
}

function generateMentorData(userId: string): MentorData {
  return {
    mentor_id: faker.string.uuid(),
    user_id: userId,
  };
}

async function createMentor(userId: string): Promise<MentorData> {
  const mentorData = generateMentorData(userId);
  await prisma.mentor.create({
    data: mentorData,
  });
  console.log(`Mentor created for User ID: ${userId}`);
  return mentorData;
}

async function seedMentors(): Promise<void> {
  const users = await prisma.user.findMany({ take: NUM_MENTORS }); // Adjust 'take' as needed
  for (const user of users) {
    await createMentor(user.userId);
  }
}

/// ///////////////////////////////////////////////////////////

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

async function seedUser(): Promise<void> {
  for (let i = 0; i < NUM_USERS; i++) {
    await createUser();
  }
}

async function main(): Promise<void> {
  const entries = 3; // Number of entries you want to create
  for (let i = 0; i < entries; i++) {
    const user: { userId: string } = await createUser();
    const edInstitution: EdInstitutionData = await createEdInstitution();
    const employer: EmployerData = await createEmployer(user.userId);
    /* const learner: LearnerData = */
    await createLearner(user.userId, edInstitution.edInstitutionId);
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
