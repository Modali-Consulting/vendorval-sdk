import Vendorval from "vendorval";

const apiKey = process.env.VENDORVAL_API_KEY;
if (!apiKey) {
  console.error("Missing VENDORVAL_API_KEY. Export it before running this example.");
  process.exit(1);
}

const client = new Vendorval({
  apiKey,
  baseUrl: process.env.VENDORVAL_BASE_URL,
});

const result = await client.entities.lookup({
  identifiers: { uei: process.env.VENDORVAL_SMOKE_UEI ?? "ABCD12345678" },
});

console.log(JSON.stringify(result, null, 2));
