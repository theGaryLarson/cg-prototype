import prisma from '@/lib/prisma';

async function getJobListingsWithSkills() {
  return prisma.jobListing.findMany({
    select: {
      job_listing_id: true,
      job_title: true,
      position_loc: true,
      salary_range: true,
      region: true,
      employer: {
        select: {
          title: true,
        },
      },
      jobListingSkillCategories: {
        select: {
          skill_category: {
            select: {
              category_name: true,
            },
          },
        },
      },
    },
  });
}

export default getJobListingsWithSkills;
