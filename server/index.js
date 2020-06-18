const express = require('express')
const parser = require('body-parser')
const cors = require('cors')
const passwordHash = require('password-hash')
const jwt = require('jsonwebtoken')
const SECRET = 'irsecret'

const port = process.env.PORT || 3000

let db = require('knex')({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'root',
    password : 'root',
    database : 'image-recognizer'
  }
})

let app = express()

app.use(cors())
app.use(parser.json({limit: '50mb'}))

app.use(express.static('public'))

app.post('/login', (req, res) => {
  let username = req.body.username
  let password = req.body.password
  let hashedPassword = passwordHash.generate(password)

  db.select().from('users').where({
    username: username
  }).then(data => {
    if (data.length > 0 && passwordHash.verify(password, data[0].password)) {
      
      let token = jwt.sign({ id: data[0].id, username: username }, SECRET)
      db.select().from('models').where({
        user_id: data[0].id
      }).then(models => {
        res.json({
          status: 'success',
          message: 'Đăng nhập thành công.',
          data: {
            token: token,
            models: models
          }
        })
      }).catch(e => {
        res.json({
          status: 'success',
          message: 'Đăng nhập thành công.',
          data: {
            token: token,
            models: []
          }
        })
      })
    } else {
      res.json({
        status: 'error',
        message: 'Tài khoản hoặc mật khẩu không đúng.',
        data: {
          error: e.message
        }
      })
    }
  }).catch(e => {
    res.json({
      status: 'error',
      message: 'Tài khoản hoặc mật khẩu không đúng.',
      data: {
        error: e.message
      }
    })
  })
})

app.post('/register', (req, res) => {
  let username = req.body.username
  let password = req.body.password

  db.select().from('users').where({
    username: username
  }).then(data => {
    if (data.length > 0) {
      res.json({
        status: 'error',
        message: 'Tài khoản đã tồn tại.',
        data: {}
      })
    } else {
      let hashedPassword = passwordHash.generate(password)
      db('users').insert({username: username, password: hashedPassword})
      .then(u => {
        let token = jwt.sign({ id: u.id, username: username }, SECRET)

        res.json({
          status: 'success',
          message: 'Đăng ký tài khoản thành công.',
          data: {
            token: token
          }
        })
      }).catch(e => {
        res.json({
          status: 'error',
          message: 'Tài khoản đã tồn tại.',
          data: {}
        })
      })  
    }
  })

})

app.post('/publish', (req, res) => {
  let token = req.body.token
  let model = req.body.model
  let id = req.body.id
  let name = req.body.name

  try {
    let decoded = jwt.verify(token, SECRET);
    return db.select().from('models').where({
      id: id,
      user_id: decoded.id
    }).then(data => {
      if (data.length > 0) {
        db('models')
          .where('id', '=', id)
          .update({
            data: model,
            name: name
          })
          .then(m => {
            res.json({
              status: 'success',
              message: 'Lưu mô hình thành công.',
              data: {
                model: m[0]
              }
            })
          }).catch(e => {
            res.json({
              status: 'error',
              message: 'Đã có lỗi xảy ra.',
              data: {
                error: e.message
              }
            })
          })
      } else {
        db('models').insert({user_id: decoded.id, data: model, name: name})
          .then(m => {
            res.json({
              status: 'success',
              message: 'Lưu mô hình thành công.',
              data: {
                model: m[0]
              }
            })
          }).catch(e => {
            res.json({
              status: 'error',
              message: 'Đã có lỗi xảy ra.',
              data: {
                error: e.message
              }
            })
          })  
      }
    }).catch(e =>{
      res.json({
        status: 'error',
        message: 'Đã có lỗi xảy ra.',
        data: {
          error: e.message
        }
      })
    })
  } catch(err) {
    res.json({
      status: 'error',
      message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      data: {}
    })
  }
})

app.get('/model/:id', (req, res) => {
  let id = req.params.id
  db.select().from('models').where({
    id: id
  }).then(data => {
    if (data.length > 0) {
      res.json({
        status: 'success',
        message: 'Lấy mô hình thành công.',
        data: {
          model: data[0]
        }
      })
    } 
  }).catch(e => {
    res.json({
      status: 'error',
      message: 'Đã có lỗi xảy ra.',
      data: {
        error: e.message
      }
    })
  })
})

app.delete('/model/:id', (req, res) => {
  let id = req.params.id
  let token = req.body.token

  try {
    var decoded = jwt.verify(token, SECRET);
    
    db('models')
      .where({
        id: id,
        user_id: decoded.id
      })
      .del().then(data => {
        res.json({
          status: 'success',
          message: 'Đã xoá mô hình.',
          data: {}
        })
      }).catch(e => {
        res.json({
          status: 'error',
          message: 'Đã có lỗi xảy ra.',
          data: {}
        })
      })
  } catch(err) {
    res.json({
      status: 'error',
      message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      data: {}
    })
  }
})

app.post('/model', (req, res) => {
  let token = req.body.token

  try {
    var decoded = jwt.verify(token, SECRET);
    return db.select().from('models').where({
      user_id: decoded.id
    }).then(data => {
      res.json({
        status: 'success',
        message: 'Lấy mô hình thành công.',
        data: {
          models: data
        }
      })
    }).catch(e =>{
      res.json({
        status: 'error',
        message: 'Đã có lỗi xảy ra.',
        data: {
          error: e.message
        }
      })
    })
  } catch(err) {
    res.json({
      status: 'error',
      message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      data: {}
    })
  }
})

app.listen(port, function() {
  console.log(`Listening at port ${port}`)
})