在我们关于联合类型和类型收窄的章节中，我们探讨了TypeScript如何从我们代码的逻辑流程中推断类型。在本章中，我们将看到可变性 - 一个值是否可以被改变 - 如何影响类型推断。

## 可变性和推断

### 变量声明和类型推断

你在TypeScript中声明变量的方式会影响它们是否可以被改变。

#### TypeScript如何推断`let`

当使用`let`关键字时，变量是_可变的_，可以被重新赋值。

考虑这个`AlbumGenre`类型：一个表示专辑可能流派的字面值联合：

```ts twoslash
type AlbumGenre = "rock" | "country" | "electronic";
```

使用`let`，我们可以声明一个变量`albumGenre`并为其赋值`"rock"`。然后我们可以尝试将`albumGenre`传递给一个期望`AlbumGenre`的函数：

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

因为声明变量时使用了`let`，TypeScript理解该值以后可以被更改。在这种情况下，它将`albumGenre`推断为`string`而不是特定的字面类型`"rock"`。在我们的代码中，我们可以这样做：

```ts twoslash
let albumGenre = "rock";

// ---cut---
albumGenre = "country";
```

因此，它会推断出一个更宽的类型，以适应变量被重新赋值的情况。

我们可以通过给`let`分配一个特定类型来修复上面的错误：

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

现在，`albumGenre`_可以_被重新赋值，但只能赋值为`AlbumGenre`联合的成员。所以，当传递给`handleGenre`时不再显示错误。

但还有另一个有趣的解决方案。

#### TypeScript如何推断`const`

当使用`const`时，变量是_不可变的_，不能被重新赋值。当我们将变量声明改为使用`const`时，TypeScript会更窄地推断类型：

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

赋值中不再有错误，悬停在`albumDetails`对象内的`albumGenre`上显示TypeScript已将其推断为字面类型`"rock"`。

如果我们在将`albumGenre`声明为`const`后尝试更改其值，TypeScript将显示错误：

```ts twoslash
// @errors: 2588
type AlbumGenre = "rock" | "country" | "electronic";

const albumGenre = "rock";

// ---cut---
albumGenre = "country";
```

TypeScript反映了JavaScript对const的处理，以防止可能的运行时错误。当你用`const`声明一个变量时，TypeScript将其推断为你指定的字面类型。

所以，TypeScript利用JavaScript的工作方式。这通常会鼓励你在声明变量时使用`const`而不是`let`，因为它更严格一些。

### 对象属性推断

当涉及到对象属性时，`const`和`let`的情况变得更加复杂。

对象在JavaScript中是可变的，这意味着它们的属性可以在创建后被更改。

对于这个例子，我们有一个`AlbumAttributes`类型，其中包括一个`status`属性，该属性是表示可能的专辑状态的字面值联合：

```typescript
type AlbumAttributes = {
  status: "new-release" | "on-sale" | "staff-pick";
};
```

假设我们有一个接受`AlbumAttributes`对象的`updateStatus`函数：

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

TypeScript在`updateStatus`函数调用内的`albumAttributes`下面给我们一个错误，消息类似于我们之前看到的。

这是因为TypeScript已将`status`属性推断为`string`而不是特定的字面类型`"on-sale"`。与`let`类似，TypeScript理解该属性以后可能被重新赋值：

```typescript
albumAttributes.status = "new-release";
```

即使`albumAttributes`对象是用`const`声明的，这也是正确的。当调用`updateStatus`时，我们得到错误是因为`status: string`不能传递给期望`status: "new-release" | "on-sale" | "staff-pick"`的函数。TypeScript试图保护我们免受潜在的运行时错误。

让我们看几种修复这个问题的方法。

#### 使用内联对象

一种方法是在调用`updateStatus`函数时内联对象，而不是单独声明它：

```typescript
updateStatus({
  status: "on-sale",
}); // 没有错误
```

当内联对象时，TypeScript知道在将其传递到函数之前，`status`不可能被更改，所以它推断得更窄。

#### 给对象添加类型

另一个选项是明确声明`albumAttributes`对象的类型为`AlbumAttributes`：

```typescript
const albumAttributes: AlbumAttributes = {
  status: "on-sale",
};

updateStatus(albumAttributes); // 没有错误
```

这与`let`的工作方式类似。虽然`albumAttributes.status`仍然可以被重新赋值，但它只能被重新赋值为有效值：

```typescript
albumAttributes.status = "new-release"; // 没有错误
```

这种行为对所有类似对象的结构都是一样的，包括数组和元组。我们将在后面的练习中检查这些。

### 只读对象属性

在JavaScript中，如我们所见，对象属性默认是可变的。但TypeScript让我们能够更具体地指定对象的属性是否可以被修改。

要使属性只读（不可写），你可以使用`readonly`修饰符：

考虑这个`Album`接口，其中`title`和`artist`被标记为`readonly`：

```typescript
interface Album {
  readonly title: string;
  readonly artist: string;
  status?: "new-release" | "on-sale" | "staff-pick";
  genre?: string[];
}
```

一旦创建了`Album`对象，其`title`和`artist`属性就被锁定，不能更改。然而，可选的`status`和`genre`属性仍然可以被修改。

注意，这只发生在_类型_级别。在运行时，属性仍然是可变的。TypeScript只是帮助我们捕获潜在的错误。

#### `Readonly`类型助手

如果你想指定对象的_所有_属性都应该是只读的，TypeScript提供了一个名为`Readonly`的类型助手。

要使用它，你只需用`Readonly`包装对象类型。

这里是使用`Readonly`创建`Album`对象的例子：

```typescript
const readOnlyWhiteAlbum: Readonly<Album> = {
  title: "The Beatles (White Album)",
  artist: "The Beatles",
  status: "staff-pick",
};
```

因为`readOnlyWhiteAlbum`对象是使用`Readonly`类型助手创建的，所以没有属性可以被修改：

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

注意，像TypeScript的许多类型助手一样，`Readonly`强制的不可变性只在第一级操作。它不会递归地使属性只读。

### 只读数组

与对象属性一样，数组和元组也可以通过使用`readonly`修饰符使其不可变。

以下是如何使用`readonly`修饰符创建只读的流派数组。一旦创建了数组，其内容就不能被修改：

```typescript
const readOnlyGenres: readonly string[] = ["rock", "pop", "unclassifiable"];
```

类似于`Array`语法，TypeScript还提供了一个`ReadonlyArray`类型助手，其功能与使用上述语法相同：

```typescript
const readOnlyGenres: ReadonlyArray<string> = ["rock", "pop", "unclassifiable"];
```

这两种方法在功能上是相同的。悬停在`readOnlyGenres`变量上显示TypeScript已将其推断为只读数组：

```typescript
// 悬停在`readOnlyGenres`上显示：
const readOnlyGenres: readonly string[];
```

只读数组不允许使用导致变异的数组方法，如`push`和`pop`：

```ts twoslash
// @errors: 2339
const readOnlyGenres: readonly string[] = ["rock", "pop", "unclassifiable"];

// ---cut---
readOnlyGenres.push("experimental");
```

然而，像`map`和`reduce`这样的方法仍然可以工作，因为它们创建了数组的副本，不会改变原始数组。

```ts twoslash
// @errors: 2339
const readOnlyGenres: readonly string[] = ["rock", "pop", "unclassifiable"];

// ---cut---
const uppercaseGenres = readOnlyGenres.map((genre) => genre.toUpperCase()); // 没有错误

readOnlyGenres.push("experimental");
```

注意，就像对象属性的`readonly`一样，这不会影响数组的运行时行为。它只是一种帮助捕获潜在错误的方式。

#### 只读和可变数组如何一起工作

为了帮助理解这个概念，让我们看看只读和可变数组如何一起工作。

这里有两个功能上完全相同的`printGenre`函数，除了`printGenresReadOnly`接受一个只读的流派数组作为参数，而`printGenresMutable`接受一个可变数组：

```typescript
function printGenresReadOnly(genres: readonly string[]) {
  // ...
}

function printGenresMutable(genres: string[]) {
  // ...
}
```

当我们创建一个可变的流派数组时，它可以作为参数传递给这两个函数，没有错误：

```typescript
const mutableGenres = ["rock", "pop", "unclassifiable"];

printGenresReadOnly(mutableGenres);
printGenresMutable(mutableGenres);
```

这是可行的，因为在`printGenresReadOnly`函数参数上指定`readonly`只保证它不会改变数组的内容。因此，如果我们传递一个可变数组，它不会被改变，这没关系。

然而，反过来就不行了。

如果我们声明一个只读数组，我们只能将其传递给`printGenresReadOnly`。尝试将其传递给`printGenresMutable`将产生错误：

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

这是因为我们可能在`printGenresMutable`内部改变数组。如果我们传递一个只读数组。

本质上，只读数组只能分配给其他只读类型。这可能会在你的应用程序中病毒式传播：如果调用堆栈深处的函数期望一个`readonly`数组，那么该数组必须在整个过程中保持`readonly`。但这样做带来了好处。它确保数组在向下移动堆栈时不会以任何方式被改变。非常有用。

这里的要点是，尽管你可以将可变数组分配给只读数组，但你不能将只读数组分配给可变数组。

### 练习

#### 练习1：对象数组的推断

这里我们有一个`modifyButtons`函数，它接受一个对象数组，这些对象的`type`属性是`"button"`、`"submit"`或`"reset"`。

当尝试用看似符合契约的对象数组调用`modifyButtons`时，TypeScript给我们一个错误：

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

<Exercise title="练习1：对象数组的推断" filePath="/src/028-mutability/098-object-property-inference.problem.ts"></Exercise>

#### 练习2：避免数组变异

这个`printNames`函数接受一个`name`字符串数组并将它们记录到控制台。然而，还有一些不工作的`@ts-expect-error`注释，它们不应该允许添加或更改名称：

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

你的任务是更新`names`参数的类型，使数组不能被改变。有两种方法可以解决这个问题。

<Exercise title="练习2：避免数组变异" filePath="/src/028-mutability/103-readonly-arrays.problem.ts"></Exercise>

#### 练习3：不安全的元组

这里我们有一个`dangerousFunction`，它接受一个数字数组作为参数：

```typescript
const dangerousFunction = (arrayOfNumbers: number[]) => {
  arrayOfNumbers.pop();
  arrayOfNumbers.pop();
};
```

此外，我们定义了一个变量`myHouse`，它是一个表示`Coordinate`的元组：

```typescript
type Coordinate = [number, number];
const myHouse: Coordinate = [0, 0];
```

我们的元组`myHouse`包含两个元素，而`dangerousFunction`的结构是从给定数组中弹出两个元素。

鉴于`pop`从数组中移除最后一个元素，用`myHouse`调用`dangerousFunction`将移除其内容。

目前，TypeScript没有提醒我们这个潜在问题，如`@ts-expect-error`下的错误行所示：

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
  myHouse,
);
```

你的任务是调整`Coordinate`的类型，使得当我们尝试将`myHouse`传递给`dangerousFunction`时，TypeScript触发一个错误。

注意，你应该只更改`Coordinate`，保持函数不变。

<Exercise title="练习3：不安全的元组" filePath="/src/028-mutability/104.5-fixing-unsafe-tuples.problem.ts"></Exercise>

#### 解决方案1：对象数组的推断

悬停在`buttonsToChange`变量上显示它被推断为具有`string`类型的`type`属性的对象数组：

```typescript
// 悬停在buttonsToChange上显示：
const buttonsToChange: {
  type: string;
}[];
```

这种推断发生是因为我们的数组是可变的。我们可以将数组中第一个元素的类型更改为不同的东西：

```typescript
buttonsToChange[0].type = "something strange";
```

这个更宽的类型与`ButtonAttributes`类型不兼容，后者期望`type`属性是`"button"`、`"submit"`或`"reset"`之一。

这里的修复是指定`buttonsToChange`是`ButtonAttributes`的数组：

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

或者，我们可以直接将数组传递给`modifyButtons`函数：

```typescript
modifyButtons([
  {
    type: "button",
  },
  {
    type: "submit"
  },
]);
```
