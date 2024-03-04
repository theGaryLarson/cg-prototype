'use client';
import React from 'react';

export default function JobSkillListing({
  listing,
}: {
  listing: JobListingWithSkillsAndCompany;
}): React.ReactElement {
  const jobTitle = listing.job_title !== '' ? listing.job_title : 'unknown username';
  return (
    <div>
      <h1>{jobTitle}</h1>
      <h3>{listing.employer.title}</h3>
      <hr />
      <p>Company: {listing.employer.title}</p>
      <p>Salary: {listing.salary_range}</p>
      <p>Region: {listing.region}</p>
      <ul>
        {listing.jobListingSkillCategories.map((skill, index) => (
          <li key={index}>{skill.skill_category.category_name}</li>
        ))}
      </ul>
    </div>
  );
}
