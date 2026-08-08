package com.nibm2.tests;

import com.nibm2.base.BaseTest;
import com.nibm2.pages.LoginPage;
import com.nibm2.pages.NavbarComponent;
import com.nibm2.pages.RegisterPage;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;

public class MyBookingsNavTest extends BaseTest {

    private static String validEmail;
    private static final String VALID_PASSWORD = "Passw0rd!23";

    @org.testng.annotations.BeforeClass
    public void setupClass() {
        validEmail = "booknav_" + System.currentTimeMillis() + "@test.com";
    }

    // Override tearDown to NOT quit the driver, maintaining session persistence
    @org.testng.annotations.AfterMethod
    @Override
    public void tearDown(org.testng.ITestResult result) {
        if (result.getStatus() == org.testng.ITestResult.FAILURE) {
            captureScreenshot(result.getName());
        }
    }

    // Override setUp to NOT navigate to BASE_URL before every method
    @org.testng.annotations.BeforeMethod
    @Override
    public void setUp() {
        driver = com.nibm2.base.DriverFactory.getDriver();
    }

    @org.testng.annotations.AfterClass
    public void tearDownClass() {
        com.nibm2.base.DriverFactory.quitDriver();
    }

    @Test(description = "Register and Log in and view the navigation bar", priority = 1)
    public void loginAndViewNavbar() {
        driver.manage().deleteAllCookies();
        
        // 1. Register a new user
        RegisterPage registerPage = new RegisterPage(driver);
        registerPage.open(BASE_URL);
        registerPage.fillForm("BookNav", validEmail, VALID_PASSWORD);
        registerPage.submit();

        // Wait for either dashboard or login page
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.or(
                    ExpectedConditions.urlContains("/dashboard"),
                    ExpectedConditions.urlContains("/login")
                ));
                
        // If redirected to login, perform login
        if (driver.getCurrentUrl().contains("/login")) {
            LoginPage loginPage = new LoginPage(driver);
            loginPage.fillForm(validEmail, VALID_PASSWORD);
            loginPage.submit();
            
            new WebDriverWait(driver, Duration.ofSeconds(10))
                    .until(ExpectedConditions.urlContains("/dashboard"));
        }

        NavbarComponent navbar = new NavbarComponent(driver);
        
        // Wait for profile menu to appear
        new WebDriverWait(driver, Duration.ofSeconds(5))
                .until(d -> navbar.isProfileMenuVisible());

        // Assert login is replaced by profile menu
        Assert.assertFalse(navbar.isSignInVisible(), "Login option should be hidden");
        Assert.assertTrue(navbar.isProfileMenuVisible(), "Profile icon/account menu should be visible");
        
        captureScreenshot("SUCCESS_loginAndViewNavbar");
    }

    @Test(description = "Open the account menu and select My Bookings", priority = 2, dependsOnMethods = "loginAndViewNavbar")
    public void navigateToMyBookings() {
        NavbarComponent navbar = new NavbarComponent(driver);
        
        // Click profile menu
        navbar.clickProfileMenu();
        
        // Click My Bookings
        navbar.clickMyBookings();
        
        // Wait for redirect to Bookings Dashboard
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.urlMatches(".*\\/dashboard($|\\?.*)"));
                
        // Just verify we are on the bookings page and it loaded
        Assert.assertTrue(driver.getCurrentUrl().endsWith("/dashboard"), "Should be on Bookings dashboard");
        
        captureScreenshot("SUCCESS_navigateToMyBookings");
    }

    @Test(description = "Log out and view the navigation bar", priority = 3, dependsOnMethods = "navigateToMyBookings")
    public void logoutAndViewNavbar() {
        NavbarComponent navbar = new NavbarComponent(driver);
        
        // Profile menu should still be visible on the dashboard, click it to open dropdown
        navbar.clickProfileMenu();
        
        // Click Sign out
        navbar.clickSignOut();
        
        // Wait for Sign In button to reappear
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(d -> navbar.isSignInVisible());
                
        // Verify navbar state
        Assert.assertTrue(navbar.isSignInVisible(), "Login option should be displayed");
        Assert.assertFalse(navbar.isProfileMenuVisible(), "Profile icon/account menu should not be displayed");
        
        captureScreenshot("SUCCESS_logoutAndViewNavbar");
    }
}
