在本书中，我们一直在使用相对简单的类型注解。我们已经看过变量注解，它帮助TypeScript知道变量应该是什么类型：

```typescript
let name: string;

name = "Waqas";
```

我们也看过如何为函数参数和返回类型添加类型：

```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

这些注解是对TypeScript的指示，告诉它某物应该是什么类型。如果我们从`greet`函数返回一个`number`，TypeScript将显示错误。我们告诉TypeScript我们返回的是`string`，所以它期望一个`string`。

但有时我们_不_想遵循这种模式。有时，我们想让TypeScript自己去推断。

有时，我们想对TypeScript撒谎。

在本章中，我们将看看更多通过注解和断言与TypeScript编译器通信的方式。

## 注解变量与注解值

在TypeScript中，注解_变量_和注解_值_之间有区别。它们冲突的方式可能令人困惑。

### 当你注解一个变量时，变量胜出

让我们再看看我们在本书中看到的变量注解。

在这个例子中，我们声明一个变量`config`并将其注解为带有字符串键和`Color`值的`Record`：

```typescript
type Color =
  | string
  | {
      r: number;
      g: number;
      b: number;
    };

const config: Record<string, Color> = {
  foreground: { r: 255, g: 255, b: 255 },
  background: { r: 0, g: 0, b: 0 },
  border: "transparent",
};
```

这里，我们正在注解一个变量。我们说`config`是一个带有字符串键和`Color`值的`Record`。这很有用，因为如果我们指定一个不匹配类型的`Color`，TypeScript将显示错误：

```ts twoslash
// @errors: 2353
type Color =
  | string
  | {
      r: number;
      g: number;
      b: number;
    };

// ---cut---
const config: Record<string, Color> = {
  border: { incorrect: 0, g: 0, b: 0 },
};
```

但这种方法有一个问题。如果我们尝试访问任何键，TypeScript会感到困惑：

```ts twoslash
// @errors: 2339
type Color =
  | string
  | {
      r: number;
      g: number;
      b: number;
    };

const config: Record<string, Color> = {};

// ---cut---
config.foreground.r;
```

首先，它不知道对象上定义了foreground。其次，它不知道foreground是`Color`类型的`string`版本还是对象版本。

这是因为我们告诉TypeScript`config`是一个带有任意数量字符串键的`Record`。我们注解了变量，但实际的_值_被丢弃了。这是一个重要的点 - 当你注解一个变量时，TypeScript将：

1. 确保传递给变量的值匹配注解。
2. 忘记值的类型。

这有一些好处 - 我们可以向`config`添加新键，TypeScript不会抱怨：

```typescript
config.primary = "red";
```

但这并不是我们真正想要的 - 这是一个不应该被更改的配置对象。

### 没有注解时，值胜出

解决这个问题的一种方法是放弃变量注解。

```typescript
const config = {
  foreground: { r: 255, g: 255, b: 255 },
  background: { r: 0, g: 0, b: 0 },
  border: "transparent",
};
```

因为没有变量注解，`config`被推断为提供的值的类型。

但现在我们失去了检查`Color`类型是否正确的能力。我们可以向`foreground`键添加一个`number`，TypeScript不会抱怨：

```typescript
const config = {
  foreground: 123,
};
```

所以我们似乎陷入了僵局。我们既想推断值的类型，又想约束它为特定形状。

### 使用`satisfies`注解值

`satisfies`操作符是一种告诉TypeScript值必须满足某些标准的方式，但仍然允许TypeScript推断类型。

让我们用它来确保我们的`config`对象具有正确的形状：

```typescript
const config = {
  foreground: { r: 255, g: 255, b: 255 },
  background: { r: 0, g: 0, b: 0 },
  border: "transparent",
} satisfies Record<string, Color>;
```

现在，我们得到了两全其美。这意味着我们可以毫无问题地访问键：

```typescript
config.foreground.r;

config.border.toUpperCase();
```

但我们也告诉TypeScript`config`必须是一个带有字符串键和`Color`值的`Record`。如果我们尝试添加一个不匹配这个形状的键，TypeScript将显示错误：

```ts twoslash
// @errors: 2322
type Color =
  | string
  | {
      r: number;
      g: number;
      b: number;
    };

// ---cut---
const config = {
  primary: 123,
} satisfies Record<string, Color>;
```

当然，我们现在失去了向`config`添加新键而不让TypeScript抱怨的能力：

```ts twoslash
// @errors: 2339
type Color =
  | string
  | {
      r: number;
      g: number;
      b: number;
    };

const config = {} satisfies Record<string, Color>;
// ---cut---
config.somethingNew = "red";
```

因为TypeScript现在推断`config`_只是_一个具有固定键集的对象。

让我们回顾一下：

- 当你使用变量注解时，变量的类型胜出。
- 当你不使用变量注解时，值的类型胜出。
- 当你使用`satisfies`时，你可以告诉TypeScript值必须满足某些标准，但仍然允许TypeScript推断类型。

#### 使用`satisfies`缩小值

关于`satisfies`的一个常见误解是它不影响值的类型。这不完全正确 - 在某些情况下，`satisfies`确实有助于将值缩小到特定类型。

让我们看这个例子：

```tsx
const album = {
  format: "Vinyl",
};
```

这里，我们有一个带有`format`键的`album`对象。正如我们从可变性章节中所知，TypeScript将推断`album.format`为`string`。我们想确保`format`是三个值之一：`CD`、`Vinyl`或`Digital`。

我们可以给它一个变量注解：

```tsx
type Album = {
  format: "CD" | "Vinyl" | "Digital";
};

const album: Album = {
  format: "Vinyl",
};
```

但现在，`album.format`是`"CD" | "Vinyl" | "Digital"`。如果我们想将其传递给只接受`"Vinyl"`的函数，这可能是个问题。

相反，我们可以使用`satisfies`：

```typescript
const album = {
  format: "Vinyl",
} satisfies Album;
```

现在，`album.format`被推断为`"Vinyl"`，因为我们告诉TypeScript`album`满足`Album`类型。所以，`satisfies`正在将`album.format`的值缩小到特定类型。

## 断言：强制值的类型

有时，TypeScript推断类型的方式并不完全是我们想要的。我们可以在TypeScript中使用断言来强制值被推断为特定类型。

### `as`断言

`as`断言是一种告诉TypeScript你比它更了解值的方式。它是一种覆盖TypeScript的类型推断并告诉它将值视为不同类型的方式。

让我们看一个例子。

想象你正在构建一个网页，URL的搜索查询字符串中有一些信息。

你恰好知道用户不能在不向URL传递`?id=some-id`的情况下导航到此页面。

```ts twoslash
const searchParams = new URLSearchParams(window.location.search);

const id = searchParams.get("id");
//    ^?
```

但TypeScript不知道`id`总是一个字符串。它认为`id`可能是字符串或`null`。

所以，让我们强制它。我们可以在`searchParams.get("id")`的结果上使用`as`来告诉TypeScript我们知道它总是一个字符串：

```ts twoslash
const searchParams = new URLSearchParams(window.location.search);
// ---cut---
const id = searchParams.get("id") as string;
//    ^?
```

现在TypeScript知道`id`总是一个字符串，我们可以将其用作字符串。

这个`as`有点不安全！如果`id`以某种方式没有在URL中传递，它在运行时将是`null`，但在编译时是`string`。这意味着如果我们在`id`上调用`.toUpperCase()`，我们会使应用崩溃。

但在我们真正比TypeScript更了解代码行为的情况下，它很有用。

#### 替代语法

作为`as`的替代，你可以在值前加上用尖括号包裹的类型：

```typescript
const id = <string>searchParams.get("id");
```

这比`as`不常见，但行为完全相同。`as`更常见，所以最好使用它。

#### `as`的限制

`as`在使用方式上有一些限制。它不能用于在不相关的类型之间转换。

考虑这个例子，其中`as`用于断言字符串应该被视为数字：

```ts twoslash
// @errors: 2352
const albumSales = "Heroes" as number;
```

TypeScript意识到，即使我们使用`as`，我们可能犯了错误。错误消息告诉我们，字符串和数字不共享任何共同属性，但如果我们真的想继续，我们可以在`as`断言上加倍，首先将字符串断言为`unknown`，然后断言为`number`：

```tsx
const albumSales = "Heroes" as unknown as number; // 没有错误
```

当使用`as`断言为`unknown as number`时，红色波浪线消失了，但这并不意味着操作是安全的。没有办法将`"Heroes"`转换为有意义的数字。

同样的行为也适用于其他类型。

在这个例子中，`Album`接口和`SalesData`接口不共享任何共同属性：

```ts twoslash
// @errors: 2352
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
}

interface SalesData {
  sales: number;
  certification: string;
}

const paulsBoutique: Album = {
  title: "Paul's Boutique",
  artist: "Beastie Boys",
  releaseYear: 1989,
};

const paulsBoutiqueSales = paulsBoutique as SalesData;
```

再次，TypeScript向我们显示关于缺乏共同属性的警告。

所以，`as`确实有一些内置的保障措施。但通过使用`as unknown as X`，你可以轻松绕过它们。而且因为`as`在运行时不做任何事情，它是一种方便的方式来对TypeScript撒谎关于值的类型。

### 非空断言

我们可以使用的另一个断言是非空断言，它是通过使用`!`操作符指定的。这提供了一种快速方式告诉TypeScript值不是`null`或`undefined`。

回到我们之前的`searchParams`例子，我们可以使用非空断言告诉TypeScript`id`永远不会是`null`：

```typescript
const searchParams = new URLSearchParams(window.location.search);

const id = searchParams.get("id")!;
```

这强制TypeScript将`id`视为字符串，即使它在运行时可能是`null`。它相当于使用`as string`，但更方便一些。

你也可以在访问可能定义也可能未定义的属性时使用它：

```typescript
type User = {
  name: string;
  profile?: {
    bio: string;
  };
};

const logUserBio = (user: User) => {
  console.log(user.profile!.bio);
};
```

或者，在调用可能未定义的函数时：

```typescript
type Logger = {
  log?: (message: string) => void;
};

const main = (logger: Logger) => {
  logger.log!("Hello, world!");
};
```

如果值未定义，这些在运行时都会失败。但它是一种方便的对TypeScript撒谎的方式，我们确信它会存在。

非空断言，像其他断言一样，是一个危险的工具。它特别讨厌，因为它只有一个字符长，所以比`as`更容易被忽略。

为了好玩，我喜欢连续使用至少三四个，以确保开发人员知道他们正在做的事情是危险的：

```typescript
// 是的，这种语法是合法的
const id = searchParams.get("id")!!!!;
```

## 错误抑制指令

断言不是我们对TypeScript撒谎的唯一方式。有几个注释指令可以用来抑制错误。

### `@ts-expect-error`

在本书的练习中，我们已经看到了几个`@ts-expect-error`的例子。这个指令给了我们一种方式告诉TypeScript我们期望在下一行代码上发生错误。

在这个例子中，我们通过将字符串传递给期望数字的函数来创建错误。

```typescript
function addOne(num: number) {
  return num + 1;
}

// @ts-expect-error
const result = addOne("one");
```

但错误不会在编辑器中显示，因为我们告诉TypeScript期望它。

然而，如果我们将数字传递给函数，错误将会显示：

```ts twoslash
// @errors: 2578
function addOne(num: number) {
  return num + 1;
}

// ---cut---
// @ts-expect-error
const result = addOne(1);
```

所以，TypeScript期望每个`@ts-expect-error`指令都被_使用_ - 后面跟着一个错误。

令人沮丧的是，`@ts-expect-error`不让你期望特定的错误，而只是期望会发生错误。

### `@ts-ignore`

`@ts-ignore`指令的行为与`@ts-expect-error`略有不同。它不是_期望_错误，而是_忽略_任何确实发生的错误。

回到我们的`addOne`例子，我们可以使用`@ts-ignore`来忽略将字符串传递给函数时发生的错误：

```typescript
// @ts-ignore
const result = addOne("one");
```

但如果我们后来修复了错误，`@ts-ignore`不会告诉我们它未被使用：

```typescript
// @ts-ignore
const result = addOne(1); // 这里没有错误！
```

一般来说，`@ts-expect-error`比`@ts-ignore`更有用，因为它会告诉你何时修复了错误。这意味着你可以得到一个警告来移除指令。

### `@ts-nocheck`

最后，`@ts-nocheck`指令将完全移除文件的类型检查。

要使用它，在文件顶部添加指令：

```tsx
// @ts-nocheck
```

禁用所有检查后，TypeScript不会向你显示任何错误，但它也无法保护你免受运行代码时可能出现的任何运行时问题。

一般来说，你不应该使用`@ts-nocheck`。我个人曾经因为在大文件中没有注意到顶部有`@ts-nocheck`而浪费了生命中的几个小时。

### 抑制错误与`as any`

TypeScript开发人员工具箱中有一个工具_也_抑制错误，但不是注释指令 - `as any`。

`as any`是一个极其强大的工具，因为它结合了对TypeScript的谎言（`as`）和禁用所有类型检查的类型（`any`）。

这意味着你可以用它来抑制几乎任何错误。我们上面的例子？没问题：

```typescript
const result = addOne({} as any);
```

`as any`将空对象转换为`any`，这禁用了所有类型检查。这意味着`addOne`将愉快地接受它。

#### `as any`与错误抑制指令

当有选择如何抑制错误时，我更喜欢使用`as any`。错误抑制指令太广泛 - 它们针对整行代码。这可能导致意外抑制你不打算抑制的错误：

```typescript
// @ts-ignore
const result = addone("one");
```

这里，我们调用`addone`而不是`addOne`。错误抑制指令将抑制错误，但它也会抑制可能在该行上发生的任何其他错误。

相反使用`as any`更精确：

```ts twoslash
// @errors: 2552
const addOne = (num: number) => num + 1;
// ---cut---
const result = addone("one" as any);
```

现在，你只会抑制你打算抑制的错误。

## 何时抑制错误

我们看过的每个错误抑制工具基本上都是告诉TypeScript"保持安静"的方式。TypeScript不试图限制你尝试使它沉默的频率。完全有可能每次遇到错误时，你都可以用`@ts-ignore`或`as any`来抑制它。

采取这种方法限制了TypeScript的有用性。你的代码将编译，但你可能会得到更多的运行时错误。

但有时抑制错误是有意义的。
