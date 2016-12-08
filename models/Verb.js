import mongoose, { Schema, Types } from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import idValidator from 'mongoose-id-validator'

const verbSchema = new Schema(
  {
    language: {
      type: String,
      ref: 'Language',
      required: true
    },
    infinitive: {
      type: String,
      required: true,
      unique: true
    },
    translations: [{ type: Schema.Types.ObjectId, ref: 'Verb' }]
  }
)

verbSchema.index({ infinitive: 1 }, { unique: true })
verbSchema.plugin(uniqueValidator)
verbSchema.plugin(idValidator)

verbSchema.virtual('url').get(function () {
  return this.language ? `/verbs/${this.language.code || this.language}/${this.infinitive}` : null
})

verbSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret._id
    delete ret.__v
  },
  virtuals: true
})

verbSchema.post('findOneAndRemove', function (doc) {
  this.model.update(
    { translations: Types.ObjectId(doc.id) },
    { $pull: { translations: Types.ObjectId(doc.id) } }
  ).exec()
})

verbSchema.statics.linkTranslations = function (verbOneCriteria, verbTwoCriteria, cb) {
  Promise.all([
    this.findOne(verbOneCriteria),
    this.findOne(verbTwoCriteria)
  ]).then(([verbOne, verbTwo]) => {
    if (!verbOne || !verbTwo) {
      return cb(new Error(`Verb with criteria ${JSON.stringify(verbOne ? verbTwoCriteria : verbOneCriteria)} not found!`))
    }

    verbOne.translations.push(verbTwo._id)
    verbTwo.translations.push(verbOne._id)

    return Promise.all([verbOne.save(), verbTwo.save()])
  })
  .then(([verb, translationVerb]) => cb(null, [verb, translationVerb]))
  .catch(err => cb(err))
}

verbSchema.statics.findByInfinitive = function (language, infinitive, cb) {
  return this.findOne({ language, infinitive }, cb)
}

export default mongoose.model('Verb', verbSchema)
