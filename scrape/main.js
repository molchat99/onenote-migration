const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
const fs = require('fs');

const login = require('./login')
const getLogNames = require('./getLogNames')
const readLog = require('./readLog')

// load credentials, parameters
const credentialsPath = '../credentials.json'; // Replace with the actual path
const parametersPath = '../parameters.json';
const sourceLogsPath = './sourceLogs.json';

const credentials = JSON.parse(fs.readFileSync(credentialsPath));
const parameters = JSON.parse(fs.readFileSync(parametersPath));
let sourceLogs = JSON.parse(fs.readFileSync(sourceLogsPath));


async function initDriver() {
    const driver = await new Builder()
        .forBrowser('chrome')
        .build();
    return driver;
}

// main
(async () => {
    const driver = await initDriver();
  
    login(driver, parameters, credentials);
  
    await new Promise((resolve) => {
      setTimeout(resolve, 12000);
    });


    for (let i = 0; i < sourceLogs.length; i++) {
      console.log(`reading ${sourceLogs[i]}`);
      await readLog(driver, sourceLogs[i]);
      await new Promise((resolve) => {
        setTimeout(resolve, 8000);
      });
    }
  
  })();