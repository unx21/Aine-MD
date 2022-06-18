let { MessageType } = require('@adiwajshing/baileys')

const miningmoney = 5000
const timeout = 3600000

let handler = async (m, { conn, usedPrefix, text }) => {
	    let time = global.db.data.users[m.sender].lastmining + 3600000
  if (new Date - global.db.data.users[m.sender].lastmining< 3600000) throw `Anda sudah mengambil hadiah\ntunggu selama ${msToTime(time - new Date())} lagi`
	//let xpee = `${Math.floor(Math.random(global.db.data.users[m.sender].exp += miningxp) * 5000)}`.trim()
	// let moneyy = `${Math.floor(Math.random(global.db.data.users[m.sender].money += miningmoney) * 5000)}`.trim()
	//let limitt = `${Math.floor(Math.random(global.db.data.users[m.sender].limit += mininglimit) * 15)}`.trim()
	let moneyy = `${Math.floor(Math.random() * 5000)}`.trim()
	global.db.data.users[m.sender].uang += moneyy * 1
	global.db.data.users[m.sender].lastmining = new Date * 1
  m.reply(`Selamat kamu mendapatkan +Rp${moneyy}`)
  setTimeout(() => {
					conn.reply(m.chat, `Hadiah sudah bisa di dapatkan kembali`, m)
					}, timeout)
}
handler.help = ['mining']
handler.tags = ['main']
handler.command = /^(mining)/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null
handler.limit = false
handler.exp = 0
handler.money = 0

module.exports = handler

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    
  
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return hours + " jam " + minutes + " menit " + seconds + " detik"
}