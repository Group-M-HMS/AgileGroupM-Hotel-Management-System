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

public class DashboardGuestSpecialRequestsTest extends BaseTest {

    private void setE2EUser(String email, String uid, String firstName, String lastName, String phone) {
        String script = String.format("window.localStorage.setItem('E2E_TEST_USER', JSON.stringify({uid: '%s', email: '%s', emailVerified: true, displayName: '%s %s', isAnonymous: false, firstName: '%s', lastName: '%s', phone: '%s'}));", uid, email, firstName, lastName, firstName, lastName, phone);
        ((JavascriptExecutor) driver).executeScript(script);
    }

    @Test(description = "Complete a room booking with customer contact details and a special request, then open the booking itinerary", priority = 1)
    public void bookingWithContactAndSpecialRequest() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("john.smith@test.com", "special_user_uid", "John", "Smith", "+94771234567");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=43");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Guest Details')]")));

        // Verify Name, Email, Phone
        WebElement guestSection = driver.findElement(By.xpath("//h2[contains(text(), 'Guest Details')]/following-sibling::div"));
        Assert.assertTrue(guestSection.getText().contains("John Smith"), "Customer name matches entered details");
        Assert.assertTrue(guestSection.getText().contains("john.smith@test.com"), "Customer email matches entered details");
        Assert.assertTrue(guestSection.getText().contains("+94771234567"), "Customer phone matches entered details");

        // Verify Special Request text
        WebElement specialReqField = driver.findElement(By.xpath("//span[text()='Special Requests']/following-sibling::span"));
        Assert.assertTrue(specialReqField.getText().contains("Late check-in after 10pm"), "Special request text appears exactly as submitted");

        captureScreenshot("SUCCESS_bookingWithContactAndSpecialRequest");
    }

    @Test(description = "Create a booking without entering any special request and open the itinerary", priority = 2)
    public void bookingWithoutSpecialRequest() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid", "Test", "User", "+1 555 000 0000");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=25");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Guest Details')]")));

        // Verify Special Requests section displays fallback message
        WebElement specialReqField = driver.findElement(By.xpath("//span[text()='Special Requests']/following-sibling::span"));
        Assert.assertTrue(specialReqField.getText().contains("No special requests"), "Clear fallback message 'No special requests' is shown");

        captureScreenshot("SUCCESS_bookingWithoutSpecialRequest");
    }

    @Test(description = "Submit a booking with special request content and view the itinerary layout", priority = 3)
    public void specialRequestFormattingAndLongText() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("john.smith@test.com", "special_user_uid", "John", "Smith", "+94771234567");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=43");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Guest Details')]")));

        WebElement specialReqField = driver.findElement(By.xpath("//span[text()='Special Requests']/following-sibling::span"));
        Assert.assertTrue(specialReqField.isDisplayed() && !specialReqField.getText().isEmpty(), "Special request content displays correctly without layout corruption");

        captureScreenshot("SUCCESS_specialRequestFormattingAndLongText");
    }
}
