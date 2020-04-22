---
template: BlogPost
date: 2019-08-30T15:33:24.177Z
title: GatsbyJS adding Video and Audio
thumbnail: /assets/headphones-water-unsplash.jpg
source: https://gitlab.com/jameskolean/nohingo/-/tags/Added-Lesson-Video-and-Audio
---

This this post I added Video and Audio to my GatsbyJS site. The Video and Audio assets are stored in Contentful. This example uses a Lesson Plan created by an instructor. The Lesson Plan is a document that can have many heterogenous sections. In this case I created a section for Video content and another for Audio content. The instructor can create as many sections as they like and can order them as they like.

Step one is to tell Gatsby about the Lesson pages. We do this by editing gatsby-node.js. We already told it how to create Course pages so it’s easy to add the logic for Lesson page creation.

```javascript
exports.createPages = async ({ actions, graphql, reporter }) => {
  const result = await graphql(`
    {
      allContentfulCourse(filter: { node_locale: { eq: "en-US" } }) {
        nodes {
          slug
        }
      }
      allContentfulLesson(filter: { node_locale: { eq: "en-US" } }) {
        nodes {
          slug
        }
      }
    }
  `)
  if (result.errors) {
    reporter.panic('Error Loading Courses', result.errors)
  }
  result.data.allContentfulCourse.nodes.forEach(course => {
    actions.createPage({
      path: `/courses/${course.slug}`,
      component: require.resolve('./src/templates/course-template.js'),
      context: {
        slug: course.slug,
      },
    })
  })
  result.data.allContentfulLesson.nodes.forEach(lesson => {
    actions.createPage({
      path: `/lesson/${lesson.slug}`,
      component: require.resolve('./src/templates/lesson-template.js'),
      context: {
        slug: lesson.slug,
      },
    })
  })

```

Now we need to create /src/templates/lesson-template.js and have it build the lesson pages for us. We will need to use some new react components to play the files. I am using[ react-audio-player](https://www.npmjs.com/package/react-audio-player) and[ react-video](https://video-react.js.org/). Just follow the installation instruction. Now we can write the Lesson template. Basically we just want to loop over the section and render the proper component type.

```javascript
import React from 'react'
import PropTypes from 'prop-types'
import { Player } from 'video-react'
import ReactAudioPlayer from 'react-audio-player'
import { graphql } from 'gatsby'
import Layout from '../components/layout'
import SEO from '../components/seo'
import '../../node_modules/video-react/dist/video-react.css' // import css

export const query = graphql`
  query($slug: String!) {
    lesson: contentfulLesson(slug: { eq: $slug }) {
      id
      slug
      title
      sections {
        ... on ContentfulAudioSection {
          id
          caption
          audio {
            id
            file {
              url
            }
          }
        }
        ... on ContentfulVideoSection {
          id
          caption
          video {
            id
            file {
              url
            }
          }
        }
      }
    }
  }
`

const LessonTemplate = ({ data: { lesson } }) => {
  console.log(lesson.sections)
  return (
    <Layout>
      <SEO title={lesson.title} />
      <h1>{lesson.title}</h1>
      {lesson.sections.map((section) => {
        if (section.video) {
          const videoUrl = `https:${section.video.file.url}`
          return <Player key={section.video.id} playsInline src={videoUrl} />
        }
        if (section.audio) {
          const audioUrl = `https:${section.audio.file.url}`
          return <ReactAudioPlayer autoPlay controls src={audioUrl} />
        }
        return <h1>unknown component</h1>
      })}
    </Layout>
  )
}

export default LessonTemplate
```

That’s all there is to it. The source is[ here](https://gitlab.com/jameskolean/nohingo/-/tags/Added-Lesson-Video-and-Audio).
