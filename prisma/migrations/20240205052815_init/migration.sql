-- CreateTable
CREATE TABLE `edu_institution` (
    `edu_institution_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NULL,
    `address` VARCHAR(255) NOT NULL,
    `contact_email` VARCHAR(255) NOT NULL,
    `edu_url` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `edu_institution_id_UNIQUE`(`edu_institution_id`),
    PRIMARY KEY (`edu_institution_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employer` (
    `employer_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `home_office_location` VARCHAR(255) NULL,
    `employer_url` VARCHAR(255) NULL,
    `logo_url` VARCHAR(255) NULL,

    UNIQUE INDEX `employer_id_UNIQUE`(`employer_id`),
    INDEX `fk_employer_user1_idx`(`user_id`),
    PRIMARY KEY (`employer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_listing` (
    `job_listing_id` CHAR(36) NOT NULL,
    `employer_id` CHAR(36) NOT NULL,
    `position_loc` ENUM('onSite', 'remote', 'hybrid') NOT NULL,
    `salary_range` VARCHAR(45) NOT NULL,
    `region` VARCHAR(45) NOT NULL,

    UNIQUE INDEX `job_listing_id_UNIQUE`(`job_listing_id`),
    INDEX `fk_job_listing_employer1_idx`(`employer_id`),
    PRIMARY KEY (`job_listing_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_listing_has_skill_category` (
    `job_listing_has_skill_category_id` CHAR(36) NOT NULL,
    `job_listing_id` CHAR(36) NOT NULL,
    `skill_category_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `job_listing_has_skill_category_id_UNIQUE`(`job_listing_has_skill_category_id`),
    INDEX `fk_job_listing_has_skill_category_job_listing1_idx`(`job_listing_id`),
    INDEX `fk_job_listing_has_skill_category_skill_category1_idx`(`skill_category_id`),
    PRIMARY KEY (`job_listing_has_skill_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `learner` (
    `learner_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `is_enrolled_college` TINYINT NOT NULL,
    `edu_institution_id` CHAR(36) NULL,
    `degree_type` VARCHAR(45) NOT NULL,
    `intern_hours_required` TINYINT NOT NULL,
    `major` VARCHAR(45) NULL,
    `minor` VARCHAR(45) NULL,

    UNIQUE INDEX `learner_id_UNIQUE`(`learner_id`),
    INDEX `fk_learner_edu_institution1_idx`(`edu_institution_id`),
    INDEX `fk_learner_user1_idx`(`user_id`),
    PRIMARY KEY (`learner_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `learner_private_data` (
    `learner_private_data_id` CHAR(36) NOT NULL,
    `learner_id` CHAR(36) NOT NULL,
    `ssn` VARCHAR(255) NULL,

    UNIQUE INDEX `learner_private_data_id_UNIQUE`(`learner_private_data_id`),
    INDEX `fk_user_learner_private_data_user1`(`learner_id`),
    PRIMARY KEY (`learner_private_data_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `learner_proj_based_tech_assessment` (
    `learner_proj_based_tech_assessment_id` CHAR(36) NOT NULL,
    `learner_id` CHAR(36) NOT NULL,
    `proj_based_tech_assessment_id` CHAR(36) NOT NULL,
    `attempt_date` DATE NOT NULL,
    `has_passed` TINYINT NOT NULL,

    UNIQUE INDEX `learner_proj_based_tech_assessment_id_UNIQUE`(`learner_proj_based_tech_assessment_id`),
    INDEX `fk_user_has_proj_based_tech_assessment_proj_based_tech_as_idx`(`proj_based_tech_assessment_id`),
    INDEX `fk_user_has_proj_based_tech_assessment_user1_idx`(`learner_id`),
    PRIMARY KEY (`learner_proj_based_tech_assessment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `learner_skill_gap_data` (
    `learner_skill_gap_data_id` CHAR(36) NOT NULL,
    `learner_id` CHAR(36) NOT NULL,
    `skill_category_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `learner_skill_gap_data_id_UNIQUE`(`learner_skill_gap_data_id`),
    INDEX `fk_learner_skill_gap_data_learner1`(`learner_id`),
    INDEX `fk_learner_skill_gap_data_skill_category1_idx`(`skill_category_id`),
    PRIMARY KEY (`learner_skill_gap_data_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mentor` (
    `mentor_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `mentor_id_UNIQUE`(`mentor_id`),
    INDEX `fk_mentor_user1_idx`(`user_id`),
    PRIMARY KEY (`mentor_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mentor_has_skill` (
    `mentor_has_skill_id` CHAR(36) NOT NULL,
    `skill_category_skill_category_id` CHAR(36) NOT NULL,
    `mentor_mentor_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `mentor_has_skill_id_UNIQUE`(`mentor_has_skill_id`),
    INDEX `fk_skill_category_has_mentor_mentor1_idx`(`mentor_mentor_id`),
    INDEX `fk_skill_category_has_mentor_skill_category1_idx`(`skill_category_skill_category_id`),
    PRIMARY KEY (`mentor_has_skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proj_based_tech_assessment` (
    `proj_based_tech_assessment_id` CHAR(36) NOT NULL,
    `skill_category_id` CHAR(36) NOT NULL,
    `url` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `proj_based_tech_assessment_id_UNIQUE`(`proj_based_tech_assessment_id`),
    INDEX `fk_proj_based_tech_assessment_skill_category1_idx`(`skill_category_id`),
    PRIMARY KEY (`proj_based_tech_assessment_id`, `skill_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sa_possible_answer` (
    `sa_possible_answer_id` CHAR(36) NOT NULL,
    `sa_question_id` CHAR(36) NOT NULL,
    `answer_text` VARCHAR(255) NULL,

    UNIQUE INDEX `sa_possible_answer_id_UNIQUE`(`sa_possible_answer_id`),
    INDEX `fk_sa_possible_answer_sa_question1_idx`(`sa_question_id`),
    PRIMARY KEY (`sa_possible_answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sa_question` (
    `sa_question_id` CHAR(36) NOT NULL,
    `self_assessment_id` CHAR(36) NOT NULL,
    `sa_question_text` VARCHAR(255) NOT NULL,
    `question_type` ENUM('interest', 'competency') NOT NULL,
    `correct_answer_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `sa_question_id_UNIQUE`(`sa_question_id`),
    INDEX `fk_sa_question_self_assessment1_idx`(`self_assessment_id`),
    PRIMARY KEY (`sa_question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `self_assessment` (
    `self_assessment_id` CHAR(36) NOT NULL,
    `skill_category_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `self_assessment_id_UNIQUE`(`self_assessment_id`),
    INDEX `fk_self_assessment_skill_category1`(`skill_category_id`),
    PRIMARY KEY (`self_assessment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill` (
    `skill_id` CHAR(36) NOT NULL,
    `skill_category_id` CHAR(36) NOT NULL,
    `skill_name` VARCHAR(45) NOT NULL,
    `skill_description` VARCHAR(45) NOT NULL,

    UNIQUE INDEX `skill_id_UNIQUE`(`skill_id`),
    INDEX `fk_skill_skill_category_idx`(`skill_category_id`),
    PRIMARY KEY (`skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill_category` (
    `skill_category_id` CHAR(36) NOT NULL,
    `category_name` VARCHAR(255) NOT NULL,
    `category_description` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `skill_category_id_UNIQUE`(`skill_category_id`),
    PRIMARY KEY (`skill_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `training_program` (
    `training_programs_id` CHAR(36) NOT NULL,
    `training_provider_id` CHAR(36) NOT NULL,
    `skill_category_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `training_program_id_UNIQUE`(`training_programs_id`),
    INDEX `fk_training_program_skill_category1_idx`(`skill_category_id`),
    INDEX `fk_training_program_training_provider1_idx`(`training_provider_id`),
    PRIMARY KEY (`training_programs_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `training_provider` (
    `training_provider_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `edu_institution_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `training_provider_id_UNIQUE`(`training_provider_id`),
    INDEX `fk_training_provider_edu_institution1_idx`(`edu_institution_id`),
    INDEX `fk_training_provider_user1_idx`(`user_id`),
    PRIMARY KEY (`training_provider_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `user_id` CHAR(36) NOT NULL,
    `user_name` VARCHAR(45) NOT NULL,
    `password` VARCHAR(45) NOT NULL,
    `email` VARCHAR(45) NOT NULL,

    UNIQUE INDEX `user_id_UNIQUE`(`user_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employer` ADD CONSTRAINT `fk_employer_user1` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `job_listing` ADD CONSTRAINT `fk_job_listing_employer1` FOREIGN KEY (`employer_id`) REFERENCES `employer`(`employer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `job_listing_has_skill_category` ADD CONSTRAINT `fk_job_listing_has_skill_category_job_listing1` FOREIGN KEY (`job_listing_id`) REFERENCES `job_listing`(`job_listing_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `job_listing_has_skill_category` ADD CONSTRAINT `fk_job_listing_has_skill_category_skill_category1` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_category`(`skill_category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `learner` ADD CONSTRAINT `fk_learner_edu_institution1` FOREIGN KEY (`edu_institution_id`) REFERENCES `edu_institution`(`edu_institution_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `learner` ADD CONSTRAINT `fk_learner_user1` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `learner_private_data` ADD CONSTRAINT `fk_user_learner_private_data_user1` FOREIGN KEY (`learner_id`) REFERENCES `learner`(`learner_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `learner_proj_based_tech_assessment` ADD CONSTRAINT `fk_user_has_proj_based_tech_assessment_proj_based_tech_asse1` FOREIGN KEY (`proj_based_tech_assessment_id`) REFERENCES `proj_based_tech_assessment`(`proj_based_tech_assessment_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `learner_proj_based_tech_assessment` ADD CONSTRAINT `fk_user_has_proj_based_tech_assessment_user1` FOREIGN KEY (`learner_id`) REFERENCES `learner`(`learner_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `learner_skill_gap_data` ADD CONSTRAINT `fk_learner_skill_gap_data_learner1` FOREIGN KEY (`learner_id`) REFERENCES `learner`(`learner_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `learner_skill_gap_data` ADD CONSTRAINT `fk_learner_skill_gap_data_skill_category1` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_category`(`skill_category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mentor` ADD CONSTRAINT `fk_mentor_user1` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mentor_has_skill` ADD CONSTRAINT `fk_skill_category_has_mentor_mentor1` FOREIGN KEY (`mentor_mentor_id`) REFERENCES `mentor`(`mentor_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mentor_has_skill` ADD CONSTRAINT `fk_skill_category_has_mentor_skill_category1` FOREIGN KEY (`skill_category_skill_category_id`) REFERENCES `skill_category`(`skill_category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `proj_based_tech_assessment` ADD CONSTRAINT `fk_proj_based_tech_assessment_skill_category1` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_category`(`skill_category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sa_possible_answer` ADD CONSTRAINT `fk_sa_possilbe_answer_sa_question1` FOREIGN KEY (`sa_question_id`) REFERENCES `sa_question`(`sa_question_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sa_question` ADD CONSTRAINT `fk_sa_question_self_assessment` FOREIGN KEY (`self_assessment_id`) REFERENCES `self_assessment`(`self_assessment_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `self_assessment` ADD CONSTRAINT `fk_self_assessment_skill_category1` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_category`(`skill_category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `fk_skill_skill_category` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_category`(`skill_category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `training_program` ADD CONSTRAINT `fk_training_program_training_provider1` FOREIGN KEY (`training_provider_id`) REFERENCES `training_provider`(`training_provider_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `training_program` ADD CONSTRAINT `fk_training_programs_skill_category1` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_category`(`skill_category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `training_provider` ADD CONSTRAINT `fk_training_provider_edu_institution1` FOREIGN KEY (`edu_institution_id`) REFERENCES `edu_institution`(`edu_institution_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `training_provider` ADD CONSTRAINT `fk_training_provider_user1` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
