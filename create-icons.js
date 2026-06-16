const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

function createPNGIcon(size, filename) {
  const pixels = []
  const g1 = [192, 38, 211]
  const g2 = [162, 28, 175]

  for (let y = 0; y < size; y++) {
    pixels.push(0)
    for (let x = 0; x < size; x++) {
      const t = (x + y) / (2 * size)
      pixels.push(
        Math.round(g1[0] + (g2[0] - g1[0]) * t),
        Math.round(g1[1] + (g2[1] - g1[1]) * t),
        Math.round(g1[2] + (g2[2] - g1[2]) * t),
        255
      )
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(pixels))

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size >>> 0, 0)
  ihdr.writeUInt32BE(size >>> 0, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  function crc32(buf) {
    let c = 0
    for (let i = 0; i < 256; i++) {
      c = i
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    const table = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
      table[i] = c
    }
    let crc = 0xFFFFFFFF
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
    }
    return (crc ^ 0xFFFFFFFF) >>> 0
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length >>> 0, 0)
    const typeBuf = Buffer.from(type)
    const crcData = Buffer.concat([typeBuf, data])
    const crc = crc32(crcData)
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc, 0)
    return Buffer.concat([len, typeBuf, data, crcBuf])
  }

  const png = Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ])

  fs.writeFileSync(filename, png)
  console.log(`Created: ${filename} (${size}x${size})`)
}

const pub = path.join(__dirname, 'public')
if (!fs.existsSync(pub)) fs.mkdirSync(pub, { recursive: true })

createPNGIcon(192, path.join(pub, 'icon-192.png'))
createPNGIcon(512, path.join(pub, 'icon-512.png'))
createPNGIcon(192, path.join(pub, 'icon-maskable-192.png'))
createPNGIcon(512, path.join(pub, 'icon-maskable-512.png'))

console.log('Done!')
