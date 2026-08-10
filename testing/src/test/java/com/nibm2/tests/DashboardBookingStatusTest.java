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
import java.util.List;

public class DashboardBookingStatusTest extends BaseTest {

    private void setE2EUser(String email, String uid) {
        String script = String.format("window.localStorage.setItem('E2E_TEST_USER', JSON.stringify({uid: '%s', email: '%s', emailVerified: true, displayName: 'Test User', isAnonymous: false, firstName: 'Test', lastName: 'User', phone: '+1 555 000 0000'}));", uid, email);
        ((JavascriptExecutor) driver).executeScript(script);
    }

    @Test(description = "Open the itinerary page for a confirmed booking and verify status badge", priority = 1)
    public void openItineraryConfirmedStatusBadge() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=25");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        // Verify status badge is displayed prominently
        WebElement statusBadge = driver.findElement(By.xpath("//span[contains(@class, 'rounded-full') and (contains(text(), 'Pending') or contains(text(), 'Confirmed') or contains(text(), 'Cancelled'))]"));
        Assert.assertTrue(statusBadge.isDisplayed(), "Status badge is clearly visible near booking details");

        captureScreenshot("SUCCESS_openItineraryConfirmedStatusBadge");
    }

    @Test(description = "Change the booking status then refresh the original itinerary page", priority = 2)
    public void statusUpdateOnRefreshOrCancel() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=25");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        // Perform cancellation if cancellable
        List<WebElement> cancelBtns = driver.findElements(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        if (!cancelBtns.isEmpty()) {
            cancelBtns.get(0).click();
            WebElement reasonArea = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("cancel-reason")));
            reasonArea.sendKeys("Testing status update");

            WebElement confirmBtn = driver.findElement(By.xpath("//button[contains(text(), 'Yes, Cancel')]"));
            confirmBtn.click();
            Thread.sleep(2000);
        }

        // Refresh page to verify status badge retrieves latest backend status
        driver.navigate().refresh();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement updatedBadge = driver.findElement(By.xpath("//span[contains(@class, 'rounded-full') and contains(text(), 'Cancelled')]"));
        Assert.assertTrue(updatedBadge.isDisplayed(), "Status badge updates correctly to Cancelled upon page refresh");

        captureScreenshot("SUCCESS_statusUpdateOnRefreshOrCancel");
    }

    @Test(description = "Simulate a failure when loading booking status information", priority = 3)
    public void failedBookingStatusError() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        // Load non-existent/invalid booking to simulate failed status retrieval
        driver.get(BASE_URL + "/manage-booking/itinerary?id=9999999");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement errorMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//p[contains(text(), \"We couldn't find this booking\")]")));

        Assert.assertTrue(errorMessage.isDisplayed(), "Clear error message displayed when booking status cannot be retrieved");

        // Verify stale status badge is NOT displayed
        boolean badgeHidden = driver.findElements(By.xpath("//span[contains(@class, 'rounded-full') and (contains(text(), 'Confirmed') or contains(text(), 'Pending'))]")).isEmpty();
        Assert.assertTrue(badgeHidden, "Stale/incorrect status badge is NOT displayed");

        captureScreenshot("SUCCESS_failedBookingStatusError");
    }
}
