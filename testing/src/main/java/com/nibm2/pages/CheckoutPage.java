package com.nibm2.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class CheckoutPage extends BasePage {

    private final By firstNameInput = By.xpath("//input[@aria-label='First Name']");
    private final By lastNameInput = By.xpath("//input[@aria-label='Last Name']");
    private final By emailInput = By.xpath("//input[@aria-label='Email Address']");
    private final By phoneInput = By.xpath("//input[@aria-label='Phone Number']");
    private final By specialRequestsInput = By.xpath("//textarea[@aria-label='Special Requests']");
    private final By termsCheckbox = By.xpath("//input[@type='checkbox']");
    private final By submitButton = By.xpath("//button[@type='submit']");
    private final By loginPromptLink = By.xpath("//a[contains(@href, '/login?redirect')]");
    private final By paymentStatusMessage = By.xpath("//button[contains(text(), 'Authorizing') or contains(text(), 'Confirming')]");

    public CheckoutPage(WebDriver driver) {
        super(driver);
    }

    public void open(String url) {
        driver.get(url);
    }

    public void fillGuestInfo(String firstName, String lastName, String email, String phone) {
        type(firstNameInput, firstName);
        type(lastNameInput, lastName);
        type(emailInput, email);
        type(phoneInput, phone);
    }
    
    public void fillSpecialRequests(String requests) {
        type(specialRequestsInput, requests);
    }

    public void checkTerms() {
        if (!driver.findElement(termsCheckbox).isSelected()) {
            click(termsCheckbox);
        }
    }

    public void clickSubmit() {
        click(submitButton);
    }

    public void clickLoginPrompt() {
        click(loginPromptLink);
    }

    public String getSubmitButtonText() {
        return driver.findElement(submitButton).getText();
    }

    public boolean isLoginPromptVisible() {
        return isDisplayed(loginPromptLink);
    }
    
    public String getFirstNameValue() {
        return driver.findElement(firstNameInput).getAttribute("value");
    }
    
    public String getEmailValue() {
        return driver.findElement(emailInput).getAttribute("value");
    }

    public void fillStripeCard(String cardNumber, String expDate, String cvc, String postal) {
        try {
            org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(10));
            // Just find the first iframe, as Stripe is usually the only iframe on a checkout page
            org.openqa.selenium.WebElement stripeIframe = wait.until(org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated(By.xpath("//iframe")));
            driver.switchTo().frame(stripeIframe);
            
            // Try different possible locators for Stripe inputs
            try {
                driver.findElement(By.xpath("//input[@name='cardnumber' or @name='cardNumber']")).sendKeys(cardNumber);
                driver.findElement(By.xpath("//input[@name='exp-date' or @name='expDate']")).sendKeys(expDate);
                driver.findElement(By.xpath("//input[@name='cvc']")).sendKeys(cvc);
            } catch (Exception e) {
                // If the single line card element is used, we just send keys to the single input
                org.openqa.selenium.WebElement singleInput = driver.findElement(By.xpath("//input"));
                singleInput.sendKeys(cardNumber);
                singleInput.sendKeys(expDate);
                singleInput.sendKeys(cvc);
            }
            
            try {
                driver.findElement(By.xpath("//input[@name='postal']")).sendKeys(postal);
            } catch (Exception e) {
                // Postal code might not be required
            }
            
            driver.switchTo().defaultContent();
        } catch (Exception e) {
            System.err.println("Could not fill Stripe card: " + e.getMessage());
            driver.switchTo().defaultContent();
        }
    }
}
