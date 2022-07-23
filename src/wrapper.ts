import { ComponentConstructor } from "preact";
import { connectLanguage, WrapTarget } from "./connect";

export function withLanguage<P = unknown>(Child: WrapTarget<P>) {
    return connectLanguage<P>(Child) as ComponentConstructor<P>;
}
