在本章中，我们将更深入地探讨模块。首先，我们将通过区分“模块”和“脚本”来了解 TypeScript 如何理解全局作用域。其次，我们将声明文件——`.d.ts` 文件——并介绍 `declare` 关键字。

## 理解模块和脚本

TypeScript 有两种方式来理解 `.ts` 文件。它可以被视为一个模块，包含导入和导出；或者一个脚本，在全局作用域中执行。

### 模块具有局部作用域

模块是一段独立的代码，可以根据需要导入到其他模块中。模块拥有自己的作用域，这意味着在模块内部定义的变量、函数和类型，除非被显式导出，否则无法从其他文件访问。

考虑这个 `constants.ts` 模块，它定义了一个 `DEFAULT_VOLUME` 常量：

```typescript
const DEFAULT_VOLUME = 90;
```

如果不导入，`DEFAULT_VOLUME` 常量无法从其他文件访问：

```ts twoslash
// @errors: 2304
// 在 index.ts 内部
console.log(DEFAULT_VOLUME);
```

为了在 `index.ts` 文件中使用 `DEFAULT_VOLUME` 常量，必须从 `constants.ts` 模块导入它：

```typescript
// 在 index.ts 内部
import { DEFAULT_VOLUME } from "./constants";

console.log(DEFAULT_VOLUME); // 90
```

TypeScript 内置了对模块的理解，并且默认情况下，会将任何包含 `import` 或 `export` 语句的文件视为模块。

### 脚本具有全局作用域

另一方面，脚本在全局作用域中执行。在脚本文件中定义的任何变量、函数或类型，都可以在项目中的任何地方访问，无需显式导入。这种行为类似于传统的 JavaScript，其中脚本被包含在 HTML 文件中并在全局作用域中执行。

如果一个文件不包含任何 `import` 或 `export` 语句，TypeScript 会将其视为一个脚本。如果我们从 `constants.ts` 文件中的 `DEFAULT_VOLUME` 常量移除 `export` 关键字，它将被视为一个脚本：

```typescript
// 在 constants.ts 内部
const DEFAULT_VOLUME = 90;
```

现在，我们不再需要在 `index.ts` 文件中导入 `DEFAULT_VOLUME` 常量：

```ts twoslash
declare const DEFAULT_VOLUME: 90;
// ---cut---
// 在 index.ts 内部

console.log(DEFAULT_VOLUME);
//          ^?
```

这种行为可能让你感到惊讶——让我们弄清楚 TypeScript 为什么这样做。

### TypeScript 必须进行猜测

TypeScript 发展至今，已经相当成熟了。它实际上比 `import` 和 `export` 语句成为 JavaScript 的一部分还要早。当 TypeScript 最初创建时，它主要用于创建*脚本*，而不是模块。

所以 TypeScript 的默认行为是*猜测*你的文件应该被视为模块还是脚本。正如我们所见，它是通过查找 `import` 和 `export` 语句来实现这一点的。

但你的代码是被当作模块还是脚本，实际上并非由 TypeScript 决定——而是由代码执行的环境决定。

即使在浏览器中，你也可以通过向 script 标签添加 `type="module"` 属性来选择使用模块：

```html
<script type="module" src="index.js"></script>
```

这意味着你的 JavaScript 文件将被视为一个模块。但如果移除 `type="module"` 属性，你的 JavaScript 文件将被视为一个脚本。

所以，考虑到 TypeScript 无法知道你的代码将如何执行，它的默认行为是相对合理的。

但是如今，你编写的 99% 的代码都将是模块。因此，这种自动检测可能会导致一些令人沮丧的情况：

### "Cannot redeclare block-scoped variable" (无法重新声明块级作用域变量)

假设你创建了一个新的 TypeScript 文件 `utils.ts`，并添加了一个 `name` 常量：

```ts twoslash
// @errors: 2451
// @moduleDetection: auto
const name = "Alice";
```

你会收到一个令人惊讶的错误。这个错误告诉你不能声明 `name`，因为它已经被声明过了。

一个奇特的修复方法是在文件末尾添加一个空的导出语句：

```typescript
const name = "Alice";

export {};
```

错误消失了。为什么呢？

让我们运用已经学到的知识来找出原因。在 `utils.ts` 中我们没有任何 `import` 或 `export` 语句，所以 TypeScript 将其视为一个脚本。这意味着 `name` 是在全局作用域中声明的。

事实证明，在 DOM 中，已经有一个名为 [`name`](https://developer.mozilla.org/en-US/docs/Web/API/Window/name) 的全局变量。它允许你为超链接和表单设置目标。所以当 TypeScript 在脚本中看到 `name` 时，它会报错，因为它认为你试图重新声明全局的 `name` 变量。

通过添加 `export {}` 语句，你告诉 TypeScript `utils.ts` 是一个模块，现在 `name` 的作用域限定在模块内，而不是全局作用域。

这种意外的命名冲突很好地说明了为什么建议将所有文件都视为模块。幸运的是，TypeScript 为我们提供了一种方法。

### 使用 `moduleDetection` 强制模块化

`moduleDetection` 设置决定了函数和变量在项目中的作用域。有三个可用选项：`auto`、`force` 和 `legacy`。

默认情况下，它设置为 `auto`，这对应于我们上面看到的行为。`force` 设置会将所有文件都视为模块，无论是否存在 `import` 或 `export` 语句。`legacy` 可以安全地忽略，因为它仅用于与旧版 TypeScript 兼容。

更新 `tsconfig.json` 以将 `moduleDetection` 指定为 `force` 很简单：

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...其他选项...
    "moduleDetection": "force"
  }
}
```

此更改后，项目中的所有文件都将被视为模块，你需要使用 `import` 和 `export` 语句来跨文件访问函数和变量。这有助于使你的开发环境更接近真实场景，同时减少意外错误。

## 声明文件

声明文件是 TypeScript 中具有特殊扩展名 `.d.ts` 的文件。这些文件在 TypeScript 中主要有两个用途：描述 JavaScript 代码，以及向全局作用域添加类型。我们将在下面探讨这两者。

### 声明文件描述 JavaScript

假设我们代码库的一部分是用 JavaScript 编写的，并且我们希望保持这种方式。我们有一个 `musicPlayer.js` 文件，它导出了一个 `playTrack` 函数：

```javascript
// musicPlayer.js

export const playTrack = (track) => {
  // 播放音轨的复杂逻辑...
  console.log(`Playing: ${track.title}`);
};
```

如果我们尝试将此文件导入 TypeScript 文件，将会收到一个错误：

```ts twoslash
// @errors: 2307
// 在 app.ts 内部

import { playTrack } from "./musicPlayer";
```

发生此错误是因为 TypeScript 没有任何关于 `musicPlayer.js` 文件的类型信息。要解决此问题，我们可以创建一个与 JavaScript 文件同名但扩展名为 `.d.ts` 的声明文件：

```typescript
// musicPlayer.d.ts
export function playTrack(track: {
  title: string;
  artist: string;
  duration: number;
}): void;
```

需要注意的是，这个文件不包含任何实现代码。它只描述 JavaScript 文件中函数和变量的类型。

现在，当我们将 `musicPlayer.js` 文件导入 TypeScript 文件时，错误将得到解决，我们可以按预期使用 `playTrack` 函数：

```typescript
// 在 app.ts 内部

import { playTrack } from "./musicPlayer";

const track = {
  title: "Otha Fish",
  artist: "The Pharcyde",
  duration: 322,
};

playTrack(track);
```

类型和接口也可以在声明文件中声明和导出：

```tsx
// 在 musicPlayer.d.ts 内部
export interface Track {
  title: string;
  artist: string;
  duration: number;
}

export function playTrack(track: Track): void;
```

就像在 `.ts` 文件中一样，这些也可以被导入并在其他 TypeScript 文件中使用：

```tsx
// 在 app.ts 内部

import { Track, playTrack } from "./musicPlayer";
```

需要注意的是，声明文件不会对照它们所描述的 JavaScript 文件进行检查。我们很容易在声明文件中犯错，比如将 `playTrack` 改为 `playTRACK`，TypeScript 并不会报错。

所以，手动描述 JavaScript 文件容易出错——通常不推荐这样做。

### 声明文件可以向全局作用域添加内容

就像常规的 TypeScript 文件一样，声明文件可以根据是否使用 `export` 关键字被视为模块或脚本。在上面的例子中，`musicPlayer.d.ts` 因为包含了 `export` 关键字而被视为模块。

这意味着，如果没有 `export`，声明文件可以用来向全局作用域添加类型。即使将 `moduleDetection` 设置为 `force` 也不会改变这种行为——对于 `.d.ts` 文件，`moduleDetection` 始终设置为 `auto`。

例如，我们可以创建一个我们希望在整个项目中使用的 `Album` 类型：

```tsx
// 在 global.d.ts 内部

type Album = {
  title: string;
  artist: string;
  releaseDate: string;
};
```

现在，`Album` 类型在全局范围内可用，并且可以在任何 TypeScript 文件中使用，无需导入。我们将在本章稍后讨论这是否是个好主意。

### 声明文件不能包含实现

如果我们尝试在 `.d.ts` 文件中编写普通的 TypeScript 代码会发生什么？

```ts
export function playTrack(track: {
  title: string;
  artist: string;
  duration: number;
}) {
  // { 下方出现红色波浪线
  console.log(`Playing: ${track.title}`);
}

// 鼠标悬停在错误上显示：
// An implementation cannot be declared in ambient contexts. (无法在环境上下文中声明实现。)
```

我们得到了一个错误！TypeScript 不允许我们在声明文件中包含任何实现代码。声明文件在运行时会完全消失，所以它们不能包含任何会被执行的代码。

#### 什么是“环境上下文” (Ambient Context)？

“ambient”（环境）这个词可能令人困惑。TypeScript 用它来表示['没有实现'](https://github.com/Microsoft/TypeScript-Handbook/issues/180#issuecomment-195446760)。由于声明文件不能包含实现，所以内部的一切都被认为是“ambient”的。我们将在下一节深入探讨这一点。

## `declare` 关键字

`declare` 关键字允许你在 TypeScript 中定义环境值。它可以用来声明变量，使用 `declare global` 定义全局作用域，或者使用 `declare module` 增强模块类型。

### `declare const/var/let/function`

`declare` 可以用来定义没有实现的值。这在多种方式下都很有用。让我们看看它如何帮助进行类型定义。

#### 为全局变量添加类型

假设我们有一个全局变量 `MUSIC_API`。它没有在我们的代码中定义，但是通过一个 script 标签在环境中可用：

```html
<script src="/music-api.js"></script>
```

这个变量在我们的代码库中任何地方都可用。所以，让我们把它放到一个声明文件中。

我们可以创建一个 `musicApi.d.ts` 文件并声明 `MUSIC_API` 变量：

```typescript
// 在 musicApi.d.ts 内部

type Album = {
  title: string;
  artist: string;
  releaseDate: string;
};

declare const ALBUM_API: {
  getAlbumInfo(upc: string): Promise<Album>;
  searchAlbums(query: string): Promise<Album[]>;
};
```

因为我们没有包含任何导入或导出，这个文件被视为一个脚本。这意味着 `ALBUM_API` 变量现在在我们的项目中是全局可用的。

#### 将全局变量作用域限定在单个文件

如果我们想把 `MUSIC_API` 的作用域限制在单个文件 `musicUtils.ts` 中呢？我们实际上可以把 `declare const` 语句移到文件内部：

```typescript
// 在 musicUtils.ts 内部

type Album = {
  title: string;
  artist: string;
  releaseDate: string;
};

declare const ALBUM_API: {
  getAlbumInfo(upc: string): Promise<Album>;
  searchAlbums(query: string): Promise<Album[]>;
};

export function getAlbumTitle(upc: string) {
  return ALBUM_API.getAlbumInfo(upc).then((album) => album.title);
}
```

现在，`ALBUM_API` 只在 `musicUtils.ts` 文件中可用。`declare` 在其当前所在的作用域内定义值。所以，因为我们现在在一个模块内部（由于 `export` 语句），`ALBUM_API` 的作用域被限定在这个模块。

#### `declare const`, `declare var`, `declare let`, `declare function`

你可能已经注意到我们在上面的例子中使用了 `declare const`。但你也可以使用 `declare var`、`declare let` 和 `declare function`。它们都做同样的事情——声明一个没有实现的值。

以下是一些语法示例：

```typescript
declare const MY_CONSTANT: number;
declare var MY_VARIABLE: string;
declare let MY_LET: boolean;
declare function myFunction(): void;
```

### `declare global`

`declare global` 允许你从模块内部向全局作用域添加内容。当你希望将全局类型与其使用的代码放在一起时，这可能很有用。

要做到这一点，我们可以将 `declare const` 语句包装在一个 `declare global` 块中：

```ts twoslash
// @errors: 1038
type Album = {
  title: string;
  artist: string;
  releaseDate: string;
};

// ---cut---
// 在 musicUtils.ts 内部
declare global {
  declare const ALBUM_API: {
    getAlbumInfo(upc: string): Promise<Album>;
    searchAlbums(query: string): Promise<Album[]>;
  };
}
```

这几乎可以工作，除了那个错误。我们不能在环境上下文中使用 `declare`：`declare global` 块本身已经是环境的了。所以，我们可以移除 `declare` 关键字：

```typescript
// 在 musicUtils.ts 内部

declare global {
  const ALBUM_API: {
    getAlbumInfo(upc: string): Promise<Album>;
    searchAlbums(query: string): Promise<Album[]>;
  };
}
```

现在 `ALBUM_API` 变量已经被放入了全局作用域。

### `declare module`

在某些情况下，你需要为一个模块声明类型，而该模块要么没有类型定义，要么没有直接包含在项目中。

在这些情况下，你可以使用 `declare module` 语法来为模块定义类型。

例如，假设我们正在使用一个没有类型定义的 `duration-utils` 模块。

第一步是创建一个名为 `duration-utils.d.ts` 的新文件。然后在文件顶部，使用 `declare module` 语法来定义模块的类型：

```typescript
declare module "duration-utils" {
  export function formatDuration(seconds: number): string;
}
```

我们使用 `export` 来定义从模块中导出的内容。

和之前一样，我们没有在 `.d.ts` 文件中包含任何实现代码——只是声明了类型。

一旦 `duration-utils.d.ts` 文件创建完成，就可以像往常一样导入和使用该模块：

```typescript
import { formatDuration, parseTrackData } from "duration-utils";

const formattedTime = formatDuration(309);
```

就像普通的声明文件一样，你添加的类型不会与实际模块进行检查——所以保持它们最新非常重要。

### 模块增强 (Module Augmentation) vs 模块覆盖 (Module Overriding)

使用 `declare module` 时，你可以增强现有模块或完全覆盖它。增强模块意味着向现有模块追加新的类型。覆盖模块意味着用新的类型替换现有的类型。

选择哪种方式取决于你是在模块内部还是脚本内部。

#### 在模块内部，`declare module` 进行增强

如果你在模块内部，`declare module` 将增强目标模块。例如，你可以向 `express` 模块添加一个新的类型：

```typescript
// 在 express.d.ts 内部
declare module "express" {
  export interface MyType {
    hello: string;
  }
}

export {}; // 添加一个导出将这个 .d.ts 文件变成一个模块
```

现在，在我们的整个项目中，我们可以从 `express` 模块导入 `MyType`：

```typescript
// anywhere.ts
import { MyType } from "express";
```

我们不需要把它放在声明文件中。通过将 `express.d.ts` 改为 `express.ts`，我们可以获得完全相同的行为。

这个例子有点傻——向模块添加自己的类型并没有真正的用例。但我们稍后会看到，增强模块的类型可能非常有用。

#### 在脚本内部，`declare module` 进行覆盖

让我们回到我们的 `express.d.ts` 文件。如果我们移除 `export {}` 语句，它将被视为一个脚本：

```typescript
// 在 express.d.ts 内部

declare module "express" {
  export interface MyType {
    hello: string;
  }
}
```

现在，我们完全覆盖了 `express` 模块。这意味着 `express` 模块除了 `MyType` 之外不再有任何导出：

```ts
// anywhere.ts
import { Express } from "express"; // "Express" 下方出现红色波浪线
```

就像模块增强一样，通过将 `express.d.ts` 改为 `express.ts`（如果 `moduleDetection` 设置为 `auto`），我们可以获得相同的行为。

所以，仅仅是 `export` 语句的存在与否，就能彻底改变 `declare module` 的行为。

当你想要完全替换一个模块的类型时，覆盖偶尔会很有用，比如当第三方库的类型不正确时。

## 你无法控制的声明文件

你可能认为声明文件是 TypeScript 中一个相对小众的功能。但在你创建的每个项目中，你可能都在使用数百个声明文件。它们要么随库一起提供，要么与 TypeScript 本身捆绑在一起。

### TypeScript 的内置类型

无论何时使用 TypeScript，你也在使用 JavaScript。JavaScript 有许多内置的常量、函数和对象，TypeScript 需要了解它们。一个经典的例子是数组方法。

```ts
const numbers = [1, 2, 3];

numbers.map((n) => n * 2);
```

让我们退一步想一想。TypeScript 如何知道 `.map` 存在于数组上？它如何知道 `.map` 存在，而 `.transform` 不存在？这些是在哪里定义的？

事实证明，TypeScript 自带了一堆描述 JavaScript 环境的声明文件。我们可以对 `.map` 使用“转到定义”功能来看看它在哪里：

```ts
// 在 lib.es5.d.ts 内部

interface Array<T> {
  // ... 其他方法 ...
  map<U>(
    callbackfn: (value: T, index: number, array: T[]) => U,
    thisArg?: any
  ): U[];
}
```

我们最终进入了一个名为 `lib.es5.d.ts` 的文件。这个文件是 TypeScript 的一部分，描述了 ES5（2009 年的一个 JavaScript 版本）中的 JavaScript 是什么样的。`.map` 就是在那个时候被引入 JavaScript 的。

另一个例子是字符串上的 `.replaceAll`：

```ts
const str = "hello world";

str.replaceAll("hello", "goodbye");
```

对 `.replaceAll` 使用“转到定义”功能，会带你到一个名为 `lib.es2021.string.d.ts` 的文件。这个文件描述了 ES2021 中引入的字符串方法。

查看 `node_modules/typescript/lib` 中的代码，你会看到几十个描述 JavaScript 环境的声明文件。

理解如何浏览这些声明文件对于修复类型错误非常有用。花几分钟时间，通过使用“转到定义”来探索 `lib.es5.d.ts` 中的内容。

#### 使用 `lib` 选择你的 JavaScript 版本

`tsconfig.json` 中的 `lib` 设置允许你选择项目中包含哪些 `.d.ts` 文件。选择 `es2022` 将为你提供截至 ES2022 的所有 JavaScript 功能。选择 `es5` 将为你提供截至 ES5 的所有功能。

```json
{
  "compilerOptions": {
    "lib": ["es2022"]
  }
}
```

默认情况下，这会从 `target` 设置继承，我们将在配置 TypeScript 的章节中介绍 `target`。

#### DOM 类型

TypeScript 自带的另一组声明文件是 DOM 类型。这些描述了浏览器环境，并包括了 `document`、`window` 以及所有其他浏览器全局对象的类型。

```ts
document.querySelector("h1");
```

如果你对 `document` 使用“转到定义”，你会进入一个名为 `lib.dom.d.ts` 的文件。

```ts
declare var document: Document;
```

此文件使用我们之前看到的 `declare` 关键字将 `document` 变量声明为 `Document` 类型。

要将这些包含在你的项目中，你可以在 `lib` 设置中指定它们，同时指定 JavaScript 版本：

```json
{
  "compilerOptions": {
    "lib": ["es2022", "dom", "dom.iterable"]
  }
}
```

`dom.iterable` 包含了可迭代 DOM 集合的类型，如 `NodeList`。

如果你不指定 `lib`，TypeScript 默认会包含 `dom` 以及在 `target` 中选择的 JavaScript 版本：

```json
{
  "compilerOptions": {
    "target": "es2022"
    // "lib": ["es2022", "dom", "dom.iterable"] 是隐式包含的
  }
}
```

就像 JavaScript 版本一样，你可以使用“转到定义”来探索 DOM 类型并查看可用的内容。在撰写本文时，它已经超过 28,000 行了——但花时间逐步理解其中的内容会非常有用。

#### 哪些 DOM 类型会被包含？

不同的浏览器支持不同的特性。快速浏览一下 [caniuse.com](https://caniuse.com/) 就会发现某些特性的浏览器支持情况可能参差不齐。

但是 TypeScript 只提供一套 DOM 类型。那么它是如何知道要包含哪些内容的呢？

TypeScript 的策略是，如果一个特性在两个主要浏览器中得到支持，它就会被包含在 DOM 类型中。这是在包含所有内容和什么都不包含之间的一个良好平衡。

### 库自带的类型

当你使用 npm 安装一个库时，你正在将 JavaScript 下载到你的文件系统。为了让这些 JavaScript 与 TypeScript 协同工作，作者通常会随库一起包含声明文件。

例如，我们来看看 Zod——一个流行的库，允许在运行时验证数据。

运行安装命令 `pnpm i zod` 后，会在 `node_modules` 内部创建一个新的 `zod` 子目录。在里面，你会找到一个 `package.json` 文件，其中有一个 `types` 键，指向该库的类型定义：

```tsx
// 在 node_modules/zod/package.json 内部
{
  "types": "index.d.ts",
  // 其他键...
}
```

在 `index.d.ts` 内部是 `zod` 库的类型定义：

```tsx
// 在 node_modules/zod/index.d.ts 内部
import * as z from "./external";
export * from "./external";
export { z };
export default z;
```

此外，`lib` 文件夹内的每个 `.js` 文件都有一个对应的 `.d.ts` 文件，其中包含该 JavaScript 代码的类型定义。

就像 DOM 类型一样，你可以使用“转到定义”来探索库自带的类型。理解这些类型可以帮助你更有效地使用库。

### DefinitelyTyped

并非每个库都会将 `.d.ts` 文件与你下载的 JavaScript 捆绑在一起。这在 TypeScript 早期是一个大问题，当时大多数开源包都不是用 TypeScript 编写的。

[`DefinitelyTyped` GitHub 仓库](https://github.com/DefinitelyTyped/DefinitelyTyped) 的建立是为了存放许多流行的、自身未提供类型定义的 JavaScript 库的高质量类型定义。它现在是 GitHub 上最大的开源仓库之一。

通过将 `@types/*` 和你的库作为开发依赖项安装，你可以添加 TypeScript 能够立即使用的类型定义。

例如，假设你正在使用 `diff` 库来检查两个字符串之间的差异：

```tsx
import Diff from "diff"; // "diff" 下方有红色波浪线

const message1 = "Now playing: 'Run Run Run'";
const message2 = "Now playing: 'Bye Bye Bye'";

const differences = Diff.diffChars(message1, message2);
```

TypeScript 在 `import` 语句下方报告了一个错误，因为它找不到类型定义，尽管该库每周从 NPM 下载超过 4000 万次：

```txt
// 鼠标悬停在 "diff" 上显示：
Could not find a declaration file for module 'diff'. Try `npm install --save-dev @types/diff` if it exists or add a new declaration (.d.ts) file containing `declare module 'diff';`
// (找不到模块 'diff' 的声明文件。如果存在，请尝试 `npm install --save-dev @types/diff`，或者添加一个新的声明文件 (.d.ts) 包含 `declare module 'diff';`)
```

由于我们使用的是 `pnpm` 而不是 `npm`，我们的安装命令如下：

```bash
pnpm i -D @types/diff
```

一旦安装了来自 DefinitelyTyped 的类型定义，TypeScript 就会识别 `diff` 库并为其提供类型检查和自动补全：

```tsx
// 鼠标悬停在 differences 上显示：
const differences: Diff.Change[];
```

对于那些很久没有更新的库，或者像 React 这样更常用的、不自带类型定义的库来说，这是一个很好的解决方案。

### `skipLibCheck`

正如我们所见，你的项目可能包含数百个声明文件。默认情况下，TypeScript 将这些文件视为项目的一部分。因此，它每次都会检查它们的类型错误。

这可能导致非常令人沮丧的情况，即第三方库中的类型错误可能会阻止你的项目编译。

为了避免这种情况，TypeScript 有一个 `skipLibCheck` 设置。当设置为 `true` 时，TypeScript 将跳过检查声明文件中的类型错误。

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

由于包含的声明文件数量庞大，这在任何 TypeScript 项目中都是必不可少的。添加此设置可以加快编译速度并防止不必要的错误。

#### `skipLibCheck` 的缺点

然而，`skipLibCheck` 有一个巨大的缺点。它不仅仅跳过 `node_modules` 中的声明文件——它跳过*所有*声明文件。

这意味着如果你在编写声明文件时犯了错误，TypeScript 不会捕获它。这可能导致难以追踪的 bug。

这是我对 TypeScript 的主要抱怨之一——`skipLibCheck` 是必需的，因为存在不正确的第三方声明文件的风险。但它也使得编写自己的声明文件变得更加困难。

## 编写声明文件

现在我们知道了如何使用声明文件，以及它们的缺点（多亏了 `skipLibCheck`），让我们来看看它们的用例。

### 增强全局类型

声明文件最常见的用途是描述项目的全局作用域。我们已经看到了如何在脚本文件中使用 `declare const` 来添加全局变量。

你还可以使用我们之前看到的声明合并功能，来追加到现有的接口和命名空间。

提醒一下，声明合并是指当你用与现有类型或接口相同的名称定义类型或接口时，TypeScript 会将两者合并。

这意味着在声明文件中声明的任何接口都可以进行增强。例如，`lib.dom.d.ts` 包含一个 `Document` 接口。假设我们想给它添加一个 `foo` 属性。

我们可以创建一个 `global.d.ts` 文件并声明一个新的 `Document` 接口：

```tsx
// 在 global.d.ts 内部

interface Document {
  foo: string;
}
```

这个声明文件被视为一个脚本，所以 `Document` 接口与现有的接口合并。

现在，在我们的整个项目中，`Document` 接口将拥有一个 `foo` 属性：

```tsx
// 在 app.ts 内部

document.foo = "hello"; // 没有错误！
```

这对于描述 TypeScript 不知道的 JavaScript 全局变量非常有用。

我们将在练习部分看到更多这样的例子。

### 为非 JavaScript 文件添加类型

在像 Webpack 这样的某些环境中，可以导入像图片这样的文件，这些文件最终会以字符串标识符的形式合并到包 (bundle) 中。

考虑这个例子，其中导入了几个 `.png` 图片。TypeScript 通常不将 PNG 文件识别为模块，因此它在每个导入语句下方报告错误：

```ts twoslash
// @errors: 2307
import pngUrl1 from "./example1.png";
import pngUrl2 from "./example2.png";
```

`declare module` 语法可以提供帮助。我们可以用它来为非 JavaScript 文件声明类型。

要添加对 `.png` 导入的支持，请创建一个名为 `png.d.ts` 的新文件。在文件内部，我们将以 `declare module` 开头，但由于我们不能使用相对模块名，我们将使用通配符 `*` 来匹配任何 `*.png` 文件。在声明内部，我们将说明 `png` 是一个字符串并将其作为默认导出：

```tsx
// 在 png.d.ts 内部
declare module "*.png" {
  const png: string;

  export default png;
}
```

有了 `png.d.ts` 文件后，TypeScript 会将导入的 `.png` 文件识别为字符串，而不会报告任何错误。

### 你应该将类型存储在声明文件中吗？

TypeScript 开发者中一个常见的误解是，声明文件是用来存储类型的地方。你会创建一个 `types.d.ts` 文件：

```tsx
// types.d.ts
export type Example = string;
```

然后在你的 TypeScript 文件中导入这个文件：

```tsx
// index.ts
import { Example } from "./types";

const myFunction = (example: Example) => {
  console.log(example);
};
```

犯这个错误是比较自然的。“声明文件”？听起来像是你放置类型声明的地方。

但这是个坏主意。`skipLibCheck` 会忽略这些文件，这意味着你无法对它们进行类型检查。这意味着你应该尽可能少地使用声明文件，以降低 bug 的风险。

相反，应该将你的类型放在常规的 TypeScript 文件中。

### 使用全局类型是个好主意吗？

在你的项目中，最终会有几个常用的类型。例如，你可能有一个在许多不同文件中使用的 `User` 类型。

一种选择是将这些类型放入全局作用域，以避免在各处导入它们。这可以通过将 `.d.ts` 文件用作脚本，或在 `.ts` 文件中使用 `declare global` 来实现。

然而，我不建议你这样做。用类型污染全局作用域会使你的项目变成一团糟的隐式依赖。可能很难知道一个类型来自哪里，并且会使重构变得困难。

随着项目的发展，你会遇到类型之间的命名冲突。系统的不同部分可能都定义了一个 `User` 类型，从而导致混淆。

相反，我建议你显式导入类型。这使得类型来源清晰，使你的系统更具可移植性，并使重构更容易。

## 练习

### 练习 1：为一个 JavaScript 模块添加类型

考虑这个 `example.js` JavaScript 文件，它导出了 `myFunc`：

```javascript
// example.js
export const myFunc = () => {
  return "Hello World!";
};
```

然后 `myFunc` 函数被导入到一个 TypeScript `index.ts` 文件中：

```tsx
// index.ts
import { myFunc } from "./example"; // ./example 下方有红色波浪线

myFunc();
```

然而，导入语句中存在错误，因为 TypeScript 期望此 JavaScript 模块有一个声明文件：

```tsx
// 鼠标悬停在错误上显示：
Could not find a declaration file for module './example'.
// (找不到模块 './example' 的声明文件。)
```

你的任务是为 `example.js` 文件创建一个声明文件。

### 练习 2：环境上下文 (Ambient Context)

考虑一个名为 `state` 的变量，它从一个全局的 `DEBUG.getState()` 函数返回：

```tsx
const state = DEBUG.getState(); // DEBUG 下方有红色波浪线

type test = Expect<Equal<typeof state, { id: string }>>;
```

这里，`DEBUG` 就像一个全局变量。在我们假设的项目中，`DEBUG` 只在这个文件中被引用，并且由一个我们无法控制的外部脚本引入到全局作用域。

目前，`DEBUG` 下方有一个错误，因为 TypeScript 无法解析 `DEBUG.getState()` 返回的 `state` 的类型。

正如测试中所示，我们期望 `state` 是一个具有 `string` 类型 `id` 的对象，但 TypeScript 目前将其解释为 `any`：

```tsx
// 鼠标悬停在 state 上显示：
const state: any;
```

你的任务是指定 `DEBUG` 在此模块（且仅在此模块）中可用，而无需提供其实现。这将帮助 TypeScript 理解 `state` 的类型并提供预期的类型检查。

### 练习 3：修改 `window`

现在让我们设想一下，我们希望我们的 `DEBUG` 对象只能通过 `window` 对象访问：

```ts twoslash
// @errors: 2551
import { Equal, Expect } from "@total-typescript/helpers";
// ---cut---
// 在 index.ts 内部

const state = window.DEBUG.getState(); // DEBUG 下方有红色波浪线

type test = Expect<Equal<typeof state, { id: string }>>;
```

我们期望 `state` 是一个具有 `id` 字符串属性的对象，但它目前被类型化为 `any`。

`DEBUG` 上还有一个错误，告诉我们 TypeScript 看不到 `DEBUG` 类型。

你的任务是指定 `DEBUG` 在 `window` 对象上可用。这将帮助 TypeScript 理解 `state` 的类型并提供预期的类型检查。

### 练习 4：修改 `process.env`

Node.js 引入了一个名为 `process` 的全局实体，它包含几个由 `@types/node` 提供类型的属性。

`env` 属性是一个对象，封装了已并入当前运行进程的所有环境变量。这对于特性标记或在不同环境中定位不同 API 非常有用。

这是一个使用 `envVariable` 的示例，以及一个检查它是否为字符串的测试：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";

declare const process: {
  env: Record<string, string | undefined>;
};

// ---cut---
const envVariable = process.env.MY_ENV_VAR;

type test = Expect<Equal<typeof envVariable, string>>;
```

TypeScript 不知道 `MY_ENV_VAR` 环境变量，所以它不能确定它会是一个字符串。因此，`Equal` 测试失败，因为 `envVariable` 被类型化为 `string | undefined` 而不是仅仅 `string`。

你的任务是确定如何在全局作用域中将 `MY_ENV_VAR` 环境变量指定为字符串。这与第一个练习中修改 `window` 的解决方案略有不同。

这里有几个提示可以帮助你：

在 DefinitelyTyped 的 `@types/node` 内部，`ProcessEnv` 接口负责环境变量。它可以在 `NodeJS` 命名空间内找到。你可能需要回顾之前的章节来刷新你对类型和命名空间的声明合并的记忆，以便解决这个练习。

### 解决方案 1：为一个 JavaScript 模块添加类型

解决方案是在 JavaScript 文件旁边创建一个同名的声明文件。在这种情况下，声明文件应该命名为 `example.d.ts`。在声明文件内部，我们用其类型签名声明 `myFunc` 函数：

```tsx
// example.d.ts
export function myFunc(): string;

export {};
```

有了 `example.d.ts` 文件后，`index.ts` 中的导入语句将不再显示错误。

### 解决方案 2：环境上下文

第一步是使用 `declare const` 在模块的局部作用域内模拟一个全局变量。我们将首先将 `DEBUG` 声明为一个空对象：

```tsx
declare const DEBUG: {};
```

现在我们已经为 `DEBUG` 添加了类型，错误消息已移至 `getState()`下方：

```ts twoslash
// @errors: 2339
import { Equal, Expect } from "@total-typescript/helpers";
declare const DEBUG: {};
// ---cut---
const state = DEBUG.getState();

type test = Expect<Equal<typeof state, { id: string }>>;
```

参考测试，我们可以看到 `DEBUG` 需要一个 `getState` 属性，该属性返回一个具有 `string` 类型 `id` 的对象。我们可以更新 `DEBUG` 对象以反映这一点：

```tsx
declare const DEBUG: {
  getState: () => {
    id: string;
  };
};
```

通过此更改，我们的错误已得到解决！

### 解决方案 3：修改 `window`

我们要做的第一件事是在 `src` 目录中创建一个新的 `window.d.ts` 声明文件。我们需要这个文件被视为一个脚本以便访问全局作用域，所以我们不会包含 `export` 关键字。

在文件内部，我们将创建一个名为 `Window` 的新 `interface`，它扩展了 `lib.dom.d.ts` 中内置的 `Window` 接口。这将允许我们向 `Window` 接口添加新的属性。在这种情况下，是带有 `getState` 方法的 `DEBUG` 属性：

```tsx
// window.d.ts
interface Window {
  DEBUG: {
    getState: () => {
      id: string;
    };
  };
}
```

通过此更改，错误已得到解决。

#### 替代解决方案

另一种解决方案是在 `index.ts` 文件中直接将 `declare global` 与接口一起使用：

```tsx
// index.ts
const state = window.DEBUG.getState();

type test = Expect<Equal<typeof state, { id: string }>>;

declare global {
  interface Window {
    DEBUG: {
      getState: () => {
        id: string;
      };
    };
  }
}
```

两种方法都可以，但通常将全局类型放在一个单独的文件中可以使它们更容易找到。

### 解决方案 4：修改 `process.env`

在 TypeScript 中修改全局作用域有两种选择：使用 `declare global` 或创建 `.d.ts` 声明文件。

对于这个解决方案，我们将在 `src` 目录中创建一个 `process.d.ts` 文件。我们叫它什么名字并不重要，但是 `process.d.ts` 表明我们正在修改 `process` 对象。

因为我们知道 `ProcessEnv` 在 `NodeJS` 命名空间内，我们将使用 `declare namespace` 来向 `ProcessEnv` 接口添加我们自己的属性。

在这种情况下，我们将声明一个名为 `NodeJS` 的命名空间，其中包含一个 `ProcessEnv` 接口。里面将是我们的 `MY_ENV_VAR` 属性，类型为 `string`：

```tsx
// src/process.d.ts

declare namespace NodeJS {
  interface ProcessEnv {
    MY_ENV_VAR: string;
  }
}
```

有了这个新文件，我们可以看到 `MY_ENV_VAR` 现在在 `index.ts` 中被识别为字符串。错误得到解决，并且我们对该变量有了自动补全支持。

记住，仅仅因为错误解决了，并不意味着 `MY_ENV_VAR` 在运行时就一定会是字符串。这个更新仅仅是我们与 TypeScript 建立的一个契约。我们仍然需要确保这个契约在我们的运行时环境中得到遵守。
