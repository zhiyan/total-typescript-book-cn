现在我们已经介绍了 TypeScript 的大部分“为什么”，是时候开始学习“如何”了。我们将介绍类型注解 (type annotations) 和类型推断 (type inference) 等关键概念，以及如何开始编写类型安全的函数。

打下坚实的基础非常重要，因为你稍后学习的所有内容都建立在本章所学知识之上。

## 基本注解 (Basic Annotations)

作为 TypeScript 开发人员，你最常做的事情之一就是注解你的代码。注解告诉 TypeScript 某个东西应该是什么类型。

注解通常会使用 `:` —— 这用于告诉 TypeScript 变量或函数参数是某种特定的类型。

### 函数参数注解 (Function Parameter Annotations)

你将使用的最重要的注解之一是用于函数参数的注解。

例如，这是一个 `logAlbumInfo` 函数，它接收一个 `title` 字符串、一个 `trackCount` 数字和一个 `isReleased` 布尔值：

```ts twoslash
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean
) => {
  // 实现
};
```

每个参数的类型注解使 TypeScript 能够检查传递给函数的参数是否具有正确的类型。如果类型不匹配，TypeScript 将在有问题的参数下方显示一条红色波浪线。

```ts twoslash
// @errors: 2345
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean
) => {
  // 实现
};

// ---cut---
logAlbumInfo("Black Gold", false, 15);
```

在上面的示例中，我们首先会在 `false` 下方看到一个错误，因为布尔值不能赋给数字。

```ts twoslash
// @errors: 2345
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean
) => {
  // 实现
};

// ---cut---
logAlbumInfo("Black Gold", 20, 15);
```

修复该错误后，我们会在 `15` 下方看到一个错误，因为数字不能赋给布尔值。

### 变量注解 (Variable Annotations)

除了函数参数，你还可以注解变量。

以下是一些变量及其关联类型的示例。

```ts twoslash
let albumTitle: string = "Midnights";
let isReleased: boolean = true;
let trackCount: number = 13;
```

请注意，每个变量名后面都跟着一个 `:` 及其原始类型，然后才设置其值。

变量注解用于明确告诉 TypeScript 我们期望变量的类型是什么。

一旦使用特定类型注解声明了变量，TypeScript 将确保该变量与你指定的类型保持兼容。

例如，这种重新赋值是可行的：

```ts twoslash
let albumTitle: string = "Midnights";

albumTitle = "1989";
```

但是这个会显示错误：

```ts twoslash
// @errors: 2322
let isReleased: boolean = true;

isReleased = "yes";
```

TypeScript 的静态类型检查能够在编译时发现错误，这在你编写代码时会在后台进行。

在上面 `isReleased` 的例子中，错误消息显示：

```txt
Type 'string' is not assignable to type 'boolean'.
```

换句话说，TypeScript 告诉我们它期望 `isReleased` 是一个布尔值，但却收到了一个 `string`。

在运行代码之前就被警告这类错误真是太好了！

### 基本类型 (The Basic Types)

TypeScript 有许多基本类型可用于注解你的代码。以下是一些最常见的类型：

```ts twoslash
let example1: string = "Hello World!";
let example2: number = 42;
let example3: boolean = true;
let example4: symbol = Symbol();
let example5: bigint = 123n;
let example6: null = null;
let example7: undefined = undefined;
```

这些类型中的每一种都用于告诉 TypeScript 变量或函数参数应该是什么类型。

你可以在 TypeScript 中表达更复杂的类型：数组、对象、函数等等。我们将在后续章节中介绍这些。

### 类型推断 (Type Inference)

TypeScript 使你能够注解代码中几乎任何值、变量或函数。你可能会想："等等，我需要注解所有东西吗？那会增加很多额外的代码。"

事实证明，TypeScript 可以从代码运行的上下文中推断出很多信息。

#### 变量并非总是需要注解

让我们再看一下我们的变量注解示例，但去掉注解：

```ts twoslash
let albumTitle = "Midnights";
let isReleased = true;
let trackCount = 13;
```

我们没有添加注解，但 TypeScript 并没有报错。发生了什么？

尝试将光标悬停在每个变量上。

```ts twoslash
// 将鼠标悬停在每个变量名上

let albumTitle: string;
let isReleased: boolean;
let trackCount: number;
```

即使它们没有被注解，TypeScript 仍然能够识别出它们各自应该是什么类型。这就是 TypeScript 从用法中推断变量的类型。

它的行为就像我们注解了它一样，如果我们尝试给它分配一个与其最初分配的类型不同的类型，它会警告我们：

```ts twoslash
// @errors: 2322

let isReleased = true;

isReleased = "yes";
```

并且还会为我们提供变量的自动完成功能：

```ts
albumTitle.toUpper; // 在自动完成中显示 `toUpperCase`
```

这是 TypeScript 一个非常强大的部分。这意味着你基本上可以*不*注解变量，但你的 IDE 仍然知道它们的类型。

#### 函数参数总是需要注解

但是类型推断并非在所有地方都有效。让我们看看如果从 `logAlbumInfo` 函数的参数中删除类型注解会发生什么：

```ts twoslash
// @errors: 7006
const logAlbumInfo = (
  title,

  trackCount,

  isReleased
) => {
  // 函数体的其余部分
};
```

TypeScript 本身无法推断参数的类型，因此它在每个参数名称下方显示错误。

这是因为函数与变量非常不同。TypeScript 可以看到什么值赋给了哪个变量，因此它可以很好地猜测类型。

但是 TypeScript 不能仅从函数参数就判断出它应该是什么类型。当你不注解它时，它会将类型默认为 `any` —— 一个可怕的、不安全的类型。

它也无法从用法中检测到。如果我们有一个接受两个参数的 `add` 函数，TypeScript 将无法判断它们应该是数字：

```ts twoslash
// @errors: 7006
function add(a, b) {
  return a + b;
}
```

`a` 和 `b` 可以是字符串、布尔值或任何其他东西。TypeScript 无法从函数体中知道它们应该是什么类型。

因此，当你声明一个命名函数时，它们的参数在 TypeScript 中总是需要注解。

### `any` 类型

我们在"函数参数总是需要注解"一节中遇到的错误非常吓人：

```
Parameter 'title' implicitly has an 'any' type.
```

当 TypeScript 不知道某个东西是什么类型时，它会为其分配 `any` 类型。

此类型会破坏 TypeScript 的类型系统。它会关闭对其分配对象的类型安全检查。

这意味着任何东西都可以赋给它，它的任何属性都可以被访问/赋值，并且它可以像函数一样被调用。

```ts twoslash
let anyVariable: any = "This can be anything!";

anyVariable(); // 没有错误

anyVariable.deep.property.access; // 没有错误
```

上面的代码会在运行时报错，但 TypeScript 没有给我们警告！

所以，使用 `any` 可以用来关闭 TypeScript 中的错误。当类型过于复杂难以描述时，它可以作为一个有用的"逃生舱口"。

但是过度使用 `any` 会违背使用 TypeScript 的初衷，所以最好尽可能避免使用它——无论是隐式的还是显式的。

### 练习

#### 练习 1：带函数参数的基本类型

让我们从一个 `add` 函数开始，它接受两个布尔参数 `a` 和 `b`，并返回 `a + b`：

```ts twoslash
// @errors: 2365
export const add = (a: boolean, b: boolean) => {
  return a + b;
};
```

通过调用 `add` 函数创建一个 `result` 变量。然后检查 `result` 变量是否等于一个 `number`：

```ts twoslash
// @errors: 2365 2345 2344
import { Expect, Equal } from "@total-typescript/helpers";

export const add = (a: boolean, b: boolean) => {
  return a + b;
};

// ---cut---
const result = add(1, 2);

type test = Expect<Equal<typeof result, number>>;
```

目前，代码中有一些错误，用红色波浪线标记。

第一个是在 `add` 函数的 `return` 行，我们有 `a + b`：

```
Operator '+' cannot be applied to types 'boolean' and 'boolean'
```

在 `add` 函数调用的 `1` 参数下方也有一个错误：

```
Argument of type 'number' is not assignable to parameter of type 'boolean'
```

最后，我们可以看到我们的 `test` 结果有一个错误，因为 `result` 当前类型为 `any`，它不等于 `number`。

你的挑战是思考我们如何更改类型以消除错误，并确保 `result` 是一个 `number`。你可以将鼠标悬停在 `result` 上进行检查。

<Exercise title="练习 1：带函数参数的基本类型" filePath="/src/015-essential-types-and-annotations/020-basic-types-with-function-parameters.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAd9N"></Exercise>

#### 练习 2：注解空参数

这里我们有一个 `concatTwoStrings` 函数，其结构与 `add` 函数类似。它接受两个参数 `a` 和 `b`，并返回一个字符串。

```ts twoslash
// @errors: 7006
const concatTwoStrings = (a, b) => {
  return [a, b].join(" ");
};
```

目前 `a` 和 `b` 参数上有错误，它们没有用类型注解。

使用 `"Hello"` 和 `"World"` 调用 `concatTwoStrings` 的 `result` 并检查它是否为 `string` 时没有显示任何错误：

```ts twoslash
// @errors: 7006
import { Expect, Equal } from "@total-typescript/helpers";

const concatTwoStrings = (a, b) => {
  return [a, b].join(" ");
};

// ---cut---
const result = concatTwoStrings("Hello", "World");

type test = Expect<Equal<typeof result, string>>;
```

你的任务是为 `concatTwoStrings` 函数添加一些函数参数注解以消除错误。

<Exercise title="练习 2：注解空参数" filePath="/src/015-essential-types-and-annotations/021-annotating-empty-parameters.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAdKe"></Exercise>

#### 练习 3：基本类型

正如我们所见，当类型不匹配时，TypeScript 会显示错误。

这组示例向我们展示了 TypeScript 为我们提供的用于描述 JavaScript 的基本类型：

```ts twoslash
// @errors: 2322
export let example1: string = "Hello World!";
export let example2: string = 42;
export let example3: string = true;
export let example4: string = Symbol();
export let example5: string = 123n;
```

请注意，冒号 `:` 用于注解每个变量的类型，就像它用于键入函数参数一样。

你还会注意到有几个错误。

将鼠标悬停在每个带下划线的变量上将显示任何相关的错误消息。

例如，将鼠标悬停在 `example2` 上将显示：

```
Type 'number' is not assignable to type 'string'.
```

`example3` 的类型错误告诉我们：

```
Type 'boolean' is not assignable to type 'string'.
```

更改每个变量上注解的类型以消除错误。

<Exercise title="练习 3：基本类型" filePath="/src/015-essential-types-and-annotations/022-all-types.problem.ts" resourceId="NMpTvrI4rUCyVa4GVzY1iN"></Exercise>

#### 练习 4：`any` 类型

这是一个名为 `handleFormData` 的函数，它接受一个类型为 `any` 的 `e` 参数。该函数阻止默认的表单提交行为，然后从表单数据创建一个对象并返回它：

```ts
const handleFormData = (e: any) => {
  e.preventDefault();

  const data = new FormData(e.terget); // 译者注：原文此处存在拼写错误 e.terget，应为 e.target

  const value = Object.fromEntries(data.entries());

  return value;
};
```

这是一个测试该函数的示例，它创建一个表单，设置 `innerHTML` 以添加一个输入，然后手动提交表单。提交时，我们期望该值等于我们植入表单中的值：

```ts
it("Should handle a form submit", () => {
  const form = document.createElement("form");

  form.innerHTML = `
<input name="name" value="John Doe"></Exercise> // 译者注：此处 Exercise 标签似乎是多余的
`;

  form.onsubmit = (e) => {
    const value = handleFormData(e);

    expect(value).toEqual({ name: "John Doe" });
  };

  form.requestSubmit();

  expect.assertions(1);
});
```

请注意，这不是测试表单的常规方法，但它提供了一种更广泛地测试示例 `handleFormData` 函数的方法。

在代码的当前状态下，没有出现红色波浪线。

然而，当使用 Vitest 运行测试时，我们会得到一个类似于以下的错误：

```
This error originated in "any.problem.ts" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

The latest test that might've caused the error is "Should handle a form submit". It might mean one of the following:

- The error was thrown, while Vitest was running this test.

- This was the last recorded test before the error was thrown, if error originated after test finished its execution.
```

为什么会发生这个错误？为什么 TypeScript 没有在这里给我们一个错误？

我会给你一个线索。我在这里隐藏了一个讨厌的拼写错误。你能修复它吗？

<Exercise title="练习 4：`any` 类型" filePath="/src/015-essential-types-and-annotations/032.5-any.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAeU3"></Exercise>

#### 解决方案 1：带函数参数的基本类型

常识告诉我们，`add` 函数中的 `boolean` 类型应该替换为某种 `number` 类型。

如果你来自其他语言，你可能会尝试使用 `int` 或 `float`，但 TypeScript 只有 `number` 类型：

```ts twoslash
function add(a: number, b: number) {
  return a + b;
}
```

进行此更改可以解决错误，并且还为我们带来了一些其他好处。

如果我们尝试使用字符串而不是数字来调用 `add` 函数，我们会得到一个错误，指出 `string` 类型不能赋给 `number` 类型：

```ts twoslash
// @errors: 2345
function add(a: number, b: number) {
  return a + b;
}

// ---cut---
add("something", 2);
```

不仅如此，我们函数的结果现在也为我们推断出来了：

```ts twoslash
function add(a: number, b: number) {
  return a + b;
}

// ---cut---
const result = add(1, 2);
//    ^?
```

因此，TypeScript 不仅可以推断变量，还可以推断函数的返回类型。

#### 解决方案 2：注解空参数

众所周知，函数参数在 TypeScript 中总是需要注解。

因此，让我们更新函数声明参数，以便 `a` 和 `b` 都被指定为 `string`：

```ts twoslash
const concatTwoStrings = (a: string, b: string) => {
  return [a, b].join(" ");
};
```

此更改修复了错误。

额外提问，返回类型将被推断为什么类型？

```ts twoslash
const concatTwoStrings = (a: string, b: string) => {
  return [a, b].join(" ");
};

// ---cut---
const result = concatTwoStrings("Hello", "World");
//    ^?
```

#### 解决方案 3：更新基本类型

每个示例都代表了 TypeScript 的基本类型，并将按如下方式进行注解：

```ts twoslash
let example1: string = "Hello World!";
let example2: number = 42;
let example3: boolean = true;
let example4: symbol = Symbol();
let example5: bigint = 123n;
```

我们已经见过 `string`、`number` 和 `boolean`。`symbol` 类型用于 `Symbol`，`Symbol` 用于确保属性键是唯一的。`bigint` 类型用于对于 `number` 类型来说太大的数字。

然而，在实践中，你通常不会像这样注解变量。如果我们删除显式类型注解，将根本不会有任何错误：

```ts twoslash
let example1 = "Hello World!";
let example2 = 42;
let example3 = true;
let example4 = Symbol();
let example5 = 123n;
```

了解这些基本类型非常有用，即使你并非总是需要在变量声明中使用它们。

#### 解决方案 4：`any` 类型

在这种情况下，使用 `any` 对我们根本没有帮助。事实上，`any` 注解似乎实际上关闭了类型检查！

使用 `any` 类型，我们可以自由地对变量执行任何操作，TypeScript 不会阻止它。

使用 `any` 还会禁用自动完成等有用功能，而自动完成可以帮助你避免拼写错误。

没错——上面代码中的错误是由创建 `FormData` 时将 `e.target` 错拼为 `e.terget` 造成的！

```ts
const handleFormData = (e: any) => {
  e.preventDefault();

  const data = new FormData(e.terget); // e.terget! 糟糕！
  // 译者注：原文此处存在拼写错误 e.terget，应为 e.target
  const value = Object.fromEntries(data.entries());

  return value;
};
```

如果 `e` 被正确键入，TypeScript 会立即捕获此错误。我们将来会回到这个例子，看看正确的键入方式。

当你难以弄清楚如何正确键入某些内容时，使用 `any` 可能看起来是一个快速的解决方法，但它以后可能会反过来困扰你。

## 对象字面量类型 (Object Literal Types)

现在我们已经对基本类型进行了一些探索，让我们继续讨论对象类型。

对象类型用于描述对象的结构。对象的每个属性都可以有自己的类型注解。

定义对象类型时，我们使用花括号来包含属性及其类型：

```ts twoslash
const talkToAnimal = (animal: { name: string; type: string; age: number }) => {
  // 函数体的其余部分
};
```

这种花括号语法称为对象字面量类型。

### 可选对象属性 (Optional Object Properties)

我们可以使用 `?` 运算符将 `age` 属性标记为可选：

```ts twoslash
const talkToAnimal = (animal: { name: string; type: string; age?: number }) => {
  // 函数体的其余部分
};
```

对象字面量类型注解的一个很酷的地方是，它们在你输入时为属性名称提供自动完成功能。

例如，当调用 `talkToAnimal` 时，它会为你提供一个自动完成下拉列表，其中包含 `name`、`type` 和 `age` 属性的建议。

此功能可以为你节省大量时间，并且在你有多个名称相似的属性时也有助于避免拼写错误。

### 练习

#### 练习 1：对象字面量类型

这里我们有一个 `concatName` 函数，它接受一个包含 `first` 和 `last` 键的 `user` 对象：

```ts twoslash
// @errors: 7006
const concatName = (user) => {
  return `${user.first} ${user.last}`;
};
```

测试期望返回全名，并且测试通过：

```ts
it("should return the full name", () => {
  const result = concatName({
    first: "John",
    last: "Doe",
  });

  type test = Expect<Equal<typeof result, string>>;

  expect(result).toEqual("John Doe");
});
```

然而，在 `concatName` 函数的 `user` 参数上有一个熟悉的错误：

```
Parameter 'user' implicitly has an 'any' type.
```

我们可以从 `concatName` 函数体中看出，它期望 `user.first` 和 `user.last` 是字符串。

我们如何键入 `user` 参数以确保它具有这些属性并且它们是正确的类型？

<Exercise title="练习 1：对象字面量类型" filePath="/src/015-essential-types-and-annotations/025-object-literal-types.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAdzz"></Exercise>

#### 练习 2：可选属性类型

这是 `concatName` 函数的一个更新版本，如果未提供姓氏，则仅返回名字：

```ts twoslash
const concatName = (user: { first: string; last: string }) => {
  if (!user.last) {
    return user.first;
  }

  return `${user.first} ${user.last}`;
};
```

和以前一样，当我们测试未提供姓氏时函数仅返回名字时，TypeScript 会给出错误：

```ts twoslash
// @errors: 2345
const concatName = (user: { first: string; last: string }) => {
  if (!user.last) {
    return user.first;
  }

  return `${user.first} ${user.last}`;
};

// ---cut---
const result = concatName({
  first: "John",
});
```

错误告诉我们缺少一个属性，但错误是不正确的。我们*确实*希望支持仅包含 `first` 属性的对象。换句话说，`last` 需要是可选的。

你将如何更新此函数以修复错误？

<Exercise title="练习 2：可选属性类型" filePath="/src/015-essential-types-and-annotations/026-optional-property-types.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAeIm"></Exercise>

#### 解决方案 1：对象字面量类型

为了将 `user` 参数注解为对象，我们可以使用花括号语法 `{}`。

让我们首先将 `user` 参数注解为空对象：

```ts twoslash
// @errors: 2339
const concatName = (user: {}) => {
  return `${user.first} ${user.last}`;
};
```

错误改变了。这算是一种进步。错误现在显示在函数返回中的 `.first` 和 `.last` 下方。

为了修复这些错误，我们需要将 `first` 和 `last` 属性添加到类型注解中。

```ts twoslash
const concatName = (user: { first: string; last: string }) => {
  return `${user.first} ${user.last}`;
};
```

现在 TypeScript 知道 `user` 的 `first` 和 `last` 属性都是字符串，并且测试通过了。

#### 解决方案 2：可选属性类型

与我们将函数参数设置为可选类似，我们可以使用 `?` 来指定对象的属性是可选的。

如前一个练习所示，我们可以向函数参数添加问号以使其可选：

```ts twoslash
function concatName(user: { first: string; last?: string }) {
  // 实现
}
```

添加 `?:` 向 TypeScript 表明该属性不必存在。

如果我们将鼠标悬停在函数体内的 `last` 属性上，我们会看到 `last` 属性是 `string | undefined`：

```
// 悬停在 `user.last` 上
(property) last?: string | undefined
```

这意味着它是 `string` 或 `undefined`。这是 TypeScript 的一个有用功能，我们将来会更多地看到它。

## 类型别名 (Type Aliases)

到目前为止，我们一直在内联声明所有类型。对于这些简单的示例来说这没问题，但在实际应用程序中，我们将有很多类型在整个应用程序中重复出现。

这些可能是用户、产品或其他特定于域的类型。我们不希望不得不在每个需要它的文件中重复相同的类型定义。

这就是 `type` 关键字发挥作用的地方。它允许我们一次定义一个类型，并在多个地方使用它。

```ts twoslash
type Animal = {
  name: string;
  type: string;
  age?: number;
};
```

这就是所谓的类型别名。这是一种为类型命名的方法，然后在我们需要使用该类型的任何地方使用该名称。

要创建一个具有 `Animal` 类型的新变量，我们将其作为类型注解添加到变量名之后：

```ts twoslash
type Animal = {
  name: string;
  type: string;
  age?: number;
};

// ---cut---
let pet: Animal = {
  name: "Karma",
  type: "cat",
};
```

我们还可以在函数中使用 `Animal` 类型别名来代替对象类型注解：

```ts twoslash
type Animal = {
  name: string;
  type: string;
  age?: number;
};

// ---cut---
const getAnimalDescription = (animal: Animal) => {
  // 实现
};
```

并使用我们的 `pet` 变量调用该函数：

```ts
const desc = getAnimalDescription(pet);
```

类型别名可以是对象，但它们也可以使用基本类型：

```ts
type Id = string | number;
```

我们稍后会看到这种语法，但它基本上是说一个 `Id` 可以是 `string` 或 `number`。

使用类型别名是确保类型定义具有单一事实来源的好方法，这使得将来更容易进行更改。

### 在模块间共享类型 (Sharing Types Across Modules)

类型别名可以创建在它们自己的 `.ts` 文件中，并导入到你需要它们的文件中。当在多个地方共享类型时，或者当类型定义变得太大时，这很有用：

```ts
// 在 shared-types.ts 中

export type Animal = {
  width: number;
  height: number;
};

// 在 index.ts 中

import { Animal } from "./shared-types";
```

按照惯例，你甚至可以创建自己的 `.types.ts` 文件。这有助于将类型定义与你的其他代码分开。

### 练习

#### 练习 1：`type` 关键字

这是一些在多个地方使用相同类型的代码：

```ts twoslash
const getRectangleArea = (rectangle: { width: number; height: number }) => {
  return rectangle.width * rectangle.height;
};

const getRectanglePerimeter = (rectangle: {
  width: number;
  height: number;
}) => {
  return 2 * (rectangle.width + rectangle.height);
};
```

`getRectangleArea` 和 `getRectanglePerimeter` 函数都接受一个具有 `width` 和 `height` 属性的 `rectangle` 对象。

每个函数的测试都按预期通过：

```ts
it("should return the area of a rectangle", () => {
  const result = getRectangleArea({
    width: 10,
    height: 20,
  });

  type test = Expect<Equal<typeof result, number>>;

  expect(result).toEqual(200);
});

it("should return the perimeter of a rectangle", () => {
  const result = getRectanglePerimeter({
    width: 10,
    height: 20,
  });

  type test = Expect<Equal<typeof result, number>>;

  expect(result).toEqual(60);
});
```

尽管一切都按预期工作，但仍有机会进行重构以清理代码。

你如何使用 `type` 关键字使此代码更具可读性？

<Exercise title="练习 1：`type` 关键字" filePath="/src/015-essential-types-and-annotations/027-type-keyword.problem.ts" resourceId="jUJqrXCHRph0Z4Fs6Ll3za"></Exercise>

#### 解决方案 1：`type` 关键字

你可以使用 `type` 关键字创建一个具有 `width` 和 `height` 属性的 `Rectangle` 类型：

```ts twoslash
type Rectangle = {
  width: number;
  height: number;
};
```

创建类型别名后，我们可以更新 `getRectangleArea` 和 `getRectanglePerimeter` 函数以使用 `Rectangle` 类型：

```ts twoslash
type Rectangle = {
  width: number;
  height: number;
};

// ---cut---
const getRectangleArea = (rectangle: Rectangle) => {
  return rectangle.width * rectangle.height;
};

const getRectanglePerimeter = (rectangle: Rectangle) => {
  return 2 * (rectangle.width + rectangle.height);
};
```

这使得代码更加简洁，并为我们提供了 `Rectangle` 类型的单一事实来源。

## 数组和元组 (Arrays and Tuples)

### 数组 (Arrays)

你还可以在 TypeScript 中描述数组的类型。有两种不同的语法可以做到这一点。

第一种选择是方括号语法。这种语法与我们目前为止所做的类型注解类似，但在末尾添加了两个方括号以指示数组。

```ts twoslash
let albums: string[] = [
  "Rubber Soul",
  "Revolver",
  "Sgt. Pepper's Lonely Hearts Club Band",
];

let dates: number[] = [1965, 1966, 1967];
```

第二种选择是显式使用 `Array` 类型，并在尖括号中包含数组将保存的数据类型：

```ts twoslash
let albums: Array<string> = [
  "Rubber Soul",
  "Revolver",
  "Sgt. Pepper's Lonely Hearts Club Band",
];
```

这两种语法是等效的，但在创建数组时，方括号语法更简洁一些。这也是 TypeScript 显示错误消息的方式。不过，请记住尖括号语法——我们稍后会看到更多它的示例。

#### 对象数组 (Arrays Of Objects)

指定数组类型时，可以使用任何内置类型、内联类型或类型别名：

```ts twoslash
type Album = {
  artist: string;
  title: string;
  year: number;
};

let selectedDiscography: Album[] = [
  {
    artist: "The Beatles",
    title: "Rubber Soul",
    year: 1965,
  },
  {
    artist: "The Beatles",
    title: "Revolver",
    year: 1966,
  },
];
```

如果你尝试使用与类型不匹配的项更新数组，TypeScript 会给出错误：

```ts twoslash
// @errors: 2353
type Album = {
  artist: string;
  title: string;
  year: number;
};

let selectedDiscography: Album[] = [
  {
    artist: "The Beatles",
    title: "Rubber Soul",
    year: 1965,
  },
  {
    artist: "The Beatles",
    title: "Revolver",
    year: 1966,
  },
];

// ---cut---
selectedDiscography.push({ name: "Karma", type: "cat" });
```

### 元组 (Tuples)

元组允许你指定具有固定数量元素的数组，其中每个元素都有其自己的类型。

创建元组类似于数组的方括号语法——只是方括号包含类型，而不是紧邻变量名：

```ts twoslash
// 元组
let album: [string, number] = ["Rubber Soul", 1965];

// 数组
let albums: string[] = [
  "Rubber Soul",
  "Revolver",
  "Sgt. Pepper's Lonely Hearts Club Band",
];
```

元组对于将相关信息组合在一起非常有用，而无需创建新类型。

例如，如果我们想将专辑与其播放次数分组，我们可以这样做：

```ts twoslash
type Album = {
  artist: string;
  title: string;
  year: number;
};

// ---cut---
let albumWithPlayCount: [Album, number] = [
  {
    artist: "The Beatles",
    title: "Revolver",
    year: 1965,
  },
  10000,
];
```

#### 命名元组 (Named Tuples)

为了给元组增加清晰度，可以在方括号内为每种类型添加名称：

```ts twoslash
type Album = {
  artist: string;
  title: string;
  year: number;
};

// ---cut---
type MyTuple = [album: Album, playCount: number];
```

当元组包含许多元素时，或者当你想使代码更具可读性时，这会很有帮助。

### 练习

#### 练习 1：数组类型

考虑以下购物车代码：

```ts twoslash
// @errors: 2353
type ShoppingCart = {
  userId: string;
};

const processCart = (cart: ShoppingCart) => {
  // 在这里处理购物车
};

processCart({
  userId: "user123",
  items: ["item1", "item2", "item3"],
});
```

我们有一个 `ShoppingCart` 的类型别名，它当前有一个类型为 `string` 的 `userId` 属性。

`processCart` 函数接受一个类型为 `ShoppingCart` 的 `cart` 参数。此时其实现并不重要。

重要的是，当我们调用 `processCart` 时，我们传递的是一个包含 `userId` 和一个字符串数组 `items` 属性的对象。

在 `items` 下方有一个错误，内容如下：

```
Argument of type '{ userId: string; items: string[]; }' is not assignable to parameter of type 'ShoppingCart'.

Object literal may only specify known properties, and 'items' does not exist in type 'ShoppingCart'.
```

正如错误消息指出的那样，`ShoppingCart` 类型当前没有名为 `items` 的属性。

你将如何修复此错误？

<Exercise title="练习 1：数组类型" filePath="/src/015-essential-types-and-annotations/028-arrays.problem.ts" resourceId="jUJqrXCHRph0Z4Fs6Ll3za"></Exercise>

#### 练习 2：对象数组

考虑这个 `processRecipe` 函数，它接受一个 `Recipe` 类型：

```ts twoslash
// @errors: 2353
type Recipe = {
  title: string;
  instructions: string;
};

const processRecipe = (recipe: Recipe) => {
  // 在这里处理食谱
};

processRecipe({
  title: "Chocolate Chip Cookies",
  ingredients: [
    { name: "Flour", quantity: "2 cups" },
    { name: "Sugar", quantity: "1 cup" },
  ],
  instructions: "...",
});
```

该函数使用包含 `title`、`instructions` 和 `ingredients` 属性的对象进行调用，但由于 `Recipe` 类型当前没有 `ingredients` 属性，因此存在错误：

```
Argument of type '{title: string; ingredients: { name: string; quantity: string; }[]; instructions: string; }' is not assignable to parameter of type 'Recipe'.

Object literal may only specify known properties, and 'ingredients' does not exist in type 'Recipe'.
```

结合你所看到的键入对象属性和处理数组的知识，你将如何为 `Recipe` 类型指定 `ingredients`？

<Exercise title="练习 2：对象数组" filePath="/src/015-essential-types-and-annotations/029-arrays-of-objects.problem.ts" resourceId="YgFRxBViy44CfW0H2dToDx"></Exercise>

#### 练习 3：元组

这里我们有一个 `setRange` 函数，它接受一个数字数组：

```ts twoslash
// @errors: 2344
import { Expect, Equal } from "@total-typescript/helpers";

// @noUncheckedIndexedAccess: true

// ---cut---
const setRange = (range: Array<number>) => {
  const x = range[0];
  const y = range[1];

  // 在这里处理 x 和 y
  // x 和 y 都应该是数字！

  type tests = [
    Expect<Equal<typeof x, number>>,
    Expect<Equal<typeof y, number>>
  ];
};
```

在函数内部，我们获取数组的第一个元素并将其赋给 `x`，获取数组的第二个元素并将其赋给 `y`。

`setRange` 函数内部有两个测试当前失败。

使用 `// @ts-expect-error` 指令，我们发现还有一些错误需要修复。回想一下，此指令告诉 TypeScript 我们知道下一行会出现错误，因此忽略它。但是，如果我们说我们期望一个错误但实际上没有错误，我们将在实际的 `//@ts-expect-error` 行上看到红色波浪线。

```ts twoslash
// @errors: 2578
import { Expect, Equal } from "@total-typescript/helpers";

// @noUncheckedIndexedAccess: true

// ---cut---
const setRange = (range: Array<number>) => {
  const x = range[0];
  const y = range[1];
};

// ---cut---
// @ts-expect-error 参数太少
setRange([0]);

// @ts-expect-error 参数太多
setRange([0, 10, 20]);
```

`setRange` 函数的代码需要更新类型注解，以指定它只接受包含两个数字的元组。

<Exercise title="练习 3：元组" filePath="/src/015-essential-types-and-annotations/031-tuples.problem.ts" resourceId="YgFRxBViy44CfW0H2dTomV"></Exercise>

#### 练习 4：元组的可选成员

这个 `goToLocation` 函数接受一个坐标数组。每个坐标都有 `latitude` 和 `longitude`，它们都是数字，还有一个可选的 `elevation`，它也是一个数字：

```ts twoslash
// @errors: 2344
import { Expect, Equal } from "@total-typescript/helpers";

// ---cut---
const goToLocation = (coordinates: Array<number>) => {
  const latitude = coordinates[0];
  const longitude = coordinates[1];
  const elevation = coordinates[2];

  // 在这里处理 latitude、longitude 和 elevation

  type tests = [
    Expect<Equal<typeof latitude, number>>,
    Expect<Equal<typeof longitude, number>>,
    Expect<Equal<typeof elevation, number | undefined>>
  ];
};
```

你的挑战是更新 `coordinates` 参数的类型注解，以指定它应该是一个包含三个数字的元组，其中第三个数字是可选的。

<Exercise title="练习 4：元组的可选成员" filePath="/src/015-essential-types-and-annotations/032-optional-members-of-tuples.problem.ts" resourceId="jUJqrXCHRph0Z4Fs6Ll7aP"></Exercise>

#### 解决方案 1：数组类型

对于 `ShoppingCart` 示例，使用方括号语法定义 `item` 字符串数组如下所示：

```ts twoslash
type ShoppingCart = {
  userId: string;
  items: string[];
};
```

有了这个之后，我们必须将 `items` 作为数组传入。单个字符串或其他类型将导致类型错误。

另一种语法是显式编写 `Array` 并在尖括号内传递类型：

```ts twoslash
type ShoppingCart = {
  userId: string;
  items: Array<string>;
};
```

#### 解决方案 2：对象数组

有几种不同的方法来表示对象数组。

一种方法是创建一个新的 `Ingredient` 类型，我们可以用它来表示数组中的对象：

```ts twoslash
type Ingredient = {
  name: string;
  quantity: string;
};
```

然后可以更新 `Recipe` 类型以包含类型为 `Ingredient[]` 的 `ingredients` 属性：

```ts twoslash
type Ingredient = {
  name: string;
  quantity: string;
};

// ---cut---
type Recipe = {
  title: string;
  instructions: string;
  ingredients: Ingredient[];
};
```

这个解决方案易于阅读，修复了错误，并有助于创建我们领域模型的思维导图。

如前所述，使用 `Array<Ingredient>` 语法也可以：

```ts
type Recipe = {
  title: string;
  instructions: string;
  ingredients: Array<Ingredient>;
};
```

也可以使用方括号在 `Recipe` 类型上将 `ingredients` 属性指定为内联对象字面量：

```ts
type Recipe = {
  title: string;
  instructions: string;
  ingredients: {
    name: string;
    quantity: string;
  }[];
};
```

或者使用 `Array<>`：

```ts
type Recipe = {
  title: string;
  instructions: string;
  ingredients: Array<{
    name: string;
    quantity: string;
  }>;
};
```

内联方法很有用，但我更喜欢将它们提取到一个新类型中。这意味着如果应用程序的其他部分需要使用 `Ingredient` 类型，它可以这样做。

#### 解决方案 3：元组

在这种情况下，我们将更新 `setRange` 函数以使用元组语法而不是数组语法：

```ts
const setRange = (range: [number, number]) => {
  // 函数体的其余部分
};
```

如果你想给元组增加清晰度，可以为每种类型添加名称：

```ts
const setRange = (range: [x: number, y: number]) => {
  // 函数体的其余部分
};
```

#### 解决方案 4：元组的可选成员

一个好的开始是将 `coordinates` 参数更改为 `[number, number, number | undefined]` 的元组：

```tsx
const goToLocation = (coordinates: [number, number, number | undefined]) => {};
```

这里的问题是，虽然元组的第三个成员可以是数字或 `undefined`，但函数仍然期望传入某些内容。手动传入 `undefined` 并不是一个好的解决方案。

结合使用命名元组和可选运算符 `?` 是一个更好的解决方案：

```tsx
const goToLocation = (
  coordinates: [latitude: number, longitude: number, elevation?: number]
) => {};
```

值很清晰，并且使用 `?` 运算符指定 `elevation` 是一个可选的数字。它几乎看起来像一个对象，但它仍然是一个元组。

或者，如果你不想使用命名元组，可以在定义后使用 `?` 运算符：

```tsx
const goToLocation = (coordinates: [number, number, number?]) => {};
```

## 将类型传递给函数 (Passing Types To Functions)

让我们快速回顾一下我们之前看到的 `Array` 类型。

```ts
Array<string>;
```

此类型描述一个字符串数组。为此，我们将一个类型 (`string`) 作为参数传递给另一个类型 (`Array`)。

还有许多其他类型可以接收类型，例如 `Promise<string>`、`Record<string, string>` 等。在它们中的每一个中，我们都使用尖括号将一个类型传递给另一个类型。

但是我们也可以使用该语法将类型传递给函数。

### 将类型传递给 `Set` (Passing Types To `Set`)

`Set` 是一个 JavaScript 特性，表示唯一值的集合。

要创建 `Set`，请使用 `new` 关键字并调用 `Set`：

```ts twoslash
const formats = new Set();
//    ^?
```

如果我们将鼠标悬停在 `formats` 变量上，我们可以看到它的类型是 `Set<unknown>`。

这是因为 `Set` 不知道它应该是什么类型！我们没有给它传递任何值，所以它默认为 `unknown` 类型。

让 TypeScript 知道我们希望 `Set` 保存什么类型的一种方法是传入一些初始值：

```ts twoslash
const formats = new Set(["CD", "DVD"]);
//    ^?
```

在这种情况下，由于我们在创建 `Set` 时指定了两个字符串，因此 TypeScript 知道 `formats` 是一个字符串的 `Set`。

但并非总是如此，我们创建 `Set` 时就知道要传递给它的确切值。我们可能希望创建一个空的 `Set`，我们知道它稍后会保存字符串。

为此，我们可以使用尖括号语法将类型传递给 `Set`：

```ts
const formats = new Set<string>();
```

现在，`formats` 理解它是一个字符串集合，添加除字符串以外的任何内容都会失败：

```ts twoslash
// @errors: 2345
const formats = new Set<string>();

// ---cut---
formats.add("Digital");

formats.add(8);
```

这是 TypeScript 中一个非常重要的理解点。你可以将类型以及值传递给函数。

### 并非所有函数都能接收类型 (Not All Functions Can Receive Types)

TypeScript 中的大多数函数*不能*接收类型。

例如，让我们看看来自 DOM 类型定义的 `document.getElementById`。

一个常见的你可能希望传递类型的示例是调用 `document.getElementById`。这里我们尝试获取一个音频元素：

```ts twoslash
const audioElement = document.getElementById("player");
```

我们知道 `audioElement` 将是一个 `HTMLAudioElement`，所以看起来我们应该能够将它传递给 `document.getElementById`：

```ts twoslash
// @errors: 2558
const audioElement = document.getElementById<HTMLAudioElement>("player");
```

但不幸的是，我们不能。我们得到一个错误，指出 `.getElementById` 期望零个类型参数。

我们可以通过将鼠标悬停在其上来查看函数是否可以接收类型参数。让我们尝试悬停 `.getElementById`：

```ts
// 悬停在 .getElementById 上显示：
(method) Document.getElementById(elementId: string): HTMLElement | null
```

请注意，`.getElementById` 的悬停信息中不包含尖括号 (`<>`)，这就是为什么我们不能向其传递类型。

让我们将其与一个*可以*接收类型参数的函数进行对比，例如 `document.querySelector`：

```ts
const audioElement = document.querySelector("#player");

// 悬停在 .querySelector 上显示：
(method) ParentNode.querySelector<Element>(selectors: string): Element | null
```

此类型定义向我们显示 `.querySelector` 在圆括号之前有一些尖括号。尖括号内是它们的默认值——在本例中为 `Element`。

因此，要修复上面的代码，我们可以将 `.getElementById` 替换为 `.querySelector` 并使用 `#player` 选择器来查找音频元素：

```ts
const audioElement = document.querySelector<HTMLAudioElement>("#player");
```

一切正常。

因此，要判断函数是否可以接收类型参数，请悬停在其上并检查它是否具有任何尖括号。

### 练习

#### 练习 1：将类型传递给 Map

这里我们正在创建一个 `Map`，这是一个表示字典的 JavaScript 特性。

在这种情况下，我们希望键传入一个数字，值传入一个对象：

```ts twoslash
// @errors: 2578
const userMap = new Map();

userMap.set(1, { name: "Max", age: 30 });

userMap.set(2, { name: "Manuel", age: 31 });

// @ts-expect-error
userMap.set("3", { name: "Anna", age: 29 });

// @ts-expect-error
userMap.set(3, "123");
```

`@ts-expect-error` 指令上有红线，因为当前 `Map` 中允许任何类型的键和值。

```ts
// 悬停在 Map 上显示：
var Map: MapConstructor

new () => Map<any, any> (+3 overloads)
```

我们如何键入 `userMap` 以便键必须是数字，并且值是具有 `name` 和 `age` 属性的对象？

<Exercise title="练习 1：将类型传递给 Map" filePath="/src/015-essential-types-and-annotations/036-pass-types-to-map.problem.ts" resourceId="YgFRxBViy44CfW0H2dTq1H"></Exercise>

#### 练习 2：`JSON.parse()` 无法接收类型参数

考虑以下代码，它使用 `JSON.parse` 来解析一些 JSON：

```ts twoslash
// @errors: 2558
const parsedData = JSON.parse<{
  name: string;
  age: number;
}>('{"name": "Alice", "age": 30}');
```

当前 `JSON.parse` 的类型参数下方存在错误。

检查 `parsedData` 类型的测试当前失败，因为它的类型是 `any` 而不是预期的类型：

```ts twoslash
// @errors: 2344
import { Expect, Equal } from "@total-typescript/helpers";

declare const parsedData: any;

// ---cut---
type test = Expect<
  Equal<
    typeof parsedData,
    {
      name: string;
      age: number;
    }
  >
>;
```

我们尝试向 `JSON.parse` 函数传递一个类型参数。但在这种情况下，它似乎不起作用。

测试错误告诉我们 `parsedData` 的类型不是我们期望的。属性 `name` 和 `age` 未被识别。

为什么会发生这种情况？有什么不同的方法可以纠正这些类型错误？

<Exercise title="练习 2：`JSON.parse()` 无法接收类型参数" filePath="/src/015-essential-types-and-annotations/037-json-parse-cant-receive-type-arguments.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAfD9"></Exercise>

#### 解决方案 1：将类型传递给 Map

解决此问题有几种不同的方法，但我们将从最直接的方法开始。

首先要做的是创建一个 `User` 类型：

```ts
type User = {
  name: string;
  age: number;
};
```

遵循我们目前为止看到的模式，我们可以将 `number` 和 `User` 作为 `Map` 的类型传递：

```ts
const userMap = new Map<number, User>();
```

没错——有些函数可以接收*多个*类型参数。在这种情况下，`Map` 构造函数可以接收两种类型：一种用于键，一种用于值。

进行此更改后，错误消失了，我们不能再将不正确的类型传入 `userMap.set` 函数。

你也可以内联表示 `User` 类型：

```ts
const userMap = new Map<number, { name: string; age: number }>();
```

#### 解决方案 2：`JSON.parse()` 无法接收类型参数

让我们仔细看看向 `JSON.parse` 传递类型参数时得到的错误消息：

```
Expected 0 type arguments, but got 1.
```

此消息表明 TypeScript 在调用 `JSON.parse` 时不期望尖括号内有任何内容。要解决此错误，我们可以删除尖括号：

```ts
const parsedData = JSON.parse('{"name": "Alice", "age": 30}');
```

现在 `.parse` 接收到正确数量的类型参数，TypeScript 很满意。

然而，我们希望解析的数据具有正确的类型。将鼠标悬停在 `JSON.parse` 上，我们可以看到它的类型定义：

```ts
JSON.parse(text: string, reviver?: ((this: any, key: string, value: any) => any)  undefined): any
```

它总是返回 `any`，这有点问题。

要解决此问题，我们可以为 `parsedData` 提供一个变量类型注解，其中包含 `name: string` 和 `age: number`：

```ts
const parsedData: {
  name: string;
  age: number;
} = JSON.parse('{"name": "Alice", "age": 30}');
```

现在我们将 `parsedData` 键入为我们想要的类型。

之所以这样做有效，是因为 `any` 禁用了类型检查。因此，我们可以为其分配任何我们想要的类型。我们可以给它赋一些没有意义的东西，比如 `number`，TypeScript 也不会抱怨：

```ts
const parsedData: number = JSON.parse('{"name": "Alice", "age": 30}');
```

所以，这更像是"类型信仰"而不是"类型安全"。我们希望 `parsedData` 是我们期望的类型。这依赖于我们保持类型注解与实际数据同步。

## 键入函数 (Typing Functions)

### 可选参数 (Optional Parameters)

对于函数参数是可选的情况，我们可以在 `:` 之前添加 `?` 运算符。

假设我们想向 `logAlbumInfo` 函数添加一个可选的 `releaseDate` 参数。我们可以这样做：

```ts
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean,
  releaseDate?: string
) => {
  // 函数体的其余部分
};
```

现在我们可以调用 `logAlbumInfo` 并包含一个发布日期字符串，或者省略它：

```ts
logAlbumInfo("Midnights", 13, true, "2022-10-21");

logAlbumInfo("American Beauty", 10, true);
```

在 VS Code 中将鼠标悬停在可选的 `releaseDate` 参数上，我们会看到它现在的类型是 `string | undefined`。

我们稍后会更多地讨论 `|` 符号，但这表示该参数可以是 `string` 或 `undefined`。将 `undefined` 作为第二个参数传递是可以接受的，或者可以完全省略它。

### 默认参数 (Default Parameters)

除了将参数标记为可选之外，你还可以使用 `=` 运算符为参数设置默认值。

例如，如果未提供格式，我们可以将 `format` 默认设置为 `"CD"`：

```ts
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean,
  format: string = "CD"
) => {
  // 函数体的其余部分
};
```

`: string` 的注解也可以省略：

```ts
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean,
  format = "CD"
) => {
  // 函数体的其余部分
};
```

因为它可以从提供的值中推断出 `format` 参数的类型。这是类型推断的另一个很好的例子。

### 函数返回类型 (Function Return Types)

除了设置参数类型外，我们还可以设置函数的返回类型。

函数的返回类型可以通过在参数列表的右括号后放置 `:` 和类型来进行注解。对于 `logAlbumInfo` 函数，我们可以指定该函数将返回一个字符串：

```ts
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean
): string => {
  // 函数体的其余部分
};
```

如果从函数返回的值与指定的类型不匹配，TypeScript 将显示错误。

```ts twoslash
// @errors: 2322
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean
): string => {
  return 123;
};
```

当你希望确保函数返回特定类型的值时，返回类型很有用。

###剩余参数 (Rest Parameters)

与 JavaScript 一样，TypeScript 通过对最后一个参数使用 `...` 语法来支持剩余参数。这允许你向函数传递任意数量的参数。

例如，此 `printAlbumFormats` 设置为接受一个 `album` 和任意数量的 `formats`：

```ts
function getAlbumFormats(album: Album, ...formats: string[]) {
  return `${album.title} is available in the following formats: ${formats.join(
    ", "
  )}`;
}
```

使用 `...formats` 语法声明参数并结合字符串数组，使我们可以向函数传递任意数量的字符串：

```ts
getAlbumFormats(
  { artist: "Radiohead", title: "OK Computer", year: 1997 },
  "CD",
  "LP",
  "Cassette"
);
```

甚至可以通过扩展字符串数组来实现：

```ts
const albumFormats = ["CD", "LP", "Cassette"];

getAlbumFormats(
  { artist: "Radiohead", title: "OK Computer", year: 1997 },
  ...albumFormats
);
```

作为替代方案，我们也可以使用 `Array<>` 语法。

```ts
function getAlbumFormats(album: Album, ...formats: Array<string>) {
  // 函数体
}
```

### 函数类型 (Function Types)

我们已经使用类型注解来指定函数参数的类型，但我们也可以使用 TypeScript 来描述函数本身的类型。

我们可以使用以下语法来做到这一点：

```ts
type Mapper = (item: string) => number;
```

这是一个函数类型别名，该函数接受一个 `string` 并返回一个 `number`。

然后我们可以用它来描述传递给另一个函数的回调函数：

```ts
const mapOverItems = (items: string[], map: Mapper) => {
  return items.map(map);
};
```

或者，内联声明它：

```ts
const mapOverItems = (items: string[], map: (item: string) => number) => {
  return items.map(map);
};
```

这使我们可以将一个函数传递给 `mapOverItems`，该函数更改数组中各项的值。

```ts
const arrayOfNumbers = mapOverItems(["1", "2", "3"], (item) => {
  return parseInt(item) * 100;
});
```

函数类型与函数定义一样灵活。你可以声明多个参数、剩余参数和可选参数。

```ts
// 可选参数
type WithOptional = (index?: number) => number;

// 剩余参数
type WithRest = (...rest: string[]) => number;

// 多个参数
type WithMultiple = (first: string, second: string) => number;
```

### `void` 类型

有些函数不返回任何东西。它们执行某种操作，但不产生值。

一个很好的例子是 `console.log`：

```ts
const logResult = console.log("Hello!");
```

你期望 `logResult` 是什么类型？在 JavaScript 中，该值是 `undefined`。如果我们执行 `console.log(logResult)`，我们会在控制台中看到这个。

但是 TypeScript 对这些情况有一种特殊的类型——当函数的返回值应该被故意忽略时。它被称为 `void`。

如果我们将鼠标悬停在 `console.log` 中的 `.log` 上，我们会看到它返回 `void`：

```
(method) Console.log(...data: any[]): void
```

所以，`logResult` 也是 `void`。

这是 TypeScript 表示"忽略此函数调用的结果"的方式。

### 键入异步函数 (Typing Async Functions)

我们已经研究了如何通过返回类型来强类型化函数返回的内容：

```ts
const getUser = (id: string): User => {
  // 函数体
};
```

但是当函数是异步的时呢？

```ts twoslash
// @errors: 1064 2355
type User = {
  id: string;
  name: string;
};
// ---cut---
const getUser = async (id: string): User => {
  // 函数体
};
```

幸运的是，TypeScript 的错误消息在这里很有帮助。它告诉我们异步函数的返回类型必须是 `Promise`。

所以，我们可以将 `User` 传递给 `Promise`：

```ts
const getUser = async (id: string): Promise<User> => {
  const user = await db.users.get(id);

  return user;
};
```

现在，我们的函数必须返回一个解析为 `User` 的 `Promise`。

### 练习

#### 练习 1：可选函数参数

这里我们有一个 `concatName` 函数，其实现接受两个 `string` 参数 `first` 和 `last`。

如果没有传递 `last` 名称，则返回的将只是 `first` 名称。否则，它将返回 `first` 与 `last` 连接的结果：

```ts
const concatName = (first: string, last: string) => {
  if (!last) {
    return first;
  }

  return `${first} ${last}`;
};
```

当使用名字和姓氏调用 `concatName` 时，该函数按预期工作，没有错误：

```ts
const result = concatName("John", "Doe");
```

然而，当仅使用名字调用 `concatName` 时，我们会得到一个错误：

```ts twoslash
// @errors: 2554
const concatName = (first: string, last: string) => {
  if (!last) {
    return first;
  }

  return `${first} ${last}`;
};
// ---cut---
const result2 = concatName("John");
```

尝试使用可选参数注解来修复错误。

<Exercise title="练习 1：可选函数参数" filePath="/src/015-essential-types-and-annotations/023-optional-function-parameters.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAdVv"></Exercise>

#### 练习 2：默认函数参数

这里我们有与之前相同的 `concatName` 函数，其中 `last` 名称是可选的：

```ts twoslash
const concatName = (first: string, last?: string) => {
  if (!last) {
    return first;
  }

  return `${first} ${last}`;
};
```

我们还有几个测试。此测试检查当传递名字和姓氏时函数是否返回全名：

```ts
it("should return the full name", () => {
  const result = concatName("John", "Doe");

  type test = Expect<Equal<typeof result, string>>;

  expect(result).toEqual("John Doe");
});
```

然而，第二个测试期望当仅使用名字作为参数调用 `concatName` 时，函数应使用 `Pocock` 作为默认姓氏：

```ts
it("should return the first name", () => {
  const result = concatName("John");

  type test = Expect<Equal<typeof result, string>>;

  expect(result).toEqual("John Pocock");
});
```

此测试当前失败，`vitest` 的输出表明错误在 `expect` 行：

```
AssertionError: expected 'John' to deeply equal 'John Pocock'

- Expected

+ Received

— John Pocock

+ John

expect(result).toEqual("John Pocock");
```

更新 `concatName` 函数，以便在未提供姓氏时使用 `Pocock` 作为默认姓氏。

<Exercise title="练习 2：默认函数参数" filePath="/src/015-essential-types-and-annotations/024-default-function-parameters.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAdoi"></Exercise>

#### 练习 3：剩余参数

这里我们有一个 `concatenate` 函数，它接受可变数量的字符串：

```ts twoslash
// @errors: 7019
export function concatenate(...strings) {
  return strings.join("");
}
```

测试通过了，但是在 `...strings` 剩余参数上有一个错误。

你将如何更新剩余参数以指定它应该是一个字符串数组？

<Exercise title="练习 3：剩余参数" filePath="/src/015-essential-types-and-annotations/030-rest-parameters.problem.ts" resourceId="jUJqrXCHRph0Z4Fs6Ll6T5"></Exercise>

#### 练习 4：函数类型

在这里，我们有一个 `modifyUser` 函数，它接受一个 `users` 数组、我们要更改的用户的 `id` 以及一个进行更改的 `makeChange` 函数：

```ts twoslash
// @errors: 7006
type User = {
  id: string;
  name: string;
};

const modifyUser = (user: User[], id: string, makeChange) => {
  return user.map((u) => {
    if (u.id === id) {
      return makeChange(u);
    }

    return u;
  });
};
```

当前在 `makeChange` 下方存在错误。

以下是如何调用此函数的示例：

```ts twoslash
// @errors: 7006
type User = {
  id: string;
  name: string;
};

const modifyUser = (user: User[], id: string, makeChange) => {
  return user.map((u) => {
    if (u.id === id) {
      return makeChange(u);
    }

    return u;
  });
};

// ---cut---
const users: User[] = [
  { id: "1", name: "John" },
  { id: "2", name: "Jane" },
];

modifyUser(users, "1", (user) => {
  return { ...user, name: "Waqas" };
});
```

在上面的示例中，错误函数的 `user` 参数也存在"隐式 `any`"错误。

需要更新 `modifyUser` 的 `makeChange` 函数的类型注解。它应该返回一个修改后的用户。例如，我们不应该能够返回一个 `name` 为 `123`，因为在 `User` 类型中，`name` 是一个 `string`：

```ts
modifyUser(
  users,
  "1",
  // @ts-expect-error
  (user) => {
    return { ...user, name: 123 };
  }
);
```

你将如何键入 `makeChange` 使其成为一个接受 `User` 并返回 `User` 的函数？

<Exercise title="练习 4：函数类型" filePath="/src/015-essential-types-and-annotations/033-function-types.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAeqb"></Exercise>

#### 练习 5：返回 `void` 的函数

这里我们探讨一个经典的 Web 开发示例。

我们有一个 `addClickEventListener` 函数，它接受一个侦听器函数并将其添加到文档中：

```ts twoslash
// @errors: 7006
const addClickEventListener = (listener) => {
  document.addEventListener("click", listener);
};

addClickEventListener(() => {
  console.log("Clicked!");
});
```

当前在 `listener` 下方存在错误，因为它没有类型签名。

当我们向 `addClickEventListener` 传递不正确的值时，我们*也*没有收到错误。

```ts twoslash
// @errors: 7006 2578
const addClickEventListener = (listener) => {
  document.addEventListener("click", listener);
};

// ---cut---
addClickEventListener(
  // @ts-expect-error
  "abc"
);
```

这触发了我们的 `@ts-expect-error` 指令。

应该如何键入 `addClickEventListener` 以便解决每个错误？

<Exercise title="练习 5：返回 `void` 的函数" filePath="/src/015-essential-types-and-annotations/034-functions-returning-void.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAf1s"></Exercise>

#### 练习 6：`void` 与 `undefined`

我们有一个接受回调函数并调用它的函数。回调函数不返回任何内容，因此我们将其键入为 `() => undefined`：

```ts
const acceptsCallback = (callback: () => undefined) => {
  callback();
};
```

但是当我们尝试传入 `returnString`（一个*确实*返回某些内容的函数）时，我们会得到一个错误：

```ts twoslash
// @errors: 2345
const acceptsCallback = (callback: () => undefined) => {
  callback();
};

// ---cut---
const returnString = () => {
  return "Hello!";
};

acceptsCallback(returnString);
```

为什么会发生这种情况？我们可以更改 `acceptsCallback` 的类型来修复此错误吗？

<Exercise title="练习 6：`void` 与 `undefined`" filePath="/src/015-essential-types-and-annotations/034.5-void-vs-undefined.problem.ts"></Exercise>

#### 练习 7：键入异步函数

此 `fetchData` 函数等待调用 `fetch` 的 `response`，然后通过调用 `response.json()` 获取 `data`：

```ts
async function fetchData() {
  const response = await fetch("https://api.example.com/data");

  const data = await response.json();

  return data;
}
```

这里有几点值得注意。

将鼠标悬停在 `response` 上，我们可以看到它的类型是 `Response`，这是一个全局可用的类型：

```ts
// 悬停在 response 上
const response: Response;
```

当悬停在 `response.json()` 上时，我们可以看到它返回一个 `Promise<any>`：

```ts
// 悬停在 response.json() 上

const response.json(): Promise<any>
```

如果我们从对 `fetch` 的调用中删除 `await` 关键字，返回类型也将变为 `Promise<any>`：

```ts
const response = fetch("https://api.example.com/data");

// 悬停在 response 上显示

const response: Promise<any>;
```

考虑这个 `example` 及其测试：

```ts twoslash
// @errors: 2344
import { Expect, Equal } from "@total-typescript/helpers";

async function fetchData() {
  const response = await fetch("https://api.example.com/data");

  const data = await response.json();

  return data;
}

// ---cut---
const example = async () => {
  const data = await fetchData();

  type test = Expect<Equal<typeof data, number>>;
};
```

测试当前失败，因为 `data` 的类型是 `any` 而不是 `number`。

我们如何在不更改对 `fetch` 或 `response.json()` 的调用的情况下将 `data` 键入为数字？

这里有两种可能的解决方案。

<Exercise title="练习 7：键入异步函数" filePath="/src/015-essential-types-and-annotations/038-type-async-functions.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAfhD"></Exercise>

#### 解决方案 1：可选函数参数

通过在参数末尾添加问号 `?`，它将被标记为可选：

```ts
function concatName(first: string, last?: string) {
  // ...实现
}
```

#### 解决方案 2：默认函数参数

要在 TypeScript 中添加默认参数，我们将使用 JavaScript 中也使用的 `=` 语法。

在这种情况，如果未提供值，我们将更新 `last` 以默认为"Pocock"：

```ts twoslash
// @errors: 1015
export const concatName = (first: string, last?: string = "Pocock") => {
  return `${first} ${last}`;
};
```

虽然这通过了我们的运行时测试，但它实际上在 TypeScript 中失败了。

这是因为 TypeScript 不允许我们同时拥有可选参数和默认值。默认值已经暗示了可选性。

要修复此错误，我们可以从 `last` 参数中删除问号：

```ts
export const concatName = (first: string, last = "Pocock") => {
  return `${first} ${last}`;
};
```

#### 解决方案 3：剩余参数

使用剩余参数时，传递给函数的所有参数都将收集到一个数组中。这意味着 `strings` 参数可以键入为字符串数组：

```ts
export function concatenate(...strings: string[]) {
  return strings.join("");
}
```

或者，当然，使用 `Array<>` 语法：

```ts
export function concatenate(...strings: Array<string>) {
  return strings.join("");
}
```

#### 解决方案 4：函数类型

让我们首先将 `makeChange` 参数注解为一个函数。现在，我们将其指定为返回 `any`：

```ts twoslash
// @errors: 2554
type User = {
  id: string;
  name: string;
};

// ---cut---
const modifyUser = (user: User[], id: string, makeChange: () => any) => {
  return user.map((u) => {
    if (u.id === id) {
      return makeChange(u);
    }

    return u;
  });
};
```

进行此首次更改后，当调用 `makeChange` 时，我们在 `u` 下方收到一个错误，因为我们说 `makeChange` 不接受任何参数。

这告诉我们需要向 `makeChange` 函数类型添加一个参数。

在这种情况下，我们将指定 `user` 的类型为 `User`。

```ts
const modifyUser = (
  user: User[],
  id: string,
  makeChange: (user: User) => any
) => {
  // 函数体
};
```

这很不错，但我们还需要确保我们的 `makeChange` 函数返回一个 `User`：

```ts
const modifyUser = (
  user: User[],
  id: string,
  makeChange: (user: User) => User
) => {
  // 函数体
};
```

现在错误已解决，并且在编写 `makeChange` 函数时，我们拥有了 `User` 属性的自动完成功能。

或者，我们可以通过为 `makeChange` 函数类型创建一个类型别名来稍微清理一下代码：

```ts
type MakeChangeFunc = (user: User) => User;

const modifyUser = (user: User[], id: string, makeChange: MakeChangeFunc) => {
  // 函数体
};
```

两种技术的行为相同，但是如果你需要重用 `makeChange` 函数类型，则类型别名是可行的方法。

#### 解决方案 5：返回 `void` 的函数

让我们首先将 `listener` 参数注解为一个函数。现在，我们将其指定为返回一个字符串：

```ts
const addClickEventListener = (listener: () => string) => {
  document.addEventListener("click", listener);
};
```

问题是，当我们使用不返回任何内容的函数调用 `addClickEventListener` 时，现在会出现错误：

```ts twoslash
// @errors: 2345
const addClickEventListener = (listener: () => string) => {
  document.addEventListener("click", listener);
};

// ---cut---
addClickEventListener(() => {
  console.log("Clicked!");
});
```

错误消息告诉我们 `listener` 函数返回 `void`，它不能赋给 `string`。

这表明我们不应该将 `listener` 参数键入为返回字符串的函数，而应将其键入为返回 `void` 的函数：

```ts
const addClickEventListener = (listener: () => void) => {
  document.addEventListener("click", listener);
};
```

这是告诉 TypeScript 我们不关心 `listener` 函数返回值的好方法。

#### 解决方案 6：`void` 与 `undefined`

解决方案是将 `callback` 的类型更改为 `() => void`：

```ts
const acceptsCallback = (callback: () => void) => {
  callback();
};
```

现在我们可以毫无问题地传入 `returnString`。这是因为 `returnString` 返回一个 `string`，而 `void` 告诉 TypeScript 在比较它们时忽略返回值。

因此，如果你真的不关心函数的结果，则应将其键入为 `() => void`。

#### 解决方案 7：键入异步函数

你可能会想尝试向 `fetch` 传递一个类型参数，类似于你对 `Map` 或 `Set` 所做的那样。

然而，将鼠标悬停在 `fetch` 上，我们可以看到它不接受类型参数：

```ts
// @noErrors
const response = fetch<number>("https://api.example.com/data");
//               ^?
```

我们也不能向 `response.json()` 添加类型注解，因为它也不接受类型参数：

```ts twoslash
// @errors: 2558
const response = await fetch("https://api.example.com/data");

// ---cut---
const data: number = await response.json<number>();
```

一种可行的方法是指定 `data` 是一个 `number`：

```ts
const response = await fetch("https://api.example.com/data");

// ---cut---
const data: number = await response.json();
```

这样做有效是因为 `data` 以前是 `any`，而 `await response.json()` 返回 `any`。所以现在我们将 `any` 放入一个需要 `number` 的位置。

然而，解决此问题的最佳方法是向函数添加返回类型。在这种情况下，它应该是一个 `number`：

```ts twoslash
// @errors: 1064
async function fetchData(): number {
  // 函数体

  return 123;
}
```

现在 `data` 被键入为 `number`，只是我们的返回类型注解下方有一个错误。

所以，我们应该将返回类型更改为 `Promise<number>`：

```ts twoslash
async function fetchData(): Promise<number> {
  const response = await fetch("https://api.example.com/data");

  const data = await response.json();

  return data;
}
```

通过将 `number` 包装在 `Promise<>` 中，我们确保在确定类型之前等待 `data`。
