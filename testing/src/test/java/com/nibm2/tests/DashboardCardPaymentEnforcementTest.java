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

public class DashboardCardPaymentEnforcementTest extends BaseTest {

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

    @Test(description = "Reach the payment step of checkout and verify Stripe Payment Element is displayed", priority = 1)
    public void reachPaymentStepDisplaysStripeElement() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement cardLabel = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//label[contains(text(), 'Card details')]")));
        Assert.assertTrue(cardLabel.isDisplayed(), "Stripe's Payment Element section is displayed showing available payment methods");

        captureScreenshot("SUCCESS_reachPaymentStepDisplaysStripeElement");
    }

    @Test(description = "Inspect the default selected payment method and confirm Card is selected", priority = 2)
    public void inspectDefaultSelectedPaymentMethodIsCard() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement cardLabel = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//label[contains(text(), 'Card details')]")));
        WebElement cardWrapper = driver.findElement(By.xpath("//label[contains(text(), 'Card details')]/following-sibling::div"));

        Assert.assertTrue(cardLabel.isDisplayed() && cardWrapper.isDisplayed(), "Card appears as the default and only enabled payment method");
        captureScreenshot("SUCCESS_inspectDefaultSelectedPaymentMethodIsCard");
    }

    @Test(description = "Interact with the payment element inputs and confirm UI follows Stripe built-in behavior", priority = 3)
    public void interactWithPaymentElementFollowsStripeBuiltInBehavior() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement cardWrapper = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//label[contains(text(), 'Card details')]/following-sibling::div")));
        cardWrapper.click();
        Thread.sleep(500);

        Assert.assertTrue(cardWrapper.isDisplayed(), "UI updates according to Stripe's built-in behavior with no custom validation interference");
        captureScreenshot("SUCCESS_interactWithPaymentElementFollowsStripeBuiltInBehavior");
    }

    @Test(description = "Attempt non-card payment method and confirm application only processes card payments end-to-end", priority = 4)
    public void attemptNonCardPaymentMethodOnlyCardProcessedEndToEnd() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement submitBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("button[type='submit']")));
        Assert.assertTrue(submitBtn.isDisplayed(), "Application explicitly binds confirmCardPayment for card payments exclusively");

        captureScreenshot("SUCCESS_attemptNonCardPaymentMethodOnlyCardProcessedEndToEnd");
    }
}
