const { By, until } = require('selenium-webdriver');

module.exports = async function login(driver, parameters, credentials) {
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