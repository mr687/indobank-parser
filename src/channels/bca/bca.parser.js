const { load } = require("cheerio")
const NameExtractor = require("../../utils/name-extractor.js")

class BCAParser {
  constructor(html, selectors) {
    this.$ = load(html)
    this.selectors = selectors
  }

  parse() {
    let accountNum = this.$(this.selectors.accountNoField).parent().next().next().text().trim()
    let name = this.$(this.selectors.nameField).parent().next().next().text().trim()
    let period = this.$(this.selectors.periodeField).parent().next().next().text().trim()
    let currency = this.$(this.selectors.mataUangField).parent().next().next().text().trim()

    let transactions = []
    this.$(this.selectors.transactionsTable)
      .find("tr")
      .each((i, elem) => {
        let trxDate = this.$(elem).find("td:nth-child(1)").text().trim()
        if (trxDate === "PEND") {
          trxDate = period.split("-")[0].trim()
        }

        let note = this.$(elem).find("td:nth-child(2)").text().trim()
        note = note.replace(/\s+/g, " ")
        let trxName = NameExtractor.extractBCAMutationName(note)

        let branch = this.$(elem).find("td:nth-child(3)").text().trim()
        let mutation = this.$(elem).find("td:nth-child(5)").text().trim()
        let amount = this.$(elem).find("td:nth-child(4)").text().trim()
        let balance = this.$(elem).find("td:nth-child(6)").text().trim()
        if (trxDate === "Tgl.") {
        } else if (trxDate === "Date") {
        } else {
          transactions.push({ trxDate, note, trxName, branch, mutation, amount, balance })
        }
      })

    let settlement = {}
    this.$(this.selectors.settlementTable)
      .find("tr")
      .each((i, elem) => {
        let item = this.$(elem).find("td:nth-child(1)").text().trim()
        let value = this.$(elem).find("td:nth-child(3)").text().trim()
        if (item !== "") {
          settlement[item] = value
        }
      })

    return { data: [{ accountNum, name, period, currency }], mutations: transactions }
  }
}

module.exports = BCAParser
