到目前为止，我们只在“对象字面量”（使用 `{}` 和类型别名定义）的上下文中研究了对象类型。

但 TypeScript 提供了许多工具，让你可以更具表现力地使用对象类型。你可以对继承进行建模，从现有对象类型创建新的对象类型，以及使用动态键。

## 扩展对象

让我们从研究 TypeScript 中如何从*其他对象类型*构建对象类型开始。

### 交叉类型 (Intersection Types)

交叉类型允许我们将多个对象类型合并成一个单一类型。它使用 `&` 运算符。你可以将其视为 `|` 运算符的反向操作。`&` 运算符表示类型之间的“与”关系，而不是“或”关系。

使用交叉运算符 `&` 可以将多个独立的类型合并成一个单一类型。

考虑以下 `Album` 和 `SalesData` 类型：

```typescript
type Album = {
  title: string;
  artist: string;
  releaseYear: number;
};

type SalesData = {
  unitsSold: number;
  revenue: number;
};
```

它们各自代表一组不同的属性。虽然 `SalesData` 类型本身可以用来表示任何产品的销售数据，但使用 `&` 运算符创建交叉类型，可以将这两个类型合并成一个表示专辑销售数据的单一类型：

```typescript
type AlbumSales = Album & SalesData;
```

现在，`AlbumSales` 类型要求对象包含来自 `AlbumDetails`（此处原文笔误，应为 `Album`）和 `SalesData` 的所有属性：

```typescript
const wishYouWereHereSales: AlbumSales = {
  title: "Wish You Were Here",
  artist: "Pink Floyd",
  releaseYear: 1975, // 此处原文示例代码中缺少逗号，已补全
  unitsSold: 13000000,
  revenue: 65000000,
};
```

如果在创建新对象时未满足 `AlbumSales` 类型的约定，TypeScript 将会报错。

也可以交叉两个以上的类型：

```typescript
type AlbumSales = Album & SalesData & { genre: string };
```

这是从现有类型创建新类型的一种有用方法。

#### 交叉类型与原始类型 (Primitives)

值得注意的是，交叉类型也可以用于原始类型，如 `string` 和 `number` —— 尽管这通常会产生奇怪的结果。

例如，让我们尝试交叉 `string` 和 `number`：

```typescript
type StringAndNumber = string & number;
```

你认为 `StringAndNumber` 是什么类型？它实际上是 `never`。这是因为 `string` 和 `number` 具有无法组合在一起的固有属性。

当你交叉两个具有不兼容属性的对象类型时，也会发生这种情况：

```ts twoslash
type User1 = {
  age: number;
};

type User2 = {
  age: string;
};

type User = User1 & User2;
//   ^?
```

在这种情况下，`age` 属性会解析为 `never`，因为单个属性不可能同时是 `number` 和 `string`。

### 接口 (Interfaces)

到目前为止，我们一直只使用 `type` 关键字来定义对象类型。经验丰富的 TypeScript 程序员可能会抓狂地想：“为什么我们不讨论接口？！”。

接口是 TypeScript 最著名的特性之一。它们随 TypeScript 的最早版本一起发布，并被认为是该语言的核心组成部分。

接口允许你使用与 `type` 略有不同的语法来声明对象类型。让我们比较一下语法：

```typescript
type Album = {
  title: string;
  artist: string;
  releaseYear: number;
};

interface Album {
  title: string;
  artist: string;
  releaseYear: number;
}
```

除了关键字和等号之外，它们基本相同。但将它们视为可互换的是一个常见的错误。它们并非如此。

它们具有截然不同的能力，我们将在本节中探讨。

### `interface extends`

`interface` 最强大的特性之一是它能够扩展其他接口。这使你可以创建继承现有接口属性的新接口。

在这个例子中，我们有一个基础的 `Album` 接口，它将被扩展为 `StudioAlbum` 和 `LiveAlbum` 接口，从而允许我们提供关于专辑更具体的细节：

```typescript
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
}

interface StudioAlbum extends Album {
  studio: string;
  producer: string;
}

interface LiveAlbum extends Album {
  concertVenue: string;
  concertDate: Date;
}
```

这种结构使我们能够创建具有清晰继承关系的更具体的专辑表示：

```typescript
const americanBeauty: StudioAlbum = {
  title: "American Beauty",
  artist: "Grateful Dead",
  releaseYear: 1970,
  studio: "Wally Heider Studios",
  producer: "Grateful Dead and Stephen Barncard",
};

const oneFromTheVault: LiveAlbum = {
  title: "One from the Vault",
  artist: "Grateful Dead",
  releaseYear: 1991,
  concertVenue: "Great American Music Hall",
  concertDate: new Date("1975-08-13"),
};
```

就像添加额外的 `&` 运算符会增加交叉类型一样，接口也可以通过用逗号分隔来扩展多个其他接口：

```typescript
interface BoxSet extends StudioAlbum, LiveAlbum {
  numberOfDiscs: number;
}
```

### 交叉类型 vs `interface extends`

我们现在已经介绍了两种用于扩展对象类型的 TypeScript 语法：`&` 和 `interface extends`。那么，哪一个更好呢？

你应该选择 `interface extends`，原因有二。

#### 合并不兼容类型时更好的错误提示

我们之前看到，当你交叉两个具有不兼容属性的对象类型时，TypeScript 会将该属性解析为 `never`：

```typescript
type User1 = {
  age: number;
};

type User2 = {
  age: string;
};

type User = User1 & User2;
```

当使用 `interface extends` 时，如果你尝试扩展一个具有不兼容属性的接口，TypeScript 会在定义时就报错：

```ts twoslash
// @errors: 2430
interface User1 {
  age: number;
}

interface User extends User1 {
  age: string;
}
```

这有很大的不同，因为它确实会引发错误。对于交叉类型，TypeScript 只会在你尝试访问 `age` 属性时报错，而不是在你定义它时。

因此，`interface extends` 更适合在构建类型时捕获错误。

#### 更好的 TypeScript 性能

当你在 TypeScript 中工作时，类型的性能应该是你需要关注的问题。在大型项目中，你定义类型的方式会对 IDE 的响应速度以及 `tsc` 检查代码所需的时间产生重大影响。

`interface extends` 在 TypeScript 性能方面远优于交叉类型。对于交叉类型，每次使用时都会重新计算交叉。这可能会很慢，尤其是在处理复杂类型时。

接口更快。TypeScript 可以根据接口的名称缓存其结果类型。因此，如果你使用 `interface extends`，TypeScript 只需要计算一次类型，然后每次使用该接口时都可以重用它。

#### 结论

`interface extends` 在捕获错误和 TypeScript 性能方面都更好。这并不意味着你需要使用 `interface` 来定义所有对象类型——我们稍后会讨论这个问题。但是，如果你需要让一个对象类型扩展另一个对象类型，你应该尽可能使用 `interface extends`。

### Types vs Interfaces

既然我们知道了 `interface extends` 在扩展对象类型方面的优势，一个自然的问题就出现了。我们应该默认对所有类型都使用 `interface` 吗？

让我们比较一下 types 和 interfaces 之间的一些方面。

#### Types 可以是任何东西

类型别名 (Type aliases) 比接口灵活得多。`type` 可以表示任何东西——联合类型、对象类型、交叉类型等等。

```typescript
type Union = string | number;
```

当我们声明一个类型别名时，我们只是给一个现有的类型起一个名字（或别名）。

另一方面，`interface` 只能表示对象类型（以及函数，我们将在后面的章节中介绍）。

#### 声明合并 (Declaration Merging)

TypeScript 中的接口有一个奇特的特性。当在同一作用域中创建多个同名接口时，TypeScript 会自动将它们合并。这被称为声明合并。

下面是一个 `Album` 接口的例子，它具有 `title` 和 `artist` 属性：

```typescript
interface Album {
  title: string;
  artist: string;
}
```

但是，假设在同一个文件中，你不小心声明了另一个具有 `releaseYear` 和 `genres` 属性的 `Album` 接口：

```typescript
interface Album {
  title: string;
  artist: string;
}

interface Album {
  releaseYear: number;
  genres: string[];
}
```

TypeScript 会自动将这两个声明合并成一个包含两个声明中所有属性的单一接口：

```typescript
// 底层实现：
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
  genres: string[];
}
```

这与 `type` 非常不同，如果你尝试声明两次相同的类型，`type` 会报错：

```ts twoslash
// @errors: 2300
type Album = {
  title: string;
  artist: string;
};

type Album = {
  releaseYear: number;
  genres: string[];
};
```

从 JavaScript 的角度来看，接口的这种行为感觉很奇怪。我曾因为在同一个 2000 多行的文件中有两个同名接口而浪费了数小时。它存在是有充分理由的——我们将在后面的章节中探讨——但这有点像一个陷阱。

声明合并及其有些出乎意料的行为，让我对使用接口有些警惕。

#### 结论

那么，对于声明简单的对象类型，你应该使用 `type` 还是 `interface` 呢？

我倾向于默认使用 `type`，除非我需要使用 `interface extends`。这是因为 `type` 更灵活，并且不会发生意外的声明合并。

但是，这是一个很难抉择的问题。如果你选择相反的方式，我也不会怪你。许多有更强面向对象背景的人会更喜欢 `interface`，因为它对他们来说在其他语言中更熟悉。

### 练习

#### 练习 1：创建交叉类型

这里我们有一个 `User` 类型和一个 `Product` 类型，它们都有一些共同的属性，如 `id` 和 `createdAt`：

```typescript
type User = {
  id: string;
  createdAt: Date;
  name: string;
  email: string;
};

type Product = {
  id: string;
  createdAt: Date;
  name: string;
  price: number;
};
```

你的任务是创建一个新的 `BaseEntity` 类型，其中包含 `id` 和 `createdAt` 属性。然后，使用 `&` 运算符创建与 `BaseEntity` 交叉的 `User` 和 `Product` 类型。

<Exercise title="Exercise 1: Create an Intersection Type" filePath="/src/020-objects/081-extend-object-using-intersections.problem.ts"></Exercise>

#### 练习 2：扩展接口

完成上一个练习后，你将拥有一个 `BaseEntity` 类型以及与之交叉的 `User` 和 `Product` 类型。

这一次，你的任务是将这些类型重构为接口，并使用 `extends` 关键字来扩展 `BaseEntity` 类型。作为加分项，尝试创建并扩展多个更小的接口。

<Exercise title="Exercise 2: Extending Interfaces" filePath="/src/020-objects/082-extend-object-using-interfaces.problem.ts"></Exercise>

#### 解决方案 1：创建交叉类型

为了解决这个挑战，我们将创建一个新的 `BaseEntity` 类型，包含共同的属性：

```typescript
type BaseEntity = {
  id: string;
  createdAt: Date;
};
```

一旦 `BaseEntity` 类型被创建，我们就可以将其与 `User` 和 `Product` 类型进行交叉：

```typescript
type User = {
  id: string;
  createdAt: Date;
  name: string;
  email: string;
} & BaseEntity;

type Product = {
  id: string;
  createdAt: Date;
  name: string;
  price: number;
} & BaseEntity;
```

然后，我们可以从 `User` 和 `Product` 中移除共同的属性：

```typescript
type User = {
  name: string;
  email: string;
} & BaseEntity;

type Product = {
  name: string;
  price: number;
} & BaseEntity;
```

现在 `User` 和 `Product` 的行为与之前完全相同，但代码重复更少了。

#### 解决方案 2：扩展接口

`BaseEntity`、`User` 和 `Product` 可以声明为接口，而不是使用 `type` 关键字。记住，接口不像 `type` 那样使用等号：

```typescript
interface BaseEntity {
  id: string;
  createdAt: Date;
}

interface User {
  name: string;
  email: string;
}

interface Product {
  name: string;
  price: number;
}
```

一旦接口被创建，我们就可以使用 `extends` 关键字来扩展 `BaseEntity` 接口：

```typescript
interface User extends BaseEntity {
  name: string;
  email: string;
}

interface Product extends BaseEntity {
  name: string;
  price: number;
}
```

对于加分项，我们可以进一步创建 `WithId` 和 `WithCreatedAt` 接口，它们分别表示具有 `id` 和 `createdAt` 属性的对象。然后，我们可以让 `User` 和 `Product` 通过添加逗号来从这些接口扩展：

```typescript
interface WithId {
  id: string;
}

interface WithCreatedAt {
  createdAt: Date;
}

interface User extends WithId, WithCreatedAt {
  name: string;
  email: string;
}

interface Product extends WithId, WithCreatedAt {
  name: string;
  price: number;
}
```

我们现在已经将交叉类型重构为使用 `interface extends` —— 我们的 TypeScript 编译器会感谢我们的。

## 动态对象键 (Dynamic Object Keys)

使用对象时，我们通常不会总是知道将要使用的确切键。

在 JavaScript 中，我们可以从一个空对象开始，然后动态地向其添加键和值：

```typescript
// JavaScript 示例
const albumAwards = {};

albumAwards.Grammy = true;
albumAwards.MercuryPrize = false;
albumAwards.Billboard = true;
```

然而，当我们在 TypeScript 中尝试动态地向对象添加键时，会收到错误：

```ts twoslash
// @errors: 2339
// TypeScript 示例
const albumAwards = {};

albumAwards.Grammy = true;
albumAwards.MercuryPrize = false;
albumAwards.Billboard = true;
```

这可能感觉没什么帮助。你可能会认为，TypeScript 凭借其缩小代码范围的能力，应该能够判断出我们正在向对象添加键。

在这种情况下，TypeScript 更倾向于保守。它不会让你向它不知道的对象添加键。这是因为 TypeScript 试图阻止你犯错误。

我们需要告诉 TypeScript 我们希望能够动态添加键。让我们看看一些方法。

### 索引签名 (Index Signatures) 用于动态键

让我们再看一下上面的代码。

```ts twoslash
// @errors: 2339
const albumAwards = {};

albumAwards.Grammy = true;
```

我们在这里所做的技术术语是“索引”(indexing)。我们正在用字符串键 `Grammy` 索引到 `albumAwards` 中，并给它赋一个值。

为了支持这种行为，我们想告诉 TypeScript，无论何时我们尝试用字符串索引到 `albumAwards` 中，我们都应该期望得到一个布尔值。

为此，我们可以使用“索引签名”(index signature)。

以下是如何为 `albumAwards` 对象指定索引签名。

```typescript
const albumAwards: {
  [index: string]: boolean;
} = {};

albumAwards.Grammy = true;
albumAwards.MercuryPrize = false;
albumAwards.Billboard = true;
```

`[index: string]: boolean` 语法就是一个索引签名。它告诉 TypeScript `albumAwards` 可以有任何字符串键，并且其值将始终是布尔值。

我们可以为 `index` 选择任何名称。它只是一个描述。

```typescript
const albumAwards: {
  [iCanBeAnything: string]: boolean;
} = {};
```

同样的语法也可以用于 types 和 interfaces：

```typescript
interface AlbumAwards {
  [index: string]: boolean;
}

const beyonceAwards: AlbumAwards = {
  Grammy: true,
  Billboard: true,
};
```

索引签名是处理动态键的一种方法。但是有一个工具类型，有人认为它甚至更好。

### 使用 Record 类型处理动态键

`Record` 工具类型是支持动态键的另一种选择。

以下是如何为 `albumAwards` 对象使用 `Record`，其中键是字符串，值是布尔值：

```typescript
const albumAwards: Record<string, boolean> = {};

albumAwards.Grammy = true;
```

第一个类型参数是键，第二个类型参数是值。这是一种更简洁的方式来实现与索引签名类似的结果。

`Record` 还可以支持联合类型作为键，但索引签名不能：

```ts twoslash
// @errors: 1337
const albumAwards1: Record<"Grammy" | "MercuryPrize" | "Billboard", boolean> = {
  Grammy: true,
  MercuryPrize: false,
  Billboard: true,
};

const albumAwards2: {
  [index: "Grammy" | "MercuryPrize" | "Billboard"]: boolean;
} = {
  Grammy: true,
  MercuryPrize: false,
  Billboard: true,
};
```

索引签名不能使用字面量类型，但 `Record` 可以。我们将在稍后探讨映射类型时了解原因。

`Record` 类型帮助器是一个可重复的模式，易于阅读和理解，并且比索引签名更灵活一些。它是我处理动态键的首选。

### 结合已知键和动态键

在许多情况下，我们会有一组我们知道要包含的基础键，但我们也希望允许动态添加额外的键。

例如，假设我们正在处理一组我们知道是提名的基础奖项，但我们不知道还有哪些其他奖项。我们可以使用 `Record` 类型来定义一组基础奖项，然后使用交叉类型将其与一个用于额外奖项的索引签名进行扩展：

```typescript
type BaseAwards = "Grammy" | "MercuryPrize" | "Billboard";

type ExtendedAlbumAwards = Record<BaseAwards, boolean> & {
  [award: string]: boolean;
};

const extendedNominations: ExtendedAlbumAwards = {
  Grammy: true,
  MercuryPrize: false,
  Billboard: true, // 可以动态添加额外的奖项
  "American Music Awards": true,
};
```

这种技术在使用 interface 和 `extends` 关键字时也同样有效：

```typescript
interface BaseAwards {
  Grammy: boolean;
  MercuryPrize: boolean;
  Billboard: boolean;
}

interface ExtendedAlbumAwards extends BaseAwards {
  [award: string]: boolean;
}
```

这个版本更可取，因为总的来说，`interface extends` 优于交叉类型。

能够在我们的数据结构中同时支持默认键和动态键，为适应应用程序中不断变化的需求提供了很大的灵活性。

### `PropertyKey`

在处理动态键时，一个有用的类型是 `PropertyKey`。

`PropertyKey` 类型是一个全局类型，它代表了可以用作对象键的所有可能键的集合，包括 string、number 和 symbol。你可以在 TypeScript 的 ES5 类型定义文件中找到它的类型定义：

```typescript
// 在 lib.es5.d.ts 文件内
declare type PropertyKey = string | number | symbol;
```

因为 `PropertyKey` 适用于所有可能的键，所以它非常适合处理你不确定键类型的动态键。

例如，当使用索引签名时，你可以将键类型设置为 `PropertyKey` 以允许任何有效的键类型：

```typescript
type Album = {
  [key: PropertyKey]: string;
};
```

### `object`

与 `string`、`number` 和 `boolean` 类似，`object` 是 TypeScript 中的一个全局类型。

它代表的类型比你想象的要多。`object` 并非只代表像 `{}` 或 `new Object()` 这样的对象，而是代表任何非原始类型。这包括数组、函数和对象。

所以像这样的函数：

```typescript
function acceptAllNonPrimitives(obj: object) {}
```

会接受任何非原始值：

```typescript
acceptAllNonPrimitives({});
acceptAllNonPrimitives([]);
acceptAllNonPrimitives(() => {});
```

但对原始类型会报错：

```ts twoslash
// @errors: 2345
function acceptAllNonPrimitives(obj: object) {}

// ---cut---
acceptAllNonPrimitives(1);
acceptAllNonPrimitives("hello");
acceptAllNonPrimitives(true);
```

这意味着 `object` 类型本身很少有用。使用 `Record` 通常是更好的选择。例如，如果你想接受任何对象类型，可以使用 `Record<string, unknown>`。

### 练习

#### 练习 1：使用索引签名处理动态键

这里我们有一个名为 `scores` 的对象，我们试图给它赋几个不同的属性：

```ts twoslash
// @errors: 2339
const scores = {};

scores.math = 95;
scores.english = 90;
scores.science = 85;
```

你的任务是给 `scores` 添加类型注解以支持动态的学科键。有三种方法：内联索引签名、type、interface 或 `Record`。

<Exercise title="Exercise 1: Use an Index Signature for Dynamic Keys" filePath="/src/020-objects/084-index-signatures.problem.ts"></Exercise>

#### 练习 2：具有动态键的默认属性

在这里，我们试图模拟一种情况，即我们希望 `scores` 对象上有一些必需的键——`math`、`english` 和 `science`。

但我们也想添加动态属性。在这种情况下是 `athletics`、`french` 和 `spanish`：

```ts twoslash
// @errors: 2578 2339
interface Scores {}

// @ts-expect-error science should be provided
const scores: Scores = {
  math: 95,
  english: 90,
};

scores.athletics = 100;
scores.french = 75;
scores.spanish = 70;
```

`scores` 的定义应该报错，因为缺少 `science`——但它没有，因为我们当前对 `Scores` 的定义是一个空对象。

你的任务是更新 `Scores` 接口，为 `math`、`english` 和 `science` 指定默认键，同时允许添加任何其他学科。正确更新类型后，`@ts-expect-error` 下方的红色波浪线将消失，因为 `science` 将是必需的但缺失的。看看你是否可以使用 `interface extends` 来实现这一点。

<Exercise title="Exercise 2: Default Properties with Dynamic Keys" filePath="/src/020-objects/085-index-signatures-with-defined-keys.problem.ts"></Exercise>

#### 练习 3：使用 Records 限制对象键

这里我们有一个 `configurations` 对象，其类型为 `Configurations`，目前是 `unknown`。

该对象包含 `development`、`production` 和 `staging` 的键，每个键都与配置详细信息（如 `apiBaseUrl` 和 `timeout`）相关联。

还有一个 `notAllowed` 键，它用 `@ts-expect-error` 注释进行了修饰。但目前，这在 TypeScript 中并未按预期报错。

```ts twoslash
// @errors: 2578
type Environment = "development" | "production" | "staging";

type Configurations = unknown;

const configurations: Configurations = {
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
  },
  // @ts-expect-error
  notAllowed: {
    apiBaseUrl: "https://staging.example.com",
    timeout: 8000,
  },
};
```

更新 `Configurations` 类型，以便只有 `Environment` 中的键才允许在 `configurations` 对象上使用。正确更新类型后，`@ts-expect-error` 下方的红色波浪线将消失，因为 `notAllowed` 将被正确禁止。

<Exercise title="Exercise 3: Restricting Object Keys With Records" filePath="/src/020-objects/087-record-type-with-union-as-keys.problem.ts"></Exercise>

#### 练习 4：动态键支持

考虑这个 `hasKey` 函数，它接受一个对象和一个键，然后在该对象上调用 `object.hasOwnProperty`：

```typescript
const hasKey = (obj: object, key: string) => {
  return obj.hasOwnProperty(key);
};
```

这个函数有几个测试用例：

第一个测试用例检查它是否适用于字符串键，这没有问题。正如预期的那样，`hasKey(obj, "foo")` 将返回 true，`hasKey(obj, "bar")` 将返回 false：

```typescript
it("Should work on string keys", () => {
  const obj = {
    foo: "bar",
  };

  expect(hasKey(obj, "foo")).toBe(true);
  expect(hasKey(obj, "bar")).toBe(false);
});
```

一个检查数字键的测试用例确实有问题，因为该函数期望一个字符串键：

```ts twoslash
// @errors: 2345

const hasKey = (obj: object, key: string) => {
  return obj.hasOwnProperty(key);
};

// ---cut---
const obj = {
  1: "bar",
};
```

因为对象也可以有一个 symbol 作为键，所以也有一个针对这种情况的测试。它目前在调用 `hasKey` 时对 `fooSymbol` 和 `barSymbol` 存在类型错误：

```ts twoslash
// @lib: dom,es2023,dom.iterable
// @errors: 2345
const hasKey = (obj: object, key: string) => {
  return obj.hasOwnProperty(key);
};

// ---cut---
const fooSymbol = Symbol("foo");
const barSymbol = Symbol("bar");

const obj = {
  [fooSymbol]: "bar",
};
```

你的任务是更新 `hasKey` 函数，使所有这些测试都能通过。尽量做到尽可能简洁！

<Exercise title="Exercise 4: Dynamic Key Support" filePath="/src/020-objects/086-property-key-type.problem.ts"></Exercise>

#### 解决方案 1：使用索引签名处理动态键

以下是三种解决方案：

你可以使用内联索引签名：

```typescript
const scores: {
  [key: string]: number;
} = {};
```

或者一个 interface：

```typescript
interface Scores {
  [key: string]: number;
}
```

或者一个 type：

```typescript
type Scores = {
  [key: string]: number;
};
```

或者最后，一个 record：

```typescript
const scores: Record<string, number> = {};
```

#### 解决方案 2：具有动态键的默认属性

以下是如何向 `Scores` 接口添加索引签名以支持动态键以及必需键：

```typescript
interface Scores {
  [subject: string]: number;
  math: number;
  english: number;
  science: number;
}
```

创建一个 `RequiredScores` 接口并扩展它的方式如下：

```typescript
interface RequiredScores {
  math: number;
  english: number;
  science: number;
}

interface Scores extends RequiredScores {
  [key: string]: number;
}
```

这两种方式在功能上是等效的，只是如果你需要单独使用 `RequiredScores` 接口，你可以访问到它。

#### 解决方案 3：限制对象键

##### 第一次尝试使用 Record 的失败

我们知道 `Configurations` 对象的值将是 `apiBaseUrl`（字符串）和 `timeout`（数字）。

你可能想使用 Record 将键设置为字符串，并将值设置为具有 `apiBaseUrl` 和 `timeout` 属性的对象：

```typescript
type Configurations = Record<
  string,
  {
    apiBaseUrl: string;
    timeout: number;
  }
>;
```

然而，将键设为 `string` 仍然允许将 `notAllowed` 键添加到对象中。我们需要使键依赖于 `Environment` 类型。

##### 正确的方法

相反，我们可以在 Record 内部将 `key` 指定为 `Environment`：

```typescript
type Configurations = Record<
  Environment,
  {
    apiBaseUrl: string;
    timeout: number;
  }
>;
```

现在，当对象包含一个在 `Environment` 中不存在的键（如 `notAllowed`）时，TypeScript 将会抛出错误。

#### 解决方案 4：动态键支持

显而易见的答案是将 `key` 的类型更改为 `string | number | symbol`：

```typescript
const hasKey = (obj: object, key: string | number | symbol) => {
  return obj.hasOwnProperty(key);
};
```

然而，有一个更简洁的解决方案。

将鼠标悬停在 `hasOwnProperty` 上会显示其类型定义：

```typescript
(method) Object.hasOwnProperty(v: PropertyKey): boolean
```

回想一下，`PropertyKey` 类型代表键可以拥有的所有可能值。这意味着我们可以将其用作 key 参数的类型：

```typescript
const hasKey = (obj: object, key: PropertyKey) => {
  return obj.hasOwnProperty(key);
};
```

漂亮。

## 使用工具类型减少重复

在 TypeScript 中处理对象类型时，你经常会发现你的对象类型共享一些共同的属性。这可能导致大量重复的代码。

我们已经看到如何使用 `interface extends` 来模拟继承，但 TypeScript 也为我们提供了直接操作对象类型的工具。借助其内置的工具类型，我们可以从类型中移除属性、使它们变为可选等等。

### `Partial`

Partial 工具类型允许你从现有对象类型创建一个新的对象类型，只是它的所有属性都是可选的。

考虑一个 `Album` 接口，它包含关于专辑的详细信息：

```typescript
interface Album {
  id: number;
  title: string;
  artist: string;
  releaseYear: number;
  genre: string;
}
```

当我们想要更新专辑信息时，我们可能不会一次性拥有所有信息。例如，在专辑发行前很难决定给它分配什么流派。

通过使用 `Partial` 工具类型并传入 `Album`，我们可以创建一个允许我们更新专辑属性任意子集的类型：

```typescript
type PartialAlbum = Partial<Album>;
```

现在我们有了一个 `PartialAlbum` 类型，其中 `id`、`title`、`artist`、`releaseYear` 和 `genre` 都是可选的。

这意味着我们可以创建一个只接收专辑属性子集的函数：

```typescript
const updateAlbum = (album: PartialAlbum) => {
  // ...
};

updateAlbum({ title: "Geogaddi", artist: "Boards of Canada" });
```

### `Required`

与 `Partial` 相对的是 `Required` 类型，它确保给定对象类型的所有属性都是必需的。

这个 `Album` 接口将 `releaseYear` 和 `genre` 属性标记为可选：

```typescript
interface Album {
  title: string;
  artist: string;
  releaseYear?: number;
  genre?: string;
}
```

我们可以使用 `Required` 工具类型来创建一个新的 `RequiredAlbum` 类型：

```typescript
type RequiredAlbum = Required<Album>;
```

对于 `RequiredAlbum`，所有原始 `Album` 的属性都变成必需的，省略任何一个都会导致错误：

```typescript
const doubleCup: RequiredAlbum = {
  title: "Double Cup",
  artist: "DJ Rashad",
  releaseYear: 2013,
  genre: "Juke",
};
```

#### Required 与嵌套属性

需要注意的一个重要事项是，`Required` 和 `Partial` 都只作用于一层深度。例如，如果 `Album` 的 `genre` 包含嵌套属性，`Required<Album>` 不会使其子属性变为必需：

```ts twoslash
type Album = {
  title: string;
  artist: string;
  releaseYear?: number;
  genre?: {
    parentGenre?: string;
    subGenre?: string;
  };
};

type RequiredAlbum = Required<Album>;
//   ^?
```

如果你发现自己需要一个深度 `Required` 的类型，可以查看 Sindre Sorhus 的 [type-fest](https://github.com/sindresorhus/type-fest) 库。

### `Pick`

Pick 工具类型允许你通过从现有对象中选取某些属性来创建新的对象类型。

例如，假设我们想创建一个新类型，只包含 `Album` 类型中的 `title` 和 `artist` 属性：

```typescript
type AlbumData = Pick<Album, "title" | "artist">;
```

这将导致 `AlbumData` 成为一个只包含 `title` 和 `artist` 属性的类型。

当你希望一个对象的形状依赖于另一个对象的形状时，这非常有用。我们将在关于从其他类型派生类型的章节中更详细地探讨这一点。

### `Omit`

Omit 帮助类型有点像 Pick 的反面。它允许你通过从现有类型中排除一部分属性来创建新类型。

例如，我们可以使用 Omit 来创建与使用 Pick 创建的相同的 `AlbumData` 类型，但这次是通过排除 `id`、`releaseYear` 和 `genre` 属性：

```typescript
type AlbumData = Omit<Album, "id" | "releaseYear" | "genre">;
```

一个常见的用例是创建一个不带 `id` 的类型，用于 `id` 尚未分配的情况：

```typescript
type AlbumData = Omit<Album, "id">;
```

这意味着随着 `Album` 获得更多属性，它们也将传递给 `AlbumData`。

表面上看，使用 Omit 很简单，但有一个小怪癖需要注意。

#### Omit 比 Pick 更宽松

使用 Omit 时，你可以排除对象类型上不存在的属性。

例如，使用我们的 `Album` 类型创建 `AlbumWithoutProducer` 类型不会导致错误，即使 `producer` 在 `Album` 上不存在：

```typescript
type Album = {
  id: string;
  title: string;
  artist: string;
  releaseYear: number;
  genre: string;
};

type AlbumWithoutProducer = Omit<Album, "producer">;
```

如果我们尝试使用 Pick 创建 `AlbumWithOnlyProducer` 类型，则会收到错误，因为 `producer` 在 `Album` 上不存在：

```ts twoslash
// @errors: 2344
type Album = {
  id: string;
  title: string;
  artist: string;
  releaseYear: number;
  genre: string;
};

type AlbumWithoutProducer = Omit<Album, "producer">;

// ---cut---
type AlbumWithOnlyProducer = Pick<Album, "producer">;
```

为什么这两个工具类型的行为不同？

当 TypeScript 团队最初实现 Omit 时，他们面临着创建一个严格版本还是宽松版本 Omit 的决定。严格版本只允许省略有效的键（`id`、`title`、`artist`、`releaseYear`、`genre`），而宽松版本则没有这个限制。

当时，社区中更流行的想法是实现一个宽松版本，所以他们选择了那个版本。考虑到 TypeScript 中的全局类型是全局可用的，并且不需要 import 语句，宽松版本被认为是更安全的选择，因为它更具兼容性，不太可能导致意外错误。

虽然可以创建 Omit 的严格版本，但宽松版本对于大多数情况应该足够了。只需留意，因为它可能会以你意想不到的方式报错。

我们将在本书后面实现 Omit 的严格版本。

有关 Omit 背后的决策的更多见解，请参阅 TypeScript 团队最初的[讨论](https://github.com/microsoft/TypeScript/issues/30455)和添加 `Omit` 的[拉取请求](https://github.com/microsoft/TypeScript/pull/30552)，以及他们关于此主题的[最终说明](https://github.com/microsoft/TypeScript/issues/30825#issuecomment-523668235)。

### Omit 和 Pick 与联合类型 (Union Types) 配合不佳

`Omit` 和 `Pick` 在与联合类型一起使用时，行为有些奇怪。让我们看一个例子来理解我的意思。

考虑一个场景，我们有三个接口类型：`Album`、`CollectorEdition` 和 `DigitalRelease`：

```typescript
type Album = {
  id: string;
  title: string;
  genre: string;
};

type CollectorEdition = {
  id: string;
  title: string;
  limitedEditionFeatures: string[];
};

type DigitalRelease = {
  id: string;
  title: string;
  digitalFormat: string;
};
```

这些类型共享两个共同属性——`id` 和 `title`——但每个类型也都有独特的属性。`Album` 类型包含 `genre`，`CollectorEdition` 包含 `limitedEditionFeatures`，而 `DigitalRelease` 则有 `digitalFormat`：

在创建了一个作为这三种类型联合的 `MusicProduct` 类型之后，假设我们想创建一个 `MusicProductWithoutId` 类型，它反映 `MusicProduct` 的结构，但排除了 `id` 字段：

```typescript
type MusicProduct = Album | CollectorEdition | DigitalRelease;

type MusicProductWithoutId = Omit<MusicProduct, "id">;
```

你可能会假设 `MusicProductWithoutId` 将是这三个类型减去 `id` 字段后的联合。然而，我们得到的却是一个简化的对象类型，只包含 `title`——即所有类型中除了 `id` 之外共享的其他属性。

```typescript
// 期望：
type MusicProductWithoutId =
  | Omit<Album, "id">
  | Omit<CollectorEdition, "id">
  | Omit<DigitalRelease, "id">;

// 实际：
type MusicProductWithoutId = {
  title: string;
};
```

鉴于 `Partial` 和 `Required` 与联合类型按预期工作，这一点尤其令人讨厌：

```typescript
type PartialMusicProduct = Partial<MusicProduct>;

// 将鼠标悬停在 PartialMusicProduct 上显示：
type PartialMusicProduct =
  | Partial<Album>
  | Partial<CollectorEdition>
  | Partial<DigitalRelease>;
```

这源于 `Omit` 处理联合类型的方式。它不是遍历每个联合成员，而是将它们合并成一个它可以理解的单一结构。

技术原因是 `Omit` 和 `Pick` 不是分配式的 (distributive)。这意味着当你将它们与联合类型一起使用时，它们不会单独作用于每个联合成员。

#### `DistributiveOmit` 和 `DistributivePick` 类型

为了解决这个问题，我们可以创建一个 `DistributiveOmit` 类型。它的定义与 Omit 类似，但会单独作用于每个联合成员。请注意类型定义中包含了 `PropertyKey`，以允许任何有效的键类型：

```typescript
type DistributiveOmit<T, K extends PropertyKey> = T extends any
  ? Omit<T, K>
  : never;
```

当我们将 `DistributiveOmit` 应用于我们的 `MusicProduct` 类型时，我们得到了预期的结果：一个 `Album`、`CollectorEdition` 和 `DigitalRelease` 的联合，其中 `id` 字段已被省略：

```typescript
type MusicProductWithoutId = DistributiveOmit<MusicProduct, "id">;

// 将鼠标悬停在 MusicProductWithoutId 上显示：
type MusicProductWithoutId =
  | Omit<Album, "id">
  | Omit<CollectorEdition, "id">
  | Omit<DigitalRelease, "id">;
```

从结构上讲，这与以下内容相同：

```typescript
type MusicProductWithoutId =
  | {
      title: string;
      genre: string;
    }
  | {
      title: string;
      limitedEditionFeatures: string[];
    }
  | {
      title: string;
      digitalFormat: string;
    };
```

在需要对联合类型使用 Omit 的情况下，使用分布式版本会给你一个更可预测的结果。

为了完整起见，`DistributivePick` 类型可以用类似的方式定义：

```typescript
type DistributivePick<T, K extends PropertyKey> = T extends any
  ? Pick<T, K>
  : never;
```

### 练习

#### 练习 1：期望特定属性

在这个练习中，我们有一个 `fetchUser` 函数，它使用 `fetch` 访问名为 `APIUser` 的端点，并返回一个 `Promise<User>`：

```ts twoslash
// @errors: 2344
import { Expect, Equal } from "@total-typescript/helpers";

// ---cut---
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const fetchUser = async (): Promise<User> => {
  const response = await fetch("/api/user");
  const user = await response.json();
  return user;
};

const example = async () => {
  const user = await fetchUser();

  type test = Expect<Equal<typeof user, { name: string; email: string }>>;
};
```

由于我们处于异步函数中，我们确实想使用 `Promise`，但是这个 `User` 类型存在问题。

在调用 `fetchUser` 的 `example` 函数中，我们只期望接收 `name` 和 `email` 字段。这些字段只是 `User` 接口中存在的一部分。

你的任务是更新类型，以便 `fetchUser` 只期望返回 `name` 和 `email` 字段。

你可以使用我们已经介绍过的辅助类型来完成这个任务，但为了额外练习，请尝试只使用接口。

<Exercise title="Exercise 1: Expecting Certain Properties" filePath="/src/020-objects/089-pick-type-helper.problem.ts"></Exercise>

#### 练习 2：更新产品

这里我们有一个 `updateProduct` 函数，它接受两个参数：一个 `id` 和一个 `productInfo` 对象，该对象派生自 `Product` 类型，但不包括 `id` 字段。

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

const updateProduct = (id: number, productInfo: Product) => {
  // 对 productInfo 进行一些操作
};
```

这里的关键在于，在产品更新期间，我们可能不想同时修改其所有属性。因此，并非所有属性都必须传递给函数。

这意味着我们有几个不同的测试场景。例如，只更新名称、只更新价格或只更新描述。更新名称和价格或名称和描述等组合也进行了测试。

```ts twoslash
// @errors: 2345
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

const updateProduct = (id: number, productInfo: Product) => {
  // 对 productInfo 进行一些操作
};

// ---cut---
updateProduct(1, {
  name: "Book",
});

updateProduct(1, {
  price: 12.99,
});
```

你的挑战是修改 `productInfo` 参数以反映这些要求。`id` 应该仍然不存在于 `productInfo` 中，但我们也希望 `productInfo` 中的所有其他属性都是可选的。

<Exercise title="Exercise 2: Updating a Product" filePath="/src/020-objects/091-omit-type-helper.problem.ts"></Exercise>

#### 解决方案 1：期望特定属性

解决这个问题的方法有很多。以下是一些示例：

##### 使用 Pick

使用 Pick 工具类型，我们可以创建一个新类型，它只包含 `User` 接口中的 `name` 和 `email` 属性：

```typescript
type PickedUser = Pick<User, "name" | "email">;
```

然后可以更新 `fetchUser` 函数以返回 `PickedUser` 的 `Promise`：

```typescript
const fetchUser = async (): Promise<PickedUser> => {
  // ...
};
```

##### 使用 Omit

Omit 工具类型也可以用来创建一个新类型，该类型从 `User` 接口中排除 `id` 和 `role` 属性：

```typescript
type OmittedUser = Omit<User, "id" | "role">;
```

然后可以更新 `fetchUser` 函数以返回 `OmittedUser` 的 `Promise`：

```typescript
const fetchUser = async (): Promise<OmittedUser> => {
  // ...
};
```

##### 扩展接口

我们可以创建一个包含 `name` 和 `email` 属性的 `NameAndEmail` 接口，并更新 `User` 接口以移除这些属性，转而扩展 `NameAndEmail`：

```typescript
interface NameAndEmail {
  name: string;
  email: string;
}

interface User extends NameAndEmail {
  id: string;
  role: string;
}
```

然后 `fetchUser` 函数可以返回 `NameAndEmail` 的 `Promise`：

```typescript
const fetchUser = async (): Promise<NameAndEmail> => {
  // ...
};
```

`Omit` 意味着对象会随着源对象的增长而增长。`Pick` 和 `interface extends` 则意味着对象大小将保持不变。因此，根据需求，你可以选择最佳方法。

#### 解决方案 2：更新产品

通过*组合*使用 `Omit` 和 `Partial`，我们可以创建一个类型，该类型从 `Product` 中排除 `id` 字段，并使所有其他属性变为可选。

在这种情况下，将 `Omit<Product, "id">` 包装在 `Partial` 中将移除 `id`，同时使所有剩余属性变为可选：

```typescript
const updateProduct = (
  id: number,
  productInfo: Partial<Omit<Product, "id">>
) => {
  // 对 productInfo 进行一些操作
};
```
