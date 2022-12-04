# PrevJS

## About 
PrevJS is a super-easy static website generator built on top of EJS templates. It's main goal is to build, optimize and deploy static websites with much less work.

## Features
* 🧑‍💻 Create - Created for front-end people who want to code in **plain html, js and css**. Which also means you can convert your existing static website into a prevjs site easily
* ⏱ Build - Export **optimized for SEO** with sitemap generation, page pre-fetching, webp conversion and minification. Scores 99 in Google pagespeed tool.
* 🎉 Deploy - Host to your CDN in a click. Out of box support for **AWS CloudFront**
* 🎭 Dynamic templates - Generate **static webpages dynamically** from JSON data with a single template. Useful for blog, doc
* 👀 **Dynamic template preview** without export. Just enter the dynamic path in your browser and PrevJS will automatically load the page with related data
* 🧩 PrevJS sites can be **part of your existing website**. Since a prevjs site has almost no dependencies or node modules. It can be part of your existing website even if it is a JSP or PHP site.
* 😍 **Live preview** of site - no reloading of webpages after editing
* 😇 **Future-proof**, the code both in development and export is web native as it requires no special modifications or libraries (except ejs). Which means even in the un-likely event PrevJS is not maintained, your code will not go bust like other un-maintained site generators.


# How to use

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

## To list locally available website recipes
```prevjs --list-recipes local```

## To install a particular recipe
```prevjs --create business1 /path-to-my-site/recipe.json```


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

## Dynamic page generation using TEMPLATES
This TEMPLATES folder is used for dynamically generating pages with data. Data can be either inline inside the template.json or from a remote JSON url. Useful when the webpage design does not change but only it's data is different for each page.

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
## Tips
To setup absolute paths to assets inside the ejs files, Use this variable ```<%= siteobj.urlpath =>```
It comes with a trailing slash and automatically detects between local and production environments.

## About EJS
To know more about EJS and how to create websites with EJS templates check their website https://ejs.co/

## Sponsors
This open source website builder is sponsored by [MockFlow](https://www.mockflow.com/) - the leader in lo-fi wireframing.




