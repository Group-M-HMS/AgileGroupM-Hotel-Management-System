package com.nibm2.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class LoginPage extends BasePage {

    private final By emailField = By.cssSelector("input[type='email'], input[placeholder*='Email']");
    private final By passwordField = By.cssSelector("input[type='password'], input[placeholder*='Password']");
    private final By submitButton = By.cssSelector("button[type='submit']");
    private final By authErrorMsg = By.xpath("//div[contains(@class, 'text-red-500')] | //div[contains(@class, 'border-red-400')]");

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
        type(emailField, email);
    }

    public void typePassword(String password) {
        type(passwordField, password);
    }
}
