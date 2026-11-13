# DataTables UI Automation Assessment (Playwright + TypeScript)

An end-to-end UI test automation framework built with **Playwright Test** and **TypeScript** using the **Page Object Model (POM)** pattern to verify the employee directory table on [DataTables.net](https://datatables.net).

---

## Key Technical Highlights

* **TypeScript & Page Object Model (POM):** Clean separation across `pages/`, `utils/`, `test-data/`, and `tests/`.
* **Scoped & Accessible Locators:** All locators are strictly scoped to `#myTable_wrapper` and `table#myTable`, prioritizing accessible ARIA roles (`getByRole('searchbox')`, `getByRole('columnheader')`, `getByRole('row')`, `getByRole('button')`).
* **Pure UI Interaction:** Interacts exclusively through the DOM and UI controls (search input, pagination buttons, column headers) without calling the DataTables JavaScript API.
* **Condition-Based Synchronization:** Uses Playwright web-first assertions (`toHaveAttribute`, `not.toHaveText`, `toHaveCount`, `toBeVisible`) with zero hardcoded `waitForTimeout()` calls.
* **Reusable Table Utilities (`utils/tableHelper.ts`):** Modular helpers for reading headers, resolving column indices dynamically by header name, extracting row data, and traversing pagination across all pages.
* **Parallel & Independent Execution:** Configured with `fullyParallel: true` so every test runs in an isolated browser context.
* **Reporting & Debugging:** Configured with Playwright's built-in **HTML report**, automatic **screenshots on failure**, and **traces retained on failure**, plus sorted name lists attached directly to the HTML report.

---

## Project Structure

```text
datatables-playwright-assessment/
├── pages/
│   └── EmployeeTablePage.ts    # Scoped locators and UI actions for the Employee DataTable
├── utils/
│   └── tableHelper.ts          # Reusable table helpers (headers, column lookup, rows, pagination)
├── test-data/
│   └── employees.ts            # TypeScript interfaces and expected test data
├── tests/
│   └── employee-table.spec.ts  # 5 independent E2E test scenarios
├── playwright.config.ts        # Parallel workers, baseURL, HTML report, failure screenshots & traces
└── README.md
```

---

## Automated Test Scenarios

1. **Read Table Headers:** Verifies that `Name`, `Position`, `Office`, `Extn.`, `Start date`, and `Salary` appear in the expected order.
2. **Find an Employee:** Searches for `Tiger Nixon` and verifies `Name`, `Position`, `Office`, and `Salary` against expected data.
3. **Validate Multi-Page Search Results:** Searches for `London` and verifies every returned record across all pages contains `London` in the `Office` column.
4. **Negative Search Handling:** Searches for `QA_NO_MATCH_98765` and verifies the empty-result message and zero employee rows.
5. **Sort Name Ascending & Descending Across All Pages:** Verifies full alphabetical sorting in both descending and ascending directions across every page, attaching both complete lists to the HTML report.

---

## Setup & Execution

### 1. Install Dependencies
```bash
npm install
npx playwright install chromium
```

### 2. Run All Tests (Headless & Parallel)
```bash
npx playwright test
```

### 3. Run Tests in Headed Mode (Visual Browser Execution)
```bash
npx playwright test --headed
```

### 4. View the HTML Report
```bash
npx playwright show-report
```
