import { notFound } from "next/navigation";
import { isValidStep, TOTAL_STEPS } from "@/lib/steps";
import { ScorecardStepForm } from "@/components/ScorecardStepForm";
import { ScorecardOverviewForm } from "@/components/ScorecardOverviewForm";

interface PageProps {
  params: Promise<{ stepNumber: string }>;
}

export default async function StepPage({ params }: PageProps) {
  const { stepNumber } = await params;
  const n = Number(stepNumber);

  if (!Number.isInteger(n) || !isValidStep(n)) {
    notFound();
  }

  // The final step is the free-text overview rather than scored questions.
  if (n === TOTAL_STEPS) {
    return <ScorecardOverviewForm />;
  }

  return <ScorecardStepForm stepNumber={n} />;
}
