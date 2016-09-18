import mongoose, { Schema } from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

const verbSchema = new Schema(
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

verbSchema.index({language: 1, infinitive: 1}, { unique: true })
verbSchema.plugin(uniqueValidator)

export default mongoose.model('Verb', verbSchema)
