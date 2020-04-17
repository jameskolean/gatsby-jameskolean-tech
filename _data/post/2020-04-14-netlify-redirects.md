---
template: BlogPost
date: 2020-04-03T13:46:18.634Z
title: Netlify Redirects
thumbnail: /assets/detour-unsplash.jpg
---
Netlify allows redirects at the edge. There is an example Gatsby project[ here](https://github.com/jameskolean/gatsby-netlify-redirects).

You basically have two options, the first is the simplest and the second allows for complex rules:

### Use `_redirects`

This requires a file called _redirects in the static folder. Then just add your redirects redirects. See Netlify docs [here](https://docs.netlify.com/routing/redirects/#syntax-for-the-redirects-file)

#### Example

```shell
# redirect request for non-existent page at /no-where to /welcome-to-the-blog
/no-where              /welcome-to-the-blog
```

### Or use `netlify.toml`

This requires a file called **netlify.toml** in the project root. In this file you can add redirects with rules. Here is an example of different routes based on Locales. Note: As of this writing there is a bug preventing this from working with complex accepts-language header. It should be fixed in Q2 of 2020.

```toml
[[redirects]]
  from = "/no-where/*"
  to = "/welcome-to-the-blog"
  conditions = {Language = ["en"], Country = ["US"]}
 
[[redirects]]
  from = "/no-where/*"
  to = "/hello-world"
  conditions = {Language = ["fr"], Country = ["FR"]}
```

## Routing based on roles

This requires a paid plan, for details see the post [here](https://www.netlify.com/blog/2019/01/31/restrict-access-to-your-sites-with-role-based-redirects/).
