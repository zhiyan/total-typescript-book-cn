无论你使用什么 IDE，TypeScript 的工作方式都相同，但在本书中，我们将假设你正在使用 Visual Studio Code (VS Code)。

当你打开 VS Code 时，TypeScript 服务会在后台启动。只要你打开了 TypeScript 文件，它就会保持活动状态。

让我们来看看一些由 TypeScript 服务驱动的很棒的 VS Code 功能。

## 自动完成 (Autocomplete)

如果要我说出一个我离不开的 TypeScript 特性，那就是自动完成。

TypeScript 知道你应用中所有东西的类型。因此，它可以在你输入时给出建议——极大地提高你的速度。

在下面的示例中，在 `audioElement` 之后仅输入"p"就会显示所有以"p"开头的属性。

```typescript
const audioElement = document.createElement("audio");

audioElement.p; // play, pause, part 等
```

这对于探索你可能不熟悉的 API 非常强大，例如本例中的 `HTMLAudioElement` API。

### 手动触发自动完成

你经常需要手动触发自动完成。在 VS Code 中，`Ctrl + Space` 键盘快捷键会显示你正在输入内容的建议列表。

例如，如果你要向元素添加事件侦听器，你会看到可用事件的列表：

```typescript
document.addEventListener(
  "" // 此处自动完成
);
```

在引号内按下 `Ctrl + Space` 快捷键，光标置于引号内，将显示可以侦听的事件列表：

```
DOMContentLoaded
abort
animationcancel
...
```

如果你想将列表缩小到你感兴趣的事件，可以在按 `Ctrl + Space` 之前键入"drag"，这样只会显示相应的事件：

```
drag
dragend
dragenter
dragleave
...
```

自动完成是编写 TypeScript 代码的重要工具，并且在 VS Code 中开箱即用。

### 练习

#### 练习 1：自动完成

这是一个可以触发自动完成的代码示例：

```typescript
const acceptsObj = (obj: { foo: string; bar: number; baz: boolean }) => {};

acceptsObj({
  // 在这里自动完成！
});
```

练习使用自动完成快捷方式在调用 `acceptsObj` 时填充对象。

<Exercise title="练习 1：自动完成" filePath="/src/016.5-ide-superpowers/044-manually-triggering-autocomplete.problem.ts"></Exercise>

#### 解决方案 1：自动完成

当你在对象内部按下 `Ctrl + Space` 时，你会看到基于 `MyObj` 类型的可能属性列表：

```typescript
bar;
baz;
foo;
```

当你选择每个属性时，自动完成列表将更新以显示剩余的属性。

## TypeScript 错误检查

TypeScript 最著名的就是它的错误。这些是 TypeScript 用来确保你的代码正在按照你的想法执行的一组规则。

对于你对文件所做的每次更改，TypeScript 服务都会检查你的代码。

如果 TypeScript 服务发现任何错误，它会告诉 VS Code 在有问题的代码部分下方绘制一条红色波浪线。将鼠标悬停在带下划线的代码上会显示错误消息。一旦你进行了更改，TypeScript 服务将再次检查，如果错误已修复，则会删除红色波浪线。

我喜欢把它想象成一位老师在你打字时俯视着你的肩膀，用红笔在你的作业上划线。

让我们更深入地研究这些错误。

### 捕获运行时错误

有时 TypeScript 会警告你一些在运行时肯定会失败的事情。

例如，考虑以下代码：

```ts twoslash
// @errors: 18047
const a = null;

a.toString();
```

TypeScript 告诉我们 `a` 有问题。这告诉我们问题出在哪里，但不一定告诉我们问题是什么。在这种情况下，我们需要停下来思考为什么我们不能在 `null` 上调用 `toString()`。如果我们这样做，它会在运行时抛出错误。

```
Uncaught TypeError: Cannot read properties of null (reading 'toString').
```

在这里，TypeScript 告诉我们即使我们不需要检查，也可能会发生错误。非常方便。

### 关于非运行时错误的警告

并非 TypeScript 警告我们的所有内容都会在运行时实际失败。

看下面这个例子，我们给一个空对象赋值一个属性：

```ts twoslash
// @errors: 2339
const obj = {};

const result = obj.foo;
```

TypeScript 在 `foo` 下方画了一条红色波浪线。但是如果我们仔细想想，这段代码实际上不会在运行时导致错误。我们试图访问这个对象中不存在的属性：`foo`。这不会报错，只会意味着 `result` 是 `undefined`。

TypeScript 会警告我们一些不会导致错误的事情，这似乎很奇怪，但这实际上是一件好事。如果 TypeScript 没有警告我们这一点，那它就等于说我们可以在任何时候访问任何对象上的任何属性。在整个应用程序的生命周期中，这可能会导致相当多的错误。

最好将 TypeScript 的规则视为有主见的。它们是一系列有用的提示，可以使你的应用程序整体上更安全。

### 接近问题源的警告

TypeScript 会尝试尽可能在接近问题源的地方给出警告。

让我们看一个例子。

```ts twoslash
// @errors: 2561
type Album = {
  artist: string;
  title: string;
  year: number;
};

const album: Album = {
  artsist: "Television",
  title: "Marquee Moon",
  year: 1977,
};
```

我们定义了一个 `Album` 类型——一个具有三个属性的对象。然后，我们通过 `const album: Album` 说明 `album` 常量需要是该类型。如果还不理解所有语法，请不要担心——我们稍后会全部介绍。

你能看到问题吗？创建专辑时 `artist` 属性存在拼写错误。这是因为我们已经声明 `album` 变量需要是 `Album` 类型，但我们将 `artist` 拼写成了 `artsist`。TypeScript 告诉我们犯了一个错误，甚至建议了正确的拼写。

### 处理多行错误

然而，有时 TypeScript 会在一个更不方便的地方给出错误。

在这个例子中，我们有一个名为 `logUserJobTitle` 的函数，它记录用户的职位名称：

```typescript
const logUserJobTitle = (user: {
  job: {
    title: string;
  };
}) => {
  console.log(user.job.title);
};
```

现在不用担心语法——我们稍后会介绍。重要的是 `logUserJobTitle` 接受一个用户对象，该对象具有一个 `job` 属性，而 `job` 属性又具有一个 `title` 属性。

现在，让我们用一个 `job.title` 是数字而不是字符串的用户对象来调用 `logUserJobTitle`。

```ts twoslash
// @errors: 2345
const logUserJobTitle = (user: {
  job: {
    title: string;
  };
}) => {
  console.log(user.job.title);
};

// ---cut---
const exampleUser = {
  job: {
    title: 123,
  },
};

logUserJobTitle(exampleUser);
```

看起来 TypeScript 应该在 `exampleUser` 对象的 `title` 上给出错误。但相反，它在 `exampleUser` 变量本身上给出了错误。

它有多行，这可能感觉很吓人。处理多行错误的一个好经验法则是从底部开始：

```
Type 'number' is not assignable to type 'string'.
```

这告诉我们一个 `number` 被传递到一个期望 `string` 的位置。这是问题的根源。

让我们看下一行：

```
The types of 'job.title' are incompatible between these types.
```

这告诉我们 `job` 对象中的 `title` 属性是问题所在。

我们已经理解了问题，而无需查看顶行，顶行通常是问题的冗长摘要。

在处理多行 TypeScript 错误时，从下往上阅读错误可能是一个有用的策略。

## 内省变量和声明 (Introspecting Variables and Declarations)

你不仅可以悬停在错误消息上。任何时候你将鼠标悬停在变量或声明上，VS Code 都会显示有关它的信息。

在这个例子中，我们可以将鼠标悬停在 `thing` 上，看到它的类型是 `number`：

```ts twoslash
let thing = 123;
//  ^?
```

悬停也适用于更复杂的示例。这里 `otherObject` 扩展了 `otherThing` 的属性并添加了 `thing`：

```typescript
let otherThing = {
  name: "Alice",
};

const otherObject = {
  ...otherThing,
  thing: "abc",
};

otherObject.thing;
```

将鼠标悬停在 `otherObject` 上会显示其所有属性的计算结果：

```ts twoslash
let otherThing = {
  name: "Alice",
};

const otherObject = {
  ...otherThing,
  thing: "abc",
};

// ---cut---
console.log(otherObject);
//          ^?
```

根据你悬停的内容，VS Code 会显示不同的信息。例如，悬停在 `otherObject` 上会显示其所有属性，而悬停在 `thing` 上会显示其类型。

习惯于在你的代码库中四处查看变量和声明，因为这是理解代码正在做什么的好方法。

### 练习

#### 练习 1：悬停函数调用

在此代码片段中，我们尝试使用 ID 为 `12` 的 `document.getElementById` 来获取元素。然而，TypeScript 正在报错。

```ts twoslash
// @errors: 2345
let element = document.getElementById(12);
```

悬停如何帮助确定 `document.getElementById` 实际需要什么参数？另外，`element` 的类型是什么？

<Exercise title="练习 1：悬停函数调用" filePath="/src/016.5-ide-superpowers/041-hovering-a-function-call.problem.ts"></Exercise>

#### 解决方案 1：悬停函数调用

首先，我们可以将鼠标悬停在红色波浪线错误本身上。在这种情况下，将鼠标悬停在 `12` 上，我们会得到以下错误消息：

```
Argument of type 'number' is not assignable to parameter of type 'string'.
```

我们还会得到 `getElementById` 函数的详细信息：

```
(method) Document.getElementById(elementId: string): HTMLElement | null
```

对于 `getElementById`，我们可以看到它需要一个字符串作为参数，并返回一个 `HTMLElement | null`。我们稍后会研究这种语法，但它基本上意味着 `HTMLElement` 或 `null`。

这告诉我们可以通过将参数更改为字符串来修复错误：

```ts twoslash
let element = document.getElementById("12");
//  ^?
```

我们还知道 `element` 的类型将是 `document.getElementById` 返回的类型，我们可以通过将鼠标悬停在 `element` 上来确认这一点。

因此，在不同的地方悬停会显示不同的信息。当我在 TypeScript 中工作时，我会不断地悬停以更好地了解我的代码正在做什么。

## JSDoc 注释

JSDoc 是一种向代码中的类型和函数添加文档的语法。它允许 VS Code 在悬停时显示的弹出窗口中显示附加信息。

这在与团队合作时非常有用。

以下是如何记录 `logValues` 函数的示例：

````typescript
/**
 * 将对象的属性值记录到控制台。
 *
 * @param obj - 要记录的对象。
 *
 * @example
 * ```ts
 * logValues({ a: 1, b: 2 });
 * // 输出:
 * // a: 1
 * // b: 2
 * ```
 */

const logValues = (obj: any) => {
  for (const key in obj) {
    console.log(`${key}: ${obj[key]}`);
  }
};
````

`@param` 标签用于描述函数的参数。`@example` 标签用于提供函数使用方法的示例，使用 markdown 语法。

JSDoc 注释中还有许多可用的标签。你可以在 [JSDoc 文档](https://jsdoc.app/) 中找到它们的完整列表。

添加 JSDoc 注释是传达代码目的和用法的一种有用方法，无论你是在开发库、团队合作还是从事个人项目。

### 练习

#### 练习 1：为悬停添加文档

这是一个将两个数字相加的简单函数：

```typescript
const myFunction = (a: number, b: number) => {
  return a + b;
};
```

为了理解这个函数的作用，你必须阅读代码。

为函数添加一些文档，以便当你将鼠标悬停在它上面时，可以阅读它功能的描述。

<Exercise title="练习 1：为悬停添加文档" filePath="/src/016.5-ide-superpowers/042-adding-tsdoc-comments-for-hovers.problem.ts"></Exercise>

#### 解决方案 1：为悬停添加文档

在这种情况下，我们将指定该函数"将两个数字相加"。我们还可以使用 `@example` 标签来显示函数使用方法的示例：

```typescript
/**
 * 将两个数字相加。
 * @example
 * myFunction(1, 2);
 * // 将返回 3
 */

const myFunction = (a: number, b: number) => {
  return a + b;
};
```

现在，每当你将鼠标悬停在此函数上时，函数的签名以及注释和 `@example` 标签下方的所有内容的完整语法高亮都会显示出来：

```
// 悬停在 myFunction 上显示：

const myFunction: (a: number, b: number) => number

将两个数字相加。

@example

myFunction(1, 2);

// 将返回 3
```

虽然这个例子很简单（我们当然可以更好地命名函数），但这对于记录你的代码来说是一个极其重要的工具。

## 使用"转到定义"和"转到引用"进行导航 (Navigating with Go To Definition and Go To References)

TypeScript 服务还提供了导航到变量或声明定义的功能。

在 VS Code 中，此"转到定义"快捷方式在 Mac 上使用 `Command + 单击`，在 Windows 上对当前光标位置使用 `F12`。你也可以右键单击并从任一平台上的上下文菜单中选择"转到定义"。为简洁起见，我们将使用 Mac 快捷方式。

到达定义位置后，重复 `Command + 单击` 快捷方式将显示该变量或声明被使用的所有位置。这称为"转到引用"。这对于在大型代码库中导航特别有用。

该快捷方式还可用于查找内置类型和库的类型定义。例如，如果在 `getElementById` 方法中使用 `document` 时对其执行 `Command + 单击`，你将被带到 `document` 本身的类型定义。

这是理解内置类型和库如何工作的一个很棒的功能。

## 重命名符号 (Rename Symbol)

在某些情况下，你可能希望在整个代码库中重命名一个变量。假设数据库列从 `id` 更改为 `entityId`。简单的查找和替换将不起作用，因为 `id` 在许多地方用于不同的目的。

一个名为"重命名符号"的 TypeScript 功能允许你通过单个操作来完成此操作。

让我们看一个例子。

```typescript
const filterUsersById = (id: string) => {
  return users.filter((user) => user.id === id);
};
```

右键单击 `findUsersById` 函数的 `id` 参数，然后选择"重命名符号"。

将显示一个面板，提示输入新名称。键入 `userIdToFilterBy` 并按 `enter`。VS Code 非常智能，能够意识到我们只想重命名函数的 `id` 参数，而不是 `user.id` 属性：

```typescript
const filterUsersById = (userIdToFilterBy: string) => {
  return users.filter((user) => user.id === userIdToFilterBy);
};
```

重命名符号功能是重构代码的绝佳工具，并且它也适用于多个文件。

## 自动导入 (Automatic Imports)

大型 JavaScript 应用程序可能由许多模块组成。手动从其他文件导入可能很繁琐。幸运的是，TypeScript 支持自动导入。

当你开始键入要导入的变量的名称时，使用 `Ctrl + Space` 快捷方式时，TypeScript 将显示建议列表。从列表中选择一个变量，TypeScript 将自动在文件顶部添加一个导入语句。

在名称中间使用自动完成时，你需要稍微小心一些，因为该行的其余部分可能会被无意中更改。为避免此问题，请确保在按 `Ctrl + Space` 之前光标位于名称的末尾。

## 快速修复 (Quick Fixes)

VS Code 还提供了一个"快速修复"功能，可用于运行快速重构脚本。现在，让我们用它来同时导入多个缺失的导入。

要打开"快速修复"菜单，请按 `Command + .`。如果你在引用尚未导入的值的代码行上执行此操作，则会显示一个弹出窗口。

```ts twoslash
// @errors: 2552
const triangle = new Triangle();
```

"快速修复"菜单中的一个选项将是"添加所有缺失的导入"。选择此选项会将所有缺失的导入添加到文件顶部。

```typescript
import { Triangle } from "./shapes";

const triangle = new Triangle();
```

我们将在练习中再次查看"快速修复"菜单。它为重构代码提供了许多选项，是了解 TypeScript 功能的好方法。

## 重启 VS Code 服务 (Restarting the VS Code Server)

我们已经看了几个 TypeScript 在 VS Code 中可以为你做的很酷的事情的例子。然而，运行语言服务并非易事。TypeScript 服务有时可能会进入错误状态并停止正常工作。如果更改了配置文件或处理特别大的代码库，则可能会发生这种情况。

如果你遇到奇怪的行为，最好重新启动 TypeScript 服务。为此，请使用 `Shift + Command + P` 打开 VS Code 命令面板，然后搜索"Restart TS Server"。

几秒钟后，服务应该会重新启动并确保错误报告正常。

## 在 JavaScript 中工作 (Working in JavaScript)

如果你是 JavaScript 用户，你可能已经注意到许多这些功能在不使用 TypeScript 的情况下就已经可用了。自动完成、组织导入、自动导入和悬停在 JavaScript 中都可以工作。为什么呢？

这是因为 TypeScript。TypeScript 的 IDE 服务不仅在 TypeScript 文件上运行，而且在 JavaScript 文件上运行。这意味着 TypeScript 的一些令人惊叹的 IDE 体验在 JavaScript 中也可用。

某些功能在 JavaScript 中并非开箱即用。最突出的是 IDE 内错误。没有类型注释，TypeScript 对代码的结构不够自信，无法为你提供准确的警告。

> 提示：有一个系统可以使用 TypeScript 支持的 JSDoc 注释向 `.js` 文件添加类型，但默认情况下未启用。我们稍后将学习如何配置它。

TypeScript 这样做的原因首先是为了给 VS Code 用户提供更好的 JavaScript 开发体验。TypeScript 功能的子集总比没有好。

但结果是，对于 JavaScript 用户来说，迁移到 TypeScript 应该感觉非常熟悉。这是相同的 IDE 体验，只是更好。

## 练习

### 练习 1：快速修复重构

让我们回顾一下我们之前看过的 VS Code 的"快速修复"菜单。

在这个例子中，我们有一个函数，其中包含一个 `randomPercentage` 变量，该变量是通过调用 `Math.random()` 并将结果转换为固定数字创建的：

```typescript
const func = () => {
  // 将此重构为它自己的函数
  const randomPercentage = `${(Math.random() * 100).toFixed(2)}%`;

  console.log(randomPercentage);
};
```

这里的目标是将生成随机百分比的逻辑重构为一个独立的函数。

突出显示变量、行或整个代码块，然后按 `Command + .` 打开"快速修复"菜单。根据打开菜单时光标的位置，将有几个修改代码的选项。

尝试不同的选项，看看它们如何影响示例函数。

<Exercise title="练习 1：快速修复重构" filePath="/src/016.5-ide-superpowers/050-refactor.problem.ts"></Exercise>

### 解决方案 1：快速修复重构

"快速修复"菜单将根据打开时光标的位置显示不同的重构选项。

#### 提取到模块作用域中的常量 (Extracting to Constant in Module Scope)

与此类似，"提取到模块作用域中的常量"选项将在模块作用域内创建一个新的常量：

```typescript
const randomTimes100 = Math.random() * 100;

const func = () => {
  const randomPercentage = `${randomTimes100.toFixed(2)}%`;

  console.log(randomPercentage);
};
```

#### 内联和提取函数 (Inlining and Extracting Functions)

选择整个随机百分比逻辑会启用一些其他的提取选项。

"提取到模块作用域中的函数"选项的作用与常量选项类似，但会创建一个函数：

```typescript
const func = () => {
  const randomPercentage = getRandomPercentage();

  console.log(randomPercentage);
};

function getRandomPercentage() {
  return `${(Math.random() * 100).toFixed(2)}%`;
}
```

这些只是"快速修复"菜单提供的一些选项。你可以用它们实现很多功能，而我们仅仅触及了皮毛。继续探索和试验，以发现它们的全部潜力！
