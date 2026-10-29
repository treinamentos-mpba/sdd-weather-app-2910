const forecastDayFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
  weekday: 'long',
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
});

function parseCalendarDate(date: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (
    parsedDate.getUTCFullYear() !== Number(year) ||
    parsedDate.getUTCMonth() !== Number(month) - 1 ||
    parsedDate.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return parsedDate;
}

export function formatForecastDay(date: string, index: number): string {
  if (index === 0) {
    return 'Hoje';
  }

  if (index === 1) {
    return 'Amanhã';
  }

  const parsedDate = parseCalendarDate(date);
  if (!parsedDate) {
    return 'Data indisponível';
  }

  const label = forecastDayFormatter.format(parsedDate);
  return `${label.charAt(0).toLocaleUpperCase('pt-BR')}${label.slice(1)}`;
}

export function getShortDate(date: string): string {
  const parsedDate = parseCalendarDate(date);
  return parsedDate ? shortDateFormatter.format(parsedDate) : 'Data indisponível';
}
