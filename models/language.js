import mongoose, { Schema } from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

const LanguageSchema = new Schema(
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

LanguageSchema.plugin(uniqueValidator)

const Language = mongoose.model('Language', LanguageSchema)
export default Language
