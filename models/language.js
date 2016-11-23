import mongoose, { Schema } from 'mongoose'
import validate from 'mongoose-validator'
import uniqueValidator from 'mongoose-unique-validator'

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
    }
  }
)

languageSchema.plugin(uniqueValidator)
languageSchema.virtual('code').get(function () { return this._id })
languageSchema.virtual('url').get(function () { return `/languages/${this.code}` })
languageSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret._id
    delete ret.__v
  },
  virtuals: true
})

export default mongoose.model('Language', languageSchema)
