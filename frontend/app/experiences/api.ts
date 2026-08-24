import type { Experience } from "./experiences";

const ROOM_SERVICE_URL =
  process.env.NEXT_PUBLIC_ROOM_SERVICE_URL ?? "http://localhost:8081";

type ApiCategory = "RAINFOREST" | "ADVENTURE" | "RIVER" | "WELLNESS";
type ApiDifficulty = "EASY" | "MODERATE" | "HARD" | "EXPERT";

interface PublicExperienceDto {
  id: number;
  title: string;
  shortDescription: string | null;
  longDescription: string | null;
  price: number;
  imageUrl: string | null;
  durationHours: number;
  category: ApiCategory;
  difficulty: ApiDifficulty;
}

const CATEGORY_LABELS: Record<ApiCategory, string> = {
  RAINFOREST: "Rainforest",
  ADVENTURE: "Adventure",
  RIVER: "River",
  WELLNESS: "Wellness",
};

// Backend has EASY/MODERATE/HARD/EXPERT; this page collapses HARD+EXPERT into
// "Challenging", same as the admin console's experiences client.
function difficultyFromApi(value: ApiDifficulty): Experience["difficulty"] {
  if (value === "EASY") return "Easy";
  if (value === "MODERATE") return "Moderate";
  return "Challenging";
}

function toExperience(dto: PublicExperienceDto): Experience {
  return {
    id: String(dto.id),
    title: dto.title,
    category: CATEGORY_LABELS[dto.category] ?? dto.category,
    image: dto.imageUrl ?? "",
    duration: `${dto.durationHours} ${dto.durationHours === 1 ? "hour" : "hours"}`,
    difficulty: difficultyFromApi(dto.difficulty),
    summary: dto.shortDescription ?? "",
    description: dto.longDescription ?? dto.shortDescription ?? "",
  };
}

/** Fetches the active experience catalog from room-service. Returns an empty
 * list on any failure so the page can still render (no experiences yet, or
 * the service is briefly unreachable) rather than throwing. */
export async function fetchExperiences(): Promise<Experience[]> {
  try {
    const response = await fetch(`${ROOM_SERVICE_URL}/api/experiences`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const envelope: { success: boolean; data: PublicExperienceDto[] } =
      await response.json();
    return (envelope.data ?? []).map(toExperience);
  } catch {
    return [];
  }
}
