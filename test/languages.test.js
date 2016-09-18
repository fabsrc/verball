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
    if (err) t.fail(err)

    t.end()
  })
})

test.cb('Languages: are all listed correctly', t => {
  request(server)
    .get('/languages')
    .end((err, res) => {
      if (err) t.fail(err)

      t.is(res.status, 200)
      t.truthy(res.body)
      t.is(res.body.length, 3)
      t.true(res.body.every(l => l.code && l.name && l.nameEN))
      t.end()
    })
})

test.after.always('Language: cleanup database', t => {
  Language.remove({}, (err) => {
    if (err) t.fail(err)
  })
})
