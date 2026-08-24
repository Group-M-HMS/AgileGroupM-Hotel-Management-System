import type { Experience, ExperienceCategory } from '../types/hotel';
import { roomAdminFetch } from './config';

interface AdminExperienceResponseDto {
  id: number;
  title: string;
  shortDescription: string | null;
  longDescription: string | null;
  price: number;
  imageUrl: string | null;
  durationHours: number;
  category: string;
  difficulty: string;
  active: boolean;
}

const CATEGORY_TO_API: Record<ExperienceCategory, string> = {
  Rainforest: 'RAINFOREST',
  Adventure: 'ADVENTURE',
  River: 'RIVER',
  Wellness: 'WELLNESS',
};
const CATEGORY_FROM_API = Object.fromEntries(
  Object.entries(CATEGORY_TO_API).map(([k, v]) => [v, k])
) as Record<string, ExperienceCategory>;

// Backend has EASY/MODERATE/HARD/EXPERT; frontend collapses HARD+EXPERT into "Challenging".
const DIFFICULTY_TO_API: Record<Experience['difficulty'], string> = {
  Easy: 'EASY',
  Moderate: 'MODERATE',
  Challenging: 'HARD',
};
function difficultyFromApi(value: string): Experience['difficulty'] {
  if (value === 'EASY') return 'Easy';
  if (value === 'MODERATE') return 'Moderate';
  return 'Challenging';
}

function toExperience(dto: AdminExperienceResponseDto): Experience {
  return {
    id: String(dto.id),
    title: dto.title,
    category: CATEGORY_FROM_API[dto.category] ?? 'Rainforest',
    duration: `${dto.durationHours} hours`,
    durationHours: dto.durationHours,
    difficulty: difficultyFromApi(dto.difficulty),
    image: dto.imageUrl ?? '',
    summary: dto.shortDescription ?? '',
    description: dto.longDescription ?? dto.shortDescription ?? '',
    price: dto.price,
    active: dto.active,
  };
}

export async function fetchExperiences(): Promise<Experience[]> {
  const experiences = await roomAdminFetch<AdminExperienceResponseDto[]>('/api/admin/experiences');
  return experiences.map(toExperience);
}

export interface ExperienceFormInput {
  title: string;
  category: ExperienceCategory;
  duration: string;
  difficulty: Experience['difficulty'];
  image: string;
  summary: string;
  description: string;
  price: number;
}

function toRequestBody(input: ExperienceFormInput) {
  const durationHours = parseFloat(input.duration) || 2;
  return {
    title: input.title,
    shortDescription: input.summary,
    longDescription: input.description,
    price: input.price,
    imageUrl: input.image,
    durationHours: Math.round(durationHours),
    category: CATEGORY_TO_API[input.category],
    difficulty: DIFFICULTY_TO_API[input.difficulty],
    active: true,
  };
}

export async function createExperience(input: ExperienceFormInput): Promise<Experience> {
  const dto = await roomAdminFetch<AdminExperienceResponseDto>('/api/admin/experiences', {
    method: 'POST',
    body: JSON.stringify(toRequestBody(input)),
  });
  return toExperience(dto);
}

export async function updateExperience(id: string, input: ExperienceFormInput): Promise<Experience> {
  const dto = await roomAdminFetch<AdminExperienceResponseDto>(`/api/admin/experiences/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toRequestBody(input)),
  });
  return toExperience(dto);
}

export async function deleteExperience(id: string): Promise<void> {
  await roomAdminFetch<void>(`/api/admin/experiences/${id}`, { method: 'DELETE' });
}
