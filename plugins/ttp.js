const { sticker } = require('../lib/sticker')
const { MessageType } = require('@adiwajshing/baileys')

let handler = async (m, { conn, text }) => {
  let teks = text ? text : m.quoted && m.quoted.text ? m.quoted.text : m.text
  await m.reply(global.wait)
  let stiker = await sticker(null, global.API('xteam', '/ttp', { file: '', text: teks }), global.packname, global.author)
  if (stiker) return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, false, { asSticker: true })
  throw stiker.toString()
}
handler.help = ['ttp <teks>']
handler.tags = ['sticker']

handler.command = /^ttp$/i

module.exports = handler
