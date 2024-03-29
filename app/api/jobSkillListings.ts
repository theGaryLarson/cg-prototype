// import type { NextApiRequest, NextApiResponse } from 'next';
// import { prisma } from '@/lib/prisma';
//
// type ResponseData = JobListingWithSkillsAndCompany[] | { error: string };
//
// export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
//   if (req.method === 'GET') {
//     try {
//       const jobListingsWithSkills = await prisma.jobListing.findMany({
//         select: {
//           job_listing_id: true,
//           job_title: true,
//           position_loc: true,
//           salary_range: true,
//           region: true,
//           employer: {
//             select: {
//               title: true,
//             },
//           },
//           jobListingSkillCategories: {
//             select: {
//               skill_category: {
//                 select: {
//                   category_name: true,
//                 },
//               },
//             },
//           },
//         },
//       });
//
//       const processedJobListings: JobListingWithSkillsAndCompany[] = jobListingsWithSkills.map(
//         (listing) => ({
//           job_listing_id: listing.job_listing_id,
//           company: listing.employer.title,
//           job_title: listing.job_title,
//           position_loc: listing.position_loc,
//           salary_range: listing.salary_range,
//           region: listing.region,
//           skill_categories: listing.jobListingSkillCategories
//             .map((jlsc) => jlsc.skill_category.category_name)
//             .join('; '),
//         }),
//       );
//
//       res.status(200).json(processedJobListings);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to fetch job listings.' });
//     }
//   } else {
//     res.setHeader('Allow', ['GET']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
