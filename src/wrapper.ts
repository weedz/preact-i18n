import { connectLanguage, WrapTarget, Locales } from "./connect";

export function Wrapper<L>(locales: Locales) {
    const connect = connectLanguage<L>(locales);

    return <P = unknown, S = unknown, ComponentLocales = unknown>(Child: WrapTarget<L & ComponentLocales, P, S>, componentLocales?: Locales) => connect<P, S, ComponentLocales>(Child, componentLocales);
}
