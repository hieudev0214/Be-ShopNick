export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function uniqueSlug(base: string): string {
  return `${toSlug(base)}-${Date.now()}`;
}

export function generateAccountCode(): string {
  return `${Date.now()}`;
}
