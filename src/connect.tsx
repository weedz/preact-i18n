import { h, Component, AnyComponent } from "preact";

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

type StringFunction = {
    (...params: any): string
}
export type StringValue = {
    [key: string]: string | StringFunction
};

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
export function connectLanguage<L>(locales: {[key: string]: () => Promise<any>[]}) {
    const strings: StringValue = {};
    let languageLoaded = false;
    const components: any = [];

    subscribe(setLanguage);

    setLanguage(currentLanguage());

    async function setLanguage(language: string) {
        const locale = locales[language] || locales["en"];
        mergeStrings(strings, await Promise.all(locale()));
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

    function string(key: keyof L) {
        return (strings as unknown as any)[key];
    }

    return function<P = unknown, S = unknown>(Child: AnyComponent<P & LanguageProps<L>, S>) {
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
        }
    }
}
