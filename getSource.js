const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
const fs = require('fs');
const HtmlTableToJson = require('html-table-to-json');

// load credentials, parameters
const credentialsPath = './credentials.json'; // Replace with the actual path
const parametersPath = './parameters.json';
const credentials = JSON.parse(fs.readFileSync(credentialsPath));
const parameters = JSON.parse(fs.readFileSync(parametersPath));

async function initDriver() {
    const driver = await new Builder()
        .forBrowser('chrome')
        .build();
    return driver;
}

async function loginToWebsite(driver) {
    try {
        // Navigate to the login page and switch to iframe // then login and get notebook
        await driver.get('https://www.onenote.com/hrd?wdorigin=ondcauth2&wdorigin=poc');
        const iframe = await driver.findElement(By.css("iframe.signinframe"));
        await driver.switchTo().frame(iframe);
        const body = await driver.findElement(By.tagName('body'));
        const mailField = await driver.wait(until.elementIsVisible(body.findElement(By.css("input[type='email']"))));
        mailField.sendKeys(credentials.username)
        const submit = await driver.wait(until.elementIsVisible(body.findElement(By.className('btn'))));
        await submit.click()
        setTimeout(async function() {
            driver.switchTo().defaultContent();
            const pwField = await driver.wait(until.elementIsVisible(driver.findElement(By.className('input'))));
            pwField.sendKeys(credentials.password)
            const signIn = await driver.wait(until.elementIsVisible(driver.findElement(By.className('ext-primary'))));
            await signIn.click()
            const yesBtn = await driver.wait(until.elementIsVisible(driver.findElement(By.className('ext-primary'))));
            await yesBtn.click()
            const noteBookLink = await driver.wait(until.elementIsVisible(driver.findElement(By.css(`a[data-notebook-name="${parameters.notebook_name}"]`)))); 
            noteBookLink.click()
            console.log("Logged in successfully")
        }, parameters.timeout);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the WebDriver instance
        return true;
        //await driver.quit();
    }
}

async function readLog(driver, pageName) {
    try {
        console.log("reading pages now...")
        const logNo = pageName.split('_')[0];
        driver.switchTo().defaultContent();
        const iframe = await driver.findElement(By.id("WebApplicationFrame"));
        await driver.switchTo().frame(iframe);
        const pagesContainer = await driver.wait(until.elementIsVisible(driver.findElement(By.css(`div[title='${pageName}']`))));
        pagesContainer.click()
        // save tableElements as json
        setTimeout( async () => {
            const tableElements = await driver.findElements(By.tagName('table'));
            for (let i = 0; i < tableElements.length; i++) {
                const tableElement = tableElements[i];
                const tableHtml = await tableElement.getAttribute('outerHTML');
                const jsonTable = HtmlTableToJson.parse(tableHtml);
                let jsonData = jsonTable.results;
                jsonData = jsonData[0]
                if(i == 5) {
                    const outputJson = [{
                        "Log no.": logNo,
                        "Title": "",
                        "Operator": "",
                        "Description": ""
                    }];
                    outputJson[0]["Title"]  = jsonData[0][logNo];
                    outputJson[0]["Operator"]  = jsonData[1][logNo];
                    outputJson[0]["Description"]  = jsonData[2][logNo];
                    const filename = `tableData_${i}.json`;
                    fs.writeFileSync(filename, JSON.stringify(outputJson, null, 2));
                    console.log(`Table data written to ${filename}`);
                    continue
                }
                const filename = `tableData_${i}.json`;
                fs.writeFileSync(filename, JSON.stringify(jsonData, null, 2));
                console.log(`Table data written to ${filename}`);
            }
        }, 5000)
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the WebDriver instance
        //await driver.quit();
    }
}

(async () => {
    const driver = await initDriver();

    loginToWebsite(driver)
    setTimeout(() => {
        readLog(driver, "Log231006-01_CMCMA 11 1.5%_CMT_NG")
    }, 14000)
    
})();
