在本书中，我们一直在使用相对简单的类型注解。我们已经了解了变量注解，它可以帮助 TypeScript 了解变量应该是什么类型：

```typescript
let name: string;

name = "Waqas";
```

我们也看到了如何为函数参数和返回类型添加类型：

```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

这些注解是给 TypeScript 的指令，告诉它某个东西应该是什么类型。如果我们的 `greet` 函数返回一个 `number`，TypeScript 将会显示一个错误。我们已经告诉 TypeScript 我们将返回一个 `string`，所以它期望一个 `string`。

但有些时候我们*不*想遵循这种模式。有时，我们想让 TypeScript 自己去推断。

而有时，我们想对 TypeScript “撒谎”。

在本章中，我们将探讨更多通过注解和断言与 TypeScript 编译器交流的方法。

## 注解变量 vs 注解值

在 TypeScript 中，注解*变量*和注解*值*是有区别的。它们之间的冲突方式可能会令人困惑。

### 当你注解一个变量时，以变量为准

让我们再看一下本书中一直使用的变量注解。

在这个例子中，我们声明了一个变量 `config` 并将其注解为一个键为字符串、值为 `Color` 的 `Record`：

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

在这里，我们注解了一个变量。我们说 `config` 是一个键为字符串、值为 `Color` 的 `Record`。这很有用，因为如果我们指定一个与类型不匹配的 `Color`，TypeScript 会显示错误：

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

但是这种方法有一个问题。如果我们尝试访问任何键，TypeScript 会感到困惑：

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

首先，它不知道 `foreground` 是在对象上定义的。其次，它不知道 `foreground` 是 `Color` 类型的 `string` 版本还是对象版本。

这是因为我们告诉 TypeScript `config` 是一个具有任意数量字符串键的 `Record`。我们注解了变量，但实际的*值*被丢弃了。这是一个重点 —— 当你注解一个变量时，TypeScript 会：

1.  确保传递给变量的值与注解匹配。
2.  忘记值的类型。

这有一些好处 —— 我们可以向 `config` 添加新的键，TypeScript 不会报错：

```typescript
config.primary = "red";
```

但这并不是我们真正想要的 —— 这是一个不应该被更改的配置对象。

### 没有注解时，以值为准

解决这个问题的一种方法是去掉变量注解。

```typescript
const config = {
  foreground: { r: 255, g: 255, b: 255 },
  background: { r: 0, g: 0, b: 0 },
  border: "transparent",
};
```

因为没有变量注解，`config` 被推断为所提供值的类型。

但是现在我们失去了检查 `Color` 类型是否正确的能力。我们可以向 `foreground` 键添加一个 `number`，TypeScript 不会报错：

```typescript
const config = {
  foreground: 123,
};
```

所以看起来我们陷入了僵局。我们既想推断值的类型，又想将其约束为特定的形状。

### 使用 `satisfies` 注解值

`satisfies` 操作符是一种告诉 TypeScript 某个值必须满足特定标准，但仍然允许 TypeScript 推断类型的方法。

让我们用它来确保我们的 `config` 对象具有正确的形状：

```typescript
const config = {
  foreground: { r: 255, g: 255, b: 255 },
  background: { r: 0, g: 0, b: 0 },
  border: "transparent",
} satisfies Record<string, Color>;
```

现在，我们两全其美。这意味着我们可以毫无问题地访问键：

```typescript
config.foreground.r;

config.border.toUpperCase();
```

但我们也告诉 TypeScript `config` 必须是一个键为字符串、值为 `Color` 的 `Record`。如果我们尝试添加一个不符合此形状的键，TypeScript 将显示错误：

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

当然，我们现在失去了在 TypeScript 不报错的情况下向 `config` 添加新键的能力：

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

因为 TypeScript 现在将 `config` 推断为*仅仅*一个具有固定键集的对象。

让我们回顾一下：

- 当你使用变量注解时，以变量的类型为准。
- 当你没有使用变量注解时，以值的类型为准。
- 当你使用 `satisfies` 时，你可以告诉 TypeScript 一个值必须满足某些标准，但仍然允许 TypeScript 推断类型。

#### 使用 `satisfies` 收窄值

关于 `satisfies` 的一个常见误解是它不影响值的类型。这不完全正确 —— 在某些情况下，`satisfies` 确实有助于将值收窄到某个类型。

让我们看这个例子：

```tsx
const album = {
  format: "Vinyl",
};
```

这里，我们有一个 `album` 对象，它有一个 `format` 键。正如我们从关于可变性章节中学到的，TypeScript 会将 `album.format` 推断为 `string`。我们想确保 `format` 是三个值之一：`CD`、`Vinyl` 或 `Digital`。

我们可以给它一个变量注解：

```tsx
type Album = {
  format: "CD" | "Vinyl" | "Digital";
};

const album: Album = {
  format: "Vinyl",
};
```

但是现在，`album.format` 是 `"CD" | "Vinyl" | "Digital"`。如果我们想把它传递给一个只接受 `"Vinyl"` 的函数，这可能会是个问题。

相反，我们可以使用 `satisfies`：

```typescript
const album = {
  format: "Vinyl",
} satisfies Album;
```

现在，`album.format` 被推断为 `"Vinyl"`，因为我们告诉 TypeScript `album` 满足 `Album` 类型。所以，`satisfies` 将 `album.format` 的值收窄为一个特定的类型。

## 断言：强制值的类型

有时，TypeScript 推断类型的方式并不完全符合我们的期望。我们可以在 TypeScript 中使用断言来强制将值推断为特定类型。

### `as` 断言

`as` 断言是一种告诉 TypeScript 你比它更了解某个值的方式。它是一种覆盖 TypeScript 类型推断并告诉它将一个值视为不同类型的方法。

让我们看一个例子。

想象一下，你正在构建一个网页，其 URL 的搜索查询字符串中包含一些信息。

你碰巧知道用户无法在不向 URL 传递 `?id=some-id` 的情况下导航到此页面。

```ts twoslash
const searchParams = new URLSearchParams(window.location.search);

const id = searchParams.get("id");
//    ^?
```

但是 TypeScript 不知道 `id` 永远是一个字符串。它认为 `id` 可能是一个字符串或 `null`。

所以，让我们强制它。我们可以在 `searchParams.get("id")` 的结果上使用 `as` 来告诉 TypeScript 我们知道它永远是一个字符串：

```ts twoslash
const searchParams = new URLSearchParams(window.location.search);
// ---cut---
const id = searchParams.get("id") as string;
//    ^?
```

现在 TypeScript 知道 `id` 永远是一个字符串，我们可以这样使用它。

这个 `as` 有点不安全！如果 `id` 实际上没有在 URL 中传递，它在运行时将是 `null`，但在编译时是 `string`。这意味着如果我们对 `id` 调用 `.toUpperCase()`，我们的应用程序将会崩溃。

但它在那些我们确实比 TypeScript 更了解代码行为的情况下很有用。

#### 另一种语法

作为 `as` 的替代方案，你可以在值前面加上用尖括号括起来的类型：

```typescript
const id = <string>searchParams.get("id");
```

这不如 `as` 常见，但行为完全相同。`as` 更常见，所以最好使用它。

#### `as` 的局限性

`as` 在如何使用方面有一些限制。它不能用于在不相关的类型之间进行转换。

考虑这个例子，其中 `as` 用于断言一个字符串应该被视为一个数字：

```ts twoslash
// @errors: 2352
const albumSales = "Heroes" as number;
```

TypeScript 意识到即使我们使用了 `as`，我们也可能犯了错误。错误消息告诉我们字符串和数字没有任何共同属性，但如果我们真的想这样做，我们可以使用双重 `as` 断言，首先将字符串断言为 `unknown`，然后再断言为 `number`：

```tsx
const albumSales = "Heroes" as unknown as number; // 没有错误
```

当使用 `as` 断言为 `unknown as number` 时，红色波浪线消失了，但这并不意味着操作是安全的。根本没有办法将 `"Heroes"` 转换为有意义的数字。

同样的行为也适用于其他类型。

在这个例子中，`Album` 接口和 `SalesData` 接口没有任何共同属性：

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

同样，TypeScript 向我们显示了关于缺少共同属性的警告。

所以，`as` 确实有一些内置的保障措施。但是通过使用 `as unknown as X`，你可以轻松绕过它们。而且因为 `as` 在运行时不做任何事情，所以它是一种向 TypeScript 谎报值类型的便捷方法。

### 非空断言

我们可以使用的另一个断言是非空断言，它通过使用 `!` 操作符来指定。这提供了一种快速告诉 TypeScript 值不是 `null` 或 `undefined` 的方法。

回到我们之前的 `searchParams` 示例，我们可以使用非空断言来告诉 TypeScript `id` 永远不会是 `null`：

```typescript
const searchParams = new URLSearchParams(window.location.search);

const id = searchParams.get("id")!;
```

这会强制 TypeScript 将 `id` 视为字符串，即使它在运行时可能为 `null`。它等同于使用 `as string`，但更方便一些。

你也可以在访问一个可能已定义也可能未定义的属性时使用它：

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

或者，在调用一个可能未定义的函数时：

```typescript
type Logger = {
  log?: (message: string) => void;
};

const main = (logger: Logger) => {
  logger.log!("Hello, world!");
};
```

如果值未定义，这些中的每一个都会在运行时失败。但这对于 TypeScript 来说是一个方便的谎言，我们确信它会是。

非空断言，像其他断言一样，是一个危险的工具。它特别讨厌，因为它只有一个字符长，所以比 `as` 更容易被忽略。

为了好玩，我喜欢连续使用至少三个或四个，以确保开发人员知道他们正在做的事情是危险的：

```typescript
// 是的，这个语法是合法的
const id = searchParams.get("id")!!!!;
```

## 错误抑制指令

断言并不是我们欺骗 TypeScript 的唯一方法。有几个注释指令可以用来抑制错误。

### `@ts-expect-error`

在本书的练习中，我们已经看到了几个 `@ts-expect-error` 的例子。这个指令让我们能够告诉 TypeScript 我们期望在下一行代码中出现一个错误。

在这个例子中，我们通过将一个字符串传递给一个期望数字的函数来创建一个错误。

```typescript
function addOne(num: number) {
  return num + 1;
}

// @ts-expect-error
const result = addOne("one");
```

但是错误并没有在编辑器中显示出来，因为我们告诉 TypeScript 要预料到它。

然而，如果我们将一个数字传递给函数，错误将会显示出来：

```ts twoslash
// @errors: 2578
function addOne(num: number) {
  return num + 1;
}

// ---cut---
// @ts-expect-error
const result = addOne(1);
```

所以，TypeScript 期望每个 `@ts-expect-error` 指令都*被使用* —— 后面跟着一个错误。

令人沮丧的是，`@ts-expect-error` 不允许你期望一个特定的错误，而只允许期望一个错误会发生。

### `@ts-ignore`

`@ts-ignore` 指令的行为与 `@ts-expect-error` 有点不同。它不是*期望*一个错误，而是*忽略*任何确实发生的错误。

回到我们的 `addOne` 例子，我们可以使用 `@ts-ignore` 来忽略将字符串传递给函数时发生的错误：

```typescript
// @ts-ignore
const result = addOne("one");
```

但是如果我们稍后修复了这个错误，`@ts-ignore` 不会告诉我们它没有被使用：

```typescript
// @ts-ignore
const result = addOne(1); // 这里没有错误！
```

总的来说，`@ts-expect-error` 比 `@ts-ignore` 更有用，因为它会在你修复错误时告诉你。这意味着你可以得到一个移除指令的警告。

### `@ts-nocheck`

最后，`@ts-nocheck` 指令将完全移除文件的类型检查。

要使用它，请在文件顶部添加指令：

```tsx
// @ts-nocheck
```

禁用所有检查后，TypeScript 不会向你显示任何错误，但它也无法保护你免受运行代码时可能出现的任何运行时问题的影响。

一般来说，你不应该使用 `@ts-nocheck`。我个人曾因为没有注意到文件顶部的 `@ts-nocheck` 而在大型文件中浪费了数小时的时间。

### 抑制错误 vs `as any`

TypeScript 开发人员工具箱中还有一个工具也能够抑制错误，但它不是注释指令 —— `as any`。

`as any` 是一个非常强大的工具，因为它将对 TypeScript 的谎言 (`as`) 与禁用所有类型检查的类型 (`any`) 结合起来。

这意味着你可以用它来抑制几乎任何错误。我们上面的例子？没问题：

```typescript
const result = addOne({} as any);
```

`as any` 将空对象转换为 `any`，这会禁用所有类型检查。这意味着 `addOne` 会很乐意接受它。

#### `as any` vs 错误抑制指令

当有多种选择来抑制错误时，我更喜欢使用 `as any`。错误抑制指令过于宽泛 —— 它们针对的是整行代码。这可能导致意外抑制了你不想抑制的错误：

```typescript
// @ts-ignore
const result = addone("one");
```

在这里，我们调用的是 `addone` 而不是 `addOne`。错误抑制指令会抑制这个错误，但它也会抑制该行可能发生的任何其他错误。

改用 `as any` 则更精确：

```ts twoslash
// @errors: 2552
const addOne = (num: number) => num + 1;
// ---cut---
const result = addone("one" as any);
```

现在，你只会抑制你想要抑制的错误。

## 何时抑制错误

我们讨论过的每一种错误抑制工具，基本上都是告诉 TypeScript “保持安静”的一种方式。TypeScript 并不会试图限制你尝试使其安静的频率。完全有可能每次遇到错误时，你都可以用 `@ts-ignore` 或 `as any` 来抑制它。

采用这种方法会限制 TypeScript 的作用。你的代码会编译通过，但你可能会遇到更多的运行时错误。

但有些时候，抑制错误是个好主意。让我们探讨几种不同的场景。

### 当你比 TypeScript 知道得更多时

关于 TypeScript，重要的一点是要记住，你实际上是在编写 JavaScript。

编译时和运行时之间的这种脱节意味着类型*有时可能是错误的*。这可能意味着你比 TypeScript 更了解运行时代码。

当第三方库没有良好的类型定义时，或者当你使用 TypeScript 难以理解的复杂模式时，就可能发生这种情况。

错误抑制指令因此而存在。它们让你弥合 TypeScript 和它产生的 JavaScript 之间有时出现的差异。

但是这种凌驾于 TypeScript 之上的感觉可能很危险。所以，让我们把它和一种非常相似的感觉进行比较：

### 当 TypeScript 表现得“愚蠢”时

有些模式比其他模式更适合类型化。更动态的模式可能更难让 TypeScript 理解，并且会导致你抑制更多的错误。

一个简单的例子是构造一个对象。在 JavaScript 中，这两种模式之间没有真正的区别：

```ts twoslash
// @errors: 2339
// 静态
const obj = {
  a: 1,
  b: 2,
};

// 动态
const obj2 = {};

obj2.a = 1;
obj2.b = 2;
```

在第一种模式中，我们通过传入键和值来构造一个对象。在第二种模式中，我们构造一个空对象，然后再添加键和值。第一种模式是静态的，第二种是动态的。

但是在 TypeScript 中，第一种模式更容易使用。TypeScript 可以将 `obj` 的类型推断为 `{ a: number, b: number }`。但是它无法推断 `obj2` 的类型 —— 它只是一个空对象。事实上，当你尝试这样做时，你会收到错误。

但是如果你习惯于以动态方式构造对象，这可能会令人沮丧。你知道 `obj2` 会有一个 `a` 键和一个 `b` 键，但 TypeScript 不知道。

在这些情况下，很容易想通过使用 `as` 来稍微变通一下规则，告诉 TypeScript 你知道自己在做什么：

```typescript
const obj2 = {} as { a: number; b: number };

obj2.a = 1;
obj2.b = 2;
```

这与第一种情况（你知道的比 TypeScript 多）有细微的不同。在这种情况下，你可以进行一个简单的运行时重构，让 TypeScript 满意并避免抑制错误。

你对 TypeScript 越有经验，就越能发现这些模式。你将能够发现 TypeScript 缺乏关键信息（需要 `as`）的情况，或者你正在使用的模式没有让 TypeScript 正确工作的情况。

所以，如果你想抑制一个错误，看看是否可以重构你的代码，使其采用 TypeScript 更容易理解的模式。毕竟，顺流而下比逆流而上更容易。

### 当你不理解错误时

假设你已经编码了几个小时。一个未读的 Slack 消息通知正在闪烁。这个功能几乎完成了，除了一些你需要添加的类型。你 20 分钟后有一个电话。然后 TypeScript 显示了一个你不理解的错误。

TypeScript 错误可能非常难以阅读。它们可能很长，多层嵌套，并且充满了你从未听说过的类型引用。

正是在这个时候，TypeScript 会让人感觉最沮丧。这足以让许多开发人员永远放弃 TypeScript。

所以，你抑制了这个错误。你添加了一个 `@ts-ignore` 或一个 `as any` 然后继续。

几周后，一个 bug 被报告了。你最终回到了代码库的同一区域。然后你将错误追溯到你抑制的那一行。

你通过抑制错误节省的时间，最终会反噬你。你不是在节省时间，而是在借用时间。

正是在这种情况下，当你无法理解错误时，我建议你坚持下去。TypeScript 正试图与你沟通。尝试重构你的运行时代码。使用 IDE Superpowers 章节中提到的所有工具来调查错误中提到的类型。

把修复 TypeScript 错误所花费的时间看作是对自己的投资。你既在修复未来潜在的 bug，也在提升自己的理解水平。

## 练习

### 练习 2：向 TypeScript 提供附加信息

此 `handleFormData` 函数接受一个参数 `e`，其类型为 `SubmitEvent`，这是 DOM 类型中的一个全局类型，在提交表单时会发出该事件。

在函数内部，我们使用 `SubmitEvent` 上可用的方法 `e.preventDefault()` 来阻止表单的默认提交操作。然后我们尝试使用 `e.target` 创建一个新的 `FormData` 对象 `data`：

```ts twoslash
// @lib: dom,es2023,dom.iterable
// @errors: 2345
const handleFormData = (e: SubmitEvent) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const value = Object.fromEntries(data.entries());
  return value;
};
```

在运行时，此代码完美运行。然而，在类型级别，TypeScript 在 `e.target` 下显示一个错误。你的任务是向 TypeScript 提供附加信息以解决该错误。

### 练习 4：使用断言解决问题

这里我们将重新审视之前的练习，但用不同的方式解决它。

`findUsersByName` 函数的第一个参数是一些 `searchParams`，其中 `name` 是一个可选的字符串属性。第二个参数是 `users`，它是一个包含 `id` 和 `name` 属性的对象的数组：

```ts twoslash
// @errors: 2345
const findUsersByName = (
  searchParams: { name?: string },
  users: {
    id: string;
    name: string;
  }[]
) => {
  if (searchParams.name) {
    return users.filter((user) => user.name.includes(searchParams.name));
  }

  return users;
};
```

如果定义了 `searchParams.name`，我们希望使用此 `name` 过滤 `users` 数组。你的挑战是调整代码，使错误消失。

以前我们通过将 `searchParams.name` 提取到一个 const 变量中并对其进行检查来解决此挑战。

然而，这一次你需要用两种不同的方法来解决它：一次使用 `as`，一次使用非空断言。

请注意，这比以前的解决方案稍微不安全，但它仍然是一个值得学习的好技巧。

### 练习 6：强制执行有效配置

我们回到 `configurations` 对象，它包括 `development`、`production` 和 `staging`。这些成员中的每一个都包含与其环境相关的特定设置：

```ts twoslash
// @errors: 2578
const configurations = {
  development: {
    apiBaseUrl: "http://localhost:8080",
    timeout: 5000,
  },
  production: {
    apiBaseUrl: "https://api.example.com",
    timeout: 10000,
  },
  staging: {
    apiBaseUrl: "https://staging.example.com",
    timeout: 8000,
    // @ts-expect-error
    notAllowed: true,
  },
};
```

我们还有一个 `Environment` 类型以及一个通过的测试用例，用于检查 `Environment` 是否等于 `"development" | "production" | "staging"`：

```ts
type Environment = keyof typeof configurations;

type test = Expect<
  Equal<Environment, "development" | "production" | "staging">
>;
```

尽管测试用例通过了，但我们在 `configurations` 内部的 `staging` 对象中有一个错误。我们期望 `notAllowed: true` 上出现错误，但 `@ts-expect-error` 指令不起作用，因为 TypeScript 没有识别出 `notAllowed` 是不允许的。

你的任务是确定一种合适的方法来注解我们的 `configurations` 对象，以便从中保留准确的 `Environment` 推断，同时为不允许的成员抛出错误。提示：考虑使用一个辅助类型，允许你指定数据形状。

### 练习 7：变量注解 vs. `as` vs. `satisfies`

在这个练习中，我们将研究 TypeScript 中的三种不同设置：变量注解、`as` 和 `satisfies`。

第一种情况包括将 `const obj` 声明为空对象，然后对其应用键 `a` 和 `b`。使用 `as Record<string, number>`，我们期望 `obj` 或 `a` 的类型是数字：

```typescript
const obj = {} as Record<string, number>;
obj.a = 1;
obj.b = 2;

type test = Expect<Equal<typeof obj.a, number>>;
```

其次，我们有一个 `menuConfig` 对象，它被分配了一个 `Record` 类型，键为 `string`。`menuConfig` 期望具有一个包含 `label` 和 `link` 属性的对象，或者一个具有 `label` 和 `children` 属性的对象，其中 `children` 包含具有 `label` 和 `link` 的对象数组：

```ts twoslash
// @errors: 2339
import { Equal, Expect } from "@total-typescript/helpers";

// ---cut---
const menuConfig: Record<
  string,
  | {
      label: string;
      link: string;
    }
  | {
      label: string;
      children: {
        label: string;
        link: string;
      }[];
    }
> = {
  home: {
    label: "Home",
    link: "/home",
  },
  services: {
    label: "Services",
    children: [
      {
        label: "Consulting",
        link: "/services/consulting",
      },
      {
        label: "Development",
        link: "/services/development",
      },
    ],
  },
};
type tests = [
  Expect<Equal<typeof menuConfig.home.label, string>>,
  Expect<
    Equal<
      typeof menuConfig.services.children,
      {
        label: string;
        link: string;
      }[]
    >
  >
];
```

在第三种情况下，我们尝试将 `satisfies` 与 `document.getElementById('app')` 和 `HTMLElement` 一起使用，但这会导致错误：

```ts twoslash
// @errors: 1360 2344
import { Equal, Expect } from "@total-typescript/helpers";
// ---cut---
// 第三种情况
const element = document.getElementById("app") satisfies HTMLElement;

type test3 = Expect<Equal<typeof element, HTMLElement>>;
```

你的工作是重新排列注解以纠正这些问题。

在本练习结束时，你应该分别使用过一次 `as`、变量注解和 `satisfies`。

### 练习 8：创建一个深度只读对象

这里我们有一个 `routes` 对象：

```ts twoslash
// @errors: 2578
const routes = {
  "/": {
    component: "Home",
  },
  "/about": {
    component: "About",
    // @ts-expect-error
    search: "?foo=bar",
  },
};

// @ts-expect-error
routes["/"].component = "About";
```

在 `/about` 键下添加 `search` 字段时，应该会引发错误，但目前没有。我们还期望一旦创建 `routes` 对象，就不能对其进行修改。例如，将 `About` 分配给 `Home component` 应该会导致错误，但 `@ts-expect-error` 指令告诉我们没有问题。

在测试中，我们期望访问 `routes` 对象的属性应返回 `Home` 和 `About`，而不是将这些解释为字面量，但这两个目前都失败了：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";
const routes = {
  "/": {
    component: "Home",
  },
  "/about": {
    component: "About",
    search: "?foo=bar",
  },
};

// ---cut---
type tests = [
  Expect<Equal<(typeof routes)["/"]["component"], "Home">>,
  Expect<Equal<(typeof routes)["/about"]["component"], "About">>
];
```

你的任务是更新 `routes` 对象类型，以便解决所有错误。这将需要你使用 `satisfies` 以及另一个确保对象是深度只读的注解。

### 解决方案 2：向 TypeScript 提供附加信息

我们在这个挑战中遇到的错误是 `EventTarget | null` 类型与 `HTMLFormElement` 类型的必需参数不兼容。问题在于这些类型不匹配，并且不允许 `null`：

```ts twoslash
// @lib: dom,es2023,dom.iterable
// @errors: 2345
const handleFormData = (e: SubmitEvent) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const value = Object.fromEntries(data.entries());
  return value;
};
```

首先，必须确保 `e.target` 不为 null。

#### 使用 `as`

我们可以使用 `as` 关键字将 `e.target` 强制转换为特定类型。

然而，如果将其强制转换为 `EventTarget`，错误将继续发生：

```ts twoslash
// @lib: dom,es2023,dom.iterable
// @errors: 2345
const handleFormData = (e: SubmitEvent) => {
  e.preventDefault();
  const data = new FormData(e.target as EventTarget);
  const value = Object.fromEntries(data.entries());
  return value;
};
```

因为我们知道代码在运行时有效并且有测试覆盖它，所以我们可以强制 `e.target` 的类型为 `HTMLFormElement`：

```typescript
const data = new FormData(e.target as HTMLFormElement);
```

或者，我们可以创建一个新变量 `target`，并将转换后的值赋给它：

```typescript
const target = e.target as HTMLFormElement;
const data = new FormData(target);
```

无论哪种方式，此更改都解决了错误，并且 `target` 现在被推断为 `HTMLFormElement`，代码按预期运行。

#### 使用 `as any`

一个更快的解决方案是对 `e.target` 变量使用 `as any`，以告诉 TypeScript 我们不关心变量的类型：

```typescript
const data = new FormData(e.target as any);
```

虽然使用 `as any` 可以让我们更快地绕过错误消息，但它确实有其缺点。

例如，对于来自 `HTMLFormElement` 类型的其他 `e.target` 属性，我们将无法利用自动完成或进行类型检查。

当遇到这种情况时，最好使用你能使用的最具体的 `as` 断言。这不仅向 TypeScript，也向可能阅读你代码的其他开发人员表明你清楚地了解 `e.target` 是什么。

### 解决方案 4：使用断言解决问题

在 `findUsersByName` 函数内部，TypeScript 因为一个奇怪的原因抱怨 `searchParams.name`。

想象一下，如果 `searchParams.name` 是一个 getter，它会随机返回 `string` 或 `undefined`：

```typescript
const searchParams = {
  get name() {
    return Math.random() > 0.5 ? "John" : undefined;
  },
};
```

现在，TypeScript 无法确定 `searchParams.name` 永远是一个 `string`。这就是它在 `filter` 函数内部报错的原因。

这就是为什么我们之前能够通过将 `searchParams.name` 提取到一个常量变量中并对其进行检查来解决这个问题 —— 这保证了名称将是一个字符串。

然而，这次我们将以不同的方式解决它。

目前，`searchParams.name` 的类型是 `string | undefined`。我们想告诉 TypeScript 我们比它知道得更多，并且我们知道在 `filter` 回调函数内部 `searchParams.name` 永远不会是 `undefined`。

```ts twoslash
// @errors: 2345
const findUsersByName = (
  searchParams: { name?: string },
  users: {
    id: string;
    name: string;
  }[]
) => {
  if (searchParams.name) {
    return users.filter((user) => user.name.includes(searchParams.name));
  }
  return users;
};
```

#### 添加 `as string`

解决此问题的一种方法是在 `searchParams.name` 后面添加 `as string`：

```ts twoslash
const findUsersByName = (
  searchParams: { name?: string },
  users: {
    id: string;
    name: string;
  }[]
) => {
  if (searchParams.name) {
    return users.filter((user) =>
      user.name.includes(searchParams.name as string)
    );
  }
  return users;
};
```

这会移除 `undefined`，现在它只是一个 `string`。

#### 添加非空断言

解决此问题的另一种方法是向 `searchParams.name` 添加非空断言。这可以通过向我们试图访问的属性添加 `!` 后缀运算符来完成：

```ts twoslash
const findUsersByName = (
  searchParams: { name?: string },
  users: {
    id: string;
    name: string;
  }[]
) => {
  if (searchParams.name) {
    return users.filter((user) => user.name.includes(searchParams.name!));
  }
  return users;
};
```

`!` 操作符告诉 TypeScript 从变量中移除任何 `null` 或 `undefined` 类型。这将使我们只剩下 `string`。

这两种解决方案都将消除错误并使代码按预期工作。但是它们都不能保护我们免受那个随机返回 `string | undefined` 的阴险的 `get` 函数的影响。

由于这是一个相当罕见的情况，我们甚至可以说 TypeScript 在这里有点过于保护了。所以，断言似乎是正确的选择。

### 解决方案 6：强制执行有效配置

第一步是确定我们的 `configurations` 对象的结构。

在这种情况下，将其设置为一个 `Record` 是合理的，其中键将是 `string`，值将是一个具有 `apiBaseUrl` 和 `timeout` 属性的对象。

```typescript
const configurations: Record<
  string,
  {
    apiBaseUrl: string;
    timeout: number
  }
> = {
  ...
```

此更改使 `@ts-expect-error` 指令按预期工作，但我们现在有一个与 `Environment` 类型未正确推断相关的错误：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";

const configurations: Record<
  string,
  {
    apiBaseUrl: string;
    timeout: number;
  }
> = {
  development: {
    apiBaseUrl: "http://localhost:8080",
    timeout: 5000,
  },
  production: {
    apiBaseUrl: "https://api.example.com",
    timeout: 10000,
  },
  staging: {
    apiBaseUrl: "https://staging.example.com",
    timeout: 8000,
    // @ts-expect-error
    notAllowed: true,
  },
};

// ---cut---
type Environment = keyof typeof configurations;
//   ^?

type test = Expect<
  Equal<Environment, "development" | "production" | "staging">
>;
```

我们需要确保 `configurations` 仍然被推断为其类型，同时也要对传递给它的东西进行类型检查。

这是 `satisfies` 关键字的完美应用。

我们将不再把 `configurations` 对象注解为 `Record`，而是使用 `satisfies` 关键字进行类型约束：

```typescript
const configurations = {
  development: {
    apiBaseUrl: "http://localhost:8080",
    timeout: 5000,
  },
  production: {
    apiBaseUrl: "https://api.example.com",
    timeout: 10000,
  },
  staging: {
    apiBaseUrl: "https://staging.example.com",
    timeout: 8000,
    // @ts-expect-error
    notAllowed: true,
  },
} satisfies Record<
  string,
  {
    apiBaseUrl: string;
    timeout: number;
  }
>;
```

这允许我们指定传递给配置对象的值必须遵守类型中定义的标准，同时仍然允许类型系统为我们的开发、生产和预演环境推断正确的类型。

### 解决方案 7：变量注解 vs. `as` vs. `satisfies`

让我们逐步解决 `satisfies`、`as` 和变量注解的方案。

#### 何时使用 `satisfies`

对于使用 `Record` 的第一种情况，`satisfies` 关键字不起作用，因为我们不能向空对象添加动态成员。

```ts twoslash
// @errors: 2339
const obj = {} satisfies Record<string, number>;

obj.a = 1;
```

在 `menuConfig` 对象的第二种情况中，我们开始时遇到关于 `menuConfig.home` 和 `menuConfig.services` 在两个成员上都不存在的错误。

这是一个线索，表明我们需要使用 `satisfies` 来确保在不更改推断的情况下检查值：

```typescript
const menuConfig = {
  home: {
    label: "Home",
    link: "/home",
  },
  services: {
    label: "Services",
    children: [
      {
        label: "Consulting",
        link: "/services/consulting",
      },
      {
        label: "Development",
        link: "/services/development",
      },
    ],
  },
} satisfies Record<
  string,
  | {
      label: string;
      link: string;
    }
  | {
      label: string;
      children: {
        label: string;
        link: string;
      }[];
    }
>;
```

通过这种 `satisfies` 的用法，测试按预期通过。

只是为了检查第三种情况，`satisfies` 不适用于 `document.getElementById("app")`，因为它被推断为 `HTMLElement | null`：

```ts twoslash
// @errors: 1360
const element = document.getElementById("app") satisfies HTMLElement;
```

#### 何时使用 `as`

如果我们尝试在第三个例子中使用变量注解，我们会得到与 `satisfies` 相同的错误：

```ts twoslash
// @errors: 2322
const element: HTMLElement = document.getElementById("app");
```

通过排除法，`as` 是此场景的正确选择：

```typescript
const element = document.getElementById("app") as HTMLElement;
```

通过此更改，`element` 被推断为 `HTMLElement`。

#### 使用变量注解

这就引出了第一种情况，其中使用变量注解是正确的选择：

```typescript
const obj: Record<string, number> = {};
```

请注意，我们可以在这里使用 `as`，但这不太安全，并且可能导致复杂化，因为我们正在强制一个值具有某种类型。变量注解只是将变量表示为该特定类型，并检查传递给它的任何内容，这是更正确、更安全的方法。

通常，当你在 `as` 或变量注解之间进行选择时，请选择变量注解。

#### 重要的启示

本练习的关键在于掌握何时使用 `as`、`satisfies` 和变量注解的心智模型：

当你想要告诉 TypeScript 你比它知道得更多时，使用 `as`。

当你想要确保在不更改该值的推断的情况下检查该值时，使用 `satisfies`。

其余时间，使用变量注解。

### 解决方案 8：创建一个深度只读对象

我们开始时在 `routes` 内部有一个 `@ts-expect-error` 指令，它没有按预期工作。

因为我们希望配置对象具有特定的形状，同时仍然能够访问它的某些部分，所以这是一个 `satisfies` 的完美用例。

在 `routes` 对象的末尾，添加一个 `satisfies`，它将是一个 `Record`，键为 `string`，值为一个具有 `component` 属性（类型为 `string`）的对象：

```tsx
const routes = {
  "/": {
    component: "Home",
  },
  "/about": {
    component: "About",
    // @ts-expect-error
    search: "?foo=bar",
  },
} satisfies Record<
  string,
  {
    component: string;
  }
>;
```

此更改解决了 `routes` 对象内部 `@ts-expect-error` 指令的问题，但我们仍然有一个与 `routes` 对象不是只读相关的错误。

要解决此问题，我们需要将 `as const` 应用于 `routes` 对象。这将使 `routes` 只读并添加必要的不可变性。

如果我们尝试在 `satisfies` 之后添加 `as const`，我们将收到以下错误：

```ts twoslash
// @errors: 1355
const routes = {
  // ...内容
} satisfies Record<
  string,
  {
    component: string;
  }
> as const;
```

换句话说，`as const` 只能应用于值，而不能应用于类型。

使用 `as const` 的正确方法是将其放在 `satisfies` 之前：

```tsx
const routes = {
  // routes 和以前一样
} as const satisfies Record<
  string,
  {
    component: string;
  }
>;
```

现在我们的测试按预期通过了。

当你需要为配置对象指定特定形状同时强制执行不可变性时，这种组合使用 `as const` 和 `satisfies` 的设置是理想的。
