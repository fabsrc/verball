import express from 'express'
import mongoose from 'mongoose'
import { json } from 'body-parser'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import graphqlHTTP from 'express-graphql'
import * as Routes from './routes'
import schema from './models/graphQLSchema'

mongoose.Promise = global.Promise
mongoose.connect(process.env.DB || 'mongodb://localhost/verball')

const app = express()
app.set('port', process.env.PORT || 3000)

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}
app.use(helmet())
app.use(json())
app.use(compression())

app.use('/languages', Routes.languages)
app.use('/verbs', Routes.verbs)

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
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
