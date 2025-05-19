我们已经在本书中多次接触 TypeScript 的 `tsconfig.json` 配置文件。让我们更深入地了解一下。我们不会涵盖 `tsconfig.json` 中的每一个选项——其中许多选项已经过时且很少使用——但我们会介绍最重要的那些。

## 推荐配置

首先，这里是一个推荐的基础 `tsconfig.json` 配置，其中的选项适用于你正在构建的大多数应用程序：

```json
{
  "compilerOptions": {
    /* 基本选项：*/
    "skipLibCheck": true,
    "target": "es2022",
    "esModuleInterop": true,
    "allowJs": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "strict": true,
    "noUncheckedIndexedAccess": true
}
```

以下是每个设置的作用：

- `skipLibCheck`：跳过对声明文件的类型检查，从而提高编译速度。我们在前一章中介绍过这一点。
- `target`：指定编译后 JavaScript 代码的 ECMAScript 目标版本。目标设为 `es2022` 可以让你使用一些相对较新的 JavaScript 特性——但当你阅读本书时，你可能需要设定一个更新的版本。
- `esModuleInterop`：在 CommonJS 和 ES 模块之间启用更好的兼容性。
- `allowJs`：允许将 JavaScript 文件导入到 TypeScript 项目中。
- `resolveJsonModule`：允许将 JSON 文件导入到你的 TypeScript 项目中。
- `moduleDetection`：`force` 选项告诉 TypeScript 将所有 `.ts` 文件视为模块，而不是脚本。我们在前一章中介绍过这一点。
- `isolatedModules`：确保每个文件都可以独立转译，而无需依赖其他文件的信息。
- `strict`：启用一组严格的类型检查选项，可以捕获更多错误并通常能提升代码质量。
- `noUncheckedIndexedAccess`：对索引访问操作强制执行更严格的类型检查，从而捕获潜在的运行时错误。

设置完这些基本选项后，还需要根据你正在处理的项目类型添加其他几个选项。

### 其他配置选项

设置完基础的 `tsconfig.json` 后，你需要问自己几个问题来决定包含哪些额外的选项。

**你是否使用 TypeScript 转译代码？**
如果是，将 `module` 设置为 `NodeNext`。

**你是否正在为库构建？**
如果你正在为库构建，请将 `declaration` 设置为 `true`。如果你正在 monorepo 中为库构建，请将 `composite` 设置为 `true`，并将 `declarationMap` 设置为 `true`。

**你是否不使用 TypeScript 转译？**
如果你使用其他工具（如 ESbuild 或 Babel）来转译代码，请将 `module` 设置为 `Preserve`，并将 `noEmit` 设置为 `true`。

**你的代码是否在 DOM 中运行？**
如果是，请将 `lib` 设置为 `["dom", "dom.iterable", "es2022"]`。如果不是，请将其设置为 `["es2022"]`。

### 完整的基础配置

根据你对上述问题的回答，完整的 `tsconfig.json` 文件如下所示：

```json
{
  "compilerOptions": {
    /* 基本选项：*/
    "skipLibCheck": true,
    "target": "es2022",
    "esModuleInterop": true,
    "allowJs": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true,

    /* 严格性 */
    "strict": true,
    "noUncheckedIndexedAccess": true,

    /* 如果使用 tsc 转译：*/
    "module": "NodeNext",
    "outDir": "dist",
    "sourceMap": true,
    "verbatimModuleSyntax": true,

    /* 并且如果你正在构建一个库：*/
    "declaration": true,

    /* 并且如果你正在 monorepo 中构建一个库：*/
    "composite": true,
    "declarationMap": true,

    /* 如果不使用 tsc 转译：*/
    "module": "Preserve",
    "noEmit": true,

    /* 如果你的代码在 DOM 中运行：*/
    "lib": ["es2022", "dom", "dom.iterable"],

    /* 如果你的代码不在 DOM 中运行：*/
    "lib": ["es2022"]
  }
}
```

现在我们已经了解了大概情况，让我们更详细地看看这些选项。

## 基本选项

### `target`

`target` 选项指定 TypeScript 生成 JavaScript 代码时应针对的 ECMAScript 版本。

例如，将 `target` 设置为 `ES5` 将尝试将你的代码转换为与 ECMAScript 5 兼容。

像可选链和空值合并这样晚于 ES5 引入的语言特性仍然可用：

```tsx
// 可选链
const search = input?.search;

// 空值合并
const defaultedSearch = search ?? "Hello";
```

但是当它们被转换成 JavaScript 时，它们会被转换成在 ES5 环境中工作的代码：

```javascript
// 可选链
var search = input === null || input === void 0 ? void 0 : input.search;
// 空值合并
var defaultedSearch = search !== null && search !== void 0 ? search : "Hello";
```

#### `target` 不会进行 Polyfill

虽然 `target` 可以将较新的语法转译到较旧的环境中，但它不会对目标环境中不存在的 API 执行相同的操作。

例如，如果你针对的是不支持字符串 `.replaceAll` 方法的 JavaScript 版本，TypeScript 不会为你 polyfill 它：

```tsx
const str = "Hello, world!";

str.replaceAll("Hello,", "Goodbye, cruel");
```

这段代码会在你的目标环境中报错，因为 `target` 不会为你转换它。如果你需要支持旧环境，你需要自己寻找 polyfill。你可以使用 `lib` 来配置代码执行的环境，就像我们在前一章看到的那样。

如果你不确定为 `target` 指定什么，请使其与你在 `lib` 中指定的版本保持一致。

### `esModuleInterop`

`esModuleInterop` 是一个旧标志，于 2018 年发布。它有助于 CommonJS 和 ES 模块之间的互操作性。当时，TypeScript 在处理通配符导入和默认导出方面与 Babel 等常用工具有些许偏差。`esModuleInterop` 使 TypeScript 与这些工具保持一致。

你可以阅读[发行说明](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#support-for-import-d-from-cjs-from-commonjs-modules-with---esmoduleinterop)了解更多详情。总而言之，当你构建应用程序时，应始终开启 `esModuleInterop`。甚至有一个提议建议在 TypeScript 6.0 中将其设为默认值。

### `isolatedModules`

`isolatedModules` 会阻止一些单文件转译器无法处理的 TypeScript 语言特性。

有时你会使用 `tsc` 以外的其他工具将 TypeScript 转换为 JavaScript。这些工具，如 `esbuild`、`babel` 或 `swc`，无法处理所有的 TypeScript 特性。`isolatedModules` 会禁用这些特性，从而更容易使用这些工具。

考虑这个使用 `declare const` 创建的 `AlbumFormat` 枚举的例子：

```ts twoslash
// @errors: 2748
// @isolatedModules: true
declare const enum AlbumFormat {
  CD,
  Vinyl,
  Digital,
}

const largestPhysicalSize = AlbumFormat.Vinyl;
```

回想一下，`declare` 关键字会将 `const enum` 置于环境上下文中，这意味着它会在运行时被擦除。

当 `isolatedModules` 被禁用时，这段代码将编译通过，没有任何错误。

然而，当 `isolatedModules` 启用时，`AlbumFormat` 枚举将不会被擦除，TypeScript 会抛出一个错误。

这是因为只有 `tsc` 拥有足够的上下文来理解 `AlbumFormat.Vinyl` 应该是什么值。TypeScript 一次性检查你的整个项目，并将 `AlbumFormat` 的值存储在内存中。

当使用像 `esbuild` 这样的单文件转译器时，它没有这个上下文，所以它无法知道 `AlbumFormat.Vinyl` 应该是什么。因此，`isolatedModules` 是一种确保你没有使用那些难以转译的 TypeScript 特性的方法。

`isolatedModules` 是一个合理的默认设置，因为它使你的代码在需要切换到不同转译器时更具可移植性。它禁用的模式非常少，值得始终开启。

## 严格性

### `strict`

`tsconfig.json` 中的 `strict` 选项充当一次性启用多个不同类型检查选项的简写，包括捕获潜在的 `null` 或 `undefined` 问题以及对函数参数进行更强的检查等。

将 `strict` 设置为 `false` 会使 TypeScript 的行为方式不那么安全。没有 `strict`，TypeScript 将允许你将 `null` 赋给一个本应是字符串的变量：

```tsx
let name: string = null; // 没有错误
```

启用 `strict` 后，TypeScript 当然会捕获此错误。

事实上，我写这本书的整个前提都是你已经在你的代码库中启用了 `strict`。它是所有现代 TypeScript 应用程序的基线。

#### 你应该从 `strict: false` 开始吗？

你经常听到的一个关闭 `strict` 的理由是，这对初学者来说是一个很好的入门方式。你可以更快地启动和运行一个项目，而不必担心所有的严格性规则。

然而，我不认为这是一个好主意。许多著名的 TypeScript 库，如 `zod`、`trpc`、`@redux/toolkit` 和 `xstate`，在 `strict` 关闭时不会像你预期的那样运行。大多数社区资源，如 StackOverflow 和 React TypeScript Cheatsheet，都假设你启用了 `strict`。

不仅如此，一个以 `strict: false` 开始的项目很可能一直保持这种状态。在一个成熟的代码库上，开启 `strict` 并修复所有错误可能非常耗时。

所以，我将 `strict: false` 视为 TypeScript 的一个分支。这意味着你无法与许多库一起工作，寻求帮助更加困难，并会导致更多的运行时错误。

### `noUncheckedIndexedAccess`

`strict` 中不包含的一个严格性规则是 `noUncheckedIndexedAccess`。启用后，它通过检测访问数组或对象索引可能返回 `undefined` 的情况来帮助捕获潜在的运行时错误。

考虑这个 `VinylSingle` 接口的例子，它有一个 `tracks` 数组：

```typescript
interface VinylSingle {
  title: string;
  artist: string;
  tracks: string[];
}

const egoMirror: VinylSingle = {
  title: "Ego / Mirror",
  artist: "Burial / Four Tet / Thom Yorke",
  tracks: ["Ego", "Mirror"],
};
```

要访问 `egoMirror` 的 B 面，我们会像这样索引其 `tracks`：

```typescript
const bSide = egoMirror.tracks[1];
console.log(bSide.toUpperCase()); // 'MIRROR'
```

如果在 `tsconfig.json` 中未启用 `noUncheckedIndexedAccess`，TypeScript 会假定索引总是返回一个有效值，即使索引越界也是如此。

尝试访问一个不存在的第四条轨道在 VS Code 中不会引发错误，但会导致运行时错误：

```typescript
const nonExistentTrack = egoMirror.tracks[3];
console.log(nonExistentTrack.toUpperCase()); // VS Code 中没有错误

// 然而，运行代码会导致运行时错误：
// TypeError: Cannot read property 'toUpperCase' of undefined
```

通过将 `noUncheckedIndexedAccess` 设置为 `true`，TypeScript 会将每次索引访问的类型推断为 `T | undefined` 而不仅仅是 `T`。在这种情况下，`egoMirror.tracks` 中的每个条目都将是 `string | undefined` 类型：

```ts twoslash
// @noUncheckedIndexedAccess: true
interface VinylSingle {
  title: string;
  artist: string;
  tracks: string[];
}

const egoMirror: VinylSingle = {
  title: "Ego / Mirror",
  artist: "Burial / Four Tet / Thom Yorke",
  tracks: ["Ego", "Mirror"],
};

// ---cut---
const ego = egoMirror.tracks[0];
//    ^?
const mirror = egoMirror.tracks[1];
const nonExistentTrack = egoMirror.tracks[3];
```

然而，由于现在每条轨道的类型都是 `string | undefined`，即使对于有效的轨道，尝试调用 `toUpperCase` 也会出现错误：

```ts twoslash
// @errors: 18048
// @noUncheckedIndexedAccess: true
interface VinylSingle {
  title: string;
  artist: string;
  tracks: string[];
}

const egoMirror: VinylSingle = {
  title: "Ego / Mirror",
  artist: "Burial / Four Tet / Thom Yorke",
  tracks: ["Ego", "Mirror"],
};

const ego = egoMirror.tracks[0];
// ---cut---
console.log(ego.toUpperCase());
```

这意味着在访问数组或对象索引时，我们必须处理 `undefined`值的可能性。

因此，`noUncheckedIndexedAccess` 使 TypeScript 更加严格，但代价是必须更仔细地处理 `undefined` 值。

通常，这是一个很好的权衡，因为它有助于在开发过程的早期捕获潜在的运行时错误。但我不会怪你，如果你在某些情况下最终关闭了它。

### 其他严格性选项

我倾向于将我的 `tsconfig.json` 配置得不比 `strict` 和 `noUncheckedIndexedAccess` 更严格。如果你想更进一步，还有其他几个严格性选项可以启用：

- `allowUnreachableCode`：当检测到无法访问的代码时报错，例如 `return` 语句之后的代码。
- `exactOptionalPropertyTypes`：要求可选属性的类型与其声明的类型完全一致，而不是允许 `undefined`。
- `noFallthroughCasesInSwitch`：确保 `switch` 语句中任何非空的 `case` 块都以 `break`、`return` 或 `throw` 语句结束。
- `noImplicitOverride`：要求在覆盖基类方法时使用 `override`。
- `noImplicitReturns`：确保函数中的每个代码路径都返回值。
- `noPropertyAccessFromIndexSignature`：强制你在访问具有索引签名的对象的属性时使用 `example['access']`。
- `noUnusedLocals`：当声明了局部变量但从未使用时报错。
- `noUnusedParameters`：当声明了函数参数但从未使用时报错。

## `module` 的两种选择

`tsconfig.json` 中的 `module` 设置指定了 TypeScript 应如何处理你的导入和导出。主要有两个选择：`NodeNext` 和 `Preserve`。

- 当你想使用 TypeScript 编译器转译 TypeScript 代码时，选择 `NodeNext`。
- 当你使用像 Webpack 或 Parcel 这样的外部打包器时，选择 `Preserve`。

### `NodeNext`

如果你正在使用 TypeScript 编译器转译你的 TypeScript 代码，你应该在你的 `tsconfig.json` 文件中选择 `module: "NodeNext"`：

```json
{
  "compilerOptions": {
    "module": "NodeNext"
  }
}
```

`module: "NodeNext"` 也意味着 `moduleResolution: "NodeNext"`，所以我将一起讨论它们的行为。

使用 `NodeNext` 时，TypeScript 会模拟 Node 的模块解析行为，其中包括对 `package.json` 的 `"exports"` 字段等功能的支持。使用 `module: NodeNext` 发出的代码将能够在 Node.js 环境中运行，无需任何额外处理。

使用 `module: NodeNext` 时你会注意到的一件事是，在导入 TypeScript 文件时需要使用 `.js` 扩展名：

```typescript
// 从 album.ts 导入
import { Album } from "./album.js";
```

这起初可能感觉很奇怪，但这是必要的，因为 TypeScript 不会转换你的导入。这就是导入在转译为 JavaScript 时的样子——而 TypeScript 更倾向于让你编写的代码与你将运行的代码相匹配。

#### `Node16`

`NodeNext` 是“最新的 Node.js 模块行为”的简写。如果你希望将 TypeScript 固定到特定的 Node 版本，可以使用 `Node16` 代替：

```json
{
  "compilerOptions": {
    "module": "Node16"
  }
}
```

在撰写本文时，Node.js 16 已经停止维护，但其后的每个 Node 版本都复制了它的模块解析行为。这在未来可能会改变，所以值得查阅 TypeScript 文档以获取最新信息——或者坚持使用 `NodeNext`。

### `Preserve`

如果你正在使用像 Webpack、Rollup 或 Parcel 这样的打包工具来转译你的 TypeScript 代码，你应该在你的 `tsconfig.json` 文件中选择 `module: "Preserve"`：

```json
{
  "compilerOptions": {
    "module": "Preserve"
  }
}
```

这意味着 `moduleResolution: "Bundler"`，我将一起讨论。

使用 `Preserve` 时，TypeScript 假定打包器将处理模块解析。这意味着在导入 TypeScript 文件时，你不必包含 `.js` 扩展名：

```typescript
// 从 album.ts 导入
import { Album } from "./album";
```

这是因为打包器会负责为你解析文件路径和扩展名。

这意味着如果你正在使用外部打包器或转译器，你应该在 `tsconfig.json` 文件中使用 `module: "Preserve"`。如果你正在使用像 Next.js、Remix、Vite 或 SvelteKit 这样的前端框架，情况也是如此——它会为你处理打包。

## 使用 `import type` 导入类型

当你从其他文件导入类型时，TypeScript 需要做出一些选择。假设你正在从 `album.ts` 导入一个 `Album` 类型：

```typescript
// index.ts

import { Album } from "./album";
```

生成的 JavaScript 应该是什么样子？我们只导入了一个类型，它在运行时会消失。导入语句应该保留，但移除类型吗？

```javascript
// index.js

import {} from "./album";
```

或者导入语句应该完全移除？

这些决定很重要，因为模块可能包含在首次导入时运行的副作用。例如，`album.ts` 可能会调用一个 `console.log` 语句：

```typescript
// album.ts

export interface Album {
  title: string;
  artist: string;
  year: number;
}

console.log("Imported album.ts");
```

现在，如果 TypeScript 移除（或者，正如 TypeScript 文档中所说，elides）导入，`console.log` 语句将不会运行。如果你没有预料到这一点，这可能会令人惊讶。

TypeScript 解决这个问题的方法是使用 `import type` 语法。如果你正在导入一个类型，并且不希望在 JavaScript 中发出导入语句，你可以使用 `import type`：

```typescript
// index.ts

import type { Album } from "./album";
```

现在，只导入类型信息，并且导入语句会从生成的 JavaScript 中移除：

```javascript
// index.js

// 没有 import 语句
```

### `import type { X }` vs `import { type X }`

你可以通过两种方式组合 `import` 和 `type`。你可以将整行标记为类型导入：

```typescript
import type { Album } from "./album";
```

或者，如果你想将运行时导入与类型导入结合起来，你可以将类型本身标记为类型导入：

```typescript
import { type Album, createAlbum } from "./album";
```

在这种情况下，`createAlbum` 将作为运行时导入，而 `Album` 将作为类型导入。

在这两种情况下，都很清楚哪些内容会从生成的 JavaScript 中移除。第一行将移除整个导入，第二行将仅移除类型导入。

### `verbatimModuleSyntax` 强制使用 `import type`

TypeScript 经历了各种配置选项的迭代来支持这种行为。`importsNotUsedAsValues` 和 `preserveValueImports` 都试图解决这个问题。但自 TypeScript 5.0 以来，`verbatimModuleSyntax` 是强制使用 `import type` 的推荐方法。

上面描述的行为，即如果导入仅用于类型，则会省略导入，这是当 `verbatimModuleSyntax` 设置为 `true` 时发生的情况。

## ESM 和 CommonJS

在 TypeScript 中有两种模块化代码的方式：ECMAScript Modules (ESM) 和 CommonJS (CJS)。这两种模块系统的运作方式略有不同，它们并不总能很好地协同工作。

ES Modules 使用 `import` 和 `export` 语句：

```typescript
import { createAlbum } from "./album";

export { createAlbum };
```

CommonJS 使用 `require` 和 `module.exports`：

```typescript
const { createAlbum } = require("./album");

module.exports = { createAlbum };
```

理解 ESM 和 CJS 之间的互操作性问题稍微超出了本书的范围。相反，我们将看看如何设置 TypeScript，以便尽可能轻松地使用这两种模块系统。

### TypeScript 如何知道要发出哪种模块系统？

假设我们有一个 `album.ts` 文件，它导出一个 `createAlbum` 函数：

```typescript
// album.ts

export function createAlbum(
  title: string,
  artist: string,
  year: number
): Album {
  return { title, artist, year };
}
```

当这个文件转换成 JavaScript 时，它应该输出 `CJS` 还是 `ESM` 语法？

```javascript
// ESM

export function createAlbum(title, artist, year) {
  return { title, artist, year };
}
```

```javascript
// CJS

function createAlbum(title, artist, year) {
  return { title, artist, year };
}

module.exports = {
  createAlbum,
};
```

决定方式是通过 `module`。你可以通过选择一些旧选项来硬编码。`module: CommonJS` 将始终发出 CommonJS 语法，而 `module: ESNext` 将始终发出 ESM 语法。

但是如果你使用 TypeScript 来转译你的代码，我建议使用 `module: NodeNext`。它内置了一些复杂的规则来判断是输出 CJS 还是 ESM：

我们可以通过使用 `.cts` 和 `.mts` 扩展名来影响 TypeScript 如何使用 `module: NodeNext` 输出你的模块。

如果我们将 `album.ts` 更改为 `album.cts`，TypeScript 将发出 CommonJS 语法，并且发出的文件扩展名将是 `.cjs`。

如果我们将 `album.ts` 更改为 `album.mts`，TypeScript 将发出 ESM 语法，并且发出的文件扩展名将是 `.mjs`。

如果我们保持 `album.ts` 不变，TypeScript 将在目录中查找最近的 `package.json` 文件。如果 `type` 字段设置为 `module`，TypeScript 将发出 ESM 语法。如果设置为 `commonjs`（或未设置，与 Node 的行为匹配），TypeScript 将发出 CJS 语法。

| 文件扩展名  | 生成的文件扩展名 | 生成的模块系统                    |
| ----------- | ---------------- | --------------------------------- |
| `album.mts` | `album.mjs`      | ESM                               |
| `album.cts` | `album.cjs`      | CJS                               |
| `album.ts`  | `album.js`       | 取决于 `package.json` 中的 `type` |

### `verbatimModuleSyntax` 与 ESM 和 CommonJS

`verbatimModuleSyntax` 可以帮助你更明确地指定正在使用的模块系统。如果将 `verbatimModuleSyntax` 设置为 `true`，当你在 ESM 文件中尝试使用 `require`，或在 CJS 文件中尝试使用 `import` 时，TypeScript 会报错。

例如，考虑这个使用 `export default` 语法的 `hello.cts` 文件：

```ts twoslash
// @errors: 1286
// @verbatimModuleSyntax: true
// @module: NodeNext
// @moduleResolution: NodeNext
// @filename hello.cts

// hello.cts
const hello = () => {
  console.log("Hello!");
};

export { hello };
```

当启用 `verbatimModuleSyntax` 时，TypeScript 会在 `export default` 行下显示一个错误，告诉我们正在混合使用这两种语法。

为了解决这个问题，我们需要改用 `export =` 语法：

```tsx
// hello.cts

const hello = () => {
  console.log("Hello!");
};
export = { hello };
```

这将在生成的 JavaScript 中编译为 `module.exports = { hello }`。

尝试使用 ESM 导入时也会显示警告：

```ts twoslash
// @errors: 1286
// @verbatimModuleSyntax: true
// @module: NodeNext
// @moduleResolution: NodeNext
// @filename hello.cts

import { z } from "zod";
```

这里的解决方法是使用 `require` 而不是 `import`：

```tsx
import zod = require("zod");

const z = zod.z;
```

请注意，此语法以一种奇特的方式结合了 `import` 和 `require`——这是一种 TypeScript 特定的语法，可在 CommonJS 模块中为你提供自动完成功能。

`verbatimModuleSyntax` 是尽早发现这些问题并确保在正确的文件中使用正确的模块系统的好方法。它与 `module: NodeNext` 配合得非常好。

## `noEmit`

`tsconfig.json` 中的 `noEmit` 选项告诉 TypeScript 在转译你的 TypeScript 代码时不要生成任何 JavaScript 文件。

```json
{
  "compilerOptions": {
    "noEmit": true
  }
}
```

这与 `module: "Preserve"` 配合得很好——在这两种情况下，你都在告诉 TypeScript 一个外部工具将为你处理转译。

TypeScript 对此选项的默认值为 `false`——因此，如果你发现运行 `tsc` 时在你不想它生成 JavaScript 文件的情况下却生成了，请将 `noEmit` 设置为 `true`。

## Source Maps

TypeScript 可以生成 source map，将编译后的 JavaScript 代码链接回原始的 TypeScript 代码。你可以通过在 `tsconfig.json` 文件中将 `sourceMap` 设置为 `true` 来启用它们：

```json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

当你在 Node 中运行代码时，可以添加 `--enable-source-maps` 标志：

```bash
node --enable-source-maps dist/index.js
```

现在，当编译后的 JavaScript 代码中发生错误时，堆栈跟踪将指向原始的 TypeScript 文件。

## 为库使用转译代码

使用 TypeScript 构建一个供他人在其项目中使用的库是一种非常常见的方式。在构建库时，你应该在 `tsconfig.json` 文件中考虑一些额外的设置。

### `outDir`

`tsconfig.json` 中的 `outDir` 选项指定 TypeScript 应将转译后的 JavaScript 文件输出到的目录。

在构建库时，通常将 `outDir` 设置为项目根目录下的 `dist` 目录：

```json
{
  "compilerOptions": {
    "outDir": "dist"
  }
}
```

这可以与 `rootDir` 结合使用，以指定 TypeScript 文件的根目录：

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

现在，位于 `src/index.ts` 的文件将被转译为 `dist/index.js`。

### 创建声明文件

我们已经讨论过如何使用 `.d.ts` 声明文件为 JavaScript 代码提供类型信息，但到目前为止我们只是手动创建它们。

通过在 `tsconfig.json` 文件中设置 `"declaration": true`，TypeScript 将自动生成 `.d.ts` 文件并将它们与编译后的 JavaScript 文件一起保存。

```json
{
  "compilerOptions": {
    "declaration": true
  }
}
```

例如，考虑这个 `album.ts` 文件：

```typescript
// 在 album.ts 内部

export interface Album {
  title: string;
  artist: string;
  year: number;
}

export function createAlbum(
  title: string,
  artist: string,
  year: number
): Album {
  return { title, artist, year };
}
```

在启用了 `declaration` 选项的情况下运行 TypeScript 编译器后，它将在项目的 `dist` 目录中生成一个 `album.js` 和 `album.d.ts` 文件。

这是包含类型信息的声明文件代码：

```typescript
// album.d.ts

export interface Album {
  title: string;
  artist: string;
  year: number;
}

export declare function createAlbum(
  title: string,
  artist: string,
  year: number
): Album;
```

以及从 TypeScript 转译过来的 `album.js` 文件：

```javascript
// album.js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAlbum = void 0;
function createAlbum(title, artist, year) {
  return { title, artist, year };
}
exports.createAlbum = createAlbum;
```

现在，任何使用你库的人都可以访问 `.d.ts` 文件中的类型信息。

### 声明映射 (Declaration Maps)

库的一个常见用例是在 monorepo 中。monorepo 是多个库的集合，每个库都有自己的 `package.json`，可以在不同的应用程序之间共享。这意味着你通常会同时开发库和使用该库的应用程序。

例如，一个 monorepo 可能如下所示：

```
monorepo
  ├── apps
  │   └── my-app
  │       └── package.json
  └── packages
      └── my-library
          └── package.json
```

然而，如果你在 `my-app` 中处理从 `my-library` 导入的代码，你将处理编译后的 JavaScript 代码，而不是 TypeScript 源代码。这意味着当你 `CMD + 点击` 一个导入时，你将被带到 `.d.ts` 文件，而不是原始的 TypeScript 源代码。

这就是声明映射（declaration maps）发挥作用的地方。它们提供了生成的 `.d.ts` 和原始 `.ts` 源文件之间的映射。

为了创建它们，应将 `declarationMap` 设置以及 `sourceMap` 设置添加到你的 `tsconfig.json` 文件中：

```json
{
  "compilerOptions": {
    "declarationMap": true,
    "sourceMap": true
  }
}
```

有了这个选项，TypeScript 编译器将在 `.d.ts` 文件旁边生成 `.d.ts.map` 文件。现在，当你在 `my-app` 中 `CMD + 点击` 一个导入时，你将被带到 `my-library` 中的原始 TypeScript 源文件。

当你的库发布到 `npm` 时，除非你也发布源文件，否则这个功能用处不大——但这有点超出了本书的范围。然而，在 monorepo 中，声明映射是一个很好的生活质量改进。

## `jsx`

TypeScript 内置了对转译 JSX 语法的支持，JSX 是 JavaScript 的一种语法扩展，允许你在 JavaScript 文件中编写类似 HTML 的代码。在 TypeScript 中，这些需要写在扩展名为 `.tsx` 的文件中：

```tsx
// Component.tsx
const Component = () => {
  return <div />;
};
```

`jsx` 选项告诉 TypeScript 如何处理 JSX 语法，并有五个可能的值。最常见的是 `preserve`、`react` 和 `react-jsx`。以下是它们各自的作用：

- `preserve`：保持 JSX 语法不变。
- `react`：将 JSX 转换为 `React.createElement` 调用。适用于 React 16 及更早版本。
- `react-jsx`：将 JSX 转换为 `_jsx` 调用，并自动从 `react/jsx-runtime` 导入。适用于 React 17 及更高版本。

## 管理多个 TypeScript 配置

随着项目规模和复杂性的增长，在同一个项目中拥有不同的环境或目标是很常见的。

例如，你的单个仓库可能同时包含客户端应用程序和服务器端 API，它们各自有不同的需求和配置。

这意味着你可能希望为项目的不同部分设置不同的 `tsconfig.json`。在本节中，我们将探讨如何将多个 `tsconfig.json` 文件组合在一起。

### TypeScript 如何找到 `tsconfig.json`

在具有多个 `tsconfig.json` 文件的项目中，你的 IDE 需要知道为每个文件使用哪一个。它通过查找距离当前 `.ts` 文件最近的 `tsconfig.json` 来确定使用哪一个。

例如，给定此文件结构：

```
project
  ├── client
  │   └── tsconfig.json
  ├── server
  │   └── tsconfig.json
  └── tsconfig.json
```

`client` 目录下的文件将使用 `client/tsconfig.json` 文件，而 `server` 目录下的文件将使用 `server/tsconfig.json` 文件。`project` 目录下不属于 `client` 或 `server` 的任何文件都将使用项目根目录下的 `tsconfig.json` 文件。

这意味着 `client/tsconfig.json` 可以包含特定于客户端应用程序的设置，例如添加 `dom` 类型：

```json
{
  "compilerOptions": {
    // ...其他选项
    "lib": ["es2022", "dom", "dom.iterable"]
  }
}
```

但是 `server/tsconfig.json` 可以包含特定于服务器端应用程序的设置，例如移除 `dom` 类型：

```json
{
  "compilerOptions": {
    // ...其他选项
    "lib": ["es2022"]
  }
}
```

#### 具有多个 `tsconfig.json` 文件的全局变量

拥有多个 `tsconfig.json` 文件的一个有用特性是全局变量与单个配置文件绑定。

例如，假设 `server` 目录中的声明文件 `server.d.ts` 有一个 `ONLY_ON_SERVER` 变量的全局声明。这个变量将只在属于 `server` 配置的文件中可用：

```tsx
// 在 server/server.d.ts 中
declare const ONLY_ON_SERVER: string;
```

尝试在属于 `client` 配置的文件中使用 `ONLY_ON_SERVER` 将导致错误：

```ts twoslash
// @errors: 2304
// 在 client/index.ts 中
console.log(ONLY_ON_SERVER);
```

此功能在处理特定于环境的变量或来自 Jest 或 Cypress 等测试工具的全局变量时非常有用，并且可以避免污染全局作用域。

### 扩展配置

当你有多个 `tsconfig.json` 文件时，它们之间通常会有共享的设置：

```tsx
// client/tsconfig.json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "Preserve",
    "esModuleInterop": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "lib": [
      "es2022",
      "dom",
      "dom.iterable"
    ],
    "jsx": "react-jsx",
  }
}

// server/tsconfig.json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "Preserve",
    "esModuleInterop": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "lib": [
      "es2022"
    ]
  },
}
```

与其在 `client/tsconfig.json` 和 `server/tsconfig.json` 中重复相同的设置，我们可以创建一个新的 `tsconfig.base.json` 文件，以便从中扩展。

可以将通用设置移至 `tsconfig.base.json`：

```tsx
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "Preserve",
    "esModuleInterop": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true
  }
}
```

然后，`client/tsconfig.json` 将使用指向 `tsconfig.base.json` 文件的 `extends` 选项来扩展基础配置：

```tsx
// client/tsconfig.json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "lib": [
      "es2022",
      "dom",
      "dom.Iterable" // 注意：原文中此处为 dom.Iterable，可能是笔误，通常为 dom.iterable
    ],
    "jsx": "react-jsx"
  }
}
```

`server/tsconfig.json` 也会做同样的事情：

```tsx
// server/tsconfig.json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "lib": [
      "es2022"
    ]
  }
}
```

这种方法对于 monorepo 特别有用，其中许多不同的 `tsconfig.json` 文件可能需要引用相同的基础配置。

对基础配置的任何更改都将自动被 `client` 和 `server` 配置继承。但是，需要注意的是，使用 `extends` 只会从基础配置中复制 `compilerOptions`，而不会复制其他设置，如 `include` 或 `exclude`（用于指定要包含或排除在编译之外的文件）。

```json
{
  "compilerOptions": {}, // 将被 'extends' 继承
  "include": [], // 不会被 'extends' 继承
  "exclude": [] // 不会被 'extends' 继承
}
```

### `--project`

现在我们有了一组组织良好并共享通用设置的 `tsconfig.json` 文件。这在 IDE 中运行良好，IDE 会根据文件的位置自动检测要使用哪个 `tsconfig.json` 文件。

但是，如果我们想运行一个一次性检查整个项目的命令呢？

为此，我们需要使用 `--project` 标志运行 `tsc` 并将其指向每个 `tsconfig.json` 文件：

```bash
tsc --project ./client/tsconfig.json
tsc --project ./server/tsconfig.json
```

对于少量配置，这可能行得通，但随着配置数量的增加，它很快就会变得笨拙。

### 项目引用 (Project References)

为了简化这个过程，TypeScript 有一个叫做项目引用的功能。这允许你指定一个相互依赖的项目列表，TypeScript 将按正确的顺序构建它们。

你可以在项目的根目录配置一个单独的 `tsconfig.json` 文件，该文件引用 `client` 和 `server` 配置：

```tsx
// tsconfig.json
{
  "references": [
    {
      "path": "./client/tsconfig.json"
    },
    {
      "path": "./server/tsconfig.json"
    }
  ],
  "files": []
}
```

请注意，上面的配置中还有一个空的 `files` 数组。这是为了防止根 `tsconfig.json` 自己检查任何文件——它只是引用其他配置。

接下来，我们需要将 `composite` 选项添加到 `tsconfig.base.json` 文件中。此选项告诉 TypeScript，`client` 和 `server` 是需要通过项目引用运行的子项目配置：

```tsx
// tsconfig.base.json
{
  "compilerOptions": {
    // ...其他选项
    "composite": true
  },
}
```

现在，从根目录，我们可以使用 `-b` 标志运行 `tsc` 来运行每个项目：

```bash
tsc -b
```

`-b` 标志告诉 TypeScript 运行项目引用。这将按正确的顺序对 `client` 和 `server` 配置进行类型检查和构建。

当我们第一次运行它时，一些 `.tsbuildinfo` 文件将在 `client` 和 `server` 目录中创建。TypeScript 使用这些文件来缓存有关项目的信息，并加快后续构建。

所以，总结一下：

- 项目引用允许你在单个 `tsc` 命令中运行多个 `tsconfig.json` 文件。
- 每个子配置都应在其 `tsconfig.json` 文件中设置 `composite: true`。
- 根 `tsconfig.json` 文件应有一个 `references` 数组，指向每个子配置，并设置 `files: []` 以防止其自行检查任何文件。
- 从根目录运行 `tsc -b` 以构建所有配置。
- 每个 `tsconfig.json` 都将有其自己的全局作用域，全局变量不会在配置之间共享。
- `.tsbuildinfo` 文件将在每个子配置中创建，以加快后续构建。

项目引用可以通过各种方式用于管理复杂的 TypeScript 项目。当您只想让全局变量影响项目的特定部分时，例如来自 `dom` 的类型或向全局作用域添加函数的测试框架，它们特别有用。
