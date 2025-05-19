在本节中，我们将了解 TypeScript 如何在值是多种可能类型之一时提供帮助。我们将首先了解如何使用联合类型 (union types) 声明这些类型，然后我们将了解 TypeScript 如何根据您的运行时代码缩小值的类型。

## 联合类型 (Unions) 和字面量类型 (Literals)

### 联合类型 (Union Types)

联合类型 (union type) 是 TypeScript 表示一个值可以是“这种类型或那种类型”的方式。

这种情况在 JavaScript 中经常出现。想象一下，您有一个值，它在周二是一个 `string`，但在其他时间是 `null`：

```ts twoslash
const message = Date.now() % 2 === 0 ? "Hello Tuesdays!" : null;
//    ^?
```

如果我们将鼠标悬停在 `message` 上，我们可以看到 TypeScript 已将其类型推断为 `string | null`。

这是一个联合类型 (union type)。这意味着 `message` 可以是 `string` 或 `null`。

#### 声明联合类型 (Declaring Union Types)

我们可以声明自己的联合类型 (union types)。

例如，您可能有一个 `id`，它可以是 `string` 或 `number`：

```ts twoslash
const logId = (id: string | number) => {
  console.log(id);
};
```

这意味着 `logId` 可以接受 `string` 或 `number` 作为参数，但不能接受 `boolean`：

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

要创建联合类型 (union type)，使用 `|` 运算符分隔类型。联合类型 (union) 的每个类型都称为联合类型 (union) 的“成员 (member)”。

联合类型 (union types) 在创建您自己的类型别名 (type aliases) 时也有效。例如，我们可以将我们之前的定义重构为一个类型别名 (type alias)：

```typescript
type Id = number | string;

function logId(id: Id) {
  console.log(id);
}
```

联合类型 (union types) 可以包含许多不同的类型——它们不必都是原始类型 (primitives)，也不必以任何方式相关。当它们变得特别大时，您可以使用这种语法（在联合类型 (union) 的第一个成员之前带有 `|`）使其更具可读性：

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

联合类型 (union types) 可以通过多种不同的方式使用，它们是创建灵活类型定义的强大工具。

### 字面量类型 (Literal Types)

正如 TypeScript 允许我们从多种类型创建联合类型 (union types) 一样，它也允许我们创建表示特定原始值 (primitive value) 的类型。这些被称为字面量类型 (literal types)。

字面量类型 (literal types) 可用于表示具有特定值的字符串 (strings)、数字 (numbers) 或布尔值 (booleans)。

```typescript
type YesOrNo = "yes" | "no";
type StatusCode = 200 | 404 | 500;
type TrueOrFalse = true | false;
```

在 `YesOrNo` 类型中，`|` 运算符用于创建字符串字面量 (string literals) `"yes"` 和 `"no"` 的联合 (union)。这意味着 `YesOrNo` 类型的值只能是这两个字符串之一。

此功能正是我们在 `document.addEventListener` 等函数中看到的自动完成 (autocomplete) 功能的强大之处：

```typescript
document.addEventListener(
  // DOMContentLoaded, mouseover, etc.
  "click",
  () => {}
);
```

`addEventListener` 的第一个参数是字符串字面量 (string literals) 的联合 (union)，这就是我们获得不同事件类型 (event types) 自动完成 (autocompletion) 的原因。

### 联合类型与联合类型的组合 (Combining Unions With Unions)

当我们将两个联合类型 (union types) 组合成一个联合类型 (union) 时会发生什么？它们会组合在一起形成一个大的联合类型 (union)。

例如，我们可以创建包含字面量值 (literal values) 联合 (union) 的 `DigitalFormat` 和 `PhysicalFormat` 类型：

```tsx
type DigitalFormat = "MP3" | "FLAC";

type PhysicalFormat = "LP" | "CD" | "Cassette";
```

然后我们可以将 `AlbumFormat` 指定为 `DigitalFormat` 和 `PhysicalFormat` 的联合 (union)：

```tsx
type AlbumFormat = DigitalFormat | PhysicalFormat;
```

现在，我们可以将 `DigitalFormat` 类型用于处理数字格式的函数，将 `AnalogFormat` 类型用于处理模拟格式的函数。`AlbumFormat` 类型可用于处理所有情况的函数。

这样，我们可以确保每个函数只处理它应该处理的情况，如果我们尝试将不正确的格式传递给函数，TypeScript 将抛出错误。

```ts twoslash
// @errors: 2345
type PhysicalFormat = "LP" | "CD" | "Cassette";
// ---cut---
const getAlbumFormats = (format: PhysicalFormat) => {
  // function body
};

getAlbumFormats("MP3");
```

### 练习 (Exercises)

#### 练习 1：`string` 或 `null` (Exercise 1: `string` or `null`)

这里我们有一个名为 `getUsername` 的函数，它接受一个 `username` 字符串。如果 `username` 不等于 `null`，我们返回一个新的内插字符串。否则，我们返回 `"Guest"`：

```typescript
function getUsername(username: string) {
  if (username !== null) {
    return `User: ${username}`;
  } else {
    return "Guest";
  }
}
```

在第一个测试中，我们调用 `getUsername` 并传入字符串 "Alice"，测试按预期通过。但是，在第二个测试中，当将 `null` 传入 `getUsername` 时，`null` 下方有一条红色波浪线：

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

通常我们不会用 `null` 显式调用 `getUsername` 函数，但在这种情况下，处理 `null` 值很重要。例如，我们可能从数据库中的用户记录中获取 `username`，并且用户可能有名也可能没有名，具体取决于他们的注册方式。

目前，`username` 参数只接受 `string` 类型，对 `null` 的检查不起作用。更新函数参数的类型，以便解决错误并且函数可以处理 `null`。

\<Exercise title="练习 1：`string` 或 `null`" filePath="/src/018-unions-and-narrowing/053-introduction-to-unions.problem.ts"\>\</Exercise\>

#### 练习 2：限制函数参数 (Exercise 2: Restricting Function Parameters)

这里我们有一个 `move` 函数，它接受一个 `string` 类型的 `direction` 和一个 `number` 类型的 `distance`：

```tsx
function move(direction: string, distance: number) {
  // Move the specified distance in the given direction
}
```

函数的实现并不重要，但想法是我们希望能够向上、向下、向左或向右移动。

以下是调用 `move` 函数的样子：

```typescript
move("up", 10);

move("left", 5);
```

为了测试这个函数，我们有一些 `@ts-expect-error` 指令，告诉 TypeScript 我们期望以下行抛出错误。

但是，由于 `move` 函数目前接受一个 `string` 作为 `direction` 参数，我们可以传入任何我们想要的字符串，即使它不是一个有效的方向。还有一个测试，我们期望传入 `20` 作为距离不起作用，但它也被接受了。

这导致 TypeScript 在 `@ts-expect-error` 指令下方绘制红色波浪线：

```ts twoslash
// @errors: 2578
function move(direction: string, distance: number) {
  // Move the specified distance in the given direction
}
// ---cut---
move(
  // @ts-expect-error - "up-right" is not a valid direction
  "up-right",
  10
);

move(
  // @ts-expect-error - "down-left" is not a valid direction
  "down-left",
  20
);
```

您的挑战是更新 `move` 函数，使其仅接受字符串 `"up"`、`"down"`、`"left"` 和 `"right"`。这样，当我们尝试传入任何其他字符串时，TypeScript 将抛出错误。

\<Exercise title="练习 2：限制函数参数" filePath="/src/018-unions-and-narrowing/054-literal-types.problem.ts"\>\</Exercise\>

#### 解决方案 1：`string` 或 `null` (Solution 1: `string` or `null`)

解决方案是将 `username` 参数更新为 `string` 和 `null` 的联合 (union)：

```typescript
function getUsername(username: string | null) {
  // function body
}
```

通过此更改，`getUsername` 函数现在将接受 `null` 作为 `username` 参数的有效值，并且错误将得到解决。

#### 解决方案 2：限制函数参数 (Solution 2: Restricting Function Parameters)

为了限制 `direction` 的取值，我们可以使用字面量值（在本例中为字符串）的联合类型 (union type)。

具体如下所示：

```typescript
function move(direction: "up" | "down" | "left" | "right", distance: number) {
  // Move the specified distance in the given direction
}
```

通过此更改，我们现在可以对可能的 `direction` 值进行自动完成 (autocomplete)。

为了让代码更简洁，我们可以创建一个名为 `Direction` 的新类型别名 (type alias)，并相应地更新参数：

```typescript
type Direction = "up" | "down" | "left" | "right";

function move(direction: Direction, distance: number) {
  // Move the specified distance in the given direction
}
```

## 类型收窄 (Narrowing)

### 更宽泛的类型与更窄的类型 (Wider vs Narrower Types)

某些类型是其他类型的更宽泛版本。例如，`string` 比字面量字符串 `"small"` 更宽泛。这是因为 `string` 可以是任何字符串，而 `"small"` 只能是字符串 `"small"`。

反过来说，我们可以说 `"small"` 是比 `string` “更窄”的类型。它是字符串的一个更具体的版本。`404` 是比 `number` 更窄的类型，`true` 是比 `boolean` 更窄的类型。

这仅适用于具有某种共享关系的类型。例如，`"small"` 不是 `number` 的更窄版本——因为 `"small"` 本身不是一个数字。

在 TypeScript 中，类型的更窄版本始终可以取代更宽泛的版本。

例如，如果一个函数接受一个 `string`，我们可以传入 `"small"`：

```typescript
const logSize = (size: string) => {
  console.log(size.toUpperCase());
};

logSize("small");
```

但是如果一个函数接受 `"small"`，我们就不能传入任何随机的 `string`：

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

如果您熟悉集合论中的“子类型 (subtypes)”和“超类型 (supertypes)”的概念，这是一个类似的想法。`"small"` 是 `string` 的子类型 (subtype)（它更具体），而 `string` 是 `"small"` 的超类型 (supertype)。

### 联合类型比其成员更宽泛 (Unions Are Wider Than Their Members)

联合类型 (union type) 是比其成员更宽泛的类型。例如，`string | number` 比单独的 `string` 或 `number` 更宽泛。

这意味着我们可以将 `string` 或 `number` 传递给接受 `string | number` 的函数：

```typescript
function logId(id: string | number) {
  console.log(id);
}

logId("abc");
logId(123);
```

然而，反过来则不行。我们不能将 `string | number` 传递给只接受 `string` 的函数。

例如，如果我们将此 `logId` 函数更改为仅接受 `number`，则当我们尝试将 `string | number` 传递给它时，TypeScript 将抛出错误：

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

将鼠标悬停在 `user.id` 上显示：

```
Argument of type 'string | number' is not assignable to parameter of type 'number'.
  Type 'string' is not assignable to type 'number'.
```

因此，将联合类型 (union type) 视为比其成员更宽泛的类型非常重要。

### 什么是类型收窄？(What is Narrowing?)

TypeScript 中的类型收窄 (narrowing) 允许我们获取一个更宽泛的类型，并使用运行时代码将其变得更窄。

当我们想根据值的类型执行不同的操作时，这可能很有用。例如，我们可能想以不同于 `number` 的方式处理 `string`，或者以不同于 `"large"` 的方式处理 `"small"`。

### 使用 `typeof` 进行类型收窄 (Narrowing with `typeof`)

我们可以用来缩小值类型的一种方法是使用 `typeof` 运算符，并结合 `if` 语句。

考虑一个函数 `getAlbumYear`，它接受一个参数 `year`，该参数可以是 `string` 或 `number`。以下是我们如何使用 `typeof` 运算符来缩小 `year` 的类型：

```typescript
const getAlbumYear = (year: string | number) => {
  if (typeof year === "string") {
    console.log(`The album was released in ${year.toUppercase()}.`); // `year` is string
  } else if (typeof year === "number") {
    console.log(`The album was released in ${year.toFixed(0)}.`); // `year` is number
  }
};
```

它看起来很简单，但是了解幕后发生的事情很重要。

作用域 (scoping) 在类型收窄 (narrowing) 中扮演着重要角色。在第一个 `if` 块中，TypeScript 理解 `year` 是一个 `string`，因为我们使用了 `typeof` 运算符来检查其类型。在 `else if` 块中，TypeScript 理解 `year` 是一个 `number`，因为我们使用了 `typeof` 运算符来检查其类型。

这使我们可以在 `year` 是 `string` 时调用 `toUpperCase`，在 `year` 是 `number` 时调用 `toFixed`。

然而，在条件块之外的任何地方，`year` 的类型仍然是联合类型 (union) `string | number`。这是因为类型收窄 (narrowing) 仅适用于块的作用域 (scope) 内。

为了说明，如果我们将 `boolean` 添加到 `year` 联合类型 (union) 中，第一个 `if` 块最终仍将得到 `string` 类型，但 `else` 块最终将得到 `number | boolean` 类型：

```typescript
const getAlbumYear = (year: string | number | boolean) => {
  if (typeof year === "string") {
    console.log(`The album was released in ${year}.`); // `year` is string
  } else if (typeof year === "number") {
    console.log(`The album was released in ${year}.`); // `year` is number | boolean
  }

  console.log(year); // `year` is string | number | boolean
};
```

这是一个强有力的例子，说明 TypeScript 如何读取您的运行时代码并使用它来缩小值的类型。

### 其他类型收窄方法 (Other Ways to Narrow)

`typeof` 运算符只是缩小类型的一种方法。

TypeScript 可以使用其他条件运算符，如 `&&` 和 `||`，并将考虑真值 (truthiness) 来强制转换布尔值。也可以使用其他运算符，如 `instanceof` 和 `in` 来检查对象属性。您甚至可以使用抛出错误或提前返回来缩小类型。

我们将在以下练习中更详细地研究这些内容。

### 练习 (Exercises)

#### 练习 1：使用 `if` 语句进行类型收窄 (Exercise 1: Narrowing with `if` Statements)

这里我们有一个名为 `validateUsername` 的函数，它接受 `string` 或 `null`，并且总是返回 `boolean`：

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

但是，我们在函数体内的 `username` 下方遇到了一个错误，因为它可能是 `null`，而我们正试图访问它的属性。

```typescript
it("Should return false for null", () => {
  expect(validateUsername(null)).toBe(false);
});
```

您的任务是重写 `validateUsername` 函数以添加类型收窄 (narrowing)，以便处理 `null` 的情况并且所有测试都通过。

\<Exercise title="练习 1：使用 `if` 语句进行类型收窄" filePath="/src/018-unions-and-narrowing/059-narrowing-with-if-statements.problem.ts"\>\</Exercise\>

#### 练习 2：通过抛出错误来进行类型收窄 (Exercise 2: Throwing Errors to Narrow)

这里有一行代码使用 `document.getElementById` 来获取一个 HTML 元素，它可以返回 `HTMLElement` 或 `null`：

```typescript
const appElement = document.getElementById("app");
```

目前，一个测试 `appElement` 是否为 `HTMLElement` 的测试失败了：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";

const appElement = document.getElementById("app");

// ---cut---
type Test = Expect<Equal<typeof appElement, HTMLElement>>;
```

您的任务是使用 `throw` 在测试检查 `appElement` 之前缩小其类型。

\<Exercise title="练习 2：通过抛出错误来进行类型收窄" filePath="/src/018-unions-and-narrowing/062-throwing-errors-to-narrow.problem.ts"\>\</Exercise\>

#### 练习 3：使用 `in` 进行类型收窄 (Exercise 3: Using `in` to Narrow)

这里我们有一个 `handleResponse` 函数，它接受一个 `APIResponse` 类型，这是一个由两种对象类型组成的联合类型 (union)。

`handleResponse` 函数的目标是检查提供的对象是否具有 `data` 属性。如果具有，则函数应返回 `id` 属性。如果不具有，则应抛出一个 `Error`，其消息来自 `error` 属性。

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

目前，如以下测试所示，抛出了几个错误。

第一个错误是 `Property 'data' does not exist on type 'APIResponse'`

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

然后我们遇到了相反的错误，即 `Property 'error' does not exist on type 'APIResponse'`：

```
Property data does not exist on type 'APIResponse'.
```

您的挑战是找到在 `handleResponse` 函数的 `if` 条件中缩小类型的正确语法。

更改应在函数内部进行，而不修改代码的任何其他部分。

\<Exercise title="练习 3：使用 `in` 进行类型收窄" filePath="/src/018-unions-and-narrowing/064-narrowing-with-in-statements.problem.ts"\>\</Exercise\>

#### 解决方案 1：使用 `if` 语句进行类型收窄 (Solution 1: Narrowing with `if` Statements)

有几种不同的方法可以验证用户名的长度。

##### 选项 1：检查真值 (Check Truthiness)

我们可以使用 `if` 语句来检查 `username` 是否为真值 (truthy)。如果是，我们可以返回 `username.length > 5`，否则我们可以返回 `false`：

```typescript
function validateUsername(username: string | null): boolean {
  // Rewrite this function to make the error go away

  if (username) {
    return username.length > 5;
  }

  return false;
}
```

这段逻辑有一个陷阱。如果 `username` 是一个空字符串，它将返回 `false`，因为空字符串是假值 (falsy)。这恰好符合我们这个练习想要的行为——但记住这一点很重要。

##### 选项 2：检查 `typeof username` 是否为 `"string"` (Check if `typeof username` is `"string"`)

我们可以使用 `typeof` 来检查用户名是否为字符串：

```typescript
function validateUsername(username: string | null): boolean {
  if (typeof username === "string") {
    return username.length > 5;
  }

  return false;
}
```

这样就避免了空字符串的问题。

##### 选项 3：检查 `typeof username` 是否不为 `"string"` (Check if `typeof username` is not `"string"`)

与上面类似，我们可以检查 `typeof username !== "string"`。

在这种情况下，如果 `username` 不是字符串，我们就知道它是 `null`，可以立即返回 `false`。否则，我们将返回长度是否大于 5 的检查结果：

```typescript
function validateUsername(username: string | null | undefined): boolean {
  if (typeof username !== "string") {
    return false;
  }

  return username.length > 5;
}
```

这表明 TypeScript 理解检查的\_反向\_。非常聪明。

##### 选项 4：检查 `typeof username` 是否为 `"object"` (Check if `typeof username` is `"object"`)

JavaScript 的一个奇怪之处在于 `null` 的类型等于 `"object"`。

TypeScript 知道这一点，所以我们实际上可以利用它。我们可以检查 `username` 是否是一个对象，如果是，我们可以返回 `false`：

```typescript
function validateUsername(username: string | null): boolean {
  if (typeof username === "object") {
    return false;
  }

  return username.length > 5;
}
```

##### 选项 5：将检查提取到其自己的变量中 (Extract the check into its own variable)

最后，为了可读性和可重用性，您可以将检查存储在其自己的变量 `isUsernameOK` 中。

具体如下所示：

```typescript
function validateUsername(username: string | null): boolean {
  const isUsernameOK = typeof username === "string";

  if (isUsernameOK) {
    return username.length > 5;
  }

  return false;
}
```

TypeScript 足够聪明，能够理解 `isUsernameOK` 的值对应于 `username` 是否为字符串。非常聪明。

以上所有选项都使用 `if` 语句，通过 `typeof` 来缩小类型以执行检查。

无论您选择哪个选项，请记住，您始终可以使用 `if` 语句来缩小类型，并为条件通过的情况添加代码。

#### 解决方案 2：通过抛出错误来进行类型收窄 (Solution 2: Throwing Errors to Narrow)

这段代码的问题在于 `document.getElementById` 返回 `null | HTMLElement`。但我们希望在使用 `appElement` 之前确保它是一个 `HTMLElement`。

我们非常确定 `appElement` 存在。如果它不存在，我们可能希望尽早使应用程序崩溃，以便获得有关出了什么问题的详细错误信息。

所以，我们可以添加一个 `if` 语句来检查 `appElement` 是否为假值 (falsy)，然后抛出一个错误：

```typescript
if (!appElement) {
  throw new Error("Could not find app element");
}
```

通过添加此错误条件，我们可以确保如果 `appElement` 为 `null`，我们永远不会执行任何后续代码。

如果我们在 `if` 语句之后将鼠标悬停在 `appElement` 上，我们可以看到 TypeScript 现在知道 `appElement` 是一个 `HTMLElement`——它不再是 `null`。这意味着我们的测试现在也通过了：

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

像这样抛出错误可以帮助您在运行时识别问题。在这种特定情况下，它缩小了紧邻 `if` 语句作用域\_之外\_的代码。太棒了。

#### 解决方案 3：使用 `in` 进行类型收窄 (Solution 3: Using `in` to Narrow)

您的第一直觉是检查 `response.data` 是否为真值 (truthy)。

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

但是你会得到一个错误。这是因为 `response.data` 仅在联合类型 (union) 的一个成员上可用。TypeScript 不知道 `response` 是具有 `data` 属性的那个。

##### 选项 1：更改类型 (Changing the Type)

将 `APIResponse` 类型更改为在两个分支中都添加 `.data` 可能很诱人：

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

这当然是一种处理方法。但有一种内置的方法可以做到这一点。

##### 选项 2：使用 `in` (Using `in`)

我们可以使用 `in` 运算符来检查 `response` 上是否存在特定的键 (key)。

在这个例子中，它会检查键 `data`：

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

如果 `response` 不是带有 `data` 的那个，那么它一定是带有 `error` 的那个，所以我们可以抛出一个带有错误消息的 `Error`。

您可以通过将鼠标悬停在 `if` 语句的每个分支中的 `.data` 和 `.error` 上来检查这一点。TypeScript 将向您显示它在每种情况下都知道 `response` 的类型。

在这里使用 `in` 为我们提供了一种很好的方法来缩小那些可能彼此具有不同键 (keys) 的对象。

## `unknown` 和 `never` (`unknown` and `never`)

让我们暂停一下，介绍另外两种在 TypeScript 中扮演重要角色的类型，尤其是在我们讨论“宽 (wide)”和“窄 (narrow)”类型时。

### 最宽泛的类型：`unknown` (The Widest Type: `unknown`)

TypeScript 最宽泛的类型是 `unknown`。它代表我们不知道是什么的东西。

如果您想象一个标尺，最宽泛的类型在顶部，最窄的类型在底部，那么 `unknown` 就在顶部。所有其他类型，如字符串 (strings)、数字 (numbers)、布尔值 (booleans)、null、undefined 及其各自的字面量 (literals)，都可以赋值给 `unknown`，如其可赋值性图表所示：

\<img src="[移除了无效网址]"\>

考虑这个示例函数 `fn`，它接受一个 `unknown` 类型的 `input` 参数：

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

以上所有函数调用都是有效的，因为 `unknown` 可以赋值给任何其他类型。

当您想表示 JavaScript 中真正未知的事物时，`unknown` 类型是首选。例如，当您的应用程序从外部来源（例如表单输入或对 webhook 的调用）获取数据时，它非常有用。

#### `unknown` 和 `any` 有什么区别？(What's the Difference Between `unknown` and `any`?)

您可能想知道 `unknown` 和 `any` 之间有什么区别。它们都是宽泛的类型，但有一个关键的区别。

`any` 并不真正符合我们对“宽 (wide)”和“窄 (narrow)”类型的定义。它破坏了类型系统。它根本不是一个类型——它是一种选择退出 TypeScript 类型检查的方式。

`any` 可以赋值给任何东西，任何东西也可以赋值给 `any`。`any` 比所有其他类型都更窄也更宽。

另一方面，`unknown` 是 TypeScript 类型系统的一部分。它比所有其他类型都更宽，所以它不能赋值给任何东西。

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

这意味着 `unknown` 是一个安全的类型，而 `any` 不是。`unknown` 表示“我不知道这是什么”，而 `any` 表示“我不在乎这是什么”。

### 最窄的类型：`never` (The Narrowest Type: `never`)

如果 `unknown` 是 TypeScript 中最宽泛的类型，那么 `never` 就是最窄的。

`never` 代表\_永远不会\_发生的事情。它是类型层次结构的最底层。

您很少会自己使用 `never` 类型注解。相反，它会出现在错误消息和悬停提示中——通常在类型收窄 (narrowing) 时出现。

但首先，让我们看一个 `never` 类型的简单示例：

#### `never` vs `void`

让我们考虑一个从不返回任何东西的函数：

```typescript
const getNever = () => {
  // This function never returns!
};
```

将鼠标悬停在此函数上时，TypeScript 会推断它返回 `void`，表明它基本上不返回任何内容。

```typescript
// hovering over `getNever` shows:

const getNever: () => void;
```

但是，如果我们在函数内部抛出一个错误，该函数将\_永远不会\_返回：

```typescript
const getNever = () => {
  throw new Error("This function never returns");
};
```

通过此更改，TypeScript 将推断该函数的类型为 `never`：

```typescript
// hovering over `getNever` shows:

const getNever: () => never;
```

`never` 类型表示永远不可能发生的事情。

`never` 类型有一些奇怪的含义。

您不能将任何东西赋值给 `never`，除了 `never` 本身。

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

但是，您可以将 `never` 赋值给任何东西：

```typescript
const str: string = getNever();

const num: number = getNever();

const bool: boolean = getNever();

const arr: string[] = getNever();
```

这种行为起初看起来非常奇怪——但我们稍后会看到它为什么有用。

让我们更新我们的图表以包含 `never`：

这几乎为我们提供了 TypeScript 类型层次结构的全貌。

### 练习 (Exercises)

#### 练习 1：使用 `instanceof` 进行错误类型收窄 (Exercise 1: Narrowing Errors with `instanceof`)

在 TypeScript 中，使用 `try...catch` 语句处理潜在危险代码时，最常遇到 `unknown` 类型的地方之一。让我们看一个例子：

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

在上面的代码片段中，我们有一个名为 `somethingDangerous` 的函数，它有 50/50 的几率抛出错误。

请注意，`catch` 子句中的 `error` 变量的类型为 `unknown`。

现在假设我们只想在错误包含 `message` 属性时使用 `console.error()` 记录错误。我们知道错误通常带有 `message` 属性，如下例所示：

```typescript
const error = new Error("Some error message");

console.log(error.message);
```

您的任务是更新 `if` 语句，使其具有正确的条件来检查 `error` 是否具有 message 属性，然后再记录它。查看练习的标题以获取提示……请记住，`Error` 是一个类 (class)。

\<Exercise title="练习 1：使用 `instanceof` 进行错误类型收窄" filePath="/src/018-unions-and-narrowing/065.5-narrowing-with-instanceof-statements.problem.ts"\>\</Exercise\>

#### 练习 2：将 `unknown` 收窄为特定值 (Exercise 2: Narrowing `unknown` to a Value)

这里我们有一个 `parseValue` 函数，它接受一个 `unknown` 类型的 `value`：

```ts twoslash
// @errors: 18046
const parseValue = (value: unknown) => {
  if (true) {
    return value.data.id;
  }

  throw new Error("Parsing error!");
};
```

此函数的目标是返回 `value` 对象的 `data` 属性的 `id` 属性。如果 `value` 对象没有 `data` 属性，则应抛出错误。

以下是该函数的一些测试，向我们展示了需要在 `parseValue` 函数内部完成的类型收窄 (narrowing) 的程度：

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

您的挑战是修改 `parseValue` 函数，以便测试通过并且错误消失。我希望您挑战自己，\_仅\_通过在函数内部缩小 `value` 的类型来做到这一点。不要更改类型。这将需要一个非常大的 `if` 语句！

\<Exercise title="练习 2：将 `unknown` 收窄为特定值" filePath="/src/018-unions-and-narrowing/066-narrowing-unknown-to-a-value.problem.ts"\>\</Exercise\>

#### 练习 3：可重用的类型守卫 (Exercise 3: Reusable Type Guards)

假设我们有两个函数，它们都接受一个 `unknown` 类型的 `value`，并尝试将该值解析为一个字符串数组。

这是第一个函数，它将名称数组连接成一个字符串：

```typescript
const joinNames = (value: unknown) => {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value.join(" ");
  }

  throw new Error("Parsing error!");
};
```

这是第二个函数，它遍历名称数组并为每个名称添加前缀：

```typescript
const createSections = (value: unknown) => {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value.map((item) => `Section: ${item}`);
  }

  throw new Error("Parsing error!");
};
```

两个函数都有相同的条件检查：

```ts
if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
```

这是一个创建可重用类型守卫 (type guard) 的绝佳机会。

所有测试目前都通过了。您的任务是尝试重构这两个函数以使用可重用的类型守卫 (type guard)，并删除重复的代码。事实证明，TypeScript 使这比您预期的要容易得多。

\<Exercise title="练习 3：可重用的类型守卫" filePath="/src/018-unions-and-narrowing/072.5-reusable-type-guards.problem.ts"\>\</Exercise\>

#### 解决方案 1：使用 `instanceof` 进行错误类型收窄 (Solution 1: Narrowing Errors with `instanceof`)

解决这个挑战的方法是使用 `instanceof` 运算符来缩小 `error` 的类型。

在我们检查错误消息的地方，我们将检查 `error` 是否是 `Error` 类的实例：

```typescript
if (error instanceof Error) {
  console.log(error.message);
}
```

`instanceof` 运算符也涵盖了从 `Error` 类继承的其他类，例如 `TypeError`。

在这种情况下，我们将错误消息记录到控制台——但这可以用于在我们的应用程序中显示不同的内容，或者将错误记录到外部服务。

尽管它在这个特定示例中适用于各种 `Error`，但它无法涵盖有人抛出非 `Error` 对象的奇怪情况。

```typescript
throw "This is not an error!";
```

为了更安全地避免这些边缘情况，最好包含一个 `else` 块，像这样抛出 `error` 变量：

```typescript
if (error instanceof Error) {
  console.log(error.message);
} else {
  throw error;
}
```

使用这种技术，我们可以安全地处理错误并避免任何潜在的运行时错误。

#### 解决方案 2：将 `unknown` 收窄为特定值 (Solution 2: Narrowing `unknown` to a Value)

这是我们的起点：

```ts twoslash
// @errors: 18046
const parseValue = (value: unknown) => {
  if (true) {
    return value.data.id;
  }

  throw new Error("Parsing error!");
};
```

要修复错误，我们需要使用条件检查来缩小类型。让我们一步一步来。

首先，我们将通过将 `true` 替换为类型检查来检查 `value` 的类型是否为 `object`：

```ts twoslash
// @errors: 18047 2339
const parseValue = (value: unknown) => {
  if (typeof value === "object") {
    return value.data.id;
  }

  throw new Error("Parsing error!");
};
```

然后我们将使用 `in` 运算符检查 `value` 参数是否具有 `data` 属性：

```ts twoslash
// @errors: 18047 18046
const parseValue = (value: unknown) => {
  if (typeof value === "object" && "data" in value) {
    return value.data.id;
  }

  throw new Error("Parsing error!");
};
```

通过此更改，TypeScript 抱怨 `value` 可能为 `null`。这是因为，当然，`typeof null` 是 `"object"`。谢谢你，JavaScript！

要解决此问题，我们可以在第一个条件中添加 `&& value` 以确保它不为 `null`：

```ts twoslash
// @errors: 18046
const parseValue = (value: unknown) => {
  if (typeof value === "object" && value && "data" in value) {
    return value.data.id;
  }

  throw new Error("Parsing error!");
};
```

现在我们的条件检查通过了，但是我们仍然在 `value.data` 上得到一个错误，因为它的类型是 `unknown`。

我们现在需要做的是将 `value.data` 的类型缩小为 `object` 并确保它不为 `null`。此时我们还将指定返回类型为 `string` 以避免返回 `unknown` 类型：

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

最后，我们将添加一个检查以确保 `id` 是一个字符串。如果不是，TypeScript 将抛出一个错误：

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

现在当我们将鼠标悬停在 `parseValue` 上时，我们可以看到它接受一个 `unknown` 输入并且总是返回一个 `string`：

```typescript
// hovering over `parseValue` shows:

const parseValue: (value: unknown) => string;
```

多亏了这个巨大的条件语句，我们的测试通过了，并且我们的错误消息也消失了！

这通常\_不是\_您希望编写代码的方式。这有点乱。您可以使用像 [Zod](https://zod.dev) 这样的库来通过更友好的 API 实现此目的。但这是理解 `unknown` 和类型收窄 (narrowing) 在 TypeScript 中如何工作的绝佳方式。

#### 解决方案 3：可重用的类型守卫 (Solution 3: Reusable Type Guards)

第一步是创建一个名为 `isArrayOfStrings` 的函数来捕获条件检查：

```typescript
const isArrayOfStrings = (value) => {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
};
```

我们这里没有给 `value` 指定类型——`unknown` 是合理的，因为它可以是任何东西。

现在我们可以重构这两个函数以使用这个类型守卫 (type guard)：

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

令人难以置信的是，这就是 TypeScript 在 `if` 语句内部缩小 `value` 类型所需的全部内容。它足够聪明，能够理解在 `value` 上调用 `isArrayOfStrings` 可以确保 `value` 是一个字符串数组。

我们可以通过将鼠标悬停在 `isArrayOfStrings` 上来观察这一点：

```typescript
// hovering over `isArrayOfStrings` shows:
const isArrayOfStrings: (value: unknown) => value is string[];
```

我们看到的这个返回类型是一个类型谓词 (type predicate)。这是一种表达“如果此函数返回 `true`，则该值的类型为 `string[]`”的方式。

我们将在本书后面的章节中介绍如何编写我们自己的类型谓词 (type predicates)——但 TypeScript 推断出自己的类型谓词 (type predicates) 非常有用。

## 可辨识联合类型 (Discriminated Unions)

在本节中，我们将研究 TypeScript 开发人员用来组织其代码的一种常见模式。它被称为“可辨识联合类型 (discriminated union)”。

要理解什么是可辨识联合类型 (discriminated union)，让我们首先看看它解决的问题。

### 问题：可选属性包 (The Problem: The Bag Of Optionals)

假设我们正在对数据获取进行建模。我们有一个 `State` 类型，它有一个 `status` 属性，该属性可以处于三种状态之一：`loading`、`success` 或 `error`。

```typescript
type State = {
  status: "loading" | "success" | "error";
};
```

这很有用，但我们还需要捕获一些额外的数据。从获取中返回的数据，或者如果获取失败的错误消息。

我们可以向 `State` 类型添加 `error` 和 `data` 属性：

```typescript
type State = {
  status: "loading" | "success" | "error";
  error?: string;
  data?: string;
};
```

让我们想象我们有一个 `renderUI` 函数，它根据输入返回一个字符串。

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

这一切看起来都很好，除了我们在 `state.error` 上遇到的错误。TypeScript 告诉我们 `state.error` 可能是 `undefined`，我们不能在 `undefined` 上调用 `toUpperCase`。

这是因为我们以不正确的方式声明了 `State` 类型。我们使得 `error` 和 `data` 属性与它们发生的状态\_无关\_。换句话说，可以创建在我们的应用程序中永远不会发生的类型：

```typescript
const state: State = {
  status: "loading",
  error: "This is an error", // should not happen on "loading!"
  data: "This is data", // should not happen on "loading!"
};
```

我会将这种类型描述为“可选属性包 (bag of optionals)”。这是一种过于松散的类型。我们需要收紧它，以便 `error` 只能在 `error` 状态下发生，而 `data` 只能在 `success` 状态下发生。

### 解决方案：可辨识联合类型 (The Solution: Discriminated Unions)

解决方案是将我们的 `State` 类型转换为可辨识联合类型 (discriminated union)。

可辨识联合类型 (discriminated union) 是一种具有共同属性的类型，即“辨别符 (discriminant)”，它是一个字面量类型 (literal type)，对于联合 (union) 的每个成员都是唯一的。

在我们的例子中，`status` 属性是辨别符 (discriminant)。

让我们将每个状态分离到单独的对象字面量 (object literals) 中：

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

现在，我们可以分别将 `error` 和 `data` 属性与 `error` 和 `success` 状态关联起来：

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

现在，如果我们将鼠标悬停在 `renderUI` 函数中的 `state.error` 上，我们可以看到 TypeScript 知道 `state.error` 是一个 `string`：

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

这是由于 TypeScript 的类型收窄 (narrowing)——它知道 `state.status` 是 `"error"`，所以它知道在 `if` 块内部 `state.error` 是一个 `string`。

为了清理我们原始的类型，我们可以为每个状态使用一个类型别名 (type alias)：

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

因此，如果您注意到您的类型类似于“可选属性包 (bags of optionals)”，那么考虑使用可辨识联合类型 (discriminated union) 是一个好主意。

### 练习 (Exercises)

#### 练习 1：解构可辨识联合类型 (Exercise 1: Destructuring a Discriminated Union)

考虑一个名为 `Shape` 的可辨识联合类型 (discriminated union)，它由两种类型组成：`Circle` 和 `Square`。两种类型都有一个 `kind` 属性作为辨别符 (discriminant)。

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

这个 `calculateArea` 函数从传入的 `Shape` 中解构 `kind`、`radius` 和 `sideLength` 属性，并相应地计算形状的面积：

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

然而，TypeScript 在 `'radius'` 和 `'sideLength'` 下方显示了错误。

您的任务是更新 `calculateArea` 函数的实现，以便从传入的 `Shape` 中解构属性时不会出现错误。提示：我在本章中展示的示例\_没有\_使用解构，但某些解构是可能的。

\<Exercise title="练习 1：解构可辨识联合类型" filePath="/src/018-unions-and-narrowing/075-destructuring-a-discriminated-union.problem.ts"\>\</Exercise\>

#### 练习 2：使用 switch 语句收窄可辨识联合类型 (Exercise 2: Narrowing a Discriminated Union with a Switch Statement)

这里是我们之前练习中的 `calculateArea` 函数，但没有任何解构。

```typescript
function calculateArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius * shape.radius;
  } else {
    return shape.sideLength * shape.sideLength;
  }
}
```

您的挑战是将此函数重构为使用 `switch` 语句而不是 `if/else` 语句。`switch` 语句应用于缩小 `shape` 的类型并相应地计算面积。

\<Exercise title="练习 2：使用 switch 语句收窄可辨识联合类型" filePath="/src/018-unions-and-narrowing/076-narrowing-a-discriminated-union-with-a-switch-statement.problem.ts"\>\</Exercise\>

#### 练习 3：可辨识元组 (Exercise 3: Discriminated Tuples)

这里我们有一个 `WorkspaceData` 函数，它返回一个 promise，该 promise 解析为一个包含两个元素的 `APIResponse` 元组 (tuple)。

第一个元素是一个字符串，指示响应的类型。第二个元素可以是成功检索数据情况下的 `User` 对象数组，也可以是发生错误情况下的字符串：

```ts
type APIResponse = [string, User[] | string];
```

以下是 `WorkspaceData` 函数的样子：

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

然而，如下面的测试所示，`APIResponse` 类型目前允许我们不希望出现的其他组合。例如，它允许在返回数据时传递错误消息：

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

问题源于 `APIResponse` 类型是一个“可选属性包 (bag of optionals)”。

需要更新 `APIResponse` 类型，以便返回的元组 (tuple) 有两种可能的组合：

如果第一个元素是 `"error"`，则第二个元素应该是错误消息。

如果第一个元素是 `"success"`，则第二个元素应该是 `User` 对象的数组。

您的挑战是重新定义 `APIResponse` 类型，使其成为一个可辨识元组 (discriminated tuple)，仅允许上面定义的 `success` 和 `error` 状态的特定组合。

\<Exercise title="练习 3：可辨识元组" filePath="/src/018-unions-and-narrowing/078-destructuring-a-discriminated-tuple.problem.ts"\>\</Exercise\>

#### 练习 4：使用可辨识联合类型处理默认值 (Exercise 4: Handling Defaults with a Discriminated Union)

我们又回到了 `calculateArea` 函数：

```typescript
function calculateArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius * shape.radius;
  } else {
    return shape.sideLength * shape.sideLength;
  }
}
```

到目前为止，测试用例都涉及到检查 `Shape` 的 `kind` 是 `circle` 还是 `square`，然后相应地计算面积。

但是，针对未向函数传递 `kind` 的情况添加了一个新的测试用例：

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

TypeScript 在测试中的 `radius` 下方显示了错误：

测试期望如果未传入 `kind`，则应将形状视为圆形。但是，当前的实现没有考虑到这一点。

您的挑战是：

1.  对 `Shape` 可辨识联合类型 (discriminated union) 进行更新，以允许我们省略 `kind`。
2.  对 `calculateArea` 函数进行调整，以确保 TypeScript 的类型收窄 (type narrowing) 在函数内正常工作。

\<Exercise title="练习 4：使用可辨识联合类型处理默认值" filePath="/src/018-unions-and-narrowing/080-adding-defaults-to-discriminated-union.problem.ts"\>\</Exercise\>

#### 解决方案 1：解构可辨识联合类型 (Solution 1: Destructuring a Discriminated Union)

在看工作正常的解决方案之前，让我们看一个行不通的尝试。

##### 一个解构参数的无效尝试 (A Non-Working Attempt at Destructuring Parameters)

由于我们知道 `kind` 存在于可辨识联合类型 (discriminated union) 的所有分支中，因此我们可以尝试使用剩余参数语法来引入其他属性：

```typescript
function calculateArea({ kind, ...shape }: Shape) {
  // rest of function
}
```

然后在条件分支内部，我们可以指定 `kind` 并从 `shape` 对象进行解构：

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

然而，这种方法行不通，因为 `kind` 属性已与形状的其余部分分离。因此，TypeScript 无法跟踪 `kind` 与 `shape` 其他属性之间的关系。`radius` 和 `sideLength` 下方都有错误消息。

TypeScript 给出这些错误是因为它仍然无法保证函数参数中的属性，因为它尚不知道处理的是 `Circle` 还是 `Square`。

##### 可行的解构方案 (The Working Destructuring Solution)

我们将函数参数恢复为 `shape`，而不是在函数参数级别进行解构：

```typescript
function calculateArea(shape: Shape) {
  // rest of function
}
```

...并将解构移至条件分支内部进行：

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

现在在 `if` 条件内，TypeScript 可以识别出 `shape` 确实是一个 `Circle`，并允许我们安全地访问 `radius` 属性。对于 `else` 条件中的 `Square` 也采用了类似的方法。

这种方法之所以有效，是因为当解构发生在条件分支内部时，TypeScript 可以跟踪 `kind` 与 `shape` 其他属性之间的关系。

总的来说，在处理可辨识联合类型 (discriminated unions) 时，我更喜欢避免解构。但如果您想这样做，请在条件分支\_内部\_进行。

#### 解决方案 2：使用 switch 语句收窄可辨识联合类型 (Solution 2: Narrowing a Discriminated Union with a Switch Statement)

第一步是清空 `calculateArea` 函数，添加 `switch` 关键字并将 `shape.kind` 指定为我们的 switch 条件：

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

一个不错的额外好处是，TypeScript 为 `switch` 语句的 case 提供了自动完成 (autocomplete) 功能。这是确保我们处理了可辨识联合类型 (discriminated union) 所有情况的好方法。

##### 未考虑所有情况 (Not Accounting for All Cases)

作为实验，注释掉 `kind` 为 `square` 的情况：

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

现在当我们将鼠标悬停在函数上时，我们看到返回类型是 `number | undefined`。这是因为 TypeScript 足够聪明，知道如果我们不为 `square` 情况返回值，则对于任何 `square` 形状，输出都将是 `undefined`。

```typescript
// hovering over `calculateArea` shows
function calculateArea(shape: Shape): number | undefined;
```

Switch 语句与可辨识联合类型 (discriminated unions) 配合得非常好！

#### 解决方案 3：解构可辨识元组联合类型 (Solution 3: Destructuring a Discriminated Union of Tuples)

完成后，您的 `APIResponse` 类型应如下所示：

```typescript
type APIResponse = ["error", string] | ["success", User[]];
```

我们为 `APIResponse` 类型创建了两种可能的组合。一种错误状态和一种成功状态。并且我们使用了元组 (tuples) 而不是对象。

您可能在想——辨别符 (discriminant) 在哪里？它就是元组 (tuple) 的第一个元素。这就是所谓的辨识元组 (discriminated tuple)。

通过对 `APIResponse` 类型的此更新，错误消失了！

##### 理解元组关系 (Understanding Tuple Relationships)

在 `exampleFunc` 函数内部，我们使用数组解构从 `APIResponse` 元组 (tuple) 中提取 `status` 和 `value`：

```typescript
const [status, value] = await fetchData();
```

尽管 `status` 和 `value` 变量是分开的，但 TypeScript 会跟踪它们之间的关系。如果检查 `status` 并且等于 `"success"`，TypeScript 可以自动将 `value` 的类型缩小为 `User[]` 类型：

```typescript
// hovering over `status` shows
const status: "error" | "success";
```

请注意，这种智能行为特定于可辨识元组 (discriminated tuples)，并且不适用于可辨识对象 (discriminated objects)——正如我们在之前的练习中看到的那样。

#### 解决方案 4：使用可辨识联合类型处理默认值 (Solution 4: Handling Defaults with a Discriminated Union)

在看工作正常的解决方案之前，让我们看几个不太奏效的方法。

##### 尝试 1：创建 `OptionalCircle` 类型 (Attempt 1: Creating an `OptionalCircle` Type)

一个可能的首要步骤是通过丢弃 `kind` 属性来创建 `OptionalCircle` 类型：

```typescript
type OptionalCircle = {
  radius: number;
};
```

然后我们将更新 `Shape` 类型以包含新类型：

```typescript
type Shape = Circle | OptionalCircle | Square;
```

这个解决方案最初看起来是有效的，因为它解决了 radius 测试用例中的错误。

然而，这种方法会在 `calculateArea` 函数内部重新引入错误，因为可辨识联合类型 (discriminated union) 被破坏了，因为并非每个成员都有 `kind` 属性。

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

##### 尝试 2：更新 `Circle` 类型 (Attempt 2: Updating the `Circle` Type)

我们可以修改 `Circle` 类型，使 `kind` 属性可选，而不是开发一个新类型：

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

此修改允许我们区分圆形和方形。可辨识联合类型 (discriminated union) 保持完整，同时也适应了未指定 `kind` 的可选情况。

但是，现在 `calculateArea` 函数内部出现了一个新的错误：

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

错误告诉我们，TypeScript 不再能够将 `shape` 的类型缩小为 `Square`，因为我们没有检查 `shape.kind` 是否为 `undefined`。

##### 修复新错误 (Fixing the New Error)

可以通过添加对 `kind` 的额外检查来修复此错误，但我们也可以简单地交换条件检查的工作方式。

我们将首先检查 `square`，然后回退到 `circle`：

```typescript
if (shape.kind === "square") {
  return shape.sideLength * shape.sideLength;
} else {
  return Math.PI * shape.radius * shape.radius;
}
```

通过首先检查 `square`，所有不是方形的形状情况都默认为圆形。圆形被视为可选，这保留了我们的可辨识联合类型 (discriminated union) 并保持了函数的灵活性。

有时，仅仅翻转运行时逻辑就能让 TypeScript 满意！
