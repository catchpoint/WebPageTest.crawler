<p align="center"><img src="https://docs.webpagetest.org/img/wpt-navy-logo.png" alt="WebPageTest Logo" /></p>
<p align="center"><a href="https://docs.webpagetest.org/api/integrations/#officially-supported-integrations">Learn about more WebPageTest API Integrations in our docs</a></p>

# WebPageTest Crawler

The WebPageTest Crawler, crawls through the website to fetch URLs and then runs test on them. Level and URL limit can be given.

![image](https://user-images.githubusercontent.com/31168643/122060468-40ad6680-ce0b-11eb-9f25-ea51eaac22f9.png)

Requires node, npm.

### 1. Installing Packages

Once you have cloned the project run `npm install` to install dependencies. requires node v22.13.0 minumum

```bash
npm install
```

### 2. Updating config values

There are 3 main config values : -

1. wpt_api_key - Check [here](https://docs.webpagetest.org/api/keys/) the API documentation
2. level - integer value, specifies maximum depth the crawler should crawl.
3. limit - integer value, specifies maximum limit of URLs need to tested.
   Note : - Crawling stops if either of them reaches a limit.

### 3. Adding a initial URLs txt file

You can add your initial set of URLs to the startingUrls.txt file by seperating them using a comma.

![image](https://user-images.githubusercontent.com/31168643/122050545-2a021200-ce01-11eb-9400-31e7716791c0.png)

### 4. Lets fire it up

```bash
npm run build & node build/index.js -k [YOUR_API_KEY] -f ./startingUrls.txt
```

Booyah, once the crawl-testing is complete you'll have a report.csv file which includes performance details of the URLs crawled.
