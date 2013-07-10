#!/usr/bin/env node
/*
 * Automatically grade files for presence of specified HTML tags/attributes.
 * Uses commander.js and cheerio. teaches command line application development 
 * and basic DOM Parsing
 *
 * References:
 *  Cheerio 
 *  Commander.js
 *  JSON
 */

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var util = require('util');
var HTMLFILE_DEFAULT="index.html";
var CHECKSFILE_DEFAULT="checks.json";
var URL_CONTENT_FILE="foobaz.html";

var assertFileExists = function(infile) {
  var instr = infile.toString();
  if(!fs.existsSync(instr))
  {
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1);
  }
  return instr;
};


var getUrlContent = function(checksFile) {
    var response2content = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
            process.exit(1);
        } else {
            processValidationOutput(result, checksFile);
        }
    };
    return response2content;
};

var requestURLContent = function(getUrl, checksFile) {
    var response2content = getUrlContent(checksFile);
    restler.get(getUrl).on('complete', response2content);
};


var cheerioLoad = function(contentString)
{
  return cheerio.load(contentString);
};

var cheerioHtmlFile = function(htmlFile){
  return fs.readFileSync(htmlFile);
};

var loadChecks = function(checksFile){
  return JSON.parse(fs.readFileSync(checksFile));
};

var checkFile = function(cheerioContent, checksFile)
{
  $ = cheerioLoad(cheerioContent);
  var checks = loadChecks(checksFile);
  var out = {};

  for(var ii in checks)
  {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};

var clone = function(fn) {
  // Commander issue workaround -> SO 6772648
  return fn.bind({});
};

var processValidationOutput = function(content, checksFile)
{
    var checkJSON = checkFile(content, checksFile);
    var outJSON = JSON.stringify(checkJSON, null, 4);
    console.log(outJSON);
}

if(require.main == module) {
  program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html' )
    .option('-u, --url <url>', 'URL of page to check')
    .parse(process.argv);
  
  if(program.file && program.url)
  {
    console.log("File and URL cannot be used together");
    process.exit(1);
  }
  
  if(program.file)
  {
    processValidationOutput(cheerioHtmlFile(program.file), program.checks);
  } else if (program.url) {
    requestURLContent(program.url, program.checks);
  } else {
    console.log("cannot continue, unknown file to parse");
    process.exit(1);
  }

} else {
  exports.checkHtmlFile = checkHtmlFile;
}





