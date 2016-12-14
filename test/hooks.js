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
        pronouns: {
          's1': 'I',
          'p1': 'we',
          's2': 'you',
          'p2': 'you',
          's3m': 'he',
          's3f': 'she',
          's3n': 'it',
          'p3': 'they'
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
        pronouns: {
          's1': 'ich',
          'p1': 'wir',
          's2': 'du',
          'p2': 'ihr',
          's3m': 'er',
          's3f': 'sie',
          's3n': 'es',
          'p3': 'sie',
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
            's1': 'go',
            's2': 'go',
            's3m': 'goes'
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
            's1': 'gehe',
            's2': 'gehst',
            's3m': 'geht'
          }
        }
      },
      {
        _id: Types.ObjectId('5849eb774a5d2f244f416e6a'),
        infinitive: 'fahren',
        language: 'de',
        conjugations: {
          present: {
            's1': 'fahre',
            's2': 'fährst',
            's3m': 'fährt'
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
