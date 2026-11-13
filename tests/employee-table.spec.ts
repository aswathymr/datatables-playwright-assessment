import { test, expect } from '@playwright/test';
import { EmployeeTablePage } from '../pages/EmployeeTablePage';
import { EXPECTED_HEADERS, TIGER_NIXON } from '../test-data/employees';

test.describe('DataTables Employee Directory Verification', () => {
  let employeePage: EmployeeTablePage;

  test.beforeEach(async ({ page }) => {
    employeePage = new EmployeeTablePage(page);
    await employeePage.goto();
  });

  test('1. Read table headers and verify order', async () => {
    const actualHeaders = await employeePage.getHeaders();
    expect(actualHeaders).toEqual(EXPECTED_HEADERS);
  });

  test('2. Find an employee (Tiger Nixon) and verify details', async () => {
    await employeePage.searchFor(TIGER_NIXON.Name);

    // Web-first assertion ensuring only 1 matching row is displayed
    await expect(employeePage.bodyRows).toHaveCount(1);

    const rows = await employeePage.getCurrentPageRows();
    const record = rows[0]!;

    expect(record.Name).toBe(TIGER_NIXON.Name);
    expect(record.Position).toBe(TIGER_NIXON.Position);
    expect(record.Office).toBe(TIGER_NIXON.Office);
    expect(record.Salary).toBe(TIGER_NIXON.Salary);
  });

  test('3. Validate search results for "London" across all pages', async () => {
    await employeePage.searchFor('London');

    const allMatchingRecords = await employeePage.getAllRecordsAcrossPages();
    expect(allMatchingRecords.length).toBeGreaterThan(0);

    for (const record of allMatchingRecords) {
      expect(record.Office).toContain('London');
    }
  });

  test('4. Negative search displays empty message and zero employee rows', async () => {
    await employeePage.searchFor('QA_NO_MATCH_98765');

    // Web-first assertions verifying the empty-result message
    await expect(employeePage.emptyCell).toBeVisible();
    await expect(employeePage.emptyCell).toHaveText(/No matching records found/i);

    // Verify zero actual employee records exist
    const employeeRecords = await employeePage.getCurrentPageRows();
    expect(employeeRecords).toHaveLength(0);
  });


  test('5. Sort Name ascending and descending across all pages', async ({}, testInfo) => {
    const nameHeader = employeePage.getColumnHeader('Name');

    // 1. Sort Descending (1st click from initial ascending -> descending)
    await employeePage.clickColumnHeader('Name');
    await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');

    const descRecords = await employeePage.getAllRecordsAcrossPages();
    expect(descRecords.length).toBeGreaterThan(0);

    const descNames = descRecords.map((r) => r.Name);
    console.log('\n--- Descending Names Across All Pages ---\n' + descNames.join('\n'));
    await testInfo.attach('Descending Names List', {
      body: descNames.join('\n'),
      contentType: 'text/plain',
    });

    const expectedDesc = [...descNames].sort((a, b) => b.localeCompare(a));
    expect(descNames).toEqual(expectedDesc);

    // 2. Sort Ascending (cycles descending -> unsorted -> ascending)
    await employeePage.clickColumnHeader('Name');
    if ((await nameHeader.getAttribute('aria-sort')) !== 'ascending') {
      await employeePage.clickColumnHeader('Name');
    }
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

    const ascRecords = await employeePage.getAllRecordsAcrossPages();
    expect(ascRecords.length).toBeGreaterThan(0);

    const ascNames = ascRecords.map((r) => r.Name);
    console.log('\n--- Ascending Names Across All Pages ---\n' + ascNames.join('\n'));
    await testInfo.attach('Ascending Names List', {
      body: ascNames.join('\n'),
      contentType: 'text/plain',
    });

    const expectedAsc = [...ascNames].sort((a, b) => a.localeCompare(b));
    expect(ascNames).toEqual(expectedAsc);
  });

});
