// Activity/tour catalog for the Experiences page (NIBM2-527/528/529).
// Static content for now — no backend service owns experiences yet.

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

export const experiences: Experience[] = [
  {
    id: "jungle-trek",
    title: "Guided Jungle Trek",
    category: "Rainforest",
    image: "/images/experiences/jungle.jpg",
    duration: "3 hours",
    difficulty: "Moderate",
    summary:
      "Follow hidden rainforest trails with an expert local guide, deep into the Kitulgala canopy.",
    description:
      "Set out with a naturalist guide who knows every trail, bird call and medicinal plant in the Kitulgala rainforest. You'll cross streams, climb gentle ridges and pause at viewpoints over the valley, learning how the forest sustains itself — and the community around it. Sturdy footwear recommended.",
  },
  {
    id: "white-water-rafting",
    title: "White-Water Rafting",
    category: "Adventure",
    image:
      "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?q=80&w=1200&auto=format&fit=crop",
    duration: "Half day",
    difficulty: "Challenging",
    summary:
      "Ride the Kelani River's famous grade 2–3 rapids with certified rafting guides.",
    description:
      "Kitulgala is Sri Lanka's white-water capital, and this half-day trip takes you through a string of grade 2–3 rapids on the Kelani River. All safety gear and certified guides are provided, with calmer stretches to catch your breath and take in the gorge. No experience needed, but a reasonable level of fitness helps.",
  },
  {
    id: "river-bathing",
    title: "River Bathing & Rock Pools",
    category: "River",
    image: "/images/experiences/river.jpg",
    duration: "2 hours",
    difficulty: "Easy",
    summary:
      "Cool off in crystal-clear natural pools and gentle rock slides beside the villa.",
    description:
      "A short walk from the hotel, the river opens into a series of clear natural pools and smooth rock slides. Float, swim or simply sit with your feet in the current while the forest hums around you. Ideal for families and a perfect way to spend a warm afternoon.",
  },
  {
    id: "bird-watching",
    title: "Dawn Bird Watching",
    category: "Rainforest",
    image: "/images/experiences/bird.jpg",
    duration: "2 hours",
    difficulty: "Easy",
    summary:
      "Catch the dawn chorus and spot Sri Lanka's endemic rainforest birds.",
    description:
      "The forest is at its most alive at first light. Join our resident birder before sunrise to spot Sri Lankan endemics — from the Layard's parakeet to the spot-winged thrush — with binoculars and a field guide provided. A gentle, mostly flat walk with plenty of pauses.",
  },
  {
    id: "sunrise-yoga",
    title: "Sunrise Yoga & Meditation",
    category: "Wellness",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
    duration: "75 minutes",
    difficulty: "Easy",
    summary:
      "Greet the day with guided yoga and meditation on the riverside deck.",
    description:
      "Begin your morning on our open-air deck above the river with a gentle, all-levels flow followed by guided meditation. The session is led by a certified instructor and timed to the sunrise, with mats and props provided. A calm, grounding start to any day at River Nest.",
  },
  {
    id: "waterfall-tea-trail",
    title: "Waterfall & Tea Trail Hike",
    category: "Adventure",
    image:
      "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=1200&auto=format&fit=crop",
    duration: "Full day",
    difficulty: "Challenging",
    summary:
      "A full-day hike to hidden waterfalls, ending with tea at a working estate.",
    description:
      "This full-day adventure climbs through forest and tea country to a series of secluded waterfalls, with a swim stop at the largest. The trail finishes at a working tea estate for a tasting and a look at how Ceylon tea is made. A packed lunch and refreshments are included; good fitness required.",
  },
];
