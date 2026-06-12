require("dotenv").config();
const axios = require("axios");

async function testPrices() {
  try {
    const res = await axios.get("https://api.travelpayouts.com/aviasales/v3/prices_for_dates", {
      params: {
        origin: "ORY",
        destination: "LHR",
        departure_at: "2026-06-13",
        currency: "EUR",
        direct: false,
        limit: 1,
        sorting: "price",
        token: process.env.TRAVELPAYOUTS_API_TOKEN,
      },
    });

    console.log(res.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}

testPrices();