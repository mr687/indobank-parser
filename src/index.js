require("dotenv/config")

const BCABrowser = require("./channels/bca/bca.browser.js")
const fs = require('fs/promises')

async function main() {
  const username = process.env.BCA_USERNAME

  const bca = new BCABrowser(username)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 1)
  const endDate = new Date()
  const statements = await bca.getStatement(startDate, endDate)
  await fs.writeFile('statements.json', JSON.stringify(statements, null, 2))
  await bca.logoutAndClose()
}

main()
