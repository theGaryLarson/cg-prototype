import {
  EdInstitution,
  Employer,
  JobListing,
  JobListingPositionLoc,
  JobListingSkillCategory,
  Learner,
  learner_private_data,
  learner_skill_gap_data,
  LearnerProjBasedTechAssessment,
  mentor,
  mentor_has_skill,
  PrismaClient,
  proj_based_tech_assessment,
  sa_question,
  self_assessment,
  SelfAssessmentQuestionType,
  Skill,
  skill_category,
  training_program,
  trainingProvider,
  User,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();
const SEED = 123;
const NUM_USERS = 30; // for simplicity ensure is divisible by 3.
const NUM_LEARNERS = Math.floor(NUM_USERS / 3);
const NUM_EMPLOYERS = Math.floor(NUM_USERS / 3);
const NUM_MENTORS = Math.floor(NUM_USERS / 3);
const NUM_SKILL_CATEGORIES = 10;
const NUM_SKILLS = NUM_SKILL_CATEGORIES * 5; // five skills in each category
const NUM_ED_INSTITUTIONS = 10;

// to continually populate the database by running npx prisma db seed. You will need to remove
// the SEED argument. If not unique constraints will be violated for PKs uuid.
// recommended to leave it and use <npx prisma migrate reset> to drop data, apply migrations, and reseed the db.
faker.seed(SEED);
/// ///////////////////////////////////////////////////////////

function generateSAQuestionData(
  selfAssessmentId: string,
  questionType: SelfAssessmentQuestionType,
): sa_question {
  return {
    sa_question_id: faker.string.uuid(),
    self_assessment_id: selfAssessmentId,
    sa_question_text: faker.lorem.sentence(),
    question_type: questionType,
  };
}

async function fetchSAQuestionDependencies(): Promise<self_assessment[]> {
  return prisma.self_assessment.findMany();
}

async function createSAQuestion(SAQuestionDataObject: sa_question): Promise<sa_question> {
  const createdRecord: sa_question = await prisma.sa_question.create({
    data: {
      sa_question_id: SAQuestionDataObject.sa_question_id,
      self_assessment_id: SAQuestionDataObject.self_assessment_id,
      sa_question_text: SAQuestionDataObject.sa_question_text,
      question_type: SAQuestionDataObject.question_type,
      sa_possible_answer: {
        create: [
          {
            sa_possible_answer_id: faker.string.uuid(),
            answer_text: faker.lorem.sentence(),
            is_correct: true,
          },
          {
            sa_possible_answer_id: faker.string.uuid(),
            answer_text: faker.lorem.sentence(),
            is_correct: false,
          },
          {
            sa_possible_answer_id: faker.string.uuid(),
            answer_text: faker.lorem.sentence(),
          },
        ],
      },
    },
  });
  // console.log(`SAQuestion created with ID: ${createdRecord.sa_question_id}`);
  return createdRecord;
}
async function seedSAQuestions(): Promise<sa_question[]> {
  console.log('Seeding Self Assessment Questions...');
  const selfAssessments = await fetchSAQuestionDependencies();
  const questionTypes = [
    SelfAssessmentQuestionType.interest,
    SelfAssessmentQuestionType.competency,
  ];
  const createdQuestions: sa_question[] = [];

  for (const assessment of selfAssessments) {
    // creates an interest and competency question for each self-assessment
    for (const type of questionTypes) {
      const saQuestionData = generateSAQuestionData(assessment.self_assessment_id, type);
      createdQuestions.push(await createSAQuestion(saQuestionData));
    }
  }

  console.log(
    `\tSeeded ${createdQuestions.length} SA_Questions with interest and competency question for each of the ${selfAssessments.length} self-assessments.`,
  );
  return createdQuestions;
}
/// ///////////////////////////////////////////////////////////

function generateLearnerPrivateData(learnerId: string, ssn: string | null): learner_private_data {
  return {
    learner_private_data_id: faker.string.uuid(),
    learner_id: learnerId,
    ssn: ssn,
  };
}

async function fetchLearnerPrivateDataDependencies(): Promise<Learner[]> {
  return prisma.learner.findMany();
}

async function createLearnerPrivateData(
  learnerPrivateDataObject: learner_private_data,
): Promise<learner_private_data> {
  const createdRecord: learner_private_data = await prisma.learner_private_data.create({
    data: learnerPrivateDataObject,
  });
  console
    .log
    // `Created learner_private_data Record with ID: ${createdRecord.learner_private_data_id}`,
    ();
  return createdRecord;
}

async function seedLearnerPrivateData(): Promise<learner_private_data[]> {
  console.log('Seeding Learner Private Data...');
  const learners = await fetchLearnerPrivateDataDependencies();
  const createdPrivateData: learner_private_data[] = [];

  for (const learner of learners) {
    // Decide whether to include an SSN based on 20% probability
    const includeSSN = Math.random() >= 0.2; // 80% chance to include, 20% to exclude
    const ssn = includeSSN ? faker.number.int({ min: 100000000, max: 999999999 }).toString() : null;

    const learnerPrivateData = generateLearnerPrivateData(learner.learnerId, ssn);
    createdPrivateData.push(await createLearnerPrivateData(learnerPrivateData));
  }
  console.log(
    `\tSeeded ${createdPrivateData.length} learner private data records with 20% entries having null SSN.`,
  );
  return createdPrivateData;
}

/// ///////////////////////////////////////////////////////////

function generateSelfAssessmentData(skillCategoryId: string): self_assessment {
  return {
    self_assessment_id: faker.string.uuid(),
    skill_category_id: skillCategoryId,
  };
}

async function fetchSelfAssessmentDependencies(): Promise<skill_category[]> {
  return prisma.skill_category.findMany();
}

async function createSelfAssessment(
  selfAssessmentDataObject: self_assessment,
): Promise<self_assessment> {
  const createdRecord: self_assessment = await prisma.self_assessment.create({
    data: selfAssessmentDataObject,
  });
  // console.log(`created self assessment record with id: ${createdRecord.self_assessment_id}`);
  return createdRecord;
}

async function seedSelfAssessments(): Promise<self_assessment[]> {
  console.log('Seeding Self Assessments...');
  const skillCategories: skill_category[] = await fetchSelfAssessmentDependencies();
  const createdSelfAssessmentData: self_assessment[] = [];

  // Iterate through each skill category to create a self-assessment
  for (const skillCategory of skillCategories) {
    const selfAssessmentDataObject: self_assessment = generateSelfAssessmentData(
      skillCategory.skill_category_id,
    );
    createdSelfAssessmentData.push(await createSelfAssessment(selfAssessmentDataObject));
  }

  console.log(
    `\tSeeded ${createdSelfAssessmentData.length} self-assessment records. One for each skill category.`,
  );
  return createdSelfAssessmentData;
}

/// ///////////////////////////////////////////////////////////

function generateLearnerSkillGapData(
  learnerId: string,
  skillCategoryId: string,
): learner_skill_gap_data {
  return {
    learner_skill_gap_data_id: faker.string.uuid(),
    learner_id: learnerId,
    skill_category_id: skillCategoryId,
  };
}

async function createLearnerSkillGapData(
  learnerSkillGapDataObject: learner_skill_gap_data,
): Promise<learner_skill_gap_data> {
  const createdRecord = await prisma.learner_skill_gap_data.create({
    data: {
      learner_skill_gap_data_id: learnerSkillGapDataObject.learner_skill_gap_data_id,
      learner_id: learnerSkillGapDataObject.learner_id,
      skill_category_id: learnerSkillGapDataObject.skill_category_id,
    },
  });
  // console.log(`LearnerSkillGap record created with ID: ${createdRecord.learner_skill_gap_data_id}`);
  return createdRecord;
}

async function fetchLearnSkillGapDependencies(): Promise<{
  learners: Learner[];
  skillCategories: skill_category[];
}> {
  const learners: Learner[] = await prisma.learner.findMany();
  const skillCategories: skill_category[] = await prisma.skill_category.findMany();

  return { learners, skillCategories };
}

async function seedLearnSkillGaps(): Promise<learner_skill_gap_data[]> {
  console.log('Seeding Learner Skill Gaps...');
  const { learners, skillCategories } = await fetchLearnSkillGapDependencies();
  const createdSkillGapData: learner_skill_gap_data[] = [];
  // Iterate over learners
  for (const learner of learners) {
    const selectedSkillCategory =
      skillCategories[Math.floor(Math.random() * skillCategories.length)];

    // Generate learner skill gap data
    const learnerSkillGapData = generateLearnerSkillGapData(
      learner.learnerId,
      selectedSkillCategory.skill_category_id,
    );

    // Create learner skill gap data record
    createdSkillGapData.push(await createLearnerSkillGapData(learnerSkillGapData));
  }

  console.log(`\tSeeded ${createdSkillGapData.length} Skill Gap Data records.`);
  return createdSkillGapData;
}

/// ///////////////////////////////////////////////////////////

function generateLearnerProjBasedTechAssessmentData(
  learnerId: string,
  projBasedTechAssessmentId: string,
): LearnerProjBasedTechAssessment {
  return {
    learner_proj_based_tech_assessment_id: faker.string.uuid(), // generate manually as prisma does NOT handle autogenerate of uuid
    learner_id: learnerId,
    proj_based_tech_assessment_id: projBasedTechAssessmentId,
    attempt_date: faker.date.past(),
    has_passed: Math.random() < 0.5 ? 1 : 0,
  };
}

async function createLearnerProjBasedTechAssessment(
  techAssessmentDataObject: LearnerProjBasedTechAssessment,
): Promise<LearnerProjBasedTechAssessment> {
  const createdRecord = await prisma.learnerProjBasedTechAssessment.create({
    data: {
      learner_proj_based_tech_assessment_id:
        techAssessmentDataObject.learner_proj_based_tech_assessment_id,
      learner: {
        connect: { learnerId: techAssessmentDataObject.learner_id },
      },
      proj_based_tech_assessment: {
        connect: {
          proj_based_tech_assessment_id: techAssessmentDataObject.proj_based_tech_assessment_id,
        },
      },
      attempt_date: techAssessmentDataObject.attempt_date,
      has_passed: techAssessmentDataObject.has_passed,
    },
  });

  // console.log(
  //   `LearnerProjBasedTechAssessment record created with ID: ${createdRecord.learner_proj_based_tech_assessment_id}`,
  // );
  return createdRecord;
}

async function fetchLearnerProjBasedTechAssessmentDependencies() {
  const learners: Learner[] = await prisma.learner.findMany();
  const projBasedTechAssessments: proj_based_tech_assessment[] =
    await prisma.proj_based_tech_assessment.findMany();

  return { learners, projBasedTechAssessments };
}
async function seedLearnerProjBasedTechAssessments(): Promise<LearnerProjBasedTechAssessment[]> {
  console.log('Seeding Learner Project-Based Tech Assessments...');
  // Fetch logic is needed to get learners and projBasedTechAssessments
  const { learners, projBasedTechAssessments } =
    await fetchLearnerProjBasedTechAssessmentDependencies();
  const projBasedAssessments: LearnerProjBasedTechAssessment[] = [];

  for (const learner of learners) {
    const projBasedTechAssessment =
      projBasedTechAssessments[Math.floor(Math.random() * projBasedTechAssessments.length)];
    // Create record with generated data
    const createdRecord = generateLearnerProjBasedTechAssessmentData(
      learner.learnerId,
      projBasedTechAssessment.proj_based_tech_assessment_id,
    );
    projBasedAssessments.push(await createLearnerProjBasedTechAssessment(createdRecord));
  }
  console.log(`\tSeeded ${projBasedAssessments.length} Learner project-based assessment records.`);
  return projBasedAssessments;
}

/// ///////////////////////////////////////////////////////////

function generateTechAssessmentData(
  skillCategoryId: string,
  title: string,
): proj_based_tech_assessment {
  return {
    proj_based_tech_assessment_id: faker.string.uuid(),
    skill_category_id: skillCategoryId,
    title: title,
    description: faker.lorem.sentence(),
    url: faker.internet.url(),
  };
}

async function fetchTechAssessmentDependencies(): Promise<skill_category[]> {
  return prisma.skill_category.findMany();
}

async function createTechAssessment(
  techAssessmentDataObject: proj_based_tech_assessment,
): Promise<proj_based_tech_assessment> {
  const createdRecord = await prisma.proj_based_tech_assessment.create({
    data: techAssessmentDataObject,
  });
  // console.log(
  //   `Create Tech Assessment record with ID: ${techAssessmentDataObject.proj_based_tech_assessment_id}`,
  // );
  return createdRecord;
}

async function seedProjBasedTechAssessments(): Promise<proj_based_tech_assessment[]> {
  console.log('Seeding Project-Based Tech Assessments...');
  const skillCategories: skill_category[] = await fetchTechAssessmentDependencies();
  const createdTechAssessmentData: proj_based_tech_assessment[] = [];
  for (const skillCategory of skillCategories) {
    // Generate a title by appending "Assessment" to the skill category's name
    const title = `${skillCategory.category_name} Assessment`;

    // Generate tech assessment data with the custom title
    const techAssessmentData = generateTechAssessmentData(skillCategory.skill_category_id, title);

    // Create the tech assessment record in the database
    createdTechAssessmentData.push(await createTechAssessment(techAssessmentData));
  }

  console.log(`\tSeeded ${createdTechAssessmentData.length} records for each skill category.`);
  return createdTechAssessmentData;
}

/// ///////////////////////////////////////////////////////////

// Function to generate training program data
function generateTrainingProgramData(
  trainingProviderId: string,
  skillCategoryId: string,
): training_program {
  return {
    training_program_id: faker.string.uuid(),
    training_provider_id: trainingProviderId,
    skill_category_id: skillCategoryId,
  };
}

async function createTrainingProgram(
  trainingProviderId: string,
  skillCategoryId: string,
): Promise<training_program> {
  const trainingProgramData = generateTrainingProgramData(trainingProviderId, skillCategoryId);
  await prisma.training_program.create({
    data: trainingProgramData,
  });
  // console.log(`TrainingProgram record created with ID: ${trainingProgramData.training_program_id}`);
  return trainingProgramData;
}

async function fetchTrainingProgramDependencies(): Promise<{
  trainingProviders: trainingProvider[];
  skillCategories: skill_category[];
}> {
  const trainingProviders = await prisma.trainingProvider.findMany();
  const skillCategories = await prisma.skill_category.findMany();
  return { trainingProviders, skillCategories };
}

async function seedTrainingPrograms(): Promise<training_program[]> {
  console.log('Seeding Training Programs...');
  const { trainingProviders, skillCategories } = await fetchTrainingProgramDependencies();
  const createdTrainingPrograms: training_program[] = [];
  for (const trainingProvider of trainingProviders) {
    const skillCategory = skillCategories[Math.floor(Math.random() * skillCategories.length)];
    createdTrainingPrograms.push(
      await createTrainingProgram(
        trainingProvider.training_provider_id,
        skillCategory.skill_category_id,
      ),
    );
  }
  console.log(`\tSeeded ${createdTrainingPrograms.length} records for Training Programs.`);
  return createdTrainingPrograms;
}

/// ///////////////////////////////////////////////////////////

function generateTrainingProviderData(userId: string, edInstitutionId: string): trainingProvider {
  return {
    training_provider_id: faker.string.uuid(),
    user_id: userId,
    edu_institution_id: edInstitutionId,
  };
}

async function createTrainingProvider(
  userId: string,
  edInstitutionId: string,
): Promise<trainingProvider> {
  const trainingProviderData = generateTrainingProviderData(userId, edInstitutionId);
  const trainingProvider = await prisma.trainingProvider.create({
    data: trainingProviderData,
  });
  // console.log(`Created TrainingProvider with ID: ${trainingProvider.training_provider_id}`);
  return trainingProvider;
}

async function fetchTrainingProviderDependencies(): Promise<{
  users: User[];
  eduInstitutions: EdInstitution[];
}> {
  const users: User[] = await prisma.user.findMany({
    take: 10,
  });
  const eduInstitutions: EdInstitution[] = await prisma.edInstitution.findMany({
    take: 10,
  });
  return { users, eduInstitutions };
}

async function seedTrainingProviders(): Promise<trainingProvider[]> {
  console.log('Seeding Training Providers...');
  const { users, eduInstitutions } = await fetchTrainingProviderDependencies();
  const createdTrainingProviders: trainingProvider[] = [];

  // TODO: make meaningful. Assuming you want to create a training provider for each user
  for (const user of users) {
    // TODO: make meaningful. Randomly assign an educational institution or null
    const eduInstitutionId: string =
      eduInstitutions[Math.floor(Math.random() * eduInstitutions.length)].edInstitutionId;

    createdTrainingProviders.push(await createTrainingProvider(user.userId, eduInstitutionId));
  }
  console.log(`\tSeeded ${createdTrainingProviders.length} records for Training Providers.`);
  return createdTrainingProviders;
}

/// ///////////////////////////////////////////////////////////

async function fetchSkillDataDependencies(): Promise<skill_category[]> {
  return prisma.skill_category.findMany();
}
function generateSkillData(skillCategoryId: string): Skill {
  return {
    skill_id: faker.string.uuid(),
    skill_category_id: skillCategoryId,
    skill_name: faker.commerce.productName(),
    skill_description: faker.lorem.sentence(),
    skill_class: 'none',
  };
}

async function createSkill(skillCategoryId: string): Promise<Skill> {
  const skill: Skill = generateSkillData(skillCategoryId);
  await prisma.skill.create({
    data: skill,
  });
  // console.log(`Skill record created with ID: ${skill.skill_id}`);
  return skill;
}

async function seedSkillData(): Promise<Skill[]> {
  console.log('Seeding Skills...');
  const skillCategories: skill_category[] = await fetchSkillDataDependencies();
  const createdSkillData: Skill[] = [];
  for (let i = 0; i < NUM_SKILLS; i++) {
    createdSkillData.push(
      await createSkill(skillCategories[i % skillCategories.length].skill_category_id),
    );
  }
  console.log(`\tSeeded ${createdSkillData.length} records for Skill table.`);
  return createdSkillData;
}

/// ///////////////////////////////////////////////////////////

async function fetchLearnerDependencies(): Promise<{
  users: User[];
  edInstitutions: EdInstitution[];
}> {
  const users: User[] = await prisma.user.findMany();
  const edInstitutions: EdInstitution[] = await prisma.edInstitution.findMany();
  return { users, edInstitutions };
}

function generateLearnerData(userId: string, eduInstitutionId: string | null): Learner {
  const isEnrolledInCollege = faker.number.int({ min: 0, max: 1 });
  return {
    learnerId: faker.string.uuid(),
    user_id: userId,
    is_enrolled_college: isEnrolledInCollege,
    edu_institution_id: isEnrolledInCollege ? null : eduInstitutionId,
    degree_type: faker.helpers.arrayElement([
      'Associate',
      'Bachelors',
      'Certification',
      'Online-Course',
    ]),
    intern_hours_required: isEnrolledInCollege ? faker.number.int({ min: 0, max: 1 }) : 0,
    major: faker.person.jobArea(),
    minor: faker.datatype.boolean() ? faker.person.jobArea() : 'none',
  };
}

async function createLearner(learnerData: Learner): Promise<Learner> {
  const learner: Learner = await prisma.learner.create({
    data: learnerData,
  });
  // console.log(`Learner record created with ID: ${learner.learnerId}`);
  return learner;
}

async function seedLearners(): Promise<Learner[]> {
  console.log('Seeding Learners...');
  const { users, edInstitutions } = await fetchLearnerDependencies();
  const learnerUsers = users.slice(0, NUM_LEARNERS);
  const learners: Learner[] = [];

  for (let i = 0; i < learnerUsers.length; i++) {
    const userId = learnerUsers[i].userId; // Cycle through users
    let learnerData = generateLearnerData(userId, null);

    // If the learner is enrolled in college, randomly assign an educational institution
    if (learnerData.is_enrolled_college === 1) {
      const randomEdInstitution = edInstitutions[Math.floor(Math.random() * edInstitutions.length)];
      learnerData = {
        ...learnerData,
        edu_institution_id: randomEdInstitution.edInstitutionId, // Assign a random edu_institution_id
      };
    }

    // Now create the learner with the potentially updated edu_institution_id
    learners.push(await createLearner(learnerData));
  }

  console.log(`\tSeeded ${learners.length} learners.`);
  return learners;
}

/// ///////////////////////////////////////////////////////////

function generateSkillCategoryData(category: string): skill_category {
  return {
    skill_category_id: faker.string.uuid(),
    category_name: category, // Generates a department name as a category name
    category_description: faker.lorem.sentence(), // Generates a simple description
  };
}

async function createSkillCategory(category: string): Promise<skill_category> {
  const skillCategoryData: skill_category = generateSkillCategoryData(category);
  const skillCategory: skill_category = await prisma.skill_category.create({
    data: skillCategoryData,
  });
  // console.log(`Skill Category record created with ID: ${skillCategory.skill_category_id}`);
  return skillCategory;
}

async function seedSkillCategories(): Promise<skill_category[]> {
  console.log('Seeding Skill Categories...');
  const createSkillCategories: skill_category[] = [];
  for (const category of staticSkillCategoriesList) {
    createSkillCategories.push(await createSkillCategory(category));
  }
  console.log(`\tSeeded ${createSkillCategories.length} skill categories.`);
  return createSkillCategories;
}

/// ///////////////////////////////////////////////////////////

async function fetchJobListingSkillCategoryDependencies(): Promise<{
  jobListings: JobListing[];
  skillCategories: skill_category[];
}> {
  const jobListings: JobListing[] = await prisma.jobListing.findMany();
  const skillCategories: skill_category[] = await prisma.skill_category.findMany();

  return { jobListings, skillCategories };
}

function generateJobListingSkillCategoryData(
  jobListingId: string,
  skillCategoryId: string,
): JobListingSkillCategory {
  return {
    job_listing_has_skill_category_id: faker.string.uuid(),
    job_listing_id: jobListingId,
    skill_category_id: skillCategoryId,
  };
}

async function createJobListingHasSkillCategory(
  jobListingId: string,
  skillCategoryId: string,
): Promise<JobListingSkillCategory> {
  const jobListingSkillCategoryData = generateJobListingSkillCategoryData(
    jobListingId,
    skillCategoryId,
  );
  const jobListingSkillCategory = await prisma.jobListingSkillCategory.create({
    data: jobListingSkillCategoryData,
  });
  // console.log(
  //   `JobListingSkillCategory record created with ID: ${jobListingSkillCategory.job_listing_has_skill_category_id}`,
  // );
  return jobListingSkillCategoryData;
}

async function seedJobListingHasSkillCategory(): Promise<JobListingSkillCategory[]> {
  console.log('Seeding Job Listing Skill Categories...');
  const { jobListings, skillCategories } = await fetchJobListingSkillCategoryDependencies();
  const createdJobSkillCategoryRelationships: JobListingSkillCategory[] = [];

  // Iterate over each job listing
  for (const jobListing of jobListings) {
    // Determine a random number of skill categories to assign to this job listing (between 1 and 3)
    const numSkillCategories = Math.floor(Math.random() * 3) + 2;

    // Shuffle skill categories and select the first 'numSkillCategories' as the categories for this job listing
    const shuffledSkillCategories = skillCategories.sort(() => 0.5 - Math.random());
    const selectedSkillCategories = shuffledSkillCategories.slice(0, numSkillCategories);

    // Create JobListingSkillCategory records for the selected skill categories
    for (const skillCategory of selectedSkillCategories) {
      createdJobSkillCategoryRelationships.push(
        await createJobListingHasSkillCategory(
          jobListing.job_listing_id,
          skillCategory.skill_category_id,
        ),
      );
    }
  }

  console.log(
    `\tSeeded ${createdJobSkillCategoryRelationships.length} records for Job Listing Has Skill Category table.`,
  );
  return createdJobSkillCategoryRelationships;
}

/// ///////////////////////////////////////////////////////////

async function fetchJobListingDependencies(): Promise<Employer[]> {
  return prisma.employer.findMany();
}
function generateJobListingData(employerId: string): JobListing {
  return {
    job_listing_id: faker.string.uuid(),
    employer_id: employerId,
    job_title: getRandomItJobTitle(),
    position_loc: faker.helpers.arrayElement(Object.values(JobListingPositionLoc)),
    salary_range: generateSalaryRange(),
    region: faker.helpers.arrayElement(waCounties) + ' county',
  };
}

function generateSalaryRange() {
  // Generate the minimum salary between $50,000 and $170,000
  // This ensures there's room to add at least $30,000 for the maximum salary
  const minSalary = faker.number.int({ min: 50000, max: 170000 });

  // Ensure the maximum salary is at least $30,000 more than the minimum
  const maxSalary = minSalary + 30000 + faker.number.int({ min: 0, max: 20000 });

  // Format the salaries as strings with commas and prepend with '$'
  const formatSalary = (salary: number) => `$${salary.toLocaleString()}`;

  return `${formatSalary(minSalary)} - ${formatSalary(maxSalary)}`;
}
function getRandomItJobTitle() {
  const index = Math.floor(Math.random() * itJobTitles.length);
  return itJobTitles[index];
}

async function createJobListing(employerId: string): Promise<JobListing> {
  const jobListingData: JobListing = generateJobListingData(employerId);
  const jobListing: JobListing = await prisma.jobListing.create({
    data: jobListingData,
  });
  // console.log(`JobListing record created with ID: ${jobListing.job_listing_id}`);
  return jobListingData;
}

async function seedJobListings(): Promise<JobListing[]> {
  console.log('Seeding Job Listings...');
  //TODO: seed two unique job listings for each employer
  const employers: Employer[] = await fetchJobListingDependencies();
  const createdJobListings: JobListing[] = [];
  for (const employer of employers) {
    // Seed the first job listing
    createdJobListings.push(await createJobListing(employer.employerId));

    // Seed the second job listing
    createdJobListings.push(await createJobListing(employer.employerId));
  }

  console.log(
    `\tSeeded a total ${createdJobListings.length} job listings. Two for each of ${employers.length} employers.`,
  );
  return createdJobListings;
}

/// ///////////////////////////////////////////////////////////

function generateEdInstitutionData(): EdInstitution {
  return {
    edInstitutionId: faker.string.uuid(),
    name:
      faker.company.name() + ' ' + faker.helpers.arrayElement(['University', 'College', 'Agency']),
    address:
      faker.location.streetAddress(true) +
      ' ' +
      faker.location.city() +
      ', WA ' +
      faker.location.zipCode(),
    contactEmail: faker.internet.email(),
    edUrl: faker.internet.url(),
  };
}

async function createEdInstitution(): Promise<EdInstitution> {
  // Generate a single EdInstitution entry
  const edInstitutionData: EdInstitution = generateEdInstitutionData();

  // Create EdInstitution entry in the database
  const edInstitution: EdInstitution = await prisma.edInstitution.create({
    data: edInstitutionData,
  });
  // console.log(`EdInstitution record created with ID: ${edInstitution.edInstitutionId}`);
  return edInstitution;
}

async function seedEdInstitutions(): Promise<EdInstitution[]> {
  console.log('Seeding Edu Institutions...');
  const createdEdInstitutions: EdInstitution[] = [];
  for (let i = 0; i < NUM_ED_INSTITUTIONS; i++) {
    createdEdInstitutions.push(await createEdInstitution());
  }
  console.log(`\t Seeded ${createdEdInstitutions.length} records for Ed Institutions table.`);
  return createdEdInstitutions;
}

/// ///////////////////////////////////////////////////////////

function generateMentorHasSkillData(mentorId: string, skillCategoryId: string): mentor_has_skill {
  return {
    mentor_has_skill_id: faker.string.uuid(),
    skill_category_id: skillCategoryId,
    mentor_id: mentorId,
  };
}

async function createMentorSkillRelation(
  mentorId: string,
  skillCategoryId: string,
): Promise<mentor_has_skill> {
  const mentorSkillData: mentor_has_skill = generateMentorHasSkillData(mentorId, skillCategoryId);
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
  // console.log(`MentorHasSkill record created with ID: ${mentorSkillData.mentor_has_skill_id}`);
  return mentorSkillData;
}

async function fetchMentorSkillDependencies() {
  const mentors: mentor[] = await prisma.mentor.findMany();
  const skillCategories: skill_category[] = await prisma.skill_category.findMany();
  return { mentors, skillCategories };
}

async function seedMentorSkills(): Promise<mentor_has_skill[]> {
  console.log('Seeding Mentor Skills...');
  const { mentors, skillCategories } = await fetchMentorSkillDependencies();
  const createdMentorSkills: mentor_has_skill[] = [];
  for (const mentor of mentors) {
    // assign random category as mentor expertise
    const randomSkillCategory =
      skillCategories[Math.floor(Math.random() * skillCategories.length)].skill_category_id;
    createdMentorSkills.push(
      await createMentorSkillRelation(mentor.mentor_id, randomSkillCategory),
    );
  }
  console.log(`\t Seeded ${createdMentorSkills.length} record for MentorSkills table.`);
  return createdMentorSkills;
}

/// ///////////////////////////////////////////////////////////

async function fetchEmployerDependencies(): Promise<User[]> {
  return prisma.user.findMany();
}
function generateEmployerData(userId: string): Employer {
  return {
    employerId: faker.string.uuid(),
    user_id: userId,
    title: faker.company.name(),
    home_office_location: faker.location.city() + ', WA',
    employer_url: faker.internet.url(),
    logo_url: faker.image.urlPicsumPhotos({ width: 480, height: 480 }),
  };
}

async function createEmployer(userId: string): Promise<Employer> {
  const employerData: Employer = generateEmployerData(userId);

  const employer: Employer = await prisma.employer.create({
    data: employerData,
  });
  // console.log(`Employer record created with ID: ${employer.employerId} for User ID: ${userId}`);
  return employer;
}

async function seedEmployers(): Promise<Employer[]> {
  console.log('Seeding Employers...');
  const users: User[] = await fetchEmployerDependencies();
  const employerUsers: User[] = users.slice(NUM_LEARNERS, NUM_LEARNERS + NUM_EMPLOYERS);
  const createdEmployers: Employer[] = [];
  for (let i = 0; i < employerUsers.length; i++) {
    createdEmployers.push(await createEmployer(employerUsers[i].userId));
  }
  console.log(`\tSeeded ${createdEmployers.length} records for Employers table.`);
  return createdEmployers;
}

/// ///////////////////////////////////////////////////////////

function generateMentorData(userId: string): mentor {
  return {
    mentor_id: faker.string.uuid(),
    user_id: userId,
  };
}

async function createMentor(userId: string): Promise<mentor> {
  const mentorData: mentor = generateMentorData(userId);
  await prisma.mentor.create({
    data: mentorData,
  });
  // console.log(`Mentor record created for User ID: ${userId}`);
  return mentorData;
}

async function fetchMentorDependencies() {
  const users: User[] = await prisma.user.findMany();
  return users;
}

async function seedMentors(): Promise<mentor[]> {
  console.log('Seeding Mentors...');
  const users = await fetchMentorDependencies();
  const mentorUsers: User[] = users.slice(NUM_LEARNERS + NUM_EMPLOYERS);
  const createMentors: mentor[] = [];
  for (const mentor of mentorUsers) {
    createMentors.push(await createMentor(mentor.userId));
  }
  console.log(`\tSeeded ${createMentors.length} records for Mentors table.`);
  return createMentors;
}

/// ///////////////////////////////////////////////////////////

function generateUserData(): User {
  return {
    userId: faker.string.uuid(),
    userName: faker.internet.userName(),
    password: faker.string.hexadecimal({ length: 64, casing: 'lower' }), // 32-byte hashed password
    email: faker.internet.email(),
  };
}

async function createUser(): Promise<User> {
  const userData = generateUserData();

  const user: User = await prisma.user.create({
    data: userData,
  });
  // console.log(`Created User with ID: ${user.userId} with mock hashed password`);
  return user;
}

async function seedUser(): Promise<User[]> {
  console.log('Seeding Users...');
  const createUsers: User[] = [];
  for (let i = 0; i < NUM_USERS; i++) {
    createUsers.push(await createUser());
  }
  console.log(`\tSeeded ${createUsers.length} records for User table.`);
  return createUsers;
}

const waCounties = [
  'Adams',
  'Asotin',
  'Benton',
  'Chelan',
  'Clallam',
  'Clark',
  'Columbia',
  'Cowlitz',
  'Douglas',
  'Ferry',
  'Franklin',
  'Garfield',
  'Grant',
  'Grays Harbor',
  'Island',
  'Jefferson',
  'King',
  'Kitsap',
  'Kittitas',
  'Klickitat',
  'Lewis',
  'Lincoln',
  'Mason',
  'Okanogan',
  'Pacific',
  'Pend Oreille',
  'Pierce',
  'San Juan',
  'Skagit',
  'Skamania',
  'Snohomish',
  'Spokane',
  'Stevens',
  'Thurston',
  'Wahkiakum',
  'Walla Walla',
  'Whatcom',
  'Whitman',
  'Yakima',
];

const itJobTitles = [
  'Software Engineer',
  'Systems Administrator',
  'Web Developer',
  'Database Administrator',
  'Information Security Analyst',
  'Cloud Solutions Architect',
  'Network Engineer',
  'DevOps Engineer',
  'Data Scientist',
  'IT Support Specialist',
  'Full Stack Developer',
  'Mobile Application Developer',
  'User Experience Designer',
  'IT Project Manager',
  'Machine Learning Engineer',
];

const staticSkillCategoriesList = [
  'Agile Software Development',
  'Application Programming Interface (API)',
  'Artificial Intelligence and Machine Learning (AI/ML)',
  'Augmented and Virtual Reality (AR/VR)',
  'Backup Software',
  'Basic Technical Knowledge',
  'Blockchain',
  'C and C++',
  'Cloud Computing',
  'Cloud Solutions',
  'Collaborative Software',
  'Computer Hardware',
  'Computer Science',
  'Configuration Management',
  'Content Management Systems',
  'Cybersecurity',
  'Data Collection',
  'Data Management',
  'Data Storage',
  'Database Architecture and Administration',
  'Databases',
  'Distributed Computing',
  'Enterprise Application Management',
  'Enterprise Information Management',
  'Extensible Languages and XML',
  'Extraction, Transformation, and Loading (ETL)',
  'Firmware',
  'General Networking',
  'Geospatial Information and Technology',
  'Identity and Access Management',
  'Integrated Development Environments (IDEs)',
  'Internet of Things (IoT)',
  'iOS Development',
  'IT Automation',
  'IT Management',
  'Java',
  'JavaScript and jQuery',
  'Log Management',
  'Mainframe Technologies',
  'Malware Protection',
  'Microsoft Development Tools',
  'Microsoft Windows',
  'Middleware',
  'Mobile Development',
  'Network Protocols',
  'Network Security',
  'Networking Hardware',
  'Networking Software',
  'Operating Systems',
  'Other Programming Languages',
  'Query Languages',
  'Scripting',
  'Scripting Languages',
  'Search Engines',
  'Servers',
  'Software Development',
  'Software Development Tools',
  'Software Quality Assurance',
  'System Design and Implementation',
  'Systems Administration',
  'Technical Support and Services',
  'Telecommunications',
  'Test Automation',
  'Version Control',
  'Video and Web Conferencing',
  'Virtualization and Virtual Machines',
  'Web Content',
  'Web Design and Development',
  'Web Services',
  'Wireless Technologies',
];

async function main(): Promise<void> {
  console.log('Seeding started...');

  // Seed Users
  await seedUser();

  // Seed Skill Categories and Skills
  await seedSkillCategories();

  await seedSkillData();

  // Seed Ed Institutions
  await seedEdInstitutions();

  // Seed Training Providers
  await seedTrainingProviders();

  // Seed Training Programs
  await seedTrainingPrograms();

  // Seed Project-Based Tech Assessments
  await seedProjBasedTechAssessments();

  // Seed Self Assessments
  await seedSelfAssessments();

  // Seed Employers, Learners, and Mentors
  await seedEmployers();
  await seedLearners();
  await seedMentors();

  // Seed SA Questions
  await seedSAQuestions();

  // Seed Learner Project-Based Tech Assessments
  await seedLearnerProjBasedTechAssessments();

  // Seed Learner Skill Gaps
  await seedLearnSkillGaps();

  // Seed Learner Private Data
  await seedLearnerPrivateData();

  // Seed Job Listings and their Skill Categories
  await seedJobListings();

  await seedJobListingHasSkillCategory();

  await seedMentorSkills();

  console.log('All seeding operations completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
