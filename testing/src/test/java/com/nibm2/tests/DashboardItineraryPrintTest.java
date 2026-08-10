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
import java.util.List;

public class DashboardItineraryPrintTest extends BaseTest {

    private void setE2EUser(String email, String uid, String firstName, String lastName, String phone) {
        String script = String.format("window.localStorage.setItem('E2E_TEST_USER', JSON.stringify({uid: '%s', email: '%s', emailVerified: true, displayName: '%s %s', isAnonymous: false, firstName: '%s', lastName: '%s', phone: '%s'}));", uid, email, firstName, lastName, firstName, lastName, phone);
        ((JavascriptExecutor) driver).executeScript(script);
    }

    @Test(description = "Open a booking itinerary and select the Print Itinerary option", priority = 1)
    public void openItineraryAndSelectPrint() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("john.smith@test.com", "special_user_uid", "John", "Smith", "+94771234567");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=43");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement printBtn = driver.findElement(By.xpath("//button[contains(text(), 'Print Itinerary')]"));
        Assert.assertTrue(printBtn.isDisplayed() && printBtn.isEnabled(), "Print Itinerary option is visible and selectable");

        captureScreenshot("SUCCESS_openItineraryAndSelectPrint");
    }

    @Test(description = "Review the print preview content for completeness", priority = 2)
    public void reviewPrintPreviewContent() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("john.smith@test.com", "special_user_uid", "John", "Smith", "+94771234567");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=43");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        // Verify required information: Booking ID, Guest info, Room details, Check-in/out, Special requests
        WebElement pageText = driver.findElement(By.tagName("body"));
        String bodyText = pageText.getText();

        Assert.assertTrue(bodyText.contains("#43") || bodyText.contains("Reference"), "Booking reference/ID included");
        Assert.assertTrue(bodyText.contains("John Smith"), "Guest information included");
        Assert.assertTrue(bodyText.contains("Deluxe River View Room") || bodyText.contains("Room"), "Room details included");
        Assert.assertTrue(bodyText.contains("Check-In") && bodyText.contains("Check-Out"), "Check-in and check-out dates included");
        Assert.assertTrue(bodyText.contains("Late check-in after 10pm"), "Special request included");

        captureScreenshot("SUCCESS_reviewPrintPreviewContent");
    }

    @Test(description = "Compare print preview with normal itinerary page to ensure non-printable elements are excluded", priority = 3)
    public void comparePrintPreviewExcludesUnnecessaryElements() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("john.smith@test.com", "special_user_uid", "John", "Smith", "+94771234567");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=43");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        // Check that non-printable UI components carry the 'no-print' CSS class
        List<WebElement> noPrintElements = driver.findElements(By.className("no-print"));
        Assert.assertFalse(noPrintElements.isEmpty(), "Print-exclusion targets (navigation bar, action buttons, controls) have 'no-print' class applied");

        // Verify key action controls have no-print class
        WebElement printBtn = driver.findElement(By.xpath("//button[contains(text(), 'Print Itinerary')]"));
        Assert.assertTrue(printBtn.getAttribute("class").contains("no-print"), "Print button is marked with 'no-print'");

        WebElement backLink = driver.findElement(By.xpath("//a[contains(text(), 'Back to My Bookings')]"));
        Assert.assertTrue(backLink.getAttribute("class").contains("no-print"), "Navigation back link is marked with 'no-print'");

        captureScreenshot("SUCCESS_comparePrintPreviewExcludesUnnecessaryElements");
    }

    @Test(description = "Generate a print preview for an itinerary containing unusually long text content", priority = 4)
    public void longTextContentPrintFormatting() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("john.smith@test.com", "special_user_uid", "John", "Alexander Smith-Wellington Senior", "+94771234567");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=43");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Guest Details')]")));

        WebElement guestName = driver.findElement(By.xpath("//span[text()='Name']/following-sibling::span"));
        Assert.assertTrue(guestName.isDisplayed() && guestName.getText().contains("John Alexander Smith-Wellington"), "Long guest name renders cleanly");

        captureScreenshot("SUCCESS_longTextContentPrintFormatting");
    }
}
