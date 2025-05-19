到目前为止，我们只在"对象字面量"的上下文中查看了对象类型，使用带有类型别名的`{}`定义。

但TypeScript有许多可用的工具，让你能够更具表现力地使用对象类型。你可以模拟继承，从现有对象创建新的对象类型，并使用动态键。

## 扩展对象

让我们通过研究如何在TypeScript中从_其他对象类型_构建对象类型开始我们的探索。

### 交叉类型

交叉类型让我们将多个对象类型组合成单一类型。它使用`&`运算符。你可以把它看作是`|`运算符的反向。与其表示类型之间的"或"关系，`&`运算符表示"与"关系。

使用交叉运算符`&`将多个独立类型组合成单一类型。

考虑这些`Album`和`SalesData`类型：

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

单独来看，每种类型代表一组不同的属性。虽然`SalesData`类型本身可以用来表示任何产品的销售数据，但使用`&`运算符创建交叉类型允许我们将两种类型组合成一个表示专辑销售数据的单一类型：

```typescript
type AlbumSales = Album & SalesData;
```

`AlbumSales`类型现在要求对象包含`AlbumDetails`和`SalesData`的所有属性：

```typescript
const wishYouWereHereSales: AlbumSales = {
  title: "Wish You Were Here",
  artist: "Pink Floyd",
  releaseYear: 1975
  unitsSold: 13000000,
  revenue: 65000000,
};
```

如果在创建新对象时没有满足`AlbumSales`类型的契约，TypeScript将引发错误。

也可以交叉两个以上的类型：

```typescript
type AlbumSales = Album & SalesData & { genre: string };
```

这是从现有类型创建新类型的有用方法。

#### 与原始类型的交叉

值得注意的是，交叉类型也可以与原始类型一起使用，如`string`和`number` - 尽管它通常会产生奇怪的结果。

例如，让我们尝试交叉`string`和`number`：

```typescript
type StringAndNumber = string & number;
```

你认为`StringAndNumber`是什么类型？实际上是`never`。这是因为`string`和`number`有不能组合在一起的固有属性。

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

在这种情况下，`age`属性解析为`never`，因为单个属性不可能同时是`number`和`string`。

### 接口

到目前为止，我们只使用`type`关键字定义对象类型。有经验的TypeScript程序员可能会抓狂地想"为什么我们不谈论接口？！"。

接口是TypeScript最著名的特性之一。它们随着TypeScript的第一个版本一起发布，被认为是语言的核心部分。

接口让你使用与`type`略有不同的语法声明对象类型。让我们比较一下语法：

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

它们基本上是相同的，除了关键字和等号。但将它们视为可互换的是一个常见错误。它们不是。

它们有相当不同的功能，我们将在本节中探讨。

### `interface extends`

`interface`最强大的特性之一是它能够扩展其他接口。这允许你创建从现有接口继承属性的新接口。

在这个例子中，我们有一个基础`Album`接口，它将被扩展成`StudioAlbum`和`LiveAlbum`接口，允许我们提供关于专辑的更具体细节：

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

这种结构允许我们创建具有明确继承关系的更具体的专辑表示：

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

就像添加额外的`&`运算符会添加到交叉一样，接口也可以通过用逗号分隔来扩展多个其他接口：

```typescript
interface BoxSet extends StudioAlbum, LiveAlbum {
  numberOfDiscs: number;
}
```

### 交叉 vs `interface extends`

我们现在已经介绍了两种扩展对象类型的TypeScript语法：`&`和`interface extends`。那么，哪个更好？

你应该选择`interface extends`有两个原因。

#### 合并不兼容类型时更好的错误提示

我们之前看到，当你交叉两个具有不兼容属性的对象类型时，TypeScript会将属性解析为`never`：

```typescript
type User1 = {
  age: number;
};

type User2 = {
  age: string;
};

type User = User1 & User2;
```

当使用`interface extends`时，如果你尝试用不兼容的属性扩展接口，TypeScript会引发错误：

```ts twoslash
// @errors: 2430
interface User1 {
  age: number;
}

interface User extends User1 {
  age: string;
}
```

这是非常不同的，因为它实际上会引发错误。使用交叉时，TypeScript只会在你尝试访问`age`属性时引发错误，而不是在你定义它时。

所以，`interface extends`更适合在构建类型时捕获错误。

#### 更好的TypeScript性能

当你在TypeScript中工作时，类型的性能应该在你的脑海中。在大型项目中，你定义类型的方式可能对你的IDE感觉有多快，以及`tsc`检查你的代码需要多长时间有很大影响。

`interface extends`比交叉对TypeScript性能更好。使用交叉时，每次使用时都会重新计算交叉。这可能很慢，特别是当你使用复杂类型时。

接口更快。TypeScript可以基于其名称缓存接口的结果类型。所以如果你使用`interface extends`，TypeScript只需要计算一次类型，然后每次使用接口时都可以重用它。

#### 结论

`interface extends`更适合捕获错误和提高TypeScript性能。这并不意味着你需要使用`interface`定义所有对象类型 - 我们稍后会讨论这个。但如果你需要让一个对象类型扩展另一个，你应该尽可能使用`interface extends`。

### 类型 vs 接口

现在我们知道`interface extends`对扩展对象类型有多好，自然会产生一个问题。我们是否应该默认为所有类型使用`interface`？

让我们看看类型和接口之间的几个比较点。

#### 类型可以是任何东西

类型别名比接口灵活得多。`type`可以表示任何东西 – 联合类型、对象类型、交叉类型等等。

```typescript
type Union = string | number;
```

当我们声明一个类型别名时，我们只是给一个现有类型起一个名字（或别名）。

另一方面，`interface`只能表示对象类型（和函数，我们稍后会看到）。

#### 声明合并

TypeScript中的接口有一个奇怪的属性。当在同一作用域中创建多个同名接口时，TypeScript会自动合并它们。这被称为声明合并。

这里有一个`Album`接口的例子，具有`title`和`artist`属性：

```typescript
interface Album {
  title: string;
  artist: string;
}
```

但是，假设在同一个文件中，你不小心声明了另一个具有`releaseYear`和`genres`属性的`Album`接口：

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

TypeScript自动将这两个声明合并成一个包含两个声明中所有属性的单一接口：

```typescript
// 在底层：
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
  genres: string[];
}
```

这与`type`非常不同，如果你尝试声明同一个类型两次，它会给你一个错误：

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

从JavaScript的角度来看，接口的这种行为感觉相当奇怪。我曾经因为在同一个2,000多行的文件中有两个同名的接口而浪费了数小时的生命。它存在是有充分理由的 - 我们将在后面的章节中探讨 - 但这是一个需要注意的地方。

声明合并及其有些意外的行为，使我对使用接口有些警惕。

#### 结论

那么，你应该使用`type`还是`interface`来声明简单的对象类型？

我倾向于默认使用`type`，除非我需要使用`interface extends`。这是因为`type`更灵活，不会意外地进行声明合并。

但是，这是一个接近的选择。如果你选择相反的方式，我不会责怪你。许多来自更面向对象背景的人会更喜欢`interface`，因为它对他们来说从其他语言中更熟悉。

### 练习

#### 练习1：创建交叉类型

这里我们有一个`User`类型和一个`Product`类型，两者都有一些共同的属性，如`id`和`createdAt`：

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

你的任务是创建一个新的`BaseEntity`类型，包括`id`和`createdAt`属性。然后，使用`&`运算符创建与`BaseEntity`交叉的`User`和`Product`类型。

<Exercise title="练习1：创建交叉类型" filePath="/src/020-objects/081-extend-object-using-intersections.problem.ts"></Exercise>

#### 练习2：扩展接口

在前一个练习之后，你将有一个`BaseEntity`类型以及与之交叉的`User`和`Product`类型。

这次，你的任务是将类型重构为接口，并使用`extends`关键字扩展`BaseEntity`类型。额外加分，尝试创建和扩展多个更小的接口。

<Exercise title="练习2：扩展接口" filePath="/src/020-objects/082-extend-object-using-interfaces.problem.ts"></Exercise>

#### 解决方案1：创建交叉类型

要解决这个挑战，我们将创建一个具有共同属性的新`BaseEntity`类型：

```typescript
type BaseEntity = {
  id: string;
  createdAt: Date;
};
```

一旦创建了`BaseEntity`类型，我们可以将它与`User`和`Product`类型交叉：

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

然后，我们可以从`User`和`Product`中删除共同属性：

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

现在`User`和`Product`具有与之前完全相同的行为，但代码重复更少。

#### 解决方案2：扩展接口

不使用`type`关键字，`BaseEntity`、`User`和`Product`可以声明为接口。记住，接口不像`type`那样使用等号：

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

一旦创建了接口，我们可以使用`extends`关键字扩展`BaseEntity`接口：

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

对于额外加分，我们可以通过创建表示具有`id`和`createdAt`属性的对象的`WithId`和`WithCreatedAt`接口来进一步发展。然后，我们可以通过添加逗号让`User`和`Product`从这些接口扩展：

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

我们现在已经将我们的交叉重构为使用`interface extends` - 我们的TypeScript编译器会感谢我们。

## 动态对象键

使用对象时，我们通常不会总是知道将使用的确切键。

在JavaScript中，我们可以从一个空对象开始，然后动态地向其添加键和值：

```typescript
// JavaScript示例
const albumAwards = {};

albumAwards.Grammy = true;
albumAwards.MercuryPrize = false;
albumAwards.Billboard = true;
```

然而，当我们尝试在TypeScript中动态地向对象添加键时，我们会得到错误：

```ts twoslash
// @errors: 2339
// TypeScript示例
const albumAwards = {};

albumAwards.Grammy = true;
albumAwards.MercuryPrize = false;
albumAwards.Billboard = true;
```

这可能感觉不太有帮助。你可能认为TypeScript，基于其缩小代码范围的能力，应该能够弄清楚我们正在向对象添加键。

在这种情况下，TypeScript更倾向于保守。它不会让你向它不知道的对象添加键。这是因为TypeScript试图防止你犯错误。

我们需要告诉TypeScript，我们希望能够动态添加键。让我们看看一些实现这一点的方法。

### 用于动态键的索引签名

让我们再看一下上面的代码。

```ts twoslash
// @errors: 2339
const albumAwards = {};

albumAwards.Grammy = true;
```

我们在这里做的技术术语是"索引"。我们用字符串键`Grammy`索引到`albumAwards`中，并为其分配一个值。

为了支持这种行为，我们想告诉TypeScript，当我们尝试用字符串索引到`albumAwards`中时，我们应该期望一个布尔值。

为此，我们可以使用"索引签名"。

以下是我们如何为`albumAwards`对象指定索引签名。

```typescript
const albumAwards: {
  [index: string]: boolean;
} = {};

albumAwards.Grammy = true;
albumAwards.MercuryPrize = false;
albumAwards.Billboard = true;
```

`[index: string]: boolean`语法是一个索引签名。它告诉TypeScript，`albumAwards`可以有任何字符串键，值将始终是布尔值。
