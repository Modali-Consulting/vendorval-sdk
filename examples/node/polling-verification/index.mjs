import Vendorval from "vendorval";

const client = new Vendorval({
  apiKey: process.env.VENDORVAL_API_KEY,
});

const bundle = await client.verifications.createAndWait(
  {
    identifiers: [{ type: "uei", value: process.env.VENDORVAL_SMOKE_UEI ?? "ABCD12345678" }],
    legal_name: "Acme Federal Services LLC",
    checks: ["sam_registration"],
    mode: "cached",
  },
  { timeout: 60_000 },
);

console.log(`status=${bundle.verification.status} result=${bundle.verification.overall_result ?? "n/a"}`);
