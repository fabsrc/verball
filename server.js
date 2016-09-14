import restify from 'restify'
import mongoose from 'mongoose'
import restifyPlugins from 'restify-plugins'
import Language from './models/language'

mongoose.Promise = global.Promise
mongoose.connect(process.env.DB || 'mongodb://localhost/verball')

const server = restify.createServer({
  name: 'verball',
  version: '0.0.1'
})

server.use(restifyPlugins.queryParser())
server.use(restifyPlugins.bodyParser())

server.get('/languages', (req, res) => {
  Language.find((err, languages) => {
    if (err) {
      console.error(err)
      return res.send(err)
    }

    return res.send(languages)
  })
})

server.post('/languages', (req, res) => {
  const newLanguage = new Language({
    _id: req.params.code,
    name: req.params.name,
    nameEN: req.params.nameEN
  })

  newLanguage.save((err, newLanguage) => {
    if (err) {
      console.error(err)
      return res.send(err)
    }

    return res.send(201, newLanguage)
  })
})

server.get('/languages/:code', (req, res) => {
  Language.findById(req.params.code.toLowerCase(), (err, language) => {
    if (err) {
      console.error(err)
      return res.send(err)
    }

    if (!language) return res.send(404)

    return res.send(language)
  })
})

server.put('/languages/:code', (req, res) => {
  Language.findOneAndUpdate({ _id: req.params.code.toLowerCase() }, req.body, { new: true, runValidators: true }, (err, language) => {
    if (err) {
      console.error(err)
      return res.send(err)
    }

    if (!language) return res.send(404)

    return res.send(language)
  })
})

server.del('/languages/:code', (req, res) => {
  Language.findOneAndRemove({ _id: req.params.code.toLowerCase() }, (err, language) => {
    if (err) {
      console.error(err)
      return res.send(err)
    }

    if (!language) return res.send(404)

    return res.send(204)
  })
})

server.get('/', (req, res) => {
  return res.json({ hello: 'world' })
})

if (!module.parent) {
  server.listen(process.env.PORT || 3000, () => {
    console.log('%s listening at %s', server.name, server.url)
  })
}

export default server
