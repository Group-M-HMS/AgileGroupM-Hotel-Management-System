package com.nibm2.tests;

import com.nibm2.base.BaseTest;
import com.nibm2.pages.LoginPage;
import com.nibm2.pages.NavbarComponent;
import com.nibm2.pages.RegisterPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NavigationAuthTest extends BaseTest {

    private static String validEmail;
    private static final String VALID_PASSWORD = "Passw0rd!23";
    private static final String FIRST_NAME = "NavUser";

    @org.testng.annotations.BeforeClass
    public void setupClass() {
        validEmail = "navuser_" + System.currentTimeMillis() + "@test.com";
    }

    // Override tearDown to NOT quit the driver, maintaining session persistence
    @org.testng.annotations.AfterMethod
    @Override
    public void tearDown(org.testng.ITestResult result) {
        if (result.getStatus() == org.testng.ITestResult.FAILURE) {
            captureScreenshot(result.getName());
        }
    }

    // Override setUp to NOT navigate to BASE_URL before every method,
    // so our chronological steps don't get interrupted by hard navigation resets.
    @org.testng.annotations.BeforeMethod
    @Override
    public void setUp() {
        driver = com.nibm2.base.DriverFactory.getDriver();
    }

    @org.testng.annotations.AfterClass
    public void tearDownClass() {
        com.nibm2.base.DriverFactory.quitDriver();
    }

    @Test(description = "Setup: Register a user for navigation testing", priority = 1)
    public void registerUserForNavTests() {
        // Clear anything existing
        driver.manage().deleteAllCookies();
        
        RegisterPage registerPage = new RegisterPage(driver);
        registerPage.open(BASE_URL);
        registerPage.fillForm(FIRST_NAME, validEmail, VALID_PASSWORD);
        registerPage.submit();

        new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(10))
                .until(org.openqa.selenium.support.ui.ExpectedConditions.urlContains("/dashboard"));
                
        // Now force a logout to test the unauthenticated state first
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

    @Test(description = "Open the application and view the main navigation bar without logging in", priority = 2, dependsOnMethods = "registerUserForNavTests")
    public void unauthenticatedNavbarShowsLoginOption() {
        driver.get(BASE_URL);
        
        NavbarComponent navbar = new NavbarComponent(driver);
        
        Assert.assertTrue(navbar.isSignInVisible(),
                "A Login / Account Access option is visible for unauthenticated users");
        Assert.assertFalse(navbar.isProfileMenuVisible(),
                "No authenticated user options (Profile Menu) are exposed");
                
        captureScreenshot("SUCCESS_unauthenticatedNavbarShowsLoginOption");
    }

    @Test(description = "Click the Login option from the navigation bar", priority = 3, dependsOnMethods = "unauthenticatedNavbarShowsLoginOption")
    public void clickingLoginNavigatesToAuthPage() {
        NavbarComponent navbar = new NavbarComponent(driver);
        navbar.clickSignIn();
        
        new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(5))
                .until(org.openqa.selenium.support.ui.ExpectedConditions.urlContains("/login"));
                
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"),
                "User is redirected to the login/authentication page");
                
        captureScreenshot("SUCCESS_clickingLoginNavigatesToAuthPage");
    }

    @Test(description = "Complete login successfully and view the navigation bar again", priority = 4, dependsOnMethods = "clickingLoginNavigatesToAuthPage")
    public void authenticatedNavbarShowsProfileOption() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.fillForm(validEmail, VALID_PASSWORD);
        loginPage.submit();
        
        new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(10))
                .until(org.openqa.selenium.support.ui.ExpectedConditions.urlContains("/dashboard"));
                
        NavbarComponent navbar = new NavbarComponent(driver);
        
        Assert.assertFalse(navbar.isSignInVisible(),
                "Login option is replaced and no longer visible");
        Assert.assertTrue(navbar.isProfileMenuVisible(),
                "Navigation reflects the user's authenticated state via the profile option");
                
        captureScreenshot("SUCCESS_authenticatedNavbarShowsProfileOption");
    }

    @Test(description = "Refresh the page during an active authenticated session and re-check the navigation bar", priority = 5, dependsOnMethods = "authenticatedNavbarShowsProfileOption")
    public void authenticationStatePersistsAfterRefresh() {
        driver.navigate().refresh();
        
        // Wait for hydration (we can wait for the profile menu to reappear)
        NavbarComponent navbar = new NavbarComponent(driver);
        new org.openqa.selenium.support.ui.WebDriverWait(driver, java.time.Duration.ofSeconds(10))
                .until(d -> navbar.isProfileMenuVisible());
        
        Assert.assertFalse(navbar.isSignInVisible(),
                "Navigation does not incorrectly revert to the login option");
        Assert.assertTrue(navbar.isProfileMenuVisible(),
                "Account/profile option remains visible after refresh");
                
        captureScreenshot("SUCCESS_authenticationStatePersistsAfterRefresh");
    }
}
