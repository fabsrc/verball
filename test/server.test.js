import test from 'ava'
import request from 'supertest'
import server from '../server'

test.cb('hello world', t => {
  request(server)
    .get('/')
    .end((err, res) => {
      if (err) t.fail()

      t.truthy(res.body)
      t.end()
    })
})
