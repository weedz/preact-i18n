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
import connectLanguage, { localize, changeLanguage } from 'preact-i18n';

const locales = localize({
    "en": () => [import('./en.js')],
    "sv": () => [import('./sv.js')]
});

function wrapper(child) {
    return connectLanguage(child, locales);
}

function App(props) {
    return (
        <input onclick={() => changeLanguage("sv")} value="Change language">
        <p>{this.props.string("string-id")}</p>
        <p>{this.props.string("string-param", "Hello World!")}</p>
    )
}

export default wrapper(App);
```
