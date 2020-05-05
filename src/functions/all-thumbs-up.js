import gql from 'graphql-tag'
import { createClient } from './fauna-apollo'

export function handler(event, context, callback) {
  const client = createClient()
  const APOLLO_QUERY = gql`
    query getAllThumbs {
      allThumbs {
        data {
          slug
          downCount
          upCount
        }
      }
    }
  `
  client
    .query({ query: APOLLO_QUERY })
    .then(({ data }) => {
      console.log(data)
      callback(null, {
        // return null to show no errors
        statusCode: 200,
        body: JSON.stringify(data.allThumbs.data),
      })
    })
    .catch((error) => callback(error))
}
