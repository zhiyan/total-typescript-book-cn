我们在本书中已经多次涉及到TypeScript的`tsconfig.json`配置文件。让我们深入了解一下。我们不会涵盖`tsconfig.json`中的每个选项 - 其中许多选项很旧且很少使用 - 但我们会涵盖最重要的选项。

## 推荐配置

首先，这里有一个推荐的基础`tsconfig.json`配置，其选项适用于你构建的大多数应用程序：

```json
{
  "compilerOptions": {
    /* 基础选项: */
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

- `skipLibCheck`：跳过声明文件的类型检查，这提高了编译速度。我们在上一章中介绍了这一点。
- `target`：指定编译后的JavaScript代码的ECMAScript目标版本。目标为`es2022`提供了一些相对较新的JavaScript特性 - 但当你阅读本书时，你可能想要针对更新的版本。
- `esModuleInterop`：启用CommonJS和ES模块之间更好的兼容性。
- `allowJs`：允许将JavaScript文件导入到TypeScript项目中。
- `resolveJsonModule`：允许将JSON文件导入到你的TypeScript项目中。
- `moduleDetection`：`force`选项告诉TypeScript将所有`.ts`文件视为模块，而不是脚本。我们在上一章中介绍了这一点。
- `isolatedModules`：确保每个文件可以独立转译，而不依赖于其他文件的信息。
- `strict`：启用一组严格的类型检查选项，捕获更多错误并通常促进更好的代码质量。
- `noUncheckedIndexedAccess`：对索引访问操作强制执行更严格的类型检查，捕获潜在的运行时错误。

一旦设置了这些基础选项，根据你正在处理的项目类型，还有几个要添加的选项。

### 额外配置选项

在设置基础`tsconfig.json`设置后，有几个问题需要问自己，以确定要包含哪些额外选项。

**你是否使用TypeScript转译代码？**
如果是，将`module`设置为`NodeNext`。

**你是否为库构建？**
如果你为库构建，将`declaration`设置为`true`。如果你在monorepo中为库构建，将`composite`设置为`true`，将`declarationMap`设置为`true`。

**你是否不使用TypeScript转译？**
如果你使用其他工具（如ESbuild或Babel）转译代码，将`module`设置为`Preserve`，将`noEmit`设置为`true`。

**你的代码是否在DOM中运行？**
如果是，将`lib`设置为`["dom", "dom.iterable", "es2022"]`。如果不是，将其设置为`["es2022"]`。

### 完整的基础配置

根据你对上述问题的回答，完整的`tsconfig.json`文件将如下所示：

```json
{
  "compilerOptions": {
    /* 基础选项: */
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

    /* 如果使用tsc转译: */
    "module": "NodeNext",
    "outDir": "dist",
    "sourceMap": true,
    "verbatimModuleSyntax": true,

    /* 如果你为库构建: */
    "declaration": true,

    /* 如果你在monorepo中为库构建: */
    "composite": true,
    "declarationMap": true,

    /* 如果不使用tsc转译: */
    "module": "Preserve",
    "noEmit": true,

    /* 如果你的代码在DOM中运行: */
    "lib": ["es2022", "dom", "dom.iterable"],

    /* 如果你的代码不在DOM中运行: */
    "lib": ["es2022"]
  }
}
```

现在我们了解了大局，让我们更详细地看看这些选项中的每一个。

## 基础选项

### `target`

`target`选项指定TypeScript在生成JavaScript代码时应该针对的ECMAScript版本。

例如，将`target`设置为`ES5`将尝试将你的代码转换为与ECMAScript 5兼容。

像可选链和空值合并这样的语言特性，它们是在ES5之后引入的，仍然可用：

```tsx
// 可选链
const search = input?.search;

// 空值合并
const defaultedSearch = search ?? "Hello";
```

但当它们转换为JavaScript时，它们将被转换为在ES5环境中工作的代码：

```javascript
// 可选链
var search = input === null || input === void 0 ? void 0 : input.search;
// 空值合并
var defaultedSearch = search !== null && search !== void 0 ? search : "Hello";
```

#### `target`不提供polyfill

虽然`target`可以将较新的语法转译到较旧的环境中，但它不会对目标环境中不存在的API做同样的事情。

例如，如果你针对的JavaScript版本不支持字符串上的`.replaceAll`，TypeScript不会为你提供polyfill：

```tsx
const str = "Hello, world!";

str.replaceAll("Hello,", "Goodbye, cruel");
```

这段代码在你的目标环境中会出错，因为`target`不会为你转换它。如果你需要支持较旧的环境，你需要找到自己的polyfill。你可以使用`lib`配置代码执行的环境，正如我们在前一章中看到的。

如果你不确定为`target`指定什么，请保持它与你在`lib`中指定的版本同步。

### `esModuleInterop`

`esModuleInterop`是一个旧标志，于2018年发布。它有助于CommonJS和ES模块之间的互操作性。当时，TypeScript在处理通配符导入和默认导出方面与Babel等常用工具略有偏差。`esModuleInterop`使TypeScript与这些工具保持一致。

你可以阅读[发布说明](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#support-for-import-d-from-cjs-from-commonjs-modules-with---esmoduleinterop)了解更多详情。简而言之，当你构建应用程序时，`esModuleInterop`应该始终开启。甚至有一个提议在TypeScript 6.0中将其设为默认。

### `isolatedModules`

`isolatedModules`防止单文件转译器无法处理的一些TypeScript语言特性。

有时你会使用`tsc`以外的其他工具将TypeScript转换为JavaScript。这些工具，如`esbuild`、`babel`或`swc`，无法处理所有TypeScript特性。`isolatedModules`禁用这些特性，使这些工具更容易使用。

考虑这个使用`declare const`创建的`AlbumFormat`枚举的例子：

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

回想一下，`declare`关键字将`const enum`放在环境上下文中，这意味着它将在运行时被擦除。

当`isolatedModules`禁用时，这段代码将编译而不会有任何错误。

然而，当启用`isolatedModules`时，`AlbumFormat`枚举将不会被擦除，TypeScript将引发错误。

这是因为只有`tsc`有足够的上下文来理解`AlbumFormat.Vinyl`应该有什么值。TypeScript一次检查你的整个项目，并在内存中存储`AlbumFormat`的值。

当使用像`esbuild`这样的单文件转译器时，它没有这个上下文，所以它不知道`AlbumFormat.Vinyl`应该是什么。因此，`isolatedModules`是一种确保你不使用难以转译的TypeScript特性的方法。

`isolatedModules`是一个明智的默认设置，因为它使你的代码在需要切换到不同的转译器时更具可移植性。它禁用的模式很少，值得始终开启。

## 严格性

### `strict`

`tsconfig.json`中的`strict`选项作为一种简写，一次性启用几个不同的类型检查选项，包括捕获潜在的`null`或`undefined`问题以及对函数参数的更强检查等。

将`strict`设置为`false`会使TypeScript的行为方式不那么安全。没有`strict`，TypeScript将允许你将`null`分配给应该是字符串的变量：

```tsx
let name: string = null; // 没有错误
```

启用`strict`后，TypeScript当然会捕获这个错误。

事实上，我写这整本书的前提是你在代码库中启用了`strict`。它是所有现代TypeScript应用程序的基线。

#### 你应该从`strict: false`开始吗？

你经常听到关闭`strict`的一个论点是，它对初学者来说是一个很好的入门。你可以更快地启动和运行项目，而不必担心所有的严格规则。

然而，我不认为这是一个好主意。许多著名的TypeScript库，如`zod`、`trpc`、`@redux/toolkit`和`xstate`，在`strict`关闭时不会按你期望的方式运行。大多数社区资源，如StackOverflow和React TypeScript Cheatsheet，都假设你启用了`strict`。

不仅如此，从`strict: false`开始的项目很可能会保持这种状态。在成熟的代码库上，开启`strict`并修复所有错误可能非常耗时。

所以，我认为`strict: false`是TypeScript的一个分支。这意味着你不能与许多库一起工作，寻求帮助变得更困难，并导致更多的运行时错误。

### `noUncheckedIndexedAccess`

`strict`中不包含的一个严格规则是`noUncheckedIndexedAccess`。启用后，它通过检测访问数组或对象索引可能返回`undefined`的情况来帮助捕获潜在的运行时错误。

考虑这个带有`tracks`数组的`VinylSingle`接口的例子：

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

要访问`egoMirror`的B面，我们会这样索引其`tracks`：

```typescript
const bSide = egoMirror.tracks[1];
console.log(bSide.toUpperCase()); // 'MIRROR'
```

如果在`tsconfig.json`中没有启用`noUncheckedIndexedAccess`，TypeScript假设索引总是返回有效值，即使索引超出范围。

尝试访问不存在的第四首曲目不会在VS Code中引发错误，但会导致运行时错误：

```typescript
const nonExistentTrack = egoMirror.tracks[3];
console.log(nonExistentTrack.toUpperCase()); // VS Code中没有错误

// 然而，运行代码会导致运行时错误：
// TypeError: Cannot read property 'toUpperCase' of undefined
```

通过将`noUncheckedIndexedAccess`设置为`true`，TypeScript将推断每个索引访问的类型为`T | undefined`而不仅仅是`T`。在这种情况下，`egoMirror.tracks`中的每个条目都将是`string | undefined`类型：

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

然而，因为每个曲目的类型现在是`string | undefined`，所以即使对有效的曲目尝试调用`toUpperCase`也会出现错误：

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

这意味着我们必须处理访问数组或对象索引时可能出现的`undefined`值。

所以`noUncheckedIndexedAccess`使TypeScript更严格，但代价是必须更小心地处理`undefined`值。

通常，这是一个很好的权衡，因为它有助于在开发过程的早期捕获潜在的运行时错误。但如果你最终在某些情况下关闭它，我不会责怪你。

### 其他严格选项

我倾向于将我的`tsconfig.json`配置为不超过`strict`和`noUncheckedIndexedAccess`的严格程度。如果你想更进一步，有几个其他严格选项可以启用：

- `allowUnreachableCode`：当检测到不可达代码时出错，比如`return`语句后的代码。
- `exactOptionalPropertyTypes`：要求可选属性的类型与声明的完全一致，而不是允许`undefined`。
- `noFallthroughCasesInSwitch`：确保`switch`语句中的任何非空`case`块以`break`、`return`或`throw`语句结束。
- `noImplicitOverride`：要求在覆盖基类方法时使用`override`。
- `noImplicitReturns`：确保函数中的每个代码路径都返回一个值。
- `noPropertyAccessFromIndexSignature`：强制你在访问具有索引签名的对象上的属性时使用`example['access']`。
- `noUnusedLocals`：当声明但从未使用局部变量时出错。
- `noUnusedParameters`：当声明但从未使用函数参数时出错。

## `module`的两个选择

`tsconfig.json`中的`module`设置指定TypeScript应该如何处理你的导入和导出。有两个主要选择：`NodeNext`和`Preserve`。

- 当你想用TypeScript编译器转译你的TypeScript代码时，选择`NodeNext`。
- 当你使用外部打包器如Webpack或Parcel时，选择`Preserve`。

### `NodeNext`

如果你使用TypeScript编译器转译你的TypeScript代码，你应该在`tsconfig.json`文件中选择`module: "NodeNext"`：

```json
{
  "compilerOptions": {
    "module": "NodeNext"
  }
}
```

`module: "NodeNext"`也暗示`moduleResolution: "NodeNext"`，所以我将一起讨论它们的行为。

使用`NodeNext`时，TypeScript模拟Node的模块解析行为，包括支持`package.json`的`"exports"`字段等特性。使用`module: NodeNext`发出的代码将能够在Node.js环境中运行，无需任何额外处理。

使用`module: NodeNext`时，你会注意到在导入TypeScript文件时需要使用`.js`扩展名：

```typescript
// 从album.ts导入
import { Album } from "./album.js";
```

这一开始可能感觉很奇怪，但这是必要的，因为TypeScript不会转换你的导入。这是它转译为JavaScript时导入的样子 - TypeScript更喜欢你写的代码与你将运行的代码匹配。

#### `Node16`

`NodeNext`是"最新的Node.js模块行为"的简写。如果你更喜欢将TypeScript固定到特定的Node版本，你可以使用`Node16`：

```json
{
  "compilerOptions": {
    "module": "Node16"
  }
}
```

在撰写本文时，Node.js 16已经结束生命周期，但它之后的每个Node版本都复制了它的模块解析行为。这在未来可能会改变，所以值得查看TypeScript文档获取最新信息 - 或者坚持使用`NodeNext`。

### `Preserve`

如果你使用Webpack、Rollup或Parcel等打包器转译你的TypeScript代码，你应该在`tsconfig.json`文件中选择`module: "Preserve"`：

```json
{
  "compilerOptions": {
    "module": "Preserve"
  }
}
```

这暗示`moduleResolution: "Bundler"`，我将一起讨论。

使用`Preserve`时，TypeScript假设打包器将处理模块解析。这意味着你不需要
