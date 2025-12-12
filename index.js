const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/scrape", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "Missing ?url" });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const data = await page.evaluate(() => ({
      title: document.querySelector("h1")?.innerText || "",
      price: document.querySelector("[data-at='price']")?.innerText || "",
      images: [...document.querySelectorAll("img")].map(i => i.src)
    }));

    await browser.close();
    res.json({ success: true, data });

  } catch (error) {
    res.json({ error: error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
