export const projectColors: Record<string, string> = {
  'Soul Krieg': '#F59E0B',
  'Solar Machine': '#10B981',
  'Sollar Machine': '#10B981',
  Redforce: '#EF4444',
};

export function colorForProject(name?: string) {
  return (name && projectColors[name]) || '#64748B';
}
