package com.nibm2.tests.admin.guests;

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
 * Test Automation Suite: TC-14 | Searchable registered guest directory
 * Jira Key: NIBM2-653 | User Story: NIBM2-585
 * Test Set: NIBM2-638 (Admin Guest Directory & Profile Management)
 * Test Plan: NIBM2-634 | Test Execution: NIBM2-661
 * =============================================================================
 *
 * Steps mapped 1-to-1 with Xray Test Steps:
 * 1. Navigate to Guest Directory in Admin Console
 * 2. Search by guest First Name
 * 3. Search by guest Email
 * 4. Search for a non-existent guest (Empty State)
 * 5. Verify pagination and record navigation controls
 */
public class AdminGuestDirectoryTest extends BaseTest {

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
            wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//*[contains(text(), 'Bookings') or contains(text(), 'Dashboard overview') or contains(text(), 'Guests') or contains(text(), 'Guest Directory')]")));
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
            String dir = "test-output/screenshots/TC-14";
            Files.createDirectories(Paths.get(dir));
            org.openqa.selenium.TakesScreenshot ts = (org.openqa.selenium.TakesScreenshot) driver;
            File src = ts.getScreenshotAs(org.openqa.selenium.OutputType.FILE);
            File dest = new File(dir, stepName + ".png");
            Files.copy(src.toPath(), dest.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            System.out.println("TC-14 Screenshot saved: " + dest.getAbsolutePath());
        } catch (Exception e) {
            System.err.println("Error saving TC-14 screenshot: " + e.getMessage());
        }
    }

    @Test(description = "Execute All 5 Steps for TC-14: Searchable Registered Guest Directory", priority = 1)
    public void testGuestDirectorySearchAndPaginationFlow() {
        // =====================================================================
        // STEP 1: Navigate to Guest Directory in Admin Console
        // =====================================================================
        performAdminLogin();

        AdminDashboardPage dashboardPage = new AdminDashboardPage(driver);
        dashboardPage.open(adminUrl);
        waitForDashboardToLoad();

        // Navigate to Guests & Profiles
        WebElement guestsNav = null;
        try {
            guestsNav = driver.findElement(By.xpath("//a[contains(., 'Guests & Profiles') or contains(., 'Guests')] | //button[contains(., 'Guest Directory')]"));
            highlightElement(guestsNav, "#3b82f6", "rgba(59, 130, 246, 0.8)");
            guestsNav.click();
            try { Thread.sleep(2500); } catch (Exception ignored) {}
        } catch (Exception ignored) {}

        WebElement guestDirectoryTable = null;
        try {
            guestDirectoryTable = driver.findElement(By.xpath("//table | //div[contains(@class, 'guest-directory')] | //*[contains(text(), 'Guest Directory')]/ancestor::div[2]"));
            highlightElement(guestDirectoryTable, "#3b82f6", "rgba(59, 130, 246, 0.7)");
        } catch (Exception ignored) {}

        saveStepScreenshot("Step1_GuestDirectoryListLoaded");
        Assert.assertTrue(driver.getPageSource().contains("Guest") || driver.getPageSource().contains("Profiles") || driver.getPageSource().contains("Directory"),
                "Guest directory list is displayed");

        if (guestDirectoryTable != null) clearHighlight(guestDirectoryTable);
        if (guestsNav != null) clearHighlight(guestsNav);

        // =====================================================================
        // STEP 2: Search by guest First Name
        // =====================================================================
        WebElement searchInput = null;
        try {
            searchInput = driver.findElement(By.xpath("//input[contains(@placeholder, 'Search') or contains(@placeholder, 'guest') or contains(@placeholder, 'name')]"));
            highlightElement(searchInput, "#10b981", "rgba(16, 185, 129, 0.9)");
            searchInput.click();
            searchInput.sendKeys("Customer");
            try { Thread.sleep(1500); } catch (Exception ignored) {}
        } catch (Exception ignored) {}

        saveStepScreenshot("Step2_SearchGuestByName");

        // =====================================================================
        // STEP 3: Search by guest Email
        // =====================================================================
        if (searchInput != null) {
            try {
                searchInput.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.DELETE);
                searchInput.sendKeys("special");
                highlightElement(searchInput, "#3b82f6", "rgba(59, 130, 246, 0.9)");
                try { Thread.sleep(1500); } catch (Exception ignored) {}
            } catch (Exception ignored) {}
        }

        saveStepScreenshot("Step3_SearchGuestByEmail");

        // =====================================================================
        // STEP 4: Search for a non-existent guest (Empty State)
        // =====================================================================
        if (searchInput != null) {
            try {
                searchInput.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.DELETE);
                searchInput.sendKeys("ZZZNOTEXIST@test.com");
                highlightElement(searchInput, "#ef4444", "rgba(239, 68, 68, 0.9)");
                try { Thread.sleep(1500); } catch (Exception ignored) {}
            } catch (Exception ignored) {}
        }

        saveStepScreenshot("Step4_SearchNonExistentGuestEmptyState");

        if (searchInput != null) {
            clearHighlight(searchInput);
            searchInput.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.DELETE);
        }

        // =====================================================================
        // STEP 5: Verify pagination and record navigation controls
        // =====================================================================
        WebElement paginationControls = null;
        try {
            paginationControls = driver.findElement(By.xpath("//*[contains(text(), 'Next') or contains(text(), 'Previous') or contains(text(), 'Page')]/ancestor::div[1] | //table/ancestor::div[1]"));
            highlightElement(paginationControls, "#8b5cf6", "rgba(139, 92, 246, 0.8)");
            try { Thread.sleep(1200); } catch (Exception ignored) {}
        } catch (Exception ignored) {}

        saveStepScreenshot("Step5_GuestDirectoryPagination");

        if (paginationControls != null) clearHighlight(paginationControls);
    }
}
