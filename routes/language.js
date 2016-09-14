import errors from 'restify-errors'
import Language from '../models/language'

export default function (server) {
  server.get('/languages', (req, res, next) => {
    Language.find((err, languages) => {
      if (err) return next(err)

      return res.send(languages)
    })
  })

  server.post('/languages', (req, res, next) => {
    const newLanguage = new Language({
      _id: req.params._id,
      name: req.params.name,
      nameEN: req.params.nameEN
    })

    newLanguage.save((err, newLanguage) => {
      if (err) return next(err)

      return res.send(201, newLanguage)
    })
  })

  server.get('/languages/:code', (req, res, next) => {
    Language.findById(req.params.code.toLowerCase(), (err, language) => {
      if (err) return next(err)

      if (!language) return next(new errors.NotFoundError(`Language '${req.params.code.toLowerCase()}' not found!`))

      return res.send(language)
    })
  })

  server.put('/languages/:code', (req, res, next) => {
    Language.findById(req.params.code.toLowerCase(), (err, language) => {
      if (err) return next(err)

      if (!language) return next(new errors.NotFoundError(`Language '${req.params.code.toLowerCase()}' not found!`))

      language.name = req.params.name
      language.nameEN = req.params.nameEN

      language.save((err, newLanguage) => {
        if (err) return next(err)

        return res.send(newLanguage)
      })
    })
  })

  server.del('/languages/:code', (req, res, next) => {
    Language.findOneAndRemove({ _id: req.params.code.toLowerCase() }, (err, language) => {
      if (err) return next(err)

      if (!language) return next(new errors.NotFoundError(`Language '${req.params.code.toLowerCase()}' not found!`))

      return res.send(204)
    })
  })
}
