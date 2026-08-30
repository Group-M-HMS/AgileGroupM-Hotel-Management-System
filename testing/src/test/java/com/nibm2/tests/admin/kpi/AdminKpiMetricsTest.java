package com.nibm2.tests.admin.kpi;

import com.nibm2.base.BaseTest;
import com.nibm2.config.ConfigReader;
import com.nibm2.pages.LoginPage;
import com.nibm2.pages.admin.AdminDashboardPage;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * =============================================================================
 * Test Automation Suite: TC-01 | View key metrics at top of dashboard
 * Jira Key: NIBM2-640 | User Story: NIBM2-550
 * Test Set: NIBM2-635 (Admin KPI Dashboard & Live Operational Stream)
 * Test Plan: NIBM2-634 | Test Execution: NIBM2-661
 * =============================================================================
 */
public class AdminKpiMetricsTest extends BaseTest {

    private String adminEmail;
    private String adminPassword;
    private String customerEmail;
    private String customerPassword;
    private String adminUrl;

    @BeforeClass
    public void setupCredentials() {
        adminEmail = ConfigReader.get("admin.user.email", "admin@rivernestecovilla.com");
        adminPassword = ConfigReader.get("admin.user.password", "KDp0cGI6EE5zPFxsiJlR");
        customerEmail = ConfigReader.get("customer.user.email", "customer.unauthorized@nibm2.test");
        customerPassword = ConfigReader.get("customer.user.password", "Passw0rd!23");
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

    private WebElement findSingleKpiCard(String targetKeyword, String excludeKeyword) {
        try {
            JavascriptExecutor js = (JavascriptExecutor) driver;
            return (WebElement) js.executeScript(
                "var allDivs = Array.from(document.querySelectorAll('div'));" +
                "var matching = allDivs.filter(function(d) {" +
                "  var txt = (d.innerText || '');" +
                "  return txt.includes(arguments[0]) && !txt.includes(arguments[1]);" +
                "});" +
                "matching.sort(function(a, b) { return a.innerText.length - b.innerText.length; });" +
                "return matching[0] || null;",
                targetKeyword, excludeKeyword
            );
        } catch (Exception e) {
            return null;
        }
    }

    private void applyFocusHighlight(WebElement element, String borderColor, String glowColor) {
        try {
            JavascriptExecutor js = (JavascriptExecutor) driver;
            js.executeScript(
                "arguments[0].style.border = '4px solid ' + arguments[1];" +
                "arguments[0].style.borderRadius = '16px';" +
                "arguments[0].style.boxShadow = '0 0 35px ' + arguments[2];" +
                "arguments[0].style.transform = 'scale(1.03)';" +
                "arguments[0].style.transition = 'all 0.3s ease';",
                element, borderColor, glowColor
            );
            Thread.sleep(1200);
        } catch (Exception ignored) {}
    }

    private void removeFocusHighlight(WebElement element) {
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
            String dir = "test-output/screenshots/TC-01";
            Files.createDirectories(Paths.get(dir));
            org.openqa.selenium.TakesScreenshot ts = (org.openqa.selenium.TakesScreenshot) driver;
            File src = ts.getScreenshotAs(org.openqa.selenium.OutputType.FILE);
            File dest = new File(dir, stepName + ".png");
            Files.copy(src.toPath(), dest.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            System.out.println("TC-01 Screenshot saved: " + dest.getAbsolutePath());
        } catch (Exception e) {
            System.err.println("Error saving TC-01 screenshot: " + e.getMessage());
        }
    }

    @Test(description = "Steps 1 to 5: Admin Login, Full Dashboard View, and Distinct KPI Card Focus", priority = 1)
    public void testAdminKpiDashboardMetricsSteps1to5() {
        // =====================================================================
        // STEP 1: Log in as an Admin and navigate to the Admin Dashboard
        // =====================================================================
        performAdminLogin();

        AdminDashboardPage dashboardPage = new AdminDashboardPage(driver);
        dashboardPage.open(adminUrl);
        try { Thread.sleep(3000); } catch (Exception ignored) {}

        // Capture whole overview
        saveStepScreenshot("Step1_AdminLoginAndDashboard");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin") || driver.getPageSource().contains("Dashboard overview"),
                "Admin lands on dashboard overview");

        // =====================================================================
        // STEP 2: Observe the today's revenue metric ($22,758.50)
        // =====================================================================
        WebElement revenueCard = findSingleKpiCard("REVENUE", "OCCUPANCY");
        if (revenueCard != null) {
            applyFocusHighlight(revenueCard, "#059669", "rgba(5, 150, 105, 0.8)");
        }
        saveStepScreenshot("Step2_ObserveTodayRevenue");
        if (revenueCard != null) {
            removeFocusHighlight(revenueCard);
        }

        // =====================================================================
        // STEP 3: Observe the Occupancy Rate metric (0%)
        // =====================================================================
        WebElement occupancyCard = findSingleKpiCard("OCCUPANCY", "REVENUE");
        if (occupancyCard != null) {
            applyFocusHighlight(occupancyCard, "#2563eb", "rgba(37, 99, 235, 0.8)");
        }
        saveStepScreenshot("Step3_ObserveOccupancyRate");
        if (occupancyCard != null) {
            removeFocusHighlight(occupancyCard);
        }

        // =====================================================================
        // STEP 4: Observe the Pending Check-Ins count (1 Guests / 1 Pending)
        // =====================================================================
        WebElement checkInsCard = findSingleKpiCard("CHECK-IN", "OCCUPANCY");
        if (checkInsCard != null) {
            applyFocusHighlight(checkInsCard, "#d97706", "rgba(217, 119, 6, 0.8)");
        }
        saveStepScreenshot("Step4_ObservePendingCheckIns");
        if (checkInsCard != null) {
            removeFocusHighlight(checkInsCard);
        }

        // =====================================================================
        // STEP 5: Observe the Active Resort Activities count (6 Active)
        // =====================================================================
        WebElement activitiesCard = findSingleKpiCard("EXPERIENCES", "OCCUPANCY");
        if (activitiesCard != null) {
            applyFocusHighlight(activitiesCard, "#7c3aed", "rgba(124, 58, 237, 0.8)");
        }
        saveStepScreenshot("Step5_ObserveActiveActivities");
        if (activitiesCard != null) {
            removeFocusHighlight(activitiesCard);
        }
    }

    @Test(description = "Step 6: Customer unauthorized access restriction to Admin area", priority = 2)
    public void testCustomerUnauthorizedAccessStep6() {
        // =====================================================================
        // STEP 6: Customer unauthorized access restriction
        // =====================================================================
        driver.get(BASE_URL + "/login");
        try { Thread.sleep(2000); } catch (Exception ignored) {}

        LoginPage loginPage = new LoginPage(driver);
        loginPage.fillForm(customerEmail, customerPassword);
        loginPage.submit();
        try { Thread.sleep(3000); } catch (Exception ignored) {}

        // Attempt accessing admin area directly as customer
        driver.get(adminUrl);
        try { Thread.sleep(2500); } catch (Exception ignored) {}

        saveStepScreenshot("Step6_CustomerAccessDenied");

        boolean isRestricted = !driver.getCurrentUrl().endsWith("/admin")
                || driver.getCurrentUrl().contains("/login")
                || driver.getCurrentUrl().contains("/dashboard")
                || driver.getPageSource().contains("404")
                || driver.getPageSource().contains("403")
                || driver.getPageSource().contains("Member access")
                || driver.getPageSource().contains("Sign In");

        Assert.assertTrue(isRestricted, "Customer is restricted from accessing admin portal");
    }
}
