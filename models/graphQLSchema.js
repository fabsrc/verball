import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLScalarType
} from 'graphql'
import { Language, Verb } from '.'

const LanguageType = new GraphQLObjectType({
  name: 'Language',
  description: '...',
  fields: () => ({
    _id: { type: GraphQLString },
    code: { type: GraphQLString },
    name: { type: GraphQLString },
    nativeName: { type: GraphQLString },
    pronouns: {
      type: new GraphQLObjectType({
        name: 'Pronouns',
        fields: {
          s1: { type: GraphQLString },
          p1: { type: GraphQLString },
          s2: { type: GraphQLString },
          p2: { type: GraphQLString },
          s3m: { type: GraphQLString },
          s3f: { type: GraphQLString },
          s3n: { type: GraphQLString },
          p3: { type: GraphQLString },
          p3m: { type: GraphQLString },
          p3f: { type: GraphQLString },
          form: { type: GraphQLString }
        }
      })
    },
    tenses: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'Tense',
        fields: {
          '_id': { type: GraphQLString },
          'name': { type: GraphQLString },
          'nativeName': { type: GraphQLString }
        }
      }))
    }
  })
})

const VerbType = new GraphQLObjectType({
  name: 'Verb',
  description: '...',
  fields: () => ({
    infinitive: { type: GraphQLString },
    id: { type: GraphQLString },
    url: { type: GraphQLString },
    language: {
      type: LanguageType,
      resolve: (verb) => Language.findById(verb.language).exec()
    },
    conjugations: {
      type: new GraphQLScalarType({
        name: 'Conjugations',
        serialize: v => v
      })
    },
    translations: {
      type: new GraphQLList(VerbType),
      resolve: (verb) => verb.translations.map(id => Verb.findById(id).exec())
    }
  })
})

const VerbInputType = new GraphQLInputObjectType({
  name: 'VerbInput',
  fields: {
    _id: { type: GraphQLString },
    language: { type: GraphQLString },
    infinitive: { type: GraphQLString }
  }
})

const LanguageInputType = new GraphQLInputObjectType({
  name: 'LanguageInput',
  fields: {
    code: { type: GraphQLString },
    name: { type: GraphQLString },
    nativeName: { type: GraphQLString }
  }
})

const Query = new GraphQLObjectType({
  name: 'Query',
  description: '...',
  fields: {
    language: {
      type: LanguageType,
      args: {
        id: { type: GraphQLString }
      },
      resolve: (root, args) => Language.findById(args.id).exec()
    },
    languages: {
      type: new GraphQLList(LanguageType),
      resolve: (root, args) => Language.find().exec()
    },
    verb: {
      type: VerbType,
      args: {
        _id: { type: GraphQLString },
        language: { type: GraphQLString },
        infinitive: { type: GraphQLString }
      },
      resolve: (root, args) => Verb.findOne(args).exec()
    },
    verbs: {
      type: new GraphQLList(VerbType),
      args: {
        language: { type: GraphQLString }
      },
      resolve: (root, args) => Verb.find(args).exec()
    }
  }
})

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: '...',
  fields: () => ({
    createLanguage: {
      type: LanguageType,
      args: {
        language: { type: LanguageInputType }
      },
      resolve: (root, args) => Language.create(args.language)
    },
    createVerb: {
      type: VerbType,
      args: {
        verb: { type: VerbInputType }
      },
      resolve: (root, args) => Verb.create(args.verb)
    },
    linkVerbTranslations: {
      type: new GraphQLList(VerbType),
      args: {
        verb: { type: VerbInputType },
        transVerb: { type: VerbInputType }
      },
      resolve: (root, args) => {
        return new Promise((resolve, reject) => {
          Verb.linkTranslations(args.verb, args.transVerb, (err, res) => {
            if (err) reject(err)

            resolve(res)
          })
        })
      }
    },
    deleteVerb: {
      type: VerbType,
      args: {
        id: { type: GraphQLString },
        verb: {
          type: VerbInputType
        }
      },
      resolve: (root, args) => {
        if (args.id) {
          return Verb.findByIdAndRemove(args.id).exec()
        } else {
          return Verb.findOneAndRemove({ language: args.verb.language, infinitive: args.verb.infinitive }).exec()
        }
      }
    }
  })
})

export default new GraphQLSchema({
  query: Query,
  mutation: Mutation
})
