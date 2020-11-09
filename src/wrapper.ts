import { AnyComponent } from "preact";
import { LanguageProps } from "./connect";
import { connectLanguage } from "./connect";

export function Wrapper<L>(locales: {[key: string]: () => Promise<any>[]}) {
    const connect = connectLanguage<L>(locales);

    return <P = unknown, S = unknown>(Child: AnyComponent<P & LanguageProps<L>, S>) => connect<P, S>(Child);
}
