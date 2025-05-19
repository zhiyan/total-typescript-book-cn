编写可维护代码的最常见建议之一是"保持代码DRY"，或者更明确地说，"不要重复自己"。

在JavaScript中实现这一点的一种方法是将重复的代码提取到函数或变量中。这些变量和函数可以被重用、组合和以不同方式结合，以创建新的功能。

在TypeScript中，我们可以将这一原则应用于类型。

在本节中，我们将看看如何从其他类型派生类型。这让我们减少代码中的重复，并为我们的类型创建单一的事实来源。

这使我们能够在一个类型中进行更改，并让这些更改在整个应用程序中传播，而无需手动更新每个实例。

我们甚至会看看如何从_值_派生类型，以便我们的类型始终表示应用程序的运行时行为。

## 派生类型

派生类型是依赖于或继承自另一个类型结构的类型。我们可以使用到目前为止使用的一些工具创建派生类型。

我们可以使用`interface extends`使一个接口从另一个接口继承：

```typescript
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
}

interface AlbumDetails extends Album {
  genre: string;
}
```

`AlbumDetails`继承了`Album`的所有属性。这意味着对`Album`的任何更改都会传递到`AlbumDetails`。`AlbumDetails`是从`Album`派生的。

另一个例子是联合类型。

```typescript
type Triangle = {
  type: "triangle";
  sideLength: number;
};

type Rectangle = {
  type: "rectangle";
  width: number;
  height: number;
};

type Shape = Triangle | Rectangle;
```

派生类型表示一种关系。这种关系是单向的。`Shape`不能回去修改`Triangle`或`Rectangle`。但对`Triangle`和`Rectangle`的任何更改都会波及到`Shape`。

设计良好时，派生类型可以在生产力方面带来巨大的收益。我们可以在一个地方进行更改，并让它们在整个应用程序中传播。这是保持代码DRY并充分利用TypeScript类型系统的强大方式。

这有权衡。我们可以将派生视为一种耦合。如果我们更改其他类型依赖的类型，我们需要意识到该更改的影响。我们将在本章末尾更详细地讨论派生与解耦。

但现在，让我们看看TypeScript提供的一些用于派生类型的工具。

## `keyof`操作符

`keyof`操作符允许你将对象类型的键提取到联合类型中。

从我们熟悉的`Album`类型开始：

```typescript
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
}
```

我们可以使用`keyof Album`，最终得到`"title"`、`"artist"`和`"releaseYear"`键的联合：

```typescript
type AlbumKeys = keyof Album; // "title" | "artist" | "releaseYear"
```

由于`keyof`跟踪来自源的键，对类型所做的任何更改都将自动反映在`AlbumKeys`类型中。

```typescript
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
  genre: string; // 添加了'genre'
}

type AlbumKeys = keyof Album; // "title" | "artist" | "releaseYear" | "genre"
```

然后，`AlbumKeys`类型可以用来帮助确保用于访问`Album`中值的键是有效的，如在这个函数中所见：

```typescript
function getAlbumDetails(album: Album, key: AlbumKeys) {
  return album[key];
}
```

如果传递给`getAlbumDetails`的键不是`Album`的有效键，TypeScript将显示错误：

```ts twoslash
// @errors: 2345
function getAlbumDetails(album: Album, key: AlbumKeys) {
  return album[key];
}

interface Album {
  title: string;
  artist: string;
  releaseYear: number;
  genre: string; // 添加了'genre'
}

type AlbumKeys = keyof Album; // "title" | "artist" | "releaseYear" | "genre"

const album: Album = {
  title: "Kind of Blue",
  artist: "Miles Davis",
  releaseYear: 1959,
  genre: "Jazz",
};

// ---cut---
getAlbumDetails(album, "producer");
```

`keyof`是从现有类型创建新类型时的重要构建块。我们稍后将看到如何将它与`as const`一起使用来构建我们自己的类型安全枚举。

## `typeof`操作符

`typeof`操作符允许你从值中提取类型。

假设我们有一个`albumSales`对象，包含一些专辑标题键和一些销售统计数据：

```typescript
const albumSales = {
  "Kind of Blue": 5000000,
  "A Love Supreme": 1000000,
  "Mingus Ah Um": 3000000,
};
```

我们可以使用`typeof`提取`albumSales`的类型，这将把它转换为一个类型，原始键作为字符串，它们的推断类型作为值：

```ts twoslash
const albumSales = {
  "Kind of Blue": 5000000,
  "A Love Supreme": 1000000,
  "Mingus Ah Um": 3000000,
};

// ---cut---
type AlbumSalesType = typeof albumSales;
//   ^?
```

现在我们有了`AlbumSalesType`类型，我们可以从中创建_另一个_派生类型。例如，我们可以使用`keyof`提取`albumSales`对象的键：

```typescript
type AlbumTitles = keyof AlbumSalesType; // "Kind of Blue" | "A Love Supreme" | "Mingus Ah Um"
```

一个常见的模式是结合`keyof`和`typeof`从现有对象类型的键和值创建新类型：

```typescript
type AlbumTitles = keyof typeof albumSales;
```

我们可以在函数中使用它来确保`title`参数是`albumSales`的有效键，可能是为了查找特定专辑的销售情况：

```typescript
function getSales(title: AlbumTitles) {
  return albumSales[title];
}
```

值得注意的是，`typeof`与运行时使用的`typeof`操作符不同。TypeScript可以根据它是在类型上下文还是值上下文中使用来区分：

```ts twoslash
const albumSales = {
  "Kind of Blue": 5000000,
  "A Love Supreme": 1000000,
  "Mingus Ah Um": 3000000,
};

// ---cut---
// 运行时typeof
const albumSalesType = typeof albumSales; // "object"

// 类型typeof
type AlbumSalesType = typeof albumSales;
//   ^?
```

当你需要基于运行时值（包括对象、函数、类等）提取类型时，使用`typeof`关键字。它是从值派生类型的强大工具，也是我们稍后将探索的其他模式的关键构建块。

### 你不能从值创建运行时类型

我们已经看到`typeof`可以从运行时值创建类型，但重要的是要注意，没有办法从类型创建值。

换句话说，没有`valueof`操作符：

```ts
type Album = {
  title: string;
  artist: string;
  releaseYear: number;
};

const album = valueof Album; // 不起作用！
```

TypeScript的类型在运行时消失，所以没有内置的方法从类型创建值。换句话说，你可以从"值世界"移动到"类型世界"，但不能反过来。

## 索引访问类型

TypeScript中的索引访问类型允许你访问另一个类型的属性。这类似于你在运行时访问对象中属性的值的方式，但是在类型级别上操作。

例如，我们可以使用索引访问类型从`AlbumDetails`中提取`title`属性的类型：

```typescript
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
}
```

如果我们尝试使用点表示法访问`Album`类型中的`title`属性，TypeScript将抛出错误：

```ts twoslash
// @errors: 2713
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
}

// ---cut---
type AlbumTitle = Album.title;
```

在这种情况下，错误消息有一个有用的建议：使用`Album["title"]`访问`Album`类型中`title`属性的类型：

```ts twoslash
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
}

// ---cut---
type AlbumTitle = Album["title"];
//   ^?
```

使用这种索引访问语法，`AlbumTitle`类型等同于`string`，因为这是`Album`接口中`title`属性的类型。

同样的方法可以用于从元组中提取类型，其中索引用于访问元组中特定元素的类型：

```typescript
type AlbumTuple = [string, string, number];
type AlbumTitle = AlbumTuple[0];
```

再次，`AlbumTitle`将是一个`string`类型，因为这是`AlbumTuple`中第一个元素的类型。

### 链接多个索引访问类型

索引访问类型可以链接在一起以访问嵌套属性。这在处理具有嵌套结构的复杂类型时很有用。

例如，我们可以使用索引访问类型从`Album`类型中的`artist`属性中提取`name`属性的类型：

```typescript
interface Album {
  title: string;
  artist: {
    name: string;
  };
}

type ArtistName = Album["artist"]["name"];
```

在这种情况下，`ArtistName`类型将等同于`string`，因为这是`artist`对象中`name`属性的类型。

### 将联合传递给索引访问类型

如果你想从类型中访问多个属性，你可能会尝试创建一个包含多个索引访问的联合类型：

```typescript
type Album = {
  title: string;
  isSingle: boolean;
  releaseYear: number;
};

type AlbumPropertyTypes =
  | Album["title"]
  | Album["isSingle"]
  | Album["releaseYear"];
```

这将起作用，但你可以做得更好 - 你可以直接将联合类型传递给索引访问类型：

```ts twoslash
type Album = {
  title: string;
  isSingle: boolean;
  releaseYear: number;
};
// ---cut---
type AlbumPropertyTypes = Album["title" | "isSingle" | "releaseYear"];
//   ^?
```

这是一种更简洁的方式来实现相同的结果。

#### 使用`keyof`获取对象的值

事实上，你可能已经注意到我们在这里有另一个减少重复的机会。我们可以使用`keyof`从`Album`类型中提取键，并将它们用作联合类型：

```ts twoslash
type Album = {
  title: string;
  isSingle: boolean;
  releaseYear: number;
};
// ---cut---
type AlbumPropertyTypes = Album[keyof Album];
//   ^?
```

当你想从对象类型中提取所有值时，这是一个很好的模式。`keyof Obj`将给你`Obj`中所有_键_的联合，而`Obj[keyof Obj]`将给你`Obj`中所有_值_的联合。

## 使用`as const`实现JavaScript风格的枚举

在我们关于TypeScript独有特性的章节中，我们看了`enum`关键字。我们看到`enum`是创建一组命名常量的强大方式，但它有一些缺点。

我们现在拥有所有可用的工具，可以看到在TypeScript中创建类似枚举结构的替代方法。

首先，让我们使用我们在可变性章节中看到的`as const`断言。这强制将对象视为只读，并为其属性推断字面类型：

```typescript
const albumTypes = {
  CD: "cd",
  VINYL: "vinyl",
  DIGITAL: "digital",
} as const;
```

我们现在可以使用`keyof`和`typeof`从`albumTypes`_派生_我们需要的类型。例如，我们可以使用`keyof`获取键：

```typescript
type UppercaseAlbumType = keyof typeof albumTypes; // "CD" | "VINYL" | "DIGITAL"
```

我们也可以使用`Obj[keyof Obj]`获取值：

```typescript
type AlbumType = (typeof albumTypes)[keyof typeof albumTypes]; // "cd" | "vinyl" | "digital"
```

我们现在可以使用我们的`AlbumType`类型来确保函数只接受来自`albumTypes`的值之一：

```typescript
function getAlbumType(type: AlbumType) {
  // ...
}
```

这种方法有时被称为"POJO"，或"普通旧JavaScript对象"。虽然需要一些TypeScript魔法来设置类型，但结果简单易懂且易于使用。

现在让我们将其与`enum`方法进行比较。

### 枚举要求你传递枚举值

我们的`getAlbumType`函数的行为与接受`enum`的函数不同。因为`AlbumType`只是字符串的联合，我们可以将原始字符串传递给`getAlbumType`。但如果我们传递不正确的字符串，TypeScript将显示错误：

```ts twoslash
// @errors: 2345
function getAlbumType(type: AlbumType) {
  // ...
}

const albumTypes = {
  CD: "cd",
  VINYL: "vinyl",
  DIGITAL: "digital",
} as const;

type AlbumType = (typeof albumTypes)[keyof typeof albumTypes]; // "cd" | "vinyl" | "digital"

// ---cut---
getAlbumType(albumTypes.CD); // 没有错误
getAlbumType("vinyl"); // 没有错误
getAlbumType("cassette");
```

这是一个权衡。使用`enum`，你必须传递枚举值，这更明确。使用我们的`as const`方法，你可以传递原始字符串。这可能使重构变得更加困难。

### 枚举必须被导入

`enum`的另一个缺点是它们必须被导入到你所在的模块中才能使用：

```typescript
import { AlbumType } from "./enums";

getAlbumType(AlbumType.CD);
```

使用我们的`as const`方法，我们不需要导入任何东西。我们可以传递原始字符串：

```typescript
getAlbumType("cd");
```

枚举的粉丝会争辩说导入枚举是一件好事，因为它明确了枚举来自哪里，并使重构更容易。

### 枚举是名义的

`enum`和我们的`as const`方法之间最大的区别之一是`enum`是_名义的_，而我们的`as const`方法是_结构的_。

这意味着使用`enum`，类型基于枚举的名称。这意味着具有相同值但来自不同枚举的枚举不兼容：

```ts twoslash
// @errors: 2345
function getAlbumType(type: AlbumType) {
  // ...
}

// ---cut---
enum AlbumType {
  CD = "cd",
  VINYL = "vinyl",
  DIGITAL = "digital",
}

enum MediaType {
  CD = "cd",
  VINYL = "vinyl",
  DIGITAL = "digital",
}

getAlbumType(AlbumType.CD);
getAlbumType(MediaType.CD);
```

如果你习惯于其他语言中的枚举，这可能是你所期望的。但对于习惯于JavaScript的开发人员来说，这可能令人惊讶。

使用POJO，值的来源并不重要。如果两个POJO具有相同的值，它们是兼容的：

```typescript
const albumTypes = {
  CD: "cd",
  VINYL: "vinyl",
  DIGITAL: "digital",
} as const;

const mediaTypes = {
  CD: "cd",
  VINYL: "vinyl",
  DIGITAL: "digital",
} as const;

getAlbumType(albumTypes.CD); // 没有错误
getAlbumType(mediaTypes.CD); // 没有错误
```

这是一个权衡。名义类型可以更明确并帮助捕获错误，但它也可能更具限制性且更难使用。

### 你应该使用哪种方法？

`enum`方法更明确，可以帮助你重构代码。它对来自其他语言的开发人员也更熟悉。

`as const`方法更灵活，更容易使用。它对JavaScript开发人员也更熟悉。

一般来说，如果你与习惯于`enum`的团队一起工作，你应该使用`enum`。但如果我今天开始一个项目，我会使用`as const`而不是枚举。

## 练习

### 练习1：减少键重复

这里我们有一个名为`FormValues`的接口：

```typescript
interface FormValues {
  name: string;
  email: string;
  password: string;
}
```

这个`inputs`变量被类型化为一个Record，指定键为`name`、`email`或`password`之一，值为一个对象，具有`initialValue`和`label`属性，都是字符串：

```typescript
const inputs: Record<
  "name" | "email" | "password", // 修改我！
  {
    initialValue: string;
```
