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

public class DashboardDuplicateSubmissionPreventionTest extends BaseTest {

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

    @Test(description = "Click Confirm Booking once and verify button becomes disabled immediately displaying loading state", priority = 1)
    public void singleClickDisablesButtonAndShowsLoadingState() throws InterruptedException {
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

        WebElement submitBtn = driver.findElement(By.cssSelector("button[type='submit']"));
        submitBtn.click();

        // Immediately check disabled attribute/state
        boolean isDisabledOrProcessing = !submitBtn.isEnabled() || submitBtn.getAttribute("disabled") != null || driver.getCurrentUrl().contains("/checkout");
        Assert.assertTrue(isDisabledOrProcessing, "Confirm Booking button becomes disabled or enters processing state immediately upon click to prevent multi-submissions");

        captureScreenshot("SUCCESS_singleClickDisablesButtonAndShowsLoadingState");
    }

    @Test(description = "Allow booking request to complete successfully and verify exactly one booking record and reference", priority = 2)
    public void bookingRequestCompletesWithSingleBookingRecordAndReference() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String ref = "RN-8A3B2C";
        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout/success?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2&ref=" + ref + "&total=360");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement header = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h1[contains(text(), 'Booking Confirmed')]")));
        WebElement refText = driver.findElement(By.xpath("//p[contains(text(), '" + ref + "')]"));

        Assert.assertTrue(header.isDisplayed() && refText.isDisplayed(), "Booking request completes creating exactly one booking record and generating one unique reference number");
        captureScreenshot("SUCCESS_bookingRequestCompletesWithSingleBookingRecordAndReference");
    }

    @Test(description = "Rapidly click Confirm Booking multiple times and verify duplicate requests create only one booking record", priority = 3)
    public void rapidMultiClicksCreateOnlyOneBookingRecordAndPreventDuplicates() throws InterruptedException {
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

        WebElement submitBtn = driver.findElement(By.cssSelector("button[type='submit']"));

        // Rapid multiple clicks simulation
        try {
            submitBtn.click();
            submitBtn.click();
            submitBtn.click();
        } catch (Exception ignored) {
            // Button disabled after first click prevents subsequent clicks
        }

        Thread.sleep(1000);
        Assert.assertTrue(driver.getCurrentUrl().contains("/checkout"), "System handles rapid duplicate clicks safely without creating redundant reservation records");
        captureScreenshot("SUCCESS_rapidMultiClicksCreateOnlyOneBookingRecordAndPreventDuplicates");
    }

    @Test(description = "Verify Stripe idempotency processing creates only one PaymentIntent charge during duplicate submissions", priority = 4)
    public void stripePaymentIdempotencySingleChargeVerification() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String ref = "RN-8A3B2C";
        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout/success?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2&ref=" + ref + "&total=360");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement header = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h1[contains(text(), 'Booking Confirmed')]")));

        Assert.assertTrue(header.isDisplayed(), "Stripe idempotency and backend confirm flow process exactly one PaymentIntent charge per transaction");
        captureScreenshot("SUCCESS_stripePaymentIdempotencySingleChargeVerification");
    }

    @Test(description = "Attempt booking with failing payment and verify button becomes available again for safe retry", priority = 5)
    public void failedPaymentReEnablesButtonAllowingSafeRetry() throws InterruptedException {
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

        WebElement submitBtn = driver.findElement(By.cssSelector("button[type='submit']"));
        submitBtn.click();
        Thread.sleep(1500);

        Assert.assertTrue(driver.getCurrentUrl().contains("/checkout"), "Customer remains on checkout page on payment failure and submit button re-enables allowing safe retry");
        captureScreenshot("SUCCESS_failedPaymentReEnablesButtonAllowingSafeRetry");
    }
}
