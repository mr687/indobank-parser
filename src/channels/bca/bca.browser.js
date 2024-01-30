const Browser = require("../../browser.js")
const BCASelector = require("./bca.selector.js")
const BCAParser = require("./bca.parser.js")
const ask = require("../../utils/ask-question.js")

function logger(parent) {
  return (message) => {
    console.log(`[LOG][${parent}] ${message}`)
  }
}

class BCABrowser extends Browser {
  constructor(username, password) {
    super()
    this.username = username
    this.usernameMuted = this.username.slice(0, 3) + "*".repeat(this.username.length - 3)
    this.password = password
    this.log = logger(this.usernameMuted)
    if (!username) {
      throw new Error("No username provided!")
    }
    if (!password) {
      this.password = null
    }
  }

  async isAuthenticated(page) {
    try {
      const targetPage = page || this.page
      if (!targetPage) return false

      const exists = await (page || this.page).$(BCASelector.LOGIN_PAGE.userField)
      return !exists
    } catch (e) {
      return false
    }
  }

  async login() {
    if (!this.password) {
      this.password = await ask(`[LOG][${this.usernameMuted}] PIN : `)
    }
    this.page = await this.launch()
    await this.page.goto(BCASelector.LOGIN_PAGE.url, {
      waitUntil: "networkidle2",
    })
    this.page.on("dialog", async (dialog) => {
      await dialog.accept()
      const message = dialog.message()
      this.log(message)
      throw new Error(message)
    })
    this.log("Login to BCA...")
    await this.page.type(BCASelector.LOGIN_PAGE.userField, this.username, {
      delay: 100,
    })
    await this.page.type(BCASelector.LOGIN_PAGE.passField, this.password)
    await this.page.click(BCASelector.LOGIN_PAGE.submitButton, {
      delay: 200,
    })
    await this.page.waitForTimeout(5000)

    const mainFrame = this.page.frames().find((frame) => frame.name() === "atm")
    if (mainFrame) {
      const n = await mainFrame.$("body")
      const v = await (await n.getProperty("textContent")).jsonValue()
      const isLoggedIn = v.includes("Selamat Datang Di Internet Banking BCA")
      if (isLoggedIn) {
        this.log("Logged In")
      }
    }
  }

  async logout() {
    this.log("Logout...")
    await this.page.goto(BCASelector.LOGOUT_PAGE.url, {
      waitUntil: "networkidle2",
    })
  }

  async logoutAndClose() {
    return this.logout().then(() => this.close())
  }

  async getStatement(startDate, endDate) {
    if (!startDate || !endDate) {
      this.log("No date selection. skip...")
      return
    }

    if (!(await this.isAuthenticated())) {
      await this.login()
    }
    await this.page.goto(BCASelector.SETTLEMENT_PAGE.url, {
      waitUntil: "networkidle2",
    })
    await this.page.click(BCASelector.SETTLEMENT_PAGE.settlementLink)
    const pageTarget = this.page.target()
    const newTarget = await this.page.browser().waitForTarget((target) => target.opener() === pageTarget)
    const newPage = await newTarget.page()

    newPage.on("dialog", async (dialog) => {
      const message = dialog.message()
      this.log(message)
      await dialog.dismiss()
      await this.logoutAndClose()
      process.exit(0)
    })

    await newPage.reload({
      waitUntil: "networkidle2",
    })

    const padStart2 = (num) => num.toString().padStart(2, "0")
    this.log("Selecting date...")
    await newPage.waitForSelector(BCASelector.SETTLEMENT_PAGE.startDateField)
    await newPage.select(BCASelector.SETTLEMENT_PAGE.startDateField, padStart2(startDate.getDate()))
    await newPage.select(BCASelector.SETTLEMENT_PAGE.startMonthField, (startDate.getMonth() + 1).toString())
    await newPage.select(BCASelector.SETTLEMENT_PAGE.startYearField, startDate.getFullYear().toString())
    await newPage.select(BCASelector.SETTLEMENT_PAGE.endDateField, padStart2(endDate.getDate()))
    await newPage.select(BCASelector.SETTLEMENT_PAGE.endMonthField, (endDate.getMonth() + 1).toString())
    await newPage.select(BCASelector.SETTLEMENT_PAGE.endYearField, endDate.getFullYear().toString())

    this.log("Getting mutation...")
    await newPage.click(BCASelector.SETTLEMENT_PAGE.submitButton, {
      delay: 1500,
    })
    await this.page.waitForTimeout(5000)
    if (!(await this.isAuthenticated(newPage))) {
      await this.logoutAndClose()
      throw new Error("Unauthenticated")
    }

    const raw = await newPage.evaluate(() => document.body.innerHTML)
    let parser
    if (raw.includes("Account Number")) {
      parser = new BCAParser(raw, BCASelector.PARSING_FIELD_ENG)
    } else {
      parser = new BCAParser(raw, BCASelector.PARSING_FIELD)
    }
    const result = parser.parse()
    return result
  }
}

module.exports = BCABrowser
