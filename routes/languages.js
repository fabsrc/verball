import { Router } from 'express'
import { Language } from '../models'

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
    nativeName: req.body.nativeName
  })

  newLanguage.save((err, newLanguage) => {
    if (err) return next(err)

    return res.status(201).send(newLanguage)
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

    language.name = req.body.name && req.body.name.toLowerCase()
    language.nativeName = req.body.nativeName && req.body.nativeName.toLowerCase()

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

    return res.sendStatus(204)
  })
})

export default languages
