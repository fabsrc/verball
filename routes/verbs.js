import { Language, Verb } from '../models'
import { Types } from 'mongoose'
import { Router } from 'express'

const verbs = Router()

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

/**
 * @api {get} /verbs/:languageCode All verbs (of one language)
 * @apiName Verbs
 * @apiGroup Verb
 *
 * @apiParam {String} [languageCode] The language code to get verbs for
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/verbs
 * curl -i http://localhost:3000/verbs/en
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
 * @api {get} /verbs/:id Find By Id
 * @apiName FindVerbById
 * @apiGroup Verb
 *
 * @apiParam {String} id The id of the verb.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/verbs/5835a799c00d0239f11083d4
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
 * @api {get} /verbs/:lang/:infinitive Verb by Language and Infinitive
 * @apiName VerbInfinitive
 * @apiGroup Verb
 *
 * @apiParam {String} lang The language code of the verb's languages
 * @apiParam {String} infinitive The infinitive of the verb in the respective language
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/verbs/en/go
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
 * @api {get} /verbs/:lang/:infinitive/translations Translations of a Verb
 * @apiName VerbTranslations
 * @apiGroup Verb
 *
 * @apiParam {String} lang The language code of the verb's languages
 * @apiParam {String} infinitive The infinitive of the verb in the respective language
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/verbs/en/go/translations
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
 * @api {get} /verbs/:id/translations Translations of a Verb by Id
 * @apiName VerbTranslationsById
 * @apiGroup Verb
 *
 * @apiParam {String} lang The id of the verb
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/verbs/5835a799c00d0239f11083d4/translations
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
 * @api {post} /verbs/:lang/:infinitive/translations/:translang Create Translation of a Verb
 * @apiName CreateVerbTranslation
 * @apiGroup Verb
 *
 * @apiParam {String} lang The language code of the verb's languages
 * @apiParam {String} infinitive The infinitive of the verb in the respective language
 * @apiParam {String} translang The language code of the translated verb's language
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/verbs/en/go/translations/de/
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
 * @api {post} /verbs/:lang/:infinitive/translations/:translang Link Translations of two Verbs
 * @apiName LinkVerbTranslations
 * @apiGroup Verb
 *
 * @apiParam {String} lang The language code of the verb's languages
 * @apiParam {String} infinitive The infinitive of the verb in the respective language
 * @apiParam {String} translang The language code of the translated verb's language
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/verbs/en/go/translations/de
 *
 */

verbs.post('/:lang([a-z]{2})/:infinitive/translations/:translang([a-z]{2})', (req, res, next) => {
  let translationVerbCriteria

  if (req.body.id && Types.ObjectId.isValid(req.body.id)) {
    translationVerbCriteria = { _id: req.body.id }
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
 * @api {post} /verbs/ Create Verb
 * @apiName CreateVerb
 * @apiGroup Verb
 *
 * @apiParam {String} lang The language code of the verb's languages
 * @apiParam {String} infinitive The infinitive of the verb in the respective language
 *
 * @apiExample Example usage:
 * curl -X POST -d infinitive=go -d language=en http://localhost:3000/verbs
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
 * @api {put} /verbs/:id Update Verb by Id
 * @apiName UpdateVerbById
 * @apiGroup Verb
 *
 * @apiParam {String} lang The id of the verb
 *
 * @apiExample Example usage:
 * curl -X PUT -d infinitive=walk -d language=en http://localhost:3000/verbs/5835a799c00d0239f11083d4
 *
 */

verbs.put('/:id', (req, res, next) => {
  Verb.findById(req.params.id, (err, verb) => {
    if (err) return next(err)

    if (!verb) return next(new Error(`Verb with id '${req.params.id}' not found!`))

    verb.infinitive = req.body.infinitive.toLowerCase()
    verb.language = req.body.language.toLowerCase()

    verb.save((err, newVerb) => {
      if (err) return next(err)

      return res.send(newVerb)
    })
  })
})

/**
 * @api {put} /verbs/:lang/:infinitive Update Verb
 * @apiName UpdateVerb
 * @apiGroup Verb
 *
 * @apiParam {String} lang The language code of the verb's languages
 * @apiParam {String} infinitive The infinitive of the verb in the respective language
 *
 * @apiExample Example usage:
 * curl -X PUT -d infinitive=walk -d language=en http://localhost:3000/verbs/en/go
 *
 */

verbs.put('/:lang([a-z]{2})/:infinitive', (req, res, next) => {
  Verb.findByInfinitive(req.params.lang, req.params.infinitive, (err, verb) => {
    if (err) return next(err)

    if (!verb) return next(new Error(`Verb '${req.params.infinitive}' [${req.params.lang}] not found!`))

    verb.infinitive = req.body.infinitive.toLowerCase()
    verb.language = req.body.language.toLowerCase()

    verb.save((err, newVerb) => {
      if (err) return next(err)

      return res.send(newVerb)
    })
  })
})

/**
 * @api {delete} /verbs/:id Delete Verb by Id
 * @apiName DeleteVerbById
 * @apiGroup Verb
 *
 * @apiParam {String} id The id of the verb
 *
 * @apiExample Example usage:
 * curl -X DELETE http://localhost:3000/verbs/5835a799c00d0239f11083d4
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
 * @api {delete} /verbs/:lang/:infinitive Delete Verb
 * @apiName DeleteVerb
 * @apiGroup Verb
 *
 * @apiParam {String} lang The language code of the verb's languages
 * @apiParam {String} infinitive The infinitive of the verb in the respective language
 *
 * @apiExample Example usage:
 * curl -X DELETE http://localhost:3000/verbs/en/go
 *
 */

verbs.delete('/:lang([a-z]{2})/:infinitive', (req, res, next) => {
  Verb.findOneAndRemove({ language: req.params.lang, infinitive: req.params.infinitive }, (err, verb) => {
    if (err) return next(err)

    if (!verb) return next(new Error(`Verb '${req.params.infinitive}' [${req.params.lang}] not found!`))

    return res.sendStatus(204)
  })
})

export default verbs
