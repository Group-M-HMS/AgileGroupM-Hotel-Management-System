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

public class DashboardUpcomingBookingsTest extends BaseTest {

    private void setE2EUser(String email, String uid) {
        String script = String.format("window.localStorage.setItem('E2E_TEST_USER', JSON.stringify({uid: '%s', email: '%s', emailVerified: true, displayName: 'Test User', isAnonymous: false, firstName: 'Test', lastName: 'User', phone: '+1 555 000 0000'}));", uid, email);
        ((JavascriptExecutor) driver).executeScript(script);
    }

    private String getFutureDate(int daysToAdd) {
        return LocalDate.now().plusDays(daysToAdd).format(DateTimeFormatter.ISO_LOCAL_DATE);
    }
    
    private String getPastDate(int daysToSubtract) {
        return LocalDate.now().minusDays(daysToSubtract).format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    @Test(description = "Log in with an account that has 3 or more upcoming bookings created in non-chronological order", priority = 1)
    public void bookingsAreSortedByDate() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("sorted_user@test.com", "sorted_user_uid");
        Thread.sleep(1000);
        
        driver.get(BASE_URL + "/dashboard");
        
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Upcoming Reservations')]")));
        
        List<WebElement> roomNames = driver.findElements(By.xpath("//p[text()='Room']/parent::div/following-sibling::h3"));
        Assert.assertEquals(roomNames.size(), 3, "There should be 3 reservations");
        
        // Expected check-in order: Room 1 (in 10 days), Room 2 (in 20 days), Room 3 (in 30 days)
        String date10 = LocalDate.now().plusDays(10).format(DateTimeFormatter.ofPattern("MMM d, yyyy"));
        String date20 = LocalDate.now().plusDays(20).format(DateTimeFormatter.ofPattern("MMM d, yyyy"));
        String date30 = LocalDate.now().plusDays(30).format(DateTimeFormatter.ofPattern("MMM d, yyyy"));
        
        List<WebElement> stayDates = driver.findElements(By.xpath("//p[text()='Stay Dates']/parent::div/following-sibling::h3"));
        
        Assert.assertTrue(stayDates.get(0).getText().contains(date10), "First reservation should be in 10 days");
        Assert.assertTrue(stayDates.get(1).getText().contains(date20), "Second reservation should be in 20 days");
        Assert.assertTrue(stayDates.get(2).getText().contains(date30), "Third reservation should be in 30 days");
        
        captureScreenshot("SUCCESS_bookingsAreSortedByDate");
    }

    @Test(description = "Inspect a reservation item in the list", priority = 2)
    public void reservationItemShowsDetails() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("details_user@test.com", "details_user_uid");
        Thread.sleep(1000);
        
        driver.get(BASE_URL + "/dashboard");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Upcoming Reservations')]")));
        
        WebElement roomName = driver.findElement(By.xpath("//p[text()='Room']/parent::div/following-sibling::h3"));
        Assert.assertFalse(roomName.getText().isEmpty(), "Room details are visible");
        
        WebElement stayDates = driver.findElement(By.xpath("//p[text()='Stay Dates']/parent::div/following-sibling::h3"));
        Assert.assertTrue(stayDates.getText().contains("–") || stayDates.getText().contains("-"), "Stay dates are visible");
        
        WebElement bookingId = driver.findElement(By.xpath("//p[text()='Booking ID']/following-sibling::h3"));
        Assert.assertTrue(bookingId.getText().startsWith("#"), "Booking reference is visible");

        // Click 'View Itinerary' to inspect full itinerary details
        WebElement viewItineraryBtn = driver.findElement(By.xpath("//a[contains(text(), 'View Itinerary')]"));
        viewItineraryBtn.click();

        wait.until(ExpectedConditions.urlContains("/manage-booking/itinerary"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//span[contains(text(), 'Stay Details')] | //h1")));

        captureScreenshot("SUCCESS_reservationItemShowsDetails");
    }

    @Test(description = "Log in with an account that has no upcoming reservations", priority = 3)
    public void emptyStateForNoUpcomingReservations() throws InterruptedException {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        setE2EUser("past_user@test.com", "past_user_uid");
        Thread.sleep(1000);

        driver.get(BASE_URL + "/dashboard");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        
        WebElement sectionTitle = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Upcoming Reservations')]")));
        Assert.assertTrue(sectionTitle.isDisplayed(), "Upcoming Reservations section is visible");
        
        WebElement upcomingEmpty = driver.findElement(By.xpath("//p[contains(text(), 'No upcoming reservations.')]"));
        Assert.assertTrue(upcomingEmpty.isDisplayed(), "Displays a clear empty state message in the Upcoming section");
        
        captureScreenshot("SUCCESS_emptyStateForNoUpcomingReservations");
    }
}
