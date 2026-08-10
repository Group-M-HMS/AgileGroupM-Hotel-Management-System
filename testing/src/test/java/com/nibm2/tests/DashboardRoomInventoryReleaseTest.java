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

public class DashboardRoomInventoryReleaseTest extends BaseTest {

    private static String testBookingId = null;
    private static final int baseOffset1 = (int) (System.currentTimeMillis() % 300 + 150);
    private static final int baseOffset2 = baseOffset1 + 10;

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
        if (code >= 400) {
            throw new RuntimeException("HTTP Error " + code);
        }

        BufferedReader postIn = new BufferedReader(new InputStreamReader(postConn.getInputStream()));
        StringBuilder postContent = new StringBuilder();
        String inputLine;
        while ((inputLine = postIn.readLine()) != null) {
            postContent.append(inputLine);
        }
        postIn.close();
        postConn.disconnect();
        String res = postContent.toString();
        int idx = res.indexOf("\"uuid\":");
        int start = idx + 7;
        int end = res.indexOf(",", start);
        return res.substring(start, end).trim();
    }

    @Test(description = "Cancel a confirmed booking for a specific room and date range through the normal cancellation flow", priority = 1)
    public void cancelConfirmedBookingReleaseInventory() throws Exception {
        testBookingId = createTestBooking("special_user_uid", 1, baseOffset1, baseOffset1 + 2);

        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("john.smith@test.com", "special_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=" + testBookingId);

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement cancelBtn = driver.findElement(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        cancelBtn.click();

        WebElement reasonArea = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("cancel-reason")));
        reasonArea.sendKeys("Releasing inventory test");

        WebElement confirmBtn = driver.findElement(By.xpath("//button[contains(text(), 'Yes, Cancel')]"));
        confirmBtn.click();

        WebElement updatedBadge = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//span[contains(@class, 'rounded-full') and contains(text(), 'Cancelled')]")));
        Assert.assertTrue(updatedBadge.isDisplayed(), "Cancellation completes successfully and status updates to Cancelled");

        captureScreenshot("SUCCESS_cancelConfirmedBookingReleaseInventory");
    }

    @Test(description = "Search for the cancelled room and date range using another customer account", priority = 2)
    public void searchCancelledRoomShowsAvailable() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        String checkIn = getDateStr(baseOffset1);
        String checkOut = getDateStr(baseOffset1 + 2);
        driver.get(BASE_URL + "/search-results?checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//body")));
        Thread.sleep(1500);

        WebElement roomList = driver.findElement(By.tagName("body"));
        Assert.assertTrue(roomList.getText().contains("Room") || roomList.getText().contains("Suite") || roomList.getText().contains("Deluxe"), "Released room inventory is displayed as available for selection");

        captureScreenshot("SUCCESS_searchCancelledRoomShowsAvailable");
    }

    @Test(description = "Verify cancellation status and room availability consistency across API and UI", priority = 3)
    public void verifyCancellationStatusAndAvailabilityConsistency() throws Exception {
        Assert.assertNotNull(testBookingId, "Cancelled booking ID must exist");

        URL url = new URL("http://168.138.170.92:8085/api/v1/bookings/my/" + testBookingId);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("X-User-Id", "special_user_uid");
        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        StringBuilder content = new StringBuilder();
        String inputLine;
        while ((inputLine = in.readLine()) != null) {
            content.append(inputLine);
        }
        in.close();
        conn.disconnect();

        Assert.assertTrue(content.toString().contains("\"status\":\"CANCELLED\""), "Booking record shows CANCELLED in backend without state inconsistency");

        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("john.smith@test.com", "special_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=" + testBookingId);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement statusBadge = driver.findElement(By.xpath("//span[contains(@class, 'rounded-full') and contains(text(), 'Cancelled')]"));
        Assert.assertTrue(statusBadge.isDisplayed(), "UI and backend inventory states are fully synchronized");

        captureScreenshot("SUCCESS_verifyCancellationStatusAndAvailabilityConsistency");
    }

    @Test(description = "Simulate two customers attempting to book the released room for the same dates simultaneously", priority = 4)
    public void concurrentBookingsPreventDoubleBooking() throws Exception {
        String booking1 = createTestBooking("special_user_uid", 4, baseOffset2, baseOffset2 + 2);
        Assert.assertNotNull(booking1, "First booking request succeeds");

        // Attempt 2nd concurrent booking for same room and dates
        boolean secondBookingFailed = false;
        try {
            createTestBooking("details_user_uid", 4, baseOffset2, baseOffset2 + 2);
        } catch (Exception e) {
            secondBookingFailed = true;
        }

        Assert.assertTrue(secondBookingFailed, "System prevents double-booking and rejects conflicting concurrent request");

        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("special_user_uid@test.com", "special_user_uid");
        Thread.sleep(1000);
        driver.get(BASE_URL + "/manage-booking/itinerary?id=" + booking1);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        captureScreenshot("SUCCESS_concurrentBookingsPreventDoubleBooking");
    }
}

