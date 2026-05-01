import { createServer } from "node:http";
import { constructEvent } from "vendorval";

const SECRET = process.env.VENDORVAL_WEBHOOK_SECRET;
if (!SECRET) {
  console.error("Missing VENDORVAL_WEBHOOK_SECRET. Export it before starting the server.");
  process.exit(1);
}

const MAX_BYTES = 1024 * 1024; // 1MB cap on webhook bodies; reject anything larger.

const server = createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/webhook") {
    res.statusCode = 404;
    res.end();
    return;
  }
  const chunks = [];
  let total = 0;
  let aborted = false;
  req.on("data", (c) => {
    if (aborted) return;
    total += c.length;
    if (total > MAX_BYTES) {
      aborted = true;
      res.statusCode = 413;
      res.end("payload too large");
      req.destroy();
      return;
    }
    chunks.push(c);
  });
  req.on("end", () => {
    if (aborted) return;
    const body = Buffer.concat(chunks).toString("utf8");
    const sig = req.headers["vendorval-signature"];
    try {
      const event = constructEvent(body, sig ?? "", SECRET);
      console.log("received event", event);
      res.statusCode = 200;
      res.end("ok");
    } catch (err) {
      console.error("invalid webhook", err);
      res.statusCode = 400;
      res.end("invalid");
    }
  });
});

server.listen(8787, () => {
  console.log("listening on http://localhost:8787/webhook");
});
