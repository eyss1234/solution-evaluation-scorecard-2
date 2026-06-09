"use client";

import { useEffect, useRef } from "react";
import { useScorecard } from "@/contexts/ScorecardContext";

const AUTOSAVE_DELAY_MS = 800;

/**
 * Best-effort background autosave for scores.
 *
 * Lives inside the always-mounted stepper shell, so its debounce timer survives
 * navigation between steps (and via the sidebar) — a pending save still fires
 * after you leave a step, closing the gap where in-memory scores were lost on
 * reload because only "Next" persisted them. The whole score set is sent on
 * each save (idempotent upserts), so there is no per-step coordination to get
 * wrong. "Next" still performs its own explicit, awaited save before navigating.
 */
export function ScorecardAutosave() {
  const { runId, scores } = useScorecard();
  // Skip the initial run: these scores were just loaded from the database.
  const isInitial = useRef(true);

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const payload = {
        scores: Object.entries(scores).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      };
      fetch(`/api/scorecard/${runId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((error) => {
        console.error("Scorecard autosave failed:", error);
      });
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [scores, runId]);

  return null;
}
