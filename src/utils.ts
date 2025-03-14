import type { FunctionalComponent } from "preact";

export const strings: StringValue = {};
const rootLocales: RootLocales = {};

let activeLanguage = "en";

type StringFunction = ((props: object) => any) | ((...params: any[]) => any);
type Strings = () => Array<StringValue | Promise<{ default: StringValue } | StringValue>>;

export interface StringValue {
  [key: string]: string | StringFunction | FunctionalComponent<unknown>
}
export interface Locales {
  [locale: string]: Strings
}

export type RootLocales = {
  [locale: string]: Strings[]
}

export function string<K extends keyof StringValue>(key: K) {
  return strings[key];
}
export function is_str(key: string | number): key is keyof StringValue {
  return key as string in strings;
}

export function mergeStrings(strings: StringValue, newStrings: Array<{ default: StringValue } | StringValue>) {
  for (const texts of newStrings) {
    if (typeof texts.default === "object") {
      Object.assign(strings, texts.default);
    } else {
      Object.assign(strings, texts);
    }
  }
}

export function mergeLocales(newLocales: Locales) {
  for (const locale of Object.keys(newLocales)) {
    if (!rootLocales[locale]) {
      rootLocales[locale] = [];
    }
    rootLocales[locale].push(newLocales[locale]);
  }
}

export async function setLanguage(newLanguage: string) {
  activeLanguage = newLanguage;
  const locales = rootLocales[newLanguage] || rootLocales["en"];
  await Promise.all(
    locales.map(
      async locale => mergeStrings(strings, await Promise.all(locale()))
    )
  );
}

export function currentLanguage() {
  return activeLanguage;
}
