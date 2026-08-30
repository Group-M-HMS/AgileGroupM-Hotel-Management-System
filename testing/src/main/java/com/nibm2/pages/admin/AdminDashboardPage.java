package com.nibm2.pages.admin;

import com.nibm2.pages.BasePage;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Page Object for the Admin Dashboard (/admin).
 * Covers the KPI Metrics Header, Room Status Visual Grid,
 * Global Search Bar, Quick Reservation Button, and Live Activity Stream.
 */
public class AdminDashboardPage extends BasePage {

    // KPI Metrics Header Locators
    private final By kpiStripContainer = By.cssSelector("[data-testid='kpi-strip'], .kpi-strip, .dashboard-kpis, .grid-cols-4");
    private final By todayRevenueCard = By.cssSelector("[data-testid='kpi-revenue'], .kpi-revenue, #kpi-revenue, [aria-label*='Revenue']");
    private final By occupancyRateCard = By.cssSelector("[data-testid='kpi-occupancy'], .kpi-occupancy, #kpi-occupancy, [aria-label*='Occupancy']");
    private final By pendingCheckInsCard = By.cssSelector("[data-testid='kpi-checkins'], .kpi-checkins, #kpi-checkins, [aria-label*='Check-in']");
    private final By activeActivitiesCard = By.cssSelector("[data-testid='kpi-activities'], .kpi-activities, #kpi-activities, [aria-label*='Activities']");

    // Global Header & Quick Action Locators
    private final By globalSearchInput = By.cssSelector("input[data-testid='admin-search'], input[placeholder*='Search'], #admin-search-input");
    private final By searchResultsDropdown = By.cssSelector("[data-testid='search-results-dropdown'], .search-results, .dropdown-menu");
    private final By quickReservationButton = By.cssSelector("button[data-testid='quick-reservation-btn'], #quick-reservation-btn, button.btn-quick-reservation");
    private final By quickReservationModal = By.cssSelector("[data-testid='quick-reservation-modal'], .reservation-modal, .modal-dialog");

    // Room Status Visual Grid Locators
    private final By roomGridContainer = By.cssSelector("[data-testid='room-status-grid'], .room-status-grid, #room-grid");
    private final By roomCells = By.cssSelector("[data-testid='room-cell'], .room-cell, .room-card");
    private final By occupiedRoomCells = By.cssSelector("[data-status='OCCUPIED'], .room-occupied, .bg-red-500, .status-occupied");
    private final By availableRoomCells = By.cssSelector("[data-status='AVAILABLE'], .room-available, .bg-green-500, .status-available");
    private final By maintenanceRoomCells = By.cssSelector("[data-status='MAINTENANCE'], .room-maintenance, .bg-amber-500, .status-maintenance");

    // Live Activity Stream & Urgent Requests
    private final By activityStreamContainer = By.cssSelector("[data-testid='activity-stream'], .activity-stream, #activity-stream");
    private final By activityLogItems = By.cssSelector("[data-testid='activity-item'], .activity-item, .log-entry");
    private final By urgentRequestsPanel = By.cssSelector("[data-testid='urgent-requests'], .urgent-requests, #urgent-requests");

    // Access Denied / Auth Error Message Locators
    private final By accessDeniedBanner = By.cssSelector("[data-testid='access-denied'], .access-denied, .error-403, .alert-danger");

    public AdminDashboardPage(WebDriver driver) {
        super(driver);
    }

    public void open(String adminUrl) {
        driver.get(adminUrl);
    }

    // --- KPI Metrics Actions ---
    public boolean isKpiStripVisible() {
        return isDisplayed(kpiStripContainer) || isDisplayed(todayRevenueCard);
    }

    public String getTodayRevenueText() {
        return isDisplayed(todayRevenueCard) ? getText(todayRevenueCard) : "";
    }

    public String getOccupancyRateText() {
        return isDisplayed(occupancyRateCard) ? getText(occupancyRateCard) : "";
    }

    public String getPendingCheckInsText() {
        return isDisplayed(pendingCheckInsCard) ? getText(pendingCheckInsCard) : "";
    }

    public String getActiveActivitiesText() {
        return isDisplayed(activeActivitiesCard) ? getText(activeActivitiesCard) : "";
    }

    // --- Search & Quick Reservation Actions ---
    public void searchGlobal(String query) {
        type(globalSearchInput, query);
    }

    public boolean isSearchResultsDropdownVisible() {
        return isDisplayed(searchResultsDropdown);
    }

    public void clickQuickReservation() {
        click(quickReservationButton);
    }

    public boolean isQuickReservationModalOpen() {
        return isDisplayed(quickReservationModal);
    }

    // --- Room Status Grid Actions ---
    public boolean isRoomGridVisible() {
        return isDisplayed(roomGridContainer) || isDisplayed(roomCells);
    }

    public int getRoomCellCount() {
        List<WebElement> cells = driver.findElements(roomCells);
        return cells.size();
    }

    public int getOccupiedRoomCount() {
        return driver.findElements(occupiedRoomCells).size();
    }

    public int getAvailableRoomCount() {
        return driver.findElements(availableRoomCells).size();
    }

    public int getMaintenanceRoomCount() {
        return driver.findElements(maintenanceRoomCells).size();
    }

    // --- Activity Stream & Urgent Requests ---
    public boolean isActivityStreamVisible() {
        return isDisplayed(activityStreamContainer);
    }

    public int getActivityLogCount() {
        return driver.findElements(activityLogItems).size();
    }

    public boolean isUrgentRequestsPanelVisible() {
        return isDisplayed(urgentRequestsPanel);
    }

    // --- Security & Access Control ---
    public boolean isAccessDeniedDisplayed() {
        return isDisplayed(accessDeniedBanner) || driver.getTitle().toLowerCase().contains("403") || driver.getTitle().toLowerCase().contains("unauthorized");
    }
}
