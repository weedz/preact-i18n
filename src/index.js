import { h, Component } from "preact";

let language = "en";
let listeners = [];

export function subscribe(listener) {
    listeners.push(listener);
    return () => { unsubscribe(listener); };
}
function unsubscribe(listenerRemove) {
    listeners = listeners.filter(listener => listener !== listenerRemove);
    listenerRemove = null;
}

export function mergeStrings(strings = {}, newStrings) {
    for (let texts of newStrings) {
        if (typeof texts.default === "object") {
            Object.assign(strings, texts.default);
        } else {
            Object.assign(strings, texts);
        }
    }
    return strings;
}

export function changeLanguage(newLanguage) {
    language = newLanguage;
    for (let listener of listeners) {
        listener(newLanguage);
    }
}
export function currentLanguage() {
    return language;
}


export function localize(locales) {
    return {
        activeLocale: {},
        languages: locales
    };
}

export default function connectLanguage(Child, locales) {
    return class Wrapper extends Component {
        constructor() {
            super();
            this.state = {
                languageLoaded: false
            };
        }
        
        async setLanguage(language) {
            if (!locales.languages[language]) {
                // TODO: set/get default language
                language = "en";
            }
            mergeStrings(locales.activeLocale, await Promise.all(locales.languages[language]()));
            this.setState({languageLoaded: true});
        }
        string(id, ...params) {
            if (typeof locales.activeLocale[id] === "function") {
                return locales.activeLocale[id](...params);
            }
            return locales.activeLocale[id];
        }
        componentDidMount() {
            this.unsubscribe = subscribe(newLanguage => {
                this.setLanguage(newLanguage);
            });
        };
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
