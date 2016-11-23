import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import compression from 'compression'
import * as Routes from './routes'

mongoose.Promise = global.Promise
mongoose.connect(process.env.DB || 'mongodb://localhost/verball')

const app = express()
app.set('port', process.env.PORT || 3000)

app.use(bodyParser.json())
app.use(compression())

app.use('/languages', Routes.languages)
app.use('/verbs', Routes.verbs)

app.use((err, req, res, next) => {
  console.error(JSON.stringify(err))

  if (err.name === 'ValidationError') {
    return res.status(400).send({
      name: err.name,
      message: err.message,
      error: err.errors
    })
  }

  return res.status(500).end('Server Error!')
})

if (!module.parent) {
  app.listen(app.get('port'), console.log('Verball listening at %s', app.get('port')))
}

export default app
