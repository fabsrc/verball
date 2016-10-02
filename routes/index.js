import Languages from './languages'
import Verbs from './verbs'

export default function (server) {
  Languages(server)
  Verbs(server)
}

export {
  Languages,
  Verbs
}
