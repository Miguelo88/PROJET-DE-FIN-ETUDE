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
  { code: "CDG", city: "Paris", name: "Charles de Gaulle" },
  { code: "ORY", city: "Paris", name: "Orly" },
  { code: "JFK", city: "New York", name: "John F. Kennedy" },
  { code: "LAX", city: "Los Angeles", name: "Los Angeles Int'l" },
  { code: "LHR", city: "Londres", name: "Heathrow" },
  { code: "DXB", city: "Dubaï", name: "Dubai Int'l" },
  { code: "NRT", city: "Tokyo", name: "Narita" },
  { code: "SYD", city: "Sydney", name: "Sydney Airport" },
  { code: "FCO", city: "Rome", name: "Fiumicino" },
  { code: "BCN", city: "Barcelone", name: "El Prat" },
  { code: "FRA", city: "Francfort", name: "Frankfurt Airport" },
  { code: "AMS", city: "Amsterdam", name: "Schiphol" },
];
