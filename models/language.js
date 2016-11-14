import mongoose, { Schema } from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

const languageSchema = new Schema(
  {
    _id: {
      type: String,
      index: true,
      max: 2,
      required: true,
      unique: true,
      lowercase: true
    },
    name: {
      type: String,
      required: true,
      lowercase: true
    },
    nameEN: {
      type: String,
      required: true,
      lowercase: true
    }
  }
)

languageSchema.plugin(uniqueValidator)
languageSchema.virtual('code').get(function () { return this._id })
languageSchema.virtual('url').get(function () { return `http://localhost:3000/languages/${this.code}` })
languageSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.code = doc.code
    delete ret._id
    delete ret.__v
  },
  virtuals: true
})

export default mongoose.model('Language', languageSchema)
