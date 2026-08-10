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

public class DashboardCancelWorkflowTest extends BaseTest {

    private void setE2EUser(String email, String uid) {
        String script = String.format("window.localStorage.setItem('E2E_TEST_USER', JSON.stringify({uid: '%s', email: '%s', emailVerified: true, displayName: 'Test User', isAnonymous: false, firstName: 'Test', lastName: 'User', phone: '+1 555 000 0000'}));", uid, email);
        ((JavascriptExecutor) driver).executeScript(script);
    }

    @Test(description = "Select the Cancel Booking option for an eligible booking", priority = 1)
    public void cancelOptionsModalDisplayed() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("john.smith@test.com", "special_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=43");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement cancelBtn = driver.findElement(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        cancelBtn.click();

        WebElement modalHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Cancel this booking?')]")));
        Assert.assertTrue(modalHeader.isDisplayed(), "Cancellation confirmation modal is displayed");

        WebElement keepBtn = driver.findElement(By.xpath("//button[contains(text(), 'No, Keep Booking')]"));
        WebElement confirmBtn = driver.findElement(By.xpath("//button[contains(text(), 'Yes, Cancel')]"));
        Assert.assertTrue(keepBtn.isDisplayed() && confirmBtn.isDisplayed(), "Modal provides clear options: No, Keep Booking and Yes, Cancel");

        captureScreenshot("SUCCESS_cancelOptionsModalDisplayed");
    }

    @Test(description = "Select No, Keep Booking from the confirmation modal", priority = 2)
    public void keepBookingDismissesModal() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("john.smith@test.com", "special_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=43");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement cancelBtn = driver.findElement(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        cancelBtn.click();

        WebElement keepBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//button[contains(text(), 'No, Keep Booking')]")));
        keepBtn.click();

        Thread.sleep(1000);
        boolean modalClosed = driver.findElements(By.xpath("//h2[contains(text(), 'Cancel this booking?')]")).isEmpty();
        Assert.assertTrue(modalClosed, "Confirmation modal closes when selecting 'No, Keep Booking'");

        WebElement statusBadge = driver.findElement(By.xpath("//span[contains(@class, 'rounded-full') and (contains(text(), 'Pending') or contains(text(), 'Confirmed'))]"));
        Assert.assertTrue(statusBadge.isDisplayed(), "Booking status remains unchanged");

        captureScreenshot("SUCCESS_keepBookingDismissesModal");
    }

    @Test(description = "Open the cancellation modal again and select Yes, Cancel", priority = 3)
    public void yesCancelExecutesCancellation() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("john.smith@test.com", "special_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=43");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement cancelBtn = driver.findElement(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        cancelBtn.click();

        WebElement reasonArea = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("cancel-reason")));
        reasonArea.sendKeys("Travel plans changed");

        WebElement confirmBtn = driver.findElement(By.xpath("//button[contains(text(), 'Yes, Cancel')]"));
        confirmBtn.click();

        WebElement banner = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//span[contains(text(), 'Your booking has been canceled successfully.')]")));
        Assert.assertTrue(banner.isDisplayed(), "Cancellation process begins and succeeds");

        WebElement updatedBadge = driver.findElement(By.xpath("//span[contains(@class, 'rounded-full') and contains(text(), 'Cancelled')]"));
        Assert.assertTrue(updatedBadge.isDisplayed(), "Booking status transitions to Cancelled");

        captureScreenshot("SUCCESS_yesCancelExecutesCancellation");
    }

    @Test(description = "Open the cancellation confirmation modal and dismiss it", priority = 4)
    public void dismissModalPreservesBooking() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=40");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement cancelBtn = driver.findElement(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        cancelBtn.click();

        WebElement keepBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//button[contains(text(), 'No, Keep Booking')]")));
        keepBtn.click();

        Thread.sleep(1000);
        WebElement activeStatus = driver.findElement(By.xpath("//span[contains(@class, 'rounded-full') and (contains(text(), 'Pending') or contains(text(), 'Confirmed'))]"));
        Assert.assertTrue(activeStatus.isDisplayed(), "Booking is NOT cancelled on modal dismiss; behavior is equivalent to Keep Booking");

        captureScreenshot("SUCCESS_dismissModalPreservesBooking");
    }
}
