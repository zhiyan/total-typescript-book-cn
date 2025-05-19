人们通常认为 TypeScript 有两个复杂性级别。

一方面，你有库开发。在这里，你会利用 TypeScript 中许多最深奥和强大的特性。你需要条件类型、映射类型、泛型等等，来创建一个足够灵活以适应各种场景的库。

另一方面，你有应用开发。在这里，你主要关心的是确保你的代码是类型安全的。你希望确保你的类型能反映你应用程序中发生的情况。任何复杂的类型都存放在你使用的库中。你需要熟悉 TypeScript，但不太需要使用其高级特性。

这是大多数 TypeScript 社区使用的经验法则。“它对于应用程序代码来说太复杂了”。“你只在库中需要它”。但是，还有一个经常被忽视的第三个级别：`/utils` 文件夹。

如果你的应用程序变得足够大，你会开始将常见的模式捕获到一组可重用的函数中。这些函数，如 `groupBy`、`debounce` 和 `retry`，可能会在一个大型应用程序中被使用数百次。它们就像你应用程序范围内的迷你库。

理解如何构建这些类型的函数可以为你的团队节省大量时间。捕获常见模式意味着你的代码变得更易于维护，构建速度也更快。

在本章中，我们将介绍如何构建这些函数。我们将从泛型函数开始，然后转向类型谓词、断言函数和函数重载。

## 泛型函数 (Generic Functions)

我们已经看到，在 TypeScript 中，函数不仅可以接收值作为参数，还可以接收类型。在这里，我们向 `new Set()` 传递一个*值*和一个*类型*：

```typescript
const set = new Set<number>([1, 2, 3]);
//                 ^^^^^^^^ ^^^^^^^^^
//                 type     value
```

我们在尖括号中传递类型，在圆括号中传递值。这是因为 `new Set()` 是一个泛型函数。一个不能接收类型的函数是常规函数，比如 `JSON.parse`：

```ts twoslash
// @errors: 2558
const obj = JSON.parse<{ hello: string }>('{"hello": "world"}');
```

在这里，TypeScript 告诉我们 `JSON.parse` 不接受类型参数，因为它不是泛型的。

### 是什么让函数成为泛型函数？

如果一个函数声明了一个类型参数，那么它就是泛型函数。这是一个带有类型参数 `T` 的泛型函数：

```typescript
function identity<T>(arg: T): T {
  //                 ^^^ 类型参数
  return arg;
}
```

我们可以使用 `function` 关键字，或者使用箭头函数语法：

```typescript
const identity = <T>(arg: T): T => arg;
```

我们甚至可以将泛型函数声明为一个类型：

```typescript
type Identity = <T>(arg: T) => T;

const identity: Identity = (arg) => arg;
```

现在，我们可以向 `identity` 传递一个类型参数：

```typescript
identity<number>(42);
```

#### 泛型函数类型别名 vs 泛型类型 (Generic Function Type Alias vs Generic Type)

非常重要的一点是，不要将泛型类型的语法与泛型函数的类型别名的语法混淆。对于未经训练的人来说，它们看起来非常相似。区别如下：

```typescript
// 泛型函数的类型别名
type Identity = <T>(arg: T) => T;
//              ^^^
//              类型参数属于函数

// 泛型类型
type Identity<T> = (arg: T) => T;
//           ^^^
//           类型参数属于类型
```

关键在于类型参数的位置。如果它附加在类型名称上，那么它是一个泛型类型。如果它附加在函数的圆括号上，那么它是一个泛型函数的类型别名。

### 当我们不传入类型参数时会发生什么？

当我们研究泛型类型时，我们看到 TypeScript *要求*你在使用泛型类型时传入所有类型参数：

```ts twoslash
// @errors: 2314
type StringArray = Array<string>;

type AnyArray = Array;
```

这对于泛型函数来说并非如此。如果你不向泛型函数传递类型参数，TypeScript 不会报错：

```typescript
function identity<T>(arg: T): T {
  return arg;
}

const result = identity(42); // 没有错误！
```

为什么会这样呢？嗯，这是泛型函数的一个特性，也使它们成为我最喜欢的 TypeScript 工具。如果你不传递类型参数，TypeScript 会尝试从函数的运行时参数中*推断*它。

我们上面的 `identity` 函数只是接收一个参数并返回它。我们已经在运行时参数中引用了类型参数：`arg: T`。这意味着如果我们不传入类型参数，`T` 将从 `arg` 的类型中推断出来。

所以，`result` 的类型将是 `42`：

```ts twoslash
function identity<T>(arg: T): T {
  return arg;
}
// ---cut---
const result = identity(42);
//    ^?
```

这意味着每次调用该函数时，它都可能返回不同的类型：

```ts twoslash
function identity<T>(arg: T): T {
  return arg;
}
// ---cut---
const result1 = identity("hello");
//    ^?

const result2 = identity({ hello: "world" });
//    ^?

const result3 = identity([1, 2, 3]);
//    ^?
```

这种能力意味着你的函数可以理解它们正在处理的类型，并相应地调整它们的建议和错误。这是 TypeScript 最强大和最灵活的地方。

### 指定类型优于推断类型

让我们回到指定类型参数而不是推断它们。如果你传递的类型参数与运行时参数冲突会发生什么？

让我们用我们的 `identity` 函数试试：

```ts twoslash
// @errors: 2345
function identity<T>(arg: T): T {
  return arg;
}
// ---cut---
const result = identity<string>(42);
```

在这里，TypeScript 告诉我们 `42` 不是一个 `string`。这是因为我们明确告诉 TypeScript `T` 应该是一个 `string`，这与运行时参数冲突。

传递类型参数是给 TypeScript 的一个指令，用以覆盖推断。如果你传入一个类型参数，TypeScript 会将其用作事实的来源。如果你不传入，TypeScript 会将运行时参数的类型用作事实的来源。

### 没有所谓的“一个泛型”

这里简单说明一下术语。TypeScript 的“泛型”以难以理解著称。我认为这很大程度上取决于人们如何使用“泛型”这个词。

很多人认为“泛型”是 TypeScript 的一部分。他们把它看作一个名词。如果你问别人“这段代码中的‘泛型’在哪里？”：

```typescript
const identity = <T>(arg: T) => arg;
```

他们可能会指向 `<T>`。其他人可能会将下面的代码描述为“向 `Set` 传递一个‘泛型’”：

```typescript
const set = new Set<number>([1, 2, 3]);
```

这种术语非常令人困惑。相反，我更喜欢将它们分成不同的术语：

- 类型参数 (Type Parameter)：`identity<T>` 中的 `<T>`。
- 类型参数 (Type Argument)：传递给 `Set<number>` 的 `number`。
- 泛型类/函数/类型 (Generic Class/Function/Type)：声明了类型参数的类、函数或类型。

当你将泛型分解成这些术语时，理解起来就容易多了。

### 泛型函数解决的问题

让我们把学到的知识付诸实践。

考虑这个名为 `getFirstElement` 的函数，它接受一个数组并返回第一个元素：

```typescript
const getFirstElement = (arr: any[]) => {
  return arr[0];
};
```

这个函数很危险。因为它接受一个 `any` 类型的数组，这意味着我们从 `getFirstElement` 中得到的东西也是 `any`：

```ts twoslash
const getFirstElement = (arr: any[]) => {
  return arr[0];
};

// ---cut---
const first = getFirstElement([1, 2, 3]);
//    ^?
```

正如我们所见，`any` 会在你的代码中造成混乱。任何使用这个函数的人都会在不知不觉中放弃 TypeScript 的类型安全。那么，我们该如何解决这个问题呢？

我们需要 TypeScript 理解我们传入的数组的类型，并用它来类型化返回的内容。我们需要让 `getFirstElement` 成为泛型：

为此，我们将在函数的参数列表前添加一个类型参数 `TMember`，然后使用 `TMember[]` 作为数组的类型：

```typescript
const getFirstElement = <TMember>(arr: TMember[]) => {
  return arr[0];
};
```

就像泛型函数一样，通常用 `T` 作为类型参数的前缀，以区别于普通类型。

现在，当我们调用 `getFirstElement` 时，TypeScript 会根据我们传入的参数推断出 `` 的类型：

```ts twoslash
const getFirstElement = <TMember>(arr: TMember[]) => {
  return arr[0];
};
// ---cut---
const firstNumber = getFirstElement([1, 2, 3]);
//    ^?
const firstString = getFirstElement(["a", "b", "c"]);
//    ^?
```

现在，我们已经使 `getFirstElement` 类型安全了。我们传入的数组的类型就是我们得到的元素的类型。

### 调试泛型函数的推断类型

当你使用泛型函数时，可能很难知道 TypeScript 推断出了什么类型。然而，通过仔细地悬停鼠标，你可以找到答案。

当我们调用 `getFirstElement` 函数时，我们可以将鼠标悬停在函数名上，看看 TypeScript 推断出了什么：

```ts twoslash
const getFirstElement = <TMember>(arr: TMember[]) => {
  return arr[0];
};
// ---cut---
const first = getFirstElement([1, 2, 3]);
//            ^?
```

我们可以看到，在尖括号内，TypeScript 推断出 `TMember` 是 `number`，因为我们传入了一个数字数组。

当你有更复杂的函数和多个类型参数需要调试时，这会非常有用。我经常发现自己会在同一个文件中创建临时的函数调用，以查看 TypeScript 推断出了什么。

### 类型参数默认值 (Type Parameter Defaults)

就像泛型类型一样，你可以在泛型函数中为类型参数设置默认值。当函数的运行时参数是可选的时，这可能很有用：

```typescript
const createSet = <T = string>(arr?: T[]) => {
  return new Set(arr);
};
```

在这里，我们将 `T` 的默认类型设置为 `string`。这意味着如果我们不传入类型参数，TypeScript 会假定 `T` 是 `string`：

```ts twoslash
const createSet = <T = string>(arr?: T[]) => {
  return new Set(arr);
};
// ---cut---
const defaultSet = createSet();
//    ^?
```

默认值不会对 `T` 的类型施加约束。这意味着我们仍然可以传入任何我们想要的类型：

```ts twoslash
const createSet = <T = string>(arr?: T[]) => {
  return new Set(arr);
};
// ---cut---
const numberSet = createSet<number>([1, 2, 3]);
//    ^?
```

如果我们不指定默认值，并且 TypeScript 无法从运行时参数推断类型，它将默认为 `unknown`：

```ts twoslash
const createSet = <T>(arr?: T[]) => {
  return new Set(arr);
};

const unknownSet = createSet();
//    ^?
```

在这里，我们移除了 `T` 的默认类型，TypeScript 默认将其设为 `unknown`。

### 约束类型参数 (Constraining Type Parameters)

你还可以在泛型函数中为类型参数添加约束。当你希望确保一个类型具有某些属性时，这可能很有用。

让我们想象一个 `removeId` 函数，它接受一个对象并移除 `id` 属性：

```ts twoslash
// @errors: 2339
const removeId = <TObj>(obj: TObj) => {
  const { id, ...rest } = obj;
  return rest;
};
```

我们的 `TObj` 类型参数，在没有约束的情况下使用时，被视为 `unknown`。这意味着 TypeScript 不知道 `id` 是否存在于 `obj` 上。

要解决这个问题，我们可以为 `TObj` 添加一个约束，确保它具有 `id` 属性：

```typescript
const removeId = <TObj extends { id: unknown }>(obj: TObj) => {
  const { id, ...rest } = obj;
  return rest;
};
```

现在，当我们使用 `removeId` 时，如果我们传入的对象没有 `id` 属性，TypeScript 将会报错：

```ts twoslash
// @errors: 2353
const removeId = <TObj extends { id: unknown }>(obj: TObj) => {
  const { id, ...rest } = obj;
  return rest;
};
// ---cut---
const result = removeId({ name: "Alice" });
```

但是如果我们传入一个带有 `id` 属性的对象，TypeScript 会知道 `id` 已经被移除了：

```ts twoslash
const removeId = <TObj extends { id: unknown }>(obj: TObj) => {
  const { id, ...rest } = obj;
  return rest;
};
// ---cut---
const result = removeId({ id: 1, name: "Alice" });
//    ^?
```

注意 TypeScript 在这里是多么聪明。尽管我们没有为 `removeId` 指定返回类型，TypeScript 还是推断出 `result` 是一个具有输入对象所有属性（除了 `id`）的对象。

## 类型谓词 (Type Predicates)

我们早在第 5 章学习类型收窄 (narrowing) 时就接触过类型谓词。它们用于捕获可重用的逻辑，以收窄变量的类型。

例如，假设我们想在尝试访问一个变量的属性或将其传递给需要 `Album` 类型的函数之前，确保该变量是一个 `Album`。

我们可以编写一个 `isAlbum` 函数，它接收一个输入，并检查所有必需的属性。

```typescript
function isAlbum(input: unknown) {
  return (
    typeof input === "object" &&
    input !== null &&
    "id" in input &&
    "title" in input &&
    "artist" in input &&
    "year" in input
  );
}
```

如果我们将鼠标悬停在 `isAlbum` 上，可以看到一个相当难看的类型签名：

```typescript
// 鼠标悬停在 isAlbum 上显示：
function isAlbum(
  input: unknown
): input is object &
  Record<"id", unknown> &
  Record<"title", unknown> &
  Record<"artist", unknown> &
  Record<"year", unknown>;
```

这在技术上是正确的：一个 `object` 和一堆 `Record` 之间的大型交叉类型。但它并没有多大帮助。

当我们尝试使用 `isAlbum` 来收窄一个值的类型时，TypeScript 不会正确地推断它：

```ts twoslash
// @errors: 2339
function isAlbum(input: unknown) {
  return (
    typeof input === "object" &&
    input !== null &&
    "id" in input &&
    "title" in input &&
    "artist" in input &&
    "year" in input
  );
}

// ---cut---
const run = (maybeAlbum: unknown) => {
  if (isAlbum(maybeAlbum)) {
    maybeAlbum.name.toUpperCase();
  }
};
```

为了解决这个问题，我们需要向 `isAlbum` 添加更多的检查，以确保我们正在检查所有属性的类型：

```typescript
function isAlbum(input: unknown) {
  return (
    typeof input === "object" &&
    input !== null &&
    "id" in input &&
    "title" in input &&
    "artist" in input &&
    "year" in input &&
    typeof input.id === "number" &&
    typeof input.title === "string" &&
    typeof input.artist === "string" &&
    typeof input.year === "number"
  );
}
```

但此时，令人沮丧的事情发生了——TypeScript *停止*推断函数的返回值。我们可以通过将鼠标悬停在 `isAlbum` 上看到这一点：

```typescript
// 鼠标悬停在 isAlbum 上显示：
function isAlbum(input: unknown): boolean;
```

这是因为 TypeScript 的类型谓词推断能力有限——它只能处理一定程度的复杂性。

不仅如此，我们的代码现在变得*极其*具有防御性。我们正在检查每个属性的存在性*和*类型。这是大量的样板代码，而且可能没有必要。事实上，这样的代码可能应该封装在一个像 [Zod](https://zod.dev/) 这样的库中。

### 编写你自己的类型谓词

为了解决这个问题，我们可以手动为 `isAlbum` 函数添加一个类型谓词注解：

```typescript
function isAlbum(input: unknown): input is Album {
  return (
    typeof input === "object" &&
    input !== null &&
    "id" in input &&
    "title" in input &&
    "artist" in input &&
    "year" in input
  );
}
```

这个注解告诉 TypeScript，当 `isAlbum` 返回 `true` 时，值的类型已经被收窄为 `Album`。

现在，当我们使用 `isAlbum` 时，TypeScript 会正确地推断它：

```typescript
const run = (maybeAlbum: unknown) => {
  if (isAlbum(maybeAlbum)) {
    maybeAlbum.name.toUpperCase(); // 没有错误！
  }
};
```

这可以确保你从复杂的类型守卫中获得相同的类型行为。

### 类型谓词可能不安全

编写自己的类型谓词可能有点危险。TypeScript 不会跟踪类型谓词的运行时行为是否与类型谓词的类型签名相匹配。

```typescript
function isNumber(input: unknown): input is number {
  return typeof input === "string";
}
```

在这种情况下，TypeScript _认为_ `isNumber` 检查某物是否为数字。但实际上，它检查某物是否为字符串！无法保证函数的运行时行为与类型签名相匹配。

这是使用类型谓词时常见的陷阱——重要的是要将它们视为与 `as` 和 `!` 大致一样不安全。

## 断言函数 (Assertion Functions)

断言函数看起来与类型谓词相似，但它们的用法略有不同。断言函数不是返回一个布尔值来指示一个值是否属于某个特定类型，而是在值不符合预期类型时抛出一个错误。

以下是我们如何将 `isAlbum` 类型谓词改写成 `assertIsItem` 断言函数：

```typescript
function assertIsAlbum(input: unknown): asserts input is Album {
  if (
    typeof input === "object" &&
    input !== null &&
    "id" in input &&
    "title" in input &&
    "artist" in input &&
    "year" in input
  ) {
    throw new Error("Not an Album!");
  }
}
```

`assertIsAlbum` 函数接收一个 `unknown` 类型的 `input`，并使用 `asserts input is Album` 语法断言它是一个 `Album`。

这意味着类型收窄 (narrowing) 更加激进。函数调用本身就足以断言 `input` 是一个 `Album`，而不需要在 `if` 语句中进行检查。

```ts twoslash
type Album = {
  id: number;
  title: string;
  artist: string;
  year: number;
};

function assertIsAlbum(input: unknown): asserts input is Album {
  if (
    !(
      // 注意：这里原逻辑是错误的，如果条件满足则抛出错误，应该是不满足时抛出。
      // 为了匹配原文描述“如果值不符合预期类型时抛出错误”，我将条件反转
      (
        typeof input === "object" &&
        input !== null &&
        "id" in input &&
        "title" in input &&
        "artist" in input &&
        "year" in input
      )
    )
  ) {
    throw new Error("Not an Album!");
  }
}
// ---cut---
function getAlbumTitle(item: unknown) {
  console.log(item);
  //          ^?

  assertIsAlbum(item);

  console.log(item.title);
  //          ^?
}
```

当您想在继续进一步操作之前确保某个值属于特定类型时，断言函数非常有用。

### 断言函数也可能说谎

就像类型谓词一样，断言函数也可能被滥用。如果断言函数不能准确反映正在检查的类型，可能会导致运行时错误。

例如，如果 `assertIsAlbum` 函数没有检查 `Album` 的所有必需属性，可能会导致意外行为：

```typescript
function assertIsAlbum(input: unknown): asserts input is Album {
  if (typeof input === "object") {
    // 译者注：原文这里的逻辑是如果 typeof input === "object" 则抛错，这与断言的目的相反。
    // 断言通常是在条件 *不* 满足时抛错。
    // 为了保持与原文代码一致，此处保留。但实际应用中，应该是 !(...)
    throw new Error("Not an Album!");
  }
}

let item = null;

assertIsAlbum(item); // 译者注：如果按原文代码，这里因为 typeof null === 'object' 会抛错。
// 但如果按断言的通常逻辑（不满足条件时抛错），则不会抛错，后续 item.title 会出错。
// 这里假设原文意图是展示断言不足以捕获所有情况。

item.title;
// ^?
```

在这种情况下，`assertIsAlbum` 函数并没有检查 `Album` 的所有必需属性——它只是检查 `typeof input` 是否为 `"object"`。这意味着我们给自己留下了一个潜在的 `null` 问题。著名的 JavaScript 怪癖 `typeof null === 'object'` 会在我们尝试访问 `title` 属性时导致运行时错误。

## 函数重载 (Function Overloads)

函数重载提供了一种为单个函数实现定义多个函数签名的方法。换句话说，你可以定义调用函数的不同方式，每种方式都有其自己的参数集和返回类型。这是一种有趣的技术，用于创建灵活的 API，可以处理不同的用例，同时保持类型安全。

为了演示函数重载的工作原理，我们将创建一个 `searchMusic` 函数，它允许根据提供的参数以不同方式执行搜索。

### 定义重载 (Defining Overloads)

要定义函数重载，需要用不同的参数和返回类型多次编写相同的函数定义。每个定义称为一个重载签名，并用分号分隔。你还需要每次都使用 `function` 关键字。

对于 `searchMusic` 示例，我们希望允许用户通过提供艺术家、流派和年份进行搜索。但由于历史原因，我们希望他们能够将它们作为单个对象或作为单独的参数传递。

以下是我们如何定义这些函数重载签名。第一个签名接收三个独立的参数，而第二个签名接收一个包含这些属性的单个对象：

```ts twoslash
// @errors: 2391
function searchMusic(artist: string, genre: string, year: number): void;
function searchMusic(criteria: {
  artist: string;
  genre: string;
  year: number;
}): void;
```

但是我们遇到了一个错误。我们已经声明了这个函数应该如何被声明的一些方式，但是我们还没有提供实现。

### 实现签名 (The Implementation Signature)

实现签名是包含函数实际逻辑的实际函数声明。它写在重载签名下方，并且必须与所有定义的重载兼容。

在这种情况下，实现签名将接收一个名为 `queryOrCriteria` 的参数，该参数可以是 `string` 类型，也可以是具有指定属性的对象。在函数内部，我们将检查 `queryOrCriteria` 的类型，并根据提供的参数执行相应的搜索逻辑：

```typescript
function searchMusic(artist: string, genre: string, year: number): void;
function searchMusic(criteria: {
  artist: string;
  genre: string;
  year: number;
}): void;
function searchMusic(
  artistOrCriteria: string | { artist: string; genre: string; year: number },
  genre?: string,
  year?: number
): void {
  if (typeof artistOrCriteria === "string") {
    // 使用独立参数搜索
    search(artistOrCriteria, genre, year);
  } else {
    // 使用对象搜索
    search(
      artistOrCriteria.artist,
      artistOrCriteria.genre,
      artistOrCriteria.year
    );
  }
}
```

现在我们可以使用重载中定义的不同参数来调用 `searchMusic` 函数：

```typescript
searchMusic("King Gizzard and the Lizard Wizard", "Psychedelic Rock", 2021);
searchMusic({
  artist: "Tame Impala",
  genre: "Psychedelic Rock",
  year: 2015,
});
```

然而，如果我们尝试传入与任何已定义重载都不匹配的参数，TypeScript 会发出警告：

```ts twoslash
// @errors: 2575
function searchMusic(artist: string, genre: string, year: number): void;
function searchMusic(criteria: {
  artist: string;
  genre: string;
  year: number;
}): void;
function searchMusic(
  artistOrCriteria: string | { artist: string; genre: string; year: number },
  genre?: string,
  year?: number
): void {}
// ---cut---
searchMusic(
  {
    artist: "Tame Impala",
    genre: "Psychedelic Rock",
    year: 2015,
  },
  "Psychedelic Rock"
);
```

此错误告诉我们，我们试图用两个参数调用 `searchMusic`，但重载只期望一个或三个参数。

### 函数重载 vs 联合类型 (Function Overloads vs Unions)

当你有多个调用签名分布在不同的参数集上时，函数重载会很有用。在上面的例子中，我们可以用一个参数或三个参数来调用函数。

当你拥有相同数量的参数但类型不同时，应该使用联合类型而不是函数重载。例如，如果你想允许用户通过艺术家名称或条件对象进行搜索，你可以使用联合类型：

```typescript
function searchMusic(
  query: string | { artist: string; genre: string; year: number }
): void {
  if (typeof query === "string") {
    // 按艺术家搜索
    searchByArtist(query);
  } else {
    // 按所有条件搜索
    search(query.artist, query.genre, query.year);
  }
}
```

这比定义两个重载和一个实现要少用很多行代码。

## 练习 (Exercises)

### 练习 1：使函数泛型化

这里我们有一个函数 `createStringMap`。这个函数的目的是生成一个 `Map`，其键为字符串，值为作为参数传入的类型：

```typescript
const createStringMap = () => {
  return new Map();
};
```

目前来看，我们得到的是一个 `Map<any, any>`。然而，目标是使这个函数泛型化，以便我们可以传入一个类型参数来定义 `Map` 中值的类型。

例如，如果我们传入 `number` 作为类型参数，函数应该返回一个值为 `number` 类型的 `Map`：

```ts twoslash
// @errors: 2558 2578
const createStringMap = () => {
  return new Map();
};
// ---cut---
const numberMap = createStringMap<number>();

numberMap.set("foo", 123);
```

同样，如果我们传入一个对象类型，函数应该返回一个具有该类型值的 `Map`：

```ts twoslash
// @errors: 2558 2578
const createStringMap = () => {
  return new Map();
};
// ---cut---
const objMap = createStringMap<{ a: number }>();

objMap.set("foo", { a: 123 });

objMap.set(
  "bar",
  // @ts-expect-error
  { b: 123 }
);
```

如果未提供类型，该函数也应默认为 `unknown`：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";
const createStringMap = () => {
  return new Map();
};
// ---cut---
const unknownMap = createStringMap();

type test = Expect<Equal<typeof unknownMap, Map<string, unknown>>>;
```

你的任务是将 `createStringMap` 转换成一个能够接受类型参数来描述 Map 值的泛型函数。确保它对于提供的测试用例能按预期工作。

<Exercise title="练习 1：使函数泛型化" filePath="/src/085-the-utils-folder/215-generic-functions-without-inference.problem.ts"></Exercise>

### 练习 2：默认类型参数

在练习 1 中将 `createStringMap` 函数泛型化后，不带类型参数调用它时，值类型默认为 `unknown`：

```typescript
const stringMap = createStringMap();

// 鼠标悬停在 stringMap 上显示：
const stringMap: Map<string, unknown>;
```

你的目标是为 `createStringMap` 函数添加一个默认类型参数，以便在未提供类型参数时，它默认为 `string`。请注意，你仍然可以通过在调用函数时提供类型参数来覆盖默认类型。

<Exercise title="练习 2：默认类型参数" filePath="/src/085-the-utils-folder/216-type-parameter-defaults-in-generic-functions.problem.ts"></Exercise>

### 练习 3：泛型函数中的推断

考虑这个 `uniqueArray` 函数：

```typescript
const uniqueArray = (arr: any[]) => {
  return Array.from(new Set(arr));
};
```

该函数接受一个数组作为参数，然后将其转换为 `Set`，最后以新数组的形式返回。当你希望数组中的值唯一时，这是一种常见的模式。

虽然此函数在运行时能有效工作，但它缺乏类型安全性。它将传入的任何数组转换为 `any[]`。

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";
import { it, expect } from "vitest";
const uniqueArray = (arr: any[]) => {
  return Array.from(new Set(arr));
};
// ---cut---
it("returns an array of unique values", () => {
  const result = uniqueArray([1, 1, 2, 3, 4, 4, 5]);

  type test = Expect<Equal<typeof result, number[]>>;

  expect(result).toEqual([1, 2, 3, 4, 5]);
});

it("should work on strings", () => {
  const result = uniqueArray(["a", "b", "b", "c", "c", "c"]);

  type test = Expect<Equal<typeof result, string[]>>;

  expect(result).toEqual(["a", "b", "c"]);
});
```

你的任务是通过使 `uniqueArray` 函数泛型化来增强其类型安全性。

请注意，在测试中，我们调用函数时并未显式提供类型参数。TypeScript 应该能够从参数中推断出类型。

调整函数并插入必要的类型注解，以确保两个测试中的 `result` 类型分别被推断为 `number[]` 和 `string[]`。

<Exercise title="练习 3：泛型函数中的推断" filePath="/src/085-the-utils-folder/217-generic-functions-with-inference.problem.ts"></Exercise>

### 练习 4：类型参数约束

考虑这个函数 `addCodeToError`，它接受一个类型参数 `TError` 并返回一个带有 `code` 属性的对象：

```ts twoslash
// @errors: 2339
const UNKNOWN_CODE = 8000;

const addCodeToError = <TError>(error: TError) => {
  return {
    ...error,
    code: error.code ?? UNKNOWN_CODE,
  };
};
```

如果传入的错误不包含 `code`，函数会分配一个默认的 `UNKNOWN_CODE`。目前在 `code` 属性下有一个错误。

目前，`TError` 没有约束，可以是任何类型。这导致了我们测试中的错误：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";
import { it, expect } from "vitest";

const UNKNOWN_CODE = 8000;

const addCodeToError = <TError>(error: TError) => {
  return {
    ...error,
    code: (error as any).code ?? UNKNOWN_CODE,
  };
};
// ---cut---
it("Should accept a standard error", () => {
  const errorWithCode = addCodeToError(new Error("Oh dear!"));

  type test1 = Expect<Equal<typeof errorWithCode, Error & { code: number }>>;

  console.log(errorWithCode.message);

  type test2 = Expect<Equal<typeof errorWithCode.message, string>>;
});

it("Should accept a custom error", () => {
  const customErrorWithCode = addCodeToError({
    message: "Oh no!",
    code: 123,
    filepath: "/",
  });

  type test3 = Expect<
    Equal<
      typeof customErrorWithCode,
      {
        message: string;
        code: number;
        filepath: string;
      } & {
        code: number;
      }
    >
  >;

  type test4 = Expect<Equal<typeof customErrorWithCode.message, string>>;
});
```

你的任务是更新 `addCodeToError` 的类型签名，以强制执行必要的约束，使得 `TError` 必须具有 `message` 属性，并且可以选择性地具有 `code` 属性。

<Exercise title="练习 4：类型参数约束" filePath="/src/085-the-utils-folder/216-type-parameter-defaults-in-generic-functions.problem.ts"></Exercise>

### 练习 5：结合泛型类型和函数

这里我们有一个 `safeFunction`，它接受一个类型为 `PromiseFunc` 的函数 `func`，该函数本身返回一个函数。然而，如果 `func` 遇到错误，错误会被捕获并返回：

```typescript
type PromiseFunc = () => Promise<any>;

const safeFunction = (func: PromiseFunc) => async () => {
  try {
    const result = await func();
    return result;
  } catch (e) {
    if (e instanceof Error) {
      return e;
    }
    throw e;
  }
};
```

简而言之，我们从 `safeFunction` 中得到的结果要么是 `func` 返回的东西，要么是一个 `Error`。

然而，当前的类型定义存在一些问题。

`PromiseFunc` 类型目前被设置为总是返回 `Promise<any>`。这意味着由 `safeFunction` 返回的函数应该返回 `func` 的结果或一个 `Error`，但目前它只返回 `Promise<any>`。

由于这些问题，有几个测试失败了：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";
import { it, expect } from "vitest";

type PromiseFunc = () => Promise<any>;

const safeFunction = (func: PromiseFunc) => async () => {
  try {
    const result = await func();
    return result;
  } catch (e) {
    if (e instanceof Error) {
      return e;
    }
    throw e;
  }
};

// ---cut---
it("should return an error if the function throws", async () => {
  const func = safeFunction(async () => {
    if (Math.random() > 0.5) {
      throw new Error("Something went wrong");
    }
    return 123;
  });

  type test1 = Expect<Equal<typeof func, () => Promise<Error | number>>>;

  const result = await func();

  type test2 = Expect<Equal<typeof result, Error | number>>;
});

it("should return the result if the function succeeds", async () => {
  const func = safeFunction(() => {
    return Promise.resolve(`Hello!`);
  });

  type test1 = Expect<Equal<typeof func, () => Promise<string | Error>>>;

  const result = await func();

  type test2 = Expect<Equal<typeof result, string | Error>>;

  expect(result).toEqual("Hello!");
});
```

你的任务是更新 `safeFunction` 使其拥有一个泛型类型参数，并更新 `PromiseFunc` 使其不再返回 `Promise<any>`。这将需要你结合泛型类型和函数来确保测试成功通过。

<Exercise title="练习 5：结合泛型类型和函数" filePath="/src/085-the-utils-folder/219-combining-generic-types-with-generic-functions.problem.ts"></Exercise>

### 练习 6：泛型函数中的多个类型参数

在练习 5 中将 `safeFunction` 泛型化后，它已更新为允许传递参数：

```typescript
const safeFunction =
  <TResult>(func: PromiseFunc<TResult>) =>
  async (...args: any[]) => {
    //   ^^^^^^^^^^^^^^ 现在可以接收参数了！
    try {
      const result = await func(...args);
      return result;
    } catch (e) {
      if (e instanceof Error) {
        return e;
      }
      throw e;
    }
  };
```

现在，传递给 `safeFunction` 的函数可以接收参数了，我们得到的返回函数也应该包含这些参数，并要求你传入它们。

然而，正如测试中所示，这并没有按预期工作：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";
import { it, expect } from "vitest";

type PromiseFunc<T> = (...args: any[]) => Promise<T>;

const safeFunction =
  <TResult>(func: PromiseFunc<TResult>) =>
  async (...args: any[]) => {
    //   ^^^^^^^^^^^^^^ 现在可以接收参数了！
    try {
      const result = await func(...args);
      return result;
    } catch (e) {
      if (e instanceof Error) {
        return e;
      }
      throw e;
    }
  };
// ---cut---
it("should return the result if the function succeeds", async () => {
  const func = safeFunction((name: string) => {
    return Promise.resolve(`hello ${name}`);
  });

  type test1 = Expect<
    Equal<typeof func, (name: string) => Promise<Error | string>>
  >;
});
```

例如，在上面的测试中，`name` 并没有被推断为 `safeFunction` 返回的函数的参数。相反，它实际上是说我们可以向函数中传入任意数量的参数，这是不正确的。

```typescript
// 鼠标悬停在 func 上显示：
const func: (...args: any[]) => Promise<string | Error>;
```

你的任务是向 `PromiseFunc` 和 `safeFunction` 添加第二个类型参数，以准确推断参数类型。

正如测试中所示，有些情况下不需要参数，而另一些情况下需要单个参数：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";
import { it, expect } from "vitest";

type PromiseFunc<T> = (...args: any[]) => Promise<T>;

const safeFunction =
  <TResult>(func: PromiseFunc<TResult>) =>
  async (...args: any[]) => {
    try {
      const result = await func(...args);
      return result;
    } catch (e) {
      if (e instanceof Error) {
        return e;
      }
      throw e;
    }
  };
// ---cut---
it("should return an error if the function throws", async () => {
  const func = safeFunction(async () => {
    if (Math.random() > 0.5) {
      throw new Error("Something went wrong");
    }
    return 123;
  });

  type test1 = Expect<Equal<typeof func, () => Promise<Error | number>>>;

  const result = await func();

  type test2 = Expect<Equal<typeof result, Error | number>>;
});

it("should return the result if the function succeeds", async () => {
  const func = safeFunction((name: string) => {
    return Promise.resolve(`hello ${name}`);
  });

  type test1 = Expect<
    Equal<typeof func, (name: string) => Promise<Error | string>>
  >;

  const result = await func("world");

  type test2 = Expect<Equal<typeof result, string | Error>>;

  expect(result).toEqual("hello world");
});
```

更新函数和泛型类型的类型，并使这些测试成功通过。

<Exercise title="练习 6：泛型函数中的多个类型参数" filePath="/src/085-the-utils-folder/220-multiple-type-arguments-in-generic-functions.problem.ts"></Exercise>

### 练习 8：断言函数

本练习从一个 `User` 接口开始，该接口具有 `id` 和 `name` 属性。然后我们有一个 `AdminUser` 接口，它扩展了 `User`，继承了其所有属性并添加了一个 `roles` 字符串数组属性：

```typescript
interface User {
  id: string;
  name: string;
}

interface AdminUser extends User {
  roles: string[];
}
```

函数 `assertIsAdminUser` 接受 `User` 或 `AdminUser` 对象作为参数。如果参数中不存在 `roles` 属性，则函数抛出错误：

```typescript
function assertIsAdminUser(user: User | AdminUser) {
  if (!("roles" in user)) {
    throw new Error("User is not an admin");
  }
}
```

此函数的目的是验证我们是否能够访问特定于 `AdminUser` 的属性，例如 `roles`。

在 `handleRequest` 函数中，我们调用 `assertIsAdminUser` 并期望 `user` 的类型被收窄为 `AdminUser`。

但正如这个测试用例所示，它并没有按预期工作：

```ts twoslash
// @errors: 2344 2339
import { Equal, Expect } from "@total-typescript/helpers";

interface User {
  id: string;
  name: string;
}

interface AdminUser extends User {
  roles: string[];
}

function assertIsAdminUser(user: User | AdminUser) {
  if (!("roles" in user)) {
    throw new Error("User is not an admin");
  }
}

// ---cut---
const handleRequest = (user: User | AdminUser) => {
  type test1 = Expect<Equal<typeof user, User | AdminUser>>;

  assertIsAdminUser(user);

  type test2 = Expect<Equal<typeof user, AdminUser>>;

  user.roles;
};
```

在调用 `assertIsAdminUser` 之前，`user` 类型是 `User | AdminUser`，但在调用函数之后，它并没有被收窄为 `AdminUser`。这意味着我们无法访问 `roles` 属性。

你的任务是使用正确的类型断言更新 `assertIsAdminUser` 函数，以便在调用函数后将 `user` 识别为 `AdminUser`。

<Exercise title="练习 8：断言函数" filePath="/src/085-the-utils-folder/222-assertion-functions.problem.ts"></Exercise>

### 解决方案 1：使函数泛型化

使这个函数泛型化的第一步是添加一个类型参数 `T`：

```typescript
const createStringMap = <T>() => {
  return new Map();
};
```

通过这个改变，我们的 `createStringMap` 函数现在可以处理一个类型参数 `T`。

`numberMap` 变量的错误消失了，但是函数仍然返回一个 `Map<any, any>`：

```typescript
const numberMap = createStringMap<number>();

// 鼠标悬停在 createStringMap 上显示：
const createStringMap: <number>() => Map<any, any>;
```

我们需要为 map 条目指定类型。

因为我们知道键总是字符串，所以我们将 `Map` 的第一个类型参数设置为 `string`。对于值，我们将使用我们的类型参数 `T`：

```typescript
const createStringMap = <T>() => {
  return new Map<string, T>();
};
```

现在函数可以正确地类型化 map 的值了。

如果我们不传入类型参数，函数将默认为 `unknown`：

```typescript
const objMap = createStringMap();

// 鼠标悬停在 objMap 上显示：
const objMap: Map<string, unknown>;
```

通过这些步骤，我们成功地将 `createStringMap` 从一个常规函数转换成了一个能够接收类型参数的泛型函数。

### 解决方案 2：默认类型参数

为泛型函数设置默认类型的语法与泛型类型相同：

```typescript
const createStringMap = <T = string>() => {
  return new Map<string, T>();
};
```

通过使用 `T = string` 语法，我们告诉函数，如果未提供类型参数，则应默认为 `string`。

现在，当我们不带类型参数调用 `createStringMap()` 时，我们会得到一个键和值都为 `string` 的 `Map`：

```typescript
const stringMap = createStringMap();

// 鼠标悬停在 stringMap 上显示：
const stringMap: Map<string, string>;
```

如果我们尝试将数字赋值为值，TypeScript 会报错，因为它期望的是一个字符串：

```ts twoslash
// @errors: 2345
const createStringMap = <T = string>() => {
  return new Map<string, T>();
};

const stringMap = createStringMap();

// ---cut---
stringMap.set("bar", 123);
```

然而，我们仍然可以通过在调用函数时提供类型参数来覆盖默认类型：

```typescript
const numberMap = createStringMap<number>();
numberMap.set("foo", 123);
```

在上面的代码中，`numberMap` 将得到一个键为 `string`、值为 `number` 的 `Map`，如果我们尝试分配一个非数字的值，TypeScript 会报错：

```typescript
numberMap.set(
  "bar",
  // @ts-expect-error
  true
);
```

### 解决方案 3：泛型函数中的推断

第一步是在 `uniqueArray` 上添加一个类型参数。这将 `uniqueArray` 变成一个可以接收类型参数的泛型函数：

```typescript
const uniqueArray = <T>(arr: any[]) => {
  return Array.from(new Set(arr));
};
```

现在，当我们将鼠标悬停在对 `uniqueArray` 的调用上时，我们可以看到它将类型推断为 `unknown`：

```ts twoslash
const uniqueArray = <T>(arr: any[]) => {
  return Array.from(new Set(arr));
};

// ---cut---
const result = uniqueArray([1, 1, 2, 3, 4, 4, 5]);
//             ^?
```

这是因为我们没有向它传递任何类型参数。如果没有类型参数且没有默认值，它就默认为 unknown。

我们希望类型参数被推断为 `number`，因为我们知道我们得到的是一个数字数组。

所以我们要做的就是给函数添加一个 `T[]` 的返回类型：

```typescript
const uniqueArray = <T>(arr: any[]): T[] => {
  return Array.from(new Set(arr));
};
```

现在 `uniqueArray` 的结果被推断为一个 `unknown` 数组：

```ts twoslash
const uniqueArray = <T>(arr: any[]): T[] => {
  return Array.from(new Set(arr));
};

// ---cut---
const result = uniqueArray([1, 1, 2, 3, 4, 4, 5]);
//    ^?
```

同样，原因是我们没有向它传递任何类型参数。如果没有类型参数且没有默认值，它就默认为 `unknown`。

如果我们在调用时添加一个 `<number>` 类型参数，`result` 现在将被推断为一个数字数组：

```ts twoslash
const uniqueArray = <T>(arr: any[]): T[] => {
  return Array.from(new Set(arr));
};
// ---cut---
const result = uniqueArray<number>([1, 1, 2, 3, 4, 4, 5]);
//       ^?
```

然而，此时我们传入的内容和得到的内容之间没有任何关系。向调用添加类型参数会返回该类型的数组，但函数本身的 `arr` 参数仍然是 `any[]` 类型。

我们需要做的是告诉 TypeScript `arr` 参数的类型与传入的类型相同。

为此，我们将 `arr: any[]` 替换为 `arr: T[]`：

```typescript
const uniqueArray = <T>(arr: T[]): T[] => {
  ...
```

函数的返回类型是 `T` 类型的数组，其中 `T` 代表提供给函数的数组中元素的类型。

因此，即使没有显式的返回类型注解，TypeScript 也能将数字输入数组的返回类型推断为 `number[]`，或将字符串输入数组的返回类型推断为 `string[]`。正如我们所见，测试成功通过：

```typescript
// 数字测试
const result = uniqueArray([1, 1, 2, 3, 4, 4, 5]);

type test = Expect<Equal<typeof result, number[]>>;

// 字符串测试
const result = uniqueArray(["a", "b", "b", "c", "c", "c"]);

type test = Expect<Equal<typeof result, string[]>>;
```

如果你显式传递一个类型参数，TypeScript 会使用它。如果你不传递，TypeScript 会尝试从运行时参数中推断它。

### 解决方案 4：类型参数约束

添加约束的语法与我们为泛型类型看到的相同。

我们需要使用 `extends` 关键字为泛型类型参数 `TError` 添加约束。传入的对象必须具有 `string` 类型的 `message` 属性，并且可以选择性地具有 `number` 类型的 `code`：

```typescript
const UNKNOWN_CODE = 8000;

const addCodeToError = <TError extends { message: string; code?: number }>(
  error: TError
) => {
  return {
    ...error,
    code: error.code ?? UNKNOWN_CODE,
  };
};
```

这一更改确保了 `addCodeToError` 必须使用一个包含 `message` 字符串属性的对象来调用。TypeScript 同时知道 `code` 既可以是数字，也可以是 `undefined`。如果 `code` 不存在，它将默认为 `UNKNOWN_CODE`。

这些约束使我们的测试通过，包括我们传入额外 `filepath` 属性的情况。这是因为在泛型中使用 `extends` 并不会限制你只能传入约束中定义的属性。

### 解决方案 5：结合泛型类型和函数

这是我们 `safeFunction` 的起点：

```typescript
type PromiseFunc = () => Promise<any>;

const safeFunction = (func: PromiseFunc) => async () => {
  try {
    const result = await func();
    return result;
  } catch (e) {
    if (e instanceof Error) {
      return e;
    }
    throw e;
  }
};
```

我们要做的第一件事是将 `PromiseFunc` 类型更新为一个泛型类型。我们将类型参数命名为 `TResult`，以表示 promise 返回的值的类型，并将其添加到函数的返回类型中：

```typescript
type PromiseFunc<TResult> = () => Promise<TResult>;
```

通过此更新，我们现在需要在 `safeFunction` 中更新 `PromiseFunc` 以包含类型参数：

```typescript
const safeFunction =
  <TResult>(func: PromiseFunc<TResult>) =>
  async () => {
    try {
      const result = await func();
      return result;
    } catch (e) {
      if (e instanceof Error) {
        return e;
      }
      throw e;
    }
  };
```

完成这些更改后，当我们将鼠标悬停在第一个测试中的 `safeFunction` 调用上时，可以看到类型参数按预期被推断为 `number`：

```typescript
it("should return an error if the function throws", async () => {
  const func = safeFunction(async () => {
    if (Math.random() > 0.5) {
      throw new Error("Something went wrong");
    }
    return 123;
  });
  ...

// 鼠标悬停在 safeFunction 上显示：
const safeFunction: <number>(func: PromiseFunc<number>) => Promise<() => Promise<number | Error>>
```

其他测试也都通过了。

无论我们向 `safeFunction` 传入什么，都会被推断为 `PromiseFunc` 的类型参数。这是因为类型参数是在泛型函数*内部*被推断的。

这种泛型函数和泛型类型的组合可以使你的泛型函数更易于阅读。

### 解决方案 6：泛型函数中的多个类型参数

以下是 `PromiseFunc` 当前的定义方式：

```typescript
type PromiseFunc<TResult> = (...args: any[]) => Promise<TResult>;
```

首先要做的是确定传入参数的类型。目前，它们被设置为一个值，但它们需要根据传入的函数类型而有所不同。

我们不希望 `args` 的类型是 `any[]`，而是希望展开所有的 `args` 并捕获整个数组。

为此，我们将类型更新为 `TArgs`。由于 `args` 需要是一个数组，我们将声明 `TArgs extends any[]`。请注意，这并不意味着 `TArgs` 的类型将是 `any`，而是它将接受任何类型的数组：

```typescript
type PromiseFunc<TArgs extends any[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;
```

你可能尝试过使用 `unknown[]` —— 但在这种情况下，只有 `any[]` 才有效。

现在我们需要更新 `safeFunction`，使其具有与 `PromiseFunc` 相同的参数。为此，我们将 `TArgs` 添加到其类型参数中。

请注意，我们还需要将 `async` 函数的参数更新为 `TArgs` 类型：

```typescript
const safeFunction =
  <TArgs extends any[], TResult>(func: PromiseFunc<TArgs, TResult>) =>
  async (...args: TArgs) => {
    try {
      const result = await func(...args);
      return result;
    } catch (e) {
      ...
```

这一更改是必要的，以确保 `safeFunction` 返回的函数与原始函数具有相同类型的参数。

通过这些更改，我们所有的测试都按预期通过了。

### 解决方案 8：断言函数

解决方案是在 `assertIsAdminUser` 的返回类型上添加一个类型注解。

如果它是一个类型谓词，我们会说 `user is AdminUser`：

```ts twoslash
// @errors: 2355
type User = {
  id: string;
  name: string;
};
type AdminUser = {
  id: string;
  name: string;
  roles: string[];
};

// ---cut---
function assertIsAdminUser(user: User): user is AdminUser {
  if (!("roles" in user)) {
    throw new Error("User is not an admin");
  }
}
```

然而，这会导致一个错误。我们得到这个错误是因为 `assertIsAdminUser` 返回 `void`，这与要求返回布尔值的类型谓词不同。

相反，我们需要在返回类型中添加 `asserts` 关键字：

```typescript
function assertIsAdminUser(user: User | AdminUser): asserts user is AdminUser {
  if (!("roles" in user)) {
    throw new Error("User is not an admin");
  }
}
```

通过添加 `asserts` 关键字，仅凭 `assertIsAdminUser` 被调用这一事实，我们就可以断言 `user` 是一个 `AdminUser`。我们不需要将其放入 `if` 语句或其他任何地方。

完成 `asserts` 更改后，在调用 `assertIsAdminUser` 后，`user` 类型被收窄为 `AdminUser`，并且测试按预期通过：

```typescript
const handleRequest = (user: User | AdminUser) => {
  type test1 = Expect<Equal<typeof user, User | AdminUser>>;

  assertIsAdminUser(user);

  type test2 = Expect<Equal<typeof user, AdminUser>>;

  user.roles;
};

// 鼠标悬停在 roles 上显示：
user: AdminUser;
```
