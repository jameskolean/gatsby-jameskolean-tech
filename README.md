# My Dev Notes

This simple website built with GatsbyJS using Netlify CMS. It's hosted on Netlify but the Domain is managed by CloudFront and Registered at NameCheap.

## Domain setup

Deploy the site on Netlify and rename it to something you can rebember (jameskolean-tech.netlify.com). Then add these DNS records to Cloudflare naming sure that Cloudflare DNS Only (grey cloud).

```bash
CNAME jameskolean.tech jameskolean-tech.netlify.com Auto DNS only
CNAME www jameskolean-tech.netlify.com Auto DNS only
```

## Accessing Netlify CMS Admin

- Goto **Github User Info** > **Developer Settings** > **OAuth Apps** > **New OAuth App**
- Enter the generated Client ID and Secret.
- Goto your Netlify site dashboard
- Goto **Access Control** > **OAuth** then **Install Provider** you need to select Provider as Github as add Client ID and Secret.
- Your Netlify CMS is ready. Goto you netlify site URL and append `/admin/`. for example `example.netlify.com/admin/`, You will see login with Github button.

Note: Netlify CMS writes to your GitHub repo **Not** your local files. You will need to pull the Master branch to see the updates.

# Running NetlifyCMS locally

To run NetlifyCMS locally you need to make some changes to it's configuration. These change must never be checked into master.

open ./static/admin/config.xml and make these edits at the top of the file

```
backend:
  name: proxy
  proxy_url: http://localhost:8081/api/v1
  branch: master
  # name: gitlab
  # repo: avenue-boutique/gatsby-shop-local
media_folder: static/assets
public_folder: /assets
# publish_mode: editorial_workflow
collections:
 ...

```

then you need to run: `npx netlify-cms-proxy-server`
