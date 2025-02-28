let { webp2mp4 } = require('../lib/webp2mp4')
let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted) throw `balas stiker dengan caption *${usedPrefix + command}*`
    await m.reply(global.wait)
    let mime = m.quoted.mimetype || ''
    if (!/webp/.test(mime)) throw `balas stiker dengan caption *${usedPrefix + command}*`
    let media = await m.quoted.download()
    let out = Buffer.alloc(0)
    if (/webp/.test(mime)) {
        out = await webp2mp4(media)
    }
    await conn.sendFile(m.chat, out, 'out.gif', wm, m, false, { mimetype: 'video/gif', thumbnail: Buffer.alloc(0) })
}
handler.help = ['togif (reply)']
handler.tags = ['maker']
handler.command = /^(togif|tovideo)$/i

module.exports = handler
