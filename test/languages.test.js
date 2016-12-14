import test from 'ava'
import request from 'supertest'
import server from '../server'
import { Language } from '../models'

test.skip.before.cb('Languages: seed database ', t => {
  Language.remove()
    .then(() => Language.insertMany([
      { _id: 'en', nativeName: 'English', name: 'english' },
      { _id: 'es', nativeName: 'Español', name: 'spanish' },
      { _id: 'de', nativeName: 'Deutsch', name: 'german' }
    ]))
    .catch(err => t.ifError(err))
    .then(() => t.end())
})

test.skip.serial.cb('Languages: read collection', t => {
  request(server)
    .get('/languages')
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 200)
      t.truthy(res.body)
      t.is(res.body.length, 3)
      t.true(res.body.every(l => l.code && l.name && l.nativeName))
      t.end()
    })
})

test.skip.serial.cb('Languages: read single', t => {
  request(server)
    .get('/languages/en')
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 200)
      t.truthy(res.body)
      t.is(res.body.code, 'en')
      t.is(res.body.name, 'english')
      t.is(res.body.nativeName, 'english')
      t.truthy(res.body.url)
      t.end()
    })
})

test.skip.serial.cb('Language: create', t => {
  request(server)
    .post('/languages/')
    .send({ code: 'fr', name: 'french', nativeName: 'Français' })
    .set('Accept', 'application/json')
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 201)
      t.truthy(res.body)
      t.is(res.body.code, 'fr')
      t.is(res.body.name, 'french')
      t.is(res.body.nativeName, 'français')

      Language.count((err, count) => {
        t.ifError(err)
        t.is(count, 4)
        t.end()
      })
    })
})

test.skip.serial.cb('Language: update', t => {
  request(server)
    .put('/languages/fr')
    .send({ name: 'frank', nativeName: 'Frank' })
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 200)
      t.is(res.body.name, 'frank')
      t.is(res.body.nativeName, 'frank')

      Language.findById('fr', (err, language) => {
        t.ifError(err)
        t.is(language.name, 'frank')
        t.is(language.nativeName, 'frank')
        t.end()
      })
    })
})

test.skip.serial.cb('Language: delete', t => {
  request(server)
    .del('/languages/fr')
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 204)

      Language.count((err, count) => {
        t.ifError(err)
        t.is(count, 3)
        t.end()
      })
    })
})

test.skip.after.always('Languages: cleanup database', t => {
  Language.remove({}, (err) => { t.ifError(err) })
})
