/**
 * data/places.ts
 *
 * Our "database" for this workshop: a plain TypeScript file.
 * No real database, no external API — so the demo works offline and
 * deploys to Vercel with zero setup.
 *
 * This file is only ever imported by server code (`app/api/places/route.ts`),
 * which means the browser never downloads it.
 */

/**
 * The cities we look up weather for.
 *
 * Several food spots share a city (four are in KL), so we group by city and
 * fetch the weather ONCE per city instead of once per spot. That turns 12
 * upstream API calls into 7 — which matters when you're on a free API tier.
 */
export const CITIES = {
  "kuala-lumpur": { label: "Kuala Lumpur", lat: 3.139, lon: 101.6869 },
  "petaling-jaya": { label: "Petaling Jaya", lat: 3.1073, lon: 101.6067 },
  "kajang": { label: "Kajang", lat: 2.9935, lon: 101.7874 },
  "kuala-selangor": { label: "Kuala Selangor", lat: 3.3411, lon: 101.2493 },
  "klang": { label: "Klang", lat: 3.0449, lon: 101.4455 },
  "george-town": { label: "George Town", lat: 5.4141, lon: 100.3288 },
  "melaka": { label: "Melaka", lat: 2.1896, lon: 102.2501 },
} as const;

export type CityKey = keyof typeof CITIES;

/** The shape of a single food spot. */
export type Place = {
  id: string;
  name: string;
  /** Neighbourhood + state, e.g. "Klang, Selangor" */
  area: string;
  /** Which city we fetch live weather for. See CITIES above. */
  city: CityKey;
  cuisine: Cuisine;
  /** What people actually queue up for. */
  signatureDish: string;
  /** Out of 5. */
  rating: number;
  priceRange: "$" | "$$" | "$$$";
  emoji: string;
  blurb: string;
};

/**
 * Live weather for a city, trimmed to what a card needs.
 *
 * This type lives here (and not in lib/weather.ts) because the /dashboard
 * Client Component needs it. lib/weather.ts holds the API key, so nothing
 * that runs in the browser should import from it at all.
 */
export type Weather = {
  tempC: number;
  condition: string;
  emoji: string;
  isDay: boolean;
};

/** A food spot as /api/places returns it: our data plus live weather. */
export type PlaceWithWeather = Place & { weather: Weather | null };

/**
 * The cuisines we support filtering by.
 * `as const` keeps the exact strings in the type instead of widening to `string`,
 * so a typo like "Malayy" becomes a build error.
 */
export const CUISINES = [
  "Malay",
  "Chinese",
  "Indian",
  "Mamak",
  "Nyonya",
  "Dessert",
] as const;

export type Cuisine = (typeof CUISINES)[number];

/** Twelve mocked food spots. Ratings and blurbs are made up for the demo. */
export const places: Place[] = [
  {
    id: "nasi-lemak-antarabangsa",
    name: "Nasi Lemak Antarabangsa",
    area: "Kampung Baru, Kuala Lumpur",
    city: "kuala-lumpur",
    cuisine: "Malay",
    signatureDish: "Nasi Lemak Ayam Rendang",
    rating: 4.7,
    priceRange: "$",
    emoji: "🍚",
    blurb: "Late-night institution. Pick your lauk from the tray and eat standing up.",
  },
  {
    id: "village-park",
    name: "Village Park Restaurant",
    area: "Damansara Uptown, Petaling Jaya",
    city: "petaling-jaya",
    cuisine: "Malay",
    signatureDish: "Nasi Lemak Ayam Goreng",
    rating: 4.7,
    priceRange: "$$",
    emoji: "🍗",
    blurb: "The fried chicken everyone argues about. Come before noon or queue.",
  },
  {
    id: "satay-kajang-haji-samuri",
    name: "Satay Kajang Haji Samuri",
    area: "Kajang, Selangor",
    city: "kajang",
    cuisine: "Malay",
    signatureDish: "Satay Daging & Ayam",
    rating: 4.5,
    priceRange: "$$",
    emoji: "🍢",
    blurb: "Charcoal-grilled skewers with peanut sauce thick enough to stand a stick in.",
  },
  {
    id: "warung-ikan-bakar-muara",
    name: "Warung Ikan Bakar Muara",
    area: "Kuala Selangor, Selangor",
    city: "kuala-selangor",
    cuisine: "Malay",
    signatureDish: "Ikan Pari Bakar",
    rating: 4.3,
    priceRange: "$$",
    emoji: "🐟",
    blurb: "Banana-leaf grilled stingray by the river. Go at sunset.",
  },
  {
    id: "seng-huat-bak-kut-teh",
    name: "Seng Huat Bak Kut Teh",
    area: "Klang, Selangor",
    city: "klang",
    cuisine: "Chinese",
    signatureDish: "Dry Bak Kut Teh",
    rating: 4.6,
    priceRange: "$$",
    emoji: "🍲",
    blurb: "Under the Klang bridge. Herbal broth, or the dry version with dried chilli.",
  },
  {
    id: "lorong-selamat-ckt",
    name: "Lorong Selamat Char Kway Teow",
    area: "George Town, Penang",
    city: "george-town",
    cuisine: "Chinese",
    signatureDish: "Char Kway Teow",
    rating: 4.8,
    priceRange: "$$",
    emoji: "🍜",
    blurb: "Big prawns, serious wok hei, and a famously no-nonsense auntie.",
  },
  {
    id: "kim-lian-kee",
    name: "Kim Lian Kee Hokkien Mee",
    area: "Petaling Street, Kuala Lumpur",
    city: "kuala-lumpur",
    cuisine: "Chinese",
    signatureDish: "Hokkien Mee",
    rating: 4.4,
    priceRange: "$$",
    emoji: "🍝",
    blurb: "Thick noodles braised black in dark soy with crispy pork lard on top.",
  },
  {
    id: "yut-kee",
    name: "Restoran Yut Kee",
    area: "Jalan Kamunting, Kuala Lumpur",
    city: "kuala-lumpur",
    cuisine: "Chinese",
    signatureDish: "Hainanese Chicken Chop",
    rating: 4.5,
    priceRange: "$$",
    emoji: "🍴",
    blurb: "Hainanese kopitiam classics since 1928. Order the roti babi too.",
  },
  {
    id: "nasi-kandar-pelita",
    name: "Restoran Nasi Kandar Pelita",
    area: "Jalan Ampang, Kuala Lumpur",
    city: "kuala-lumpur",
    cuisine: "Indian",
    signatureDish: "Nasi Kandar Campur",
    rating: 4.4,
    priceRange: "$$",
    emoji: "🍛",
    blurb: "Open 24 hours. Ask for kuah campur — a bit of every curry.",
  },
  {
    id: "valentine-roti",
    name: "Valentine Roti",
    area: "Jalan Semarak, Kuala Lumpur",
    city: "kuala-lumpur",
    cuisine: "Mamak",
    signatureDish: "Roti Canai Banjir",
    rating: 4.5,
    priceRange: "$",
    emoji: "🫓",
    blurb: "Flaky roti flooded with dhal and curry, served from 6am.",
  },
  {
    id: "donald-and-lily",
    name: "Donald & Lily's",
    area: "Melaka",
    city: "melaka",
    cuisine: "Nyonya",
    signatureDish: "Nyonya Laksa",
    rating: 4.6,
    priceRange: "$$",
    emoji: "🥥",
    blurb: "Family-run Peranakan cooking. Coconut-rich laksa and cendol to finish.",
  },
  {
    id: "penang-road-chendul",
    name: "Penang Road Famous Teochew Chendul",
    area: "George Town, Penang",
    city: "george-town",
    cuisine: "Dessert",
    signatureDish: "Cendol with Gula Melaka",
    rating: 4.4,
    priceRange: "$",
    emoji: "🍧",
    blurb: "Shaved ice, pandan jelly, and palm sugar. The queue moves fast.",
  },
];
