package com.nibm2.tests;

import com.nibm2.base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;
import java.util.List;

public class DashboardCancellationEligibilityTest extends BaseTest {

    private void setE2EUser(String email, String uid) {
        String script = String.format("window.localStorage.setItem('E2E_TEST_USER', JSON.stringify({uid: '%s', email: '%s', emailVerified: true, displayName: 'Test User', isAnonymous: false, firstName: 'Test', lastName: 'User', phone: '+1 555 000 0000'}));", uid, email);
        ((JavascriptExecutor) driver).executeScript(script);
    }

    @Test(description = "Open the itinerary page of a booking that is eligible for cancellation", priority = 1)
    public void eligibleBookingShowsCancelOption() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=40");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement cancelBtn = driver.findElement(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        Assert.assertTrue(cancelBtn.isDisplayed() && cancelBtn.isEnabled(), "Cancel Booking option is visible for eligible booking");

        captureScreenshot("SUCCESS_eligibleBookingShowsCancelOption");
    }

    @Test(description = "Open the itinerary page of a booking that cannot be cancelled", priority = 2)
    public void ineligibleBookingHidesCancelOption() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=25");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        List<WebElement> cancelBtns = driver.findElements(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        Assert.assertTrue(cancelBtns.isEmpty(), "Cancel Booking option is NOT displayed for ineligible/canceled booking");

        captureScreenshot("SUCCESS_ineligibleBookingHidesCancelOption");
    }

    @Test(description = "Attempt to cancel an ineligible booking by directly sending a cancellation request through API", priority = 3)
    public void apiRejectsIneligibleCancellation() throws Exception {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        // Attempt direct API cancellation on already-canceled booking ID 25
        URL url = new URL("http://168.138.170.92:8085/api/v1/bookings/25/cancel");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("X-User-Id", "details_user_uid");
        conn.setDoOutput(true);

        String jsonInputString = "{\"reason\": \"direct API attempt on ineligible booking\"}";
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = jsonInputString.getBytes("utf-8");
            os.write(input, 0, input.length);
        }

        int responseCode = conn.getResponseCode();
        Assert.assertTrue(responseCode >= 400 || responseCode == 500, "Backend rejects invalid/ineligible API cancellation request (HTTP " + responseCode + ")");

        // Verify booking status remains unchanged on UI
        driver.get(BASE_URL + "/manage-booking/itinerary?id=25");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement statusBadge = driver.findElement(By.xpath("//span[contains(@class, 'rounded-full') and contains(text(), 'Cancelled')]"));
        Assert.assertTrue(statusBadge.isDisplayed(), "Booking status remains unchanged as Cancelled");

        captureScreenshot("SUCCESS_apiRejectsIneligibleCancellation");
    }
}
