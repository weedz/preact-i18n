# preact-i18n

## Example

```js
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

// App.js
import connectLanguage, { changeLanguage } from "preact-i18n-weedz";

const locales = {
    "en": () => [import("./en.js")],
    "sv": () => [import("./sv.js")],
    // this also works
    // "en": () => [{
    //     "string-id": "EN"
    // }]
}

const wrapper = connectLanguage(locales);

function App(props) {
    return (
        <input onclick={() => changeLanguage("sv")} value="Change language">
        <p>{this.props.string["string-id"]}</p>
        <p>{this.props.string["string-param"]("Hello World!")}</p>
    )
}

export default wrapper(App);
```
