---
template: BlogPost
date: 2022-09-22
published: true
title: "PWA with React and Vite."
source: "https://gitlab.com/jameskolean/pwa-react-vite"
demoSite: "https://jameskolean.gitlab.io/pwa-react-vite/"
tags:
  - React
  - Rest
  - Tools
thumbnail: /assets/phone-app-unsplash.jpg
---

Let's make a Progressive Web Application (PWA)

According to [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps).
Progressive Web Apps (PWAs) are web apps that use service workers, manifests, and other web-platform features in combination with progressive enhancement to give users an experience on par with native apps.
PWAs provide a number of advantages to users — including being installable, progressively enhanced, responsively designed, re-engageable, linkable, discoverable, network independent, and secure.

Ahhhh OK? What the heck does that mean?

For our purposes, let's say that PWAs can be installed, and you can launch them Like a standard App. They can also run offline.

## Get Started

Create a React app with Vite

```shell
npm init vite@latest pwa-react-vite -- --template react-ts
```

Test it out

```shell
cd pwa-react-vite
npm install
npm run dev
open http://127.0.0.1:5173/
```

Now add `pwa-react-vite` to help us build our PWA. This plugin builds on [Workbox](https://developer.chrome.com/docs/workbox/), a tool that simplifies dealing with Service Workers.

```shell
 npm install vite-plugin-pwa -D
```

Edit the Vite congiguration.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
});
```

This is enough to set up the Service Worker. Build the app and check out the build artifacts for the service worker `dist/sw.js`

```shell
npm run build
cat dist/sw.js
```

Run the build with the VSCode with the Live Server extension. You will need to add this file.

```json
// .vscode/settings.json
{
  "liveServer.settings.root": "/dist",
  "liveServer.settings.CustomBrowser": "chrome"
}
```

Open the inspector > application > service worker to confirm the service worker was created. Then go offline using the Network tab drop-down and Reload the page. It still Works!

So that's pretty cool. Now let's create a PWA out of our app. We need a couple of things to make it happen.

- A manifest
- Some headers

### Manifest

Edit the Vite config again. You will need some icons you can generate with a tool lokie [this](https://favicon.io/favicon-generator/).

```tyepscript
// vite.config.ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "vite.svg"],
      manifest: {
        name: "Vite PWA",
        short_name: "VitePWA",
        description: "Reat PWA example using vite-plugin-pwa.",
        theme_color: "#ffffff",
        icons: [
          {
            src: "android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
```

### Some Header

Add these headers to `index.html`

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite PWA</title>
    <meta
      name="description"
      content="Reat PWA example using vite-plugin-pwa."
    />
    <link rel="icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
    <link rel="mask-icon" href="/react.svg" color="#FFFFFF" />
    <meta name="theme-color" content="#ffffff" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## HTTPS

For extra credit we can set up Live Server Extension with HTTPS.

```shell
mkdir https
cd https
openssl genrsa -aes256 -out localhost.key 2048
openssl req -days 3650 -new -newkey rsa:2048 -key localhost.key -x509 -out localhost.pem
 cd ..
```

Edit the VSCode config again, making sure to change <<YOUR PATH>>.

```json
// .vscode/settings.json
{
  "liveServer.settings.root": "/dist",
  "liveServer.settings.port": 5001,
  "liveServer.settings.CustomBrowser": "chrome",
  "liveServer.settings.https": {
    "enable": true,
    "cert": "/Users/<YOUR PATH>/pwa-react-vite/https/localhost.pem",
    "key": "/Users/<YOUR PATH>/pwa-react-vite/https/localhost.key",
    "passphrase": "secret"
  }
}
```

In Chrome navigate to `chrome://flags/#allow-insecure-localhost` an enable that setting. Then restart.

If we rebuild and restart Live Server you will see a PWA install icon in the Chrome Address bar.
