# prevjs

## About prevjs
PrevJS is a static website builder built on top of EJS templates. Its main goal is to build, optimize and deploy static websites with much less work.

## How to use
Before using prevjs it requires a website folder in your local system created with EJS pages and a recipe.json at its root. The website structure is bit different from conventional organization that is usually used in a regular EJS website. For more details on structure see below

## Sample PrevJS Website Structure
website/recipe.json => Stores configuration of this website for PrevJS
website/index.ejs => Index page of the website
website/about/index.ejs => Example route of another page in site

website/DRAFTS => Any page that should not be deployed, are placed inside this folder
website/DRAFTS/working.ejs => Example drafts page

website/PARTIALS => All re-used components and sections of website used in multiple pages
website/PARTIALS/header.ejs => Example partial for header in all pages

website/STATIC => All static files like images,js and css are stored here
website/STATIC/css/external => All third party css files
website/STATIC/css/internal => All internal styles written for this site
website/STATIC/js/external => All third party JS files and libraries
website/STATIC/js/internal => All internal js code written for this site
website/STATIC/images => Images used in this website, can be nested like webpages
website/STATIC/favicon.ico => Website Favicon

## Sample recipe.json file
{
  "recipe_ver": "0.0.1",
  "name": "business-website",
  "description": "Business title - Here is my awesome product",
  "author": "Vendor name",
  
   "optimize": {
    "webp": "true",
    "minify_js": "true",
    "minify_css": "true",
    "minify_html": "true"
  },
  "deploy": {
    "domain": "https://business.com",
    "type": "aws",
    "aws_id": "",
    "aws_secret": ""
  }
}


