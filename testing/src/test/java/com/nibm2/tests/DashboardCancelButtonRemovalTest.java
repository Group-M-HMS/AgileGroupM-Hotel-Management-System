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
import java.util.List;

public class DashboardCancelButtonRemovalTest extends BaseTest {

    private static String activeBookingId = null;

    private void setE2EUser(String email, String uid) {
        String script = String.format("window.localStorage.setItem('E2E_TEST_USER', JSON.stringify({uid: '%s', email: '%s', emailVerified: true, displayName: 'Test User', isAnonymous: false, firstName: 'Test', lastName: 'User', phone: '+1 555 000 0000'}));", uid, email);
        ((JavascriptExecutor) driver).executeScript(script);
    }

    private String getOrCreateActiveBookingId(String uid) {
        if (activeBookingId != null) return activeBookingId;
        try {
            URL url = new URL("http://168.138.170.92:8085/api/v1/bookings/my");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("X-User-Id", uid);
            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder content = new StringBuilder();
            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();
            conn.disconnect();
            String json = content.toString();
            if (json.contains("\"status\":\"PENDING\"")) {
                int idx = json.indexOf("\"status\":\"PENDING\"");
                int start = json.lastIndexOf("\"bookingId\":", idx) + 12;
                int end = json.indexOf(",", start);
                activeBookingId = json.substring(start, end).trim();
                return activeBookingId;
            }

            // Create new active booking via POST
            URL postUrl = new URL("http://168.138.170.92:8085/api/v1/bookings");
            HttpURLConnection postConn = (HttpURLConnection) postUrl.openConnection();
            postConn.setRequestMethod("POST");
            postConn.setRequestProperty("Content-Type", "application/json");
            postConn.setRequestProperty("X-User-Id", uid);
            postConn.setDoOutput(true);
            String body = "{\"roomId\": 1, \"checkInDate\": \"2026-08-28\", \"checkOutDate\": \"2026-08-30\", \"numberOfGuests\": 2, \"specialRequests\": \"none\", \"termsAccepted\": true}";
            try (OutputStream os = postConn.getOutputStream()) {
                os.write(body.getBytes("utf-8"));
            }
            BufferedReader postIn = new BufferedReader(new InputStreamReader(postConn.getInputStream()));
            StringBuilder postContent = new StringBuilder();
            while ((inputLine = postIn.readLine()) != null) {
                postContent.append(inputLine);
            }
            postIn.close();
            postConn.disconnect();
            String res = postContent.toString();
            int idx = res.indexOf("\"uuid\":");
            int start = idx + 7;
            int end = res.indexOf(",", start);
            activeBookingId = res.substring(start, end).trim();
            return activeBookingId;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "48";
    }

    @Test(description = "Open the itinerary page of a confirmed booking and verify Cancel Booking option is visible", priority = 1)
    public void openConfirmedBookingShowsCancelOption() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        String bookingId = getOrCreateActiveBookingId("details_user_uid");
        driver.get(BASE_URL + "/manage-booking/itinerary?id=" + bookingId);

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement cancelBtn = driver.findElement(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        Assert.assertTrue(cancelBtn.isDisplayed() && cancelBtn.isEnabled(), "Cancel Booking option is visible on confirmed/active booking");

        captureScreenshot("SUCCESS_openConfirmedBookingShowsCancelOption");
    }

    @Test(description = "Cancel the booking through normal cancellation flow and verify Cancel Booking button is removed immediately without manual page refresh", priority = 2)
    public void cancelBookingRemovesCancelButtonImmediately() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        String bookingId = getOrCreateActiveBookingId("details_user_uid");
        driver.get(BASE_URL + "/manage-booking/itinerary?id=" + bookingId);

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement cancelBtn = driver.findElement(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        cancelBtn.click();

        WebElement reasonArea = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("cancel-reason")));
        reasonArea.sendKeys("Schedule conflict");

        WebElement confirmBtn = driver.findElement(By.xpath("//button[contains(text(), 'Yes, Cancel')]"));
        confirmBtn.click();

        // Wait for status to become Cancelled
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//span[contains(@class, 'rounded-full') and contains(text(), 'Cancelled')]")));

        // Verify Cancel Booking button is immediately removed without refresh
        List<WebElement> cancelBtns = driver.findElements(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        Assert.assertTrue(cancelBtns.isEmpty(), "Cancel Booking option is removed immediately upon cancellation without requiring manual page refresh");

        captureScreenshot("SUCCESS_cancelBookingRemovesCancelButtonImmediately");
    }

    @Test(description = "Refresh the itinerary page after cancellation and review booking details again", priority = 3)
    public void refreshItineraryKeepCancelOptionUnavailable() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        String bookingId = getOrCreateActiveBookingId("details_user_uid");
        driver.get(BASE_URL + "/manage-booking/itinerary?id=" + bookingId);

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        // Refresh page
        driver.navigate().refresh();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        // Status remains Cancelled and Cancel button remains unavailable
        WebElement statusBadge = driver.findElement(By.xpath("//span[contains(@class, 'rounded-full') and contains(text(), 'Cancelled')]"));
        Assert.assertTrue(statusBadge.isDisplayed(), "Booking status remains Canceled after page reload");

        List<WebElement> cancelBtns = driver.findElements(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        Assert.assertTrue(cancelBtns.isEmpty(), "Cancel Booking option remains unavailable after page reload; repeated cancellation is prohibited");

        captureScreenshot("SUCCESS_refreshItineraryKeepCancelOptionUnavailable");
    }
}
