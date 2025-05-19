在我们关于联合 (unions) 和收窄 (narrowing) 的章节中，我们探讨了 TypeScript 如何从我们代码的逻辑流程中推断类型。在本章中，我们将看到可变性 (mutability) ——即一个值是否可以被改变——如何影响类型推断。

## 可变性 (Mutability) 和推断 (Inference)

### 变量声明和类型推断 (Variable Declaration and Type Inference)

你在 TypeScript 中声明变量的方式会影响它们是否可以被更改。

#### TypeScript 如何推断 `let` (How TypeScript Infers `let`)

当使用 `let` 关键字时，变量是*可变的* (mutable) 并且可以被重新赋值。

思考这个 `AlbumGenre` 类型：一个表示专辑可能流派的字面量值的联合：

```ts twoslash
type AlbumGenre = "rock" | "country" | "electronic";
```

使用 `let`，我们可以声明一个变量 `albumGenre` 并将其赋值为 `"rock"`。然后我们可以尝试将 `albumGenre` 传递给一个期望 `AlbumGenre` 类型的函数：

```ts twoslash
// @errors: 2345
type AlbumGenre = "rock" | "country" | "electronic";

// ---cut---
let albumGenre = "rock";

const handleGenre = (genre: AlbumGenre) => {
  // ...
};

handleGenre(albumGenre);
```

因为在声明变量时使用了 `let`，TypeScript 理解该值稍后可以被更改。在这种情况下，它将 `albumGenre` 推断为 `string` 而不是特定的字面量类型 `"rock"`。在我们的代码中，我们可以这样做：

```ts twoslash
let albumGenre = "rock";

// ---cut---
albumGenre = "country";
```

因此，它会推断出一个更宽泛的类型，以适应变量被重新赋值的情况。

我们可以通过为 `let` 变量指定一个特定的类型来修复上面的错误：

```ts twoslash
// @errors: 2345
type AlbumGenre = "rock" | "country" | "electronic";

// ---cut---
let albumGenre: AlbumGenre = "rock";

const handleGenre = (genre: AlbumGenre) => {
  // ...
};

handleGenre(albumGenre); // 不再有错误
```

现在，`albumGenre` *可以*被重新赋值，但只能赋值为 `AlbumGenre` 联合中的成员。因此，当传递给 `handleGenre` 时，它将不再显示错误。

但还有另一个有趣的解决方案。

#### TypeScript 如何推断 `const` (How TypeScript Infers `const`)

当使用 `const` 时，变量是*不可变的* (immutable) 并且不能被重新赋值。当我们将变量声明更改为使用 `const` 时，TypeScript 会更窄地推断类型：

```ts twoslash
// @errors: 2345
type AlbumGenre = "rock" | "country" | "electronic";

// ---cut---
const albumGenre = "rock";

const handleGenre = (genre: AlbumGenre) => {
  // ...
};

handleGenre(albumGenre); // 没有错误
```

赋值不再有错误，并且将鼠标悬停在 `albumDetails` 对象内的 `albumGenre` 上会显示 TypeScript 已将其推断为字面量类型 `"rock"`。

如果我们尝试在将 `albumGenre` 声明为 `const` 后更改其值，TypeScript 将显示错误：

```ts twoslash
// @errors: 2588
type AlbumGenre = "rock" | "country" | "electronic";

const albumGenre = "rock";

// ---cut---
albumGenre = "country";
```

TypeScript 正在模仿 JavaScript 对 `const` 的处理方式，以防止可能的运行时错误。当你用 `const` 声明一个变量时，TypeScript 会将其推断为你指定的字面量类型。

所以，TypeScript 利用 JavaScript 的工作方式为其优势。这通常会鼓励你在声明变量时使用 `const` 而不是 `let`，因为它更严格一些。

### 对象属性推断 (Object Property Inference)

当涉及到对象属性时，`const` 和 `let` 的情况变得稍微复杂一些。

在 JavaScript 中，对象是可变的，这意味着它们的属性可以在创建后被更改。

对于这个例子，我们有一个 `AlbumAttributes` 类型，它包含一个 `status` 属性，该属性具有表示可能的专辑状态的字面量值的联合：

```typescript
type AlbumAttributes = {
  status: "new-release" | "on-sale" | "staff-pick";
};
```

假设我们有一个 `updateStatus` 函数，它接受一个 `AlbumAttributes` 对象：

```ts twoslash
// @errors: 2345
type AlbumAttributes = {
  status: "new-release" | "on-sale" | "staff-pick";
};
// ---cut---
const updateStatus = (attributes: AlbumAttributes) => {
  // ...
};

const albumAttributes = {
  status: "on-sale",
};

updateStatus(albumAttributes);
```

TypeScript 在 `updateStatus` 函数调用内的 `albumAttributes` 下方给出了一个错误，其消息与我们之前看到的类似。

发生这种情况是因为 TypeScript 已将 `status` 属性推断为 `string` 而不是特定的字面量类型 `"on-sale"`。与 `let` 类似，TypeScript 理解该属性稍后可以被重新赋值：

```typescript
albumAttributes.status = "new-release";
```

即使 `albumAttributes` 对象是用 `const` 声明的，情况也是如此。我们在调用 `updateStatus` 时遇到错误，因为 `status: string` 不能传递给期望 `status: "new-release" | "on-sale" | "staff-pick"` 的函数。TypeScript 试图保护我们免受潜在的运行时错误。

让我们看看解决这个问题的几种方法。

#### 使用内联对象 (Using an Inline Object)

一种方法是在调用 `updateStatus` 函数时内联对象，而不是单独声明它：

```typescript
updateStatus({
  status: "on-sale",
}); // 没有错误
```

当内联对象时，TypeScript 知道 `status` 在传递给函数之前不可能被更改，所以它会更窄地推断它。

#### 为对象添加类型 (Adding a Type to the Object)

另一种选择是显式声明 `albumAttributes` 对象的类型为 `AlbumAttributes`：

```typescript
const albumAttributes: AlbumAttributes = {
  status: "on-sale",
};

updateStatus(albumAttributes); // 没有错误
```

这与它在 `let` 中的工作方式类似。虽然 `albumAttributes.status` 仍然可以被重新赋值，但它只能被重新赋值为一个有效的值：

```typescript
albumAttributes.status = "new-release"; // 没有错误
```

这种行为对所有类对象结构都同样适用，包括数组和元组。我们将在练习中稍后研究这些。

### 只读对象属性 (Readonly Object Properties)

正如我们所见，在 JavaScript 中，对象属性默认是可变的。但是 TypeScript 允许我们更具体地说明对象的属性是否可以被改变。

要使属性只读（不可写），你可以使用 `readonly` 修饰符：

考虑这个 `Album` 接口，其中 `title` 和 `artist` 被标记为 `readonly`：

```typescript
interface Album {
  readonly title: string;
  readonly artist: string;
  status?: "new-release" | "on-sale" | "staff-pick";
  genre?: string[];
}
```

一旦创建了 `Album` 对象，它的 `title` 和 `artist` 属性就会被锁定并且不能更改。然而，可选的 `status` 和 `genre` 属性仍然可以被修改。

请注意，这只发生在*类型*层面。在运行时，属性仍然是可变的。TypeScript 只是在帮助我们捕获潜在的错误。

#### `Readonly` 类型助手 (The `Readonly` Type Helper)

如果你想指定一个对象的*所有*属性都应该是只读的，TypeScript 提供了一个名为 `Readonly` 的类型助手。

要使用它，你只需用 `Readonly` 包装对象类型。

以下是使用 `Readonly` 创建 `Album` 对象的示例：

```typescript
const readOnlyWhiteAlbum: Readonly<Album> = {
  title: "The Beatles (White Album)",
  artist: "The Beatles",
  status: "staff-pick",
};
```

因为 `readOnlyWhiteAlbum` 对象是使用 `Readonly` 类型助手创建的，所以它的任何属性都不能被修改：

```ts twoslash
// @errors: 2540
type Album = {
  title: string;
  artist: string;
  status?: "new-release" | "on-sale" | "staff-pick";
  genre?: string[];
};

const readOnlyWhiteAlbum: Readonly<Album> = {
  title: "The Beatles (White Album)",
  artist: "The Beatles",
  status: "staff-pick",
};
// ---cut---
readOnlyWhiteAlbum.genre = ["rock", "pop", "unclassifiable"];
```

请注意，与 TypeScript 的许多类型助手一样，`Readonly` 强制执行的不可变性仅在第一层级上起作用。它不会递归地使属性只读。

### 只读数组 (Readonly Arrays)

与对象属性一样，数组和元组也可以通过使用 `readonly` 修饰符来使其不可变。

以下是如何使用 `readonly` 修饰符创建只读的流派数组。一旦数组被创建，其内容就不能被修改：

```typescript
const readOnlyGenres: readonly string[] = ["rock", "pop", "unclassifiable"];
```

与 `Array` 语法类似，TypeScript 还提供了一个 `ReadonlyArray` 类型助手，其功能与上述语法相同：

```typescript
const readOnlyGenres: ReadonlyArray<string> = ["rock", "pop", "unclassifiable"];
```

这两种方法在功能上是相同的。将鼠标悬停在 `readOnlyGenres` 变量上会显示 TypeScript 已将其推断为只读数组：

```typescript
// hovering over `readOnlyGenres` shows:
const readOnlyGenres: readonly string[];
```

只读数组不允许使用会导致突变的数组方法，例如 `push` 和 `pop`：

```ts twoslash
// @errors: 2339
const readOnlyGenres: readonly string[] = ["rock", "pop", "unclassifiable"];

// ---cut---
readOnlyGenres.push("experimental");
```

然而，像 `map` 和 `reduce` 这样的方法仍然有效，因为它们会创建数组的副本并且不会改变原始数组。

```ts twoslash
// @errors: 2339
const readOnlyGenres: readonly string[] = ["rock", "pop", "unclassifiable"];

// ---cut---
const uppercaseGenres = readOnlyGenres.map((genre) => genre.toUpperCase()); // 没有错误

readOnlyGenres.push("experimental");
```

请注意，就像对象属性的 `readonly` 一样，这不会影响数组的运行时行为。这只是一种帮助捕获潜在错误的方法。

#### 只读数组和可变数组如何协同工作 (How Read-Only and Mutable Arrays Work Together)

为了帮助理解这个概念，让我们看看只读数组和可变数组是如何协同工作的。

这里有两个 `printGenre` 函数，它们在功能上是相同的，除了 `printGenresReadOnly` 接受一个只读的流派数组作为参数，而 `printGenresMutable` 接受一个可变的数组：

```typescript
function printGenresReadOnly(genres: readonly string[]) {
  // ...
}

function printGenresMutable(genres: string[]) {
  // ...
}
```

当我们创建一个可变的流派数组时，它可以作为参数传递给这两个函数而不会出错：

```typescript
const mutableGenres = ["rock", "pop", "unclassifiable"];

printGenresReadOnly(mutableGenres);
printGenresMutable(mutableGenres);
```

这是因为在 `printGenresReadOnly` 函数参数上指定 `readonly` 仅保证它不会改变数组的内容。因此，如果我们传递一个可变数组，它不会被更改，这无关紧要。

然而，反之则不然。

如果我们声明一个只读数组，我们只能将它传递给 `printGenresReadOnly`。尝试将其传递给 `printGenresMutable` 将产生错误：

```ts twoslash
// @errors: 2345
function printGenresReadOnly(genres: readonly string[]) {
  // ...
}

function printGenresMutable(genres: string[]) {
  // ...
}

// ---cut---
const readOnlyGenres: readonly string[] = ["rock", "pop", "unclassifiable"];

printGenresReadOnly(readOnlyGenres);
printGenresMutable(readOnlyGenres);
```

这是因为我们可能在 `printGenresMutable` 内部改变数组。如果我们传递了一个只读数组，（就会出问题）。

本质上，只读数组只能赋值给其他只读类型。这可能会在你的应用程序中病毒式传播：如果调用堆栈深处的函数期望一个 `readonly` 数组，那么该数组必须在整个过程中保持 `readonly`。但这样做会带来好处。它确保数组在沿着堆栈移动时不会以任何方式被改变。非常有用。

这里的要点是，即使你可以将可变数组赋值给只读数组，你也**不能**将只读数组赋值给可变数组。

### 练习 (Exercises)

#### 练习 1：对象数组的推断 (Exercise 1: Inference with an Array of Objects)

这里我们有一个 `modifyButtons` 函数，它接受一个对象数组，这些对象的 `type` 属性是 `"button"`、`"submit"` 或 `"reset"` 之一。

当尝试使用一个似乎符合契约的对象数组调用 `modifyButtons` 时，TypeScript 给出了一个错误：

```ts twoslash
// @errors: 2345
type ButtonAttributes = {
  type: "button" | "submit" | "reset";
};

const modifyButtons = (attributes: ButtonAttributes[]) => {};

const buttonsToChange = [
  {
    type: "button",
  },
  {
    type: "submit",
  },
];

modifyButtons(buttonsToChange);
```

你的任务是确定为什么会出现这个错误，然后解决它。

\<Exercise title="练习 1：对象数组的推断" filePath="/src/028-mutability/098-object-property-inference.problem.ts"\>\</Exercise\>

#### 练习 2：避免数组突变 (Exercise 2: Avoiding Array Mutation)

这个 `printNames` 函数接受一个 `name` 字符串数组并将其记录到控制台。然而，还有一些不起作用的 `@ts-expect-error` 注释，它们不应该允许添加或更改名称：

```ts twoslash
// @errors: 2578
function printNames(names: string[]) {
  for (const name of names) {
    console.log(name);
  }

  // @ts-expect-error
  names.push("John");

  // @ts-expect-error
  names[0] = "Billy";
}
```

你的任务是更新 `names` 参数的类型，以便数组不能被改变。有两种方法可以解决这个问题。

\<Exercise title="练习 2：避免数组突变" filePath="/src/028-mutability/103-readonly-arrays.problem.ts"\>\</Exercise\>

#### 练习 3：不安全的元组 (Exercise 3: An Unsafe Tuple)

这里我们有一个 `dangerousFunction`，它接受一个数字数组作为参数：

```typescript
const dangerousFunction = (arrayOfNumbers: number[]) => {
  arrayOfNumbers.pop();
  arrayOfNumbers.pop();
};
```

此外，我们定义了一个变量 `myHouse`，它是一个表示 `Coordinate` 的元组：

```typescript
type Coordinate = [number, number];
const myHouse: Coordinate = [0, 0];
```

我们的元组 `myHouse` 包含两个元素，而 `dangerousFunction` 的结构是从给定数组中弹出两个元素。

鉴于 `pop` 会从数组中移除最后一个元素，用 `myHouse` 调用 `dangerousFunction` 将会移除其内容。

目前，TypeScript 没有就此潜在问题向我们发出警报，如 `@ts-expect-error` 下的错误行所示：

```ts twoslash
// @errors: 2578
type Coordinate = [number, number];
const myHouse: Coordinate = [0, 0];

const dangerousFunction = (arrayOfNumbers: number[]) => {
  arrayOfNumbers.pop();
  arrayOfNumbers.pop();
};

// ---cut---
dangerousFunction(
  // @ts-expect-error
  myHouse
);
```

你的任务是调整 `Coordinate` 的类型，以便当我们尝试将 `myHouse` 传递给 `dangerousFunction` 时，TypeScript 会触发一个错误。

请注意，你只应更改 `Coordinate`，并保持函数不变。

\<Exercise title="练习 3：不安全的元组" filePath="/src/028-mutability/104.5-fixing-unsafe-tuples.problem.ts"\>\</Exercise\>

#### 解决方案 1：对象数组的推断 (Solution 1: Inference with an Array of Objects)

将鼠标悬停在 `buttonsToChange` 变量上会显示它被推断为一个对象数组，其中 `type` 属性的类型为 `string`：

```typescript
// hovering over buttonsToChange shows:
const buttonsToChange: {
  type: string;
}[];
```

这种推断的发生是因为我们的数组是可变的。我们可以将数组中第一个元素的类型更改为其他内容：

```typescript
buttonsToChange[0].type = "something strange";
```

这个更宽泛的类型与 `ButtonAttributes` 类型不兼容，后者期望 `type` 属性是 `"button"`、`"submit"` 或 `"reset"` 之一。

这里的修复方法是指定 `buttonsToChange` 是一个 `ButtonAttributes` 数组：

```typescript
type ButtonAttributes = {
  type: "button" | "submit" | "reset";
};

const modifyButton = (attributes: ButtonAttributes[]) => {};

const buttonsToChange: ButtonAttributes[] = [
  {
    type: "button",
  },
  {
    type: "submit",
  },
];

modifyButtons(buttonsToChange); // 没有错误
```

或者，我们可以直接将数组传递给 `modifyButtons` 函数：

```typescript
modifyButtons([
  {
    type: "button",
  },
  {
    type: "submit",
  },
]); // 没有错误
```

通过这样做，TypeScript 将更窄地推断 `type` 属性，错误将消失。

#### 解决方案 2：避免数组突变 (Solution 2: Avoiding Array Mutation)

这里有几种解决这个问题的方法。

##### 选项 1：添加 `readonly` 关键字 (Option 1: Add the `readonly` Keyword)

第一种解决方案是在 `string[]` 数组之前添加 `readonly` 关键字。它适用于整个 `string[]` 数组，将其转换为只读数组：

```typescript
function printNames(names: readonly string[]) {
  ...
}
```

通过这种设置，TypeScript 不允许你使用 `.push()` 添加项目或对数组执行任何其他修改。

##### 选项 2：使用 `ReadonlyArray` 类型助手 (Option 2: Use the `ReadonlyArray` Type Helper)

或者，你可以使用 `ReadonlyArray` 类型助手：

```typescript
function printNames(names: ReadonlyArray<string>) {
  ...
}
```

无论你使用这两种方法中的哪一种，当鼠标悬停在 `names` 参数上时，TypeScript 仍会显示 `readonly string[]`：

```typescript
// hovering over `names` shows:
(parameter) names: readonly string[]
```

两者在阻止数组被修改方面同样有效。

#### 解决方案 3：不安全的元组 (Solution 3: An Unsafe Tuple)

防止对 `Coordinate` 元组进行不必要更改的最佳方法是使其成为 `readonly` 元组：

```typescript
type Coordinate = readonly [number, number];
```

现在，当我们尝试将 `myHouse` 传递给 `dangerousFunction` 时，它会抛出 TypeScript 错误：

```ts twoslash
// @errors: 2345
type Coordinate = readonly [number, number];
const myHouse: Coordinate = [0, 0];

// ---cut---
const dangerousFunction = (arrayOfNumbers: number[]) => {
  arrayOfNumbers.pop();
  arrayOfNumbers.pop();
};

dangerousFunction(myHouse);
```

我们得到一个错误，因为函数的签名期望一个可修改的数字数组，但 `myHouse` 是一个只读元组。TypeScript 正在保护我们免受不必要的更改。

尽可能多地使用 `readonly` 元组是一个好习惯，以避免像本练习中这样的问题。

## 使用 `as const` 实现深度不可变性 (Deep Immutability with `as const`)

我们已经看到，对象和数组在 JavaScript 中是可变的。这导致 TypeScript *广泛地*推断它们的属性。

我们可以通过给属性一个类型注解来解决这个问题。但它仍然不能推断属性的字面量类型。

```typescript
const albumAttributes: AlbumAttributes = {
  status: "on-sale",
};

// hovering over albumAttributes shows:
const albumAttributes: {
  status: "new-release" | "on-sale" | "staff-pick";
};
```

`albumAttributes.status` 没有被推断为 `"on-sale"`，而是被推断为 `"new-release" | "on-sale" | "staff-pick"`。

让 TypeScript 正确推断的一种方法是，以某种方式将整个对象及其所有属性标记为不可变的。这将告诉 TypeScript 对象及其属性不能被更改，因此它可以自由地推断属性的字面量类型。

这就是 `as const`断言发挥作用的地方。我们可以用它来将一个对象及其所有属性标记为常量，这意味着它们一旦创建就不能被更改。

```typescript
const albumAttributes = {
  status: "on-sale",
} as const;

// hovering over albumAttributes shows:
const albumAttributes: {
  readonly status: "on-sale";
};
```

`as const`断言使整个对象深度只读，包括其所有属性。这意味着 `albumAttributes.status` 现在被推断为字面量类型 `"on-sale"`。

尝试更改 `status` 属性将导致错误：

```ts twoslash
// @errors: 2540
const albumAttributes = {
  status: "on-sale",
} as const;

// ---cut---
albumAttributes.status = "new-release";
```

这使得 `as const` 非常适合那些你不希望更改的大型配置对象。

就像 `readonly` 修饰符一样，`as const` 只影响类型层面。在运行时，对象及其属性仍然是可变的。

### `as const` 与变量注解 (`as const` vs Variable Annotation)

你可能想知道如果我们将 `as const` 与变量注解结合起来会发生什么。它将如何被推断？

```typescript
const albumAttributes: AlbumAttributes = {
  status: "on-sale",
} as const;
```

你可以将此代码视为两种力量之间的竞争：作用于值的 `as const` 断言和作用于变量的注解。

当出现这种竞争时，变量注解获胜。变量*拥有*该值，并忘记之前显式的值是什么。

这意味着，奇怪的是，`status` 属性被推断为可变的：

```typescript
albumAttributes.status = "new-release"; // 没有错误
```

`as const` 断言被变量注解覆盖了。不好玩。

我们将在关于注解和断言的章节中进一步探讨变量和值之间的这种交互。

### `as const` 与 `Object.freeze` 的比较 (Comparing `as const` with `Object.freeze`)

在 JavaScript 中，`Object.freeze` 方法是一种在运行时创建不可变对象的方法。`Object.freeze` 和 `as const` 之间存在一些显著差异。

对于这个例子，我们将创建一个使用 `Object.freeze` 的 `shelfLocations` 对象：

```typescript
const shelfLocations = Object.freeze({
  entrance: {
    status: "on-sale",
  },
  frontCounter: {
    status: "staff-pick",
  },
  endCap: {
    status: "new-release",
  },
});
```

将鼠标悬停在 `shelfLocations` 上显示该对象已应用 `Readonly` 修饰符：

```typescript
// hovering over shelfLocations shows:
const shelfLocations: Readonly<{
  entrance: {
    status: string;
  };
  frontCounter: {
    status: string;
  };
  endCap: {
    status: string;
  };
}>;
```

回想一下，`Readonly` 修饰符仅对对象的*第一层级*起作用。如果我们尝试修改 `frontCounter` 属性，TypeScript 将抛出错误：

```ts twoslash
// @errors: 2540
const shelfLocations = Object.freeze({
  entrance: {
    status: "on-sale",
  },
  frontCounter: {
    status: "staff-pick",
  },
  endCap: {
    status: "new-release",
  },
});

// ---cut---
shelfLocations.frontCounter = {
  status: "new-release",
};
```

然而，我们能够更改特定位置的嵌套 `status` 属性：

```typescript
shelfLocations.entrance.status = "new-release";
```

这与 `Object.freeze` 在 JavaScript 中的工作方式一致。它只在第一层级上使对象及其属性只读。它不会使整个对象深度只读。

使用 `as const` 使整个对象深度只读，包括所有嵌套属性：

```ts twoslash
const shelfLocations = {
  entrance: {
    status: "on-sale",
  },
  frontCounter: {
    status: "staff-pick",
  },
  endCap: {
    status: "new-release",
  },
} as const;

console.log(shelfLocations);
//          ^?
```

当然，这只是一个类型级别的注解。`Object.freeze` 为你提供运行时不可变性，而 `as const` 为你提供类型级别不可变性。我实际上更喜欢后者——在运行时做更少的工作总是一件好事。

因此，虽然 `as const` 和 `Object.freeze` 都会强制执行不可变性，但 `as const` 是更方便和高效的选择。除非你特别需要在运行时冻结对象的顶层，否则你应该坚持使用 `as const`。

### 练习 (Exercises)

#### 练习 1：从函数返回元组 (Exercise 1: Returning A Tuple From A Function)

在本练习中，我们处理一个名为 `WorkspaceData` 的异步函数，该函数从 URL 获取数据并返回结果。

无论函数成功还是失败，它都会返回一个元组。如果获取操作失败，元组的第一个成员包含错误消息；如果操作成功，则第二个成员包含获取的数据。

以下是该函数当前的实现方式：

```typescript
const fetchData = async () => {
  const result = await fetch("/");

  if (!result.ok) {
    return [new Error("Could not fetch data.")];
  }

  const data = await result.json();

  return [undefined, data];
};
```

这是一个异步 `example` 函数，它使用 `WorkspaceData` 并包含几个测试用例：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";

const fetchData = async () => {
  const result = await fetch("/");

  if (!result.ok) {
    return [new Error("Could not fetch data.")];
  }

  const data = await result.json();

  return [undefined, data];
};
// ---cut---
const example = async () => {
  const [error, data] = await fetchData();

  type Tests = [
    Expect<Equal<typeof error, Error | undefined>>,
    Expect<Equal<typeof data, any>>
  ];
};
```

目前，元组的两个成员都被推断为 `any`，这并不理想。

```typescript
const [error, data] = await fetchData();

// hovering over error and data shows:
const error: any;
const data: any;
```

你的挑战是修改 `WorkspaceData` 函数的实现，以便 TypeScript 为其返回类型推断出一个带有元组的 Promise。

根据获取操作是否成功，元组应包含错误消息或一对 `undefined` 和获取的数据。

提示：有两种可能的方法来解决这个挑战。一种方法是为函数定义一个显式的返回类型。或者，你可以尝试为函数内的 `return` 值添加或更改类型注解。

\<Exercise title="练习 1：从函数返回元组" filePath="/src/028-mutability/106-as-const-to-make-functions-infer-a-tuple.problem.ts"\>\</Exercise\>

#### 练习 2：推断数组中的字面量值 (Exercise 2: Inferring Literal Values In Arrays)

让我们回顾一下之前的练习并改进我们的解决方案。

`modifyButtons` 函数接受一个具有 `type` 属性的对象数组：

```ts twoslash
// @errors: 2345
type ButtonAttributes = {
  type: "button" | "submit" | "reset";
};

const modifyButtons = (attributes: ButtonAttributes[]) => {};

const buttonsToChange = [
  {
    type: "button",
  },
  {
    type: "submit",
  },
];

modifyButtons(buttonsToChange);
```

以前，通过将 `buttonsToChange` 更新为指定为 `ButtonAttributes` 数组来解决该错误：

```typescript
const buttonsToChange: ButtonAttributes[] = [
  {
    type: "button",
  },
  {
    type: "submit",
  },
];
```

这一次，你的挑战是通过找到不同的解决方案来解决错误。具体来说，你应该修改 `buttonsToChange` 数组，以便 TypeScript 推断 `type` 属性的字面量类型。

你不应更改 `ButtonAttributes` 类型定义或 `modifyButtons` 函数。

\<Exercise title="练习 2：推断数组中的字面量值" filePath="/src/028-mutability/107-as-const-can-make-strings-infer-as-their-literals-in-objects.explainer.ts"\>\</Exercise\>

#### 解决方案 1：从函数返回元组 (Solution 1: Returning A Tuple From A Function)

如前所述，这个挑战有两种不同的解决方案。

##### 选项 1：定义返回类型 (Option 1: Defining a Return Type)

第一个解决方案是为 `WorkspaceData` 函数定义一个返回类型。

在 `Promise` 类型内部，定义了一个元组，其第一个成员是 `Error` 或 `undefined`，第二个成员是可选的 `any`：

```typescript
const fetchData = async (): Promise<[Error | undefined, any?]> => {
  ...
```

这种技术工作得很好。

##### 选项 2：使用 `as const` (Option 2: Using `as const`)

第二个解决方案不是指定返回类型，而是在返回值上使用 `as const`：

```typescript
import { Equal, Expect } from "@total-typescript/helpers";

const fetchData = async () => {
  const result = await fetch("/");

  if (!result.ok) {
    return [new Error("Could not fetch data.")] as const; // 在此处添加 as const
  }

  const data = await result.json();

  return [undefined, data] as const; // 在此处添加 as const
};
```

完成这些更改后，当我们在 `example` 函数中检查 `WorkspaceData` 的返回类型时，我们可以看到 `error` 被推断为 `Error | undefined`，而 `data` 是 `any`：

```typescript
const example = async () => {
  const [error, data] = await fetchData();

  // ...
};

// hovering over error shows:
const error: Error | undefined;

// hovering over data shows:
const data: any;
```

在这个挑战的情况下，如果没有 `as const`，TypeScript 会犯两个错误。首先，它将每个返回的数组推断为*数组*，而不是元组。这是 TypeScript 的默认行为：

```typescript
const data = await result.json();

const result = [undefined, data];

// hovering over result shows:
const result: any[];
```

我们还可以看到，当 `undefined` 与 `any` 一起放入数组中时，TypeScript 会将该数组推断为 `any[]`。这是 TypeScript 的第二个错误——折叠我们的 `undefined` 值，使其几乎消失。

然而，通过使用 `as const`，TypeScript 正确地将返回值推断为一个元组 (`Promise<[string | undefined, any]>`)。这是一个很好的例子，说明了 `as const` 如何帮助 TypeScript 为我们提供尽可能好的类型推断。

#### 解决方案 2：推断数组中的字面量值 (Solution 2: Inferring Literal Values In Arrays)

让我们看看解决这个挑战的一些不同选项。

##### 选项 1：注解整个数组 (Option 1: Annotate the Entire Array)

可以使用 `as const` 断言来解决此问题。通过用 `as const` 注解整个数组，TypeScript 将推断 `type` 属性的字面量类型：

```typescript
const buttonsToChange = [
  {
    type: "button",
  },
  {
    type: "submit",
  },
] as const;
```

将鼠标悬停在 `buttonsToChange` 上显示 TypeScript 已将 `type` 属性推断为字面量类型，并且当将 `buttonsToChange` 传递给 `modifyButtons` 时，它将不再显示错误：

```typescript
// hovering over buttonsToChange shows:
const buttonsToChange: readonly [
  {
    readonly type: "button";
  },
  {
    readonly type: "submit";
  }
];
```

##### 选项 2：注解数组的成员 (Option 2: Annotate the members of the array)

解决此问题的另一种方法是用 `as const` 注解数组的每个成员：

```typescript
const buttonsToChange = [
  {
    type: "button",
  } as const,
  {
    type: "submit",
  } as const,
];
```

将鼠标悬停在 `buttonsToChange` 上显示了一些有趣的内容。每个对象现在都被推断为 `readonly`，但数组本身不是：

```typescript
// hovering over buttonsToChange shows:
const buttonsToChange: (
  | {
      readonly type: "button";
    }
  | {
      readonly type: "submit";
    }
)[];
```

`buttonsToChange` 数组也不再被推断为具有固定长度的元组，因此我们可以通过向其推送新对象来修改它：

```typescript
buttonsToChange.push({
  type: "button",
});
```

这种行为源于用 `as const` 标记数组的各个成员，而不是整个数组。

然而，这种推断足以满足 `modifyButtons` 的要求，因为它与 `ButtonAttributes` 类型匹配。

##### 选项 3：在字符串上使用 `as const` (Option 3: `as const` on strings)

我们将要看的最后一个解决方案是在字符串字面量上使用 `as const` 来推断字面量类型：

```typescript
const buttonsToChange = [
  {
    type: "button" as const,
  },
  {
    type: "submit" as const,
  },
];
```

现在，当我们把鼠标悬停在 `buttonsToChange` 上时，我们失去了 `readonly` 修饰符，因为 `as const` 只针对对象内部的字符串，而不是对象本身：

```typescript
// hovering over buttonsToChange shows:
const buttonsToChange: (
  | {
      type: "button";
    }
  | {
      type: "submit";
    }
)[];
```

但是，这仍然是足够强类型的，可以满足 `modifyButtons` 的要求。

像这样使用 `as const` 时，它就像给 TypeScript 一个提示，即它应该在通常不会推断字面量类型的地方推断字面量类型。当你希望允许突变但仍希望推断字面量类型时，这有时会很有用。
