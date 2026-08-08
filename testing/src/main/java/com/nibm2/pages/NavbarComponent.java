package com.nibm2.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class NavbarComponent extends BasePage {

    // Locator for the "Sign In" link (visible when unauthenticated)
    private final By signInLink = By.xpath("//nav//a[contains(text(), 'Sign In')]");
    
    // Locator for the Profile button which displays the user's name.
    // The desktop nav contains a button for the ProfileMenu.
    private final By profileMenuButton = By.xpath("//nav//div[contains(@class, 'hidden md:flex')]//button");

    public NavbarComponent(WebDriver driver) {
        super(driver);
    }

    public boolean isSignInVisible() {
        return isDisplayed(signInLink);
    }

    public void clickSignIn() {
        click(signInLink);
    }

    public boolean isProfileMenuVisible() {
        return isDisplayed(profileMenuButton);
    }
    
    public void clickProfileMenu() {
        try {
            click(profileMenuButton);
        } catch (Exception e) {
            System.out.println("Standard click on profile menu failed. Using JS click.");
            org.openqa.selenium.WebElement el = driver.findElement(profileMenuButton);
            ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", el);
        }
    }
    
    public void clickSignOut() {
        By signOutButton = By.xpath("//*[contains(text(), 'Sign Out') or contains(text(), 'Logout')]");
        try {
            click(signOutButton);
        } catch (Exception e) {
            System.out.println("Standard click on Sign Out failed. Using JS click.");
            org.openqa.selenium.WebElement el = driver.findElement(signOutButton);
            ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", el);
        }
    }

    public void clickMyBookings() {
        By myBookingsLink = By.xpath("//a[contains(text(), 'My Bookings')]");
        try {
            click(myBookingsLink);
        } catch (Exception e) {
            System.out.println("Standard click on My Bookings failed. Using JS click.");
            org.openqa.selenium.WebElement el = driver.findElement(myBookingsLink);
            ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", el);
        }
    }
}
