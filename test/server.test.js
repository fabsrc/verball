import test from 'ava'
import request from 'supertest'
import server from '../server'

test.cb('Server: is available', t => {
  request(server)
    .get('/')
    .end((err, res) => {
      t.ifError(err)
      t.truthy(res.body)
      t.end()
    })
})
