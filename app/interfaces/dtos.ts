interface JobListingWithSkillsAndCompany {
  job_listing_id: string;
  job_title: string;
  position_loc: 'hybrid' | 'on_site' | 'remote';
  salary_range: string;
  region: string;
  employer: {
    title: string;
  };
  jobListingSkillCategories: Array<{
    skill_category: {
      category_name: string;
    };
  }>;
}
