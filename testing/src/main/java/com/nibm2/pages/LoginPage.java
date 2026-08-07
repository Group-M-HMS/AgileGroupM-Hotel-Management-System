package com.nibm2.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import java.util.List;

public class LoginPage extends BasePage {

    private final By emailField = By.xpath("//input[@placeholder='Email*']");
    private final By passwordField = By.xpath("//input[@placeholder='Password*']");
    private final By submitButton = By.cssSelector("button[type='submit']");
    private final By authErrorMsg = By.xpath("//div[contains(@class, 'text-red-500')]");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        driver.get(baseUrl + "/login");
    }

    public void fillForm(String email, String password) {
        type(emailField, email);
        type(passwordField, password);
    }

    public void submit() {
        click(submitButton);
    }

    public boolean isAuthErrorVisible() {
        return isDisplayed(authErrorMsg);
    }

    public String getAuthErrorMessage() {
        if (isDisplayed(authErrorMsg)) {
            return driver.findElement(authErrorMsg).getText().trim();
        }
        return "";
    }

    public void waitForAuthError() {
        new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(10))
                .until(d -> isAuthErrorVisible());
    }

    public void typeEmail(String email) {
        // Send control+a then the text to trigger frontend onChange properly
        WebElement el = driver.findElement(emailField);
        el.sendKeys(org.openqa.selenium.Keys.chord(org.openqa.selenium.Keys.CONTROL, "a"));
        el.sendKeys(email);
    }

    public void typePassword(String password) {
        WebElement el = driver.findElement(passwordField);
        el.sendKeys(org.openqa.selenium.Keys.chord(org.openqa.selenium.Keys.CONTROL, "a"));
        el.sendKeys(password);
    }
}
