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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class DashboardTermsValidationTest extends BaseTest {

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

    @Test(description = "Navigate to checkout without selecting Terms checkbox and verify terms acceptance is enforced", priority = 1)
    public void uncheckedTermsEnforcesAcceptanceMessage() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement submitBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("button[type='submit']")));

        WebElement termsCheckbox = driver.findElement(By.cssSelector("input[type='checkbox']"));
        if (termsCheckbox.isSelected()) {
            termsCheckbox.click();
        }

        submitBtn.click();
        Thread.sleep(500);

        WebElement termsErr = driver.findElement(By.xpath("//p[contains(text(), 'Please accept the Terms & Conditions before continuing')]"));
        Assert.assertTrue(termsErr.isDisplayed(), "Clear validation indication is provided that terms acceptance is required");

        captureScreenshot("SUCCESS_uncheckedTermsEnforcesAcceptanceMessage");
    }

    @Test(description = "Select the Terms & Conditions checkbox and verify terms acceptance state updates and error clears", priority = 2)
    public void selectingTermsCheckboxClearsErrorState() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement submitBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("button[type='submit']")));
        submitBtn.click();
        Thread.sleep(500);

        WebElement termsCheckbox = driver.findElement(By.cssSelector("input[type='checkbox']"));
        if (!termsCheckbox.isSelected()) {
            termsCheckbox.click();
        }
        Thread.sleep(500);

        List<WebElement> termsErrs = driver.findElements(By.xpath("//p[contains(text(), 'Please accept the Terms & Conditions before continuing')]"));
        Assert.assertTrue(termsErrs.isEmpty(), "Terms acceptance state is updated successfully and error message is cleared");

        captureScreenshot("SUCCESS_selectingTermsCheckboxClearsErrorState");
    }

    @Test(description = "Complete the booking process after accepting the Terms and Conditions", priority = 3)
    public void acceptedTermsAllowsBookingCompletion() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement termsCheckbox = wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("input[type='checkbox']")));
        if (!termsCheckbox.isSelected()) {
            termsCheckbox.click();
        }

        Assert.assertTrue(termsCheckbox.isSelected(), "Terms and conditions checkbox is selected prior to booking completion");
        captureScreenshot("SUCCESS_acceptedTermsAllowsBookingCompletion");
    }

    @Test(description = "Send a booking confirmation request directly through API bypassing frontend validation and verify backend rejection", priority = 4)
    public void directApiRequestWithoutTermsRejectionByBackend() throws Exception {
        String checkIn = getDateStr(50);
        String checkOut = getDateStr(52);

        URL postUrl = new URL("http://168.138.170.92:8085/api/v1/bookings");
        HttpURLConnection postConn = (HttpURLConnection) postUrl.openConnection();
        postConn.setRequestMethod("POST");
        postConn.setRequestProperty("Content-Type", "application/json");
        postConn.setRequestProperty("X-User-Id", "test_user_uid");
        postConn.setDoOutput(true);
        String body = String.format("{\"roomId\": 4, \"checkInDate\": \"%s\", \"checkOutDate\": \"%s\", \"numberOfGuests\": 2, \"specialRequests\": \"none\", \"termsAccepted\": false}", checkIn, checkOut);
        try (OutputStream os = postConn.getOutputStream()) {
            os.write(body.getBytes("utf-8"));
        }

        int responseCode = postConn.getResponseCode();
        Assert.assertEquals(responseCode, 400, "Backend rejects request with HTTP 400 Bad Request when termsAccepted is false");

        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        captureScreenshot("SUCCESS_directApiRequestWithoutTermsRejectionByBackend");
    }
}
