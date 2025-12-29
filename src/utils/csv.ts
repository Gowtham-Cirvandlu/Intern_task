import { Task } from '@/types';

export function toCSV(tasks: ReadonlyArray<Task>): string {
  // Fix other Bugs: Use a stable, predefined header order instead of deriving
  const headers = [
    'id',
    'title',
    'revenue',
    'timeTaken',
    'priority',
    'status',
    'notes'
  ];

  const rows = tasks.map(t => [
    t.id,
    escapeCsv(t.title),
    String(t.revenue),
    String(t.timeTaken),
    t.priority,
    t.status,
    escapeCsv(t.notes ?? ''),
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
// Fix ohter Bugs: Properly escape CSV fields.
function escapeCsv(v: string): string {
  if (v === '') return '';

  const needsQuotes = /[",\n]/.test(v);
  const value = v.replace(/"/g, '""');

  return needsQuotes ? `"${value}"` : value;
}


export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


