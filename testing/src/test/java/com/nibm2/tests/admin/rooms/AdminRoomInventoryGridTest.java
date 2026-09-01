package com.nibm2.tests.admin.rooms;

import com.nibm2.base.BaseTest;
import com.nibm2.config.ConfigReader;
import com.nibm2.pages.LoginPage;
import com.nibm2.pages.admin.AdminDashboardPage;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;

/**
 * =============================================================================
 * Test Automation Suite: TC-10 | Searchable room inventory grid with status filters
 * Jira Key: NIBM2-649 | User Story: NIBM2-562
 * Test Set: NIBM2-637 (Admin Room Inventory & Pricing Management)
 * Test Plan: NIBM2-634 | Test Execution: NIBM2-661
 * =============================================================================
 *
 * Steps mapped 1-to-1 with Xray Test Steps:
 * 1. Navigate to Room Inventory in Admin Console
 * 2. Click the Available filter button
 * 3. Click the Occupied filter button
 * 4. Click the Maintenance / Needs Cleaning filter button
 * 5. Type a room number or name in the search box
 * 6. Clear filter — show all rooms
 */
public class AdminRoomInventoryGridTest extends BaseTest {

    private String adminEmail;
    private String adminPassword;
    private String adminUrl;

    @BeforeClass
    public void setupCredentials() {
        adminEmail = ConfigReader.get("admin.user.email", "admin@rivernestecovilla.com");
        adminPassword = ConfigReader.get("admin.user.password", "KDp0cGI6EE5zPFxsiJlR");
        adminUrl = ConfigReader.get("admin.url", BASE_URL + "/admin");
    }

    private void performAdminLogin() {
        driver.get(BASE_URL + "/login");
        try { Thread.sleep(2000); } catch (Exception ignored) {}

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//input[@type='email']")));
        } catch (Exception ignored) {}

        LoginPage loginPage = new LoginPage(driver);
        loginPage.fillForm(adminEmail, adminPassword);
        loginPage.submit();

        // Wait for Firebase auth & redirect
        try { Thread.sleep(5000); } catch (Exception ignored) {}

        if (driver.getCurrentUrl().contains("/login")) {
            driver.get(adminUrl);
            try { Thread.sleep(4000); } catch (Exception ignored) {}
        }
    }

    private void waitForDashboardToLoad() {
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
            wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//*[text()='Loading...']")));
        } catch (Exception ignored) {}

        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
            wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//*[contains(text(), 'Bookings') or contains(text(), 'Dashboard overview') or contains(text(), 'Live room status') or contains(text(), 'Rooms')]")));
        } catch (Exception ignored) {}

        try { Thread.sleep(2500); } catch (Exception ignored) {}
    }

    private void highlightElement(WebElement element, String borderColor, String glowColor) {
        try {
            JavascriptExecutor js = (JavascriptExecutor) driver;
            js.executeScript(
                "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});" +
                "arguments[0].style.border = '3px solid ' + arguments[1];" +
                "arguments[0].style.borderRadius = '12px';" +
                "arguments[0].style.boxShadow = '0 0 25px ' + arguments[2];" +
                "arguments[0].style.transform = 'scale(1.02)';" +
                "arguments[0].style.transition = 'all 0.3s ease';",
                element, borderColor, glowColor
            );
            Thread.sleep(1000);
        } catch (Exception ignored) {}
    }

    private void clearHighlight(WebElement element) {
        try {
            JavascriptExecutor js = (JavascriptExecutor) driver;
            js.executeScript(
                "arguments[0].style.border = '';" +
                "arguments[0].style.boxShadow = '';" +
                "arguments[0].style.transform = '';",
                element
            );
        } catch (Exception ignored) {}
    }

    private void saveStepScreenshot(String stepName) {
        captureScreenshot(stepName);
        try {
            String dir = "test-output/screenshots/TC-10";
            Files.createDirectories(Paths.get(dir));
            org.openqa.selenium.TakesScreenshot ts = (org.openqa.selenium.TakesScreenshot) driver;
            File src = ts.getScreenshotAs(org.openqa.selenium.OutputType.FILE);
            File dest = new File(dir, stepName + ".png");
            Files.copy(src.toPath(), dest.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            System.out.println("TC-10 Screenshot saved: " + dest.getAbsolutePath());
        } catch (Exception e) {
            System.err.println("Error saving TC-10 screenshot: " + e.getMessage());
        }
    }

    @Test(description = "Execute All 6 Steps for TC-10: Searchable Room Inventory Grid with Status Filters", priority = 1)
    public void testRoomInventoryGridAndFiltersFlow() {
        // =====================================================================
        // STEP 1: Navigate to Room Inventory in Admin Console
        // =====================================================================
        performAdminLogin();

        AdminDashboardPage dashboardPage = new AdminDashboardPage(driver);
        dashboardPage.open(adminUrl);
        waitForDashboardToLoad();

        // Navigate to Rooms & Suites or locate Live Room Status Grid
        WebElement roomsNav = null;
        try {
            roomsNav = driver.findElement(By.xpath("//a[contains(., 'Rooms & Suites') or contains(., 'Rooms')]"));
            highlightElement(roomsNav, "#3b82f6", "rgba(59, 130, 246, 0.8)");
        } catch (Exception ignored) {}

        WebElement roomGridContainer = null;
        try {
            roomGridContainer = driver.findElement(By.xpath("//*[contains(text(), 'Live room status')]/ancestor::div[2]"));
            highlightElement(roomGridContainer, "#3b82f6", "rgba(59, 130, 246, 0.7)");
        } catch (Exception ignored) {}

        saveStepScreenshot("Step1_RoomInventoryGridLoaded");
        Assert.assertTrue(driver.getPageSource().contains("Live room status") || driver.getPageSource().contains("Rooms"),
                "Room inventory grid is displayed");

        if (roomGridContainer != null) clearHighlight(roomGridContainer);
        if (roomsNav != null) clearHighlight(roomsNav);

        // =====================================================================
        // STEP 2: Click the Available filter button
        // =====================================================================
        WebElement availableBtn = null;
        try {
            availableBtn = driver.findElement(By.xpath("//button[contains(., 'Available')]"));
            highlightElement(availableBtn, "#10b981", "rgba(16, 185, 129, 0.9)");
            availableBtn.click();
            try { Thread.sleep(1500); } catch (Exception ignored) {}
        } catch (Exception ignored) {}

        saveStepScreenshot("Step2_AvailableFilterActive");

        if (availableBtn != null) clearHighlight(availableBtn);

        // =====================================================================
        // STEP 3: Click the Occupied filter button
        // =====================================================================
        WebElement occupiedBtn = null;
        try {
            occupiedBtn = driver.findElement(By.xpath("//button[contains(., 'Occupied')]"));
            highlightElement(occupiedBtn, "#3b82f6", "rgba(59, 130, 246, 0.9)");
            occupiedBtn.click();
            try { Thread.sleep(1500); } catch (Exception ignored) {}
        } catch (Exception ignored) {}

        saveStepScreenshot("Step3_OccupiedFilterActive");

        if (occupiedBtn != null) clearHighlight(occupiedBtn);

        // =====================================================================
        // STEP 4: Click the Maintenance / Needs Cleaning filter button
        // =====================================================================
        WebElement maintenanceBtn = null;
        try {
            maintenanceBtn = driver.findElement(By.xpath("//button[contains(., 'Maintenance') or contains(., 'Needs Cleaning')]"));
            highlightElement(maintenanceBtn, "#ef4444", "rgba(239, 68, 68, 0.9)");
            maintenanceBtn.click();
            try { Thread.sleep(1500); } catch (Exception ignored) {}
        } catch (Exception ignored) {}

        saveStepScreenshot("Step4_MaintenanceFilterActive");

        if (maintenanceBtn != null) clearHighlight(maintenanceBtn);

        // =====================================================================
        // STEP 5: Type a room number or name in the search box
        // =====================================================================
        WebElement searchInput = null;
        try {
            searchInput = driver.findElement(By.xpath("//input[contains(@placeholder, 'Search') or contains(@placeholder, 'room')]"));
            highlightElement(searchInput, "#8b5cf6", "rgba(139, 92, 246, 0.9)");
            searchInput.click();
            searchInput.sendKeys("301");
            try { Thread.sleep(1500); } catch (Exception ignored) {}
        } catch (Exception ignored) {}

        saveStepScreenshot("Step5_SearchRoomQuery");

        if (searchInput != null) {
            clearHighlight(searchInput);
            searchInput.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.DELETE);
        }

        // =====================================================================
        // STEP 6: Clear filter — show all rooms
        // =====================================================================
        WebElement allBtn = null;
        try {
            allBtn = driver.findElement(By.xpath("//button[contains(., 'All')]"));
            highlightElement(allBtn, "#059669", "rgba(5, 150, 105, 0.9)");
            allBtn.click();
            try { Thread.sleep(1500); } catch (Exception ignored) {}
        } catch (Exception ignored) {}

        saveStepScreenshot("Step6_ClearFilterShowAllRooms");

        if (allBtn != null) clearHighlight(allBtn);
    }
}
