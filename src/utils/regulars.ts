const KEY = 'pocketAce_regulars';

export function getRegulars(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function addRegular(name: string): void {
  const current = getRegulars();
  if (!current.includes(name)) {
    localStorage.setItem(KEY, JSON.stringify([...current, name]));
  }
}

export function removeRegular(name: string): void {
  localStorage.setItem(KEY, JSON.stringify(getRegulars().filter(n => n !== name)));
}
