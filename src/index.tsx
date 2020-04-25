import { h, Component } from "preact";

let language = "en";
let listeners: Function[] = [];

export function subscribe(listener: Function) {
    listeners.push(listener);
    return () => { unsubscribe(listener); };
}
function unsubscribe(cb: Function) {
    listeners.splice(listeners.indexOf(cb)>>>0, 1);
}

type Strings = {
    [key: string]: string|Function
};

export function mergeStrings(strings: Strings = {}, newStrings: Strings[]) {
    for (let texts of newStrings) {
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
    for (let listener of listeners) {
        listener(newLanguage);
    }
}
export function currentLanguage() {
    return language;
}


export function localize(locales: {[language: string]: Function}): {
    activeLocale: Strings,
    languages: typeof locales
} {
    return {
        activeLocale: {},
        languages: locales
    };
}

export type LanguageProps = {
    string: Strings
}

// export function connectLanguage(Child: VNode<typeof locales>, locales: ReturnType<typeof localize>) {
export function connectLanguage(
    Child: any,
    locales: ReturnType<typeof localize>
) {
    return class Wrapper extends Component<{}, {languageLoaded: boolean}> {
        unsubscribe: Function;
        constructor() {
            super();
            this.state = {
                languageLoaded: false
            };
            this.unsubscribe = subscribe((newLanguage: string) => {
                this.setLanguage(newLanguage);
            });
        }
        
        async setLanguage(language: string) {
            if (!locales.languages[language]) {
                // TODO: set/get default language
                language = "en";
            }
            mergeStrings(locales.activeLocale, await Promise.all(locales.languages[language]()));
            this.setState({languageLoaded: true});
        }
        string(id: string, ...params: any) {
            const activeLocale = locales.activeLocale[id];
            if (typeof activeLocale === "function") {
                return activeLocale(...params);
            }
            return locales.activeLocale[id];
        }
        componentWillUnmount() {
            if (this.unsubscribe) {
                this.unsubscribe();
            }
        };
        componentWillMount() {
            const language = currentLanguage();
            this.setLanguage(language);
        };
        render() {
            return this.state.languageLoaded && <Child {...this.props} string={this.string} />;
        };
    }
}
