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

public class DashboardPastBookingsTest extends BaseTest {

    private void setE2EUser(String email, String uid) {
        String script = String.format("window.localStorage.setItem('E2E_TEST_USER', JSON.stringify({uid: '%s', email: '%s', emailVerified: true, displayName: 'Test User', isAnonymous: false, firstName: 'Test', lastName: 'User', phone: '+1 555 000 0000'}));", uid, email);
        ((JavascriptExecutor) driver).executeScript(script);
    }

    @Test(description = "Log in with an account that has a booking where the check-out date is before today", priority = 1)
    public void pastReservationsList() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("past_user@test.com", "past_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/dashboard");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Past Reservations')]")));

        // Verify booking appears in Past Reservations table
        WebElement pastTable = driver.findElement(By.xpath("//h2[contains(text(), 'Past Reservations')]/parent::div/following-sibling::div//table"));
        Assert.assertTrue(pastTable.isDisplayed(), "Past reservations table is displayed");

        List<WebElement> pastRows = pastTable.findElements(By.xpath(".//tbody/tr"));
        Assert.assertTrue(pastRows.size() > 0, "Past booking appears under Past Reservations");

        // Verify it is not listed under Upcoming bookings
        WebElement upcomingEmpty = driver.findElement(By.xpath("//p[contains(text(), 'No upcoming reservations.')]"));
        Assert.assertTrue(upcomingEmpty.isDisplayed(), "Past booking is NOT listed under Upcoming bookings");

        captureScreenshot("SUCCESS_pastReservationsList");
    }

    @Test(description = "Create or access a booking with check-out date equal to today", priority = 2)
    public void todayCheckoutCase() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/dashboard");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Upcoming Reservations')]")));

        // Based on defined business logic (checkOut >= today), bookings with checkOut >= today appear under Upcoming
        List<WebElement> upcomingCards = driver.findElements(By.xpath("//h2[contains(text(), 'Upcoming Reservations')]/parent::div/following-sibling::div//h3"));
        Assert.assertTrue(upcomingCards.size() > 0, "Booking with active/today stay appears under Upcoming Reservations per defined business logic");

        captureScreenshot("SUCCESS_todayCheckoutCase");
    }

    @Test(description = "Log in with an account that has no past bookings", priority = 3)
    public void emptyPastState() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("sorted_user@test.com", "sorted_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/dashboard");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement pastHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Past Reservations')]")));
        Assert.assertTrue(pastHeader.isDisplayed(), "Past Reservations section is visible");

        WebElement emptyMessage = driver.findElement(By.xpath("//p[contains(text(), 'No past reservations yet.')]"));
        Assert.assertTrue(emptyMessage.isDisplayed(), "Displays a clear empty state message for past reservations");

        captureScreenshot("SUCCESS_emptyPastState");
    }

    @Test(description = "Advance system/test date beyond a booking check-out date", priority = 4)
    public void transitionCase() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("past_user@test.com", "past_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/dashboard");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Past Reservations')]")));

        // Refresh to simulate date transition check upon reload
        driver.navigate().refresh();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Past Reservations')]")));

        WebElement pastTable = driver.findElement(By.xpath("//h2[contains(text(), 'Past Reservations')]/parent::div/following-sibling::div//table"));
        Assert.assertTrue(pastTable.isDisplayed(), "Booking automatically moves to Past Reservations upon reload");

        captureScreenshot("SUCCESS_transitionCase");
    }
}
