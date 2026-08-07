package com.nibm2.pages;

import com.nibm2.utils.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Base class for all Page Objects. Every page (LoginPage, CheckoutPage, etc.)
 * extends this to get a driver reference and common wait helpers.
 */
public abstract class BasePage {

    protected final WebDriver driver;
    protected final WaitUtils wait;

    protected BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WaitUtils(driver);
    }

    protected void click(By locator) {
        wait.waitForClickable(locator).click();
        try { Thread.sleep(500); } catch (Exception e) {} // slow down for visibility
    }

    protected void type(By locator, String text) {
        WebElement el = wait.waitForVisible(locator);
        // el.clear() does not reliably trigger React state updates, causing concatenated text
        el.sendKeys(org.openqa.selenium.Keys.chord(org.openqa.selenium.Keys.CONTROL, "a"), org.openqa.selenium.Keys.DELETE);
        el.sendKeys(text);
        try { Thread.sleep(300); } catch (Exception e) {} // slow down for visibility
    }

    protected String getText(By locator) {
        return wait.waitForVisible(locator).getText();
    }

    protected boolean isDisplayed(By locator) {
        try {
            return wait.waitForVisible(locator).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    protected boolean isEnabled(By locator) {
        return driver.findElement(locator).isEnabled();
    }

    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }
}
