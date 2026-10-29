import "server-only";
import { cache } from "react";
// Approximate country centres from Google's DSPL canonical countries dataset:
// https://github.com/google/dspl/blob/master/samples/google/canonical/countries.csv
// Historical data, not a source of current borders; `aliases` below covers renamed countries.
import coordinates from "./country-coordinates.json";
import { getCountries } from "./cms-queries";
import type { Destination } from "./destinations";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const aliases: Record<string, string> = {
  uk: "GB",
  usa: "US",
  unitedstatesofamerica: "US",
  uae: "AE",
  czechia: "CZ",
  southkorea: "KR",
  northkorea: "KP",
  turkiye: "TR",
  vietnam: "VN",
  northmacedonia: "MK",
  eswatini: "SZ",
  myanmar: "MM",
  ivorycoast: "CI",
  democraticrepublicofthecongo: "CD",
  republicofthecongo: "CG",
};
export const getGlobeDestinations = cache(async (): Promise<Destination[]> => {
  const countries = await getCountries();
  return countries.map(({ name, slug }) => {
    const keys = [normalize(name), normalize(slug)];
    const point = coordinates.find((row) =>
      keys.some(
        (key) =>
          normalize(row.name) === key ||
          normalize(row.code) === key ||
          aliases[key] === row.code,
      ),
    );
    return {
      name,
      slug,
      code: point?.code ?? null,
      location: point ? [point.location[0], point.location[1]] : null,
    };
  });
});
