import { h, Component, ComponentClass } from "preact";

let language = "en";
type Listener = {
    (lang: string): void
}
let listeners: Listener[] = [];

export function subscribe(listener: Listener) {
    listeners.push(listener);
    return () => { unsubscribe(listener); };
}
export function unsubscribe(listener: Listener) {
    listeners.splice(listeners.indexOf(listener)>>>0, 1);
}

export interface LanguageProps<L extends StringValue> {
    readonly str: <K extends keyof L>(key: K) => L[K]
    readonly isStr: (key: any) => key is keyof L
}

export type WrapTarget<L extends StringValue, P = unknown, S = unknown> = ComponentClass<P & LanguageProps<L>, S>;

type StringFunction = {
    (...params: any): string
}
export type StringValue = {
    [key: string]: string | StringFunction | ((props: any) => h.JSX.Element)
};
export type Locales = {
    [locale: string]: () => Array<StringValue | Promise<{default: StringValue} | StringValue>>
}

type RootLocales = {
    [locale: string]: Array<() => Array<StringValue | Promise<{default: StringValue} | StringValue>>>
}

function mergeStrings(strings: StringValue, newStrings: Array<{default: StringValue} | StringValue>) {
    for (const texts of newStrings) {
        if (typeof texts.default === "object") {
            Object.assign(strings, texts.default);
        } else {
            Object.assign(strings, texts);
        }
    }
    return strings;
}

function mergeLocales(locales: RootLocales, newLocales: Locales){
    for (const locale of Object.keys(newLocales)) {
        if (!locales[locale]) {
            locales[locale] = [];
        }
        locales[locale].push(newLocales[locale]);
    }
}

export function changeLanguage(newLanguage: string) {
    language = newLanguage;
    for (const listener of listeners) {
        listener(newLanguage);
    }
}
export function currentLanguage() {
    return language;
}

/*
L = LanguageProps<L>, key=value of available strings
P = Props without L
S = State
*/
export function connectLanguage<L extends StringValue>(locales: Locales) {
    const strings: StringValue = {};
    let languageLoaded = false;
    const components: Component[] = [];

    const rootLocales: RootLocales = {};
    mergeLocales(rootLocales, locales);

    subscribe(setLanguage);

    setLanguage(currentLanguage());

    async function setLanguage(language: string) {
        const locales = rootLocales[language] || rootLocales["en"];
        for (const locale of locales) {
            mergeStrings(strings, await Promise.all(locale()));
        }
        languageLoaded = true;
        for (const component of components) {
            component.setState({});
        }
    }
    function unmount(component: Component) {
        components.splice(components.indexOf(component)>>>0, 1);
        if (!components.length) {
            unsubscribe(setLanguage);
        }
    }

    function string(key: keyof L) {
        return strings[key as any];
    }
    function is_str(key: any): key is keyof L {
        return key in strings;
    }
    
    return function<P = unknown, S = unknown, ComponentLocales = unknown>(Child: WrapTarget<L & ComponentLocales, P, S>, componentLocales?: Locales) {
        if (componentLocales) {
            mergeLocales(rootLocales, componentLocales);
        }
        return class Wrapper extends Component<P> {
            componentWillUnmount() {
                unmount(this);
            };
            componentDidMount() {
                components.push(this);
            };
            render() {
                // @ts-ignore
                return languageLoaded && <Child {...this.props} str={string} isStr={is_str} />;
            };
        };
    }
}
