import { connectLanguage, WrapTarget, Locales, StringValue } from "./connect";

export function WrapLanguage<L extends StringValue>(locales: Locales) {
    const connect = connectLanguage<L>(locales);

    return <P = unknown, S = unknown, ComponentLocales = unknown>(Child: WrapTarget<L & ComponentLocales, P, S>, componentLocales?: Locales) => connect<P, S, ComponentLocales>(Child, componentLocales);
}
