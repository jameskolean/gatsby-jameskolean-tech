---
template: BlogPost
date: 2022-09-06
published: true
title: "Vite + REACT + Redux Toolkit."
source: "https://gitlab.com/jameskolean/redux-toolkit"
tags:
  - React
  - Rest
  - Tools
thumbnail: /assets/photo-album-unsplash.jpg
---

# Redux toolkit

I'm not a Redux fan. Mobx always made more sense to me and was far easier to use. However, Redux seems to the VHS of global state management. Redux Toolkit round the sharp edges, making Redux dev friendly.

This repo is based on [Let’s Learn Modern Redux! (with Mark Erikson) — Learn With Jason](https://www.youtube.com/watch?v=9zySeP5vH9c). Check out that video for details. You will not find details here.

## Create React Application with Vite

```shell
> npm init vite redux-toolkit
We need to install the following packages:
  create-vite@3.0.2
Ok to proceed? (y) y
✔ Select a framework: › react
✔ Select a variant: › react-ts

> npm i
> npm run dev && open http://localhost:5173/
```

## Implement Counter

Install dependencies

```shell
npm install @reduxjs/toolkit react-redux
```

### Create Slice

```typescript
// src/features/counter/counterSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value++;
    },
    decrement: (state) => {
      state.value--;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
```

### Create a store

```typescript
// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
```

### Create custom hooks

```typescript
// src/app/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Wire up provider

```typescript
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { store } from "./app/store";
import { Provider } from "react-redux";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

### Edit the App and CSS

```typescript
// src/App.tsx
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import {
  increment,
  decrement,
  incrementByAmount,
} from "./features/counter/counterSlice";
import "./App.css";

function App() {
  const counterValue = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = useState("2");

  return (
    <div className="App">
      <h1>Vite + React + Redux Toolkit</h1>
      <div className="card">
        <div className="button-bar">
          <button onClick={() => dispatch(increment())}>+</button>
          <button onClick={() => dispatch(decrement())}>-</button>
        </div>
        <p> count is {counterValue}</p>
        <div className="button-bar">
          <input
            className="textbox"
            aria-label="Set increment amount"
            value={incrementAmount}
            onChange={(e) => setIncrementAmount(e.target.value)}
          />
          <button
            onClick={() =>
              dispatch(incrementByAmount(Number(incrementAmount) || 0))
            }
          >
            Add Amount
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
```

```css
/* src/App.css */
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}

.button-bar {
  display: flex;
  gap: 5px;
  justify-content: center;
}
.textbox {
  font-size: 32px;
  padding: 2px;
  width: 64px;
  text-align: center;
  margin-right: 8px;
}
```

```css
/* src/index.css */
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
```

## Implement REST API call

This is an example that uses RTK Query.

Install dependencies

```shell
npm install axios
```

### Create a Slice for API calls

```typescript
// src/features/cats/catsApiSlice.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://catfact.ninja",
    prepareHeaders(headers) {
      // set additional headers hers
      return headers;
    },
  }),
  endpoints(builder) {
    return {
      fetchFacts: builder.query<CatFactPage, number | void>({
        query(limit = 5) {
          return `/facts?limit=${limit}`;
        },
      }),
    };
  },
});

export const { useFetchFactsQuery } = apiSlice;

interface CatFactPage {
  current_page: number;
  data: [
    {
      fact: string;
      length: number;
    }
  ];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: [
    {
      url: string | null;
      label: string;
      active: boolean;
    }
  ];
  next_page_url: string;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
```

### Update the Store

```typescript
// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import { apiSlice } from "../features/cats/catsApiSlice";
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(apiSlice.middleware);
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
```

### Update the UI

```typescript
// src/App.tsx
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import {
  increment,
  decrement,
  incrementByAmount,
} from "./features/counter/counterSlice";
import { useFetchFactsQuery } from "./features/cats/catsApiSlice";
import "./App.css";

function App() {
  const counterValue = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = useState("2");
  const [factLimit, setfactLimit] = useState(5);
  const { data, isFetching = [] } = useFetchFactsQuery(factLimit);

  return (
    <div className="App">
      <h1>Vite + React + Redux Toolkit</h1>
      <div className="card">
        <div className="button-bar">
          <button onClick={() => dispatch(increment())}>+</button>
          <button onClick={() => dispatch(decrement())}>-</button>
        </div>
        <p> count is {counterValue}</p>
        <div className="button-bar">
          <input
            className="textbox"
            aria-label="Set increment amount"
            value={incrementAmount}
            onChange={(e) => setIncrementAmount(e.target.value)}
          />
          <button
            onClick={() =>
              dispatch(incrementByAmount(Number(incrementAmount) || 0))
            }
          >
            Add Amount
          </button>
        </div>
        <div>
          <p>Cat Facts</p>
          <ul>
            {data != null &&
              data.data.map(({ fact }, index) => (
                <li key={index}>{JSON.stringify(fact)}</li>
              ))}
          </ul>
        </div>
        <div className="button-bar">
          <p>Facts to Fetch</p>
          <input
            className="textbox"
            aria-label="Set fact limit"
            value={factLimit}
            onChange={(e) => setfactLimit(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
```
