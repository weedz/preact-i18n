import { h, Component, ComponentConstructor, AnyComponent } from "preact";

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

export interface StringProps<T = StringValue> {
    string?: T
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

export function connectLanguage(locales: {[key: string]: () => Promise<any>[]}) {
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

    return function<T = {}, S = {}>(Child: ComponentConstructor<T, S> | AnyComponent<T, S>) {
        return class Wrapper extends Component<T> {
            componentWillUnmount() {
                unmount(this);
            };
            componentWillMount() {
                components.push(this);
            };
            render() {
                // TODO: Fix this.
                // @ts-ignore
                return languageLoaded && <Child {...this.props} string={strings} />;
            };
        }
    }
}
