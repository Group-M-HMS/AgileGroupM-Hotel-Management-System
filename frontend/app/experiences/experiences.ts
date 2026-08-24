// Type source for the Experiences page (NIBM2-527/528/529). Actual data comes
// from room-service's public GET /api/experiences (see api.ts) — this file no
// longer holds mock data, following the same pattern as search-results/mockRooms.ts.

export type Difficulty = "Easy" | "Moderate" | "Challenging";

export type Experience = {
  id: string;
  title: string;
  category: string;
  image: string;
  duration: string;
  difficulty: Difficulty;
  /** Short blurb shown on the card. */
  summary: string;
  /** Fuller description shown in the details modal. */
  description: string;
};
