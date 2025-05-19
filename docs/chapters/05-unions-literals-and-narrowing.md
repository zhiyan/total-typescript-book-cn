在本节中，我们将了解 TypeScript 如何帮助处理一个值可能是多种可能类型之一的情况。我们首先将看看如何使用联合类型声明这些类型，然后我们将看到 TypeScript 如何基于你的运行时代码缩小值的类型范围。

## 联合类型和字面量

### 联合类型

联合类型是 TypeScript 表示一个值可以是"这种类型或那种类型"的方式。

这种情况在 JavaScript 中经常出现。想象你有一个值，在星期二是`string`类型，但在其他时间是`null`：

```ts twoslash
const message = Date.now() % 2 === 0 ? "Hello Tuesdays!" : null;
//    ^?
```

如果我们悬停在`message`上，我们可以看到 TypeScript 已经推断出它的类型为`string | null`。

这是一个联合类型。它意味着`message`可以是`string`或`null`。

#### 声明联合类型

我们可以声明自己的联合类型。

例如，你可能有一个`id`，它可能是`string`或`number`：

```ts twoslash
const logId = (id: string | number) => {
  console.log(id);
};
```

这意味着`logId`可以接受`string`或`number`作为参数，但不能接受`boolean`：

```ts twoslash
// @errors: 2345
const logId = (id: string | number) => {
  console.log(id);
};
// ---cut---
logId("abc");

logId(123);

logId(true);
```

要创建联合类型，使用`|`运算符分隔类型。联合的每种类型称为联合的"成员"。

联合类型在创建自己的类型别名时也有效。例如，我们可以将前面的定义重构为类型别名：

```typescript
type Id = number | string;

function logId(id: Id) {
  console.log(id);
}
```

联合类型可以包含许多不同的类型 - 它们不必都是原始类型，也不需要以任何方式相关。当它们变得特别大时，你可以使用这种语法（在联合的第一个成员前使用`|`）使其更具可读性：

```typescript
type AllSortsOfStuff =
  | string
  | number
  | boolean
  | object
  | null
  | {
      name: string;
      age: number;
    };
```

联合类型可以以多种不同方式使用，它们是创建灵活类型定义的强大工具。

### 字面量类型

正如 TypeScript 允许我们从多种类型创建联合类型，它也允许我们创建表示特定原始值的类型。这些称为字面量类型。

字面量类型可用于表示具有特定值的字符串、数字或布尔值。

```typescript
type YesOrNo = "yes" | "no";
type StatusCode = 200 | 404 | 500;
type TrueOrFalse = true | false;
```

在`YesOrNo`类型中，`|`运算符用于创建字符串字面量`"yes"`和`"no"`的联合。这意味着`YesOrNo`类型的值只能是这两个字符串之一。

这个特性是我们在`document.addEventListener`等函数中看到的自动完成功能的动力：

```typescript
document.addEventListener(
  // DOMContentLoaded, mouseover, 等等
  "click",
  () => {}
);
```

`addEventListener`的第一个参数是字符串字面量的联合，这就是为什么我们可以获得不同事件类型的自动完成。

### 将联合与联合组合

当我们将两个联合类型组合成一个联合时会发生什么？它们组合在一起形成一个大联合。

例如，我们可以创建包含字面量值联合的`DigitalFormat`和`PhysicalFormat`类型：

```tsx
type DigitalFormat = "MP3" | "FLAC";

type PhysicalFormat = "LP" | "CD" | "Cassette";
```

然后我们可以将`AlbumFormat`指定为`DigitalFormat`和`PhysicalFormat`的联合：

```tsx
type AlbumFormat = DigitalFormat | PhysicalFormat;
```

现在，我们可以使用`DigitalFormat`类型处理数字格式的函数，使用`AnalogFormat`类型处理模拟格式的函数。`AlbumFormat`类型可用于处理所有情况的函数。

这样，我们可以确保每个函数只处理它应该处理的情况，如果我们尝试将不正确的格式传递给函数，TypeScript 将抛出错误。

```ts twoslash
// @errors: 2345
type PhysicalFormat = "LP" | "CD" | "Cassette";
// ---cut---
const getAlbumFormats = (format: PhysicalFormat) => {
  // 函数体
};

getAlbumFormats("MP3");
```

### 练习

#### 练习 1：`string`或`null`

这里我们有一个名为`getUsername`的函数，它接受一个`username`字符串。如果`username`不等于`null`，我们返回一个新的插值字符串。否则，我们返回`"Guest"`：

```typescript
function getUsername(username: string) {
  if (username !== null) {
    return `User: ${username}`;
  } else {
    return "Guest";
  }
}
```

在第一个测试中，我们调用`getUsername`并传入字符串"Alice"，这按预期通过。然而，在第二个测试中，当将`null`传递给`getUsername`时，我们在`null`下面有一条红色波浪线：

```ts twoslash
// @errors: 2345
import { Equal, Expect } from "@total-typescript/helpers";

function getUsername(username: string) {
  if (username !== null) {
    return `User: ${username}`;
  } else {
    return "Guest";
  }
}

// ---cut---
const result = getUsername("Alice");

type test = Expect<Equal<typeof result, string>>;

const result2 = getUsername(null);

type test2 = Expect<Equal<typeof result2, string>>;
```

通常我们不会明确地用`null`调用`getUsername`函数，但在这种情况下，处理`null`值很重要。例如，我们可能从数据库中的用户记录获取`username`，用户可能有也可能没有名字，这取决于他们如何注册。

目前，`username`参数只接受`string`类型，对`null`的检查没有任何作用。更新函数参数的类型，使错误得到解决，函数可以处理`null`。

<Exercise title="练习1：`string`或`null`" filePath="/src/018-unions-and-narrowing/053-introduction-to-unions.problem.ts"></Exercise>

#### 练习 2：限制函数参数

这里我们有一个`move`函数，它接受一个类型为 string 的`direction`和一个类型为 number 的`distance`：

```tsx
function move(direction: string, distance: number) {
  // 在给定方向上移动指定距离
}
```

函数的实现不重要，但想法是我们希望能够向上、向下、向左或向右移动。

调用`move`函数可能如下所示：

```typescript
move("up", 10);

move("left", 5);
```

为了测试这个函数，我们有一些`@ts-expect-error`指令，告诉 TypeScript 我们期望以下行抛出错误。

然而，由于`move`函数目前接受`string`作为`direction`参数，我们可以传入任何我们想要的字符串，即使它不是有效的方向。还有一个测试，我们期望传递`20`作为距离不会起作用，但它也被接受了。

这导致 TypeScript 在`@ts-expect-error`指令下画红色波浪线：

```ts twoslash
// @errors: 2578
function move(direction: string, distance: number) {
  // 在给定方向上移动指定距离
}
// ---cut---
move(
  // @ts-expect-error - "up-right"不是有效方向
  "up-right",
  10
);

move(
  // @ts-expect-error - "down-left"不是有效方向
  "down-left",
  20
);
```

你的挑战是更新`move`函数，使其只接受字符串`"up"`、`"down"`、`"left"`和`"right"`。这样，当我们尝试传入任何其他字符串时，TypeScript 将抛出错误。

<Exercise title="练习2：限制函数参数" filePath="/src/018-unions-and-narrowing/054-literal-types.problem.ts"></Exercise>

#### 解决方案 1：`string`或`null`

解决方案是将`username`参数更新为`string`和`null`的联合：

```typescript
function getUsername(username: string | null) {
  // 函数体
}
```

有了这个更改，`getUsername`函数现在将接受`null`作为`username`参数的有效值，错误将得到解决。

#### 解决方案 2：限制函数参数

为了限制`direction`可以是什么，我们可以使用字面量值的联合类型（在这种情况下是字符串）。

这看起来像这样：

```typescript
function move(direction: "up" | "down" | "left" | "right", distance: number) {
  // 在给定方向上移动指定距离
}
```

有了这个更改，我们现在可以为可能的`direction`值自动完成。

为了整理一下，我们可以创建一个名为`Direction`的新类型别名并相应地更新参数：

```typescript
type Direction = "up" | "down" | "left" | "right";

function move(direction: Direction, distance: number) {
  // 在给定方向上移动指定距离
}
```

## 类型收窄

### 更宽与更窄的类型

一些类型是其他类型的更宽版本。例如，`string`比字面量字符串`"small"`更宽。这是因为`string`可以是任何字符串，而`"small"`只能是字符串`"small"`。

反过来，我们可能会说`"small"`是比`string`"更窄"的类型。它是字符串的更具体版本。`404`是比`number`更窄的类型，`true`是比`boolean`更窄的类型。

这只适用于具有某种共享关系的类型。例如，`"small"`不是`number`的更窄版本 - 因为`"small"`本身不是数字。

在 TypeScript 中，类型的更窄版本总是可以取代更宽版本的位置。

例如，如果一个函数接受`string`，我们可以传入`"small"`：

```typescript
const logSize = (size: string) => {
  console.log(size.toUpperCase());
};

logSize("small");
```

但如果一个函数接受`"small"`，我们不能传入任何随机的`string`：

```ts twoslash
// @errors: 2345
const recordOfSizes = {
  small: "small",
  large: "large",
};

const logSize = (size: "small" | "large") => {
  console.log(recordOfSizes[size]);
};

logSize("medium");
```

如果你熟悉集合论中"子类型"和"超类型"的概念，这是一个类似的想法。`"small"`是`string`的子类型（它更具体），而`string`是`"small"`的超类型。

### 联合类型比其成员更宽

联合类型比其成员更宽。例如，`string | number`比单独的`string`或`number`更宽。

这意味着我们可以将`string`或`number`传递给接受`string | number`的函数：

```typescript
function logId(id: string | number) {
  console.log(id);
}

logId("abc");
logId(123);
```

然而，这在反向不起作用。我们不能将`string | number`传递给只接受`string`的函数。

例如，如果我们将这个`logId`函数更改为只接受`number`，当我们尝试将`string | number`传递给它时，TypeScript 将抛出错误：

```ts twoslash
// @errors: 2345
function logId(id: number) {
  console.log(`The id is ${id}`);
}

type User = {
  id: string | number;
};

const user: User = {
  id: 123,
};

logId(user.id);
```

悬停在`user.id`上显示：

```
类型'string | number'的参数不能赋给类型'number'的参数。
  类型'string'不能赋给类型'number'。
```

所以，将联合类型视为比其成员更宽的类型很重要。

### 什么是类型收窄？

TypeScript 中的类型收窄让我们可以使用运行时代码将更宽的类型变得更窄。

当我们想要根据值的类型做不同的事情时，这可能很有用。例如，我们可能想要以不同于`number`的方式处理`string`，或者以不同于`"large"`的方式处理`"small"`。

### 使用`typeof`进行类型收窄

我们可以缩小值类型范围的一种方法是使用`typeof`运算符，结合`if`语句。

考虑一个`getAlbumYear`函数，它接受一个参数`year`，可以是`string`或`number`。以下是我们如何使用`typeof`运算符来缩小`year`的类型范围：

```typescript
const getAlbumYear = (year: string | number) => {
  if (typeof year === "string") {
    console.log(`The album was released in ${year.toUppercase()}.`); // `year`是string
  } else if (typeof year === "number") {
    console.log(`The album was released in ${year.toFixed(0)}.`); // `year`是number
  }
};
```

这看起来很简单，但关于幕后发生的事情，有一些重要的事情需要意识到。

作用域在类型收窄中起着重要作用。在第一个`if`块中，TypeScript 理解`year`是`string`，因为我们使用了`typeof`运算符检查其类型。在`else if`块中，TypeScript 理解`year`是`number`，因为我们使用了`typeof`运算符检查其类型。

<!-- 这里有插图吗？ -->

这让我们可以在`year`是`string`时调用`toUpperCase`，在`year`是`number`时调用`toFixed`。

然而，在条件块之外的任何地方，`year`的类型仍然是联合`string | number`。这是因为类型收窄只适用于块的作用域内。

为了说明，如果我们向`year`联合添加一个`boolean`，第一个`if`块仍将以`string`类型结束，但`else`块将以`number | boolean`类型结束：

```typescript
const getAlbumYear = (year: string | number | boolean) => {
  if (typeof year === "string") {
    console.log(`The album was released in ${year}.`); // `year`是string
  } else if (typeof year === "number") {
    console.log(`The album was released in ${year}.`); // `year`是number | boolean
  }

  console.log(year); // `year`是string | number | boolean
};
```

这是 TypeScript 如何读取你的运行时代码并使用它来缩小值类型范围的强大示例。

### 其他类型收窄方式

`typeof`运算符只是缩小类型范围的一种方式。

TypeScript 可以使用其他条件运算符，如`&&`和`||`，并将真实性考虑在内，用于强制转换布尔值。也可以使用其他运算符，如`instanceof`和`in`来检查对象属性。你甚至可以抛出错误或使用提前返回来缩小类型范围。

我们将在以下练习中更详细地了解这些。

### 练习

#### 练习 1：使用`if`语句进行类型收窄

这里我们有一个名为`validateUsername`的函数，它接受`string`或`null`，并始终返回`boolean`：

```ts twoslash
// @errors: 18047
function validateUsername(username: string | null): boolean {
  return username.length > 5;

  return false;
}
```

检查用户名长度的测试按预期通过：

```typescript
it("should return true for valid usernames", () => {
  expect(validateUsername("Matt1234")).toBe(true);

  expect(validateUsername("Alice")).toBe(false);

  expect(validateUsername("Bob")).toBe(false);
});
```

然而，我们在函数体内的`username`下面有一个错误，因为它可能是`null`，我们正在尝试访问它的一个属性。

```typescript
it("Should return false for null", () => {
  expect(validateUsername(null)).toBe(false);
});
```

你的任务是重写`validateUsername`函数，添加类型收窄，使`null`情况得到处理，所有测试都通过。

<Exercise title="练习1：使用`if`语句进行类型收窄" filePath="/src/018-unions-and-narrowing/059-narrowing-with-if-statements.problem.ts"></Exercise>

#### 练习 2：抛出错误进行类型收窄

这里我们有一行代码，使用`document.getElementById`获取 HTML 元素，它可以返回`HTMLElement`或`null`：

```typescript
const appElement = document.getElementById("app");
```

目前，测试`appElement`是否为`HTMLElement`失败：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";

const appElement = document.getElementById("app");

// ---cut---
type Test = Expect<Equal<typeof appElement, HTMLElement>>;
```

你的任务是使用`throw`在测试检查之前缩小`appElement`的类型范围。

#### Exercise 3: Using `in` to Narrow

Here we have a `handleResponse` function that takes in a type of `APIResponse`, which is a union of two types of objects.

The goal of the `handleResponse` function is to check whether the provided object has a `data` property. If it does, the function should return the `id` property. If not, it should throw an `Error` with the message from the `error` property.

```tsx
type APIResponse =
  | {
      data: {
        id: string;
      };
    }
  | {
      error: string;
    };

const handleResponse = (response: APIResponse) => {
  // How do we check if 'data' is in the response?

  if (true) {
    return response.data.id;
  } else {
    throw new Error(response.error);
  }
};
```

Currently, there are several errors being thrown as seen in the following tests.

The first error is `Property 'data' does not exist on type 'APIResponse'`

```tsx
test("passes the test even with the error", () => {
  // there is no error in runtime

  expect(() =>
    HandleResponseOrThrowError({
      error: "Invalid argument",
    })
  ).not.toThrowError();

  // but the data is returned, instead of an error.

  expect(
    HandleResponseOrThrowError({
      error: "Invalid argument",
    })
  ).toEqual("Should this be 'Error'?");
});
```

Then we have the inverse error, where `Property 'error' does not exist on type 'APIResponse'`:

```
Property data does not exist on type 'APIResponse'.
```

Your challenge is to find the correct syntax for narrowing down the types within the `handleResponse` function's `if` condition.

The changes should happen inside of the function without modifying any other parts of the code.

<Exercise title="Exercise 3: Using `in` to Narrow" filePath="/src/018-unions-and-narrowing/064-narrowing-with-in-statements.problem.ts"></Exercise>

#### Solution 1: Narrowing with `if` Statements

There are several different ways to validate the username length.

##### Option 1: Check Truthiness

We could use an `if` statement to check if `username` is truthy. If it does, we can return `username.length > 5`, otherwise we can return `false`:

```typescript
function validateUsername(username: string | null): boolean {
  // Rewrite this function to make the error go away

  if (username) {
    return username.length > 5;
  }

  return false;
}
```

There is a catch to this piece of logic. If `username` is an empty string, it will return `false` because an empty string is falsy. This happens to match the behavior we want for this exercise - but it's important to bear that in mind.

##### Option 2: Check if `typeof username` is `"string"`

We could use `typeof` to check if the username is a string:

```typescript
function validateUsername(username: string | null): boolean {
  if (typeof username === "string") {
    return username.length > 5;
  }

  return false;
}
```

This avoids the issue with empty strings.

##### Option 3: Check if `typeof username` is not `"string"`

Similar to the above, we could check if `typeof username !== "string"`.

In this case, if `username` is not a string, we know it's `null` and could return `false` right away. Otherwise, we'd return the check for length being greater than 5:

```typescript
function validateUsername(username: string | null | undefined): boolean {
  if (typeof username !== "string") {
    return false;
  }

  return username.length > 5;
}
```

This shows that TypeScript understands the _reverse_ of a check. Very smart.

##### Option 4: Check if `typeof username` is `"object"`

A odd JavaScript quirk is that the type of `null` is equal to `"object"`.

TypeScript knows this, so we can actually use it to our advantage. We can check if `username` is an object, and if it is, we can return `false`:

```typescript
function validateUsername(username: string | null): boolean {
  if (typeof username === "object") {
    return false;
  }

  return username.length > 5;
}
```

##### Option 5: Extract the check into its own variable

Finally, for readability and reusability purposes you could store the check in its own variable `isUsernameOK`.

Here's what this would look like:

```typescript
function validateUsername(username: string | null): boolean {
  const isUsernameOK = typeof username === "string";

  if (isUsernameOK) {
    return username.length > 5;
  }

  return false;
}
```

TypeScript is smart enough to understand that the value of `isUsernameOK` corresponds to whether `username` is a string or not. Very smart.

All of the above options use `if` statements to perform checks by narrowing types by using `typeof`.

No matter which option you go with, remember that you can always use an `if` statement to narrow your type and add code to the case that the condition passes.

#### Solution 2: Throwing Errors to Narrow

The issue with this code is that `document.getElementById` returns `null | HTMLElement`. But we want to make sure that `appElement` is an `HTMLElement` before we use it.

We are pretty sure that `appElement` exists. If it doesn't exist, we probably want to crash the app early so that we can get an informative error about what's gone wrong.

So, we can add an `if` statement that checks if `appElement` is falsy, then throws an error:

```typescript
if (!appElement) {
  throw new Error("Could not find app element");
}
```

By adding this error condition, we can be sure that we will never reach any subsequent code if `appElement` is `null`.

If we hover over `appElement` after the `if` statement, we can see that TypeScript now knows that `appElement` is an `HTMLElement` - it's no longer `null`. This means our test also now passes:

```ts twoslash
import { Equal, Expect } from "@total-typescript/helpers";

const appElement = document.getElementById("app");

if (!appElement) {
  throw new Error("Could not find app element");
}

// ---cut---
console.log(appElement);
//          ^?

type Test = Expect<Equal<typeof appElement, HTMLElement>>; // passes
```

Throwing errors like this can help you identify issues at runtime. In this specific case, it narrows down the code _outside_ of the immediate `if` statement scope. Amazing.

#### Solution 3: Using `in` to Narrow

Your first instinct will be to check if `response.data` is truthy.

```ts twoslash
// @errors: 2339
type APIResponse =
  | {
      data: {
        id: string;
      };
    }
  | {
      error: string;
    };

// ---cut---
const handleResponse = (response: APIResponse) => {
  if (response.data) {
    return response.data.id;
  } else {
    throw new Error(response.error);
  }
};
```

But you'll get an error. This is because `response.data` is only available on one of the members of the union. TypeScript doesn't know that `response` is the one with `data` on it.

##### Option 1: Changing the Type

It may be tempting to change the `APIResponse` type to add `.data` to both branches:

```tsx
type APIResponse =
  | {
      data: {
        id: string;
      };
    }
  | {
      data?: undefined;
      error: string;
    };
```

This is certainly one way to handle it. But there is a built-in way to do it.

##### Option 2: Using `in`

We can use an `in` operator to check if a specific key exists on `response`.

In this example, it would check for the key `data`:

```ts twoslash
type APIResponse =
  | {
      data: {
        id: string;
      };
    }
  | {
      error: string;
    };

// ---cut---
const handleResponse = (response: APIResponse) => {
  if ("data" in response) {
    return response.data.id;
  } else {
    throw new Error(response.error);
  }
};
```

If the `response` isn't the one with `data` on it, then it must be the one with `error`, so we can throw an `Error` with the error message.

You can check this out by hovering over `.data` and `.error` in each of the branches of the `if` statement. TypeScript will show you that it knows the type of `response` in each case.

Using `in` here gives us a great way to narrow down objects that might have different keys from one another.

## `unknown` and `never`

Let's pause for a moment to introduce a couple more types that play an important role in TypeScript, particularly when we talk about 'wide' and 'narrow' types.

### The Widest Type: `unknown`

TypeScript's widest type is `unknown`. It represents something that we don't know what it is.

If you imagine a scale whether the widest types are at the top and the narrowest types are at the bottom, `unknown` is at the top. All other types like strings, numbers, booleans, null, undefined, and their respective literals are assignable to `unknown`, as seen in its assignability chart:

<img src="https://res.cloudinary.com/total-typescript/image/upload/v1706814781/065-introduction-to-unknown.explainer_ohm9pd.png">

Consider this example function `fn` that takes in an `input` parameter of type `unknown`:

```ts twoslash
const fn = (input: unknown) => {};

// Anything is assignable to unknown!
fn("hello");
fn(42);
fn(true);
fn({});
fn([]);
fn(() => {});
```

All of the above function calls are valid because `unknown` is assignable to any other type

The `unknown` type is the preferred choice when you want to represent something that's truly unknown in JavaScript. For example, it is extremely useful when you have things coming into your application from outside sources, like input from a form or a call to a webhook.

#### What's the Difference Between `unknown` and `any`?

You might be wondering what the difference is between `unknown` and `any`. They're both wide types, but there's a key difference.

`any` doesn't really fit into our definition of 'wide' and 'narrow' types. It breaks the type system. It's not really a type at all - it's a way of opting out of TypeScript's type checking.

`any` can be assigned to anything, and anything can be assigned to `any`. `any` is both narrower and wider than every other type.

`unknown`, on the other hand, is part of TypeScript's type system. It's wider than every other type, so it can't be assigned to anything.

```ts twoslash
// @errors: 18046
const handleWebhookInput = (input: unknown) => {
  input.toUppercase();
};

const handleWebhookInputWithAny = (input: any) => {
  // no error
  input.toUppercase();
};
```

This means that `unknown` is a safe type, but `any` is not. `unknown` means "I don't know what this is", while `any` means "I don't care what this is".

### The Narrowest Type: `never`

If `unknown` is the widest type in TypeScript, `never` is the narrowest.

`never` represents something that will _never_ happen. It's the very bottom of the type hierarchy.

You'll rarely use a `never` type annotation yourself. Instead, it'll pop up in error messages and hovers - often when narrowing.

But first, let's look at a simple example of a `never` type:

#### `never` vs `void`

Let's consider a function that never returns anything:

```typescript
const getNever = () => {
  // This function never returns!
};
```

When hovering this function, TypeScript will infer that it returns `void`, indicating that it essentially returns nothing.

```typescript
// hovering over `getNever` shows:

const getNever: () => void;
```

However, if we throw an error inside of the function, the function will _never_ return:

```typescript
const getNever = () => {
  throw new Error("This function never returns");
};
```

With this change, TypeScript will infer that the function's type is `never`:

```typescript
// hovering over `getNever` shows:

const getNever: () => never;
```

The `never` type represents something that can never happen.

There are some weird implications for the `never` type.

You cannot assign anything to `never`, except for `never` itself.

```ts twoslash
// @errors: 2345
const getNever = () => {
  throw new Error("This function never returns");
};
// ---cut---
const fn = (input: never) => {};

fn("hello");
fn(42);
fn(true);
fn({});
fn([]);
fn(() => {});

// no error here, since we're assigning `never` to `never`

fn(getNever());
```

However, you can assign `never` to anything:

```typescript
const str: string = getNever();

const num: number = getNever();

const bool: boolean = getNever();

const arr: string[] = getNever();
```

This behavior looks extremely odd at first - but we'll see later why it's useful.

Let's update our chart to include `never`:

![assignability chart with never](https://res.cloudinary.com/total-typescript/image/upload/v1706814786/067-introduction-to-never.explainer_ktradt.png)

This gives us pretty much the full picture of TypeScript's type hierarchy.

### Exercises

#### Exercise 1: Narrowing Errors with `instanceof`

In TypeScript, one of the most common places you'll encounter the `unknown` type is when using a `try...catch` statement to handle potentially dangerous code. Let's consider an example:

```ts twoslash
// @errors: 18046
const somethingDangerous = () => {
  if (Math.random() > 0.5) {
    throw new Error("Something went wrong");
  }

  return "all good";
};

try {
  somethingDangerous();
} catch (error) {
  if (true) {
    console.error(error.message);
  }
}
```

In the code snippet above, we have a function called `somethingDangerous` that has a 50/50 chance of either throwing an error.

Notice that the `error` variable in the `catch` clause is typed as `unknown`.

Now let's say we want to log the error using `console.error()` only if the error contains a `message` attribute. We know that errors typically come with a `message` attribute, like in the following example:

```typescript
const error = new Error("Some error message");

console.log(error.message);
```

Your task is to update the `if` statement to have the proper condition to check if the `error` has a message attribute before logging it. Check the title of the exercise to get a hint... And remember, `Error` is a class.

<Exercise title="Exercise 1: Narrowing Errors with `instanceof`" filePath="/src/018-unions-and-narrowing/065.5-narrowing-with-instanceof-statements.problem.ts"></Exercise>

#### Exercise 2: Narrowing `unknown` to a Value

Here we have a `parseValue` function that takes in a `value` of type `unknown`:

```ts twoslash
// @errors: 18046
const parseValue = (value: unknown) => {
  if (true) {
    return value.data.id;
  }

  throw new Error("Parsing error!");
};
```

The goal of this function is to return the `id` property of the `data` property of the `value` object. If the `value` object doesn't have a `data` property, then it should throw an error.

Here are some tests for the function that show us the amount of narrowing that needs to be done inside of the `parseValue` function:

```typescript
it("Should handle a { data: { id: string } }", () => {
  const result = parseValue({
    data: {
      id: "123",
    },
  });

  type test = Expect<Equal<typeof result, string>>;

  expect(result).toBe("123");
});

it("Should error when anything else is passed in", () => {
  expect(() => parseValue("123")).toThrow("Parsing error!");

  expect(() => parseValue(123)).toThrow("Parsing error!");
});
```

Your challenge is to modify the `parseValue` function so that the tests pass and the errors go away. I want you to challenge yourself to do this _only_ by narrowing the type of `value` inside of the function. No changes to the types. This will require a very large `if` statement!

<Exercise title="Exercise 2: Narrowing `unknown` to a Value" filePath="/src/018-unions-and-narrowing/066-narrowing-unknown-to-a-value.problem.ts"></Exercise>

#### Exercise 3: Reusable Type Guards

Let's imagine that we have two functions which both take in a `value` of type `unknown`, and attempt to parse that value to an array of strings.

Here's the first function, which joins an array of names together into a single string:

```typescript
const joinNames = (value: unknown) => {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value.join(" ");
  }

  throw new Error("Parsing error!");
};
```

And here's the second function, which maps over the array of names and adds a prefix to each one:

```typescript
const createSections = (value: unknown) => {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value.map((item) => `Section: ${item}`);
  }

  throw new Error("Parsing error!");
};
```

Both functions have the same conditional check:

```ts
if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
```

This is a great opportunity to create a reusable type guard.

All the tests are currently passing. Your job is to try to refactor the two functions to use a reusable type guard, and remove the duplicated code. As it turns out, TypeScript makes this a lot easier than you expect.

<Exercise title="Exercise 3: Reusable Type Guards" filePath="/src/018-unions-and-narrowing/072.5-reusable-type-guards.problem.ts"></Exercise>

#### Solution 1: Narrowing Errors with `instanceof`

The way to solve this challenge is to narrow the `error` using the `instanceof` operator.

Where we check the error message, we'll check if `error` is an instance of the class `Error`:

```typescript
if (error instanceof Error) {
  console.log(error.message);
}
```

The `instanceof` operator covers other classes which inherit from the `Error` class as well, such as `TypeError`.

In this case, we're logging the error message to the console - but this could be used to display something different in our applications, or to log the error to an external service.

Even though it works in this particular example for all kinds of `Error`s, it won't cover us for the strange case where someone throws a non-`Error` object.

```typescript
throw "This is not an error!";
```

To be more safe from these edge cases, it's a good idea to include an `else` block that would throw the `error` variable like so:

```typescript
if (error instanceof Error) {
  console.log(error.message);
} else {
  throw error;
}
```

Using this technique, we can handle the error in a safe way and avoid any potential runtime errors.

#### Solution 2: Narrowing `unknown` to a Value

Here's our starting point:

```ts twoslash
// @errors: 18046
const parseValue = (value: unknown) => {
  if (true) {
    return value.data.id;
  }

  throw new Error("Parsing error!");
};
```

To fix the error, we'll need to narrow the type using conditional checks. Let's take it step-by-step.

First, we'll check if the type of `value` is an `object` by replacing the `true` with a type check:

```ts twoslash
// @errors: 18047 2339
const parseValue = (value: unknown) => {
  if (typeof value === "object") {
    return value.data.id;
  }

  throw new Error("Parsing error!");
};
```

Then we'll check if the `value` argument has a `data` attribute using the `in` operator:

```ts twoslash
// @errors: 18047 18046
const parseValue = (value: unknown) => {
  if (typeof value === "object" && "data" in value) {
    return value.data.id;
  }

  throw new Error("Parsing error!");
};
```

With this change, TypeScript is complaining that `value` is possibly `null`. This is because, of course, `typeof null` is `"object"`. Thanks, JavaScript!

To fix this, we can add `&& value` to our first condition to make sure it isn't `null`:

```ts twoslash
// @errors: 18046
const parseValue = (value: unknown) => {
  if (typeof value === "object" && value && "data" in value) {
    return value.data.id;
  }

  throw new Error("Parsing error!");
};
```

Now our condition check is passing, but we're still getting an error on `value.data` being typed as `unknown`.

What we need to do now is to narrow the type of `value.data` to an `object` and make sure that it isn't `null`. At this point we'll also add specify a return type of `string` to avoid returning an `unknown` type:

```ts twoslash
// @errors: 2339
const parseValue = (value: unknown): string => {
  if (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    typeof value.data === "object" &&
    value.data !== null
  ) {
    return value.data.id;
  }

  throw new Error("Parsing error!");
};
```

Finally, we'll add a check to ensure that the `id` is a string. If not, TypeScript will throw an error:

```typescript
const parseValue = (value: unknown): string => {
  if (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    typeof value.data === "object" &&
    value.data !== null &&
    "id" in value.data &&
    typeof value.data.id === "string"
  ) {
    return value.data.id;
  }

  throw new Error("Parsing error!");
};
```

Now when we hover over `parseValue`, we can see that it takes in an `unknown` input and always returns a `string`:

```typescript
// hovering over `parseValue` shows:

const parseValue: (value: unknown) => string;
```

Thanks to this huge conditional, our tests pass, and our error messages are gone!

This is usually _not_ how you'd want to write your code. It's a bit of a mess. You could use a library like [Zod](https://zod.dev) to do this with a much nicer API. But it's a great way to understand how `unknown` and narrowing work in TypeScript.

#### Solution 3: Reusable Type Guards

The first step is to create a function called `isArrayOfStrings` that captures the conditional check:

```typescript
const isArrayOfStrings = (value) => {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
};
```

We haven't given `value` a type here - `unknown` makes sense, because it could be anything.

Now we can refactor the two functions to use this type guard:

```typescript
const joinNames = (value: unknown) => {
  if (isArrayOfStrings(value)) {
    return value.join(" ");
  }

  throw new Error("Parsing error!");
};

const createSections = (value: unknown) => {
  if (isArrayOfStrings(value)) {
    return value.map((item) => `Section: ${item}`);
  }

  throw new Error("Parsing error!");
};
```

Incredibly, this is all TypeScript needs to be able to narrow the type of `value` inside of the `if` statement. It's smart enough to understand that `isArrayOfStrings` being called on `value` ensures that `value` is an array of strings.

We can observe this by hovering over `isArrayOfStrings`:

```typescript
// hovering over `isArrayOfStrings` shows:
const isArrayOfStrings: (value: unknown) => value is string[];
```

This return type we're seeing is a type predicate. It's a way of saying "if this function returns `true`, then the type of the value is `string[]`".

We'll look at authoring our own type predicates in one of the later chapters in the book - but it's very useful that TypeScript infers its own.

## Discriminated Unions

In this section we'll look at a common pattern TypeScript developers use to structure their code. It's called a 'discriminated union'.

To understand what a discriminated union is, let's first look at the problem it solves.

### The Problem: The Bag Of Optionals

Let's imagine we are modelling a data fetch. We have a `State` type with a `status` property which can be in one of three states: `loading`, `success`, or `error`.

```typescript
type State = {
  status: "loading" | "success" | "error";
};
```

This is useful, but we also need to capture some extra data. The data coming back from the fetch, or the error message if the fetch fails.

We could add an `error` and `data` property to the `State` type:

```typescript
type State = {
  status: "loading" | "success" | "error";
  error?: string;
  data?: string;
};
```

And let's imagine we have a `renderUI` function that returns a string based on the input.

```ts twoslash
// @errors: 18048
type State = {
  status: "loading" | "success" | "error";
  error?: string;
  data?: string;
};
// ---cut---
const renderUI = (state: State) => {
  if (state.status === "loading") {
    return "Loading...";
  }

  if (state.status === "error") {
    return `Error: ${state.error.toUpperCase()}`;
  }

  if (state.status === "success") {
    return `Data: ${state.data}`;
  }
};
```

This all looks good, except for the error we're getting on `state.error`. TypeScript is telling us that `state.error` could be `undefined`, and we can't call `toUpperCase` on `undefined`.

This is because we've declared our `State` type in an incorrect way. We've made it so the `error` and `data` properties are _not related to the statuses where they occur_. In other words, it's possible to create types which will never happen in our app:

```typescript
const state: State = {
  status: "loading",
  error: "This is an error", // should not happen on "loading!"
  data: "This is data", // should not happen on "loading!"
};
```

I'd describe this type as a "bag of optionals". It's a type that's too loose. We need to tighten it up so that `error` can only happen on `error`, and `data` can only happen on `success`.

### The Solution: Discriminated Unions

The solution is to turn our `State` type into a discriminated union.

A discriminated union is a type that has a common property, the 'discriminant', which is a literal type that is unique to each member of the union.

In our case, the `status` property is the discriminant.

Let's take each status and separate them into separate object literals:

```typescript
type State =
  | {
      status: "loading";
    }
  | {
      status: "error";
    }
  | {
      status: "success";
    };
```

Now, we can associate the `error` and `data` properties with the `error` and `success` statuses respectively:

```typescript
type State =
  | {
      status: "loading";
    }
  | {
      status: "error";
      error: string;
    }
  | {
      status: "success";
      data: string;
    };
```

Now, if we hover over `state.error` in the `renderUI` function, we can see that TypeScript knows that `state.error` is a `string`:

```ts twoslash
type State =
  | {
      status: "loading";
    }
  | {
      status: "error";
      error: string;
    }
  | {
      status: "success";
      data: string;
    };

// ---cut---
const renderUI = (state: State) => {
  if (state.status === "loading") {
    return "Loading...";
  }

  if (state.status === "error") {
    return `Error: ${state.error.toUpperCase()}`;
    //                     ^?
  }

  if (state.status === "success") {
    return `Data: ${state.data}`;
  }
};
```

This is due to TypeScript's narrowing - it knows that `state.status` is `"error"`, so it knows that `state.error` is a `string` inside of the `if` block.

To clean up our original type, we could use a type alias for each of the statuses:

```typescript
type LoadingState = {
  status: "loading";
};

type ErrorState = {
  status: "error";
  error: string;
};

type SuccessState = {
  status: "success";
  data: string;
};

type State = LoadingState | ErrorState | SuccessState;
```

So if you're noticing that your types are resembling 'bags of optionals', it's a good idea to consider using a discriminated union.

### Exercises

#### Exercise 1: Destructuring a Discriminated Union

Consider a discriminated union called `Shape` that is made up of two types: `Circle` and `Square`. Both types have a `kind` property that acts as the discriminant.

```tsx
type Circle = {
  kind: "circle";
  radius: number;
};

type Square = {
  kind: "square";
  sideLength: number;
};

type Shape = Circle | Square;
```

This `calculateArea` function destructures the `kind`, `radius`, and `sideLength` properties from the `Shape` that is passed in, and calculates the area of the shape accordingly:

```ts twoslash
// @errors: 2339
type Circle = {
  kind: "circle";
  radius: number;
};

type Square = {
  kind: "square";
  sideLength: number;
};

type Shape = Circle | Square;

// ---cut---
function calculateArea({ kind, radius, sideLength }: Shape) {
  if (kind === "circle") {
    return Math.PI * radius * radius;
  } else {
    return sideLength * sideLength;
  }
}
```

However, TypeScript is showing us errors below `'radius'` and `'sideLength'`.

Your task is to update the implementation of the `calculateArea` function so that destructuring properties from the passed in `Shape` works without errors. Hint: the examples I showed in the chapter _didn't_ use destructuring, but some destructuring is possible.

<Exercise title="Exercise 1: Destructuring a Discriminated Union" filePath="/src/018-unions-and-narrowing/075-destructuring-a-discriminated-union.problem.ts"></Exercise>

#### Exercise 2: Narrowing a Discriminated Union with a Switch Statement

Here we have our `calculateArea` function from the previous exercise, but without any destructuring.

```typescript
function calculateArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius * shape.radius;
  } else {
    return shape.sideLength * shape.sideLength;
  }
}
```

Your challenge is to refactor this function to use a `switch` statement instead of the `if/else` statement. The `switch` statement should be used to narrow the type of `shape` and calculate the area accordingly.

<Exercise title="Exercise 2: Narrowing a Discriminated Union with a Switch Statement" filePath="/src/018-unions-and-narrowing/076-narrowing-a-discriminated-union-with-a-switch-statement.problem.ts"></Exercise>

#### Exercise 3: Discriminated Tuples

Here we have a `fetchData` function that returns a promise that resolves to an `APIResponse` tuple that consists of two elements.

The first element is a string that indicates the type of the response. The second element can be either an array of `User` objects in the case of successful data retrieval, or a string in the event of an error:

```ts
type APIResponse = [string, User[] | string];
```

Here's what the `fetchData` function looks like:

```typescript
async function fetchData(): Promise<APIResponse> {
  try {
    const response = await fetch("https://api.example.com/data");

    if (!response.ok) {
      return [
        "error",
        // Imagine some improved error handling here
        "An error occurred",
      ];
    }

    const data = await response.json();

    return ["success", data];
  } catch (error) {
    return ["error", "An error occurred"];
  }
}
```

However, as seen in the tests below, the `APIResponse` type currently will allow for other combinations that aren't what we want. For example, it would allow for passing an error message when data is being returned:

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";

type User = {
  id: number;
  name: string;
};

type APIResponse = [string, User[] | string];

async function fetchData(): Promise<APIResponse> {
  try {
    const response = await fetch("https://api.example.com/data");

    if (!response.ok) {
      return [
        "error",
        // Imagine some improved error handling here
        "An error occurred",
      ];
    }

    const data = await response.json();

    return ["success", data];
  } catch (error) {
    return ["error", "An error occurred"];
  }
}
// ---cut---
async function exampleFunc() {
  const [status, value] = await fetchData();

  if (status === "success") {
    console.log(value);

    type test = Expect<Equal<typeof value, User[]>>;
  } else {
    console.error(value);

    type test = Expect<Equal<typeof value, string>>;
  }
}
```

The problem stems from the `APIResponse` type being a "bag of optionals".

The `APIResponse` type needs to be updated so that there are two possible combinations for the returned tuple:

If the first element is `"error"` then the second element should be the error message.

If the first element is `"success"`, then the second element should be an array of `User` objects.

Your challenge is to redefine the `APIResponse` type to be a discriminated tuple that only allows for the specific combinations for the `success` and `error` states defined above.

<Exercise title="Exercise 3: Discriminated Tuples" filePath="/src/018-unions-and-narrowing/078-destructuring-a-discriminated-tuple.problem.ts"></Exercise>

#### Exercise 4: Handling Defaults with a Discriminated Union

We're back with our `calculateArea` function:

```typescript
function calculateArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius * shape.radius;
  } else {
    return shape.sideLength * shape.sideLength;
  }
}
```

Until now, the test cases have involved checking if the `kind` of the `Shape` is a `circle` or a `square`, then calculating the area accordingly.

However, a new test case has been added for a situation where no `kind` has been passed into the function:

```ts twoslash
// @errors: 2345
import { Equal, Expect } from "@total-typescript/helpers";
import { it, expect } from "vitest";

type Circle = {
  kind: "circle";
  radius: number;
};

type Square = {
  kind: "square";
  sideLength: number;
};

type Shape = Circle | Square;

function calculateArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius * shape.radius;
  } else {
    return shape.sideLength * shape.sideLength;
  }
}

// ---cut---
it("Should calculate the area of a circle when no kind is passed", () => {
  const result = calculateArea({
    radius: 5,
  });

  expect(result).toBe(78.53981633974483);

  type test = Expect<Equal<typeof result, number>>;
});
```

TypeScript is showing errors under `radius` in the test:

The test expects that if a `kind` isn't passed in, the shape should be treated as a circle. However, the current implementation doesn't account for this.

Your challenge is to:

1. Make updates to the `Shape` discriminated union that will allow for us to omit `kind`.
2. Make adjustments to the `calculateArea` function to ensure that TypeScript's type narrowing works properly within the function.

<Exercise title="Exercise 4: Handling Defaults with a Discriminated Union" filePath="/src/018-unions-and-narrowing/080-adding-defaults-to-discriminated-union.problem.ts"></Exercise>

#### Solution 1: Destructuring a Discriminated Union

Before we look at the working solution, let's look at an attempt that doesn't work out.

##### A Non-Working Attempt at Destructuring Parameters

Since we know that `kind` is present in all branches of the discriminated union, we can try using the rest parameter syntax to bring along the other properties:

```typescript
function calculateArea({ kind, ...shape }: Shape) {
  // rest of function
}
```

Then inside of the conditional branches, we can specify the `kind` and destructure from the `shape` object:

```ts twoslash
// @errors: 2339
type Circle = {
  kind: "circle";
  radius: number;
};

type Square = {
  kind: "square";
  sideLength: number;
};

type Shape = Circle | Square;
// ---cut---
function calculateArea({ kind, ...shape }: Shape) {
  if (kind === "circle") {
    const { radius } = shape;

    return Math.PI * radius * radius;
  } else {
    const { sideLength } = shape;

    return sideLength * sideLength;
  }
}
```

However, this approach doesn't work because the `kind` property has been separated from the rest of the shape. As a result, TypeScript can't track the relationship between `kind` and the other properties of `shape`. Both `radius` and `sideLength` have error messages below them.

TypeScript gives us these errors because it still cannot guarantee properties in the function parameters since it doesn't know yet whether it's dealing with a `Circle` or a `Square`.

##### The Working Destructuring Solution

Instead of doing the destructuring at the function parameter level, we instead will revert the function parameter back to `shape`:

```typescript
function calculateArea(shape: Shape) {
  // rest of function
}
```

...and move the destructuring to take place inside of the conditional branches:

```ts
function calculateArea(shape: Shape) {
  if (shape.kind === "circle") {
    const { radius } = shape;

    return Math.PI * radius * radius;
  } else {
    const { sideLength } = shape;

    return sideLength * sideLength;
  }
}
```

Now within the `if` condition, TypeScript can recognize that `shape` is indeed a `Circle` and allows us to safely access the `radius` property. A similar approach is taken for the `Square` in the `else` condition.

This approach works because TypeScript can track the relationship between `kind` and the other properties of `shape` when the destructuring takes place inside of the conditional branches.

In general, I prefer to avoid destructuring when working with discriminated unions. But if you want to, do it _inside_ of the conditional branches.

#### Solution 2: Narrowing a Discriminated Union with a Switch Statement

The first step is to clear out the `calculateArea` function and add the `switch` keyword and specify `shape.kind` as our switch condition:

```typescript
function calculateArea(shape: Shape) {
  switch (shape.kind) {
    case "circle": {
      return Math.PI * shape.radius * shape.radius;
    }
    case "square": {
      return shape.sideLength * shape.sideLength;
    }
    // Potential additional cases for more shapes
  }
}
```

As a nice bonus, TypeScript offers us autocomplete on the cases for the `switch` statement. This is a great way to ensure that we're handling all of the cases for our discriminated union.

##### Not Accounting for All Cases

As an experiment, comment out the case where the `kind` is `square`:

```typescript
function calculateArea(shape: Shape) {
  switch (shape.kind) {
    case "circle": {
      return Math.PI * shape.radius * shape.radius;
    }
    // case "square": {
    //   return shape.sideLength * shape.sideLength;
    // }
    // Potential additional cases for more shapes
  }
}
```

Now when we hover over the function, we see that the return type is `number | undefined`. This is because TypeScript is smart enough to know that if we don't return a value for the `square` case, the output will be `undefined` for any `square` shape.

```typescript
// hovering over `calculateArea` shows
function calculateArea(shape: Shape): number | undefined;
```

Switch statements work great with discriminated unions!

#### Solution 3: Destructuring a Discriminated Union of Tuples

When you're done, your `APIResponse` type should look like this:

```typescript
type APIResponse = ["error", string] | ["success", User[]];
```

We've created two possible combinations for the `APIResponse` type. An error state, and a success state. And instead of objects, we've used tuples.

You might be thinking - where's the discriminant? It's the first element of the tuple. This is what's called a discriminated tuple.

And with this update to the `APIResponse` type, the errors have gone away!

##### Understanding Tuple Relationships

Inside of the `exampleFunc` function, we use array destructuring to pull out the `status` and `value` from the `APIResponse` tuple:

```typescript
const [status, value] = await fetchData();
```

Even though the `status` and `value` variables are separate, TypeScript keeps track of the relationships behind them. If `status` is checked and is equal to `"success"`, TypeScript can narrow down `value` to be of the `User[]` type automatically:

```typescript
// hovering over `status` shows
const status: "error" | "success";
```

Note that this intelligent behavior is specific to discriminated tuples, and won't work with discriminated objects - as we saw in our previous exercise.

#### Solution 4: Handling Defaults with a Discriminated Union

Before we look at the working solution, let's take a look at a couple of approaches that don't quite work out.

##### Attempt 1: Creating an `OptionalCircle` Type

One possible first step is to create an `OptionalCircle` type by discarding the `kind` property:

```typescript
type OptionalCircle = {
  radius: number;
};
```

Then we would update the `Shape` type to include the new type:

```typescript
type Shape = Circle | OptionalCircle | Square;
```

This solution appears to work initially since it resolves the error in the radius test case.

However, this approach brings back errors inside of the `calculateArea` function because the discriminated union is broken since not every member has a `kind` property.

```typescript
function calculateArea(shape: Shape) {
  if (shape.kind === "circle") {
    // error on shape.kind
    return Math.PI * shape.radius * shape.radius;
  } else {
    return shape.sideLength * shape.sideLength;
  }
}
```

##### Attempt 2: Updating the `Circle` Type

Rather than developing a new type, we could modify the `Circle` type to make the `kind` property optional:

```typescript
type Circle = {
  kind?: "circle";
  radius: number;
};

type Square = {
  kind: "square";
  sideLength: number;
};

type Shape = Circle | Square;
```

This modification allows us to distinguish between circles and squares. The discriminated union remains intact while also accommodating the optional case where `kind` is not specified.

However, there is now a new error inside of the `calculateArea` function:

```ts twoslash
// @errors: 2339
type Circle = {
  kind?: "circle";
  radius: number;
};

type Square = {
  kind: "square";
  sideLength: number;
};

type Shape = Circle | Square;

// ---cut---
function calculateArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius * shape.radius;
  } else {
    return shape.sideLength * shape.sideLength;
  }
}
```

The error tells us that TypeScript is no longer able to narrow down the type of `shape` to a `Square` because we're not checking to see if `shape.kind` is `undefined`.

##### Fixing the New Error

It would be possible to fix this error by adding additional checks for the `kind`, but instead we could just swap how our conditional checks work.

We'll check for a `square` first, then fall back to a `circle`:

```typescript
if (shape.kind === "square") {
  return shape.sideLength * shape.sideLength;
} else {
  return Math.PI * shape.radius * shape.radius;
}
```

By inspecting `square` first, all shape cases that aren't squares default to circles. The circle is treated as optional, which preserves our discriminated union and keeps the function flexible.

Sometimes, just flipping the runtime logic makes TypeScript happy!
