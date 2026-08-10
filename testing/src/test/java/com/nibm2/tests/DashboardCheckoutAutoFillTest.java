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

public class DashboardCheckoutAutoFillTest extends BaseTest {

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

    @Test(description = "Log in with an account containing complete profile information, then start checkout", priority = 1)
    public void checkoutAutoPopulatesCompleteProfile() throws InterruptedException {
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

        Assert.assertEquals(firstNameInput.getAttribute("value"), "John", "First name is automatically populated with saved customer information");
        Assert.assertEquals(lastNameInput.getAttribute("value"), "Smith", "Last name is automatically populated with saved customer information");
        Assert.assertEquals(emailInput.getAttribute("value"), "john.smith@test.com", "Email is automatically populated with saved customer information");

        captureScreenshot("SUCCESS_checkoutAutoPopulatesCompleteProfile");
    }

    @Test(description = "Modify a pre-filled checkout field and verify updated value is used", priority = 2)
    public void modifyAutoFilledCheckoutFieldOverridesSavedValue() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement emailInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[placeholder='Email Address*']")));

        emailInput.sendKeys(org.openqa.selenium.Keys.CONTROL + "a");
        emailInput.sendKeys(org.openqa.selenium.Keys.DELETE);
        emailInput.sendKeys("updated.smith@test.com");
        Thread.sleep(500);

        Assert.assertEquals(emailInput.getAttribute("value"), "updated.smith@test.com", "User can edit auto-filled information and updated value is used for checkout");

        captureScreenshot("SUCCESS_modifyAutoFilledCheckoutFieldOverridesSavedValue");
    }

    @Test(description = "Log out and start checkout as a guest user, verifying fields are empty by default", priority = 3)
    public void guestUserCheckoutFieldsAreEmptyByDefault() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement firstNameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[placeholder='First Name*']")));
        WebElement lastNameInput = driver.findElement(By.cssSelector("input[placeholder='Last Name*']"));
        WebElement emailInput = driver.findElement(By.cssSelector("input[placeholder='Email Address*']"));

        Assert.assertEquals(firstNameInput.getAttribute("value"), "", "Customer first name field is empty by default for guest checkout");
        Assert.assertEquals(lastNameInput.getAttribute("value"), "", "Customer last name field is empty by default for guest checkout");
        Assert.assertEquals(emailInput.getAttribute("value"), "", "Customer email field is empty by default for guest checkout");

        captureScreenshot("SUCCESS_guestUserCheckoutFieldsAreEmptyByDefault");
    }

    @Test(description = "Log in with an account containing incomplete profile information and verify available fields auto-fill", priority = 4)
    public void incompleteProfileAutoFillsAvailableFieldsOnly() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("incomplete_user_uid", "jane.doe@test.com", "Jane", "");
        Thread.sleep(1000);

        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement firstNameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[placeholder='First Name*']")));
        WebElement lastNameInput = driver.findElement(By.cssSelector("input[placeholder='Last Name*']"));
        WebElement emailInput = driver.findElement(By.cssSelector("input[placeholder='Email Address*']"));

        Assert.assertEquals(firstNameInput.getAttribute("value"), "Jane", "Available profile information (first name) is auto-filled correctly");
        Assert.assertEquals(emailInput.getAttribute("value"), "jane.doe@test.com", "Available profile information (email) is auto-filled correctly");
        Assert.assertEquals(lastNameInput.getAttribute("value"), "", "Missing profile fields remain empty for manual user entry");

        captureScreenshot("SUCCESS_incompleteProfileAutoFillsAvailableFieldsOnly");
    }
}
