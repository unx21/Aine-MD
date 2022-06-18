const simple = require('./lib/simple')
const util = require('util')
const { color } = require('./lib/color')
const moment = require("moment-timezone")

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

module.exports = {
    async handler(chatUpdate) {
        if (global.db.data == null) await loadDatabase()
        this.msgqueque = this.msgqueque || []
        // console.log(chatUpdate)
        if (!chatUpdate) return
        this.pushMessage(chatUpdate.messages).catch(console.error)
        // if (!(chatUpdate.type === 'notify' || chatUpdate.type === 'append')) return
        let m = chatUpdate.messages[chatUpdate.messages.length - 1]
        if (!m) return
        // console.log(m)
        try {
            m = simple.smsg(this, m) || m
            if (!m) return
            // console.log(m)
            m.exp = 0
            m.limit = false
            try {
                let user = global.db.data.users[m.sender]
                if (typeof user !== 'object') global.db.data.users[m.sender] = {}
                if (user) {
                    if (!isNumber(user.exp)) user.exp = 0
                    if (!isNumber(user.limit)) user.limit = 10
                    if (!isNumber(user.money)) user.uang = 10000
                    if (!isNumber(user.lastclaim)) user.lastclaim = 0
                    if (!('registered' in user)) user.registered = false
                    if (!user.registered) {
                        if (!('name' in user)) user.name = m.name
                        if (!isNumber(user.age)) user.age = -1
                        if (!isNumber(user.regTime)) user.regTime = -1
                    }
                    if (!isNumber(user.afk)) user.afk = -1
                    if (!('afkReason' in user)) user.afkReason = ''
                    if (!('banned' in user)) user.banned = false
                    if (!('premium' in user)) user.premium = false
                    if (!isNumber(user.premiumDate)) user.premiumDate = 0
                    if (!isNumber(user.bannedDate)) user.bannedDate = 0
                    if (!isNumber(user.warn)) user.warn = 0
                    if (!isNumber(user.level)) user.level = 0
                    if (!('role' in user)) user.role = 'Beginner'
                    if (!('autolevelup' in user)) user.autolevelup = true

                } else global.db.data.users[m.sender] = {
                    exp: 0,
                    limit: 10,
                    uang: 10000,
                    lastclaim: 0,
                    registered: false,
                    name: m.name,
                    age: -1,
                    regTime: -1,
                    afk: -1,
                    afkReason: '',
                    banned: false,
                    premium: false,
                    warn: 0,
                    level: 0,
                    role: 'Beginner',
                    autolevelup: true
                }
                let chat = global.db.data.chats[m.chat]
                if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
                if (chat) {
                    if (!('isBanned' in chat)) chat.isBanned = false
                    if (!('welcome' in chat)) chat.welcome = false
                    if (!('detect' in chat)) chat.detect = false
                    if (!('sWelcome' in chat)) chat.sWelcome = ''
                    if (!('sBye' in chat)) chat.sBye = ''
                    if (!('sPromote' in chat)) chat.sPromote = ''
                    if (!('sDemote' in chat)) chat.sDemote = ''
                    if (!('delete' in chat)) chat.delete = true
                    if (!('antiLink' in chat)) chat.antiLink = false 
                    if (!('viewonce' in chat)) chat.viewonce = false
                    if (!('antiToxic' in chat)) chat.antiToxic = false
                    if (!isNumber(chat.expired)) chat.expired = 0
                } else global.db.data.chats[m.chat] = {
                    isBanned: false,
                    welcome: false,
                    detect: false,
                    sWelcome: '',
                    sBye: '',
                    sPromote: '',
                    sDemote: '',
                    delete: true,
                    antiLink: false,
                    viewonce: false,
                    antiToxic: false,
                    expired: 0,
                }
            } catch (e) {
                console.error(e)
            }
            if (opts['nyimak']) return
            if (!m.fromMe && opts['self']) return
            if (opts['pconly'] && m.chat.endsWith('g.us')) return
            if (opts['gconly'] && !m.chat.endsWith('g.us')) return
            if (opts['swonly'] && m.chat !== 'status@broadcast') return
            if (typeof m.text !== 'string') m.text = ''

            const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number, isCreator, isDeveloper]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
            const isOwner = isROwner || m.fromMe
            const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
            const isPrems = global.db.data.users[m.sender].premium
            const isBans = global.db.data.users[m.sender].banned

            if (opts['queque'] && m.text && !(isMods || isPrems)) {
                let queque = this.msgqueque, time = 1000 * 5
                const previousID = queque[queque.length - 1]
                queque.push(m.id || m.key.id)
                setInterval(async function () {
                    if (queque.indexOf(previousID) === -1) clearInterval(this)
                    else await delay(time)
                }, time)
            }

            // for (let name in global.plugins) {
            //     let plugin = global.plugins[name]
            //     if (!plugin) continue
            //     if (plugin.disabled) continue
            //     if (!plugin.all) continue
            //     if (typeof plugin.all !== 'function') continue
            //     try {
            //         await plugin.all.call(this, m, chatUpdate)
            //     } catch (e) {
            //         if (typeof e === 'string') continue
            //         console.error(e)
            //     }
            // }

            if (m.isBaileys) return 
            if (m.chat.endsWith('broadcast')) return
            m.exp += Math.ceil(Math.random() * 10)

            let usedPrefix
            let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

            const groupMetadata = (m.isGroup ? (conn.chats[m.chat] || {}).metadata : {}) || {}
        //    const groupMetadata = (m.isGroup ? (conn.chats[m.chat].metadata || await conn.groupMetadata(m.chat)): {}) || {}
            const participants = (m.isGroup ? groupMetadata.participants : []) || []
            const user = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : {}) || {} // User Data
            const bot = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) == this.user.jid) : {}) || {} // Your Data
            const isRAdmin = user && user.admin == 'superadmin' || false
            const isAdmin = isRAdmin || user && user.admin == 'admin' || false // Is User Admin?
            const isBotAdmin = bot && bot.admin || false // Are you Admin?
            for (let name in global.plugins) {
                let plugin = global.plugins[name]
                if (!plugin) continue
                if (plugin.disabled) continue
                if (typeof plugin.all === 'function') {
                    try {
                        await plugin.all.call(this, m, chatUpdate)
                    } catch (e) {
                        // if (typeof e === 'string') continue
                        console.error(e)
                    }
                }
                if (!opts['restrict']) if (plugin.tags && plugin.tags.includes('admin')) {
                    // global.dfail('restrict', m, this)
                    continue
                }
                const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
                let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
                let match = (_prefix instanceof RegExp ? // RegExp Mode?
                    [[_prefix.exec(m.text), _prefix]] :
                    Array.isArray(_prefix) ? // Array?
                        _prefix.map(p => {
                            let re = p instanceof RegExp ? // RegExp in Array?
                                p :
                                new RegExp(str2Regex(p))
                            return [re.exec(m.text), re]
                        }) :
                        typeof _prefix === 'string' ? // String?
                            [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                            [[[], new RegExp]]
                ).find(p => p[1])
                if (typeof plugin.before === 'function') if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    isBans,
                    chatUpdate,
                })) continue
                if (typeof plugin !== 'function') continue
                if ((usedPrefix = (match[0] || '')[0])) {
                    let noPrefix = m.text.replace(usedPrefix, '')
                    let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                    args = args || []
                    let _args = noPrefix.trim().split` `.slice(1)
                    let text = _args.join` `
                    command = (command || '').toLowerCase()
                    let fail = plugin.fail || global.dfail // When failed
                    let isAccept = plugin.command instanceof RegExp ? // RegExp Mode?
                        plugin.command.test(command) :
                        Array.isArray(plugin.command) ? // Array?
                            plugin.command.some(cmd => cmd instanceof RegExp ? // RegExp in Array?
                                cmd.test(command) :
                                cmd === command
                            ) :
                            typeof plugin.command === 'string' ? // String?
                                plugin.command === command :
                                false

                    if (!isAccept) continue
                    m.plugin = name
                    if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                        let chat = global.db.data.chats[m.chat]
                        let user = global.db.data.users[m.sender]
                        if (name != 'unbanchat.js' && chat && chat.isBanned) return // Except this
                        if (name != 'unbanuser.js' && user && user.banned) return
                    }
                    if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { // Both Owner
                        fail('owner', m, this)
                        continue
                    }
                    if (plugin.rowner && !isROwner) { // Real Owner
                        fail('rowner', m, this)
                        continue
                    }
                    if (plugin.owner && !isOwner) { // Number Owner
                        fail('owner', m, this)
                        continue
                    }
                    if (plugin.mods && !isMods) { // Moderator
                        fail('mods', m, this)
                        continue
                    }
                    if (plugin.premium && !isPrems) { // Premium
                        fail('premium', m, this)
                        continue
                    }
                    if (plugin.banned && !isBans) { // Banned
                        fail('banned', m, this)
                        continue
                    }
                    if (plugin.group && !m.isGroup) { // Group Only
                        fail('group', m, this)
                        continue
                    } else if (plugin.botAdmin && !isBotAdmin) { // You Admin
                        fail('botAdmin', m, this)
                        continue
                    } else if (plugin.admin && !isAdmin) { // User Admin
                        fail('admin', m, this)
                        continue
                    }
                    if (plugin.private && m.isGroup) { // Private Chat Only
                        fail('private', m, this)
                        continue
                    }
                    if (plugin.register == true && _user.registered == false) { // Butuh daftar?
                        fail('unreg', m, this)
                        continue
                    }
                    m.isCommand = true
                    let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17 // XP Earning per command
                    if (xp > 9999999999999999999999) m.reply('Ngecit -_-') // Hehehe
                    else m.exp += xp
                    if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
                     //   this.reply(m.chat, `Limit anda habis, silahkan beli melalui *${usedPrefix}buy*`, m)
                        this.sendButton(m.chat, `Limit anda habis, silahkan beli melalui *${usedPrefix}buyall* atau *${usedPrefix}hadiah*`, author, null, [['Buy Limit', '/buyall'], ['Hadiah', '/hadiah']], m)
                        continue // Limit habis
                    }
                    if (plugin.level > _user.level) {
                        this.reply(m.chat, `diperlukan level ${plugin.level} untuk menggunakan perintah ini. Level kamu ${_user.level}`, m)
                        continue // If the level has not been reached
                    }
                    let extra = {
                        match,
                        usedPrefix,
                        noPrefix,
                        _args,
                        args,
                        command,
                        text,
                        conn: this,
                        participants,
                        groupMetadata,
                        user,
                        bot,
                        isROwner,
                        isOwner,
                        isRAdmin,
                        isAdmin,
                        isBotAdmin,
                        isPrems,
                        isBans,
                        chatUpdate,
                    }
                    try {
                        await plugin.call(this, m, extra)
                        if (!isPrems) m.limit = m.limit || plugin.limit || false
                    } catch (e) {
                        // Error occured
                        m.error = e
                        console.error(e)
                        if (e) {
                            let text = util.format(e)
                            for (let key of Object.values(global.APIKeys))
                                text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                            if (e.name) for (let [jid] of global.owner.filter(([number, isCreator, isDeveloper]) => isDeveloper && number)) {
                                let data = (await conn.onWhatsApp(jid))[0] || {}
                                if (data.exists) m.reply(`*Plugin:* ${m.plugin}\n*Sender:* ${m.sender}\n*Chat:* ${m.chat}\n*Command:* ${usedPrefix}${command} ${args.join(' ')}\n\n\`\`\`${text}\`\`\``.trim(), data.jid)
                            }
                            m.reply(text)
                        }
                    } finally {
                        // m.reply(util.format(_user))
                        if (typeof plugin.after === 'function') {
                            try {
                                await plugin.after.call(this, m, extra)
                            } catch (e) {
                                console.error(e)
                            }
                        }
                       // if (m.limit) m.reply(+ m.limit + ' Limit used')
                    }
                    break
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
            if (opts['queque'] && m.text) {
                const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
                if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
            }
            //console.log(global.db.data.users[m.sender])
            let user, stats = global.db.data.stats
            if (m) {
                if (m.sender && (user = global.db.data.users[m.sender])) {
                    user.exp += m.exp
                    user.limit -= m.limit * 1
                }

                let stat
                if (m.plugin) {
                    let now = + new Date
                    if (m.plugin in stats) {
                        stat = stats[m.plugin]
                        if (!isNumber(stat.total)) stat.total = 1
                        if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1
                        if (!isNumber(stat.last)) stat.last = now
                        if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
                    } else stat = stats[m.plugin] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                    stat.total += 1
                    stat.last = now
                    if (m.error == null) {
                        stat.success += 1
                        stat.lastSuccess = now
                    }
                }
            }

            // try {
            //     require('./lib/print')(m, this)
            // } catch (e) {
            //     console.log(m, m.quoted, e)
            // }
            if (opts['autoread']) await this.chatRead(m.chat, m.isGroup ? m.sender : undefined, m.id || m.key.id).catch(() => { })
        }
    },
    async participantsUpdate({ id, participants, action }) {
        if (opts['self']) return
        // if (id in conn.chats) return // First login will spam
        if (global.isInit) return
        let chat = global.db.data.chats[id] || {}
        let text = ''
        switch (action) {
            case 'add':
            case 'remove':
                if (chat.welcome) {
                    let groupMetadata = await this.groupMetadata(id) || (conn.chats[id] || {}).metadata
                    for (let user of participants) {
                        let pp = './src/avatar_contact.png'
                        try {
                            pp = await this.profilePictureUrl(user)
                        } catch (e) {
                        } finally {
                            text = (action === 'add' ? (chat.sWelcome || this.welcome || conn.welcome || 'Welcome, @user!').replace('@subject', await this.getName(id)).replace('@desc', groupMetadata.desc.toString()) :
                                (chat.sBye || this.bye || conn.bye || 'Bye, @user!')).replace('@user', '@' + user.split('@')[0])
                            this.sendFile(id, pp, 'pp.jpg', text, null, false, { mentions: [user] })
                        }
                    }
                }
                break
        case 'promote':
            text = (chat.sPromote || this.spromote || conn.spromote || '@user ```is now Admin```')
        case 'demote':
            if (!text)
                text = (chat.sDemote || this.sdemote || conn.sdemote || '@user ```is no longer Admin```')
            text = text.replace('@user', '@' + participants[0].split('@')[0])
            if (chat.detect)
                this.sendMessage(id, { text, mentions: this.parseMention(text) })
            break
        }
    },
    async delete(message) {
        try {
            const { fromMe, id, participant } = message
            if (fromMe) return
            let chats = Object.entries(conn.chats).find(([_, data]) => data.messages?.[id])
            if (!chats) return
            let msg = chats instanceof String ? JSON.parse(chats[1].messages[id]) : chats[1].messages[id]
            let chat = global.db.data.chats[msg.key.remoteJid] || {}
            if (chat.delete) return
            await this.reply(msg.key.remoteJid, `
Terdeteksi @${participant.split`@`[0]} telah menghapus pesan
Untuk mematikan fitur ini, ketik
*.enable delete*
`.trim(), msg, {
                mentions: [participant]
            })
            this.copyNForward(msg.key.remoteJid, msg).catch(e => console.log(e, msg))
        } catch (e) {
            console.error(e)
        }
    }
},

/*
conn.ws.on('CB:call', async (json) => {
    console.log(json.content)
    const callerId = json.content[0].attrs['call-creator']
    if (json.content[0].tag == 'offer') {
    let pa7rick = await conn.sendContact(callerId, global.owner)
    conn.sendMessage(callerId, { text: `Sistem otomatis block!\nJangan menelpon bot!\nSilahkan Hubungi Owner Untuk Dibuka !`}, { quoted : pa7rick })
    await sleep(8000)
    await conn.updateBlockStatus(callerId, "block")
    }
    })*/
/*async onCall(json) {
    let { from } = json[2][0][1]
    let users = global.db.data.users
    let user = users[from] || {}
    if (user.whitelist) return
    switch (this.callWhitelistMode) {
      case 'mycontact':
        if (from in this.contacts && 'short' in this.contacts[from])
          return
        break
    }
    await this.sendMessage(from, 'Maaf, karena anda menelfon bot. anda diblokir otomatis', MessageType.extendedText)
    await this.updateBlockStatus(from, 'block')
  }
}*/

global.dfail = (type, m, conn) => {
    let msg = {
        rowner: 'Perintah ini hanya dapat digunakan oleh _*OWWNER!1!1!*_',
        owner: 'Perintah ini hanya dapat digunakan oleh _*Owner Bot*_!',
        mods: 'Perintah ini hanya dapat digunakan oleh _*Moderator*_ !',
        premium: '*Premium*\n1 Months *IDR 10000*\n1 Years *IDR 90000*\n\nHubungi *owner* kami..', 
        banned: 'Perintah ini hanya untuk pengguna yang terbanned..',
        group: 'Perintah ini hanya dapat digunakan di grup!',
        private: 'Perintah ini hanya dapat digunakan di Chat Pribadi!',
        admin: 'Perintah ini hanya untuk *Admin* grup!',
        botAdmin: 'Jadikan bot sebagai *Admin* untuk menggunakan perintah ini!',
        unreg: 'Silahkan daftar untuk menggunakan fitur ini dengan cara mengetik:\n\n*#daftar nama.umur*\n\nContoh: *#daftar Manusia.16*',
        restrict: 'Fitur ini di *disable*!'
    }[type]
    if (msg) return m.reply(msg)
}

let fs = require('fs')
let chalk = require('chalk')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright("Update 'handler.js'"))
    delete require.cache[file]
    if (global.reloadHandler) console.log(global.reloadHandler())
})
