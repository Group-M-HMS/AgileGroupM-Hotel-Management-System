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

public class DashboardItinerarySecurityTest extends BaseTest {

    private void setE2EUser(String email, String uid) {
        String script = String.format("window.localStorage.setItem('E2E_TEST_USER', JSON.stringify({uid: '%s', email: '%s', emailVerified: true, displayName: 'Test User', isAnonymous: false, firstName: 'Test', lastName: 'User', phone: '+1 555 000 0000'}));", uid, email);
        ((JavascriptExecutor) driver).executeScript(script);
    }

    @Test(description = "Log in and select a booking from the dashboard", priority = 1)
    public void navigationToItineraryFromDashboard() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/dashboard");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Upcoming Reservations')]")));

        WebElement viewItineraryBtn = driver.findElement(By.xpath("//a[contains(text(), 'View Itinerary')]"));
        viewItineraryBtn.click();

        wait.until(ExpectedConditions.urlContains("/manage-booking/itinerary"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/manage-booking/itinerary"), "Navigated directly to itinerary page");

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')] | //h1")));
        
        captureScreenshot("SUCCESS_navigationToItineraryFromDashboard");
    }

    @Test(description = "Inspect the itinerary request using authenticated session and rightful booking ID", priority = 2)
    public void authorizedOwnershipCheck() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=25");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement stayDetails = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));
        Assert.assertTrue(stayDetails.isDisplayed(), "Backend verifies ownership correctly and booking details are returned");

        WebElement roomTitle = driver.findElement(By.xpath("//h1"));
        Assert.assertTrue(roomTitle.isDisplayed() && !roomTitle.getText().isEmpty(), "Room title is displayed for authorized owner");

        captureScreenshot("SUCCESS_authorizedOwnershipCheck");
    }

    @Test(description = "Modify the booking ID to attempt access to another user's booking", priority = 3)
    public void unauthorizedAccessDenied() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        // Logged in as details_user_uid, attempting to access booking 26 belonging to past_user_uid
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=26");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement errorMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//p[contains(text(), \"We couldn't find this booking\")]")));

        Assert.assertTrue(errorMessage.isDisplayed(), "Access is denied and a generic error message is shown");
        
        // Ensure sensitive booking data (e.g. Stay Details section) is NOT exposed
        boolean stayDetailsHidden = driver.findElements(By.xpath("//h2[contains(text(), 'Stay Details')]")).isEmpty();
        Assert.assertTrue(stayDetailsHidden, "No sensitive data is exposed");

        captureScreenshot("SUCCESS_unauthorizedAccessDenied");
    }

    @Test(description = "Attempt to access a non-existent booking ID", priority = 4)
    public void nonExistentBookingId() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=9999999");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement errorMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//p[contains(text(), \"We couldn't find this booking\")]")));

        Assert.assertTrue(errorMessage.isDisplayed(), "A clear error message is displayed for non-existent booking");

        captureScreenshot("SUCCESS_nonExistentBookingId");
    }
}
