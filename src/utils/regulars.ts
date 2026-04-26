import { storage } from './storage';

export function getRegulars(): string[] {
  return storage.getRegulars();
}

export function addRegular(name: string): void {
  const current = storage.getRegulars();
  if (!current.includes(name)) {
    storage.setRegulars([...current, name]);
  }
}

export function removeRegular(name: string): void {
  storage.setRegulars(storage.getRegulars().filter(n => n !== name));
}
