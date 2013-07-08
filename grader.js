#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var checkFileFromURL = function(inurl, checksfile) {
    
    console.log(inurl);
    rest.get(inurl).on('complete', function(result, response){
       if (result instanceof Error) {
          console.error('error on the url');
          process.exit(1);
       } else {
          var infile = '';
          //fs.writeFileSync(infile, result);
          var out = checkHtmlFile(result, checksfile, true);
          console.log(JSON.stringify(out, null, 4));
       }
    });
};


var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtmlUrl = function(urlfile) {
    return cheerio.load(urlfile);
}

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtml = function(htmlfile, checksfile, url) {
 if (htmlfile) {
  console.log('checking file');
  return checkHtmlFile(htmlfile, checksfile);
 } else if (url) {
  console.log('checking url');
  checkFileFromURL(url, checksfile);
 } else {
  console.error('no options left.');
 }
 
}
var checkHtmlFile = function(htmlfile, checksfile, isUrl) {
    console.log('check html file, url ' + checksfile);
    
    if (isUrl) $ = cheerioHtmlUrl(htmlfile);
    else $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) { 
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
        .option('-u, --url <url>', 'URL to index.html')
        .parse(process.argv);
    var checkJson = checkHtml(program.file, program.checks, program.url);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtml = checkHtml;
}
