export interface EvaluationStep {
  number: number;
  name: string;
  description: string;
  sectionWeight: number;
  questionsPerStep: number;
}

export const STEPS: EvaluationStep[] = [
  {
    number: 1,
    name: "Business & Functional Fit",
    description: "Assess alignment with business requirements and functional needs (30% of score)",
    sectionWeight: 30,
    questionsPerStep: 3,
  },
  {
    number: 2,
    name: "Technical & Architectural Fit",
    description: "Evaluate technical compatibility and architectural alignment (20% of score)",
    sectionWeight: 20,
    questionsPerStep: 7,
  },
  {
    number: 3,
    name: "Vendor & Roadmap Assessment",
    description: "Review vendor stability and product roadmap direction (10% of score)",
    sectionWeight: 10,
    questionsPerStep: 4,
  },
  {
    number: 4,
    name: "Delivery Feasibility",
    description: "Analyse implementation risk and delivery confidence (15% of score)",
    sectionWeight: 15,
    questionsPerStep: 4,
  },
  {
    number: 5,
    name: "User Experience & Adoption",
    description: "Measure usability and likelihood of user adoption (10% of score)",
    sectionWeight: 10,
    questionsPerStep: 3,
  },
  {
    number: 6,
    name: "Commercials & Total Cost of Ownership",
    description: "Examine pricing, licensing, and total cost of ownership (15% of score)",
    sectionWeight: 15,
    questionsPerStep: 3,
  },
  {
    number: 7,
    name: "Overview",
    description: "Summary of all evaluation scores and final recommendation",
    sectionWeight: 0,
    questionsPerStep: 0,
  },
];

export const TOTAL_STEPS = STEPS.length;

export function getStep(stepNumber: number): EvaluationStep | undefined {
  return STEPS.find((s) => s.number === stepNumber);
}

export function isValidStep(stepNumber: number): boolean {
  return stepNumber >= 1 && stepNumber <= TOTAL_STEPS;
}
