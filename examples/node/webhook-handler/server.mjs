import { createServer } from "node:http";
import { constructEvent } from "vendorval";

const SECRET = process.env.VENDORVAL_WEBHOOK_SECRET ?? "";

const server = createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/webhook") {
    res.statusCode = 404;
    res.end();
    return;
  }
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
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
