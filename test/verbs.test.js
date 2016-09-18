import test from 'ava'
import request from 'supertest'
import server from '../server'
import Verb from '../models/verb'

let verbs

test.before.cb('Verbs: seed database ', t => {
  Verb.insertMany([
    { infinitive: 'go', language: 'en' },
    { infinitive: 'walk', language: 'en' },
    { infinitive: 'swim', language: 'en' }
  ], (err, createdVerbs) => {
    verbs = createdVerbs
    t.ifError(err)
    t.end()
  })
})

test.serial.cb('Verbs: read collection', t => {
  request(server)
    .get('/verbs/')
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 200)
      t.truthy(res.body)
      t.is(res.body.length, 3)
      t.true(res.body.every(l => l.infinitive && l.language))
      t.end()
    })
})

test.serial.cb('Verbs: read single', t => {
  request(server)
    .get('/verbs/' + verbs[0]._id)
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 200)
      t.truthy(res.body)
      t.is(res.body.infinitive, 'go')
      t.truthy(res.body.language)
      t.is(res.body.language.code, 'en')
      t.end()
    })
})

test.serial.cb('Verbs: create', t => {
  request(server)
    .post('/verbs/')
    .send({ infinitive: 'test', language: 'en' })
    .set('Accept', 'application/json')
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 201)
      t.truthy(res.body)
      t.is(res.body.infinitive, 'test')
      t.is(res.body.language, 'en')

      Verb.count((err, count) => {
        t.ifError(err)
        t.is(count, 4)
        t.end()
      })
    })
})

test.serial.cb('Verbs: update', t => {
  request(server)
    .put('/verbs/' + verbs[0]._id)
    .send({ infinitive: 'try', language: 'En' })
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 200)
      t.is(res.body.infinitive, 'try')
      t.truthy(res.body.language)
      t.is(res.body.language, 'en')

      Verb.findById(verbs[0]._id, (err, verb) => {
        t.ifError(err)
        t.is(verb.infinitive, 'try')
        t.is(verb.language, 'en')
        t.end()
      })
    })
})

test.serial.cb('Verbs: delete', t => {
  request(server)
    .del('/verbs/' + verbs[0]._id)
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 204)

      Verb.count((err, count) => {
        t.ifError(err)
        t.is(count, 3)
        t.end()
      })
    })
})

test.after.always('Verbs: cleanup database', t => {
  Verb.remove({}, (err) => {
    t.ifError(err)
  })
})
