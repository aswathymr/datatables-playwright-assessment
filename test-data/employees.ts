export interface EmployeeRecord {
  Name: string;
  Position: string;
  Office: string;
  'Extn.': string;
  'Start date': string;
  Salary: string;
}

export const EXPECTED_HEADERS: string[] = [
  'Name',
  'Position',
  'Office',
  'Extn.',
  'Start date',
  'Salary',
];

export const TIGER_NIXON: EmployeeRecord = {
  Name: 'Tiger Nixon',
  Position: 'System Architect',
  Office: 'Edinburgh',
  'Extn.': '5421',
  'Start date': '2011/04/25',
  Salary: '$320,800',
};
