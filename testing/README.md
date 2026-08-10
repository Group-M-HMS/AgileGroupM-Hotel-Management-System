# 🧪 River Nest Eco Villa — Automated Testing Framework

[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=java&logoColor=white)](https://www.oracle.com/java/)
[![Selenium](https://img.shields.io/badge/Selenium-4.24.0-43B02A?style=for-the-badge&logo=selenium&logoColor=white)](https://www.selenium.dev/)
[![TestNG](https://img.shields.io/badge/TestNG-7.10.2-FF6F00?style=for-the-badge&logo=testng&logoColor=white)](https://testng.org/)
[![Maven](https://img.shields.io/badge/Apache%20Maven-3.9.6-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)](https://maven.apache.org/)
[![Chrome](https://img.shields.io/badge/Google%20Chrome-151-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)

Welcome to the official automated testing suite for the **River Nest Eco Villa Hotel Management System**. This framework delivers end-to-end (E2E) browser automation, component validation, payment gateway security testing, and backend integration verification using **Java 17**, **Selenium WebDriver 4**, and **TestNG**.

---

## 📐 Architecture & Core Highlights

* **🔒 Robust Authentication & Security Verification:** Automated coverage for login rate-limiting, registration validation, token persistence, and route protection.
* **🏨 Complete Dashboard & Booking Lifecycle:** End-to-end verification of active, past, and upcoming reservation filters, special requests rendering, and empty-state messaging.
* **❌ Safe Cancellation & Inventory Release:** Automated confirmation of non-refundable booking enforcement, cancellation warnings, immediate UI button removal, backend API confirm, and released inventory verification.
* **💳 Stripe Payment Elements Security Integration:** Encapsulated verification of direct browser-to-Stripe card communication, single card-only payment enforcement, inline card validation errors, and single-charge idempotency.
* **📱 Responsive Viewport Testing:** Automated verification across desktop (`1280px`) and mobile (`375px`) viewports for checkout forms and confirmation guidance screens.
* **📸 Automated Screenshot Evidence:** Captures high-resolution timestamped PNG evidence for every executed test step in `test-output/screenshots/`.

---

## 📁 Repository Structure

```text
testing/
├── README.md                        # Framework documentation & execution guide
├── pom.xml                          # Maven build dependencies & surefire plugins
├── testng.xml                       # Suite runner mapping 33 test suites across 5 feature blocks
├── seed.py                          # Database & test environment seeding helper
├── .gitignore                       # Git exclusion rules for build targets & reports
└── src/
    └── test/
        ├── java/
        │   com/nibm2/
        │   ├── base/
        │   │   └── BaseTest.java    # Central WebDriver setup, teardown & screenshot capture
        │   └── tests/               # 33 Production-Grade Test Automation Suites
        │       ├── [1. Auth & Security]
        │       │   ├── LoginTest.java
        │       │   ├── RegisterTest.java
        │       │   ├── LoginSecurityTest.java
        │       │   ├── LogoutTest.java
        │       │   ├── ProfileTest.java
        │       │   ├── CheckoutAuthTest.java
        │       │   └── NavigationAuthTest.java
        │       ├── [2. Dashboard & Bookings]
        │       │   ├── MyBookingsNavTest.java
        │       │   ├── DashboardEmptyStateTest.java
        │       │   ├── DashboardUpcomingBookingsTest.java
        │       │   ├── DashboardPastBookingsTest.java
        │       │   ├── DashboardBookingStatusTest.java
        │       │   ├── DashboardGuestSpecialRequestsTest.java
        │       │   ├── BookingLookupDashboardTest.java
        │       │   └── DashboardLogoNavigationTest.java
        │       ├── [3. Itinerary & Cancellation]
        │       │   ├── DashboardItineraryPrintTest.java
        │       │   ├── DashboardItinerarySecurityTest.java
        │       │   ├── DashboardCancellationEligibilityTest.java
        │       │   ├── DashboardCancelModalWarningTest.java
        │       │   ├── DashboardCancelWorkflowTest.java
        │       │   ├── DashboardCancelStatusBackendConfirmationTest.java
        │       │   ├── DashboardCancelButtonRemovalTest.java
        │       │   ├── DashboardRoomInventoryReleaseTest.java
        │       │   └── DashboardCancelSuccessBannerTest.java
        │       ├── [4. Checkout & Stripe Payment]
        │       │   ├── DashboardCheckoutAutoFillTest.java
        │       │   ├── DashboardCheckoutValidationTest.java
        │       │   ├── DashboardTermsValidationTest.java
        │       │   ├── DashboardCardPaymentEnforcementTest.java
        │       │   ├── DashboardStripeIntegrationTest.java
        │       │   ├── DashboardBookingPaymentWorkflowTest.java
        │       │   └── DashboardDuplicateSubmissionPreventionTest.java
        │       └── [5. Confirmation & Reference]
        │           ├── DashboardBookingReferenceUniquenessTest.java
        │           └── DashboardConfirmationScreenGuidanceTest.java
        └── resources/
            └── testng.xml
```

---

## 📊 Test Suite Coverage Matrix

| Suite Category | Test Class | Coverage & Objective |
| :--- | :--- | :--- |
| **Authentication & Security** | `LoginTest`, `RegisterTest`, `LoginSecurityTest` | Form validation, password masking, credential error messages, route protection |
| **Account & Profile** | `ProfileTest`, `LogoutTest`, `NavigationAuthTest` | Profile updates, token clearing on logout, protected URL redirect enforcement |
| **Dashboard & History** | `DashboardUpcomingBookingsTest`, `DashboardPastBookingsTest` | Date sorting, active/past tab filtering, booking reference rendering |
| **Guest Requests & Search** | `DashboardGuestSpecialRequestsTest`, `BookingLookupDashboardTest` | Special requests text persistence, room search filter matching |
| **Itinerary & Printing** | `DashboardItineraryPrintTest`, `DashboardItinerarySecurityTest` | Window print dialog triggers, cross-account itinerary isolation |
| **Cancellation Flow** | `DashboardCancellationEligibilityTest`, `DashboardCancelWorkflowTest` | 48h non-refundable lock, double-confirmation modal, status change to `CANCELED` |
| **Inventory Release** | `DashboardRoomInventoryReleaseTest`, `DashboardCancelSuccessBannerTest` | Instant inventory release, availability re-search, success banner dismissal |
| **Checkout Validation** | `DashboardCheckoutAutoFillTest`, `DashboardCheckoutValidationTest` | Profile pre-fill, required field highlights, real-time error clearing |
| **Terms & Payment Methods**| `DashboardTermsValidationTest`, `DashboardCardPaymentEnforcementTest` | Terms checkbox blocking, backend 400 Bad Request check, Card method binding |
| **Stripe Elements Security**| `DashboardStripeIntegrationTest`, `DashboardBookingPaymentWorkflowTest` | Stripe iframe card entry, raw card protection, failure handling, confirmation redirect |
| **Idempotency & Resilience**| `DashboardDuplicateSubmissionPreventionTest`, `DashboardBookingReferenceUniquenessTest` | Rapid multi-click button disabling, Stripe charge idempotency, 6–8 char ref format |
| **Confirmation Guidance** | `DashboardConfirmationScreenGuidanceTest`, `DashboardLogoNavigationTest` | Arrival photo ID guidance, 375px mobile responsiveness, logo navigation |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Java Development Kit (JDK):** Version 17 or higher
* **Google Chrome:** Latest stable version
* **Apache Maven:** Version 3.9+ (or local portable distribution)

---

### Running Tests via Command Line

#### 1. Execute Full TestNG Suite
To run all 33 test suites (100+ test cases) defined in `testng.xml`:
```powershell
# From the project root directory
..\apache-maven-3.9.6\bin\mvn.cmd test
```

#### 2. Execute a Specific Test Class
To run a single targeted test suite (e.g., Stripe Payment Integration):
```powershell
..\apache-maven-3.9.6\bin\mvn.cmd test -Dtest=DashboardStripeIntegrationTest
```

#### 3. Execute Multiple Test Classes
```powershell
..\apache-maven-3.9.6\bin\mvn.cmd test -Dtest=DashboardCheckoutValidationTest,DashboardTermsValidationTest
```

---

## 🔍 Test Reports & Screenshot Evidence

Upon test completion, detailed HTML reports and screenshot evidence are automatically generated:

* **TestNG Execution Summary:** `testing/target/surefire-reports/emailable-report.html`
* **XML Results File:** `testing/target/surefire-reports/testng-results.xml`
* **Step-by-Step Screenshot Evidence:** `testing/test-output/screenshots/`

```text
test-output/screenshots/
├── SUCCESS_validTestCardCommunicatesDirectlyToStripe_20260810_192613.png
├── SUCCESS_incompleteCardNumberTriggersInlineValidationError_20260810_192624.png
├── SUCCESS_responsiveViewportDisplayDesktopAndMobile_20260810_210723.png
└── SUCCESS_rapidMultiClicksCreateOnlyOneBookingRecordAndPreventDuplicates_20260810_211358.png
```

---

## 💡 Best Practices & Engineering Design

1. **Zero Flakiness Sync Strategy:** Utilizes explicit `WebDriverWait` and `ExpectedConditions` instead of fixed thread sleeps to handle dynamic AJAX requests and React re-renders.
2. **React Controlled Input Clearing:** Standard `.clear()` operations fail on React controlled components. Our suites utilize `Keys.CONTROL + "a"` followed by `Keys.DELETE` to guarantee synthetic change events fire cleanly.
3. **Encapsulated Auth Injection:** E2E tests inject simulated authentication contexts into `localStorage` (`E2E_TEST_USER`), allowing checkout and booking tests to run isolated from login flows.
4. **Backend API Direct Validation:** Complements frontend UI testing by directly firing `HTTP POST/PUT` requests to backend services (`http://168.138.170.92:8085` / `:8084`) to verify server-side validation enforcement.

---

<p center align="center">
  <b>River Nest Eco Villa Systems Engineering Team</b> • Built for High Reliability & Quality Assurance
</p>
