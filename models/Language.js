import mongoose, { Schema } from 'mongoose'
import validate from 'mongoose-validator'
import uniqueValidator from 'mongoose-unique-validator'
import camelcase from 'camelcase'

const languageSchema = new Schema(
  {
    _id: {
      type: String,
      index: true,
      required: true,
      unique: true,
      lowercase: true,
      validate: validate({
        validator: 'matches',
        arguments: /^[a-z]{2}$/i,
        message: 'Use a valid ISO 639-1 language code (e.g. "en")'
      })
    },
    name: {
      type: String,
      required: true,
      lowercase: true,
      validate: validate({
        validator: 'isAlpha',
        message: 'Use a valid English language name (e.g. "english")'
      })
    },
    nativeName: {
      type: String,
      required: true,
      lowercase: true
    },
    pronouns: {
      '1s': String,
      '1p': String,
      '2s': String,
      '2p': String,
      '3ms': String,
      '3fs': String,
      '3ns': String,
      'form': String
    },
    tenses: {
      type: [{
        _id: {
          type: String
        },
        name: {
          type: String,
          required: true
        },
        nativeName: {
          type: String,
          required: true
        }
      }],
      default: void 0
    }
  }
)

languageSchema.plugin(uniqueValidator)
languageSchema.index({ '_id': 1, 'tenses._id': 1 }, { unique: true })
languageSchema.path('tenses')
  .set(function (tenses) {
    return tenses.map(tense => {
      tense._id = camelcase(tense.name)
      return tense
    })
  })
languageSchema.virtual('code')
  .get(function () { return this._id })
  .set(function (code) { this.set('_id', code) })
languageSchema.virtual('url').get(function () { return `/languages/${this.code}` })
languageSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret._id
    delete ret.__v
  },
  virtuals: true
})

export default mongoose.model('Language', languageSchema)
