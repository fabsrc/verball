import restify from 'restify'

const server = restify.createServer({
  name: 'verball',
  version: '0.0.1'
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
