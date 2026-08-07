package com.nibm2.base;

import com.nibm2.config.ConfigReader;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;

/**
 * Base class every test class should extend.
 * Handles driver setup/teardown per test method and captures a screenshot on failure
 * (attach this file to the Xray Test Run as evidence when a corresponding manual
 * test also exists, e.g. NIBM2-471 for login/auth tests).
 */
public abstract class BaseTest {

    protected WebDriver driver;
    protected static final String BASE_URL = ConfigReader.get("base.url");

    @BeforeMethod
    public void setUp() {
        driver = DriverFactory.getDriver();
        driver.get(BASE_URL);
    }

    @AfterMethod
    public void tearDown(ITestResult result) {
        if (result.getStatus() == ITestResult.FAILURE) {
            captureScreenshot(result.getName());
        }
        DriverFactory.quitDriver();
    }

    protected void captureScreenshot(String testName) {
        try {
            String dir = ConfigReader.get("screenshot.dir", "test-output/screenshots");
            Files.createDirectories(Paths.get(dir));

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String fileName = testName + "_" + timestamp + ".png";
            File src = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            File dest = new File(dir, fileName);
            Files.copy(src.toPath(), dest.toPath());
            System.out.println("Screenshot saved: " + dest.getAbsolutePath());
        } catch (IOException e) {
            System.err.println("Failed to capture screenshot: " + e.getMessage());
        }
    }
}
