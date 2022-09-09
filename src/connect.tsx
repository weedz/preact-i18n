import { h, Component, ComponentClass, FunctionComponent, ComponentConstructor } from "preact";
import { currentLanguage, is_str, Locales, mergeLocales, setLanguage, string, strings } from "./utils.js";

export interface LanguageProps {
    readonly t: typeof string
    readonly isValidStr: typeof is_str
}

export type WrapTarget<P = unknown> = ComponentClass<P & LanguageProps> | FunctionComponent<P & LanguageProps>;

let languageLoaded = false;
const components: Component[] = [];
const listeners: Array<(t: typeof strings) => void> = [];

export function storeLocale(locales: Locales) {
    mergeLocales(locales);
    changeLanguage(currentLanguage());
}

export async function changeLanguage(language: string) {
    await setLanguage(language);

    languageLoaded = true;
    for (const listener of listeners) {
        listener(strings);
    }
    for (const component of components) {
        component.forceUpdate();
    }
}

function unmount(component: Component) {
    components.splice(components.indexOf(component)>>>0, 1);
}
export function subscribe(cb: typeof listeners[0]) {
    listeners.push(cb);
}
export function unsubscribe(cb: typeof listeners[0]) {
    listeners.splice(listeners.indexOf(cb)>>>0, 1);
}

export function withLanguage<P = unknown>(Child: WrapTarget<P>): ComponentConstructor<P> {
    return class Wrapper extends Component<P> {
        componentWillUnmount() {
            unmount(this);
        }
        componentDidMount() {
            components.push(this);
        }
        render() {
            return languageLoaded && <Child {...this.props} t={string} isValidStr={is_str} />;
        }
    };
}
