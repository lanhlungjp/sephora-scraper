const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/scrape", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "Missing ?url=" });

  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: "new"
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    // ❗ Tuỳ chỉnh theo Sephora
    const data = await page.evaluate(() => {
      return {
        title: document.querySelector("h1")?.innerText || null,
        price: document.querySelector("[data-comp='Price ']")?.innerText || null,
        images: [...document.querySelectorAll("img")].map(i => i.src)
      };
    });

    await browser.close();
    res.json({ success: true, data });

  } catch (err) {
    res.json({ error: true, message: err.toString() });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
