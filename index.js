const WebPageTest = require("webpagetest");
const config = require('config');
const wpt = new WebPageTest('www.webpagetest.org', config.wpt_api_key);
const helpers = require('./utils/helperFunctions');
const argv = require('yargs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const Queue = require('./utils/queue')
const csvWriter = createCsvWriter({
    path: './report.csv',
    header: [
        { id: 'url', title: 'URL' },
        { id: 'test_id', title: 'Test ID' },
        { id: 'pageLinks', title: 'Page Links' },
        { id: 'CumulativeLayoutShift', title: 'CumulativeLayoutShift' },
        { id: 'Images', title: 'Images' },
        { id: 'domComplete', title: 'DomComplete' },
        { id: 'jsBytesUncompressed', title: 'JS Bytes Uncompressed' },
        { id: 'htmlBytesUncompressed', title: 'Html Bytes Uncompressed' },
        { id: 'cssBytesUncompressed', title: 'CSS Bytes Uncompressed' },
        { id: 'longTasks', title: 'Long Tasks' },
        { id: 'level', title: 'Level' }
    ]
});
let wptOptions = {
    "firstViewOnly": true,
    "runs": 1,
    "location": 'Dulles:Chrome',
    "connectivity": '4G',
    "pollResults": 25,
    "timeout": 600,
    "timeline": true,
    customMetrics: [
        '[memory]',
        'return new Promise((resolve) => { performance.measureUserAgentSpecificMemory().then((value) => { resolve(value.bytes); }); });',
        '[pageLinks]',
        'let urls=[];',
        'for(var i = document.links.length; i --> 0;)',
        'if(document.links[i].hostname === location.hostname)',
        'urls.push(document.links[i].href)',
        'return urls',
    ].join('\n'),
    commandLine: '--disable-web-security',
}
let linksArray = [];
let queue = new Queue();
argv.command('webpagetest', 'Read a file', (yargs) => { }, async (argv) => {

    console.log('Reading your file now...');
    let fileData = await helpers.promisedReadFile(argv.filePath);

    const wptUrls = fileData.split(',');

    wptUrls.forEach(value => {

        queue.enqueue({
            url: value,
            level: 0
        });

    })
    await recursiveCaller(queue);
    let records = [];
    finalResult.forEach((value, key) => {

        let csvObject = {};
        csvObject.url = key;
        csvObject.pageLinks = value.pageLinks.length;
        csvObject.Images = value.Images.length;
        csvObject.htmlBytesUncompressed = value.breakdown.html.bytesUncompressed;
        csvObject.cssBytesUncompressed = value.breakdown.css.bytesUncompressed;
        csvObject.jsBytesUncompressed = value.breakdown.js.bytesUncompressed;
        csvObject.test_id = value.test_id;
        csvObject.longTasks = value.longTasks.length;
        csvObject.level = value.level;

        console.log("level with url :-", value.level, key)
        value.chromeUserTiming.forEach(chromObject => {
            if (chromObject.name == 'CumulativeLayoutShift')
                csvObject.CumulativeLayoutShift = chromObject.value;
            if (chromObject.name == 'domComplete')
                csvObject.domComplete = chromObject.time;
        })
        records.push(csvObject);
    })
    csvWriter.writeRecords(records)       // returns a promise
        .then(() => {
            console.log('Done Writing To CSV');
        });
}).argv;

let finalResult = new Map();
let submission_count = 0;
let recursiveCaller = (urls_queue) => {

    if (linksArray.length <= 10) {
        return Promise.all(urls_queue.items.map(async url_object => {
            let url = url_object;
            try {

                if (submission_count == 5) {
                    sleep(3000);
                    console.log("Timer reset");
                    submission_count = 0;
                }
                if (!linksArray.includes(url) && linksArray.length <= config.url_limit && submission_count < 5) {
                    linksArray.push(url);
                    submission_count++;
                    let url_queue_onject = urls_queue.front()
                    let url_from_queue = url_queue_onject.url;
                    level = url_queue_onject.level;
                    urls_queue.dequeue();
                    if (url_queue_onject.level <= config.level) {
                        let wptResult = await helpers.runTest(wpt, url_from_queue, wptOptions);
                        wptResult.result.data.median.firstView.test_id = wptResult.result.data.id;
                        wptResult.result.data.median.firstView.level = url_queue_onject.level;
                        finalResult.set(url_from_queue, wptResult.result.data.median.firstView)

                        if (wptResult.result.data.median.firstView.pageLinks) {
                            let pageLinks = wptResult.result.data.median.firstView.pageLinks;
                            pageLinks.forEach(pageLink => {

                                urls_queue.enqueue(
                                    {
                                        url: pageLink,
                                        level: url_queue_onject.level + 1
                                    })
                            })
                            await recursiveCaller(urls_queue)
                        }
                    }

                }

            } catch (error) {
                console.log(error)
                console.log("Error while testing :-", JSON.parse(JSON.stringify(error)))
            }


        })
        )
    }
    else
        return;


}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}