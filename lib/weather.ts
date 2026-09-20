import { CITIES, type CityKey, type Weather } from "@/data/places";
import { getMakanApiSecret } from "@/lib/server-env";

/**
 * lib/weather.ts — SERVER-ONLY. Talks to weatherapi.com.
 *
 * ⚠️ Never import this from a Client Component. The API key lives here.
 *
 * This is the part of the workshop with real stakes: MAKAN_API_SECRET is an
 * actual credential now. If it ended up in the browser bundle, a stranger
 * could read it with View Source and spend your monthly quota. That's why the
 * browser calls OUR /api/places instead of calling weatherapi.com directly.
 */

/** What the route handler gets back. */
export type WeatherLookup = {
  /** false when the upstream call failed — places still render without weather. */
  ok: boolean;
  /** Short human-readable reason, shown on the dashboard when ok is false. */
  reason: string | null;
  byCity: Partial<Record<CityKey, Weather>>;
};

/** Thrown when the key isn't configured at all. The route turns this into a 500. */
export class MissingApiKeyError extends Error {}

/**
 * weatherapi.com's condition codes → an emoji.
 * Full list: https://www.weatherapi.com/docs/weather_conditions.json
 */
function conditionEmoji(code: number, isDay: boolean): string {
  if (code === 1000) return isDay ? "☀️" : "🌙";
  if (code === 1003) return isDay ? "⛅" : "☁️";
  if (code === 1006 || code === 1009) return "☁️";
  // Mist, haze and fog. 1036 (smoky haze) shows up in Malaysia a lot.
  if (code === 1030 || code === 1036 || code === 1135 || code === 1147) return "🌫️";
  // Thunder first — 1273+ outranks the shower ranges below.
  if (code >= 1273) return "⛈️";
  // 1240-1246 are RAIN showers. They sit inside the snow numbering, so they
  // have to be checked before the 1210-1264 snow/sleet range.
  if (code >= 1240 && code <= 1246) return "🌧️";
  if (code >= 1210 && code <= 1264) return "🌨️";
  if (code >= 1063) return "🌧️";
  return "🌤️";
}

/** The slice of weatherapi.com's response we actually use. */
type WeatherApiResponse = {
  current?: {
    temp_c: number;
    is_day: number;
    condition: { text: string; code: number };
  };
  error?: { code: number; message: string };
};

/** Turns weatherapi.com's error codes into advice a beginner can act on. */
function explainError(status: number, code?: number): string {
  if (code === 1002 || code === 2006) {
    return "The weather API rejected the key. Check MAKAN_API_SECRET is a valid weatherapi.com key.";
  }
  if (code === 2007) return "Weather API monthly quota exceeded.";
  if (code === 2008) return "The weather API key has been disabled.";
  return `Weather API returned HTTP ${status}.`;
}

/**
 * Looks up current weather for the given cities, in parallel.
 *
 * Two different failure modes, handled deliberately differently:
 *
 *   1. Key MISSING      → throws, and /api/places returns 500.
 *                         This is the "you forgot to add it in Vercel" case,
 *                         and it should be loud and impossible to miss.
 *
 *   2. Key REJECTED, rate-limited, or the network is down
 *                       → returns ok:false and NO weather, but the food spots
 *                         still render. A flaky third-party service should
 *                         never take your whole page down.
 */
export async function getWeatherForCities(
  cityKeys: CityKey[],
): Promise<WeatherLookup> {
  const apiKey = getMakanApiSecret();

  if (!apiKey) {
    throw new MissingApiKeyError("MAKAN_API_SECRET is not set");
  }

  // De-duplicate: four spots in KL means one lookup, not four.
  const uniqueCities = [...new Set(cityKeys)];

  const byCity: Partial<Record<CityKey, Weather>> = {};
  let failure: string | null = null;

  const results = await Promise.all(
    uniqueCities.map(async (cityKey) => {
      const { lat, lon } = CITIES[cityKey];
      const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`;

      try {
        const response = await fetch(url, {
          // Cache each city's weather for 10 minutes. Weather doesn't change
          // that fast, and it keeps us well inside the free tier when a room
          // full of people all load the page at once.
          next: { revalidate: 600 },
        });

        const data: WeatherApiResponse = await response.json();

        if (!response.ok || !data.current) {
          return { cityKey, error: explainError(response.status, data.error?.code) };
        }

        const isDay = data.current.is_day === 1;
        return {
          cityKey,
          weather: {
            tempC: Math.round(data.current.temp_c),
            condition: data.current.condition.text,
            emoji: conditionEmoji(data.current.condition.code, isDay),
            isDay,
          } satisfies Weather,
        };
      } catch {
        // Network error, DNS failure, timeout — don't let it escape.
        return { cityKey, error: "Couldn't reach the weather API." };
      }
    }),
  );

  for (const result of results) {
    if ("weather" in result && result.weather) {
      byCity[result.cityKey] = result.weather;
    } else if ("error" in result && result.error) {
      failure ??= result.error;
    }
  }

  return {
    ok: failure === null,
    reason: failure,
    byCity,
  };
}
