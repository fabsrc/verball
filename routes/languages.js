import flatten from 'flat'
import { Router } from 'express'
import { Language } from '../models'

const languages = Router()

/**
 *
 * Get All Languages [GET /languages]
 *
 */

languages.get('/', (req, res, next) => {
  Language.find().sort().exec((err, languages) => {
    if (err) return next(err)

    return res.send(languages)
  })
})

/**
 *
 * Create Language [POST /languages]
 *
 */

languages.post('/', (req, res, next) => {
  req.body._id = req.body.code

  Language.create(req.body, (err, newLanguage) => {
    if (err) return next(err)

    return res.location(newLanguage.url).status(201).send(newLanguage)
  })
})

/**
 *
 * Get Language [GET /languages/{language_code}]
 *
 */

languages.get('/:code', (req, res, next) => {
  Language.findById(req.params.code, (err, language) => {
    if (err) return next(err)

    if (!language) return next(new Error(`Language '${req.params.code}' not found!`))

    return res.send(language)
  })
})

/**
 *
 * Update Languages [PUT /languages/{language_code}]
 *
 */

languages.put('/:code', (req, res, next) => {
  let updateParams = flatten(new Language(req.body).toObject())

  Language.findByIdAndUpdate(req.params.code,
    { $set: updateParams },
    { new: true, runValidators: true },
    (err, language) => {
      if (err) return next(err)

      if (!language) return next(new Error(`Language '${req.params.code}' not found!`))

      return res.location(language.url).send(language)
    }
  )
})

/**
 *
 * Delete Language [DELETE /languages/{language_code}]
 *
 */

languages.delete('/:code', (req, res, next) => {
  Language.findOneAndRemove({ _id: req.params.code }, (err, language) => {
    if (err) return next(err)

    if (!language) return next(new Error(`Language '${req.params.code}' not found!`))

    return res.sendStatus(204)
  })
})

export default languages
