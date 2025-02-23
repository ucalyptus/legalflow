const { spawn } = require('child_process')
const clearConsole = () => {
  process.stdout.write('\x1Bc')
}

// Clear console initially
clearConsole()

// Start Next.js dev server
const nextDev = spawn('next', ['dev'], { stdio: 'pipe' })

// Pipe stdout and stderr, but clear console before each output
nextDev.stdout.on('data', (data) => {
  clearConsole()
  process.stdout.write(data)
})

nextDev.stderr.on('data', (data) => {
  clearConsole()
  process.stderr.write(data)
})

nextDev.on('close', (code) => {
  process.exit(code)
}) 