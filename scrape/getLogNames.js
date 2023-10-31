const { By, until } = require('selenium-webdriver');
const fs = require('fs');
const he = require('he');

module.exports = async function getLogNames(driver) {
    try {
        console.log("reading pages now...")
        driver.switchTo().defaultContent();
        const iframe = await driver.findElement(By.id("WebApplicationFrame"));
        await driver.switchTo().frame(iframe);

        await driver.wait(until.elementsLocated(By.className('navItem__content___nUAlI')), 10000)
        const elements = await driver.findElements(By.className('navItem__content___nUAlI'));

        const sourceLogs = [];
        for (const element of elements) {
            let innerHTML = await element.getAttribute('innerHTML');
            sourceLogs.push(he.decode(innerHTML));
        }
        fs.writeFileSync("sourceLogs.json", JSON.stringify(sourceLogs, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the WebDriver instance
        //await driver.quit();
    }
}