// Live smoke test for the local Node SDK build (../../../packages/node).
//
// Loads VENDORVAL_API_KEY (required), VENDORVAL_UEI (required), and an
// optional VENDORVAL_BASE_URL via `node --env-file=.env`, then performs a
// single `entities.lookup` against the live API and prints the JSON result.
import Vendorval from "vendorval";

const apiKey = process.env.VENDORVAL_API_KEY;
const uei = process.env.VENDORVAL_UEI;
if (!apiKey || !uei) {
  console.error("Missing VENDORVAL_API_KEY or VENDORVAL_UEI in .env");
  process.exit(1);
}

const baseUrl = process.env.VENDORVAL_BASE_URL;
const client = new Vendorval(baseUrl ? { apiKey, baseUrl } : { apiKey });

const target = baseUrl ?? "https://api.vendorval.com";
console.log(`Looking up UEI ${uei} against ${target}/v1...`);

const result = await client.entities.lookup({ identifiers: { uei } });
console.log(JSON.stringify(result, null, 2));
