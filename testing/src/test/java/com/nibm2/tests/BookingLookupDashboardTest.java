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

public class BookingLookupDashboardTest extends BaseTest {

    private void setE2EUser(String email, String uid) {
        String script = String.format("window.localStorage.setItem('E2E_TEST_USER', JSON.stringify({uid: '%s', email: '%s', emailVerified: true, displayName: 'Test User', isAnonymous: false, firstName: 'Test', lastName: 'User', phone: '+1 555 000 0000'}));", uid, email);
        ((JavascriptExecutor) driver).executeScript(script);
    }

    @Test(description = "Perform a booking lookup using valid booking information and open the reservation dashboard", priority = 1)
    public void successfulBookingLookup() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=25");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        // Verify Room Name / Type
        WebElement roomTitle = driver.findElement(By.xpath("//h1"));
        Assert.assertTrue(roomTitle.getText().contains("Family Suite"), "Room type/name matches original booking");

        // Verify Check-in & Check-out dates
        WebElement stayDetails = driver.findElement(By.xpath("//h2[contains(text(), 'Stay Details')]/following-sibling::div"));
        Assert.assertTrue(stayDetails.getText().contains("Check-In"), "Check-in label is present");
        Assert.assertTrue(stayDetails.getText().contains("Check-Out"), "Check-out label is present");

        // Verify Total booking cost
        WebElement totalAmount = driver.findElement(By.xpath("//span[contains(text(), 'Total')]/following-sibling::span"));
        Assert.assertTrue(totalAmount.getText().contains("552"), "Total booking cost matches original details");

        captureScreenshot("SUCCESS_successfulBookingLookup");
    }

    @Test(description = "Retrieve a booking record where a non-critical field is unavailable", priority = 2)
    public void missingFieldPlaceholderCase() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        // Booking 25 has null bookingReference
        driver.get(BASE_URL + "/manage-booking/itinerary?id=25");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        // Verify page loads without crash
        WebElement roomTitle = driver.findElement(By.xpath("//h1"));
        Assert.assertTrue(roomTitle.isDisplayed(), "Reservation dashboard loads successfully");

        // Verify fallback placeholder for missing reference (displays Booking ID: #25 instead of crashing)
        WebElement refText = driver.findElement(By.xpath("//p[contains(text(), 'Booking ID:') or contains(text(), 'Reference:')]"));
        Assert.assertTrue(refText.getText().contains("#25") || refText.getText().contains("Reference"), "Missing reference displays appropriate placeholder/fallback");

        captureScreenshot("SUCCESS_missingFieldPlaceholderCase");
    }

    @Test(description = "Attempt to load a booking that cannot be retrieved", priority = 3)
    public void attemptLoadUnretrievableBooking() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=9999999");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement errorMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//p[contains(text(), \"We couldn't find this booking\")]")));

        Assert.assertTrue(errorMessage.isDisplayed(), "A clear error message is displayed when booking cannot be retrieved");

        // Verify user can recover by returning to previous page
        WebElement backLink = driver.findElement(By.xpath("//a[contains(text(), 'Back to My Bookings')]"));
        Assert.assertTrue(backLink.isDisplayed(), "User can recover by returning to the previous page");

        captureScreenshot("SUCCESS_attemptLoadUnretrievableBooking");
    }
}
