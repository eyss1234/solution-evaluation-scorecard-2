"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STEPS, TOTAL_STEPS } from "@/lib/steps";
import {
  calculateSectionScore,
  type QuestionScore,
  type SectionScoreResult,
} from "@/domain/scorecard/calculate";

/** The Overview step has no questions; its fields are optional. */
export const OVERVIEW_STEP = TOTAL_STEPS;

export interface ScorecardCriterion {
  score: number;
  description: string;
}

export interface ScorecardQuestionData {
  id: string;
  text: string;
  stepNumber: number;
  order: number;
  weight: number;
  criteria: ScorecardCriterion[];
}

export interface OverviewData {
  pros?: string | null;
  cons?: string | null;
  summary?: string | null;
}

interface ScorecardContextValue {
  runId: string;
  projectId: string;
  questions: ScorecardQuestionData[];
  scores: Record<string, number>;
  stepComments: Record<number, string>;
  overview: OverviewData;
  setScore: (questionId: string, value: number) => void;
  setStepComment: (stepNumber: number, comment: string) => void;
  setOverview: (patch: Partial<OverviewData>) => void;
  /** True when every question in the step is answered (Overview is always complete). */
  isStepComplete: (stepNumber: number) => boolean;
  /** True when some — but not all — of the step's questions are answered. */
  isStepPartiallyComplete: (stepNumber: number) => boolean;
  getStepQuestions: (stepNumber: number) => ScorecardQuestionData[];
  getStepScore: (stepNumber: number) => SectionScoreResult;
}

const ScorecardContext = createContext<ScorecardContextValue | null>(null);

const SECTION_WEIGHT_BY_STEP = new Map(STEPS.map((s) => [s.number, s.sectionWeight]));

interface ScorecardProviderProps {
  runId: string;
  projectId: string;
  questions: ScorecardQuestionData[];
  initialScores?: Record<string, number>;
  initialStepComments?: Record<number, string>;
  initialOverview?: OverviewData;
  children: ReactNode;
}

export function ScorecardProvider({
  runId,
  projectId,
  questions,
  initialScores,
  initialStepComments,
  initialOverview,
  children,
}: ScorecardProviderProps) {
  const [scores, setScores] = useState<Record<string, number>>(
    initialScores ?? {},
  );
  const [stepComments, setStepComments] = useState<Record<number, string>>(
    initialStepComments ?? {},
  );
  const [overview, setOverviewState] = useState<OverviewData>(
    initialOverview ?? {},
  );

  const questionsByStep = useMemo(() => {
    const map = new Map<number, ScorecardQuestionData[]>();
    for (const question of questions) {
      const group = map.get(question.stepNumber) ?? [];
      group.push(question);
      map.set(question.stepNumber, group);
    }
    for (const group of map.values()) {
      group.sort((a, b) => a.order - b.order);
    }
    return map;
  }, [questions]);

  const setScore = useCallback((questionId: string, value: number) => {
    setScores((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const setStepComment = useCallback((stepNumber: number, comment: string) => {
    setStepComments((prev) => ({ ...prev, [stepNumber]: comment }));
  }, []);

  const setOverview = useCallback((patch: Partial<OverviewData>) => {
    setOverviewState((prev) => ({ ...prev, ...patch }));
  }, []);

  const getStepQuestions = useCallback(
    (stepNumber: number) => questionsByStep.get(stepNumber) ?? [],
    [questionsByStep],
  );

  const isStepComplete = useCallback(
    (stepNumber: number) => {
      if (stepNumber === OVERVIEW_STEP) return true;
      const stepQuestions = questionsByStep.get(stepNumber) ?? [];
      if (stepQuestions.length === 0) return true;
      return stepQuestions.every((q) => scores[q.id] !== undefined);
    },
    [questionsByStep, scores],
  );

  const isStepPartiallyComplete = useCallback(
    (stepNumber: number) => {
      if (stepNumber === OVERVIEW_STEP) return false;
      const stepQuestions = questionsByStep.get(stepNumber) ?? [];
      if (stepQuestions.length === 0) return false;
      const answered = stepQuestions.filter(
        (q) => scores[q.id] !== undefined,
      ).length;
      return answered > 0 && answered < stepQuestions.length;
    },
    [questionsByStep, scores],
  );

  const getStepScore = useCallback(
    (stepNumber: number): SectionScoreResult => {
      const stepQuestions = questionsByStep.get(stepNumber) ?? [];
      const sectionWeight = SECTION_WEIGHT_BY_STEP.get(stepNumber) ?? 0;
      const questionScores: QuestionScore[] = stepQuestions.map((q) => ({
        questionId: q.id,
        stepNumber,
        value: scores[q.id] ?? 0,
        weight: q.weight,
      }));
      return calculateSectionScore(questionScores, sectionWeight);
    },
    [questionsByStep, scores],
  );

  const value = useMemo<ScorecardContextValue>(
    () => ({
      runId,
      projectId,
      questions,
      scores,
      stepComments,
      overview,
      setScore,
      setStepComment,
      setOverview,
      isStepComplete,
      isStepPartiallyComplete,
      getStepQuestions,
      getStepScore,
    }),
    [
      runId,
      projectId,
      questions,
      scores,
      stepComments,
      overview,
      setScore,
      setStepComment,
      setOverview,
      isStepComplete,
      isStepPartiallyComplete,
      getStepQuestions,
      getStepScore,
    ],
  );

  return (
    <ScorecardContext.Provider value={value}>
      {children}
    </ScorecardContext.Provider>
  );
}

export function useScorecard(): ScorecardContextValue {
  const ctx = useContext(ScorecardContext);
  if (!ctx) {
    throw new Error("useScorecard must be used within a ScorecardProvider");
  }
  return ctx;
}
