import Vendorval from "vendorval";

const apiKey = process.env.VENDORVAL_API_KEY;
const uei = process.env.VENDORVAL_UEI;
if (!apiKey || !uei) {
  console.error("Missing VENDORVAL_API_KEY or VENDORVAL_UEI in .env");
  process.exit(1);
}

const baseUrl = process.env.VENDORVAL_BASE_URL;
const client = new Vendorval({
  apiKey,
  ...(baseUrl ? { baseUrl } : {}),
});

console.log(`Looking up UEI ${uei} against ${baseUrl ?? "https://api.vendorval.com/v1"}...`);
const result = await client.entities.lookup({ identifiers: { uei } });
console.log(JSON.stringify(result, null, 2));
