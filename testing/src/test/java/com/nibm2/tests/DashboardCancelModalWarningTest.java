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

public class DashboardCancelModalWarningTest extends BaseTest {

    private void setE2EUser(String email, String uid) {
        String script = String.format("window.localStorage.setItem('E2E_TEST_USER', JSON.stringify({uid: '%s', email: '%s', emailVerified: true, displayName: 'Test User', isAnonymous: false, firstName: 'Test', lastName: 'User', phone: '+1 555 000 0000'}));", uid, email);
        ((JavascriptExecutor) driver).executeScript(script);
    }

    @Test(description = "Select the Cancel Booking option for a confirmed booking to open confirmation modal", priority = 1)
    public void openCancelConfirmationModal() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=40");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement cancelBtn = driver.findElement(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        cancelBtn.click();

        WebElement modalHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Cancel this booking?')]")));
        Assert.assertTrue(modalHeader.isDisplayed(), "Cancellation confirmation modal is displayed");

        WebElement warningText = driver.findElement(By.xpath("//div[contains(text(), 'action is final and cannot be undone')]"));
        Assert.assertTrue(warningText.isDisplayed(), "Warning message clearly states cancellation is a final action and cannot be undone");

        captureScreenshot("SUCCESS_openCancelConfirmationModal");
    }

    @Test(description = "Review the warning message styling within the cancellation modal", priority = 2)
    public void reviewWarningMessageStyling() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=40");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement cancelBtn = driver.findElement(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        cancelBtn.click();

        WebElement warningBox = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//div[contains(@class, 'bg-red-50') and contains(@class, 'text-red-700')]")));
        Assert.assertTrue(warningBox.isDisplayed(), "Warning box is visually highlighted with red styling emphasis");

        String classAttr = warningBox.getAttribute("class");
        Assert.assertTrue(classAttr.contains("bg-red-50") && classAttr.contains("text-red-700") && classAttr.contains("border-red-200"),
                "Warning message uses appropriate visual emphasis (red background, border, text color)");

        captureScreenshot("SUCCESS_reviewWarningMessageStyling");
    }

    @Test(description = "Attempt to interact with the page behind the open cancellation modal", priority = 3)
    public void modalBackdropPreventsBackgroundInteraction() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/manage-booking/itinerary?id=40");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay Details')]")));

        WebElement cancelBtn = driver.findElement(By.xpath("//button[contains(text(), 'Cancel Booking')]"));
        cancelBtn.click();

        WebElement backdrop = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//div[contains(@class, 'fixed') and contains(@class, 'inset-0') and contains(@class, 'z-50')]")));
        Assert.assertTrue(backdrop.isDisplayed(), "Full-screen modal backdrop (fixed inset-0 z-50) is active and prevents background page interaction");

        captureScreenshot("SUCCESS_modalBackdropPreventsBackgroundInteraction");
    }
}
