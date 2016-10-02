import restify from 'restify'
import mongoose from 'mongoose'
import restifyPlugins from 'restify-plugins'
import routes from './routes'
import { version } from './package.json'

mongoose.Promise = global.Promise
mongoose.connect(process.env.DB || 'mongodb://localhost/verball')

const server = restify.createServer({
  name: 'verball',
  version: version
})

server.use(restifyPlugins.fullResponse())
server.use(restifyPlugins.queryParser())
server.use(restifyPlugins.bodyParser({ mapParams: true }))
server.use(restifyPlugins.gzipResponse())

routes(server)

if (!module.parent) {
  server.listen(process.env.PORT || 3000, () => {
    console.log('%s listening at %s', server.name, server.url)
  })
}

export default server
