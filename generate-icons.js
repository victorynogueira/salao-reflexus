const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

function drawIcon(size, filename) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#c026d3')
  gradient.addColorStop(1, '#a21caf')
  ctx.fillStyle = gradient

  // Rounded rectangle background
  const radius = size * 0.2
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(size - radius, 0)
  ctx.quadraticCurveTo(size, 0, size, radius)
  ctx.lineTo(size, size - radius)
  ctx.quadraticCurveTo(size, size, size - radius, size)
  ctx.lineTo(radius, size)
  ctx.quadraticCurveTo(0, size, 0, size - radius)
  ctx.lineTo(0, radius)
  ctx.quadraticCurveTo(0, 0, radius, 0)
  ctx.closePath()
  ctx.fill()

  // Draw scissors icon
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#ffffff'

  const scale = size / 100
  ctx.save()
  ctx.translate(size / 2, size / 2)
  ctx.scale(scale, scale)

  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Blades
  ctx.beginPath()
  ctx.moveTo(-15, -25)
  ctx.lineTo(5, -5)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(15, -25)
  ctx.lineTo(-5, -5)
  ctx.stroke()

  // Handles
  ctx.beginPath()
  ctx.arc(-12, 10, 12, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(12, 10, 12, 0, Math.PI * 2)
  ctx.stroke()

  // Pivot point
  ctx.beginPath()
  ctx.arc(0, -5, 4, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  ctx.restore()

  // Save to file
  const out = fs.createWriteStream(filename)
  const stream = canvas.createPNGStream()
  stream.pipe(out)

  out.on('finish', () => {
    console.log(`Created: ${filename}`)
  })
}

try {
  const publicDir = path.join(__dirname, 'public')

  // Create public dir if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  drawIcon(192, path.join(publicDir, 'icon-192.png'))
  drawIcon(512, path.join(publicDir, 'icon-512.png'))
  drawIcon(192, path.join(publicDir, 'icon-maskable-192.png'))
  drawIcon(512, path.join(publicDir, 'icon-maskable-512.png'))

  console.log('All icons generated successfully!')
} catch (error) {
  console.log('Canvas not available, using fallback method...')

  // Fallback: create simple colored PNG files
  const fs = require('fs')
  const path = require('path')

  // Create a minimal valid PNG (1x1 purple pixel)
  // This is a workaround - the HTML generator should be used instead
  const publicDir = path.join(__dirname, 'public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  // For now, create placeholder - user should visit /generate-icons.html
  console.log('Please visit http://localhost:3000/generate-icons.html to generate icons')
}
