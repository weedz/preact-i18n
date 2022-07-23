# preact-i18n

[![npm](https://img.shields.io/npm/v/@weedzcokie/i18n-preact?style=flat-square)](https://www.npmjs.com/package/@weedzcokie/i18n-preact)

## Example

### JavaScript

```jsx
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

// App.jsx
import { withLanguage, storeLocale, changeLanguage } from "@weedzcokie/i18n-preact";

storeLocale({
    "en": () => [import("./en.js")],
    "sv": () => [import("./sv.js")],
    // this also works
    // "en": () => [{
    //     "string-id": "EN"
    // }]
});

function App(props) {
    return (
        <div>
            <input onclick={() => changeLanguage("sv")} value="Change language" />
            <p>{this.props.t("string-id")}</p>
            <p>{this.props.t("string-param")("Hello World!")}</p>
        </div>
    );
}

export default withLanguage(App);
```

### TypeScript

`tsconfig.json`:
```jsonc
{
    "compilerOptions": {
        // ...
    },
    "include": [
        "src",
        "@types"
    ]
}
```

`@types/@weedzcokie/preact-i18n.d.ts`:
```typescript
import { locales } from "src/i18n";
import ns1 from "src/i18n/en";
declare module "@weedzcokie/i18n-preact" {
    type AllLocales = typeof locales;
    type StringValues = typeof ns1;

    type AllStrings = {
        [K in keyof StringValues]: StringValues[K];
    };
    // Extend interfaces from `@weedzcokie/i18n-preact` with the actual values used
    interface StringValue extends AllStrings {}
    interface Locales extends AllLocales {}
}
```

```tsx
// src/en.ts
export default {
    "string-id": "EN",
    "string-param": (param: string) => `${param}, EN`
}

// src/sv.ts
export default {
    "string-id": "SV",
    "string-param": (param: string) => `${param}, SV`
}

// src/i18n/index.ts
import { storeLocale } from "@weedzcokie/i18n-preact";

export const locales = {
    "en": () => [import("./en")],
    "sv": () => [import("./sv")],
    // this also works
    // "en": () => [{
    //     "string-id": "EN"
    // }]
};
storeLocale(locales);

// src/App.tsx
import { changeLanguage, withLanguage } from "@weedzcokie/i18n-preact";
import "src/i18n"; // initialize locale store

function App(props: LanguageProps) {
    return (
        <div>
            <input onclick={() => changeLanguage("sv")} value="Change language" />
            <p>{this.props.t("string-id")}</p>
            <p>{this.props.t("string-param")("Hello World!")}</p>
        </div>
    );
}

export default withLanguage(App);
```

#### `preact-router`

With `preact-router` we need to declare "routable" components as:
```tsx
// src/About.tsx
import type { LanguageProps } from "@weedzcokie/i18n-preact";
import { RoutableProps } from "preact-router";
import withLanguage from "../i18n";

type Props = RoutableProps & LanguageProps & {
    msg: string
};

function About(props: Props) {
    return (
        <div>
            <h1>About</h1>
            <p>{props.msg}</p>
            <p>{props.t("string-id")}</p>
        </div>
    );
}

export default withLanguage(About);

// src/App.tsx
import { Route, Router } from "preact-router";
// ...
<Router>
    <About path="/about" msg="Test props" />
    { /* or as a `Route` */}
    <Route component={About} path="/about" msg="Test props" />
</Router>
```
