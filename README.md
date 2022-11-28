# prevjs

> :warning: **Project is still under Beta stage**: Things move fast and can break!


## About prevjs
PrevJS is a static website builder built on top of EJS templates. Its main goal is to build, optimize and deploy static websites with much less work.

## Features
* Create - Created for front-end people who want to code in plain html, js and css
* Build - Export optimized for SEO with sitemap generation, webp conversion and minification
* Deploy - Host to your CDN in a click. Supports AWS CloudFront for now

## How to use
Before using prevjs it requires a website folder in your local system created with EJS pages and a recipe.json at its root. The website structure is bit different from conventional organization that is usually used in a regular EJS website. For more details on structure see below

## Sample PrevJS Website Structure
```
website/recipe.json => Stores configuration of this website for PrevJS
website/index.ejs => Index page of the website
website/about/index.ejs => Example route of another page in site

website/DRAFTS => Any page that should not be deployed, are placed inside this folder
website/DRAFTS/working.ejs => Example drafts page

website/PARTIALS => All re-used components and sections of website used in multiple pages
website/PARTIALS/header.ejs => Example partial for header in all pages

website/TEMPLATES => Contains templates for dynamically generating pages from json data
website/TEMPLATES/example-template/template.ejs => HTML page with data variables of an example template
website/TEMPLATES/example-template/template.json => Contains array of page data each with unique dynamic route

website/STATIC => All static files like images,js and css are stored here
website/STATIC/css/external => All third party css files
website/STATIC/css/internal => All internal styles written for this site
website/STATIC/js/external => All third party JS files and libraries
website/STATIC/js/internal => All internal js code written for this site
website/STATIC/images => Images used in this website, can be nested like webpages
website/STATIC/favicon.ico => Website Favicon
```

## Sample recipe.json file
```
{
  "recipe_ver": "0.0.1",
  "name": "business-website",
  "description": "Business - Product site",
  "author": "Business Inc",
  "production_url": "https://business.com",
  
   "optimize": {
    "webp": "true",
    "minify_js": "true",
    "minify_css": "true",
    "minify_html": "true"
  },
  "deploy": {
    "domain": "https://business.com",
    "type": "aws",
    "aws_bucket": "",
    "aws_cfdistributions": ""
  }
}

```

## Step 1: Install prevjs CLI command from NPM registry
```npm install @produle/prevjs -g```

## Step 2: To create a very basic prevjs site (Optional)
```prevjs --create /path-to-where-my-website-folder-should-be/```

## Step 3: To preview your website in local machine
```prevjs --run /path-to-my-website-folder/recipe.json```

## Step 4: To optimize and export your website for production
```prevjs --export /path-to-my-website-folder/recipe.json```

## Step 5: To deploy your exported website in production AWS cloudfront
```prevjs --deploy /path-to-my-website-folder/recipe.json```
(Requires aws command setup)


## Dynamic page generation using TEMPLATES
This TEMPLATES folder is used for dynamically generating pages with data. Data can be either inline inside the template.json or from a remote JSON url.

Each template folder inside TEMPLATES should contain the following files with these specific names:
> template.ejs = Contains the template html structure filled with data variables

> template.json = Contains array of page data which is used for generating pages using template.ejs

### Sample template.json
```
{
  "generate": true,
  "pages": [
    {
      "path": "doc/article1",
      "source": "inline",
      "data": {
        "title": "Doc Title 1",
        "post": "Post article 1"
      }
    },
    {
      "path": "doc/article2",
      "source": "jsonurl",
      "dataurl": "https://recipes.prevjs.com/examples/basic/article2.json"
    
    }
  ]
}


```


## About EJS
To know more about EJS and how to create websites with EJS templates check their website https://ejs.co/

## Sponsors
This open source website builder is sponsored by [MockFlow](https://www.mockflow.com/) - the leader in lo-fi wireframing.




