import { AnyComponent } from "preact";
import { LanguageProps, Locales } from "./connect";
import { connectLanguage } from "./connect";

export function Wrapper<L>(locales: Locales) {
    const connect = connectLanguage<L>(locales);

    return <P = unknown, S = unknown>(Child: AnyComponent<P & LanguageProps<L>, S>, componentLocales?: Locales) => connect<P, S>(Child, componentLocales);
}
