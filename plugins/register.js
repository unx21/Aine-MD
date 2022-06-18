const { createHash } = require('crypto')
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { conn, text, usedPrefix }) {
  let user = global.db.data.users[m.sender]
  if (user.registered === true) throw `Anda sudah terdaftar\nMau daftar ulang? ${usedPrefix}unreg <SN|SERIAL NUMBER>`
  if (!Reg.test(text)) throw `Format salah\n*${usedPrefix}daftar nama.umur*`
  let [_, name, splitter, age] = text.match(Reg)
  if (!name) throw 'Nama tidak boleh kosong (Alphanumeric)'
  if (!age) throw 'Umur tidak boleh kosong (Angka)'
  age = parseInt(age)
  if (age > 60) throw 'Umur terlalu tua'
  if (age < 6) throw '.....'
  let __waktuh = (new Date - global.db.data.users[m.sender].reglast)
   let _waktuh = (+ 86400000 - __waktuh)
   let waktuh = clockString(_waktuh)
   if (new Date - global.db.data.users[m.sender].reglast > + 86400000) {
   user.reglast = new Date * 1
  user.name = name.trim()
  user.age = age
  user.regTime = + new Date
  user.registered = true
  let uang = global.db.data.users[m.sender].uang += 10000
// let nabungnye = global.db.data.users[m.sender].nabung += 100000
// let banknye = global.db.data.users[m.sender].bank += 1000000
// let petnye = global.db.data.users[m.sender].pet += 20
// let cuponye = global.db.data.users[m.sender].cupon += 10
// let legendarynye = global.db.data.users[m.sender].legendary += 50
// let boxs = global.db.data.users[m.sender].boxs += 50
// let berliannye = global.db.data.users[m.sender].berlian += 5
// let emasbatangnye = global.db.data.users[m.sender].emasbatang += 10
// let emasbiasanye = global.db.data.users[m.sender].emasbiasa += 15
// let botolnye = global.db.data.users[m.sender].botol += 10000
// let karudsnye = global.db.data.users[m.sender].kardus += 10000
// let kalengnye = global.db.data.users[m.sender].kaleng += 10000
// let anggurnye = global.db.data.users[m.sender].anggur += 10000
// let jeruknye = global.db.data.users[m.sender].jeruk += 10000
// let apelnye = global.db.data.users[m.sender].apel += 10000
// let pisangnye = global.db.data.users[m.sender].pisang += 10000
// let mangganye = global.db.data.users[m.sender].mangga += 10000
  let chatnye =`Selamat kamu mendapatkan Rp10000`
  let sn = createHash('md5').update(m.sender).digest('hex')
  m.reply(`
Daftar berhasil!

╭─「 Info 」
│ Nama: ${name}
│ Umur: ${age} tahun
│ SN: ${sn}
╰────

*Jika SN kamu lupa ketik ${usedPrefix}ceksn*

${chatnye}
`.trim())
} else m.reply(`Kamu sudah *daftar*..\nMohon tunggu ${waktuh} untuk bisa *daftar* kembali..`)
}
handler.help = ['daftar'].map(v => v + ' <nama>.<umur>')
handler.tags = ['main']

handler.command = /^(daftar|reg(ister)?)$/i

module.exports = handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  console.log({ms,h,m,s})
  return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')
}
