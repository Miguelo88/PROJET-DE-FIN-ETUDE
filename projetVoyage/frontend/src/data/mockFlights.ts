export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
  cabinClass: string;
  aircraft: string;
  availableSeats: number;
}

export const airports = [
  { code: "ABJ", city: "Abidjan", name: "Félix-Houphouët-Boigny" },
  { code: "ADD", city: "Addis-Abeba", name: "Bole Int'l" },
  { code: "ALG", city: "Alger", name: "Houari Boumédiène" },
  { code: "AMS", city: "Amsterdam", name: "Schiphol" },
  { code: "TNR", city: "Antananarivo", name: "Ivato" },
  { code: "BKO", city: "Bamako", name: "Modibo Keïta" },
  { code: "BCN", city: "Barcelone", name: "El Prat" },
  { code: "BZV", city: "Brazzaville", name: "Maya-Maya" },
  { code: "CMN", city: "Casablanca", name: "Mohammed V" },
  { code: "CKY", city: "Conakry", name: "Ahmed Sékou Touré" },
  { code: "DSS", city: "Dakar", name: "Blaise Diagne" },
  { code: "DAR", city: "Dar es Salaam", name: "Julius Nyerere" },
  { code: "DLA", city: "Douala", name: "Douala Int'l" },
  { code: "DXB", city: "Dubaï", name: "Dubai Int'l" },
  { code: "EBB", city: "Entebbe", name: "Entebbe Int'l" },
  { code: "FRA", city: "Francfort", name: "Frankfurt Airport" },
  { code: "JNB", city: "Johannesbourg", name: "O.R. Tambo" },
  { code: "KGL", city: "Kigali", name: "Kigali Int'l" },
  { code: "FIH", city: "Kinshasa", name: "N'djili" },
  { code: "LOS", city: "Lagos", name: "Murtala Muhammed" },
  { code: "CPT", city: "Le Cap", name: "Cape Town Int'l" },
  { code: "CAI", city: "Le Caire", name: "Cairo Int'l" },
  { code: "LBV", city: "Libreville", name: "Léon-Mba" },
  { code: "LHR", city: "Londres", name: "Heathrow" },
  { code: "LAX", city: "Los Angeles", name: "Los Angeles Int'l" },
  { code: "LAD", city: "Luanda", name: "Quatro de Fevereiro" },
  { code: "RAK", city: "Marrakech", name: "Ménara" },
  { code: "MRU", city: "Maurice", name: "Sir Seewoosagur Ramgoolam" },
  { code: "NBO", city: "Nairobi", name: "Jomo Kenyatta" },
  { code: "JFK", city: "New York", name: "John F. Kennedy" },
  { code: "OUA", city: "Ouagadougou", name: "Ouagadougou Int'l" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle" },
  { code: "ORY", city: "Paris", name: "Orly" },
  { code: "PNR", city: "Pointe-Noire", name: "Antonio-Agostinho-Neto" },
  { code: "FCO", city: "Rome", name: "Fiumicino" },
  { code: "SYD", city: "Sydney", name: "Sydney Airport" },
  { code: "NRT", city: "Tokyo", name: "Narita" },
  { code: "TUN", city: "Tunis", name: "Tunis-Carthage" },
  { code: "NSI", city: "Yaoundé", name: "Nsimalen" }
];

// export const generateMockFlights = (
//   origin: string,
//   destination: string,
//   date: string
// ): Flight[] => {
//   const airlines = [
//     "Air France",
//     "British Airways",
//     "Lufthansa",
//     "Emirates",
//     "Delta",
//     "United",
//     "KLM",
//     "Qatar Airways",
//   ];

//   const flights: Flight[] = [];

//   for (let i = 0; i < 20; i++) {
//     const airline = airlines[Math.floor(Math.random() * airlines.length)];
//     const hour = 6 + Math.floor(Math.random() * 16);
//     const minute = Math.floor(Math.random() * 4) * 15;
//     const durationHours = 2 + Math.floor(Math.random() * 12);
//     const durationMinutes = Math.floor(Math.random() * 4) * 15;
//     const stops = Math.random() > 0.6 ? 0 : Math.random() > 0.5 ? 1 : 2;
//     const basePrice = 150 + Math.floor(Math.random() * 800);
//     const price = basePrice + stops * 50;

//     const arrivalHour = (hour + durationHours) % 24;
//     const arrivalMinute = (minute + durationMinutes) % 60;

//     flights.push({
//       id: `FL${1000 + i}`,
//       airline,
//       flightNumber: `${airline.substring(0, 2).toUpperCase()}${Math.floor(
//         Math.random() * 9000 + 1000
//       )}`,
//       origin,
//       destination,
//       departureTime: `${hour.toString().padStart(2, "0")}:${minute
//         .toString()
//         .padStart(2, "0")}`,
//       arrivalTime: `${arrivalHour.toString().padStart(2, "0")}:${arrivalMinute
//         .toString()
//         .padStart(2, "0")}`,
//       duration: `${durationHours}h ${durationMinutes}m`,
//       price,
//       stops,
//       cabinClass: "Economy",
//       aircraft: ["Boeing 777", "Airbus A380", "Boeing 787", "Airbus A350"][
//         Math.floor(Math.random() * 4)
//       ],
//       availableSeats: Math.floor(Math.random() * 50) + 10,
//     });
//   }

//   return flights.sort((a, b) => a.price - b.price);
// };
