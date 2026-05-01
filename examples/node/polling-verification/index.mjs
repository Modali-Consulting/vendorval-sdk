import Vendorval from "vendorval";

const apiKey = process.env.VENDORVAL_API_KEY;
if (!apiKey) {
  console.error("Missing VENDORVAL_API_KEY. Export it before running this example.");
  process.exit(1);
}

const client = new Vendorval({ apiKey });

// `identifiers` accepts either the recommended object form (shown here)
// or the legacy array of `{type, value}` pairs.
const bundle = await client.verifications.createAndWait(
  {
    identifiers: { uei: process.env.VENDORVAL_SMOKE_UEI ?? "ABCD12345678" },
    legal_name: "Acme Federal Services LLC",
    checks: ["sam_registration"],
    mode: "cached",
  },
  { timeout: 60_000 },
);

console.log(`status=${bundle.verification.status} result=${bundle.verification.overall_result ?? "n/a"}`);
