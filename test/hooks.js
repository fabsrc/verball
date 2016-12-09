import hooks from 'hooks'
import mongoose from 'mongoose'
import { Language } from '../models'

mongoose.Promise = global.Promise
mongoose.connect(process.env.DB || 'mongodb://localhost/verball')

hooks.beforeEach((transaction, done) => {
  Language.remove()
    .then(() => Language.insertMany([
      { _id: 'en', nativeName: 'English', name: 'english' },
      { _id: 'de', nativeName: 'Deutsch', name: 'german' }
    ]))
    .catch(err => console.error(err))
    .then(() => done())
})
