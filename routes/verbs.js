import { Language, Verb } from '../models'
import { Types } from 'mongoose'
import { Router } from 'express'
import flatten from 'flat'

const verbs = Router()

/**
 *
 * List All Verbs [GET /verbs]
 * List All Verbs of a Language [GET /verbs/{language_code}]
 * Find Verbs by Query [GET /verbs?q={query}]
 *
 */

verbs.get('/:lang([a-z]{2})?', (req, res, next) => {
  let query = {}

  if (req.params.lang) {
    query.language = req.params.lang
  }

  if (req.query.q) {
    query.infinitive = req.query.q
  }

  Verb.find(query).select('-translations').sort('infinitive').exec((err, verbs) => {
    if (err) return next(err)

    return res.send(verbs)
  })
})

/**
 *
 * Create Verb [POST /verbs]
 *
 */

verbs.post('/', (req, res, next) => {
  const newVerb = new Verb(req.body)

  newVerb.save((err, newVerb) => {
    if (err) return next(err)

    return res.status(201).send(newVerb)
  })
})

/**
 *
 * Get Verb by ID [GET /verbs/{id}]
 *
 */

verbs.get('/:id', (req, res, next) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    return next(new Error(`Id '${req.params.id}' is not a valid Object Id!`))
  }

  let query = Verb.findById(req.params.id).populate('language')

  if (req.query.embed) {
    query.populate(req.query.embed)
  }

  query
    .populate('translations', '-translations')
    .exec((err, verb) => {
      if (err) return next(err)

      if (!verb) return next(new Error(`Verb with id '${req.params.id}' not found!`))

      return res.send(verb)
    })
})

/**
 *
 * Get Verb by Language and Infinitive [GET /verbs/{language_code}/{infinitive}]
 *
 */

verbs.get('/:lang([a-z]{2})/:infinitive', (req, res, next) => {
  let query = Verb.findByInfinitive(req.params.lang, req.params.infinitive)

  if (req.query.embed) {
    query.populate(req.query.embed)
  }

  query
    .populate('translations', 'infinitive language')
    .exec((err, verb) => {
      if (err) return next(err)

      if (!verb) return next(new Error(`Verb '${req.params.infinitive}' [${req.params.lang}] not found!`))

      return res.send(verb)
    })
})

/**
 *
 * Get Translations of a Verb by Language and Infinitive [GET /verbs/{language_code}/{infinitive}/translations]
 *
 */

verbs.get('/:lang([a-z]{2})/:infinitive/translations', (req, res, next) => {
  Verb.findOne({ language: req.params.lang, infinitive: req.params.infinitive }).populate('translations', '-translations').exec((err, verb) => {
    if (err) return next(err)

    if (!verb) return next(new Error(`Verb '${req.params.infinitive}' [${req.params.lang}] not found!`))

    return res.send(verb.translations)
  })
})

/**
 *
 * Get Translations of a Verb by ID [GET /verbs/{id}/translations]
 *
 */

verbs.get('/:id/translations', (req, res, next) => {
  Verb.findById(req.params.id).populate('translations', '-translations').exec((err, verb) => {
    if (err) return next(err)

    if (!verb) return next(new Error(`Verb with id '${req.params.id}' not found!`))

    return res.send(verb.translations)
  })
})

/**
 *
 * Create a Translation of a Verb [POST /verbs/{language_code}/{infinitive}/translations]
 *
 */

verbs.post('/:lang([a-z]{2})/:infinitive/translations', (req, res, next) => {
  if (req.params.lang === req.body.language) {
    return next(new Error(`Language of verb to translate has to be different!`))
  }

  Verb.findByInfinitive(req.params.lang, req.params.infinitive)
    .then(verb => {
      if (!verb) return next(new Error(`Verb '${req.params.infinitive}' [${req.params.lang}] not found!`))

      return Promise.all([verb, Verb.findByInfinitive(req.body.language, req.body.infinitive)])
    })
    .then(([verb, transVerb]) => {
      if (transVerb) return next(new Error(`Verb '${req.body.infinitive}' [${req.body.language}] already exists!`))

      let translatedVerb = new Verb(req.body)

      return Promise.all([verb, translatedVerb.save()])
    })
    .then(([verb, translatedVerb]) => {
      verb.translations.push(translatedVerb._id)
      translatedVerb.translations.push(verb._id)

      return Promise.all([verb.save(), translatedVerb.save()])
    })
    .then(verbs => res.status(201).send(verbs))
    .catch(err => next(err))
})

/**
 *
 * Link Translations of two Verbs [GET /verbs/{language_code}/{infinitive}/translations/{translation_language_code}]
 *
 */

verbs.post('/:lang([a-z]{2})/:infinitive/translations/:translang([a-z]{2})', (req, res, next) => {
  let translationVerbCriteria

  if (req.body.id && Types.ObjectId.isValid(req.body.id)) {
    translationVerbCriteria = { _id: req.body.id || req.body._id }
  } else if (req.body.infinitive) {
    translationVerbCriteria = { language: req.params.translang, infinitive: req.body.infinitive }
  } else {
    return next(new Error(`No valid body parameters. Use \`id\` or \`infinitive\` to link translations of verbs.`))
  }

  Verb.linkTranslations(
    { language: req.params.lang, infinitive: req.params.infinitive },
    translationVerbCriteria,
    (err, linkedVerbs) => {
      if (err) return next(err)

      res.send(linkedVerbs)
    }
  )
})

/**
 *
 * Update Verb by ID [PUT /verbs/{id}]
 *
 */

verbs.put('/:id', (req, res, next) => {
  let updateParams = new Verb(req.body).toObject()
  delete updateParams._id
  delete updateParams.translations
  updateParams = flatten(updateParams)

  Verb.findByIdAndUpdate(req.params.id,
    { $set: updateParams },
    { new: true },
    (err, verb) => {
      if (err) return next(err)

      if (!verb) return next(new Error(`Verb with ID '${req.params.id}' not found!`))

      return res.location(verb.url).send(verb)
    }
  )
})

/**
 *
 * Update Verb by Language Code and Infinitive [PUT /verbs/{language_code}/{infinitive}]
 *
 */

verbs.put('/:lang([a-z]{2})/:infinitive', (req, res, next) => {
  let updateParams = new Verb(req.body).toObject()
  delete updateParams._id
  delete updateParams.translations
  updateParams = flatten(updateParams)

  Verb.findOneAndUpdate({ language: req.params.lang, infinitive: req.params.infinitive },
    { $set: updateParams },
    { new: true },
    (err, verb) => {
      if (err) return next(err)

      if (!verb) return next(new Error(`Verb with ID '${req.params.id}' not found!`))

      return res.location(verb.url).send(verb)
    }
  )
})

/**
 *
 * Delete Verb by ID [DELETE /verbs/{id}]
 *
 */

verbs.delete('/:id', (req, res, next) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    return next(new Error(`Id '${req.params.id}' is not a valid Object Id!`))
  }

  Verb.findOneAndRemove({ _id: req.params.id }, (err, verb) => {
    if (err) return next(err)

    if (!verb) return next(new Error(`Verb with id '${req.params.id}' not found!`))

    return res.sendStatus(204)
  })
})

/**
 *
 * Delete Verb by Language Code and Infinitive [DELETE /verbs/{language_code}/{infinitive}]
 *
 */

verbs.delete('/:lang([a-z]{2})/:infinitive', (req, res, next) => {
  Verb.findOneAndRemove({ language: req.params.lang, infinitive: req.params.infinitive }, (err, verb) => {
    if (err) return next(err)

    if (!verb) return next(new Error(`Verb '${req.params.infinitive}' [${req.params.lang}] not found!`))

    return res.sendStatus(204)
  })
})

/**
 *
 * Language Check for each Query including :lang parameter
 *
 */

verbs.param('lang', (req, res, next, code) => {
  Language.findById(code, (err, language) => {
    if (err) {
      return next(err)
    } else if (language) {
      return next()
    } else {
      return next(new Error(`Language with code ${code} not found.`))
    }
  })
})

verbs.param('translang', verbs.params.lang[0])

export default verbs
