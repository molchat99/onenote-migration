const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
const fs = require('fs');
const HtmlTableToJson = require('html-table-to-json');

const login = require('./scrape/login')
const getLogNames = require('./scrape/getLogNames')
const readLog = require('./scrape/readLog')

// load credentials, parameters
const credentialsPath = '../credentials.json'; // Replace with the actual path
const parametersPath = '../parameters.json';
const credentials = JSON.parse(fs.readFileSync(credentialsPath));
const parameters = JSON.parse(fs.readFileSync(parametersPath));

async function initDriver() {
    const driver = await new Builder()
        .forBrowser('chrome')
        .build();
    return driver;
}

// main
(async () => {
    const driver = await initDriver();

    login(driver, parameters, credentials)
    setTimeout(() => {
        readLog(driver, "Log231006-01_CMCMA 11 1.5%_CMT_NG")
    }, 15000)
    
})();