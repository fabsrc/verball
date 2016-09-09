import test from 'ava'
import request from 'supertest'
import server from '../server'

test.cb('hello world', t => {
  request(server)
    .get('/')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) t.fail()

      t.truthy(res.body)
      t.is(res.body.hello, 'world')
      t.end()
    })
})
