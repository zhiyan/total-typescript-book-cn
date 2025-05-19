在深入学习 TypeScript 之前，让我们花点时间谈谈它的基础 —— JavaScript。

JavaScript 是一种使网页具有交互性的语言。任何现代网站都会使用一定数量的 JavaScript。网站越复杂，JavaScript 也就越复杂。

但是，与其他编程语言不同，JavaScript 并非为构建复杂系统而生。

如果你在 2000 年代构建 JavaScript 应用，你通常会遇到很多麻烦。你的 IDE（集成开发环境）缺乏基本功能。自动补全、内联错误提示都没有。你无法知道是否将正确的参数传递给了正确的函数。随着用户开始要求更复杂的在线体验，这使得使用 JavaScript 成为一场噩梦。

这对于重构代码尤其如此。如果你不得不更改一个函数签名，你就必须手动查找并更新整个代码库中调用该函数的每一个地方。这可能需要数小时，而且无法保证在将代码推向生产环境之前你已经修复了所有问题。

## TypeScript 的起源

随着这些限制变得越来越明显，开发者开始寻找一种更好的编写 JavaScript 的方法。

大约在 2010 年，微软注意到他们的许多团队正在使用一个名为 Script# (ScriptSharp) 的社区项目来构建他们的 JavaScript 应用。这个库允许开发者用 C# 编写代码，然后将其转换为 JavaScript。C# 具有用于构建大型应用的优秀特性——因此它使得构建这些应用的体验更加愉快。事实上，许多团队发现这是他们在大型团队中构建复杂应用的唯一方法。

C# 的创造者 Anders Hejlsberg 受命调查这一现象。他感到非常惊讶。人们对 JavaScript 非常不满，以至于他们愿意用一种完全不同的语言进行编码，以便获得他们习惯的强大 IDE 功能。

于是他想：我们能否创造一种更接近 JavaScript 的新语言，但它能提供 JavaScript 所缺乏的所有 IDE 功能呢？

因此，TypeScript 诞生了。（是的，C# 的发明者也是 TypeScript 的发明者。真不赖。）

自推出以来的大约十年间，TypeScript 已成长为现代开发的中流砥柱。在许多指标上，它甚至比 JavaScript 更受欢迎。

在本书中，你将了解它为何如此受欢迎，以及它如何帮助你开发更好的应用程序，同时让你的开发者生涯更轻松。

## TypeScript 如何工作

对于一个纯 JavaScript 项目，你通常会将代码写在扩展名为 `.js` 的文件中。这些文件可以直接在浏览器或像 Node.js 这样的运行时环境（用于在服务器或你的笔记本电脑上运行 JavaScript）中执行。你编写的 JavaScript 就是最终执行的 JavaScript。

如果你要测试代码是否有效，你需要在运行时——浏览器或 Node.js——中进行测试。

对于一个 TypeScript 项目，你的代码主要放在 `.ts` 文件中。

在你的 IDE 内部，这些文件由 TypeScript 的“语言服务器”监控。这个服务器会在你输入时观察你，并为 IDE 提供自动补全、错误检查等功能。

与 `.js` 文件不同，`.ts` 文件通常不能直接由浏览器或运行时执行。相反，它们需要一个初始的构建过程。

这就是 TypeScript 的 `tsc` CLI 发挥作用的地方，它将你的 `.ts` 文件转换为 `.js` 文件。你可以在编写代码时利用 TypeScript 的特性，但最终输出的仍然是纯 JavaScript。

这个系统的巨大好处在于你与 TypeScript 形成了一个反馈循环。你编写代码，IDE 内的服务器给你反馈，你根据反馈进行调整。所有这一切都发生在你的代码进入浏览器之前。这个循环比 JavaScript 的快得多，因此可以帮助你更快地创建更高质量的代码。

> 自动化测试也可以提供高质量的反馈循环。虽然我们不会在本书中介绍这一点，但自动化测试是 TypeScript 创建极高质量代码的绝佳伴侣。

因此，虽然 TypeScript 的构建过程比 JavaScript 更复杂，但其带来的好处是值得的。

## TypeScript 有何不同？

使 TypeScript 与 JavaScript 不同的东西可以用一个词来概括：类型。

但这里有一个常见的误解。人们认为 TypeScript 的核心使命是使 JavaScript 成为一种像 C# 或 Rust 那样的强类型语言。这不完全准确。

TypeScript 的发明并非为了让 JavaScript 成为强类型语言，而是为了给 JavaScript 提供强大的工具支持。

想象一下你正在构建一个 IDE，并且你希望在用户输错函数名或对象属性时给出警告。如果你不知道代码中变量、参数和对象的形态，你就只能靠猜测。

但是，如果你确实知道应用程序中所有东西的类型，你就可以开始实现强大的 IDE 功能，如自动补全、内联错误和自动重构。

因此，TypeScript 旨在提供足够的强类型特性，以使使用 JavaScript 的过程更加愉快和高效。

## TypeScript 开发工具

让我们分解一下使用 TypeScript 所需的工具：

- 一个 IDE：为了编写代码，你需要一个编辑器或集成开发环境。虽然你可以使用任何 IDE，但本书假设你正在使用微软的 Visual Studio Code。VS Code 与 TypeScript 的集成非常出色，你很快就会看到。如果还没有安装，请从 https://code.visualstudio.com 安装它。
- 一个执行环境：你需要一个地方来运行你编译生成的 JavaScript。这可以是 Node.js 或像 Chrome 这样的网页浏览器。
- TypeScript CLI：运行 TypeScript CLI（命令行界面）需要 Node.js。这个工具可以将你的 TypeScript 转换为 JavaScript，并警告你项目中的任何问题。

### 安装 Node.js

Node.js 安装程序可以从 [Node.js 网站](https://nodejs.org/) 下载。

访问该网站时，你会看到两个选项：LTS 和 Current。

LTS 是“长期支持版 (Long Term Support)”的缩写。这是推荐用于生产环境的版本。它是最稳定的版本，也是我们将在本书中使用的版本。

Current 版本包含最新的功能，但不建议用于生产环境。

点击 LTS 按钮下载安装程序并按照安装说明进行操作。

运行安装程序后，你可以通过打开终端并运行以下命令来验证它是否正确安装：

```
node -v
```

如果 Node.js 安装正确，此命令将显示版本号。如果你看到类似“node command not found”的错误消息，则表示安装未成功，你应该重试。

### 使用 PNPM 进行可选的包管理

Node.js 默认包含 `npm` 包管理器。

如果你使用过 JavaScript 仓库，你可能熟悉 `npm` 和 `package.json` 文件。`package.json` 文件列出了运行仓库中代码所需安装的所有包。

例如，在本材料的仓库中，我们有一个用于运行练习的特殊 CLI，以及辅助包和各种其他依赖项，如 `cross-fetch` 和 `nodemon`：

```json
// package.json

{
  "devDependencies": {
    "@total-typescript/exercise-cli": "0.4.0",
    "@total-typescript/helpers": "~0.0.1",
    "cross-fetch": "~3.1.5",
    "nodemon": "~3.0.1",
    "npm-run-all": "~4.1.5",
    "prettier": "~2.8.7",
    "typescript": "~5.2.2",
    "vite-tsconfig-paths": "~4.0.7",
    "vitest": "0.34.4"
  }
}
```

要安装这些包，你通常会运行 `npm install` 命令，该命令会从 npm 仓库将它们下载到你的 `node_modules` 文件夹中。`node_modules` 文件夹包含 `src` 目录中练习运行所需的 JavaScript 文件。

然而，对于本书的仓库，我们将改用 PNPM 包管理器。

`pnpm` 的使用方式与 `npm`相同，但效率更高。`pnpm` 不会为每个项目创建单独的 `node_modules` 文件夹，而是在你的计算机上使用单个位置，并从那里硬链接依赖项。这使得它运行更快，占用的磁盘空间也更少。我在我所有的项目中都使用 PNPM。

要安装 PNPM，请按照[官方文档](https://pnpm.io/installation)中提供的说明进行操作。

## 安装 TypeScript

TypeScript 及其依赖项包含在一个名为 typescript 的包中。

你可以使用 pnpm 或 npm 全局安装它：

```
pnpm add -g typescript
```

或

```
npm install –-global typescript
```

TypeScript 通常也会安装在你的 `package.json` 中，以确保所有使用该项目的开发人员都使用相同的版本。就本书而言，全局安装就足够了。
