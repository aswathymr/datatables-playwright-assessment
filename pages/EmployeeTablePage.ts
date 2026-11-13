import { Page, Locator, expect } from '@playwright/test';
import { TableHelper } from '../utils/tableHelper';

export class EmployeeTablePage {
  readonly page: Page;
  readonly tableWrapper: Locator;
  readonly table: Locator;
  readonly searchInput: Locator;
  readonly bodyRows: Locator;
  readonly emptyCell: Locator;
  readonly tableInfo: Locator;
  readonly tableHelper: TableHelper;

  constructor(page: Page) {
    this.page = page;

    // 1. Scoped strictly to #myTable_wrapper and #myTable
    this.tableWrapper = page.locator('#myTable_wrapper');
    this.table = this.tableWrapper.locator('table#myTable');

    // 2. Scoped searchbox inside the table wrapper
    this.searchInput = this.tableWrapper
      .getByRole('searchbox')
      .or(this.tableWrapper.getByRole('textbox'));

    this.bodyRows = this.table.locator('tbody').getByRole('row');
    this.emptyCell = this.table.locator('tbody td.dt-empty');
    this.tableInfo = this.tableWrapper.locator('.dt-info');

    // 3. Initialize reusable table utility
    this.tableHelper = new TableHelper(this.tableWrapper, this.table);
  }
  
  /**
   * @summary Navigates to the Employee Table page and waits for the table to be visible.
   */
  async goto() {
    await this.page.goto('/');
    await expect(this.table).toBeVisible();
  }

  // Delegate reusable table methods to TableHelper
  async getHeaders(): Promise<string[]> {
    return this.tableHelper.getHeaders();
  }

  async getColumnIndexByHeader(headerName: string): Promise<number> {
    return this.tableHelper.getColumnIndexByHeader(headerName);
  }

  async getCurrentPageRows(): Promise<Record<string, string>[]> {
    return this.tableHelper.getCurrentPageRows();
  }

  async getAllRecordsAcrossPages(): Promise<Record<string, string>[]> {
    return this.tableHelper.getAllRecordsAcrossPages();
  }

  /**
   * Search via UI searchbox and wait for table summary text to update
   */
  async searchFor(query: string) {
    const previousInfo = await this.tableInfo.innerText();
    await this.searchInput.fill(query);
    if (query !== '') {
      await expect(this.tableInfo).not.toHaveText(previousInfo);
    }
  }

  /**
   * Returns the scoped columnheader locator so tests can assert aria-sort directly
   */
  getColumnHeader(headerName: string): Locator {
    return this.table
      .locator('thead')
      .getByRole('columnheader', { name: new RegExp(`^${headerName}\\b`, 'i') });
  }

  /**
   * Clicks the column header title once via UI
   */
  async clickColumnHeader(headerName: string) {
    const header = this.getColumnHeader(headerName);
    await header.locator('.dt-column-title').click();
  }
}