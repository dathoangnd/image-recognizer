const jwtDecode = require('jwt-decode')

module.exports = () => {
  let token = localStorage.irToken
  try {
    return jwtDecode(token)
  } catch(e) {
    // Silence is golden
  }
  return {}
}