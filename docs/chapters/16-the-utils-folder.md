通常认为 TypeScript 复杂性有两个层次。

一端是库开发。在这里，你利用 TypeScript 最晦涩和强大的特性。你需要条件类型、映射类型、泛型等更多特性来创建一个足够灵活的库，可以在各种场景中使用。

另一端是应用程序开发。在这里，你主要关注确保代码类型安全。你希望确保你的类型反映应用程序中发生的事情。任何复杂的类型都存在于你使用的库中。你需要了解 TypeScript，但不需要经常使用其高级特性。

这是大多数 TypeScript 社区使用的经验法则。"对于应用程序代码来说太复杂了"。"你只会在库中需要它"。但还有一个经常被忽视的第三个层次：`/utils`文件夹。

如果你的应用程序足够大，你会开始在一组可重用函数中捕获常见模式。这些函数，如`groupBy`、`debounce`和`retry`，可能在大型应用程序中被使用数百次。它们就像应用程序范围内的迷你库。

了解如何构建这些类型的函数可以为你的团队节省大量时间。捕获常见模式意味着你的代码变得更容易维护，构建更快。

在本章中，我们将介绍如何构建这些函数。我们将从泛型函数开始，然后转向类型谓词、断言函数和函数重载。

## 泛型函数

我们已经看到，在 TypeScript 中，函数不仅可以接收值作为参数，还可以接收类型。在这里，我们向`new Set()`传递一个*值*和一个*类型*：

```typescript
const set = new Set<number>([1, 2, 3]);
//                 ^^^^^^^^ ^^^^^^^^^
//                 类型     值
```

我们在尖括号中传递类型，在括号中传递值。这是因为`new Set()`是一个泛型函数。不能接收类型的函数是常规函数，如`JSON.parse`：

```ts twoslash
// @errors: 2558
const obj = JSON.parse<{ hello: string }>('{"hello": "world"}');
```

这里，TypeScript 告诉我们`JSON.parse`不接受类型参数，因为它不是泛型的。

### 什么使函数成为泛型？

如果函数声明了类型参数，它就是泛型的。这里有一个接受类型参数`T`的泛型函数：

```typescript
function identity<T>(arg: T): T {
  //                 ^^^ 类型参数
  return arg;
}
```

我们可以使用 function 关键字，或使用箭头函数语法：

```typescript
const identity = <T>(arg: T): T => arg;
```

我们甚至可以将泛型函数声明为类型：

```typescript
type Identity = <T>(arg: T) => T;

const identity: Identity = (arg) => arg;
```

现在，我们可以向`identity`传递类型参数：

```typescript
identity<number>(42);
```

#### 泛型函数类型别名与泛型类型

区分泛型类型的语法和泛型函数的类型别名的语法非常重要。对于未经训练的眼睛来说，它们看起来非常相似。以下是区别：

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

这都是关于类型参数的位置。如果它附加到类型的名称，它是一个泛型类型。如果它附加到函数的括号，它是泛型函数的类型别名。

### 当我们不传入类型参数时会发生什么？

当我们查看泛型类型时，我们看到 TypeScript*要求*你在使用泛型类型时传入所有类型参数：

```ts twoslash
// @errors: 2314
type StringArray = Array<string>;

type AnyArray = Array;
```

对于泛型函数，情况并非如此。如果你不向泛型函数传递类型参数，TypeScript 不会抱怨：

```typescript
function identity<T>(arg: T): T {
  return arg;
}

const result = identity(42); // 没有错误！
```

为什么会这样？嗯，这是泛型函数的特性，使它们成为我最喜欢的 TypeScript 工具。如果你不传递类型参数，TypeScript 将尝试从函数的运行时参数*推断*它。

我们上面的`identity`函数只是接受一个参数并返回它。我们在运行时参数中引用了类型参数：`arg: T`。这意味着如果我们不传入类型参数，`T`将从`arg`的类型推断出来。

所以，`result`将被类型化为`42`：

```ts twoslash
function identity<T>(arg: T): T {
  return arg;
}
// ---cut---
const result = identity(42);
//    ^?
```

这意味着每次调用函数时，它都可能返回不同的类型：

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

这种能力意味着你的函数可以理解它们正在处理的类型，并相应地改变它们的建议和错误。这是 TypeScript 最强大和灵活的地方。

### 指定类型胜过推断类型

让我们回到指定类型参数而不是推断它们。如果你传递的类型参数与运行时参数冲突会发生什么？

让我们用我们的`identity`函数试试：

```ts twoslash
// @errors: 2345
function identity<T>(arg: T): T {
  return arg;
}
// ---cut---
const result = identity<string>(42);
```

这里，TypeScript 告诉我们`42`不是`string`。这是因为我们明确告诉 TypeScript`T`应该是`string`，这与运行时参数冲突。

传递类型参数是对 TypeScript 覆盖推断的指令。如果你传入类型参数，TypeScript 将使用它作为真相来源。如果你不传入，TypeScript 将使用运行时参数的类型作为真相来源。

### 没有所谓的"泛型"

这里关于术语的一个快速说明。TypeScript 的"泛型"有难以理解的名声。我认为很大一部分原因是基于人们如何使用"泛型"这个词。

很多人认为"泛型"是 TypeScript 的一部分。他们把它当作名词。如果你问某人"这段代码中的'泛型'在哪里？"：

```typescript
const identity = <T>(arg: T) => arg;
```

他们可能会指向`<T>`。其他人可能会将下面的代码描述为"向`Set`传递'泛型'"：

```typescript
const set = new Set<number>([1, 2, 3]);
```

这种术语会变得非常混乱。相反，我更喜欢将它们分成不同的术语：

- 类型参数：`identity<T>`中的`<T>`。
- 类型参数：传递给`Set<number>`的`number`。
- 泛型类/函数/类型：声明类型参数的类、函数或类型。

当你将泛型分解为这些术语时，它变得更容易理解。

### 泛型函数解决的问题

让我们将我们学到的付诸实践。

考虑这个名为`getFirstElement`的函数，它接受一个数组并返回第一个元素：

```typescript
const getFirstElement = (arr: any[]) => {
  return arr[0];
};
```

这个函数很危险。因为它接受`any`的数组，这意味着我们从`getFirstElement`得到的东西也是`any`：

```ts twoslash
const getFirstElement = (arr: any[]) => {
  return arr[0];
};

// ---cut---
const first = getFirstElement([1, 2, 3]);
//    ^?
```

正如我们所见，`any`可能在你的代码中造成混乱。使用这个函数的任何人都会在不知不觉中选择退出 TypeScript 的类型安全。那么，我们如何解决这个问题？

我们需要 TypeScript 理解我们传入的数组的类型，并使用它来类型化返回的内容。我们需要使`getFirstElement`成为泛型：

为此，我们将在函数的参数列表之前添加一个类型参数`TMember`，然后使用`TMember[]`作为数组的类型：

```typescript
const getFirstElement = <TMember>(arr: TMember[]) => {
  return arr[0];
};
```

就像泛型函数一样，通常会在类型参数前加上`T`前缀，以将它们与普通类型区分开来。

现在当我们调用`getFirstElement`时，TypeScript 将根据我们传入的参数推断``的类型：

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

现在，我们已经使`getFirstElement`类型安全。我们传入的数组的类型就是我们得到的东西的类型。

### 调试泛型函数的推断类型

当你使用泛型函数时，可能很难知道 TypeScript 推断了什么类型。然而，通过精心放置的悬停，你可以找出答案。

当我们调用`getFirstElement`函数时，我们可以悬停在函数名上，看看 TypeScript 推断了什么：

```ts twoslash
const getFirstElement = <TMember>(arr: TMember[]) => {
  return arr[0];
};
// ---cut---
const first = getFirstElement([1, 2, 3]);
//            ^?
```

我们可以看到，在尖括号内，TypeScript 推断`TMember`是`number`，因为我们传入了一个数字数组。

当你有更复杂的函数，有多个类型参数需要调试时，这可能很有用。我经常发现自己在同一个文件中创建临时函数调用，以查看 TypeScript 推断了什么。

### 类型参数默认值

就像泛型类型一样，你可以在泛型函数中为类型参数设置默认值。当函数的运行时参数是可选的时，这可能很有用：

```typescript
const createSet = <T = string>(arr?: T[]) => {
  return new Set(arr);
};
```

这里，我们将`T`的默认类型设置为`string`。这意味着如果我们不传入类型参数，TypeScript 将假设`T`是`string`：

```ts twoslash
const createSet = <T = string>(arr?: T[]) => {
  return new Set(arr);
};
// ---cut---
const defaultSet = createSet();
//    ^?
```

默认值不对`T`的类型施加约束。这意味着我们仍然可以传入任何我们想要的类型：

```ts twoslash
const createSet = <T = string>(arr?: T[]) => {
  return new Set(arr);
};
// ---cut---
const numberSet = createSet<number>([1, 2, 3]);
//    ^?
```

如果我们不指定默认值，并且 TypeScript 无法从运行时参数推断类型，它将默认为`unknown`：

```ts twoslash
const createSet = <T>(arr?: T[]) => {
  return new Set(arr);
};

const unknownSet = createSet();
//    ^?
```

这里，我们删除了`T`的默认类型，TypeScript 默认为`unknown`。

### 约束类型参数

你也可以在泛型函数中为类型参数添加约束。当你想确保类型具有某些属性时，这可能很有用。

让我们想象一个`removeId`函数，它接受一个对象并删除`id`属性：

```ts twoslash
// @errors: 2339
const removeId = <TObj>(obj: TObj) => {
  const { id, ...rest } = obj;
  return rest;
};
```

我们的`TObj`类型参数，在没有约束的情况下使用时，被视为`unknown`。这意味着 TypeScript 不知道`id`是否存在于`obj`上。

为了解决这个问题，我们可以向`TObj`添加一个约束，确保它有一个`id`属性：

```typescript
const removeId = <TObj extends { id: unknown }>(obj: TObj) => {
  const { id, ...rest } = obj;
  return rest;
};
```

现在，当我们使用`removeId`时，如果我们不传入带有`id`属性的对象，TypeScript 将报错：

```ts twoslash
// @errors: 2353
const removeId = <TObj extends { id: unknown }>(obj: TObj) => {
  const { id, ...rest } = obj;
  return rest;
};
// ---cut---
const result = removeId({ name: "Alice" });
```

但如果我们传入带有`id`属性的对象，TypeScript 将知道`id`已被删除：

```ts twoslash
const removeId = <TObj extends { id: unknown }>(obj: TObj) => {
  const { id, ...rest } = obj;
  return rest;
};
// ---cut---
const result = removeId({ id: 1, name: "Alice" });
//    ^?
```

注意 TypeScript 在这里有多聪明。即使我们没有为`removeId`指定返回类型，TypeScript 也推断出`result`是一个具有输入对象所有属性的对象，除了`id`。

## 类型谓词

我们在第 5 章中介绍了类型谓词，当我们研究缩小范围时。它们用于捕获可重用的逻辑，缩小变量的类型。

例如，假设我们想确保一个变量是`Album`，然后再尝试访问其属性或将其传递给需要`Album`的函数。

我们可以编写一个`isAlbum`函数，接受一个输入，并检查所有必需的属性。

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

如果我们悬停在`isAlbum`上，我们可以看到一个相当丑陋的类型签名：

```typescript
// 悬停在isAlbum上显示：
function isAlbum(
  input: unknown
): input is object &
  Record<"id", unknown> &
  Record<"title", unknown> &
  Record<"artist", unknown> &
  Record<"year", unknown>;
```

这在技术上是正确的：一个大的交集，包括`object`和一堆`Record`。但它不是很有帮助。

当我们尝试使用`isAlbum`来缩小值的类型时，TypeScript 不会正确推断它：

```ts twoslash
// @errors: 18046
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

为了解决这个问题，我们需要向`isAlbum`添加更多检查，以确保我们检查所有属性的类型：

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

但在这一点上，发生了令人沮丧的事情 - TypeScript*停止*推断函数的返回值。我们可以通过悬停在`isAlbum`上看到这一点：

```typescript
// 悬停在isAlbum上显示：
function isAlbum(input: unknown): boolean;
```

这是因为 TypeScript 的类型谓词推断有限制 - 它只能处理一定程度的复杂性。

不仅如此，我们的代码现在*极其*防御性。我们检查每个属性的存在*和*类型。这是很多样板代码，可能不是必要的。事实上，像这样的代码可能应该封装在像[Zod](https://zod.dev/)这样的库中。

### 编写自己的类型谓词

为了解决这个问题，我们可以手动用类型谓词注解我们的`isAlbum`函数：

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

这个注解告诉 TypeScript，当`isAlbum`返回`true`时，值的类型已经缩小为`Album`。

现在，当我们使用`isAlbum`时，TypeScript 将正确推断它：

```typescript
const run = (maybeAlbum: unknown) => {
  if (isAlbum(maybeAlbum)) {
    maybeAlbum.name.toUpperCase(); // 没有错误！
  }
};
```

这可以确保你从复杂的类型守卫中获得相同的类型行为。

### Type Predicates Can be Unsafe

Authoring your own type predicates can be a little dangerous. TypeScript doesn't track if the type predicate's runtime behavior matches the type predicate's type signature.

```typescript
function isNumber(input: unknown): input is number {
  return typeof input === "string";
}
```

In this case, TypeScript _thinks_ that `isNumber` checks if something is a number. But in fact, it checks if something is a string! There are no guarantees that the runtime behavior of the function matches the type signature.

This is a common pitfall when working with type predicates - it's important to consider them about as unsafe as `as` and `!`.

## Assertion Functions

Assertion functions look similar to type predicates, but they're used slightly differently. Instead of returning a boolean to indicate whether a value is of a certain type, assertion functions throw an error if the value isn't of the expected type.

Here's how we could rework the `isAlbum` type predicate to be an `assertIsItem` assertion function:

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

The `assertIsAlbum` function takes in a `input` of type `unknown` and asserts that it is an `Album` using the `asserts input is Album` syntax.

This means that the narrowing is more aggressive. Instead of checking within an `if` statement, the function call itself is enough to assert that the `input` is an `Album`.

```ts twoslash
type Album = {
  id: number;
  title: string;
  artist: string;
  year: number;
};

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
// ---cut---
function getAlbumTitle(item: unknown) {
  console.log(item);
  //          ^?

  assertIsAlbum(item);

  console.log(item.title);
  //          ^?
}
```

Assertion functions can be useful when you want to ensure that a value is of a certain type before proceeding with further operations.

### Assertion Functions Can Lie

Just like type predicates, assertion functions can be misused. If the assertion function doesn't accurately reflect the type being checked, it can lead to runtime errors.

For example, if the `assertIsAlbum` function doesn't check for all the required properties of an `Album`, it can lead to unexpected behavior:

```typescript
function assertIsAlbum(input: unknown): asserts input is Album {
  if (typeof input === "object") {
    throw new Error("Not an Album!");
  }
}

let item = null;

assertIsAlbum(item);

item.title;
// ^?
```

In this case, the `assertIsAlbum` function doesn't check for the required properties of an `Album` - it just checks if `typeof input` is `"object"`. This means we've left ourselves open to a stray `null`. The famous JavaScript quirk where `typeof null === 'object'` will cause a runtime error when we try to access the `title` property.

## Function Overloads

Function overloads provide a way to define multiple function signatures for a single function implementation. In other words, you can define different ways to call a function, each with its own set of parameters and return types. It's an interesting technique for creating a flexible API that can handle different use cases while maintaining type safety.

To demonstrate how function overloads work, we'll create a `searchMusic` function that allows for different ways to perform a search based on the provided arguments.

### Defining Overloads

To define function overloads, the same function definition is written multiple times with different parameter and return types. Each definition is called an overload signature, and is separated by semicolons. You'll also need to use the `function` keyword each time.

For the `searchMusic` example, we want to allow users to search by providing an artist, genre and year. But for legacy reasons, we want them to be able to pass them as a single object or as separate arguments.

Here's how we could define these function overload signatures. The first signature takes in three separate arguments, while the second signature takes in a single object with the properties:

```ts twoslash
// @errors: 2391
function searchMusic(artist: string, genre: string, year: number): void;
function searchMusic(criteria: {
  artist: string;
  genre: string;
  year: number;
}): void;
```

But we're getting an error. We've declared some ways this function should be declared, but we haven't provided the implementation yet.

### The Implementation Signature

The implementation signature is the actual function declaration that contains the actual logic for the function. It is written below the overload signatures, and must be compatible with all the defined overloads.

In this case, the implementation signature will take in a parameter called `queryOrCriteria` that can be either a `string` or an object with the specified properties. Inside the function, we'll check the type of `queryOrCriteria` and perform the appropriate search logic based on the provided arguments:

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
    // Search with separate arguments
    search(artistOrCriteria, genre, year);
  } else {
    // Search with object
    search(
      artistOrCriteria.artist,
      artistOrCriteria.genre,
      artistOrCriteria.year
    );
  }
}
```

Now we can call the `searchMusic` function with the different arguments defined in the overloads:

```typescript
searchMusic("King Gizzard and the Lizard Wizard", "Psychedelic Rock", 2021);
searchMusic({
  artist: "Tame Impala",
  genre: "Psychedelic Rock",
  year: 2015,
});
```

However, TypeScript will warn us if we attempt to pass in an argument that doesn't match any of the defined overloads:

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

This error shows us that we're trying to call `searchMusic` with two arguments, but the overloads only expect one or three arguments.

### Function Overloads vs Unions

Function overloads can be useful when you have multiple call signatures spread over different sets of arguments. In the example above, we can either call the function with one argument, or three.

When you have the same number of arguments but different types, you should use a union type instead of function overloads. For example, if you want to allow the user to search by either artist name or criteria object, you could use a union type:

```typescript
function searchMusic(
  query: string | { artist: string; genre: string; year: number }
): void {
  if (typeof query === "string") {
    // Search by artist
    searchByArtist(query);
  } else {
    // Search by all
    search(query.artist, query.genre, query.year);
  }
}
```

This uses far fewer lines of code than defining two overloads and an implementation.

## Exercises

### Exercise 1: Make a Function Generic

Here we have a function `createStringMap`. The purpose of this function is to generate a `Map` with keys as strings and values of the type passed in as arguments:

```typescript
const createStringMap = () => {
  return new Map();
};
```

As it currently stands, we get back a `Map<any, any>`. However, the goal is to make this function generic so that we can pass in a type argument to define the type of the values in the `Map`.

For example, if we pass in `number` as the type argument, the function should return a `Map` with values of type `number`:

```ts twoslash
// @errors: 2558 2578
const createStringMap = () => {
  return new Map();
};
// ---cut---
const numberMap = createStringMap<number>();

numberMap.set("foo", 123);
```

Likewise, if we pass in an object type, the function should return a `Map` with values of that type:

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

The function should also default to `unknown` if no type is provided:

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

Your task is to transform `createStringMap` into a generic function capable of accepting a type argument to describe the values of Map. Make sure it functions as expected for the provided test cases.

<Exercise title="Exercise 1: Make a Function Generic" filePath="/src/085-the-utils-folder/215-generic-functions-without-inference.problem.ts"></Exercise>

### Exercise 2: Default Type Arguments

After making the `createStringMap` function generic in Exercise 1, calling it without a type argument defaults to values being typed as `unknown`:

```typescript
const stringMap = createStringMap();

// hovering over stringMap shows:
const stringMap: Map<string, unknown>;
```

Your goal is to add a default type argument to the `createStringMap` function so that it defaults to `string` if no type argument is provided. Note that you will still be able to override the default type by providing a type argument when calling the function.

<Exercise title="Exercise 2: Default Type Arguments" filePath="/src/085-the-utils-folder/216-type-parameter-defaults-in-generic-functions.problem.ts"></Exercise>

### Exercise 3: Inference in Generic Functions

Consider this `uniqueArray` function:

```typescript
const uniqueArray = (arr: any[]) => {
  return Array.from(new Set(arr));
};
```

The function accepts an array as an argument, then converts it to a `Set`, then returns it as a new array. This is a common pattern for when you want to have unique values inside your array.

While this function operates effectively at runtime, it lacks type safety. It transforms any array passed in into `any[]`.

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

Your task is to boost the type safety of the `uniqueArray` function by making it generic.

Note that in the tests, we do not explicitly provide type arguments when invoking the function. TypeScript should be able to infer the type from the argument.

Adjust the function and insert the necessary type annotations to ensure that the `result` type in both tests is inferred as `number[]` and `string[]`, respectively.

<Exercise title="Exercise 3: Inference in Generic Functions" filePath="/src/085-the-utils-folder/217-generic-functions-with-inference.problem.ts"></Exercise>

### Exercise 4: Type Parameter Constraints

Consider this function `addCodeToError`, which accepts a type parameter `TError` and returns an object with a `code` property:

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

If the incoming error doesn't include a `code`, the function assigns a default `UNKNOWN_CODE`. Currently there is an error under the `code` property.

Currently, there are no constraints on `TError`, which can be of any type. This leads to errors in our tests:

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

Your task is to update the `addCodeToError` type signature to enforce the required constraints so that `TError` is required to have a `message` property and can optionally have a `code` property.

<Exercise title="Exercise 4: Type Parameter Constraints" filePath="/src/085-the-utils-folder/216-type-parameter-defaults-in-generic-functions.problem.ts"></Exercise>

### Exercise 5: Combining Generic Types and Functions

Here we have `safeFunction`, which accepts a function `func` typed as `PromiseFunc` that returns a function itself. However, if `func` encounters an error, it is caught and returned instead:

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

In short, the thing that we get back from `safeFunction` should either be the thing that's returned from `func` or an `Error`.

However, there are some issues with the current type definitions.

The `PromiseFunc` type is currently set to always return `Promise<any>`. This means that the function returned by `safeFunction` is supposed to return either the result of `func` or an `Error`, but at the moment, it's just returning `Promise<any>`.

There are several tests that are failing due to these issues:

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

Your task is to update `safeFunction` to have a generic type parameter, and update `PromiseFunc` to not return `Promise<any>`. This will require you to combine generic types and functions to ensure that the tests pass successfully.

<Exercise title="Exercise 5: Combining Generic Types and Functions" filePath="/src/085-the-utils-folder/219-combining-generic-types-with-generic-functions.problem.ts"></Exercise>

### Exercise 6: Multiple Type Arguments in a Generic Function

After making the `safeFunction` generic in Exercise 5, it's been updated to allow for passing arguments:

```typescript
const safeFunction =
  <TResult>(func: PromiseFunc<TResult>) =>
  async (...args: any[]) => {
    //   ^^^^^^^^^^^^^^ Now can receive args!
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

Now that the function being passed into `safeFunction` can receive arguments, the function we get back should _also_ contain those arguments and require you to pass them in.

However, as seen in the tests, this isn't working:

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";
import { it, expect } from "vitest";

type PromiseFunc<T> = (...args: any[]) => Promise<T>;

const safeFunction =
  <TResult>(func: PromiseFunc<TResult>) =>
  async (...args: any[]) => {
    //   ^^^^^^^^^^^^^^ Now can receive args!
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

For example, in the above test the `name` isn't being inferred as a parameter of the function returned by `safeFunction`. Instead, it's actually saying that we can pass in as many arguments as we want to into the function, which isn't correct.

```typescript
// hovering over func shows:
const func: (...args: any[]) => Promise<string | Error>;
```

Your task is to add a second type parameter to `PromiseFunc` and `safeFunction` to infer the argument types accurately.

As seen in the tests, there are cases where no parameters are necessary, and others where a single parameter is needed:

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

Update the types of the function and the generic type, and make these tests pass successfully.

<Exercise title="Exercise 6: Multiple Type Arguments in a Generic Function" filePath="/src/085-the-utils-folder/220-multiple-type-arguments-in-generic-functions.problem.ts"></Exercise>

### Exercise 8: Assertion Functions

This exercise starts with an interface `User`, which has properties `id` and `name`. Then we have an interface `AdminUser`, which extends `User`, inheriting all its properties and adding a `roles` string array property:

```typescript
interface User {
  id: string;
  name: string;
}

interface AdminUser extends User {
  roles: string[];
}
```

The function `assertIsAdminUser` accepts either a `User` or `AdminUser` object as an argument. If the `roles` property isn't present in the argument, the function throws an error:

```typescript
function assertIsAdminUser(user: User | AdminUser) {
  if (!("roles" in user)) {
    throw new Error("User is not an admin");
  }
}
```

This function's purpose is to verify we are able to access properties that are specific to the `AdminUser`, such as `roles`.

In the `handleRequest` function, we call `assertIsAdminUser` and expect the type of `user` to be narrowed down to `AdminUser`.

But as seen in this test case, it doesn't work as expected:

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

The `user` type is `User | AdminUser` before `assertIsAdminUser` is called, but it doesn't get narrowed down to just `AdminUser` after the function is called. This means we can't access the `roles` property.

Your task is to update the `assertIsAdminUser` function with the proper type assertion so that the `user` is identified as an `AdminUser` after the function is called.

<Exercise title="Exercise 8: Assertion Functions" filePath="/src/085-the-utils-folder/222-assertion-functions.problem.ts"></Exercise>

### Solution 1: Make a Function Generic

The first thing we'll do to make this function generic is to add a type parameter `T`:

```typescript
const createStringMap = <T>() => {
  return new Map();
};
```

With this change, our `createStringMap` function can now handle a type argument `T`.

The error has disappeared from the `numberMap` variable, but the function is still returning a `Map<any, any>`:

```typescript
const numberMap = createStringMap<number>();

// hovering over createStringMap shows:
const createStringMap: <number>() => Map<any, any>;
```

We need to specify the types for the map entries.

Since we know that the keys will always be strings, we'll set the first type argument of `Map` to `string`. For the values, we'll use our type parameter `T`:

```typescript
const createStringMap = <T>() => {
  return new Map<string, T>();
};
```

Now the function can correctly type the map's values.

If we don't pass in a type argument, the function will default to `unknown`:

```typescript
const objMap = createStringMap();

// hovering over objMap shows:
const objMap: Map<string, unknown>;
```

Through these steps, we've successfully transformed `createStringMap` from a regular function into a generic function capable of receiving type arguments.

### Solution 2: Default Type Arguments

The syntax for setting default types for generic functions is the same as for generic types:

```typescript
const createStringMap = <T = string>() => {
  return new Map<string, T>();
};
```

By using the `T = string` syntax, we tell the function that if no type argument is supplied, it should default to `string`.

Now when we call `createStringMap()` without a type argument, we end up with a `Map` where both keys and values are `string`:

```typescript
const stringMap = createStringMap();

// hovering over stringMap shows:
const stringMap: Map<string, string>;
```

If we attempt to assign a number as a value, TypeScript gives us an error because it expects a string:

```ts twoslash
// @errors: 2345
const createStringMap = <T = string>() => {
  return new Map<string, T>();
};

const stringMap = createStringMap();

// ---cut---
stringMap.set("bar", 123);
```

However, we can still override the default type by providing a type argument when calling the function:

```typescript
const numberMap = createStringMap<number>();
numberMap.set("foo", 123);
```

In the above code, `numberMap` will result in a `Map` with `string` keys and `number` values, and TypeScript will give an error if we try assigning a non-number value:

```typescript
numberMap.set(
  "bar",
  // @ts-expect-error
  true
);
```

### Solution 3: Inference in Generic Functions

The first step is to add a type parameter onto `uniqueArray`. This turns `uniqueArray` into a generic function that can receive type arguments:

```typescript
const uniqueArray = <T>(arr: any[]) => {
  return Array.from(new Set(arr));
};
```

Now when we hover over a call to `uniqueArray`, we can see that it is inferring the type as `unknown`:

```ts twoslash
const uniqueArray = <T>(arr: any[]) => {
  return Array.from(new Set(arr));
};

// ---cut---
const result = uniqueArray([1, 1, 2, 3, 4, 4, 5]);
//             ^?
```

This is because we haven't passed any type arguments to it. If there's no type argument and no default, it defaults to unknown.

We want the type argument to be inferred as a number because we know that the thing we're getting back is an array of numbers.

So what we'll do is add a return type of `T[]` to the function:

```typescript
const uniqueArray = <T>(arr: any[]): T[] => {
  return Array.from(new Set(arr));
};
```

Now the result of `uniqueArray` is inferred as an `unknown` array:

```ts twoslash
const uniqueArray = <T>(arr: any[]): T[] => {
  return Array.from(new Set(arr));
};

// ---cut---
const result = uniqueArray([1, 1, 2, 3, 4, 4, 5]);
//    ^?
```

Again, the reason for this is that we haven't passed any type arguments to it. If there's no type argument and no default, it defaults to unknown.

If we add a `<number>` type argument to the call, the `result` will now be inferred as a number array:

```ts twoslash
const uniqueArray = <T>(arr: any[]): T[] => {
  return Array.from(new Set(arr));
};
// ---cut---
const result = uniqueArray<number>([1, 1, 2, 3, 4, 4, 5]);
//       ^?
```

However, at this point there's no relationship between the things we're passing in and the thing we're getting out. Adding a type argument to the call returns an array of that type, but the `arr` parameter in the function itself is still typed as `any[]`.

What we need to do is tell TypeScript that the type of the `arr` parameter is the same type as what is passed in.

To do this, we'll replace `arr: any[]` with `arr: T[]`:

```typescript
const uniqueArray = <T>(arr: T[]): T[] => {
  ...
```

The function's return type is an array of `T`, where `T` represents the type of elements in the array supplied to the function.

Thus, TypeScript can infer the return type as `number[]` for an input array of numbers, or `string[]` for an input array of strings, even without explicit return type annotations. As we can see, the tests pass successfully:

```typescript
// number test
const result = uniqueArray([1, 1, 2, 3, 4, 4, 5]);

type test = Expect<Equal<typeof result, number[]>>;

// string test
const result = uniqueArray(["a", "b", "b", "c", "c", "c"]);

type test = Expect<Equal<typeof result, string[]>>;
```

If you explicitly pass a type argument, TypeScript will use it. If you don't, TypeScript attempts to infer it from the runtime arguments.

### Solution 4: Type Parameter Constraints

The syntax to add constraints is the same as what we saw for generic types.

We need to use the `extends` keyword to add constraints to the generic type parameter `TError`. The object passed in is required to have a `message` property of type `string`, and can optionally have a `code` of type `number`:

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

This change ensures that `addCodeToError` must be called with an object that includes a `message` string property. TypeScript also knows that `code` could either be a number or `undefined`. If `code` is absent, it will default to `UNKNOWN_CODE`.

These constraints make our tests pass, including the case where we pass in an extra `filepath` property. This is because using `extends` in generics does not restrict you to only passing in the properties defined in the constraint.

### Solution 5: Combining Generic Types and Functions

Here's the starting point of our `safeFunction`:

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

The first thing we'll do is update the `PromiseFunc` type to be a generic type. We'll call the type parameter `TResult` to represent the type of the value returned by the promise, and and it to the return type of the function:

```typescript
type PromiseFunc<TResult> = () => Promise<TResult>;
```

With this update, we now need to update the `PromiseFunc` in the `safeFunction` to include the type argument:

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

With these changes in place, when we hover over the `safeFunction` call in the first test, we can see that the type argument is inferred as `number` as expected:

```typescript
it("should return an error if the function throws", async () => {
  const func = safeFunction(async () => {
    if (Math.random() > 0.5) {
      throw new Error("Something went wrong");
    }
    return 123;
  });
  ...

// hovering over safeFunction shows:
const safeFunction: <number>(func: PromiseFunc<number>) => Promise<() => Promise<number | Error>>
```

The other tests pass as well.

Whatever we pass into `safeFunction` will be inferred as the type argument for `PromiseFunc`. This is because the type argument is being inferred _inside_ the generic function.

This combination of generic functions and generic types can make your generic functions a lot easier to read.

### Solution 6: Multiple Type Arguments in a Generic Function

Here's how `PromiseFunc` is currently defined:

```typescript
type PromiseFunc<TResult> = (...args: any[]) => Promise<TResult>;
```

The first thing to do is figure out the types of the arguments being passed in. Currently, they're set to one value, but they need to be different based on the type of function being passed in.

Instead of having `args` be of type `any[]`, we want to spread in all of the `args` and capture the entire array.

To do this, we'll update the type to be `TArgs`. Since `args` needs to be an array, we'll say that `TArgs extends any[]`. Note that this doesn't mean that `TArgs` will be typed as `any`, but rather that it will accept any kind of array:

```typescript
type PromiseFunc<TArgs extends any[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;
```

You might have tried this with `unknown[]` - but `any[]` is the only thing that works in this scenario.

Now we need to update the `safeFunction` so that it has the same arguments as `PromiseFunc`. To do this, we'll add `TArgs` to its type parameters.

Note that we also need to update the args for the `async` function to be of type `TArgs`:

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

This change is necessary in order to make sure the function returned by `safeFunction` has the same typed arguments as the original function.

With these changes, all of our tests pass as expected.

### Solution 8: Assertion Functions

The solution is to add a type annotation onto the return type of `assertIsAdminUser`.

If it was a type predicate, we would say `user is AdminUser`:

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

However, this leads to an error. We get this error because `assertIsAdminUser` is returning `void`, which is different from a type predicate that requires you to return a Boolean.

Instead, we need to add the `asserts` keyword to the return type:

```typescript
function assertIsAdminUser(user: User | AdminUser): asserts user is AdminUser {
  if (!("roles" in user)) {
    throw new Error("User is not an admin");
  }
}
```

By adding the `asserts` keyword, just by the fact that `assertIsAdminUser` is called we can assert that the user is an `AdminUser`. We don't need to put it inside an `if` statement or anywhere else.

With the `asserts` change in place, the `user` type is narrowed down to `AdminUser` after `assertIsAdminUser` is called and the test passes as expected:

```typescript
const handleRequest = (user: User | AdminUser) => {
  type test1 = Expect<Equal<typeof user, User | AdminUser>>;

  assertIsAdminUser(user);

  type test2 = Expect<Equal<typeof user, AdminUser>>;

  user.roles;
};

// hovering over roles shows:
user: AdminUser;
```
