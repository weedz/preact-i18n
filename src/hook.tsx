import { useEffect, useState } from "preact/hooks";
import { subscribe, unsubscribe } from "./connect.js";
import { strings } from "./utils.js";

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
