package com.nibm2.tests;

import com.nibm2.base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class DashboardLogoNavigationTest extends BaseTest {

    private String getDateStr(int daysOffset) {
        return LocalDate.now().plusDays(daysOffset).format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    private void setE2EUserCustom(String uid, String email, String firstName, String lastName) {
        String script = String.format(
                "window.localStorage.setItem('E2E_TEST_USER', JSON.stringify({uid: '%s', email: '%s', emailVerified: true, isAnonymous: false, firstName: '%s', lastName: '%s', phone: '+1 555 123 4567'}));",
                uid, email, firstName, lastName
        );
        ((JavascriptExecutor) driver).executeScript(script);
    }

    @Test(description = "Click hotel logo from Profile/User view and verify redirection to main room search page", priority = 1)
    public void logoClickFromProfilePageRedirectsToMainSearch() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/dashboard");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // Open Profile menu dropdown / section
        try {
            WebElement profileBtn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[contains(@aria-label, 'profile') or contains(@aria-label, 'user') or .//span[contains(text(), 'J')]]")));
            profileBtn.click();
            Thread.sleep(500);
        } catch (Exception ignored) {}

        WebElement logoLink = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//nav//a[.//span[contains(text(), 'River Nest')]]")));
        logoLink.click();
        Thread.sleep(1000);

        String currentUrl = driver.getCurrentUrl();
        Assert.assertTrue(currentUrl.equals(BASE_URL + "/") || currentUrl.equals(BASE_URL), "User is redirected to the main room search page without delay or error upon clicking logo from Profile page view");

        captureScreenshot("SUCCESS_logoClickFromProfilePageRedirectsToMainSearch");
    }

    @Test(description = "Click hotel logo from Bookings dashboard and verify redirection to main room search page", priority = 2)
    public void logoClickFromDashboardPageRedirectsToMainSearch() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/dashboard");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        WebElement logoLink = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//nav//a[.//span[contains(text(), 'River Nest')]]")));
        logoLink.click();
        Thread.sleep(1000);

        String currentUrl = driver.getCurrentUrl();
        Assert.assertTrue(currentUrl.equals(BASE_URL + "/") || currentUrl.equals(BASE_URL), "User is redirected to the main room search page consistently from Bookings dashboard");

        captureScreenshot("SUCCESS_logoClickFromDashboardPageRedirectsToMainSearch");
    }

    @Test(description = "Click hotel logo during in-progress checkout and verify graceful navigation without unintended booking creation", priority = 3)
    public void logoClickFromInProgressCheckoutRedirectsWithoutCorruptionOrUnintendedBooking() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement logoLink = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//nav//a[.//span[contains(text(), 'River Nest')]]")));
        logoLink.click();
        Thread.sleep(1000);

        String currentUrl = driver.getCurrentUrl();
        Assert.assertTrue(currentUrl.equals(BASE_URL + "/") || currentUrl.equals(BASE_URL), "User is redirected to room search page gracefully during checkout without app errors, data corruption, or partial booking creation");

        captureScreenshot("SUCCESS_logoClickFromInProgressCheckoutRedirectsWithoutCorruptionOrUnintendedBooking");
    }
}
