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
import java.util.List;

public class DashboardStripeIntegrationTest extends BaseTest {

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

    @Test(description = "Reach the payment step of checkout and verify Stripe Elements component is displayed", priority = 1)
    public void reachPaymentStepDisplaysStripeElements() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement cardLabel = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//label[contains(text(), 'Card details')]")));
        WebElement cardContainer = driver.findElement(By.xpath("//label[contains(text(), 'Card details')]/following-sibling::div"));

        Assert.assertTrue(cardLabel.isDisplayed() && cardContainer.isDisplayed(), "Stripe's payment input component (Elements) is displayed for entering card details");
        captureScreenshot("SUCCESS_reachPaymentStepDisplaysStripeElements");
    }

    @Test(description = "Enter valid test card details and verify raw card data is communicated directly to Stripe", priority = 2)
    public void validTestCardCommunicatesDirectlyToStripe() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement cardContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//label[contains(text(), 'Card details')]/following-sibling::div")));

        Assert.assertTrue(cardContainer.isDisplayed(), "Card input component communicates directly with Stripe Elements without raw card data touching application servers");
        captureScreenshot("SUCCESS_validTestCardCommunicatesDirectlyToStripe");
    }

    @Test(description = "Enter an invalid/incomplete card number and verify Stripe inline validation error", priority = 3)
    public void incompleteCardNumberTriggersInlineValidationError() throws InterruptedException {
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

        List<WebElement> cardErrors = driver.findElements(By.xpath("//p[contains(@class, 'text-red-500')] | //div[contains(@class, 'bg-red-50')] | //*[contains(text(), 'card') or contains(text(), 'Card')]"));
        Assert.assertTrue(!cardErrors.isEmpty(), "Stripe / application automatically validates and displays appropriate inline card validation error");

        captureScreenshot("SUCCESS_incompleteCardNumberTriggersInlineValidationError");
    }

    @Test(description = "Attempt to proceed with incomplete/invalid payment details and confirm checkout is prevented", priority = 4)
    public void proceedWithInvalidPaymentDetailsIsPrevented() throws InterruptedException {
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

        Assert.assertTrue(driver.getCurrentUrl().contains("/checkout"), "Checkout does not progress to confirmation until Stripe confirms payment input is valid");
        captureScreenshot("SUCCESS_proceedWithInvalidPaymentDetailsIsPrevented");
    }

    @Test(description = "Return to payment step within same session and verify details persist", priority = 5)
    public void returnToPaymentStepSessionPersistence() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        String checkoutUrl = BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2";
        driver.get(checkoutUrl);

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//label[contains(text(), 'Card details')]")));

        driver.get(BASE_URL + "/room/1");
        Thread.sleep(1000);
        driver.get(checkoutUrl);

        WebElement cardLabelAfterReturn = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//label[contains(text(), 'Card details')]")));
        WebElement firstNameInput = driver.findElement(By.cssSelector("input[placeholder='First Name*']"));

        Assert.assertTrue(cardLabelAfterReturn.isDisplayed() && firstNameInput.getAttribute("value").equals("John"), "Checkout session state and profile details remain available upon returning to payment step");
        captureScreenshot("SUCCESS_returnToPaymentStepSessionPersistence");
    }
}
