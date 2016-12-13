import hooks from 'hooks'
import mongoose, { Types } from 'mongoose'
import { Language, Verb } from '../models'

mongoose.Promise = global.Promise
mongoose.connect(process.env.DB || 'mongodb://localhost/verball_test')

hooks.beforeEach((transaction, done) => {
  Language.remove()
    .then(() => Language.insertMany([
      {
        _id: 'en',
        nativeName: 'English',
        name: 'english',
        'pronouns': {
          '1s': 'I',
          '1p': 'we',
          '2s': 'you',
          '2p': 'you',
          '3ms': 'he',
          '3fs': 'she',
          '3ns': 'it'
        },
        tenses: [
          {
            name: 'present',
            nativeName: 'present'
          },
          {
            name: 'simple past',
            nativeName: 'simple past'
          }
        ]
      },
      {
        _id: 'de',
        nativeName: 'Deutsch',
        name: 'german',
        'pronouns': {
          '1s': 'ich',
          '1p': 'wir',
          '2s': 'du',
          '2p': 'ihr',
          '3ms': 'er',
          '3fs': 'sie',
          '3ns': 'es',
          'form': 'Sie'
        },
        tenses: [
          {
            name: 'present',
            nativeName: 'Präsens'
          },
          {
            name: 'simple past',
            nativeName: 'Präteritum'
          }
        ]
      }
    ]))
    .catch(err => console.error(err))
    .then(() => done())
})

hooks.beforeEach((transaction, done) => {
  Verb.remove()
    .then(() => Verb.collection.insertMany([
      {
        _id: Types.ObjectId('5849da8acb46ec150a090068'),
        infinitive: 'go',
        language: 'en',
        translations: [Types.ObjectId('5849dfbbfa380e1a36daf91d')],
        conjugations: {
          present: {
            '1s': 'go',
            '2s': 'go',
            '3ms': 'goes'
          }
        }
      },
      {
        _id: Types.ObjectId('5849dfbbfa380e1a36daf91d'),
        infinitive: 'gehen',
        language: 'de',
        translations: [Types.ObjectId('5849da8acb46ec150a090068')],
        conjugations: {
          present: {
            '1s': 'gehe',
            '2s': 'gehst',
            '3ms': 'geht'
          }
        }
      },
      {
        _id: Types.ObjectId('5849eb774a5d2f244f416e6a'),
        infinitive: 'fahren',
        language: 'de',
        conjugations: {
          present: {
            '1s': 'fahre',
            '2s': 'fährst',
            '3ms': 'fährt'
          }
        }
      }
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
