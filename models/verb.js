import mongoose, { Schema } from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

const VerbSchema = new Schema(
  {
    language: {
      type: String,
      ref: 'Language',
      required: true
    },
    infinitive: {
      type: String,
      required: true
    },
    translations: [Schema.Types.ObjectId]
  },
  {
    versionKey: false
  }
)

VerbSchema.plugin(uniqueValidator)

export default mongoose.model('Verb', VerbSchema)
