import { airports } from "../data/mockFlights";

const CITY_MAP = {
  paris: "CDG",
  cdg: "CDG",
  orly: "ORY",
  ory: "ORY",
  "new york": "JFK",
  "new-york": "JFK",
  newyork: "JFK",
  nyc: "JFK",
  jfk: "JFK",
  "los angeles": "LAX",
  losangeles: "LAX",
  lax: "LAX",
  londres: "LHR",
  london: "LHR",
  lhr: "LHR",
  dubai: "DXB",
  dubaï: "DXB",
  dxb: "DXB",
  tokyo: "NRT",
  nrt: "NRT",
  sydney: "SYD",
  syd: "SYD",
  rome: "FCO",
  roma: "FCO",
  fco: "FCO",
  barcelone: "BCN",
  barcelona: "BCN",
  bcn: "BCN",
  francfort: "FRA",
  frankfurt: "FRA",
  fra: "FRA",
  amsterdam: "AMS",
  ams: "AMS",
};

const MONTH_MAP = {
  janvier: 1,
  jan: 1,
  fevrier: 2,
  fev: 2,
  feb: 2,
  mars: 3,
  mar: 3,
  avril: 4,
  avr: 4,
  apr: 4,
  mai: 5,
  may: 5,
  juin: 6,
  jun: 6,
  juillet: 7,
  juil: 7,
  jul: 7,
  aout: 8,
  aug: 8,
  septembre: 9,
  sept: 9,
  sep: 9,
  octobre: 10,
  oct: 10,
  novembre: 11,
  nov: 11,
  decembre: 12,
  dec: 12,
};

const AIRPORT_CITIES = {
  CDG: "Paris",
  ORY: "Paris (Orly)",
  JFK: "New York",
  LAX: "Los Angeles",
  LHR: "Londres",
  DXB: "Dubaï",
  NRT: "Tokyo",
  SYD: "Sydney",
  FCO: "Rome",
  BCN: "Barcelone",
  FRA: "Francfort",
  AMS: "Amsterdam",
};

export const normalize = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "'");
};

export const makeDateString = (day, month, year) => {
  const y = year ?? new Date().getFullYear();
  const d = new Date(y, month - 1, day);
  if (d < new Date() && !year) d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
};

const buildAirportAliases = () => {
  const aliases = {};

  for (const airport of airports ?? []) {
    const values = [airport.city, airport.name].filter(Boolean);

    for (const value of values) {
      const normalized = normalize(value);
      if (!normalized) continue;
      aliases[normalized] = airport.code;
      aliases[normalized.replace(/\s+/g, "")] = airport.code;
      aliases[normalized.replace(/-/g, " ")] = airport.code;
    }
  }

  return aliases;
};

const AIRPORT_ALIASES = buildAirportAliases();
const CITY_LOOKUP = { ...CITY_MAP, ...AIRPORT_ALIASES };

export const extractCities = (norm) => {
  const cityNames = Object.keys(CITY_LOOKUP).sort(
    (a, b) => b.length - a.length,
  );
  const found = [];

  for (const name of cityNames) {
    let searchFrom = 0;
    while (true) {
      const idx = norm.indexOf(name, searchFrom);
      if (idx === -1) break;

      const before = idx === 0 || /\W/.test(norm[idx - 1]);
      const after =
        idx + name.length >= norm.length || /\W/.test(norm[idx + name.length]);

      if (before && after) {
        found.push({ code: CITY_LOOKUP[name], idx, len: name.length });
      }

      searchFrom = idx + 1;
    }
  }

  found.sort((a, b) => a.idx - b.idx);

  const deduped = [];
  for (const match of found) {
    const overlaps = deduped.some(
      (d) => match.idx < d.idx + d.len && match.idx + match.len > d.idx,
    );
    if (!overlaps) deduped.push(match);
  }

  const seen = new Set();
  const unique = deduped.filter((m) => {
    if (seen.has(m.code)) return false;
    seen.add(m.code);
    return true;
  });

  return {
    origin: unique[0]?.code,
    destination: unique[1]?.code,
  };
};

export const extractDates = (norm) => {
  const dates = [];

  const monthNamePattern =
    /(?:le\s+)?(\d{1,2})\s+(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre|jan|fev|feb|mar|avr|apr|may|juil|jul|aug|sept|sep|oct|nov|dec)(?:\s+(\d{4}))?/g;

  let m;
  while ((m = monthNamePattern.exec(norm)) !== null) {
    const month = MONTH_MAP[m[2]];
    if (month) {
      dates.push(
        makeDateString(
          parseInt(m[1]),
          month,
          m[3] ? parseInt(m[3]) : undefined,
        ),
      );
    }
  }

  const slashPattern = /(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/g;
  while ((m = slashPattern.exec(norm)) !== null) {
    dates.push(
      makeDateString(
        parseInt(m[1]),
        parseInt(m[2]),
        m[3] ? parseInt(m[3]) : undefined,
      ),
    );
  }

  if (norm.includes("demain") && dates.length === 0) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dates.push(tomorrow.toISOString().split("T")[0]);
  }

  const inDaysMatch = norm.match(/dans\s+(\d+)\s+jours?/);
  if (inDaysMatch && dates.length === 0) {
    const future = new Date();
    future.setDate(future.getDate() + parseInt(inDaysMatch[1]));
    dates.push(future.toISOString().split("T")[0]);
  }

  return [...new Set(dates)];
};

export const parseFlightQuery = (query) => {
  const result = {};
  const norm = normalize(query);

  if (/aller[- ]simple|one[- ]way|sans retour|pas de retour/.test(norm)) {
    result.tripType = "one-way";
  } else if (/aller[- ]retour|round[- ]trip|avec retour/.test(norm)) {
    result.tripType = "round-trip";
  }

  if (/premiere|first.class/.test(norm)) result.cabinClass = "first";
  else if (/business|affaires/.test(norm)) result.cabinClass = "business";
  else if (/premium/.test(norm)) result.cabinClass = "premium";
  else if (/economique|economy/.test(norm)) result.cabinClass = "economy";

  const adultsMatch = norm.match(/(\d+)\s*adultes?/);
  if (adultsMatch) result.adults = parseInt(adultsMatch[1]);

  const childrenMatch = norm.match(/(\d+)\s*enfants?/);
  if (childrenMatch) result.children = parseInt(childrenMatch[1]);

  if (!result.adults) {
    const totalMatch = norm.match(
      /(\d+)\s*(?:personnes?|passagers?|pax|voyageurs?)/,
    );
    if (totalMatch) result.adults = parseInt(totalMatch[1]);
  }

  const { origin, destination } = extractCities(norm);
  if (origin) result.origin = origin;
  if (destination) result.destination = destination;

  const dates = extractDates(norm);
  if (dates[0]) result.departDate = dates[0];
  if (dates[1]) {
    result.returnDate = dates[1];
    if (!result.tripType) result.tripType = "round-trip";
  }

  return result;
};

export const getAirportCity = (code) => {
  if (!code) return "";
  const airportName = airports.find((item) => item.code === code)?.city;
  return airportName || AIRPORT_CITIES[code] || code;
};

const formatAirportLabel = (code) => {
  if (!code) return "";
  const city = getAirportCity(code);
  return city && code ? `${city} (${code})` : code;
};

export const generateBotResponse = (parsed) => {
  const parts = [];
  const originCity = formatAirportLabel(parsed.origin);
  const destCity = formatAirportLabel(parsed.destination);

  if (parsed.origin && parsed.destination) {
    parts.push(`✈️ Vol ${originCity} → ${destCity}`);
  } else if (parsed.origin) {
    parts.push(`🛫 Départ depuis ${originCity}`);
  } else if (parsed.destination) {
    parts.push(`🛬 Destination ${destCity}`);
  }

  if (parsed.departDate) {
    const d = new Date(parsed.departDate + "T12:00:00");
    parts.push(
      `📅 Départ le ${d.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
    );
  }

  if (parsed.returnDate) {
    const d = new Date(parsed.returnDate + "T12:00:00");
    parts.push(
      `🔄 Retour le ${d.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })}`,
    );
  }

  if (parsed.adults) {
    parts.push(`👥 ${parsed.adults} adulte${parsed.adults > 1 ? "s" : ""}`);
  }

  if (parsed.children) {
    parts.push(`👶 ${parsed.children} enfant${parsed.children > 1 ? "s" : ""}`);
  }

  const classLabels = {
    economy: "Économique",
    premium: "Premium",
    business: "Affaires",
    first: "Première",
  };

  if (parsed.cabinClass) {
    parts.push(`💺 Classe ${classLabels[parsed.cabinClass]}`);
  }

  if (parts.length === 0) {
    return 'Je n\'ai pas bien compris. Essayez par exemple :\n*"Vol Paris → Tokyo le 10 septembre, 2 adultes"*';
  }

  const missing = [];
  if (!parsed.origin) missing.push("la ville de départ");
  if (!parsed.destination) missing.push("la destination");
  if (!parsed.departDate) missing.push("la date de départ");

  let response = "J'ai compris :\n" + parts.join("\n");

  if (missing.length > 0) {
    response += `\n\nIl me manque encore ${missing.join(" et ")} pour compléter la recherche.`;
  } else {
    response +=
      "\n\n✅ Les champs ont été remplis automatiquement ! Vous pouvez lancer la recherche.";
  }

  return response;
};

// const CITY_MAP = {
//   paris: "CDG",
//   cdg: "CDG",
//   orly: "ORY",
//   ory: "ORY",
//   "new york": "JFK",
//   "new-york": "JFK",
//   newyork: "JFK",
//   nyc: "JFK",
//   jfk: "JFK",
//   "los angeles": "LAX",
//   losangeles: "LAX",
//   lax: "LAX",
//   londres: "LHR",
//   london: "LHR",
//   lhr: "LHR",
//   dubai: "DXB",
//   "dubaï": "DXB",
//   dxb: "DXB",
//   tokyo: "NRT",
//   nrt: "NRT",
//   sydney: "SYD",
//   syd: "SYD",
//   rome: "FCO",
//   roma: "FCO",
//   fco: "FCO",
//   barcelone: "BCN",
//   barcelona: "BCN",
//   bcn: "BCN",
//   francfort: "FRA",
//   frankfurt: "FRA",
//   fra: "FRA",
//   amsterdam: "AMS",
//   ams: "AMS",
// };

// const MONTH_MAP = {
//   janvier: 1, jan: 1,
//   fevrier: 2, fev: 2, feb: 2,
//   mars: 3, mar: 3,
//   avril: 4, avr: 4, apr: 4,
//   mai: 5, may: 5,
//   juin: 6, jun: 6,
//   juillet: 7, juil: 7, jul: 7,
//   aout: 8, aug: 8,
//   septembre: 9, sept: 9, sep: 9,
//   octobre: 10, oct: 10,
//   novembre: 11, nov: 11,
//   decembre: 12, dec: 12,
// };

// const AIRPORT_CITIES = {
//   CDG: "Paris",
//   ORY: "Paris (Orly)",
//   JFK: "New York",
//   LAX: "Los Angeles",
//   LHR: "Londres",
//   DXB: "Dubaï",
//   NRT: "Tokyo",
//   SYD: "Sydney",
//   FCO: "Rome",
//   BCN: "Barcelone",
//   FRA: "Francfort",
//   AMS: "Amsterdam",
// };

// function normalize(text) {
//   return text
//     .toLowerCase()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .replace(/['’]/g, "'");
// }

// function makeDateString(day, month, year) {
//   const y = year ?? new Date().getFullYear();
//   const d = new Date(y, month - 1, day);
//   if (d < new Date() && !year) d.setFullYear(d.getFullYear() + 1);
//   return d.toISOString().split("T")[0];
// }

// function extractCities(norm) {
//   const cityNames = Object.keys(CITY_MAP).sort((a, b) => b.length - a.length);
//   const found = [];

//   for (const name of cityNames) {
//     let searchFrom = 0;
//     while (true) {
//       const idx = norm.indexOf(name, searchFrom);
//       if (idx === -1) break;

//       const before = idx === 0 || /\W/.test(norm[idx - 1]);
//       const after = idx + name.length >= norm.length || /\W/.test(norm[idx + name.length]);

//       if (before && after) {
//         found.push({ code: CITY_MAP[name], idx, len: name.length });
//       }
//       searchFrom = idx + 1;
//     }
//   }

//   found.sort((a, b) => a.idx - b.idx);

//   const deduped = [];
//   for (const match of found) {
//     const overlaps = deduped.some(
//       (d) => match.idx < d.idx + d.len && match.idx + match.len > d.idx
//     );
//     if (!overlaps) deduped.push(match);
//   }

//   const seen = new Set();
//   const unique = deduped.filter((m) => {
//     if (seen.has(m.code)) return false;
//     seen.add(m.code);
//     return true;
//   });

//   return {
//     origin: unique[0]?.code,
//     destination: unique[1]?.code,
//   };
// }

// function extractDates(norm) {
//   const dates = [];

//   const monthNamePattern =
//     /(?:le\s+)?(\d{1,2})\s+(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre|jan|fev|feb|mar|avr|apr|may|juil|jul|aug|sept|sep|oct|nov|dec)(?:\s+(\d{4}))?/g;

//   let m;
//   while ((m = monthNamePattern.exec(norm)) !== null) {
//     const month = MONTH_MAP[m[2]];
//     if (month) dates.push(makeDateString(parseInt(m[1]), month, m[3] ? parseInt(m[3]) : undefined));
//   }

//   const slashPattern = /(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/g;
//   while ((m = slashPattern.exec(norm)) !== null) {
//     dates.push(makeDateString(parseInt(m[1]), parseInt(m[2]), m[3] ? parseInt(m[3]) : undefined));
//   }

//   if (norm.includes("demain") && dates.length === 0) {
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     dates.push(tomorrow.toISOString().split("T")[0]);
//   }

//   const inDaysMatch = norm.match(/dans\s+(\d+)\s+jours?/);
//   if (inDaysMatch && dates.length === 0) {
//     const future = new Date();
//     future.setDate(future.getDate() + parseInt(inDaysMatch[1]));
//     dates.push(future.toISOString().split("T")[0]);
//   }

//   return [...new Set(dates)];
// }

// function parseFlightQuery(query) {
//   const result = {};
//   const norm = normalize(query);

//   if (/aller[- ]simple|one[- ]way|sans retour|pas de retour/.test(norm)) {
//     result.tripType = "one-way";
//   } else if (/aller[- ]retour|round[- ]trip|avec retour/.test(norm)) {
//     result.tripType = "round-trip";
//   }

//   if (/premiere|first.class/.test(norm)) result.cabinClass = "first";
//   else if (/business|affaires/.test(norm)) result.cabinClass = "business";
//   else if (/premium/.test(norm)) result.cabinClass = "premium";
//   else if (/economique|economy/.test(norm)) result.cabinClass = "economy";

//   const adultsMatch = norm.match(/(\d+)\s*adultes?/);
//   if (adultsMatch) result.adults = parseInt(adultsMatch[1]);

//   const childrenMatch = norm.match(/(\d+)\s*enfants?/);
//   if (childrenMatch) result.children = parseInt(childrenMatch[1]);

//   if (!result.adults) {
//     const totalMatch = norm.match(/(\d+)\s*(?:personnes?|passagers?|pax|voyageurs?)/);
//     if (totalMatch) result.adults = parseInt(totalMatch[1]);
//   }

//   const { origin, destination } = extractCities(norm);
//   if (origin) result.origin = origin;
//   if (destination) result.destination = destination;

//   const dates = extractDates(norm);
//   if (dates[0]) result.departDate = dates[0];
//   if (dates[1]) {
//     result.returnDate = dates[1];
//     if (!result.tripType) result.tripType = "round-trip";
//   }

//   return result;
// }

// function getAirportCity(code) {
//   return code ? AIRPORT_CITIES[code] || code : "";
// }

// function generateBotResponse(parsed) {
//   const parts = [];
//   const originCity = getAirportCity(parsed.origin);
//   const destCity = getAirportCity(parsed.destination);

//   if (parsed.origin && parsed.destination) {
//     parts.push(`✈️ Vol ${originCity} → ${destCity}`);
//   } else if (parsed.origin) {
//     parts.push(`🛫 Départ depuis ${originCity}`);
//   } else if (parsed.destination) {
//     parts.push(`🛬 Destination ${destCity}`);
//   }

//   if (parsed.departDate) {
//     const d = new Date(parsed.departDate + "T12:00:00");
//     parts.push(
//       `📅 Départ le ${d.toLocaleDateString("fr-FR", {
//         weekday: "long",
//         day: "numeric",
//         month: "long",
//         year: "numeric",
//       })}`
//     );
//   }

//   if (parsed.returnDate) {
//     const d = new Date(parsed.returnDate + "T12:00:00");
//     parts.push(
//       `🔄 Retour le ${d.toLocaleDateString("fr-FR", {
//         weekday: "long",
//         day: "numeric",
//         month: "long",
//       })}`
//     );
//   }

//   if (parsed.adults) {
//     parts.push(`👥 ${parsed.adults} adulte${parsed.adults > 1 ? "s" : ""}`);
//   }

//   if (parsed.children) {
//     parts.push(`👶 ${parsed.children} enfant${parsed.children > 1 ? "s" : ""}`);
//   }

//   const classLabels = {
//     economy: "Économique",
//     premium: "Premium",
//     business: "Affaires",
//     first: "Première",
//   };

//   if (parsed.cabinClass) {
//     parts.push(`💺 Classe ${classLabels[parsed.cabinClass]}`);
//   }

//   if (parts.length === 0) {
//     return "Je n'ai pas bien compris. Essayez par exemple :\n*\"Vol Paris → Tokyo le 10 septembre, 2 adultes\"*";
//   }

//   const missing = [];
//   if (!parsed.origin) missing.push("la ville de départ");
//   if (!parsed.destination) missing.push("la destination");
//   if (!parsed.departDate) missing.push("la date de départ");

//   let response = "J'ai compris :\n" + parts.join("\n");

//   if (missing.length > 0) {
//     response += `\n\nIl me manque encore ${missing.join(" et ")} pour compléter la recherche.`;
//   } else {
//     response += "\n\n✅ Les champs ont été remplis automatiquement ! Vous pouvez lancer la recherche.";
//   }

//   return response;
// }
