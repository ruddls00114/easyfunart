const jwt = require('jsonwebtoken')


exports.generateToken = function generateToken(secret, user) {
  return new Promise((resolve, reject) => {
    const payload = {
      userID: user[0].user_id,
      userProfile: user[0].user_profile,
      userNickname: user[0].user_nickname,
    }
    const token = jwt.sign(payload, secret, {
      issuer: 'EasyFunArt',
      algorithm: 'HS256',
      expiresIn: 3600 * 24 * 10 * 10, // 토큰의 유효기간이 100일
    }, (err, token) => {
      if (err) {
        reject('token generate error')
      }
      resolve(token)
    })
  })
}

exports.decodedToken = function decodedToken(token, secret) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        if(err.message === 'jwt expired') reject('token expired')
        else if(err.message === 'invalid token') reject('invalid token')
      } else {
        resolve(decoded)
      }
    })
    // reject(e)
  })
}
