/* Lightweight, typed form validation — no extra dependency needed. */

export type Rule<V = unknown> = (value: V, all: Record<string, unknown>) => string | undefined;
export type Schema = Record<string, Rule<any>[]>;
export type Errors = Record<string, string | undefined>;

const str = (v: unknown) => (v == null ? '' : String(v).trim());

export const required = (msg = 'This field is required'): Rule => (v) =>
  (Array.isArray(v) ? v.length === 0 : str(v) === '') ? msg : undefined;

export const minLen = (n: number, msg?: string): Rule => (v) =>
  str(v) && str(v).length < n ? msg ?? `Must be at least ${n} characters` : undefined;

export const maxLen = (n: number, msg?: string): Rule => (v) =>
  str(v).length > n ? msg ?? `Must be ${n} characters or fewer` : undefined;

export const email = (msg = 'Enter a valid email address'): Rule => (v) =>
  str(v) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(str(v)) ? msg : undefined;

/** Nigerian phone numbers: 0803…, +234803…, 234803… (10–11 local digits). */
export const phone = (msg = 'Enter a valid phone number, e.g. 0803 123 4567'): Rule => (v) => {
  const s = str(v).replace(/[\s()-]/g, '');
  if (!s) return undefined;
  return /^(\+?234|0)[789][01]\d{8}$/.test(s) || /^\+?\d{10,15}$/.test(s) ? undefined : msg;
};

export const min = (n: number, msg?: string): Rule => (v) =>
  str(v) !== '' && Number(v) < n ? msg ?? `Must be at least ${n}` : undefined;

export const max = (n: number, msg?: string): Rule => (v) =>
  str(v) !== '' && Number(v) > n ? msg ?? `Must be ${n} or less` : undefined;

export const notPastDate = (msg = 'Choose today or a future date'): Rule => (v) => {
  if (!str(v)) return undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(str(v) + 'T23:59:59') < today ? msg : undefined;
};

export const afterField = (field: string, msg = 'Must be after the first date'): Rule => (v, all) =>
  str(v) && str(all[field]) && str(v) < str(all[field]) ? msg : undefined;

export const differentFrom = (field: string, msg: string): Rule => (v, all) =>
  str(v) && str(v) === str(all[field]) ? msg : undefined;

export const matches = (field: string, msg = 'Values do not match'): Rule => (v, all) =>
  str(v) !== str(all[field]) ? msg : undefined;

export const strongPassword = (msg = 'Use 8+ characters with a number and a letter'): Rule => (v) =>
  str(v) && !(str(v).length >= 8 && /\d/.test(str(v)) && /[a-z]/i.test(str(v))) ? msg : undefined;

export const when = (cond: (all: Record<string, unknown>) => boolean, rules: Rule[]): Rule => (v, all) => {
  if (!cond(all)) return undefined;
  for (const r of rules) {
    const e = r(v, all);
    if (e) return e;
  }
  return undefined;
};

export function validate(values: Record<string, unknown>, schema: Schema, only?: string[]): Errors {
  const errors: Errors = {};
  for (const key of only ?? Object.keys(schema)) {
    for (const rule of schema[key] ?? []) {
      const e = rule(values[key], values);
      if (e) {
        errors[key] = e;
        break;
      }
    }
  }
  return errors;
}

export const hasErrors = (e: Errors) => Object.values(e).some(Boolean);
