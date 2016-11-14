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
    translations: [{ type: Schema.Types.ObjectId, ref: 'Verb' }]
  }
)

verbSchema.index({ language: 1, infinitive: 1 }, { unique: true })
verbSchema.plugin(uniqueValidator)
verbSchema.virtual('url').get(function () { return `http://localhost:3000/verbs/${this.id}` })
verbSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  },
  virtuals: true
})

export default mongoose.model('Verb', verbSchema)
