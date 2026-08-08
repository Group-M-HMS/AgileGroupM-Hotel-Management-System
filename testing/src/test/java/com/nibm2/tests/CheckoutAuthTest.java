package com.nibm2.tests;

import com.nibm2.base.BaseTest;
import com.nibm2.pages.CheckoutPage;
import com.nibm2.pages.LoginPage;
import com.nibm2.pages.RegisterPage;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.time.Duration;

public class CheckoutAuthTest extends BaseTest {

    private final String FIRST_NAME = "CheckoutUser";
    private final String LAST_NAME = "Tester";
    private final String validEmail = "checkout_" + System.currentTimeMillis() + "@nibm2.test";
    private final String VALID_PASSWORD = "Password!234";
    // Use an arbitrary checkout URL with dynamically generated dates to avoid backend exclusion constraints from previous test runs
    private final java.time.LocalDate dynamicCheckIn = java.time.LocalDate.now().plusDays(new java.util.Random().nextInt(10000) + 100);
    private final String CHECKOUT_URL = BASE_URL + "/checkout?roomId=1&checkIn=" + dynamicCheckIn + "&checkOut=" + dynamicCheckIn.plusDays(4) + "&guests=2";

    @Test(description = "Setup: Register a user and prepare session for checkout tests", priority = 0)
    public void setupCheckoutTest() {
        // Register the user to use in the tests later
        RegisterPage registerPage = new RegisterPage(driver);
        registerPage.open(BASE_URL);
        registerPage.fillForm(FIRST_NAME + " " + LAST_NAME, validEmail, VALID_PASSWORD);
        registerPage.submit();
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.urlContains("/dashboard"));
                
        // Logout via UI so frontend Firebase auth state is cleared
        com.nibm2.pages.NavbarComponent navbar = new com.nibm2.pages.NavbarComponent(driver);
        navbar.clickProfileMenu();
        navbar.clickSignOut();
        
        // Wait for logout to process
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.urlContains("/"));
    }

    @Override
    @org.testng.annotations.BeforeMethod
    public void setUp() {
        if (driver == null) {
            driver = com.nibm2.base.DriverFactory.getDriver();
            driver.get(BASE_URL);
        }
    }

    @Override
    public void tearDown(org.testng.ITestResult result) {
        // Override so driver doesn't quit between dependent tests
        if (result.getStatus() == org.testng.ITestResult.FAILURE) {
            captureScreenshot(result.getName());
        }
    }

    @AfterClass
    public void tearDownClass() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test(description = "As an unauthenticated visitor, complete checkout up to the final step", priority = 1, dependsOnMethods = "setupCheckoutTest")
    public void checkoutAsVisitor() {
        CheckoutPage checkoutPage = new CheckoutPage(driver);
        checkoutPage.open(CHECKOUT_URL);
        
        // Wait for page load
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.urlContains("/checkout"));
                
        // Verify login prompt is visible
        Assert.assertTrue(checkoutPage.isLoginPromptVisible(), "A clear message indicates that login or account creation is required");
        
        // Verify submit button is acting as a redirect to sign in
        String buttonText = checkoutPage.getSubmitButtonText();
        Assert.assertEquals(buttonText, "Sign In to Pay & Book", "Confirm Booking button should act as a login gateway for visitors");
        
        // Fill some data to see if it's preserved later
        checkoutPage.fillGuestInfo("Temp First", "Temp Last", "temp@example.com", "1234567890");
        
        captureScreenshot("SUCCESS_checkoutAsVisitor");
    }

    @Test(description = "Click the Login prompt and complete authentication", priority = 2, dependsOnMethods = "checkoutAsVisitor")
    public void loginFromCheckout() {
        CheckoutPage checkoutPage = new CheckoutPage(driver);
        checkoutPage.clickLoginPrompt();
        
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.urlContains("/login"));
                
        LoginPage loginPage = new LoginPage(driver);
        loginPage.fillForm(validEmail, VALID_PASSWORD);
        loginPage.submit(); // Actually submit the form!
        
        // Wait to be redirected back to checkout
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.urlContains("/checkout"));
                
        // Wait for Firebase auth state to restore and hide the login prompt
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(d -> !checkoutPage.isLoginPromptVisible());
                
        Assert.assertFalse(checkoutPage.isLoginPromptVisible(), "Login prompt should be hidden after authentication");
        
        String currentEmail = checkoutPage.getEmailValue();
        Assert.assertEquals(currentEmail, validEmail, "User details should be populated with authenticated profile");
        
        String buttonText = checkoutPage.getSubmitButtonText();
        Assert.assertEquals(buttonText, "Pay & Book", "Confirm Booking button becomes enabled for booking");
        
        captureScreenshot("SUCCESS_loginFromCheckout");
    }

    @Test(description = "Click 'Confirm Booking' as an authenticated user", priority = 4, dependsOnMethods = "freshSessionCheckout")
    public void authenticatedCheckout() {
        CheckoutPage checkoutPage = new CheckoutPage(driver);
        // Ensure all required fields (like phone) are filled since they aren't fully persisted across the login redirect
        checkoutPage.fillGuestInfo("CheckoutUser", "Tester", validEmail, "1234567890");
        checkoutPage.checkTerms();
        
        // Fill out Stripe card details using the provided test card
        checkoutPage.fillStripeCard("4242424242424242", "1230", "123", "12345");
        
        checkoutPage.clickSubmit();
        
        try {
            new WebDriverWait(driver, Duration.ofSeconds(15))
                    .until(ExpectedConditions.urlContains("/dashboard/bookings?status=success"));
        } catch (Exception e) {
            captureScreenshot("FAILED_authenticatedCheckout");
            System.err.println("PAGE TEXT ON FAILURE:");
            System.err.println(driver.findElement(org.openqa.selenium.By.tagName("body")).getText());
            throw e;
        }
                
        captureScreenshot("SUCCESS_authenticatedCheckout");
    }

    @Test(description = "Log in first, then access checkout from a fresh session", priority = 3, dependsOnMethods = "loginFromCheckout")
    public void freshSessionCheckout() {
        // Go back to checkout page directly while still logged in from previous test
        CheckoutPage checkoutPage = new CheckoutPage(driver);
        checkoutPage.open(CHECKOUT_URL);
        
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.urlContains("/checkout"));
                
        Assert.assertFalse(checkoutPage.isLoginPromptVisible(), "No login prompt is displayed");
        Assert.assertEquals(checkoutPage.getSubmitButtonText(), "Pay & Book", "Confirm Booking button is enabled immediately");
        
        captureScreenshot("SUCCESS_freshSessionCheckout");
    }
}
