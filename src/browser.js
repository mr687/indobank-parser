const puppeteer = require("puppeteer-extra")
const PuppeteerStealthPlugin = require("puppeteer-extra-plugin-stealth")
const { executablePath } = require("puppeteer")

puppeteer.use(PuppeteerStealthPlugin())

class Browser {
  constructor() {
    this.config = {
      headless: process.env.NODE_ENV === 'production' ? 'new' : false,
      args: [
        "--no-sandbox",
        "--no-default-browser-check",
        "--disable-dev-shm-usage",
        "--disable-infobars",
        "--disable-web-security",
        "--disable-features=IsolateOrigins",
        "--disable-site-isolation-trials",
      ],
      executablePath: executablePath("chrome"),
    }
  }

  async launch() {
    this.browser = await puppeteer.launch(this.config)
    this.page = await this.browser.newPage()
    return this.page
  }

  async close() {
    this.log("Browser closing...")
    await this.browser.close()
  }
}

module.exports = Browser
