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
  const CREATE_MUTATION = gql`
    mutation createThumbMutation($slug: String!) {
      createThumb(data: { slug: $slug, upCount: 0, downCount: 1 }) {
        _id
      }
    }
  `
  const UPDATE_MUTATION = gql`
    mutation updateThumbMutation(
      $id: ID!
      $slug: String!
      $upCount: Int!
      $downCount: Int!
    ) {
      updateThumb(
        id: $id
        data: { slug: $slug, upCount: $upCount, downCount: $downCount }
      ) {
        _id
      }
    }
  `

  client
    .query({ query: APOLLO_QUERY, variables: { slug } })
    .then(({ data }) => {
      const { thumbBySlug } = data
      if (thumbBySlug) {
        client
          .mutate({
            mutation: UPDATE_MUTATION,
            variables: {
              id: thumbBySlug._id,
              slug,
              upCount: thumbBySlug.upCount,
              downCount: thumbBySlug.downCount + 1,
            },
          })
          .catch((e) => callback(e))
      } else {
        client
          .mutate({ mutation: CREATE_MUTATION, variables: { slug } })
          .catch((e) => callback(e))
      }
      callback(null, {
        // return null to show no errors
        statusCode: 200,
        body: JSON.stringify({ slug: slug }),
      })
    })
    .catch((e) => callback(e))
}
