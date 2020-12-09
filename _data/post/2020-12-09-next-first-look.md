---
template: BlogPost
date: 2020-12-09T00:00:00.000Z
published: true
title: 'Let's look at NEXTjs'
source: 'https://gitlab.com/jameskolean/next-playground'
tags:
  - JavaScript
  - NEXT
thumbnail: /assets/dog-window-unsplash.jpg
---

Today I took a look at NEXTjs, which was long overdue. The feature that caught my attention is the ability to generate pages in multiple ways. I think it will be interesting if we can have an example of each in a single app.
Static Site Generation SSG. This type of page is generated during a build process and deployed on a CDN. GatsbyJS does this extremely well. They may use Markdown files or Headless CMS.
Server-Side Render SSR. This type of page is generated on each user request. You would use this for dynamic pages or pages. They don't scale well and require a running server in production.
Client-Side Render CSR. This type of page will typically be an SSG container with Javascript. The client will run the javascript to fetch data, update the DOM, and respond to user actions. CRS is a pattern I use in GatsbyJS regularly.
Incremental Static Regeneration (IRS). This type of page is a hybrid of SSG and SSR. NEXTjs will generate static pages only when the user requests a non-generated page or when a regeneration time limit has passed. This approach's benefit can be seen with enormous page sets where the time to generate them all upfront is prohibitive.

The sample application is deployed to Vercel [here](https://next-playground-weld.vercel.app/)

Let's start by building an app. I tried to use Yarn, but it errored out. Npx works, so I'll use that.

## Create the App

```shell
npx create-next-app
```

call it next-playground

```shell
cd next-playground
yarn dev
```

go to https://localhost:3000 to see your new app.

## Static Site Generation SSG.

Let's use some Markdown files in the example. See the source repository for the Markdown files in `notes/first.md` and `notes/second.md`. In `lib\notes-util.js` is the code we will use to simplify access.

Install some dependencied

```shell
yarn add gray-matter remark remark-html
```

I `pages/index.js` add navigation to our test pages.

```javascript
<imports are here>
export async function getStaticProps() {
  const allNotesData = getSortedNotesData()
  return {
    props: {
      allNotesData,
    },
  }
}

<Home function definition is here>


<div className={styles.card}>
  <h3>Static Site Generateration (SSG)</h3>
            <p>
              Here is an example page using static generation. We also show off
              dynamic routes because it's pretty crucial for this type of
              renderting.
            </p>
            <ul className={styles.list}>
              {allNotesData.map(({ id, date, title }) => (
                <li className={styles.listItem} key={id}>
                  <Link href={`ssg/${id}`}>
                    <a>{title} &rarr;</a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

<more code here>
```

Now for the example pages

> /pages/ssg/[id].js

```javascript
import { getAllNoteIds, getNoteData } from '../../lib/notes-util'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../../styles/Home.module.css'

export async function getStaticPaths() {
  const paths = getAllNoteIds()
  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const noteData = await getNoteData(params.id)
  return {
    props: {
      noteData,
    },
  }
}

export default function Post({ noteData }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{noteData.title}</title>
      </Head>
      <main className={styles.main}>
        <article>
          <h1 className={styles.title}>{noteData.title}</h1>
          <div>
            <Date dateString={noteData.date} />
          </div>
          <div dangerouslySetInnerHTML={{ __html: noteData.contentHtml }} />
        </article>
        <Link href='/'>
          <a className={styles.card}>Go Home</a>
        </Link>
      </main>
    </div>
  )
}
```

## Server-Side Rendering SSR

For this example, we will call an API to get a random image. In an actual application, the API could require credentials that we don't want to share with the client.

> pages/ssr.js

```javascript
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

function Ssr({ imageUrl }) {
  console.log('url', imageUrl)
  return (
    <div className={styles.container}>
      <Head>
        <title>Server Side Rendered Page</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Server Side Rendered Page</h1>
        <img src={imageUrl} />
        <Link href='/'>
          <a className={styles.card}>Go Home</a>
        </Link>
      </main>
    </div>
  )
}

Ssr.getInitialProps = async (ctx) => {
  const res = await fetch('https://source.unsplash.com/random/400x300')
  return { imageUrl: res.url }
}

export default Ssr
```

## Client-Side Rendering CSR

For this example, we will create an SSG page and embed some javascript to play a sound. This pattern gives us the performance of an SSR page with all the power of a react application.

. pages/csr.js

```javascript
import Head from 'next/head'
import Link from 'next/link'
import useSound from 'use-sound'
import styles from '../styles/Home.module.css'

export default function Csr() {
  const [playLaserBlast, { stop }] = useSound('/sounds/laser.mp3', {
    volume: 0.5,
  })
  return (
    <div className={styles.container}>
      <Head>
        <title>Client Side Generated Page</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Client Side Rendered Page</h1>
        <button onClick={playLaserBlast}>Shoot Lasers</button>
        <Link href='/'>
          <a className={styles.card}>Go Home</a>
        </Link>
      </main>
    </div>
  )
}
```

## Incremental Static Regeneration ISR

> pages/isr/[id].js

```javascript
import Head from 'next/head'
import Link from 'next/link'
import styles from '../../styles/Home.module.css'
import { useRouter } from 'next/router'
import { parseISO, format } from 'date-fns'

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}

export async function getStaticProps({ params }) {
  await new Promise((res) => setTimeout(res, 500))
  const noteData = { ...params, title: 'Hello', date: new Date().toString() }
  return {
    props: noteData,
    revalidate: 30,
  }
}

export default function Post(noteData) {
  const router = useRouter()
  if (router.isFallback) {
    return <div> Loading ....</div>
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>{noteData.title}</title>
      </Head>
      <main className={styles.main}>
        <article>
          <h1 className={styles.title}>{noteData.title}</h1>
          <div>page created {noteData.date.toString()}</div>
          <div>in 30 seconds we will revalidate.</div>
          <br />
        </article>
        <Link href='/'>
          <a className={styles.card}>Go Home</a>
        </Link>
      </main>
    </div>
  )
}
```

## API

Another interesting feature I want to include is the simplicity of adding an API. JAMStack leans on this pattern heavily, so seeing it so easy to implement is excellent.

> pages/api/hello.js

```javascript
export default (req, res) => {
  res.statusCode = 200
  res.json({ greeting: 'Hello World' })
}
```

> pages/lambda.js

```javascript
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Lambda() {
  const [greeting, setGreeting] = useState('Unset')
  useEffect(() => {
    const callLamdba = async () => {
      const res = await fetch('api/hello')
      const data = await res.json()
      setGreeting(data.greeting)
    }
    callLamdba()
  }, [])
  return (
    <div className={styles.container}>
      <Head>
        <title>Lambda Page</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Lamdba Page</h1>
        <div className={styles.description}>
          Lambda function says: {greeting}
        </div>
        <Link href='/'>
          <a className={styles.card}>Go Home</a>
        </Link>
      </main>
    </div>
  )
}
```
