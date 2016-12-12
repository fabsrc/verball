import mongoose from 'mongoose'
import { Language, Verb } from '../models'

mongoose.Promise = global.Promise
mongoose.connect(process.env.DB || 'mongodb://localhost/verball')

const languages = [
  { _id: 'en', name: 'english', nativeName: 'english' },
  { _id: 'de', name: 'german', nativeName: 'deutsch' },
  { _id: 'fr', name: 'french', nativeName: 'français' }
]

const verbsEn = [
  { infinitive: 'go', language: 'en' },
  { infinitive: 'look', language: 'en' },
  { infinitive: 'sleep', language: 'en' }
]

const verbsDe = [
  { infinitive: 'gehen', language: 'de' },
  { infinitive: 'schauen', language: 'de' },
  { infinitive: 'schlafen', language: 'de' }
]

const verbsFr = [
  { infinitive: 'aller', language: 'fr' },
  { infinitive: 'regarder', language: 'fr' },
  { infinitive: 'dormir', language: 'fr' }
]

const translationsEnDe = [
  [{ infinitive: 'go', language: 'en' }, { infinitive: 'gehen', language: 'de' }],
  [{ infinitive: 'look', language: 'en' }, { infinitive: 'schauen', language: 'de' }],
  [{ infinitive: 'schlafen', language: 'de' }, { infinitive: 'sleep', language: 'en' }]
]

Language.insertMany(languages)
  .then(res => Verb.insertMany([...verbsEn, ...verbsDe, ...verbsFr]))
  .then(res => {
    return Promise.all(translationsEnDe.map(trans => new Promise((resolve, reject) => {
      Verb.linkTranslations(...trans, (err, res) => {
        if (err) return reject(err)

        return resolve(res)
      })
    })))
  })
  .then(() => {
    console.log('Seed successful!')
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(0)
  })
