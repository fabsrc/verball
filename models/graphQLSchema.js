import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType
} from 'graphql'
import Language from './Language'
import Verb from './Verb'

const LanguageType = new GraphQLObjectType({
  name: 'Language',
  description: '...',
  fields: () => ({
    code: { type: GraphQLString },
    name: { type: GraphQLString },
    nativeName: { type: GraphQLString }
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
    translations: {
      type: new GraphQLList(VerbType),
      resolve: (verb) => verb.translations.map(id => Verb.findById(id).exec())
    }
  })
})

const VerbInputType = new GraphQLInputObjectType({
  name: 'VerbInput',
  fields: {
    language: { type: GraphQLString },
    infinitive: { type: GraphQLString }
  }
})

const QueryType = new GraphQLObjectType({
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
        id: { type: GraphQLString },
        verb: {
          type: VerbInputType
        }
      },
      resolve: (root, args) => {
        if (args.id) {
          return Verb.findById(args.id).exec()
        } else {
          return Verb.findByInfinitive(args.verb.language, args.verb.infinitive).exec()
        }
      }
    }
  }
})

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: '...',
  fields: () => ({
    createVerb: {
      type: VerbType,
      args: {
        verb: { type: VerbInputType }
      },
      resolve: (root, args) => {
        let v = new Verb(args.verb)
        return v.save()
      }
    },
    linkVerbTranslations: {
      type: new GraphQLList(VerbType),
      args: {
        verb: { type: VerbInputType },
        transVerb: { type: VerbInputType }
      },
      resolve: (root, args) => {
        return Promise.all([
          Verb.findByInfinitive(args.verb.language, args.verb.infinitive).exec(),
          Verb.findByInfinitive(args.transVerb.language, args.transVerb.infinitive).exec()
        ]).then(([verb, transVerb]) => {
          verb.translations.push(transVerb.id)
          transVerb.translations.push(verb.id)
          return Promise.all([verb.save(), transVerb.save()])
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
  query: QueryType,
  mutation: MutationType
})
