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
    name: { type: String, required: true },
    nameEN: { type: String, required: true }
  }
)

LanguageSchema.plugin(uniqueValidator)

LanguageSchema.pre('save', function (next) {
  this.name = this.name[0].toUpperCase() + this.name.substr(1)
  this.nameEN = this.nameEN[0].toUpperCase() + this.nameEN.substr(1)
  next()
})

const Language = mongoose.model('Language', LanguageSchema)
export default Language
