import express from 'express'
import mongoose from 'mongoose'
import { json } from 'body-parser'
import compression from 'compression'
import graffiti from '@risingstack/graffiti'
import { getSchema } from '@risingstack/graffiti-mongoose'
import * as Routes from './routes'
import * as Models from './models'

mongoose.Promise = global.Promise
mongoose.connect(process.env.DB || 'mongodb://localhost/verball')

const app = express()
app.set('port', process.env.PORT || 3000)

app.use(json())
app.use(compression())

app.use('/languages', Routes.languages)
app.use('/verbs', Routes.verbs)

app.use(graffiti.express({
  schema: getSchema(Object.values(Models))
}))

app.use((err, req, res, next) => {
  console.error(JSON.stringify(err))

  if (err.name === 'ValidationError') {
    return res.status(400).send({
      name: err.name,
      message: err.message,
      error: err.errors
    })
  }

  return res.status(500).send({
    name: err.name,
    message: err.message,
    error: err.errors
  })
})

if (!module.parent) {
  app.listen(app.get('port'), console.log('Verball listening at %s', app.get('port')))
}

export default app
