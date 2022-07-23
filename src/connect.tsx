import { h, Component, ComponentClass, FunctionComponent, ComponentConstructor } from "preact";
import { is_str, Locales, mergeLocales, setLanguage, string } from "./utils";

let language = "en";

export interface LanguageProps {
    readonly t: typeof string
    readonly isValidStr: typeof is_str
}

export type WrapTarget<P = unknown> = ComponentClass<P & LanguageProps> | FunctionComponent<P & LanguageProps>;

export function changeLanguage(newLanguage: string) {
    language = newLanguage;
    componentSetLanguage(language);
}
export function currentLanguage() {
    return language;
}

export function storeLocale(locales: Locales) {
    mergeLocales(locales);
    componentSetLanguage(currentLanguage());
}

let languageLoaded = false;
const components: Component[] = [];

async function componentSetLanguage(language: string) {
    await setLanguage(language);

    languageLoaded = true;
    for (const component of components) {
        component.forceUpdate();
    }
}

function unmount(component: Component) {
    components.splice(components.indexOf(component)>>>0, 1);
}

export function connectLanguage<P = unknown>(Child: WrapTarget<P>): ComponentConstructor<P> {
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
