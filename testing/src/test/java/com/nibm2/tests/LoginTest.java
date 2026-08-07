package com.nibm2.tests;

import com.nibm2.base.BaseTest;
import com.nibm2.pages.LoginPage;
import com.nibm2.pages.RegisterPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

    private static String validEmail;
    private static final String VALID_PASSWORD = "Passw0rd!23";

    @org.testng.annotations.BeforeClass
    public void setupClass() {
        validEmail = "loginuser_" + System.currentTimeMillis() + "@test.com";
    }

    // Override tearDown from BaseTest to NOT quit the driver between methods in this specific class,
    // so we can test session persistence (Firebase Auth state) across test methods!
    @org.testng.annotations.AfterMethod
    @Override
    public void tearDown(org.testng.ITestResult result) {
        if (result.getStatus() == org.testng.ITestResult.FAILURE) {
            captureScreenshot(result.getName());
        }
        // Do NOT quit the driver here
    }

    @org.testng.annotations.AfterClass
    public void tearDownClass() {
        com.nibm2.base.DriverFactory.quitDriver();
    }

    @Test(description = "Setup: Register a user to test login", priority = 1)
    public void registerUserForLoginTests() {
        // First, we must register a user so we have a valid account to test logging into
        RegisterPage registerPage = new RegisterPage(driver);
        registerPage.open(BASE_URL);
        registerPage.fillForm("Login Test User", validEmail, VALID_PASSWORD);
        registerPage.submit();

        new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(10))
                .until(org.openqa.selenium.support.ui.ExpectedConditions.urlContains("/dashboard"));
    }

    @Test(description = "Log in using a registered customer account with valid credentials", priority = 2, dependsOnMethods = "registerUserForLoginTests")
    public void validLoginSucceeds() {
        // Ensure we are logged out before starting
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
        
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open(BASE_URL);
        
        loginPage.fillForm(validEmail, VALID_PASSWORD);
        loginPage.submit();
        
        new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(10))
                .until(org.openqa.selenium.support.ui.ExpectedConditions.urlContains("/dashboard"));

        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"),
                "User is redirected to the account dashboard");
                
        captureScreenshot("SUCCESS_validLoginSucceeds");
    }

    @Test(description = "While already logged in, navigate directly to the login page URL", priority = 3, dependsOnMethods = "validLoginSucceeds")
    public void loggedInUserRedirectedFromLoginPage() {
        // We are already logged in from the previous test
        driver.get(BASE_URL + "/login");
        
        new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(10))
                .until(org.openqa.selenium.support.ui.ExpectedConditions.urlContains("/dashboard"));
                
        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"),
                "User is automatically redirected away from login page to authenticated area");
                
        captureScreenshot("SUCCESS_loggedInUserRedirectedFromLoginPage");
    }

    @Test(description = "After successful login, navigate to another protected page", priority = 4, dependsOnMethods = "validLoginSucceeds")
    public void loggedInUserCanAccessOtherProtectedPages() {
        // We are still logged in
        driver.get(BASE_URL + "/checkout"); // Using a valid protected route
        
        // Wait a bit to ensure it doesn't redirect back to login
        try { Thread.sleep(2000); } catch (Exception e) {}
        
        Assert.assertFalse(driver.getCurrentUrl().contains("/login"),
                "User can access protected page successfully without logging in again");
                
        captureScreenshot("SUCCESS_loggedInUserCanAccessOtherProtectedPages");
    }

    @Test(description = "Attempt to log in using incorrect credentials", priority = 5)
    public void invalidLoginFails() {
        // Clear session so we are logged out for this test
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
        
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open(BASE_URL);
        
        loginPage.fillForm(validEmail, "WrongPassword123!");
        loginPage.submit();
        
        // Wait for error to appear
        new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(10))
                .until(d -> loginPage.isAuthErrorVisible());
                
        Assert.assertTrue(loginPage.isAuthErrorVisible(),
                "Appropriate authentication failure response is displayed");
        Assert.assertFalse(driver.getCurrentUrl().contains("/dashboard"),
                "No authenticated session is created");
                
        captureScreenshot("SUCCESS_invalidLoginFails");
    }
}
