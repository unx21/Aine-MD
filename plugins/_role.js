/*let handler = m => m

handler.before = function (m) {
  let user = global.db.data.users[m.sender]
        let role = (user.level <= 20) ? 'Beginner'
          : ((user.level >= 20) && (user.level <= 40)) ? 'Commander Elite'
          : ((user.level >= 40) && (user.level <= 60)) ? 'The Commander Hero'
          : ((user.level >= 60) && (user.level <= 80)) ? 'The Commander Elite Hero'
          : ((user.level >= 80) && (user.level <= 100)) ? 'The Commander Elite Super Strong Hero'
          : ((user.level >= 100) && (user.level <= 120)) ? 'The Commander Elite Super Strong Shadow Hero'
          : ((user.level >= 120) && (user.level <= 140)) ? 'The Commander Legends Shadow Hero'
          : ((user.level >= 140) && (user.level <= 160)) ? 'The Commander Super Legends Shadow Hero'
          : 'Legends'
  user.role = role
  return true
}

module.exports = handler*/

const roles = {
  /*
  'Role Name': <Minimal Level To Obtain this Role>
  */
  'A': 0, 
  'B': 5,
  'C': 10,
  'D': 15,
  'E': 20,
  'F': 25,
  'G': 30,
  'H': 40,
  'I': 50,
  'J': 60,
  'K': 70,
  'L': 80,
  'M': 90,
  'N': 100
}

module.exports = {
  before (m) {
    let user = global.db.data.users[m.sender]
    let level = user.level
    let role = (Object.entries(roles).sort((a, b) => b[1] - a[1]).find(([,minLevel]) => level >= minLevel) || Object.entries(roles)[0])[0]
    user.role = role
    return true
  }
}
