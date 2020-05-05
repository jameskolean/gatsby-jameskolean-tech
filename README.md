# My Dev Notes

This simple website built with GatsbyJS using Netlify CMS. It's hosted on Netlify but the Domain is managed by CloudFront and Registered at NameCheap.

## Domain setup

Deploy the site on Netlify and rename it to something you can rebember (jameskolean-tech.netlify.com). Then add these DNS records to Cloudflare naming sure that Cloudflare DNS Only (grey cloud).

```properties
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
