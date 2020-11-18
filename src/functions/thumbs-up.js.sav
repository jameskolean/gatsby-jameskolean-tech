import gql from 'graphql-tag'
import { createClient } from './fauna-apollo'

export function handler(event, context, callback) {
  const slug = event.queryStringParameters['slug']
  const client = createClient()
  const APOLLO_QUERY = gql`
    query getThumbBySlug($slug: String!) {
      thumbBySlug(slug: $slug) {
        _id
        slug
        upCount
        downCount
      }
    }
  `
  client
    .query({ query: APOLLO_QUERY, variables: { slug } })
    .then(({ data }) => {
      callback(null, {
        // return null to show no errors
        statusCode: 200,
        body: JSON.stringify(data.thumbBySlug),
      })
    })
    .catch((e) => callback(e))
}
