const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.input.on("keypress", (c, k) => {
  const len = rl.line.length
  readline.moveCursor(rl.output, -len, 0)
  readline.clearLine(rl.output, 1)
  rl.output.write("*".repeat(len))
})

async function ask(message) {
  return new Promise((resolve) => {
    rl.question(message, (input) => {
      rl.history = rl.history.slice(1)
      rl.close()
      resolve(input)
    })
  })
}

module.exports = ask
