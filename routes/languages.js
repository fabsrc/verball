import { Router } from 'express'
import { Language } from '../models'

const languages = Router()

/**
 * @api {get} /languages Get Languages
 * @apiName GetLanguages
 * @apiGroup Language
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/languages
 *
 * @apiSuccess {Object[]} languages              List of languages.
 * @apiSuccess {String}   languages.code         Language code.
 * @apiSuccess {String}   languages.id           Language id (Alias of code).
 * @apiSuccess {String}   languages.name         English name of the language.
 * @apiSuccess {String}   languages.nativeName   Native name of the language.
 * @apiSuccess {String}   languages.url          URL of the language.
 *
 */

languages.get('/', (req, res, next) => {
  Language.find().sort().exec((err, languages) => {
    if (err) return next(err)

    return res.send(languages)
  })
})

/**
 * @api {post} /languages Create Language
 * @apiName CreateLanguage
 * @apiGroup Language
 *
 * @apiParam {String}   code         Language code.
 * @apiParam {String}   name         English name of the language.
 * @apiParam {String}   nativeName   Native name of the language.
 *
 * @apiExample Example usage:
 * curl -i -X POST -H "Content-Type:application/json" -d \
 * '{
 *   "code": "fr",
 *   "name": "french",
 *   "nativeName": "français"
 * }' http://localhost:3000/languages
 *
 * @apiSuccess {String}   code         Language code.
 * @apiSuccess {String}   id           Language id (Alias of code).
 * @apiSuccess {String}   name         English name of the language.
 * @apiSuccess {String}   nativeName   Native name of the language.
 * @apiSuccess {String}   url          URL of the language.
 *
 */

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

/**
 * @api {get} /languages/:code Get Language by Code
 * @apiName GetLanguageByCode
 * @apiGroup Language
 *
 * @apiParam {String}   code         Language code.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/languages/en
 *
 * @apiSuccess {String}   code         Language code.
 * @apiSuccess {String}   id           Language id (Alias of code).
 * @apiSuccess {String}   name         English name of the language.
 * @apiSuccess {String}   nativeName   Native name of the language.
 * @apiSuccess {String}   url          URL of the language.
 *
 */

languages.get('/:code', (req, res, next) => {
  Language.findById(req.params.code.toLowerCase(), (err, language) => {
    if (err) return next(err)

    if (!language) return next(new Error(`Language '${req.params.code.toLowerCase()}' not found!`))

    return res.send(language)
  })
})

/**
 * @api {put} /languages/:code Update Language
 * @apiName UpdateLanguage
 * @apiGroup Language
 *
 * @apiParam {String}   code         Code of the Language.
 *
 * @apiParam {String}   name         New English name of the language.
 * @apiParam {String}   nativeName   New Native name of the language.
 *
 * @apiExample Example usage:
 * curl -i -X PUT -H "Content-Type:application/json" -d \
 * '{
 *   "name": "francis",
 *   "nativeName": "francis"
 * }' http://localhost:3000/languages/fr
 *
 * @apiSuccess {String}   code         Language code.
 * @apiSuccess {String}   id           Language id (Alias of code).
 * @apiSuccess {String}   name         English name of the language.
 * @apiSuccess {String}   nativeName   Native name of the language.
 * @apiSuccess {String}   url          URL of the language.
 *
 */

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

/**
 * @api {delete} /languages/:code Delete Language
 * @apiName DeleteLanguage
 * @apiGroup Language
 *
 * @apiParam {String}   code   Code of the language.
 *
 * @apiExample Example usage:
 * curl -i -X DELETE http://localhost:3000/languages/fr
 *
 */

languages.delete('/:code', (req, res, next) => {
  Language.findOneAndRemove({ _id: req.params.code.toLowerCase() }, (err, language) => {
    if (err) return next(err)

    if (!language) return next(new Error(`Language '${req.params.code.toLowerCase()}' not found!`))

    return res.sendStatus(204)
  })
})

export default languages
