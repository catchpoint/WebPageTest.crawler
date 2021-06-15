<p align="center"><img src="https://docs.webpagetest.org/img/wpt-navy-logo.png" alt="WebPageTest Logo" /></p>
<p align="center"><a href="https://docs.webpagetest.org/api/integrations/#officially-supported-integrations">Learn about more WebPageTest API Integrations in our docs</a></p>

# WebPageTest Crawler

The WebPageTest Crawler, crawls through the website to fetch URLs and then runs test on them. Level and URL limit can be given.

![image](https://user-images.githubusercontent.com/31168643/122060468-40ad6680-ce0b-11eb-9f25-ea51eaac22f9.png)

Requires node, npm.

### 1. Installing Packages

Once you have cloned the project run `npm install` to install dependencies.
```bash
npm install
```

### 2. Updating config values

There are 3 main config values : - 
  1. wpt_api_key - WebPageTest API Key. [Get yours here](https://app.webpagetest.org/ui/entry/wpt/signup?enableSub=true&utm_source=docs&utm_medium=github&utm_campaign=slackbot&utm_content=account)
  2. level - integer value, specifies maximum depth the crawler should crawl.
  3. url_limit - integer value, specifies maximum limit of URLs need to tested.
Note : - Crawling stops if either of them reaches a limit.

### 3. Adding a initial URLs txt file

You can add your initial set of URLs to the whiteListUrls.txt file by seperating them using a coma.

![image](https://user-images.githubusercontent.com/31168643/122050545-2a021200-ce01-11eb-9400-31e7716791c0.png)

### 4. Lets fire it up

Start the node-server by running `npm start`
```bash
npm start
```
Booyah, once the crawl-testing is complete you'll have a report.csv file which includes performance details of the URLs crawled.
