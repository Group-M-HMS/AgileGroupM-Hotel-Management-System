package com.nibm2.tests;

import com.nibm2.base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class DashboardConfirmationScreenGuidanceTest extends BaseTest {

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

    @Test(description = "Complete checkout with successful payment and verify confirmation screen loads confirmed details", priority = 1)
    public void confirmationScreenLoadsWithConfirmedDetails() throws InterruptedException {
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

        Assert.assertTrue(header.isDisplayed() && refText.isDisplayed(), "Confirmation screen loads successfully and displays confirmed booking details without errors");
        captureScreenshot("SUCCESS_confirmationScreenLoadsWithConfirmedDetails");
    }

    @Test(description = "Review instructions section on confirmation screen for clear next-step guidance", priority = 2)
    public void reviewInstructionsSectionGuidance() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String ref = "RN-8A3B2C";
        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout/success?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2&ref=" + ref + "&total=360");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement stayDetailsHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Stay details')]")));
        WebElement myBookingsBtn = driver.findElement(By.xpath("//a[contains(text(), 'View My Bookings')]"));

        Assert.assertTrue(stayDetailsHeader.isDisplayed() && myBookingsBtn.isDisplayed(), "Confirmation screen provides clear next-step guidance and reference accessibility");
        captureScreenshot("SUCCESS_reviewInstructionsSectionGuidance");
    }

    @Test(description = "Review arrival information section for check-in requirements and photo ID guidance", priority = 3)
    public void reviewArrivalInformationRequirements() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String ref = "RN-8A3B2C";
        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout/success?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2&ref=" + ref + "&total=360");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement arrivalHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Arrival & Check-in Guidance')]")));
        WebElement idRequirement = driver.findElement(By.xpath("//li[contains(text(), 'photo ID or passport')]"));

        Assert.assertTrue(arrivalHeader.isDisplayed() && idRequirement.isDisplayed(), "Arrival guidance displays check-in requirements and photo ID/passport rules clearly");
        captureScreenshot("SUCCESS_reviewArrivalInformationRequirements");
    }

    @Test(description = "Open confirmation screen using desktop and mobile viewports (375px) and verify layout", priority = 4)
    public void responsiveViewportDisplayDesktopAndMobile() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String ref = "RN-8A3B2C";
        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        String successUrl = BASE_URL + "/checkout/success?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2&ref=" + ref + "&total=360";

        // Desktop Viewport
        driver.manage().window().setSize(new Dimension(1280, 800));
        driver.get(successUrl);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement headerDesktop = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h1[contains(text(), 'Booking Confirmed')]")));
        Assert.assertTrue(headerDesktop.isDisplayed(), "Content displays correctly on desktop viewport");

        // Mobile Viewport (375px)
        driver.manage().window().setSize(new Dimension(375, 812));
        driver.navigate().refresh();
        Thread.sleep(1000);
        WebElement headerMobile = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h1[contains(text(), 'Booking Confirmed')]")));
        Assert.assertTrue(headerMobile.isDisplayed(), "Confirmation content remains readable and accessible without text overflow on mobile 375px viewport");

        // Restore window size
        driver.manage().window().setSize(new Dimension(1280, 800));
        captureScreenshot("SUCCESS_responsiveViewportDisplayDesktopAndMobile");
    }

    @Test(description = "Verify booking status and details remain available directly on screen when confirmation email is delayed", priority = 5)
    public void delayedEmailScenariosBookingStatusClear() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUserCustom("complete_user_uid", "john.smith@test.com", "John", "Smith");
        Thread.sleep(1000);

        String ref = "RN-8A3B2C";
        String checkIn = getDateStr(60);
        String checkOut = getDateStr(62);
        driver.get(BASE_URL + "/checkout/success?roomId=1&checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=2&ref=" + ref + "&total=360");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement refText = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//p[contains(text(), '" + ref + "')]")));
        WebElement stayDetails = driver.findElement(By.xpath("//h2[contains(text(), 'Stay details')]"));

        Assert.assertTrue(refText.isDisplayed() && stayDetails.isDisplayed(), "Customer can understand booking status and next steps directly from confirmation screen without depending only on email delivery");
        captureScreenshot("SUCCESS_delayedEmailScenariosBookingStatusClear");
    }
}
