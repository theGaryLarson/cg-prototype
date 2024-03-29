/* Components */
import { Counter } from './components/Counter/Counter';
import JobSkillsCompany from './components/PrismaExample/JobSkillsCompany';
import prisma from '../lib/prisma';
import { User as UserData } from '@prisma/client';
import User from './components/PrismaExample/User';
import ModalTrigger from '@/app/components/ModalTrigger';
import getJobListingsWithSkills from '@/app/api-functions/jobListing/jobListing';
import React from 'react';


export default async function IndexPage(): Promise<React.ReactElement<any, string>> {
  const feed: UserData[] = await prisma.user.findMany();

  const jobListingsWithSkills = await getJobListingsWithSkills();

  return (
    <>
      <Counter />
      <div className="grid grid-cols-1 gap-10 prose w-full">
        {' '}
        {/**/}
        <div>
          <h1>Users</h1>
          {feed.map((user) => (
            <div key={user.userId}>
              <User user={user} />
            </div>
          ))}
        </div>
        <div>
          <h1>Job Listings With Skills</h1>
          {jobListingsWithSkills.map((listing: JobListingWithSkillsAndCompany) => (
            <div key={listing.job_listing_id}>
              <pre className="p-0">{JSON.stringify(listing, null, 2)}</pre>
              <JobSkillsCompany listing={listing} />
            </div>
          ))}
        </div>
        <div>
          <h2>Next Test</h2>
        </div>
      </div>
      <ModalTrigger>
        <p>test</p>
      </ModalTrigger>
    </>
  );
}

export const metadata = {
  title: 'Career Gate',
};
