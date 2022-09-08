---
template: BlogPost
date: 2022-09-07
published: true
title: "Vite + REACT + Zustand."
source: "https://gitlab.com/jameskolean/redux-toolkit"
tags:
  - React
  - Rest
  - Tools
thumbnail: /assets/polaroids-unsplash.jpg
---

# Zustand

In the previous post, I implemented a REACT app with Redux Toolkit, which is much better than Redux.

Let's see what the same example looks like using [Zustand](https://github.com/pmndrs/zustand). I think I will like this better, but who knows until we make the comparison?

## Create React Application with Vite

```shell
> npm init vite zustand
Need to install the following packages:
  create-vite@3.1.0
Ok to proceed? (y)
✔ Select a framework: › React
✔ Select a variant: › TypeScript

> cd zustand
> npm install
> npm run dev
> open http://localhost:5173/
```

## Implement Counter

Install dependencies

```shell
npm install zustand
```

### Create Store and Use

WOW, this is way simpler!! One file.

```typescript
// src/App.tsx
import { useState } from "react";
import create from "zustand";
import { devtools } from "zustand/middleware";
import "./App.css";

function App() {
  const [incrementAmount, setIncrementAmount] = useState("2");
  const mystore = useStore();
  const { count, increment, decrement, incrementByAmount } = useStore();
  return (
    <div className="App">
      <h1>Vite + React + Zustand</h1>
      <div className="card">
        <div className="button-bar">
          <button onClick={increment}>+</button>
          <button onClick={decrement}>-</button>
        </div>
        <p> count is {count}</p>
        <div className="button-bar">
          <input
            className="textbox"
            aria-label="Set increment amount"
            value={incrementAmount}
            onChange={(e) => setIncrementAmount(e.target.value)}
          />
          <button
            onClick={() => {
              incrementByAmount(Number(incrementAmount) || 0);
            }}
          >
            Add Amount
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

// define the store
interface AppStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  incrementByAmount: (amount: number) => void;
}

export const useStore = create<AppStore>()(
  devtools((set) => ({
    count: 0,
    increment: () => {
      set((state) => ({ count: state.count + 1 }));
    },
    decrement: () => {
      set((state) => ({ count: state.count - 1 }));
    },
    incrementByAmount: (amount: number) => {
      set((state) => ({ count: state.count + amount }));
    },
  }))
);
```

Here is the CSS

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
