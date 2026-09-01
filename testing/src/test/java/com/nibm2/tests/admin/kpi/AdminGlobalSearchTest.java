package com.nibm2.tests.admin.kpi;

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
 * Test Automation Suite: TC-03 | Global search bar & quick reservation button
 * Jira Key: NIBM2-642 | User Story: NIBM2-559
 * Test Set: NIBM2-635 (Admin KPI Dashboard & Live Operational Stream)
 * Test Plan: NIBM2-634 | Test Execution: NIBM2-661
 * =============================================================================
 *
 * Steps mapped 1-to-1 with Xray Test Steps:
 * 1. Navigate to Admin Console and locate global search bar in header
 * 2. Type a guest name into the search bar (filter / search results)
 * 3. Type a booking reference / room number into search bar
 * 4. Search for a term that doesn't exist ("ZZZZINVALIDQUERY")
 * 5. Click the Quick Reservation button in header ("+ New Walk-in Booking")
 */
public class AdminGlobalSearchTest extends BaseTest {

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

        LoginPage loginPage = new LoginPage(driver);
        loginPage.fillForm(adminEmail, adminPassword);
        loginPage.submit();

        // Wait for Firebase auth & redirect
        try { Thread.sleep(4000); } catch (Exception ignored) {}
    }

    private void waitForDashboardToLoad() {
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
            wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//*[text()='Loading...']")));
        } catch (Exception ignored) {}

        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
            wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//*[contains(text(), 'Live room status') or contains(text(), 'Dashboard overview')]")));
        } catch (Exception ignored) {}

        try { Thread.sleep(2000); } catch (Exception ignored) {}
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
            String dir = "test-output/screenshots/TC-03";
            Files.createDirectories(Paths.get(dir));
            org.openqa.selenium.TakesScreenshot ts = (org.openqa.selenium.TakesScreenshot) driver;
            File src = ts.getScreenshotAs(org.openqa.selenium.OutputType.FILE);
            File dest = new File(dir, stepName + ".png");
            Files.copy(src.toPath(), dest.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            System.out.println("TC-03 Screenshot saved: " + dest.getAbsolutePath());
        } catch (Exception e) {
            System.err.println("Error saving TC-03 screenshot: " + e.getMessage());
        }
    }

    @Test(description = "Execute All 5 Steps for TC-03: Global Header Search & Quick Walk-In Reservation", priority = 1)
    public void testGlobalSearchAndQuickReservationFlow() {
        // =====================================================================
        // STEP 1: Navigate to Admin Console and locate global search bar in header
        // =====================================================================
        performAdminLogin();

        AdminDashboardPage dashboardPage = new AdminDashboardPage(driver);
        dashboardPage.open(adminUrl);
        waitForDashboardToLoad();

        WebElement searchInput = null;
        try {
            searchInput = driver.findElement(By.xpath("//input[contains(@placeholder, 'Search rooms') or contains(@placeholder, 'Search') or @type='search']"));
            highlightElement(searchInput, "#3b82f6", "rgba(59, 130, 246, 0.7)");
        } catch (Exception e) {
            System.err.println("Could not locate header search input: " + e.getMessage());
        }

        saveStepScreenshot("Step1_HeaderSearchBarVisible");
        Assert.assertNotNull(searchInput, "Global search input exists in the header");

        if (searchInput != null) {
            clearHighlight(searchInput);
        }

        // =====================================================================
        // STEP 2: Type a guest name into the search bar
        // =====================================================================
        if (searchInput != null) {
            searchInput.click();
            searchInput.clear();
            searchInput.sendKeys("John");
            try { Thread.sleep(1500); } catch (Exception ignored) {}
            highlightElement(searchInput, "#10b981", "rgba(16, 185, 129, 0.7)");
        }

        saveStepScreenshot("Step2_SearchByGuestName");

        if (searchInput != null) {
            clearHighlight(searchInput);
        }

        // =====================================================================
        // STEP 3: Type a booking reference / room number into search bar
        // =====================================================================
        if (searchInput != null) {
            searchInput.click();
            searchInput.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.DELETE);
            searchInput.sendKeys("301");
            try { Thread.sleep(1500); } catch (Exception ignored) {}
            highlightElement(searchInput, "#8b5cf6", "rgba(139, 92, 246, 0.7)");
        }

        saveStepScreenshot("Step3_SearchByBookingReference");

        if (searchInput != null) {
            clearHighlight(searchInput);
        }

        // =====================================================================
        // STEP 4: Search for a term that doesn't exist ("ZZZZINVALIDQUERY")
        // =====================================================================
        if (searchInput != null) {
            searchInput.click();
            searchInput.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.DELETE);
            searchInput.sendKeys("ZZZZINVALIDQUERY");
            try { Thread.sleep(1500); } catch (Exception ignored) {}
            highlightElement(searchInput, "#ef4444", "rgba(239, 68, 68, 0.7)");
        }

        saveStepScreenshot("Step4_SearchInvalidQueryNoResults");

        if (searchInput != null) {
            clearHighlight(searchInput);
            searchInput.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.DELETE);
        }

        // =====================================================================
        // STEP 5: Click the Quick Reservation button in the header
        // =====================================================================
        WebElement quickBookingBtn = null;
        try {
            quickBookingBtn = driver.findElement(By.xpath("//button[contains(., 'Walk-in Booking') or contains(., 'Reservation') or contains(., 'New Booking')]"));
            highlightElement(quickBookingBtn, "#059669", "rgba(5, 150, 105, 0.8)");
            quickBookingBtn.click();
            try { Thread.sleep(2000); } catch (Exception ignored) {}
        } catch (Exception e) {
            System.err.println("Could not click quick reservation button: " + e.getMessage());
        }

        saveStepScreenshot("Step5_QuickReservationModalOpened");
    }
}
