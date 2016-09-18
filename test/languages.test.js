import test from 'ava'
import request from 'supertest'
import server from '../server'
import Language from '../models/language'

test.before.cb('Languages: seed database ', t => {
  Language.insertMany([
    {_id: 'en', name: 'english', nameEN: 'english'},
    {_id: 'es', name: 'español', nameEN: 'spanish'},
    {_id: 'de', name: 'deutsch', nameEN: 'german'}
  ], (err) => {
    t.ifError(err)
    t.end()
  })
})

test.cb('Languages: read collection', t => {
  request(server)
    .get('/languages')
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 200)
      t.truthy(res.body)
      t.is(res.body.length, 3)
      t.true(res.body.every(l => l.code && l.name && l.nameEN))
      t.end()
    })
})

test.cb('Languages: read single', t => {
  request(server)
    .get('/languages/en')
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 200)
      t.truthy(res.body)
      t.is(res.body.code, 'en')
      t.is(res.body.name, 'english')
      t.is(res.body.nameEN, 'english')
      t.end()
    })
})

test.serial.cb('Language: create', t => {
  request(server)
    .post('/languages/')
    .send({ code: 'fr', name: 'Français', nameEN: 'french' })
    .set('Accept', 'application/json')
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 201)
      t.truthy(res.body)
      t.is(res.body.code, 'fr')
      t.is(res.body.name, 'français')
      t.is(res.body.nameEN, 'french')

      Language.count((err, count) => {
        t.ifError(err)
        t.is(count, 4)
        t.end()
      })
    })
})

test.serial.cb('Language: update', t => {
  request(server)
    .put('/languages/fr')
    .send({ name: 'frank', nameEN: 'Frank' })
    .end((err, res) => {
      t.ifError(err)
      t.is(res.status, 200)
      t.is(res.body.name, 'frank')
      t.is(res.body.nameEN, 'frank')

      Language.findById('fr', (err, language) => {
        t.ifError(err)
        t.is(language.name, 'frank')
        t.is(language.nameEN, 'frank')
        t.end()
      })
    })
})

test.serial.cb('Language: delete', t => {
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

test.after.always('Languages: cleanup database', t => {
  Language.remove({}, (err) => {
    t.ifError(err)
  })
})
