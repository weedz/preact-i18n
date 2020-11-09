# preact-i18n

## Example

```tsx
// en.js
export default {
    "string-id": "EN",
    "string-param": (param) => `${param}, EN`
}

// sv.js
export default {
    "string-id": "SV",
    "string-param": (param) => `${param}, SV`
}

// App.tsx
import Wrapper, { changeLanguage, LanguageProps } from "preact-i18n-weedz";

const locales = {
    "en": () => [import("./en.js")],
    "sv": () => [import("./sv.js")],
    // this also works
    // "en": () => [{
    //     "string-id": "EN"
    // }]
}

type StringValues = typeof import("./en").default;

const wrapper = Wrapper<StringValues>(locales);

type Props = {};
function App(props: Props & LanguageProps<StringValues>) {
    return (
        <div>
            <input onclick={() => changeLanguage("sv")} value="Change language">
            <p>{this.props.string["string-id"]}</p>
            <p>{this.props.string["string-param"]("Hello World!")}</p>
        </div>
    )
}

export default wrapper<Props>(App);
```
