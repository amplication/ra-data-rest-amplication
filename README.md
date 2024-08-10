# Amplication REST Data Provider For React-Admin

A REST API data provider for [react-admin](https://github.com/marmelab/react-admin/)
built for REST API generated with [Amplication](https://amplication.com)

## Installation

```sh
npm install --save ra-data-rest-amplication
```

## Usage

Create a Data Provider by calling the `amplicationRestProvider` function with the API URL as first argument. Then pass this Data Provider to the `<Admin>` component.

```jsx
// in src/App.js
import * as React from "react";
import { Admin, Resource } from "react-admin";
import amplicationRestProvider from "ra-data-rest-amplication";

import { PostList } from "./posts";

const App = () => (
  <Admin dataProvider={simpleRestProvider("http://my.api.url/")}>
    <Resource name="posts" list={PostList} />
  </Admin>
);

export default App;
```

The `amplicationRestProvider` function accepts a second parameter, which is an HTTP client function. By default, it uses react-admin's [`fetchUtils.fetchJson()`](https://marmelab.com/react-admin/fetchJson.html) as HTTP client. It's similar to HTML5 `fetch()`, except it handles JSON decoding and HTTP error codes automatically.

You can wrap this call in your own function to [add custom headers](#adding-custom-headers), for instance to set an `Authorization` bearer token:

```jsx
import { fetchUtils, Admin, Resource } from "react-admin";
import amplicationRestProvider from "ra-data-rest-amplication";

const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" });
  }
  const { token } = JSON.parse(localStorage.getItem("auth"));
  options.headers.set("Authorization", `Bearer ${token}`);
  return fetchUtils.fetchJson(url, options);
};
const dataProvider = amplicationRestProvider(
  "http://localhost:3000",
  httpClient
);

const App = () => (
  <Admin dataProvider={dataProvider} authProvider={authProvider}>
    ...
  </Admin>
);
```

## REST Dialect

This Data Provider fits REST APIs using simple GET parameters for filters and sorting. This is the dialect used for instance in [FakeRest](https://github.com/marmelab/FakeRest).

The `ra-data-rest-amplication` providers works against a REST server that was generated with Amplication, or respects its grammar.

## Adding Custom Headers

The provider function accepts an HTTP client function as second argument. By default, they use react-admin's `fetchUtils.fetchJson()` as HTTP client. It's similar to HTML5 `fetch()`, except it handles JSON decoding and HTTP error codes automatically.

That means that if you need to add custom headers to your requests, you just need to _wrap_ the `fetchJson()` call inside your own function:

```jsx
import { fetchUtils, Admin, Resource } from "react-admin";
import amplicationRestProvider from "ra-data-rest-amplication";

const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" });
  }
  // add your own headers here
  options.headers.set("X-Custom-Header", "foobar");
  return fetchUtils.fetchJson(url, options);
};
const dataProvider = amplicationRestProvider(
  "http://localhost:3000",
  httpClient
);

render(
  <Admin dataProvider={dataProvider} title="Example Admin">
    ...
  </Admin>,
  document.getElementById("root")
);
```

Now all the requests to the REST API will contain the `X-Custom-Header: foobar` header.

## Enabling Query Cancellation

To enable query cancellation, you need to set the `supportAbortSignal` property of the data provider to `true`. This will allow react-admin to cancel queries when the user navigates away from a view before the query is completed.

```tsx
const dataProvider = amplicationRestProvider("https://myapi.com");
dataProvider.supportAbortSignal = true;
```

## License

This data provider is licensed under the MIT License, and sponsored by [amplication](https://amplication.com).

## Credits

This provider was built on top of the source code of `ra-data-simple-rest`

https://github.com/marmelab/react-admin/tree/master/packages/ra-data-simple-rest
