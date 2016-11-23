import errors from 'restify-errors'
import Verb from '../models/verb'
import { Router } from 'express'

const verbs = Router()

verbs.get('/findById/:id', (req, res, next) => {
  let query = Verb.findById(req.params.id).populate('language')

  if (req.query.embed) {
    query.populate(req.query.embed)
  }

  query
    .populate('translations', 'infinitive')
    .exec((err, verb) => {
      if (err) return next(err)

      if (!verb) return next(new errors.NotFoundError(`Verb with id '${req.params.id}' not found!`))

      return res.send(verb)
    })
})

verbs.get('/:lang?', (req, res, next) => {
  let query = {}

  if (req.params.lang) {
    query.language = req.params.lang
  }

  if (req.query.q) {
    query.infinitive = req.query.q
  }

  Verb.find(query).exec((err, verbs) => {
    if (err) return next(err)

    return res.send(verbs)
  })
})

verbs.get('/:lang/:infinitive', (req, res, next) => {
  let query = Verb.findByInfinitive(req.params.infinitive).populate('language')

  if (req.query.embed) {
    query.populate(req.query.embed)
  }

  query
    .populate('translations', 'infinitive')
    .exec((err, verb) => {
      if (err) return next(err)

      if (!verb) return next(new errors.NotFoundError(`Verb with id '${req.params.id}' not found!`))

      return res.send(verb)
    })
})

verbs.get('/:id/translations', (req, res, next) => {
  Verb.findById(req.params.id).populate('translations').exec((err, verb) => {
    if (err) return next(err)

    if (!verb) return next(new errors.NotFoundError(`Verb with id '${req.params.id}' not found!`))

    return res.send(verb.translations)
  })
})

verbs.post('/:id/translations', (req, res, next) => {
  Verb.findById(req.params.id).exec((err, verb) => {
    if (err) return next(err)

    if (!verb) return next(new errors.NotFoundError(`Verb with id '${req.params.id}' not found!`))

    // Verb.findById(req.body.id, (err, translationVerb) => {
    //   if (err) return next(err)

    //   verb.translations.indexOf(translationVerb._id) === -1 &&
    //     verb.translations.push(translationVerb._id)

    //   translationVerb.translations.indexOf(verb._id) === -1 &&
    //     translationVerb.translations.push(verb._id)

    //   Promise
    //     .all([verb.save(), translationVerb.save()])
    //     .then(([verb, translationVerb]) => res.send(verb))
    //     .catch(err => next(err))
    // })
  })
})

verbs.post('/', (req, res, next) => {
  const newVerb = new Verb({
    infinitive: req.body.infinitive,
    language: req.body.language
  })

  newVerb.save((err, newVerb) => {
    if (err) return next(err)

    return res.send(201, newVerb)
  })
})

verbs.put('/:id', (req, res, next) => {
  Verb.findById(req.params.id, (err, verb) => {
    if (err) return next(err)

    if (!verb) return next(new errors.NotFoundError(`Verb with id '${req.params.id}' not found!`))

    verb.infinitive = req.body.infinitive.toLowerCase()
    verb.language = req.body.language.toLowerCase()

    verb.save((err, newVerb) => {
      if (err) return next(err)

      return res.send(newVerb)
    })
  })
})

verbs.delete('/:id', (req, res, next) => {
  Verb.findOneAndRemove({ _id: req.params.id }, (err, verb) => {
    if (err) return next(err)

    if (!verb) return next(new errors.NotFoundError(`Verb  with id '${req.params.id}' not found!`))

    return res.send(204)
  })
})

export default verbs
