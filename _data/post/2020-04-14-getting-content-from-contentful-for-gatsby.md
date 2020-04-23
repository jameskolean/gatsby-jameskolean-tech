---
template: BlogPost
date: 2019-08-28T15:36:06.755Z
title: Getting Content from Contentful for Gatsby
thumbnail: /assets/winter-orange-pines-unsplash.jpg
tags:
  - Gatsby
  - Headless CMS
  - GraphQL
source: https://gitlab.com/jameskolean/nohingo/-/tags/Contentful
---

I’m building out a sample project and it’s time to add some content. In the last post we set up a simple GatsbyJS site and added authentication with Auth0. Now it’s time to get some pages built and let’s use Contentful to store that content. This sources code is [here](https://gitlab.com/jameskolean/nohingo/-/tags/Contentful).

You can get started by signing up for an account at Contentful [https://www.contentful.com](http://contentful/). You can follow the instruction to first create some models (these define the data types), then create some data using the models. When you have some data we can configure GatsbyJS to pull the data with Contentful’s GraphQL API.

## Add the Contentful Source plugin

The plugin we need to install that connects GatsbyJS to Contentful is [here](https://www.gatsbyjs.org/packages/gatsby-source-contentful/). Following the documentation we first install with npm.

```shell
npm install --save gatsby-source-contentful
```

Then edit gatsby-config.js to use the plugin. The spaceId and accessToken are found under the Settings menu in API Keys.

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `your_space_id`,
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
      },
    },
  ],
}
```

Explore Contentful with GraphQL

If you start GatsbyJS with`gatsby develop`you can open the GraphQL viewer at[ http://localhost:8000/\_\_\_graphql](http://localhost:8000/___graphql). If you are getting multiple responses then you may have enabled internationalization. In this case, just apply a filter for one locale like this.

```javascript
query MyQuery {
  allContentfulCourse(filter: { node_locale: { eq: "en-US" } }) {
    edges {
      node {
        name
        id
        contentful_id
      }
    }
  }
}
```

## Adding content to the Index page

Now let’s add a list of content items to the index page. In this example we will add ‘Courses’. Just copy the GraphQL into the index.js and use the results of the query to create a list.

```javascript
export const query = graphql`
  {
    courses: allContentfulCourse(filter: { node_locale: { eq: "en-US" } }) {
      nodes {
        slug
        name
        code
      }
    }
  }
`
const IndexPage = ({ data }) => (
  <Layout>
    <SEO title='Home' />
    <h1>NohinGo</h1>
    <p>Welcome to NohinGo.</p>
    <p>The fun way to instruct and learn.</p>
    {data.courses.nodes.map((course) => (
      <div key={`course-${course.slug}`}>
        <h5>
          {course.code} - {course.name}
        </h5>
      </div>
    ))}

    <Link to='/student/'>Student Page</Link>
  </Layout>
)
```

## Adding Content Pages

The next step is to create entire pages from the content. In this example we will create a new page for each ‘Course’. We need to start by telling GatsbyJS about the the ‘Course’ content and ask it to create a new page for each one using a specific template. We do this in gatsby-node.js by adding a createPage function like this.

```javascript
exports.createPages = async ({ actions, graphql, reporter }) => {
  const result = await graphql(`
    {
      allContentfulCourse(filter: { node_locale: { eq: "en-US" } }) {
        nodes {
          slug
        }
      }
    }
  `)
  if (result.errors) {
    reporter.panic('Error Loading Courses', result.errors)
  }
  result.data.allContentfulCourse.nodes.forEach((course) => {
    actions.createPage({
      path: `/${course.slug}`,
      component: require.resolve('./src/templates/course-template.js'),
      context: {
        slug: course.slug,
      },
    })
  })
}
```

Gatsby now knows we want it to generate pages for our courses. Let’s work on src/templates/course-template.js which will do the generation for us.

```javascript
export const query = graphql`
  query($slug: String!) {
    course: contentfulCourse(slug: { eq: $slug }) {
      slug
      name
      description {
        description
      }
    }
  }
`
const CourseTemplate = ({ data: { course } }) => (
  <Layout>
    <SEO title={course.name} />

    <p>
      <h1>{course.name}</h1>
      <p>{course.description.description}</p>
    </p>
  </Layout>
)

export default CourseTemplate
```

We will defer displaying rich text, and media for another day…
