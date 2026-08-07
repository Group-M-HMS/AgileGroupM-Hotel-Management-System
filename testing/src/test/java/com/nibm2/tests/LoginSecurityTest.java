package com.nibm2.tests;

import com.nibm2.base.BaseTest;
import com.nibm2.pages.LoginPage;
import com.nibm2.pages.RegisterPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginSecurityTest extends BaseTest {

    private static String validEmail;
    private static final String VALID_PASSWORD = "Passw0rd!23";

    @org.testng.annotations.BeforeClass
    public void setupClass() {
        validEmail = "securityuser_" + System.currentTimeMillis() + "@test.com";
    }

    // Override tearDown from BaseTest to NOT quit the driver between methods in this specific class,
    // so we don't have to navigate and initialize the app over and over.
    @org.testng.annotations.AfterMethod
    @Override
    public void tearDown(org.testng.ITestResult result) {
        if (result.getStatus() == org.testng.ITestResult.FAILURE) {
            captureScreenshot(result.getName());
        }
    }

    @org.testng.annotations.AfterClass
    public void tearDownClass() {
        com.nibm2.base.DriverFactory.quitDriver();
    }

    @Test(description = "Setup: Register a user for security testing", priority = 1)
    public void registerUserForSecurityTests() {
        RegisterPage registerPage = new RegisterPage(driver);
        registerPage.open(BASE_URL);
        registerPage.fillForm("Security Test User", validEmail, VALID_PASSWORD);
        registerPage.submit();

        new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(10))
                .until(org.openqa.selenium.support.ui.ExpectedConditions.urlContains("/dashboard"));
                
        // Clear session
        driver.manage().deleteAllCookies();
        driver.manage().timeouts().scriptTimeout(java.time.Duration.ofSeconds(5));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeAsyncScript(
            "var callback = arguments[arguments.length - 1];" +
            "window.localStorage.clear(); " +
            "window.sessionStorage.clear(); " +
            "window.indexedDB.databases().then((dbs) => { " +
            "  var promises = dbs.map(db => new Promise(res => { " +
            "    var req = window.indexedDB.deleteDatabase(db.name); " +
            "    req.onsuccess = res; req.onerror = res; req.onblocked = res; " +
            "  })); " +
            "  Promise.all(promises).then(() => callback()); " +
            "});"
        );
    }

    @Test(description = "Attempt to log in using a valid email address with an incorrect password", priority = 2, dependsOnMethods = "registerUserForSecurityTests")
    public void incorrectPasswordReturnsGenericError() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open(BASE_URL);
        
        loginPage.fillForm(validEmail, "WrongPassword123!");
        loginPage.submit();
        
        loginPage.waitForAuthError();
        
        String errorMsg = loginPage.getAuthErrorMessage();
        Assert.assertEquals(errorMsg, "Invalid credentials. Please try again.",
                "Login attempt is rejected and a generic error message is displayed");
                
        captureScreenshot("SUCCESS_incorrectPasswordReturnsGenericError");
    }

    @Test(description = "Attempt to log in using an unregistered email address", priority = 3, dependsOnMethods = "registerUserForSecurityTests")
    public void unregisteredEmailReturnsSameGenericError() {
        // Clear session to ensure clean state
        driver.manage().deleteAllCookies();
        
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open(BASE_URL);
        
        loginPage.fillForm("nonexistent_" + System.currentTimeMillis() + "@test.com", "SomePassword123!");
        loginPage.submit();
        
        loginPage.waitForAuthError();
        
        String errorMsg = loginPage.getAuthErrorMessage();
        Assert.assertEquals(errorMsg, "Invalid credentials. Please try again.",
                "Login attempt is rejected and the EXACT same generic error message is displayed, preventing account enumeration");
                
        captureScreenshot("SUCCESS_unregisteredEmailReturnsSameGenericError");
    }

    @Test(description = "Modify the email or password field after a failed login attempt", priority = 4, dependsOnMethods = "registerUserForSecurityTests")
    public void modifyingFieldClearsError() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open(BASE_URL);
        
        loginPage.fillForm(validEmail, "WrongPassword123!");
        loginPage.submit();
        
        loginPage.waitForAuthError();
        Assert.assertTrue(loginPage.isAuthErrorVisible(), "Error should initially be visible");
        
        // Modify the email field
        loginPage.typeEmail("changed@test.com");
        
        Assert.assertFalse(loginPage.isAuthErrorVisible(),
                "Previous error message is cleared automatically after modifying field");
                
        captureScreenshot("SUCCESS_modifyingFieldClearsError");
    }

    @Test(description = "Submit incorrect login credentials repeatedly until rate limiting is triggered", priority = 5, dependsOnMethods = "registerUserForSecurityTests")
    public void rateLimitingIsTriggered() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open(BASE_URL);
        
        boolean rateLimitTriggered = false;
        int maxAttempts = 15;
        
        for (int i = 0; i < maxAttempts; i++) {
            loginPage.fillForm(validEmail, "WrongPassword" + i + "!");
            loginPage.submit();
            loginPage.waitForAuthError();
            
            String errorMsg = loginPage.getAuthErrorMessage();
            if (errorMsg.contains("Too many attempts") || errorMsg.contains("Too many requests")) {
                rateLimitTriggered = true;
                break;
            }
        }
        
        Assert.assertTrue(rateLimitTriggered,
                "Rate limiting or lockout protection is triggered after multiple failed attempts");
                
        captureScreenshot("SUCCESS_rateLimitingIsTriggered");
    }
}
