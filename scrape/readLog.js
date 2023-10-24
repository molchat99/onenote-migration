const { By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const HtmlTableToJson = require('html-table-to-json');

module.exports = async function readLog(driver, pageName) {
    try {
        const parentFolder = 'table-data'; // Name of the parent folder
        const newFolderName = pageName;  // Name of the folder to create
        const folderPath = path.join(__dirname, parentFolder, newFolderName);
        fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
            console.error(`Error creating folder: ${err}`);
        } else {
            console.log(`Folder '${folderPath}' created successfully.`);
        }
        });

        console.log("reading page now...")
        const logNo = pageName.split('_')[0];
        driver.switchTo().defaultContent();
        const iframe = await driver.findElement(By.id("WebApplicationFrame"));
        await driver.switchTo().frame(iframe);
        // scroll the page
        const pageDiv = await driver.findElement(By.css(`div[title='${pageName}']`));
        await driver.executeScript('arguments[0].scrollIntoView();', pageDiv);
        pageDiv.click()
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
                    const jsonPath = __dirname + `/table-data/${pageName}/tableData_${i}.json`;
                    fs.writeFileSync(jsonPath, JSON.stringify(outputJson, null, 2));
                    console.log(`Table data written to ${jsonPath}`);
                    continue
                }
                const jsonPath = __dirname + `/table-data/${pageName}/tableData_${i}.json`;
                fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
                console.log(`Table data written to ${jsonPath}`);
            }
        }, 5000)
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the WebDriver instance
        //await driver.quit();
    }
}