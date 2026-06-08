import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const gateQuestions = [
  { order: 1, text: "Is the project aligned with strategic objectives?" },
  { order: 2, text: "Is there a named executive sponsor?" },
  { order: 3, text: "Is the required budget approved?" },
  { order: 4, text: "Are the key risks understood and acceptable?" },
];

const scorecardQuestions = [
  {
    stepNumber: 1,
    order: 1,
    text: "Degree of alignment with business strategy",
    weight: 1.5,
    criteria: ["No alignment", "Weak", "Partial", "Good", "Strong", "Fully aligned"],
  },
  {
    stepNumber: 1,
    order: 2,
    text: "Expected impact on customers",
    weight: 1.0,
    criteria: ["None", "Minimal", "Low", "Moderate", "High", "Transformational"],
  },
  {
    stepNumber: 2,
    order: 1,
    text: "Technical feasibility",
    weight: 1.0,
    criteria: ["Infeasible", "Very hard", "Hard", "Feasible", "Straightforward", "Trivial"],
  },
  {
    stepNumber: 2,
    order: 2,
    text: "Team capability and capacity",
    weight: 1.0,
    criteria: ["None", "Limited", "Some", "Adequate", "Strong", "Expert"],
  },
];

async function main() {
  await Promise.all(
    gateQuestions.map((q) =>
      prisma.gateQuestion.upsert({
        where: { order: q.order },
        update: { text: q.text },
        create: q,
      }),
    ),
  );

  await Promise.all(
    scorecardQuestions.map((q) =>
      prisma.scorecardQuestion.upsert({
        where: { stepNumber_order: { stepNumber: q.stepNumber, order: q.order } },
        update: { text: q.text, weight: q.weight, criteria: q.criteria },
        create: q,
      }),
    ),
  );

  const project = await prisma.project.create({
    data: {
      name: "Sample Project",
      financialSettings: { create: { currency: "GBP" } },
    },
  });

  console.log(
    `Seeded ${gateQuestions.length} gate questions, ${scorecardQuestions.length} scorecard questions, and project "${project.name}".`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
