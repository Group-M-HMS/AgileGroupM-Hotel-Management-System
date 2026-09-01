package com.nibm2.tests.admin.kpi;

import com.nibm2.base.BaseTest;
import com.nibm2.config.ConfigReader;
import com.nibm2.pages.LoginPage;
import com.nibm2.pages.admin.AdminDashboardPage;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
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
import java.util.List;

/**
 * =============================================================================
 * Test Automation Suite: TC-04 | Live activity stream & urgent guest request panel
 * Jira Key: NIBM2-643 | User Story: NIBM2-560
 * Test Set: NIBM2-635 (Admin KPI Dashboard & Live Operational Stream)
 * Test Plan: NIBM2-634 | Test Execution: NIBM2-661
 * =============================================================================
 *
 * Steps mapped 1-to-1 with Xray Test Steps:
 * 1. Navigate to the Admin Dashboard and locate the live activity stream panel
 * 2. Observe recent operational events in the live activity stream
 * 3. Observe urgent guest request panel / priority alert indicators
 * 4. Scroll through activity log entries in reverse chronological order
 */
public class AdminLiveActivityStreamTest extends BaseTest {

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
            String dir = "test-output/screenshots/TC-04";
            Files.createDirectories(Paths.get(dir));
            org.openqa.selenium.TakesScreenshot ts = (org.openqa.selenium.TakesScreenshot) driver;
            File src = ts.getScreenshotAs(org.openqa.selenium.OutputType.FILE);
            File dest = new File(dir, stepName + ".png");
            Files.copy(src.toPath(), dest.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            System.out.println("TC-04 Screenshot saved: " + dest.getAbsolutePath());
        } catch (Exception e) {
            System.err.println("Error saving TC-04 screenshot: " + e.getMessage());
        }
    }

    @Test(description = "Execute All 4 Steps for TC-04: Live Activity Stream & Urgent Alerts Panel", priority = 1)
    public void testLiveActivityStreamAndUrgentRequestsFlow() {
        // =====================================================================
        // STEP 1: Navigate to Admin Dashboard and locate live activity stream trigger/panel
        // =====================================================================
        performAdminLogin();

        AdminDashboardPage dashboardPage = new AdminDashboardPage(driver);
        dashboardPage.open(adminUrl);
        waitForDashboardToLoad();

        WebElement activityBtn = null;
        try {
            activityBtn = driver.findElement(By.xpath("//button[contains(., 'Activity & alerts') or contains(., 'Activity')]"));
            highlightElement(activityBtn, "#3b82f6", "rgba(59, 130, 246, 0.8)");
        } catch (Exception e) {
            try {
                activityBtn = driver.findElement(By.xpath("//a[contains(., 'Activity & Alerts') or contains(@href, 'activity')]"));
                highlightElement(activityBtn, "#3b82f6", "rgba(59, 130, 246, 0.8)");
            } catch (Exception ignored) {}
        }

        saveStepScreenshot("Step1_ActivityStreamPanelVisible");
        Assert.assertTrue(activityBtn != null || driver.getPageSource().contains("Activity"),
                "Activity and alerts trigger/panel is visible on dashboard");

        if (activityBtn != null) {
            clearHighlight(activityBtn);
        }

        // =====================================================================
        // STEP 2: Open / Observe live operational activity events stream
        // =====================================================================
        try {
            if (activityBtn != null) {
                activityBtn.click();
                try { Thread.sleep(2000); } catch (Exception ignored) {}
            }
        } catch (Exception e) {
            try {
                driver.get(BASE_URL + "/admin/activity");
                waitForDashboardToLoad();
            } catch (Exception ignored) {}
        }

        // Look for stream panel or notification container
        WebElement streamContainer = null;
        try {
            streamContainer = driver.findElement(By.xpath("//div[contains(@class, 'drawer') or contains(@class, 'modal') or contains(@class, 'panel') or contains(., 'Activity')][last()]"));
            if (streamContainer != null) {
                highlightElement(streamContainer, "#10b981", "rgba(16, 185, 129, 0.7)");
            }
        } catch (Exception ignored) {}

        saveStepScreenshot("Step2_LiveActivityStreamEvents");

        if (streamContainer != null) {
            clearHighlight(streamContainer);
        }

        // =====================================================================
        // STEP 3: Observe urgent guest requests / alert priority treatments
        // =====================================================================
        WebElement urgentAlertsSection = null;
        try {
            urgentAlertsSection = driver.findElement(By.xpath("//*[contains(text(), 'Alert') or contains(text(), 'Urgent') or contains(text(), 'Pending')]/ancestor::div[1]"));
            if (urgentAlertsSection != null) {
                highlightElement(urgentAlertsSection, "#f59e0b", "rgba(245, 158, 11, 0.8)");
            }
        } catch (Exception ignored) {}

        saveStepScreenshot("Step3_UrgentGuestRequestsPanel");

        if (urgentAlertsSection != null) {
            clearHighlight(urgentAlertsSection);
        }

        // =====================================================================
        // STEP 4: Scroll through activity log entries (reverse chronological order)
        // =====================================================================
        try {
            JavascriptExecutor js = (JavascriptExecutor) driver;
            js.executeScript("window.scrollBy(0, 300);");
            try { Thread.sleep(1200); } catch (Exception ignored) {}
        } catch (Exception ignored) {}

        saveStepScreenshot("Step4_ScrollActivityLogEntries");
    }
}
