package com.nibm2.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class NavbarComponent extends BasePage {

    // Locator for the "Sign In" link (visible when unauthenticated)
    private final By signInLink = By.xpath("//nav//a[contains(text(), 'Sign In')]");
    
    // Locator for the Profile button which displays the user's name
    private final By profileMenuButton = By.xpath("//nav//button[contains(., 'User')] | //nav//button[.//svg[contains(@class, 'lucide-user')]]");

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
}
