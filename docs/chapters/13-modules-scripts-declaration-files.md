在本章中，我们将深入探讨模块。首先，我们将通过了解"模块"和"脚本"之间的区别来了解TypeScript如何理解全局作用域。其次，我们将看看声明文件 - `.d.ts文件` - 并介绍`declare`关键字。

## 理解模块和脚本

TypeScript有两种理解`.ts`文件的方式。它可以被视为模块，包含导入和导出，或者脚本，在全局作用域中执行。

### 模块有局部作用域

模块是一个隔离的代码片段，可以根据需要导入到其他模块中。模块有自己的作用域，这意味着在模块内定义的变量、函数和类型不能从其他文件访问，除非它们被显式导出。

考虑这个定义了`DEFAULT_VOLUME`常量的`constants.ts`模块：

```typescript
const DEFAULT_VOLUME = 90;
```

如果不导入，`DEFAULT_VOLUME`常量不能从其他文件访问：

```ts twoslash
// @errors: 2304
// 在index.ts内部
console.log(DEFAULT_VOLUME);
```

为了在`index.ts`文件中使用`DEFAULT_VOLUME`常量，必须从`constants.ts`模块导入它：

```typescript
// 在index.ts内部
import { DEFAULT_VOLUME } from "./constants";

console.log(DEFAULT_VOLUME); // 90
```

TypeScript内置了对模块的理解，默认情况下，它会将任何包含`import`或`export`语句的文件视为模块。

### 脚本有全局作用域

另一方面，脚本在全局作用域中执行。在脚本文件中定义的任何变量、函数或类型都可以从项目中的任何地方访问，而不需要显式导入。这种行为类似于传统的JavaScript，其中脚本包含在HTML文件中并在全局作用域中执行。

如果文件不包含任何`import`或`export`语句，TypeScript将其视为脚本。如果我们从`constants.ts`文件中的`DEFAULT_VOLUME`常量中删除`export`关键字，它将被视为脚本：

```typescript
// 在constants.ts内部
const DEFAULT_VOLUME = 90;
```

现在，我们不再需要在`index.ts`文件中导入`DEFAULT_VOLUME`常量：

```ts twoslash
declare const DEFAULT_VOLUME: 90;
// ---cut---
// 在index.ts内部

console.log(DEFAULT_VOLUME);
//          ^?
```

这种行为可能会让你感到惊讶 - 让我们弄清楚为什么TypeScript这样做。

### TypeScript必须猜测

TypeScript在这一点上相当老了。它实际上比`import`和`export`语句成为JavaScript的一部分还要老。当TypeScript首次创建时，它主要用于创建_脚本_，而不是模块。

所以TypeScript的默认行为是_猜测_你的文件是应该被视为模块还是脚本。正如我们所见，它通过寻找`import`和`export`语句来做到这一点。

但你的代码是被视为模块还是脚本实际上不是由TypeScript决定的 - 它是由代码执行的环境决定的。

即使在浏览器中，你也可以通过向脚本标签添加`type="module"`属性来选择使用模块：

```html
<script type="module" src="index.js"></script>
```

这意味着你的JavaScript文件将被视为模块。但删除`type="module"`属性，你的JavaScript文件将被视为脚本。

所以，TypeScript的默认设置相对合理，因为它不知道你的代码将如何执行。

但这些天，你将编写的99%的代码都将在模块中。所以这种自动检测可能会导致令人沮丧的情况：

### "无法重新声明块作用域变量"

让我们想象你创建了一个新的TypeScript文件，`utils.ts`，并添加了一个`name`常量：

```ts twoslash
// @errors: 2451
// @moduleDetection: auto
const name = "Alice";
```

你将收到一个令人惊讶的错误。这个错误告诉你不能声明`name`，因为它已经被声明了。

修复这个问题的一个奇怪方法是在文件末尾添加一个空的导出语句：

```typescript
const name = "Alice";

export {};
```

错误消失了。为什么？

让我们用我们已经学到的知识来弄清楚这一点。我们在`utils.ts`中没有任何`import`或`export`语句，所以TypeScript将其视为脚本。这意味着`name`是在全局作用域中声明的。

事实证明，在DOM中，已经有一个名为[`name`](https://developer.mozilla.org/en-US/docs/Web/API/Window/name)的全局变量。这让你可以为超链接和表单设置目标。所以当TypeScript在脚本中看到`name`时，它会给你一个错误，因为它认为你试图重新声明全局`name`变量。

通过添加`export {}`语句，你告诉TypeScript`utils.ts`是一个模块，而`name`现在作用于模块，而不是全局作用域。

这种意外的冲突是为什么将所有文件视为模块是个好主意的一个很好的例子。幸运的是，TypeScript给了我们一种方法来做到这一点。

### 使用`moduleDetection`强制模块

`moduleDetection`设置决定了函数和变量在你的项目中的作用域。有三种不同的选项可用：`auto`，`force`和`legacy`。

默认情况下，它设置为`auto`，对应于我们上面看到的行为。`force`设置将所有文件视为模块，无论是否存在`import`或`export`语句。`legacy`可以安全忽略，因为它只用于与旧版本的TypeScript兼容。

更新`tsconfig.json`以将`moduleDetection`指定为`force`很简单：

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...其他选项...
    "moduleDetection": "force"
  }
}
```

进行此更改后，项目中的所有文件都将被视为模块，你将需要使用`import`和`export`语句来跨文件访问函数和变量。这有助于使你的开发环境更紧密地与现实世界的场景保持一致，同时减少意外错误。

## 声明文件

声明文件是TypeScript中具有特殊扩展名的文件：`.d.ts`。这些文件在TypeScript中主要用于两个目的：描述JavaScript代码，以及向全局作用域添加类型。我们将在下面探讨这两者。

### 声明文件描述JavaScript

假设我们的代码库的一部分是用JavaScript编写的，我们想保持这种方式。我们有一个导出`playTrack`函数的`musicPlayer.js`文件：

```javascript
// musicPlayer.js

export const playTrack = (track) => {
  // 播放曲目的复杂逻辑...
  console.log(`Playing: ${track.title}`);
};
```

如果我们尝试将这个文件导入到TypeScript文件中，我们会得到一个错误：

```ts twoslash
// @errors: 2307
// 在app.ts内部

import { playTrack } from "./musicPlayer";
```

这个错误发生是因为TypeScript没有`musicPlayer.js`文件的任何类型信息。为了解决这个问题，我们可以创建一个与JavaScript文件同名但扩展名为`.d.ts`的声明文件：

```typescript
// musicPlayer.d.ts
export function playTrack(track: {
  title: string;
  artist: string;
  duration: number;
}): void;
```

重要的是要注意这个文件不包含任何实现代码。它只描述JavaScript文件中函数和变量的类型。

现在，当我们将`musicPlayer.js`文件导入到TypeScript文件中时，错误将被解决，我们可以按预期使用`playTrack`函数：

```typescript
// 在app.ts内部

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
// 在musicPlayer.d.ts内部
export interface Track {
  title: string;
  artist: string;
  duration: number;
}

export function playTrack(track: Track): void;
```

就像在`.ts`文件中一样，这些也可以导入并在其他TypeScript文件中使用：

```tsx
// 在app.ts内部

import { Track, playTrack } from "./musicPlayer";
```

重要的是要注意，声明文件不会根据它们描述的JavaScript文件进行检查。我们可以很容易地在声明文件中犯错误，比如将`playTrack`更改为`playTRACK`，TypeScript不会抱怨。

所以，手动描述JavaScript文件可能容易出错 - 通常不推荐。

### 声明文件可以添加到全局作用域

就像常规的TypeScript文件一样，声明文件可以根据是否使用`export`关键字被视为模块或脚本。在上面的例子中，`musicPlayer.d.ts`被视为模块，因为它包含`export`关键字。

这意味着没有`export`，声明文件可以用于向全局作用域添加类型。即使将`moduleDetection`设置为`force`也不会改变这种行为 - 对于`.d.ts`文件，`moduleDetection`始终设置为`auto`。

例如，我们可以创建一个我们希望在整个项目中使用的`Album`类型：

```tsx
// 在global.d.ts内部

type Album = {
  title: string;
  artist: string;
  releaseDate: string;
};
```

现在，`Album`类型在全局范围内可用，可以在任何TypeScript文件中使用，而不需要导入它。我们将在本章后面讨论这是否是一个好主意。

### 声明文件不能包含实现

如果我们尝试在`.d.ts`文件中编写普通的TypeScript会发生什么？

```ts
export function playTrack(track: {
  title: string;
  artist: string;
  duration: number;
}) {
  // {下有红色波浪线
  console.log(`Playing: ${track.title}`);
}

// 悬停在错误上显示：
// 不能在环境上下文中声明实现。
```

我们得到一个错误！TypeScript不允许我们在声明文件中包含任何实现代码。声明文件在运行时完全消失，所以它们不能包含任何会被执行的代码。

#### 什么是"环境上下文"？

"环境"这个短语可能令人困惑。TypeScript使用它来表示['没有实现'](https://github.com/Microsoft/TypeScript-Handbook/issues/180#issuecomment-195446760)。由于声明文件不能包含实现，所以里面的所有内容都被认为是"环境的"。我们将在下一节深入探讨这一点。

## `declare`关键字

`declare`关键字让你在TypeScript中定义环境值。它可以用来声明变量，用`declare global`定义全局作用域，或者用`declare module`增强模块类型。

### `declare const/var/let/function`

`declare`可以用来定义没有实现的值。这在各种方面都很有用。让我们看看它如何帮助类型化。

#### 类型化全局变量

假设我们有一个全局变量`MUSIC_API`。这不是在我们的代码中定义的，而是通过脚本标签在环境中可用：

```html
<script src="/music-api.js"></script>
```

这个变量在我们的代码库中任何地方都可用。所以，让我们把它放在一个声明文件中。

我们可以创建一个`musicApi.d.ts`文件并声明`MUSIC_API`变量：

```typescript
// 在musicApi.d.ts内部

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

因为我们没有包含任何导入或导出，这个文件被视为脚本。这意味着`ALBUM_API`变量现在在我们的项目中全局可用。

#### 将全局变量限制到一个文件

如果我们想将`MUSIC_API`的作用域限制到单个文件`musicUtils.ts`，我们实际上可以将`declare const`语句移到文件内部：

```typescript
// 在musicUtils.ts内部

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

现在，`ALBUM_API`只在`musicUtils.ts`文件中可用。`declare`在当前作用域内定义值。所以，因为我们现在在一个模块内（由于`export`语句），`ALBUM_API`的作用域限制在这个模块内。

#### `declare const`，`declare var`，`declare let`，`declare function`

你可能已经注意到我们在上面的例子中使用了`declare const`。但你也可以使用`declare var`，`declare let`和`declare function`。它们都做同样的事情 - 声明一个没有实现的值。

以下是一些语法示例：

```typescript
declare const MY_CONSTANT: number;
declare var MY_VARIABLE: string;
declare let MY_LET: boolean;
declare function myFunction(): void;
```

### `declare global`

`declare global`让你从模块内部向全局作用域添加东西。当你想将全局类型与使用它们的代码放在一起时，这很有用。

为此，我们可以将`declare const`语句包装在`declare global`块中：

```ts twoslash
// @errors: 1038
type Album = {
  title: string;
  artist: string;
  releaseDate: string;
};

// ---cut---
// 在musicUtils.ts内部
declare global {
  declare const ALBUM_API: {
    getAlbumInfo(upc: string): Promise<Album>;
    searchAlbums(query: string): Promise<Album[]>;
  };
}
```

这几乎可以工作，除了错误。我们不能在环境上下文中使用`declare`：`declare global`块已经是环境的。所以，我们可以删除`declare`关键字：

```typescript
// 在musicUtils.ts内部

declare global {
  const ALBUM_API: {
    getAlbumInfo(upc: string): Promise<Album>;
    searchAlbums(query: string): Promise<Album[]>;
  };
}
```

现在`ALBUM_API`变量已经被放入全局作用域。

### `declare module`

有些情况下，你需要为一个没有类型定义或者没有直接包含在项目中的模块声明类型。

在这些情况下，你可以使用`declare module`语法为模块定义类型。

例如，假设我们正在使用一个没有类型定义的`duration-utils`模块。

第一步是创建一个名为`duration-utils.d.ts`的新文件。然后在文件顶部，使用`declare module`语法为模块定义类型：

```typescript
declare module "duration-utils" {
  export function formatDuration(seconds: number): string;
}
```

我们使用`export`来定义从模块中导出的内容。

像以前一样，我们不在`.d.ts`文件中包含任何实现代码 - 只是声明的类型。

一旦创建了`duration-utils.d.ts`文件，就可以像往常一样导入和使用模块：

```typescript
import { formatDuration, parseTrackData } from "duration-utils";

const formattedTime = formatDuration(309);
```

就像普通的声明文件一样，你添加的类型不会根据实际模块进行检查 - 所以保持它们更新很重要。

### 模块增强与模块覆盖

使用`declare module`时，你可以增强现有模块或完全覆盖它。增强模块意味着向现有模块添加新类型。覆盖模块意味着用新类型替换现有类型。

选择你正在做的取决于你是在模块内部还是在脚本内部。

#### 在模块内部，`declare module`增强

如果你在模块内部，`declare module`将增强目标模块。例如，你可以向`express`模块添加一个新类型：

```typescript
// 在express.d.ts内部
declare module "express" {
  export interface MyType {
    hello: string;
  }
}

export {}; // 添加导出将此.d.ts文件变成模块
```

现在，在我们的项目中，我们可以从`express`模块导入`MyType`：

```typescript
// anywhere.ts
import { MyType } from "express";
```
