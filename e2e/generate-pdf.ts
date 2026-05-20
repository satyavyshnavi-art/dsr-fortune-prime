import { chromium } from "@playwright/test";
import path from "path";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const htmlPath = path.resolve(__dirname, "../docs/USER-GUIDE.html");
  const pdfPath = path.resolve(__dirname, "../docs/DSR-Fortune-Prime-User-Guide.pdf");

  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" },
    displayHeaderFooter: false,
  });

  console.log(`PDF generated: ${pdfPath}`);
  await browser.close();
})();
