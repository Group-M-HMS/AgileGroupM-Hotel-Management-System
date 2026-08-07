package com.nibm2.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import java.util.List;

/**
 * Page Object for the Registration page.
 * Supports: NIBM2-458 (registration), NIBM2-187 (password length validation).
 */
public class RegisterPage extends BasePage {

    private final By firstNameField = By.xpath("//input[@placeholder='First Name*']");
    private final By lastNameField = By.xpath("//input[@placeholder='Last Name*']");
    private final By emailField = By.xpath("//input[@placeholder='Email*']");
    private final By phoneField = By.xpath("//input[@placeholder='Phone Number*']");
    private final By passwordField = By.xpath("//input[@placeholder='Password*']");
    private final By confirmPasswordField = By.xpath("//input[@placeholder='Confirm Password*']");
    private final By termsCheckbox = By.id("terms");
    private final By submitButton = By.cssSelector("button[type='submit']");
    private final By passwordValidationMsg = By.xpath("//*[contains(text(), 'At least 8 characters required')]");
    private final By duplicateEmailError = By.xpath("//div[contains(@class, 'text-red-500')]");
    private final By fieldError = By.cssSelector(".border-red-400"); // for required fields

    public RegisterPage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        driver.get(baseUrl + "/signup"); // The actual route is /signup for Next.js, not /register
    }

    public void fillForm(String name, String email, String password) {
        String first = name.isEmpty() ? "" : name.split(" ")[0];
        String last = name.isEmpty() ? "" : (name.split(" ").length > 1 ? name.split(" ")[1] : "Doe");

        type(firstNameField, first);
        type(lastNameField, last);
        type(emailField, email);
        type(phoneField, name.isEmpty() ? "" : "555-0199");
        type(passwordField, password);
        type(confirmPasswordField, password);

        if (!name.isEmpty()) {
            WebElement terms = driver.findElement(termsCheckbox);
            if (!terms.isSelected()) {
                terms.click();
            }
        }
    }

    public void submit() {
        click(submitButton);
    }

    public void submitExpectingError() {
        click(submitButton);
    }

    public boolean isPasswordValidationMessageVisible() {
        return isDisplayed(passwordValidationMsg);
    }

    public boolean isDuplicateEmailErrorVisible() {
        return isDisplayed(duplicateEmailError);
    }

    public boolean isSubmitEnabled() {
        return isEnabled(submitButton);
    }

    public boolean areRequiredFieldsHighlighted() {
        List<WebElement> errors = driver.findElements(fieldError);
        return !errors.isEmpty();
    }
}
