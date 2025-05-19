我们已经探讨了 JavaScript 和 TypeScript 之间的关系，以及 TypeScript 如何改善你作为开发者的生活。但是让我们更深入一些。在本章中，我们将启动并运行 TypeScript CLI，并了解它如何融入开发流程。

作为示例，我们将着眼于使用 TypeScript 构建 Web 应用程序。但是 TypeScript 也可以在任何 JavaScript 可以使用的地方使用——在 Node、Electron、React Native 或任何其他应用程序中。

## TypeScript 在浏览器中的问题

考虑这个 TypeScript 文件 `example.ts`，它包含一个 `run` 函数，该函数将消息记录到控制台：

```ts twoslash
const run = (message: string) => {
  console.log(message);
};

run("Hello!");
```

除了 `example.ts` 文件，我们还有一个基本的 `index.html` 文件，它在 script 标签中引用了 `example.ts` 文件。

```html
<!DOCTYPE html>

<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <title>My App</title>
  </head>

  <body>
    <script src="example.ts"></script>
  </body>
</html>
```

然而，当我们尝试在浏览器中打开 `index.html` 文件时，你会在控制台中看到一个错误：

```
Unexpected token ':'
```

TypeScript 文件中没有任何红线，那么为什么会发生这种情况呢？

### 运行时无法运行 TypeScript

问题在于浏览器（以及像 Node.js 这样的其他运行时）本身无法理解 TypeScript。它们只能理解 JavaScript。

在 `run` 函数的情况下，函数声明中 `message` 后面的 `: string` 不是有效的 JavaScript：

```ts twoslash
const run = (message: string) => {
  // `: string` 不是有效的 JavaScript！

  console.log(message);
};
```

删除 `: string` 后，代码看起来更像 JavaScript，但现在 TypeScript 在 `message` 下方显示了一个错误：

```ts twoslash
// @errors: 7006
const run = (message) => {};
```

在 VS Code 中将鼠标悬停在红色波浪线上，我们可以看到 TypeScript 的错误消息告诉我们 `message` 隐式具有 `any` 类型。

我们稍后会讨论这个特定错误的含义，但现在的重点是我们的 `example.ts` 文件包含浏览器无法理解的语法，但是当我们删除它时，TypeScript CLI 并不满意。

因此，为了让浏览器理解我们的 TypeScript 代码，我们需要将其转换为 JavaScript。

## 转译 TypeScript (Transpiling TypeScript)

将 TypeScript 转换为 JavaScript 的过程（称为"转译"）可以由 TypeScript CLI `tsc` 处理，它在安装 TypeScript 时一同安装。但在我们使用 `tsc` 之前，我们需要设置我们的 TypeScript 项目。

打开终端，并导航到 `example.ts` 和 `index.html` 的父目录。

要仔细检查 TypeScript 是否已正确安装，请在终端中运行 `tsc --version`。如果你看到版本号，那么一切就绪。否则，请使用 PNPM 全局安装 TypeScript：

```bash
pnpm add -g typescript
```

在终端打开到正确的目录并安装了 TypeScript 后，我们可以初始化我们的 TypeScript 项目。

### 初始化 TypeScript 项目

为了让 TypeScript 知道如何转译我们的代码，我们需要在项目的根目录中创建一个 `tsconfig.json` 文件。

运行以下命令将生成 `tsconfig.json` 文件：

```bash
tsc --init
```

在新建的 `tsconfig.json` 文件内部，你会找到许多有用的入门配置选项以及许多其他被注释掉的选项。

目前，我们只使用默认设置：

```json
// tsconfig.json 片段
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

有了 `tsconfig.json` 文件后，我们就可以开始转译了。

### 运行 `tsc`

在终端中不带任何参数运行 `tsc` 命令将利用 `tsconfig.json` 中的默认设置，并将项目中的所有 TypeScript 文件转译为 JavaScript。

```bash
tsc
```

在这种情况下，这意味着我们 `example.ts` 文件中的 TypeScript 代码将变成 `example.js` 文件中的 JavaScript 代码。

在 `example.js` 内部，我们可以看到 TypeScript 语法已被转译为 JavaScript：

```javascript
// example.js 文件内部

"use strict";

const run = (message) => {
  console.log(message);
};

run("Hello!");
```

现在我们有了 JavaScript 文件，我们可以更新 `index.html` 文件以引用 `example.js` 而不是 `example.ts`：

```html
// index.html 内部

<script src="example.js"></script>
```

现在在浏览器中打开 `index.html` 文件将在控制台中显示预期的"Hello!"输出，并且没有任何错误！

### TypeScript 会改变我的 JavaScript 吗？

查看我们的 JavaScript 文件，我们可以看到与 TypeScript 代码相比几乎没有什么变化。

```javascript
"use strict";

const run = (message) => {
  console.log(message);
};

run("Hello!");
```

它从 `run` 函数中删除了 `: string`，并在文件顶部添加了 `"use strict";`。但除此之外，代码是相同的。

这是 TypeScript 的一个关键指导原则——它在 JavaScript 之上为你提供了一个薄薄的语法层，但它不会改变代码的工作方式。它不会添加运行时验证。它不会尝试优化代码的性能。

它只是添加类型（以提供更好的开发体验 DX），然后在将代码转换为 JavaScript 时将其删除。

> 这个指导原则有一些例外，例如枚举 (enums)、命名空间 (namespaces) 和类参数属性 (class parameter properties)——但我们稍后会介绍这些。

### 关于版本控制的说明

我们已成功将 TypeScript 代码转译为 JavaScript，但我们也向项目中添加了一个新文件。在项目根目录添加一个 `.gitignore` 文件并包含 `*.js` 将阻止 JavaScript 文件被添加到版本控制中。

这很重要，因为它向使用该仓库的其他开发人员传达了 `*.ts` 文件是 JavaScript 的真实来源。

## 以观察模式运行 TypeScript (Running TypeScript in Watch Mode)

你可能已经注意到了一些事情。如果你对 TypeScript 文件进行了一些更改，你需要再次运行 `tsc`才能在浏览器中看到更改。

这很快就会变得乏味。你可能会忘记它，并想知道为什么你的更改还没有在浏览器中生效。幸运的是，TypeScript CLI 有一个 `--watch` 标志，它会在保存时自动重新编译你的 TypeScript 文件：

```
tsc --watch
```

要查看其实际效果，请在 VS Code 中并排打开 `example.ts` 和 `example.js` 文件。

如果你将 `example.ts` 中传递给 `run` 函数的 `message` 更改为其他内容，你会看到 `example.js` 文件自动更新。

## TypeScript CLI 中的错误

如果 `tsc`遇到错误，它将在终端中显示错误，并且带有错误的文件将在 VS Code 中用红色波浪线标记。

例如，尝试将 `example.ts` 中 `run` 函数内的 `message: string` 更改为 `message: number`：

```ts twoslash
// @errors: 2345
const run = (message: number) => {
  console.log(message);
};

run("Hello world!");
```

在终端内部，`tsc` 将显示一条错误消息：

```
// 终端内部

Argument of type 'string' is not assignable to parameter of type 'number'.

run("Hello world!");

Found 1 error. Watching for file changes.

```

将更改改回 `message: string` 将消除错误，并且 `example.js` 文件将再次自动更新。

在观察模式下运行 `tsc` 对于自动编译 TypeScript 文件和在编写代码时捕获错误非常有用。

它对于大型项目尤其有用，因为它可以检查整个项目。这与你的 IDE 不同，IDE 仅显示当前打开文件的错误。

## TypeScript 与现代框架 (TypeScript With Modern Frameworks)

到目前为止，我们的设置非常简单。一个 TypeScript 文件，一个 `tsc –watch` 命令和一个 JavaScript 文件。但是为了构建一个前端应用程序，我们需要做更多的事情。我们需要处理 CSS、代码压缩 (minification)、打包 (bundling) 等等。TypeScript 无法帮助我们完成所有这些。

幸运的是，有许多前端框架可以提供帮助。

Vite 是前端工具套件的一个示例，它不仅可以将 `.ts` 文件转译为 `.js` 文件，还提供了一个具有热模块替换 (Hot Module Replacement, HMR) 功能的开发服务器。使用 HMR 设置，你可以在浏览器中看到代码更改的反映，而无需手动重新加载页面。

但是有一个缺点。虽然 Vite 和其他工具处理 TypeScript 到 JavaScript 的实际转译，但它们本身不提供类型检查。这意味着你可能会在代码中引入错误，而 Vite 会继续运行开发服务器而不会通知你。它甚至会允许你将错误推送到生产环境，因为它对此一无所知。

所以，我们仍然需要 TypeScript CLI 来捕获错误。但是如果 Vite 正在转译我们的代码，我们就不需要 TypeScript 也这样做。

### TypeScript 作为 Linter

幸运的是，我们可以配置 TypeScript 的 CLI 以允许进行类型检查，而不会干扰我们的其他工具。

在 `tsconfig.json` 文件中，有一个名为 `noEmit` 的选项，它告诉 `tsc` 是否生成 JavaScript 文件。

通过将 `noEmit` 设置为 `true`，运行 `tsc` 时将不会创建 JavaScript 文件。这使得 TypeScript 更像一个 linter 而不是一个转译器。这使得 `tsc` 步骤成为 CI/CD 系统的一个很好的补充，因为它可以防止合并带有 TypeScript 错误的拉取请求 (pull request)。

在本书的后续部分，我们将更仔细地研究用于应用程序开发的更高级的 TypeScript 配置。
