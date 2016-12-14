import mongoose from 'mongoose'
import { Language, Verb } from '../models'

mongoose.Promise = global.Promise
mongoose.connect(process.env.DB || 'mongodb://localhost/verball')

const languages = [
  {
    '_id': 'en',
    'name': 'english',
    'nativeName': 'english',
    'pronouns': {
      's1': 'I',
      'p1': 'we',
      's2': 'you',
      'p2': 'you',
      's3m': 'he',
      's3f': 'she',
      's3n': 'it',
      'p3': 'they'
    },
    'tenses': [
      {
        'name': 'simple past',
        'nativeName': 'simple past',
        '_id': 'simplePast'
      },
      {
        'name': 'present',
        'nativeName': 'present',
        '_id': 'present'
      }
    ]
  },
  {
    '_id': 'de',
    'name': 'german',
    'nativeName': 'deutsch',
    'pronouns': {
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
    'tenses': [
      {
        'name': 'simple past',
        'nativeName': 'Präteritum',
        '_id': 'simplePast'
      },
      {
        'name': 'present',
        'nativeName': 'Präsens',
        '_id': 'present'
      }
    ]
  },
  {
    '_id': 'fr',
    'name': 'french',
    'nativeName': 'français',
    'pronouns': {
      's1': 'je',
      'p1': 'nous',
      's2': 'tu',
      'p2': 'vous',
      's3m': 'il',
      's3f': 'elle',
      'p3m': 'ils',
      'p3f': 'elles',
      'form': 'vous'
    },
    'tenses': [
      {
        'name': 'simple past',
        'nativeName': 'passé simple',
        '_id': 'simplePast'
      },
      {
        'name': 'present',
        'nativeName': 'présent',
        '_id': 'present'
      }
    ]
  }
]

const verbsEn = [
  {
    infinitive: 'go',
    language: 'en',
    conjugations: {
      present: {
        s1: 'go',
        p1: 'go',
        s2: 'go',
        p2: 'go',
        s3m: 'goes',
        s3f: 'goes',
        s3n: 'goes',
        p3: 'go'
      }
    }
  },
  {
    infinitive: 'look',
    language: 'en',
    conjugations: {
      present: {
        s1: 'look',
        p1: 'look',
        s2: 'look',
        p2: 'look',
        s3m: 'looks',
        s3f: 'looks',
        s3n: 'looks',
        p3: 'look'
      }
    }
  },
  {
    infinitive: 'sleep',
    language: 'en',
    conjugations: {
      present: {
        s1: 'sleep',
        p1: 'sleep',
        s2: 'sleep',
        p2: 'sleep',
        s3m: 'sleeps',
        s3f: 'sleeps',
        s3n: 'sleeps',
        p3: 'sleep'
      }
    }
  }
]

const verbsDe = [
  {
    infinitive: 'gehen',
    language: 'de',
    conjugations: {
      present: {
        s1: 'gehe',
        p1: 'gehen',
        s2: 'gehst',
        p2: 'geht',
        s3m: 'geht',
        s3f: 'geht',
        s3n: 'geht',
        p3: 'gehen',
        form: 'gehen'
      }
    }
  },
  {
    infinitive: 'schauen',
    language: 'de',
    conjugations: {
      present: {
        s1: 'schaue',
        p1: 'schauen',
        s2: 'schaust',
        p2: 'schaut',
        s3m: 'schaut',
        s3f: 'schaut',
        s3n: 'schaut',
        p3: 'schauen',
        form: 'schauen'
      }
    }
  },
  {
    infinitive: 'schlafen',
    language: 'de',
    conjugations: {
      present: {
        s1: 'schlafe',
        p1: 'schlafen',
        s2: 'schläfst',
        p2: 'schlaft',
        s3m: 'schläft',
        s3f: 'schläft',
        s3n: 'schläft',
        p3: 'schlafen',
        form: 'schlafen'
      }
    }
  }
]

const verbsFr = [
  { infinitive: 'aller',
    language: 'fr',
    conjugations: {
      present: {
        s1: 'vais',
        p1: 'allons',
        s2: 'vas',
        p2: 'allez',
        s3m: 'va',
        s3f: 'va',
        p3: 'vont',
        form: 'allez'
      }
    }
  },
  { infinitive: 'regarder',
    language: 'fr',
    conjugations: {
      present: {
        s1: 'regarde',
        p1: 'regardons',
        s2: 'regardes',
        p2: 'regardez',
        s3m: 'regarde',
        s3f: 'regarde',
        p3: 'regardent',
        form: 'regardez'
      }
    }
  },
  { infinitive: 'dormir',
    language: 'fr',
    conjugations: {
      present: {
        s1: 'dors',
        p1: 'dormons',
        s2: 'dors',
        p2: 'dormez',
        s3m: 'dort',
        s3f: 'dort',
        p3: 'dorment',
        form: 'dormez'
      }
    }
  }
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
