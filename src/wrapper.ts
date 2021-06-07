import { ComponentConstructor } from "preact";
import { connectLanguage, WrapTarget, Locales, StringValue } from "./connect";

export function WrapLanguage<L extends StringValue>(locales: Locales) {
    const connect = connectLanguage<L>(locales);

    return <P = unknown>(Child: WrapTarget<L, P>) => connect<P>(Child) as ComponentConstructor<P>;
}
