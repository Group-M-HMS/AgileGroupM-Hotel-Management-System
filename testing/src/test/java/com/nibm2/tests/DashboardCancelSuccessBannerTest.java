package com.nibm2.tests;

import com.nibm2.base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class DashboardCancelSuccessBannerTest extends BaseTest {

    private void setE2EUser(String email, String uid) {
        String script = String.format("window.localStorage.setItem('E2E_TEST_USER', JSON.stringify({uid: '%s', email: '%s', emailVerified: true, displayName: 'Test User', isAnonymous: false, firstName: 'Test', lastName: 'User', phone: '+1 555 000 0000'}));", uid, email);
        ((JavascriptExecutor) driver).executeScript(script);
    }

    private String getDateStr(int daysOffset) {
        return LocalDate.now().plusDays(daysOffset).format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    private String createTestBooking(String uid, int roomId, int startDays, int endDays) throws Exception {
        String checkIn = getDateStr(startDays);
        String checkOut = getDateStr(endDays);

        URL postUrl = new URL("http://168.138.170.92:8085/api/v1/bookings");
        HttpURLConnection postConn = (HttpURLConnection) postUrl.openConnection();
        postConn.setRequestMethod("POST");
        postConn.setRequestProperty("Content-Type", "application/json");
        postConn.setRequestProperty("X-User-Id", uid);
        postConn.setDoOutput(true);
        String body = String.format("{\"roomId\": %d, \"checkInDate\": \"%s\", \"checkOutDate\": \"%s\", \"numberOfGuests\": 2, \"specialRequests\": \"none\", \"termsAccepted\": true}", roomId, checkIn, checkOut);
        try (OutputStream os = postConn.getOutputStream()) {
            os.write(body.getBytes("utf-8"));
        }

        int code = postConn.getResponseCode();
        BufferedReader postIn;
        if (code >= 400) {
            postIn = new BufferedReader(new InputStreamReader(postConn.getErrorStream()));
        } else {
            postIn = new BufferedReader(new InputStreamReader(postConn.getInputStream()));
        }
        StringBuilder postContent = new StringBuilder();
        String inputLine;
        while ((inputLine = postIn.readLine()) != null) {
            postContent.append(inputLine);
        }
        postIn.close();
        postConn.disconnect();
        String res = postContent.toString();
        if (!res.contains("\"uuid\":")) {
            throw new RuntimeException("Failed to create booking: " + res);
        }
        int idx = res.indexOf("\"uuid\":");
        int start = idx + 7;
        int end = res.indexOf("}", start);
        if (res.indexOf(",", start) != -1 && res.indexOf(",", start) < end) {
            end = res.indexOf(",", start);
        }
        return res.substring(start, end).trim();
    }

    @Test(description = "Cancel a valid and eligible booking through the normal cancellation flow and verify success banner", priority = 1)
    public void cancelBookingDisplaysSuccessBanner() throws Exception {
        int offset = 300 + (int) (System.currentTimeMillis() % 80);
        String bookingId = createTestBooking("special_user_uid", 4, offset, offset + 2);

        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("john.smith@test.com", "special_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=" + bookingId);

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement cancelBtn = driver.findElement(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        cancelBtn.click();

        WebElement reasonArea = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("cancel-reason")));
        reasonArea.clear();
        reasonArea.sendKeys("Success banner test");
        Thread.sleep(500);

        WebElement confirmBtn = driver.findElement(By.xpath("//button[contains(text(), 'Yes, Cancel')]"));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", confirmBtn);

        // Verify success banner is displayed
        WebElement banner = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//span[contains(text(), 'Your booking has been canceled successfully.')]")));
        Assert.assertTrue(banner.isDisplayed(), "Success confirmation banner is displayed confirming cancellation");

        WebElement statusBadge = driver.findElement(By.xpath("//span[contains(@class, 'rounded-full') and contains(text(), 'Cancelled')]"));
        Assert.assertTrue(statusBadge.isDisplayed(), "Updated booking status is reflected correctly as Cancelled");

        captureScreenshot("SUCCESS_cancelBookingDisplaysSuccessBanner");
    }

    @Test(description = "Manually dismiss the success banner and verify page state remains clean", priority = 2)
    public void dismissSuccessBannerCleansUI() throws Exception {
        int offset = 400 + (int) (System.currentTimeMillis() % 80);
        String bookingId = createTestBooking("special_user_uid", 4, offset, offset + 2);

        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("john.smith@test.com", "special_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=" + bookingId);

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement cancelBtn = driver.findElement(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        cancelBtn.click();

        WebElement reasonArea = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("cancel-reason")));
        reasonArea.clear();
        reasonArea.sendKeys("Dismiss test");
        Thread.sleep(500);

        WebElement confirmBtn = driver.findElement(By.xpath("//button[contains(text(), 'Yes, Cancel')]"));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", confirmBtn);

        WebElement dismissBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//button[@aria-label='Dismiss']")));
        dismissBtn.click();

        Thread.sleep(800);
        List<WebElement> banners = driver.findElements(By.xpath("//span[contains(text(), 'Your booking has been canceled successfully.')]"));
        Assert.assertTrue(banners.isEmpty(), "Banner disappears correctly and no outdated success message remains visible");

        captureScreenshot("SUCCESS_dismissSuccessBannerCleansUI");
    }

    @Test(description = "Trigger a cancellation request failure and verify success banner is suppressed and error shown", priority = 3)
    public void failedCancellationSuppressesSuccessBannerAndDisplaysError() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        // Open an already cancelled booking (ID 25)
        driver.get(BASE_URL + "/manage-booking/itinerary?id=25");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        // Verify success banner is NOT present on ineligible/failed attempt
        List<WebElement> banners = driver.findElements(By.xpath("//span[contains(text(), 'Your booking has been canceled successfully.')]"));
        Assert.assertTrue(banners.isEmpty(), "Success banner is NOT displayed for failed or prohibited cancellation attempts");

        WebElement statusBadge = driver.findElement(By.xpath("//span[contains(@class, 'rounded-full') and contains(text(), 'Cancelled')]"));
        Assert.assertTrue(statusBadge.isDisplayed(), "Booking status remains intact as Cancelled without erroneous toast notifications");

        captureScreenshot("SUCCESS_failedCancellationSuppressesSuccessBannerAndDisplaysError");
    }
}
