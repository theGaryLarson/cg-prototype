import { JobListingPositionLoc, PrismaClient, SelfAssessmentQuestionType } from '@prisma/client';
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

interface SAQuestionData {
  sa_question_id: string;
  self_assessment_id: string;
  sa_question_text: string;
  question_type: SelfAssessmentQuestionType;
}

function generateSAQuestionData(
  selfAssessmentId: string,
  questionType: SelfAssessmentQuestionType,
): SAQuestionData {
  return {
    sa_question_id: faker.string.uuid(),
    self_assessment_id: selfAssessmentId,
    sa_question_text: faker.lorem.sentence(),
    question_type: questionType,
  };
}

async function fetchSAQuestionDependencies(): Promise<SelfAssessmentData[]> {
  return prisma.self_assessment.findMany();
}

async function createSAQuestion(SAQuestionDataObject: SAQuestionData): Promise<SAQuestionData> {
  const createdRecord = await prisma.sa_question.create({
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
async function seedSAQuestions(): Promise<SAQuestionData[]> {
  console.log('Seeding Self Assessment Questions...');
  const selfAssessments = await fetchSAQuestionDependencies();
  const questionTypes = [
    SelfAssessmentQuestionType.interest,
    SelfAssessmentQuestionType.competency,
  ];
  const createdQuestions: SAQuestionData[] = [];

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

interface LearnerPrivateData {
  learner_private_data_id: string;
  learner_id: string;
  ssn: string | null;
}

function generateLearnerPrivateData(learnerId: string, ssn: string | null): LearnerPrivateData {
  return {
    learner_private_data_id: faker.string.uuid(),
    learner_id: learnerId,
    ssn: ssn,
  };
}

async function fetchLearnerPrivateDataDependencies(): Promise<LearnerData[]> {
  return prisma.learner.findMany();
}

async function createLearnerPrivateData(
  learnerPrivateDataObject: LearnerPrivateData,
): Promise<LearnerPrivateData> {
  const createdRecord: LearnerPrivateData = await prisma.learner_private_data.create({
    data: learnerPrivateDataObject,
  });
  console
    .log
    // `Created LearnerPrivateData Record with ID: ${createdRecord.learner_private_data_id}`,
    ();
  return createdRecord;
}

async function seedLearnerPrivateData(): Promise<LearnerPrivateData[]> {
  console.log('Seeding Learner Private Data...');
  const learners = await fetchLearnerPrivateDataDependencies();
  const createdPrivateData: LearnerPrivateData[] = [];

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
interface SelfAssessmentData {
  self_assessment_id: string;
  skill_category_id: string;
}

function generateSelfAssessmentData(skillCategoryId: string): SelfAssessmentData {
  return {
    self_assessment_id: faker.string.uuid(),
    skill_category_id: skillCategoryId,
  };
}

async function fetchSelfAssessmentDependencies(): Promise<SkillCategoryData[]> {
  return prisma.skill_category.findMany();
}

async function createSelfAssessment(
  selfAssessmentDataObject: SelfAssessmentData,
): Promise<SelfAssessmentData> {
  const createdRecord: SelfAssessmentData = await prisma.self_assessment.create({
    data: selfAssessmentDataObject,
  });
  // console.log(`created self assessment record with id: ${createdRecord.self_assessment_id}`);
  return createdRecord;
}

async function seedSelfAssessments(): Promise<SelfAssessmentData[]> {
  console.log('Seeding Self Assessments...');
  const skillCategories: SkillCategoryData[] = await fetchSelfAssessmentDependencies();
  const createdSelfAssessmentData: SelfAssessmentData[] = [];

  // Iterate through each skill category to create a self-assessment
  for (const skillCategory of skillCategories) {
    const selfAssessmentDataObject: SelfAssessmentData = generateSelfAssessmentData(
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
interface LearnerSkillGapData {
  learner_skill_gap_data_id: string;
  learner_id: string;
  skill_category_id: string;
}

function generateLearnerSkillGapData(
  learnerId: string,
  skillCategoryId: string,
): LearnerSkillGapData {
  return {
    learner_skill_gap_data_id: faker.string.uuid(),
    learner_id: learnerId,
    skill_category_id: skillCategoryId,
  };
}

async function createLearnerSkillGapData(
  learnerSkillGapDataObject: LearnerSkillGapData,
): Promise<LearnerSkillGapData> {
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
  learners: LearnerData[];
  skillCategories: SkillCategoryData[];
}> {
  const learners: LearnerData[] = await prisma.learner.findMany();
  const skillCategories: SkillCategoryData[] = await prisma.skill_category.findMany();

  return { learners, skillCategories };
}

async function seedLearnSkillGaps(): Promise<LearnerSkillGapData[]> {
  console.log('Seeding Learner Skill Gaps...');
  const { learners, skillCategories } = await fetchLearnSkillGapDependencies();
  const createdSkillGapData: LearnerSkillGapData[] = [];
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

interface LearnerProjBasedTechAssessmentData {
  learner_proj_based_tech_assessment_id: string;
  learner_id: string;
  proj_based_tech_assessment_id: string;
  attempt_date: Date;
  has_passed: number;
}

function generateLearnerProjBasedTechAssessmentData(
  learnerId: string,
  projBasedTechAssessmentId: string,
): LearnerProjBasedTechAssessmentData {
  return {
    learner_proj_based_tech_assessment_id: faker.string.uuid(), // generate manually as prisma does NOT handle autogenerate of uuid
    learner_id: learnerId,
    proj_based_tech_assessment_id: projBasedTechAssessmentId,
    attempt_date: faker.date.past(),
    has_passed: Math.random() < 0.5 ? 1 : 0,
  };
}

async function createLearnerProjBasedTechAssessment(
  techAssessmentDataObject: LearnerProjBasedTechAssessmentData,
): Promise<LearnerProjBasedTechAssessmentData> {
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
  const learners: LearnerData[] = await prisma.learner.findMany();
  const projBasedTechAssessments: TechAssessmentData[] =
    await prisma.proj_based_tech_assessment.findMany();

  return { learners, projBasedTechAssessments };
}
async function seedLearnerProjBasedTechAssessments(): Promise<
  LearnerProjBasedTechAssessmentData[]
> {
  console.log('Seeding Learner Project-Based Tech Assessments...');
  // Fetch logic is needed to get learners and projBasedTechAssessments
  const { learners, projBasedTechAssessments } =
    await fetchLearnerProjBasedTechAssessmentDependencies();
  const projBasedAssessments: LearnerProjBasedTechAssessmentData[] = [];

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

interface TechAssessmentData {
  proj_based_tech_assessment_id: string;
  skill_category_id: string;
  title: string;
  url: string;
}

function generateTechAssessmentData(skillCategoryId: string, title: string): TechAssessmentData {
  return {
    proj_based_tech_assessment_id: faker.string.uuid(),
    skill_category_id: skillCategoryId,
    title: title,
    url: faker.internet.url(),
  };
}

async function fetchTechAssessmentDependencies(): Promise<SkillCategoryData[]> {
  return prisma.skill_category.findMany();
}

async function createTechAssessment(
  techAssessmentDataObject: TechAssessmentData,
): Promise<TechAssessmentData> {
  const createdRecord = await prisma.proj_based_tech_assessment.create({
    data: techAssessmentDataObject,
  });
  // console.log(
  //   `Create Tech Assessment record with ID: ${techAssessmentDataObject.proj_based_tech_assessment_id}`,
  // );
  return createdRecord;
}

async function seedProjBasedTechAssessments(): Promise<TechAssessmentData[]> {
  console.log('Seeding Project-Based Tech Assessments...');
  const skillCategories: SkillCategoryData[] = await fetchTechAssessmentDependencies();
  const createdTechAssessmentData: TechAssessmentData[] = [];
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

interface TrainingProgramData {
  training_program_id: string;
  training_provider_id: string;
  skill_category_id: string;
}

// Function to generate training program data
function generateTrainingProgramData(
  trainingProviderId: string,
  skillCategoryId: string,
): TrainingProgramData {
  return {
    training_program_id: faker.string.uuid(),
    training_provider_id: trainingProviderId,
    skill_category_id: skillCategoryId,
  };
}

async function createTrainingProgram(
  trainingProviderId: string,
  skillCategoryId: string,
): Promise<TrainingProgramData> {
  const trainingProgramData = generateTrainingProgramData(trainingProviderId, skillCategoryId);
  await prisma.training_program.create({
    data: trainingProgramData,
  });
  // console.log(`TrainingProgram record created with ID: ${trainingProgramData.training_program_id}`);
  return trainingProgramData;
}

async function fetchTrainingProgramDependencies(): Promise<{
  trainingProviders: TrainingProviderData[];
  skillCategories: SkillCategoryData[];
}> {
  const trainingProviders = await prisma.trainingProvider.findMany();
  const skillCategories = await prisma.skill_category.findMany();
  return { trainingProviders, skillCategories };
}

async function seedTrainingPrograms(): Promise<TrainingProgramData[]> {
  console.log('Seeding Training Programs...');
  const { trainingProviders, skillCategories } = await fetchTrainingProgramDependencies();
  const createdTrainingPrograms: TrainingProgramData[] = [];
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
  // console.log(`Created TrainingProvider with ID: ${trainingProvider.training_provider_id}`);
  return trainingProvider;
}

async function fetchTrainingProviderDependencies(): Promise<{
  users: UserData[];
  eduInstitutions: EdInstitutionData[];
}> {
  const users: UserData[] = await prisma.user.findMany({
    take: 10,
  });
  const eduInstitutions: EdInstitutionData[] = await prisma.edInstitution.findMany({
    take: 10,
  });
  return { users, eduInstitutions };
}

async function seedTrainingProviders(): Promise<TrainingProviderData[]> {
  console.log('Seeding Training Providers...');
  const { users, eduInstitutions } = await fetchTrainingProviderDependencies();
  const createdTrainingProviders: TrainingProviderData[] = [];

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

interface SkillData {
  skill_id: string;
  skill_category_id: string;
  skill_name: string;
  skill_description: string;
}

async function fetchSkillDataDependencies(): Promise<SkillCategoryData[]> {
  return prisma.skill_category.findMany();
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
  // console.log(`Skill record created with ID: ${skill.skill_id}`);
  return skill;
}

async function seedSkillData(): Promise<SkillData[]> {
  console.log('Seeding Skills...');
  const skillCategories: SkillCategoryData[] = await fetchSkillDataDependencies();
  const createdSkillData: SkillData[] = [];
  for (let i = 0; i < NUM_SKILLS; i++) {
    createdSkillData.push(
      await createSkill(skillCategories[i % skillCategories.length].skill_category_id),
    );
  }
  console.log(`\tSeeded ${createdSkillData.length} records for Skill table.`);
  return createdSkillData;
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

async function fetchLearnerDependencies(): Promise<{
  users: UserData[];
  edInstitutions: EdInstitutionData[];
}> {
  const users: UserData[] = await prisma.user.findMany();
  const edInstitutions: EdInstitutionData[] = await prisma.edInstitution.findMany();
  return { users, edInstitutions };
}

function generateLearnerData(userId: string, eduInstitutionId?: string | null): LearnerData {
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

async function createLearner(learnerData: LearnerData): Promise<LearnerData> {
  const learner: LearnerData = await prisma.learner.create({
    data: learnerData,
  });
  // console.log(`Learner record created with ID: ${learner.learnerId}`);
  return learner;
}

async function seedLearners(): Promise<LearnerData[]> {
  console.log('Seeding Learners...');
  const { users, edInstitutions } = await fetchLearnerDependencies();
  const learnerUsers = users.slice(0, NUM_LEARNERS);
  const learners: LearnerData[] = [];

  for (let i = 0; i < learnerUsers.length; i++) {
    const userId = learnerUsers[i].userId; // Cycle through users
    // Generate learner data without edu_institution_id
    let learnerData = generateLearnerData(userId);

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

interface SkillCategoryData {
  skill_category_id: string;
  category_name: string;
  category_description: string;
}

function generateSkillCategoryData(category: string): SkillCategoryData {
  return {
    skill_category_id: faker.string.uuid(),
    category_name: category, // Generates a department name as a category name
    category_description: faker.lorem.sentence(), // Generates a simple description
  };
}

async function createSkillCategory(category: string): Promise<SkillCategoryData> {
  const skillCategoryData: SkillCategoryData = generateSkillCategoryData(category);
  const skillCategory: SkillCategoryData = await prisma.skill_category.create({
    data: skillCategoryData,
  });
  // console.log(`Skill Category record created with ID: ${skillCategory.skill_category_id}`);
  return skillCategory;
}

async function seedSkillCategories(): Promise<SkillCategoryData[]> {
  console.log('Seeding Skill Categories...');
  const createSkillCategories: SkillCategoryData[] = [];
  for (const category of staticSkillCategoriesList) {
    createSkillCategories.push(await createSkillCategory(category));
  }
  console.log(`\tSeeded ${createSkillCategories.length} skill categories.`);
  return createSkillCategories;
}

/// ///////////////////////////////////////////////////////////

interface JobListingHasSkillCategoryData {
  job_listing_has_skill_category_id: string;
  job_listing_id: string;
  skill_category_id: string;
}

async function fetchJobListingSkillCategoryDependencies(): Promise<{
  jobListings: JobListingData[];
  skillCategories: SkillCategoryData[];
}> {
  const jobListings: JobListingData[] = await prisma.jobListing.findMany();
  const skillCategories: SkillCategoryData[] = await prisma.skill_category.findMany();

  return { jobListings, skillCategories };
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
): Promise<JobListingHasSkillCategoryData> {
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

async function seedJobListingHasSkillCategory(): Promise<JobListingHasSkillCategoryData[]> {
  console.log('Seeding Job Listing Skill Categories...');
  const { jobListings, skillCategories } = await fetchJobListingSkillCategoryDependencies();
  const createdJobSkillCategoryRelationships: JobListingHasSkillCategoryData[] = [];

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

interface JobListingData {
  job_listing_id: string;
  employer_id: string;
  job_title: string;
  position_loc: JobListingPositionLoc;
  salary_range: string;
  region: string;
}
async function fetchJobListingDependencies(): Promise<EmployerData[]> {
  return prisma.employer.findMany();
}
function generateJobListingData(employerId: string): JobListingData {
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

async function createJobListing(employerId: string): Promise<JobListingData> {
  const jobListingData: JobListingData = generateJobListingData(employerId);
  const jobListing: JobListingData = await prisma.jobListing.create({
    data: jobListingData,
  });
  // console.log(`JobListing record created with ID: ${jobListing.job_listing_id}`);
  return jobListingData;
}

async function seedJobListings(): Promise<JobListingData[]> {
  console.log('Seeding Job Listings...');
  //TODO: seed two unique job listings for each employer
  const employers: EmployerData[] = await fetchJobListingDependencies();
  const createdJobListings: JobListingData[] = [];
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

async function createEdInstitution(): Promise<EdInstitutionData> {
  // Generate a single EdInstitution entry
  const edInstitutionData: EdInstitutionData = generateEdInstitutionData();

  // Create EdInstitution entry in the database
  const edInstitution: EdInstitutionData = await prisma.edInstitution.create({
    data: edInstitutionData,
  });
  // console.log(`EdInstitution record created with ID: ${edInstitution.edInstitutionId}`);
  return edInstitution;
}

async function seedEdInstitutions(): Promise<EdInstitutionData[]> {
  console.log('Seeding Edu Institutions...');
  const createdEdInstitutions: EdInstitutionData[] = [];
  for (let i = 0; i < NUM_ED_INSTITUTIONS; i++) {
    createdEdInstitutions.push(await createEdInstitution());
  }
  console.log(`\t Seeded ${createdEdInstitutions.length} records for Ed Institutions table.`);
  return createdEdInstitutions;
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
  // console.log(`MentorHasSkill record created with ID: ${mentorSkillData.mentor_has_skill_id}`);
  return mentorSkillData;
}

async function fetchMentorSkillDependencies() {
  const mentors: MentorData[] = await prisma.mentor.findMany();
  const skillCategories: SkillCategoryData[] = await prisma.skill_category.findMany();
  return { mentors, skillCategories };
}

async function seedMentorSkills(): Promise<MentorHasSkillData[]> {
  console.log('Seeding Mentor Skills...');
  const { mentors, skillCategories } = await fetchMentorSkillDependencies();
  const createdMentorSkills: MentorHasSkillData[] = [];
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

interface EmployerData {
  employerId: string;
  user_id: string;
  title: string;
  home_office_location: string | null;
  employer_url: string | null;
  logo_url: string | null;
}

async function fetchEmployerDependencies(): Promise<UserData[]> {
  return prisma.user.findMany();
}
function generateEmployerData(userId: string): EmployerData {
  return {
    employerId: faker.string.uuid(),
    user_id: userId,
    title: faker.company.name(),
    home_office_location: faker.location.city() + ', WA',
    employer_url: faker.internet.url(),
    logo_url: faker.image.urlPicsumPhotos({ width: 480, height: 480 }),
  };
}

async function createEmployer(userId: string): Promise<EmployerData> {
  const employerData: EmployerData = generateEmployerData(userId);

  const employer: EmployerData = await prisma.employer.create({
    data: employerData,
  });
  // console.log(`Employer record created with ID: ${employer.employerId} for User ID: ${userId}`);
  return employer;
}

async function seedEmployers(): Promise<EmployerData[]> {
  console.log('Seeding Employers...');
  const users: UserData[] = await fetchEmployerDependencies();
  const employerUsers: UserData[] = users.slice(NUM_LEARNERS, NUM_LEARNERS + NUM_EMPLOYERS);
  const createdEmployers: EmployerData[] = [];
  for (let i = 0; i < employerUsers.length; i++) {
    createdEmployers.push(await createEmployer(employerUsers[i].userId));
  }
  console.log(`\tSeeded ${createdEmployers.length} records for Employers table.`);
  return createdEmployers;
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
  const mentorData: MentorData = generateMentorData(userId);
  await prisma.mentor.create({
    data: mentorData,
  });
  // console.log(`Mentor record created for User ID: ${userId}`);
  return mentorData;
}

async function fetchMentorDependencies() {
  const users: UserData[] = await prisma.user.findMany();
  return users;
}

async function seedMentors(): Promise<MentorData[]> {
  console.log('Seeding Mentors...');
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
  console.log('Seeding Users...');
  for (let i = 0; i < NUM_USERS; i++) {
    await createUser();
  }
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
async function main(): Promise<void> {
  console.log('Seeding started...');

  // Seed Users
  await seedUser();

  // Seed Skill Categories and Skills
  const skillCategories = await seedSkillCategories();

  await seedSkillData();

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
