import { h, Component, ComponentClass, FunctionComponent, ComponentConstructor } from "preact";

let language = "en";
type Listener = {
    (lang: string): void
}
const listeners: Listener[] = [];

export function subscribe(listener: Listener) {
    listeners.push(listener);
    return () => { unsubscribe(listener); };
}
export function unsubscribe(listener: Listener) {
    listeners.splice(listeners.indexOf(listener)>>>0, 1);
}

export interface LanguageProps<L extends StringValue> {
    readonly str: <K extends keyof L>(key: K) => L[K]
    readonly isStr: (key: unknown) => key is keyof L
}

export type WrapTarget<L extends StringValue, P = unknown> = ComponentClass<P & LanguageProps<L>> | FunctionComponent<P & LanguageProps<L>>;

type StringFunction = {
    (...params: unknown[]): string
}
export type StringValue = {
    [key: string]: string | StringFunction | FunctionComponent<unknown>
};
export type Locales<L extends StringValue> = {
    [locale: string]: () => Array<L | Promise<{default: L} | L>>
}

type RootLocales<L extends StringValue> = {
    [locale: string]: Array<() => Array<L | Promise<{default: L} | L>>>
}

function mergeStrings<L extends StringValue>(strings: L, newStrings: Array<{default: L} | L>) {
    for (const texts of newStrings) {
        if (typeof texts.default === "object") {
            Object.assign(strings, texts.default);
        } else {
            Object.assign(strings, texts);
        }
    }
    return strings;
}

function mergeLocales<L extends StringValue>(locales: RootLocales<L>, newLocales: Locales<L>){
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
export function connectLanguage<L extends StringValue>(locales: Locales<L>) {
    const strings: StringValue = {};
    let languageLoaded = false;
    const components: Component[] = [];

    const rootLocales: RootLocales<L> = {};
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

    function string<K extends keyof L>(key: K) {
        return strings[key as keyof StringValue] as L[K];
    }
    function is_str(key: unknown): key is keyof L {
        return key as string in strings;
    }
    
    return function<P = unknown>(Child: WrapTarget<L, P>): ComponentConstructor<P> {
        return class Wrapper extends Component<P> {
            componentWillUnmount() {
                unmount(this);
            }
            componentDidMount() {
                components.push(this);
            }
            render() {
                return languageLoaded && <Child {...this.props} str={string} isStr={is_str} />;
            }
        };
    }
}
