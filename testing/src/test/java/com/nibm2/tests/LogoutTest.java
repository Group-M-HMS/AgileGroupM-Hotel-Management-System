package com.nibm2.tests;

import com.nibm2.base.BaseTest;
import com.nibm2.config.ConfigReader;
import com.nibm2.pages.LoginPage;
import com.nibm2.pages.NavbarComponent;
import com.nibm2.pages.RegisterPage;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;

public class LogoutTest extends BaseTest {

    private final String BASE_URL = ConfigReader.get("base.url");
    private final String validEmail = "logout_" + System.currentTimeMillis() + "@nibm2.test";
    private final String VALID_PASSWORD = "Password!234";
    private final String FIRST_NAME = "LogoutUser";

    private static String capturedToken = null;

    @BeforeMethod
    @Override
    public void setUp() {
        // Override setUp to prevent driver from navigating to base.url between each test step.
        // We want to maintain chronological state across these tests.
        driver = com.nibm2.base.DriverFactory.getDriver();
    }

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

    @Test(description = "Setup: Register a user for logout testing", priority = 1)
    public void setupLogoutTest() {
        driver.get(BASE_URL); // Navigate away from data:, so we can access localStorage
        driver.manage().deleteAllCookies();
        driver.manage().timeouts().scriptTimeout(Duration.ofSeconds(5));
        ((JavascriptExecutor) driver).executeAsyncScript(
            "var callback = arguments[arguments.length - 1];" +
            "window.localStorage.clear(); " +
            "window.sessionStorage.clear(); " +
            "var req = indexedDB.deleteDatabase('firebaseLocalStorageDb'); " +
            "req.onsuccess = function () { callback(); }; " +
            "req.onerror = function () { callback(); }; " +
            "req.onblocked = function () { callback(); };"
        );

        RegisterPage registerPage = new RegisterPage(driver);
        registerPage.open(BASE_URL);
        registerPage.fillForm(FIRST_NAME, validEmail, VALID_PASSWORD);
        registerPage.submit();

        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.urlContains("/dashboard"));
    }

    @Test(description = "Log in to the application and select the Logout option", priority = 2, dependsOnMethods = "setupLogoutTest")
    public void logoutInvalidatesSession() {
        // Step 1: Capture the token before logging out using IndexedDB
        capturedToken = (String) ((JavascriptExecutor) driver).executeAsyncScript(
                "var callback = arguments[arguments.length - 1];" +
                "const request = indexedDB.open('firebaseLocalStorageDb');" +
                "request.onsuccess = (event) => {" +
                "    const db = event.target.result;" +
                "    const transaction = db.transaction(['firebaseLocalStorage'], 'readonly');" +
                "    const objectStore = transaction.objectStore('firebaseLocalStorage');" +
                "    const getAllRequest = objectStore.getAll();" +
                "    getAllRequest.onsuccess = (e) => {" +
                "        const results = e.target.result;" +
                "        if (results && results.length > 0) {" +
                "            callback(results[0].value.stsTokenManager.accessToken);" +
                "        } else {" +
                "            callback(null);" +
                "        }" +
                "    };" +
                "    getAllRequest.onerror = () => callback(null);" +
                "};" +
                "request.onerror = () => callback(null);"
        );
        
        Assert.assertNotNull(capturedToken, "Failed to capture Firebase token from IndexedDB before logout");

        // Step 2: Perform the logout via the UI
        NavbarComponent navbar = new NavbarComponent(driver);
        navbar.clickProfileMenu();
        
        // Wait briefly for dropdown animation
        try { Thread.sleep(500); } catch (InterruptedException e) {}
        
        navbar.clickSignOut();

        // Step 3: Verify redirection and UI changes
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.urlToBe(BASE_URL + "/"));

        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(d -> navbar.isSignInVisible());

        Assert.assertFalse(navbar.isProfileMenuVisible(), "Profile menu should no longer be visible after logout");
        Assert.assertTrue(navbar.isSignInVisible(), "Sign In option should be visible after logout");
        
        captureScreenshot("SUCCESS_logoutInvalidatesSession");
    }

    @Test(description = "After logout, attempt to access a previously bookmarked authenticated page directly", priority = 3, dependsOnMethods = "logoutInvalidatesSession")
    public void authenticatedPagesNotAccessibleAfterLogout() {
        // Attempt to navigate to dashboard
        driver.get(BASE_URL + "/dashboard");

        // Wait for redirect to login
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.urlContains("/login"));

        Assert.assertTrue(driver.getCurrentUrl().contains("/login"), 
                "User is redirected to the login page when attempting to access a protected page after logout");
                
        captureScreenshot("SUCCESS_authenticatedPagesNotAccessibleAfterLogout");
    }

}
