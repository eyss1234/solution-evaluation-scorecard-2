import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const criteriaData = [
    { name: "Cost", description: "Total cost of ownership", weight: 0.3 },
    { name: "Scalability", description: "Ability to grow with demand", weight: 0.25 },
    { name: "Ease of Use", description: "Developer and end-user experience", weight: 0.25 },
    { name: "Security", description: "Risk posture and compliance", weight: 0.2 },
  ];

  const criteria = await Promise.all(
    criteriaData.map((c) =>
      prisma.criterion.upsert({
        where: { name: c.name },
        update: { description: c.description, weight: c.weight },
        create: c,
      }),
    ),
  );

  const solutionsData = [
    {
      name: "Managed Cloud Platform",
      description: "Fully managed PaaS offering",
      scores: [8, 9, 7, 8],
    },
    {
      name: "Self-Hosted Cluster",
      description: "In-house Kubernetes deployment",
      scores: [6, 8, 4, 9],
    },
  ];

  for (const sol of solutionsData) {
    const solution = await prisma.solution.create({
      data: { name: sol.name, description: sol.description },
    });

    await Promise.all(
      criteria.map((criterion, i) =>
        prisma.score.create({
          data: {
            solutionId: solution.id,
            criterionId: criterion.id,
            value: sol.scores[i] ?? 0,
          },
        }),
      ),
    );
  }

  console.log("Seeded", criteria.length, "criteria and", solutionsData.length, "solutions.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
