import hooks from 'hooks'
import mongoose, { Types } from 'mongoose'
import { Language, Verb } from '../models'

mongoose.Promise = global.Promise
mongoose.connect(process.env.DB || 'mongodb://localhost/verball')

hooks.beforeEach((transaction, done) => {
  Language.remove()
    .then(() => Language.insertMany([
      { _id: 'en', nativeName: 'English', name: 'english' },
      { _id: 'de', nativeName: 'Deutsch', name: 'german' }
    ]))
    .catch(err => console.error(err))
    .then(() => done())
})

hooks.beforeEach((transaction, done) => {
  Verb.remove()
    .then(() => Verb.collection.insertMany([
      { _id: Types.ObjectId('5849da8acb46ec150a090068'), infinitive: 'go', language: 'en', translations: [Types.ObjectId('5849dfbbfa380e1a36daf91d')] },
      { _id: Types.ObjectId('5849dfbbfa380e1a36daf91d'), infinitive: 'gehen', language: 'de', translations: [Types.ObjectId('5849da8acb46ec150a090068')] },
      { _id: Types.ObjectId('5849eb774a5d2f244f416e6a'), infinitive: 'fahren', language: 'de' }
    ], (err, docs) => {
      if (err) return console.error(err)
      return done()
    }))
    .catch(err => console.error(err))
})

hooks.afterAll((transaction, done) => {
  Promise.all([
    Language.remove(),
    Verb.remove()
  ])
  .catch(err => console.error(err))
  .then(() => done())
})
