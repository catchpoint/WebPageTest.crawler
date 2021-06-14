const fs = require('fs');

exports.retrieveResults = (wpt, testId) => {
    return new Promise((resolve, reject) => {
        wpt.getTestResults(testId, (err, data) => {
            if (data) {
                return resolve(data);
            } else {
                return reject(err);
            }
        });
    });
}

exports.runTest = (wpt, url, options) => {
    // clone options object to avoid WPT wrapper issue
    let tempOptions = JSON.parse(JSON.stringify(options));

    return new Promise((resolve, reject) => {
        console.info(`Submitting test for ${url}...`);
        wpt.runTest(url, tempOptions, async(err, result) => {
            try {
                if (result) {
                    return resolve({'result':result,'err':err});
                } else {
                    return reject(err);
                }
            } catch (e) {
                console.info(e);
            }
        })
    });
}

exports.promisedReadFile = (filePath) =>{

    return new Promise((resolve,reject) =>{
        
        fs.readFile(filePath,'utf8',(err,data)=>{

            if(err)
                reject(err);
            
            resolve(data)
        })
    })
    
}