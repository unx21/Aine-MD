let handler = async m => m.reply(`
╭─「 K O S O N G 」
│ •  [KOSONG YEEEYY]
│ •  [KOSONG YEEYY]
╰────
`.trim()) // Tambah sendiri kalo mau
handler.help = ['donasi']
handler.tags = ['info']
handler.command = /^dona(te|si)$/i

module.exports = handler