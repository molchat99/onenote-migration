const { By, until } = require('selenium-webdriver');

module.exports = async function readLog(driver, pageName) {
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
                    const filename = `table-data/tableData_${i}.json`;
                    fs.writeFileSync(filename, JSON.stringify(outputJson, null, 2));
                    console.log(`Table data written to ${filename}`);
                    continue
                }
                const filename = `table-data/tableData_${i}.json`;
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