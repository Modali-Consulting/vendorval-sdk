import Vendorval from "vendorval";

const client = new Vendorval({
  apiKey: process.env.VENDORVAL_API_KEY,
  baseUrl: process.env.VENDORVAL_BASE_URL,
});

const result = await client.entities.lookup({
  identifiers: { uei: process.env.VENDORVAL_SMOKE_UEI ?? "ABCD12345678" },
});

console.log(JSON.stringify(result, null, 2));
