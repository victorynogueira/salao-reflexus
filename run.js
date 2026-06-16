const { spawn } = require('child_process')
const path = require('path')

const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next')
const args = process.argv.slice(2)

const child = spawn('node', [nextBin, ...args], {
  stdio: 'inherit',
  cwd: __dirname
})

child.on('close', (code) => {
  process.exit(code)
})
