import { useEffect, useState } from "preact/hooks";
import { subscribe, unsubscribe } from "./connect.js";
import { strings } from "./utils.js";

export function useLanguage() {
    const [currentState, setState] = useState(false);

    useEffect(() => {
        function updateStrings(_newStrings: typeof strings) {
            setState(!currentState);
        }
        subscribe(updateStrings);
        return () => {
            unsubscribe(updateStrings);
        }
    });

    return strings as Readonly<typeof strings>;
}
