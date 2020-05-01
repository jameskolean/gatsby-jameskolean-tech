import ApolloClient from 'apollo-boost'
import fetch from 'isomorphic-fetch'

export function createClient() {
  const client = new ApolloClient({
    uri: 'https://graphql.fauna.com/graphql',
    fetch,
    request: (operation) => {
      operation.setContext({
        headers: {
          authorization: 'Bearer fnADqxEZpwACFNEF-NS41mUGXHUdjfkzefYwOLGC',
        },
      })
    },
  })
  return client
}
