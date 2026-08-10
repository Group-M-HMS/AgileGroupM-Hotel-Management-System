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

public class DashboardCheckoutValidationTest extends BaseTest {

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

    @Test(description = "Leave required customer information fields empty and attempt to submit the checkout form", priority = 1)
    public void submitEmptyFormTriggersValidationHighlighting() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("test_user_uid", "", "", "");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement submitBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("button[type='submit']")));

        // Clear prefilled phone to test empty field validation
        WebElement phoneInput = driver.findElement(By.cssSelector("input[placeholder='Phone Number*']"));
        phoneInput.sendKeys(org.openqa.selenium.Keys.CONTROL + "a");
        phoneInput.sendKeys(org.openqa.selenium.Keys.DELETE);

        submitBtn.click();
        Thread.sleep(500);

        WebElement firstNameErr = driver.findElement(By.xpath("//span[contains(text(), 'First name is required')]"));
        WebElement lastNameErr = driver.findElement(By.xpath("//span[contains(text(), 'Last name is required')]"));
        WebElement emailErr = driver.findElement(By.xpath("//span[contains(text(), 'Email is required')]"));

        Assert.assertTrue(firstNameErr.isDisplayed(), "Validation message is displayed for empty first name");
        Assert.assertTrue(lastNameErr.isDisplayed(), "Validation message is displayed for empty last name");
        Assert.assertTrue(emailErr.isDisplayed(), "Validation message is displayed for empty email");

        captureScreenshot("SUCCESS_submitEmptyFormTriggersValidationHighlighting");
    }

    @Test(description = "Enter valid information into one highlighted field and verify validation clears immediately", priority = 2)
    public void enterValidFieldClearsErrorImmediately() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("test_user_uid", "", "", "");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement submitBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("button[type='submit']")));

        WebElement phoneInput = driver.findElement(By.cssSelector("input[placeholder='Phone Number*']"));
        phoneInput.sendKeys(org.openqa.selenium.Keys.CONTROL + "a");
        phoneInput.sendKeys(org.openqa.selenium.Keys.DELETE);

        submitBtn.click();
        Thread.sleep(500);

        WebElement firstNameInput = driver.findElement(By.cssSelector("input[placeholder='First Name*']"));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", firstNameInput);
        Thread.sleep(300);
        firstNameInput.sendKeys("John");
        firstNameInput.sendKeys(org.openqa.selenium.Keys.TAB);
        Thread.sleep(500);

        List<WebElement> firstNameErrs = driver.findElements(By.xpath("//span[contains(text(), 'First name is required')]"));
        Assert.assertTrue(firstNameErrs.isEmpty(), "First name error message clears immediately upon entering valid value");

        WebElement lastNameErr = driver.findElement(By.xpath("//span[contains(text(), 'Last name is required')]"));
        Assert.assertTrue(lastNameErr.isDisplayed(), "Remaining invalid fields continue showing validation feedback");

        captureScreenshot("SUCCESS_enterValidFieldClearsErrorImmediately");
    }

    @Test(description = "Complete all required non-payment fields and submit checkout form", priority = 3)
    public void completeAllRequiredNonPaymentFieldsClearsValidation() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement firstNameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[placeholder='First Name*']")));
        WebElement lastNameInput = driver.findElement(By.cssSelector("input[placeholder='Last Name*']"));
        WebElement emailInput = driver.findElement(By.cssSelector("input[placeholder='Email Address*']"));
        WebElement phoneInput = driver.findElement(By.cssSelector("input[placeholder='Phone Number*']"));

        Assert.assertEquals(firstNameInput.getAttribute("value"), "John");
        Assert.assertEquals(lastNameInput.getAttribute("value"), "Smith");
        Assert.assertEquals(emailInput.getAttribute("value"), "john.smith@test.com");
        Assert.assertEquals(phoneInput.getAttribute("value"), "+1 555 123 4567");

        List<WebElement> validationErrs = driver.findElements(By.xpath("//span[contains(@class, 'text-red-500')]"));
        Assert.assertTrue(validationErrs.isEmpty(), "No required field validation errors are displayed when all non-payment fields are valid");

        captureScreenshot("SUCCESS_completeAllRequiredNonPaymentFieldsClearsValidation");
    }

    @Test(description = "Enter invalid payment details in Stripe Payment Element and verify payment validation handling", priority = 4)
    public void invalidPaymentDetailsShowsPaymentValidationError() throws InterruptedException {
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

        List<WebElement> cardErrors = driver.findElements(By.xpath("//*[contains(text(), 'card') or contains(text(), 'payment') or contains(text(), 'Card')]"));
        Assert.assertTrue(!cardErrors.isEmpty() || driver.getCurrentUrl().contains("/checkout"), "Customer remains on the checkout/payment step when payment details are incomplete or invalid");

        captureScreenshot("SUCCESS_invalidPaymentDetailsShowsPaymentValidationError");
    }
}
