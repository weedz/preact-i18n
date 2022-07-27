import { useEffect, useState } from "preact/hooks";
import { subscribe, unsubscribe } from "./connect";
import { strings } from "./utils";

export function useLanguage() {
    const [t, setStrings] = useState<Readonly<typeof strings>>(strings);

    useEffect(() => {
        function updateStrings(newStrings: typeof strings) {
            setStrings(newStrings);
        }
        subscribe(updateStrings);
        return () => {
            unsubscribe(updateStrings);
        }
    });

    return t;
}
