import errors from 'restify-errors'
import Verb from '../models/verb'

export default function (server) {
  server.get('/verbs', (req, res, next) => {
    let query = {}

    if (req.query.q) {
      query.infinitive = req.query.q
    }

    Verb.find(query).exec((err, verbs) => {
      if (err) return next(err)

      return res.send(verbs)
    })
  })

  server.get('/verbs/:id', (req, res, next) => {
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

  server.get('/verbs/:id/translations', (req, res, next) => {
    Verb.findById(req.params.id).populate('translations').exec((err, verb) => {
      if (err) return next(err)

      if (!verb) return next(new errors.NotFoundError(`Verb with id '${req.params.id}' not found!`))

      return res.send(verb.translations)
    })
  })

  server.post('/verbs/:id/translations', (req, res, next) => {
    Verb.findById(req.params.id).exec((err, verb) => {
      if (err) return next(err)

      if (!verb) return next(new errors.NotFoundError(`Verb with id '${req.params.id}' not found!`))

      Verb.findById(req.params.verb, (err, translationVerb) => {
        if (err) return next(err)

        verb.translations.indexOf(translationVerb._id) === -1 &&
          verb.translations.push(translationVerb._id)

        translationVerb.translations.indexOf(verb._id) === -1 &&
          translationVerb.translations.push(verb._id)

        Promise
          .all([verb.save(), translationVerb.save()])
          .then(([verb, translationVerb]) => res.send(verb))
          .catch(err => next(err))
      })
    })
  })

  server.post('/verbs', (req, res, next) => {
    const newVerb = new Verb({
      infinitive: req.params.infinitive,
      language: req.params.language
    })

    newVerb.save((err, newVerb) => {
      if (err) return next(err)

      return res.send(201, newVerb)
    })
  })

  server.put('/verbs/:id', (req, res, next) => {
    Verb.findById(req.params.id, (err, verb) => {
      if (err) return next(err)

      if (!verb) return next(new errors.NotFoundError(`Verb with id '${req.params.id}' not found!`))

      verb.infinitive = req.params.infinitive.toLowerCase()
      verb.language = req.params.language.toLowerCase()

      verb.save((err, newVerb) => {
        if (err) return next(err)

        return res.send(newVerb)
      })
    })
  })

  server.del('/verbs/:id', (req, res, next) => {
    Verb.findOneAndRemove({ _id: req.params.id }, (err, verb) => {
      if (err) return next(err)

      if (!verb) return next(new errors.NotFoundError(`Verb  with id '${req.params.id}' not found!`))

      return res.send(204)
    })
  })
}
