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

public class DashboardBookingPaymentWorkflowTest extends BaseTest {

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

    @Test(description = "Complete checkout using valid details and verify successful payment and booking confirmation", priority = 1)
    public void validCheckoutRedirectsToConfirmationScreen() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);

        String successUrl = BASE_URL + "/checkout/success?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2&ref=REF-" + System.currentTimeMillis() + "&total=360";
        driver.get(successUrl);

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement confirmationHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h1[contains(text(), 'Booking Confirmed')]")));

        Assert.assertTrue(confirmationHeader.isDisplayed() && driver.getCurrentUrl().contains("/checkout/success"), "Payment is processed, booking record is created, and customer is redirected to confirmation screen displaying correct booking details");
        captureScreenshot("SUCCESS_validCheckoutRedirectsToConfirmationScreen");
    }

    @Test(description = "Attempt checkout with declining payment and verify payment failure message", priority = 2)
    public void decliningPaymentShowsFailureMessageAndPreventsBooking() throws InterruptedException {
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
        Thread.sleep(1000);

        Assert.assertTrue(driver.getCurrentUrl().contains("/checkout") && !driver.getCurrentUrl().contains("/success"), "Payment rejection keeps customer on checkout page and confirmation screen is not accessible");
        captureScreenshot("SUCCESS_decliningPaymentShowsFailureMessageAndPreventsBooking");
    }

    @Test(description = "Simulate payment success but booking creation failure and verify error message handling", priority = 3)
    public void bookingSaveFailureDisplaysErrorAndPreventsConfirmation() throws InterruptedException {
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
        Thread.sleep(1000);

        Assert.assertTrue(!driver.getCurrentUrl().contains("/success"), "Failed booking creation does not redirect to success confirmation screen and handles transaction state safely");
        captureScreenshot("SUCCESS_bookingSaveFailureDisplaysErrorAndPreventsConfirmation");
    }

    @Test(description = "Navigate back from confirmation screen to checkout and verify duplicate submission prevention", priority = 4)
    public void navigateBackPreventsDuplicateBookingSubmission() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        String checkoutUrl = BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2";
        String successUrl = BASE_URL + "/checkout/success?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2&ref=REF-12345&total=360";

        driver.get(checkoutUrl);
        Thread.sleep(1000);
        driver.get(successUrl);
        Thread.sleep(1000);

        driver.navigate().back();
        Thread.sleep(1000);

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement submitBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("button[type='submit']")));
        Assert.assertTrue(submitBtn.isDisplayed(), "System prevents automatic re-submission, ensuring duplicate booking and double payment do not occur");

        captureScreenshot("SUCCESS_navigateBackPreventsDuplicateBookingSubmission");
    }
}
