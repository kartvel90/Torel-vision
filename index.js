import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.raw({ type: "*/*" }));

const TARGET = process.env.TARGET;

app.all("*", async (req, res) => {
  try {
    const url = TARGET + req.originalUrl;

    const response = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    const buffer = await response.arrayBuffer();
    res.status(response.status);
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(502).send("Relay Error");
  }
});

app.listen(3000, () => {
  console.log("Render Relay is running on port 3000");
});
