import { Router } from 'express'
import Language from '../models/language'

const languages = Router()

languages.get('/', (req, res, next) => {
  Language.find().sort().exec((err, languages) => {
    if (err) return next(err)

    return res.send(languages)
  })
})

languages.post('/', (req, res, next) => {
  const newLanguage = new Language({
    _id: req.body.code,
    name: req.body.name,
    nameEN: req.body.nameEN
  })

  newLanguage.save((err, newLanguage) => {
    if (err) return next(err)

    return res.send(201, newLanguage)
  })
})

languages.get('/:code', (req, res, next) => {
  Language.findById(req.params.code.toLowerCase(), (err, language) => {
    if (err) return next(err)

    if (!language) return next(new Error(`Language '${req.params.code.toLowerCase()}' not found!`))

    return res.send(language)
  })
})

languages.put('/:code', (req, res, next) => {
  Language.findById(req.params.code.toLowerCase(), (err, language) => {
    if (err) return next(err)

    if (!language) return next(new Error(`Language '${req.params.code.toLowerCase()}' not found!`))

    language.name = req.body.name.toLowerCase()
    language.nameEN = req.body.nameEN.toLowerCase()

    language.save((err, newLanguage) => {
      if (err) return next(err)

      return res.send(newLanguage)
    })
  })
})

languages.delete('/:code', (req, res, next) => {
  Language.findOneAndRemove({ _id: req.params.code.toLowerCase() }, (err, language) => {
    if (err) return next(err)

    if (!language) return next(new Error(`Language '${req.params.code.toLowerCase()}' not found!`))

    return res.send(204)
  })
})

export default languages
