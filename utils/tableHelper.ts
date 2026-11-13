import { Locator, expect } from '@playwright/test';

export class TableHelper {
  readonly tableWrapper: Locator;
  readonly table: Locator;
  readonly headerCells: Locator;
  readonly headerTitles: Locator;
  readonly bodyRows: Locator;
  readonly emptyCell: Locator;
  readonly nextPageButton: Locator;
  readonly tableInfo: Locator;

  /**
   * @summary Initializes the table and its related Playwright locators.
   */
  constructor(tableWrapper: Locator, table: Locator) {
    this.tableWrapper = tableWrapper;
    this.table = table;
    this.headerCells = this.table.locator('thead th');
    this.headerTitles = this.table.locator('thead .dt-column-header .dt-column-title');
    this.bodyRows = this.table.locator('tbody').getByRole('row');
    this.emptyCell = this.table.locator('tbody td.dt-empty');
    this.nextPageButton = this.tableWrapper
      .getByRole('link', { name: 'Next' })
      .or(this.tableWrapper.getByRole('button', { name: 'Next' }));
    this.tableInfo = this.tableWrapper.locator('.dt-info');
  }

  /**
   * @summary Returns non-empty column headers in DOM order.
   */
  async getHeaders(): Promise<string[]> {
    const count = await this.headerTitles.count();
    const headers: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = (await this.headerTitles.nth(i).innerText()).trim();
      if (text !== '') {
        headers.push(text);
      }
    }
    return headers;
  }

  /**
   * @summary Finds the table header index matching the given name, case-insensitively.
   */
  async getColumnIndexByHeader(headerName: string): Promise<number> {
    const count = await this.headerCells.count();

    for (let i = 0; i < count; i++) {
      const titleText = (
        await this.headerCells.nth(i).locator('.dt-column-header .dt-column-title').innerText()
      ).trim();

      if (titleText.toLowerCase() === headerName.toLowerCase()) {
        return i;
      }
    }

    throw new Error(`Column "${headerName}" not found in table headers.`);
  }

  /**
   * @summary Returns current-page rows as records keyed by their visible column headers.
   */
  async getCurrentPageRows(): Promise<Record<string, string>[]> {
    if (await this.emptyCell.isVisible()) {
      return [];
    }

    const columnMap: { index: number; name: string }[] = [];
    const headerCount = await this.headerCells.count();

    for (let c = 0; c < headerCount; c++) {
      const th = this.headerCells.nth(c);
      if (!(await th.isVisible())) continue;

      const name = (await th.locator('.dt-column-header .dt-column-title').innerText()).trim();
      if (name !== '') {
        columnMap.push({ index: c, name });
      }
    }

    const rowCount = await this.bodyRows.count();
    const records: Record<string, string>[] = [];

    for (let r = 0; r < rowCount; r++) {
      const cells = this.bodyRows.nth(r).locator('td');
      const rowObject: Record<string, string> = {};

      for (const col of columnMap) {
        rowObject[col.name] = (await cells.nth(col.index).innerText()).trim();
      }
      records.push(rowObject);
    }

    return records;
  }

  /**
   * @summary Collects records from every page by traversing the table's pagination controls.
   */
  async getAllRecordsAcrossPages(): Promise<Record<string, string>[]> {
    const allRecords: Record<string, string>[] = [];

    while (true) {
      const pageRecords = await this.getCurrentPageRows();
      allRecords.push(...pageRecords);

      const isDisabled =
        (await this.nextPageButton.getAttribute('aria-disabled')) === 'true' ||
        (await this.nextPageButton.evaluate((el) =>
          el.classList.contains('disabled') || el.parentElement?.classList.contains('disabled')
        ));

      if (isDisabled || !(await this.nextPageButton.isVisible())) {
        break;
      }

      const previousInfoText = await this.tableInfo.innerText();
      await this.nextPageButton.click();
      await expect(this.tableInfo).not.toHaveText(previousInfoText);
    }

    return allRecords;
  }
}