import { h, Component, AnyComponent, ComponentConstructor } from "preact";

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

export interface LanguageProps<T = StringValue> {
    readonly str: <K extends keyof T>(key: K) => T[K]
}

export type WrapTarget<L = unknown, P = unknown, S = unknown> = AnyComponent<P & LanguageProps<L>, S> | ComponentConstructor<P & LanguageProps<L>, S>;

type StringFunction = {
    (...params: any): string
}
export type StringValue = {
    [key: string]: string | StringFunction
};
export type Locales = {
    [locale: string]: () => Promise<any>[]
}

function mergeStrings(strings: StringValue, newStrings: StringValue[]) {
    for (const texts of newStrings) {
        if (typeof texts.default === "object") {
            Object.assign(strings, texts.default);
        } else {
            Object.assign(strings, texts);
        }
    }
    return strings;
}

function mergeLocales(locales: {[locale: string]: Array<() => Promise<any>[]>}, newLocales: Locales){
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
export function connectLanguage<L>(locales: Locales) {
    const strings: StringValue = {};
    let languageLoaded = false;
    const components: any = [];

    const rootLocales: {[locale: string]: Array<() => Promise<any>[]>} = {};
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
    function unmount(component: any) {
        components.splice(components.indexOf(component)>>>0, 1);
        if (!components.length) {
            unsubscribe(setLanguage);
        }
    }

    function string(key: string) {
        return strings[key];
    }
    
    return function<P = unknown, S = unknown, ComponentLocales = unknown>(Child: WrapTarget<L & ComponentLocales, P, S>, componentLocales?: Locales) {
        if (componentLocales) {
            mergeLocales(rootLocales, componentLocales);
        }
        return class Wrapper extends Component<P> {
            componentWillUnmount() {
                unmount(this);
            };
            componentWillMount() {
                components.push(this);
            };
            render() {
                // TODO: Fix this.
                // @ts-ignore
                return languageLoaded && <Child {...this.props} str={string} />;
            };
        } as ComponentConstructor<P>
    }
}
