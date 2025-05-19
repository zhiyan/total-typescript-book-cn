# 派生类型

编写可维护代码最常见的建议之一是“保持代码 DRY”，或者更明确地说，“不要重复自己”。

在 JavaScript 中实现这一点的一种方法是将重复的代码提取出来，并将其封装在函数或变量中。这些变量和函数可以被重用、组合，以不同的方式创建新的功能。

在 TypeScript 中，我们可以将同样的原则应用于类型。

在本节中，我们将探讨如何从其他类型派生类型。这使我们能够减少代码中的重复，并为我们的类型创建一个单一的真实来源。

这允许我们在一个类型中进行更改，并将这些更改传播到整个应用程序，而无需手动更新每个实例。

我们甚至将研究如何从*值*中派生类型，以便我们的类型始终能代表应用程序的运行时行为。

## 派生类型

派生类型是依赖于或继承自另一种类型结构的类型。我们可以使用一些我们已经用过的工具来创建派生类型。

我们可以使用 `interface extends` 来让一个接口继承另一个接口：

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

`AlbumDetails` 继承了 `Album` 的所有属性。这意味着对 `Album` 的任何更改都会传递到 `AlbumDetails`。`AlbumDetails` 是从 `Album` 派生的。

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

派生类型代表一种关系。这种关系是单向的。`Shape` 不能反过来修改 `Triangle` 或 `Rectangle`。但是对 `Triangle` 和 `Rectangle` 的任何更改都会影响到 `Shape`。

如果设计得当，派生类型可以极大地提高生产力。我们可以在一个地方进行更改，并让这些更改传播到整个应用程序中。这是保持代码 DRY 并充分利用 TypeScript 类型系统的强大方法。

这也有一些权衡。我们可以将派生视为一种耦合。如果我们更改了其他类型依赖的类型，我们需要意识到该更改的影响。我们将在本章末尾更详细地讨论派生与解耦。

但现在，让我们看看 TypeScript 为派生类型提供的一些工具。

## `keyof` 操作符

`keyof` 操作符允许您从对象类型中提取键，并将其转换为联合类型。

从我们熟悉的 `Album` 类型开始：

```typescript
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
}
```

我们可以使用 `keyof Album`，最终得到包含 `"title"`、`"artist"` 和 `"releaseYear"` 键的联合类型：

```typescript
type AlbumKeys = keyof Album; // "title" | "artist" | "releaseYear"
```

由于 `keyof` 会跟踪源类型的键，因此对该类型所做的任何更改都将自动反映在 `AlbumKeys` 类型中。

```typescript
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
  genre: string; // 添加了 'genre'
}

type AlbumKeys = keyof Album; // "title" | "artist" | "releaseYear" | "genre"
```

然后，`AlbumKeys` 类型可用于帮助确保用于访问 `Album` 中值的键是有效的，如此函数所示：

```typescript
function getAlbumDetails(album: Album, key: AlbumKeys) {
  return album[key];
}
```

如果传递给 `getAlbumDetails` 的键不是 `Album` 的有效键，TypeScript 将显示错误：

```ts twoslash
// @errors: 2345
function getAlbumDetails(album: Album, key: AlbumKeys) {
  return album[key];
}

interface Album {
  title: string;
  artist: string;
  releaseYear: number;
  genre: string; // 添加了 'genre'
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

在从现有类型创建新类型时，`keyof` 是一个重要的构建块。稍后我们将看到如何将它与 `as const` 一起使用来构建我们自己的类型安全的枚举。

## `typeof` 操作符

`typeof` 操作符允许您从值中提取类型。

假设我们有一个 `albumSales` 对象，其中包含一些专辑标题键和一些销售统计数据：

```typescript
const albumSales = {
  "Kind of Blue": 5000000,
  "A Love Supreme": 1000000,
  "Mingus Ah Um": 3000000,
};
```

我们可以使用 `typeof` 来提取 `albumSales` 的类型，这将把它转换成一个类型，其中原始键为字符串，其推断类型为值：

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

现在我们有了 `AlbumSalesType` 类型，我们可以从中创建*另一个*派生类型。例如，我们可以使用 `keyof` 从 `albumSales` 对象中提取键：

```typescript
type AlbumTitles = keyof AlbumSalesType; // "Kind of Blue" | "A Love Supreme" | "Mingus Ah Um"
```

一种常见的模式是结合使用 `keyof` 和 `typeof`，从现有对象类型的键和值创建新类型：

```typescript
type AlbumTitles = keyof typeof albumSales;
```

我们可以在函数中使用它来确保 `title` 参数是 `albumSales` 的有效键，也许是为了查找特定专辑的销售额：

```typescript
function getSales(title: AlbumTitles) {
  return albumSales[title];
}
```

值得注意的是，`typeof` 与运行时使用的 `typeof` 操作符不同。TypeScript 可以根据它是在类型上下文还是值上下文中使用来区分它们：

```ts twoslash
const albumSales = {
  "Kind of Blue": 5000000,
  "A Love Supreme": 1000000,
  "Mingus Ah Um": 3000000,
};

// ---cut---
// 运行时 typeof
const albumSalesType = typeof albumSales; // "object"

// 类型 typeof
type AlbumSalesType = typeof albumSales;
//   ^?
```

每当您需要根据运行时值（包括对象、函数、类等）提取类型时，请使用 `typeof` 关键字。它是从值派生类型的强大工具，也是我们稍后将探讨的其他模式的关键构建块。

### 你不能从值创建运行时类型

我们已经看到 `typeof` 可以从运行时值创建类型，但需要注意的是，无法从类型创建值。

换句话说，没有 `valueof` 操作符：

```ts
type Album = {
  title: string;
  artist: string;
  releaseYear: number;
};

const album = valueof Album; // 不起作用！
```

TypeScript 的类型在运行时会消失，因此没有内置的方法可以从类型创建值。换句话说，你可以从“值世界”进入“类型世界”，但反过来不行。

## 索引访问类型

TypeScript 中的索引访问类型允许您访问另一个类型的属性。这类似于您在运行时访问对象属性值的方式，但它在类型级别上操作。

例如，我们可以使用索引访问类型从 `AlbumDetails` 中提取 `title` 属性的类型：

```typescript
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
}
```

如果我们尝试使用点表示法从 `Album` 类型访问 `title` 属性，TypeScript 将会抛出错误：

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

在这种情况下，错误消息有一个有用的建议：使用 `Album["title"]` 来访问 `Album` 类型中 `title` 属性的类型：

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

使用这种索引访问语法，`AlbumTitle` 类型等同于 `string`，因为这是 `Album` 接口中 `title` 属性的类型。

同样的方法也可以用于从元组中提取类型，其中索引用于访问元组中特定元素的类型：

```typescript
type AlbumTuple = [string, string, number];
type AlbumTitle = AlbumTuple[0];
```

同样，`AlbumTitle` 将是 `string` 类型，因为这是 `AlbumTuple` 中第一个元素的类型。

### 链接多个索引访问类型

索引访问类型可以链接在一起以访问嵌套属性。这在处理具有嵌套结构的复杂类型时非常有用。

例如，我们可以使用索引访问类型来提取 `Album` 类型中 `artist` 属性下 `name` 属性的类型：

```typescript
interface Album {
  title: string;
  artist: {
    name: string;
  };
}

type ArtistName = Album["artist"]["name"];
```

在这种情况下，`ArtistName` 类型将等同于 `string`，因为这是 `artist` 对象中 `name` 属性的类型。

### 将联合类型传递给索引访问类型

如果你想从一个类型中访问多个属性，你可能会想创建一个包含多个索引访问的联合类型：

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

这样做是可行的，但你可以做得更好——你可以直接将联合类型传递给索引访问类型：

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

#### 使用 `keyof` 获取对象的属性值

事实上，你可能已经注意到这里我们还有另一个减少重复的机会。我们可以使用 `keyof` 从 `Album` 类型中提取键，并将它们用作联合类型：

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

当您想从对象类型中提取所有值时，这是一个很好的模式。`keyof Obj` 将为您提供 `Obj` 中所有*键*的联合，而 `Obj[keyof Obj]` 将为您提供 `Obj` 中所有*值*的联合。

## 使用 `as const` 实现 JavaScript 风格的枚举

在我们关于 TypeScript 独有特性的章节中，我们了解了 `enum` 关键字。我们看到 `enum` 是创建一组命名常量的强大方法，但它也有一些缺点。

我们现在拥有了所有可用的工具，可以看到一种在 TypeScript 中创建类似枚举结构的替代方法。

首先，让我们使用在可变性章节中看到的 `as const`断言。这会强制将对象视为只读，并为其属性推断出字面量类型：

```typescript
const albumTypes = {
  CD: "cd",
  VINYL: "vinyl",
  DIGITAL: "digital",
} as const;
```

我们现在可以使用 `keyof` 和 `typeof` 从 `albumTypes` *派生*出我们需要的类型。例如，我们可以使用 `keyof` 来获取键：

```typescript
type UppercaseAlbumType = keyof typeof albumTypes; // "CD" | "VINYL" | "DIGITAL"
```

我们也可以使用 `Obj[keyof Obj]` 来获取值：

```typescript
type AlbumType = (typeof albumTypes)[keyof typeof albumTypes]; // "cd" | "vinyl" | "digital"
```

我们现在可以使用我们的 `AlbumType` 类型来确保函数只接受来自 `albumTypes` 的值之一：

```typescript
function getAlbumType(type: AlbumType) {
  // ...
}
```

这种方法有时被称为 "POJO"，即 "Plain Old JavaScript Object"。虽然需要一些 TypeScript 的技巧来设置类型，但结果很容易理解和使用。

现在让我们将其与 `enum` 方法进行比较。

### 枚举要求你传递枚举值

我们的 `getAlbumType` 函数的行为与接受 `enum` 的函数不同。因为 `AlbumType` 只是一个字符串联合，所以我们可以将原始字符串传递给 `getAlbumType`。但是如果我们传递了不正确的字符串，TypeScript 将会显示一个错误：

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

这是一个权衡。使用 `enum`，你必须传递枚举值，这更明确。使用我们的 `as const` 方法，你可以传递一个原始字符串。这可能会使重构稍微困难一些。

### 枚举必须导入

`enum` 的另一个缺点是它们必须被导入到你正在使用的模块中才能使用：

```typescript
import { AlbumType } from "./enums";

getAlbumType(AlbumType.CD);
```

使用我们的 `as const` 方法，我们不需要导入任何东西。我们可以传递原始字符串：

```typescript
getAlbumType("cd");
```

枚举的拥护者会认为导入枚举是件好事，因为它清楚地表明了枚举的来源，并使重构更容易。

### 枚举是名义化的

`enum` 和我们的 `as const` 方法之间最大的区别之一是 `enum` 是*名义化的 (nominal)*，而我们的 `as const` 方法是*结构化的 (structural)*。

这意味着对于 `enum`，类型是基于枚举的名称。这意味着具有相同值但来自不同枚举的枚举是不兼容的：

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

如果你习惯了其他语言中的枚举，这可能是你所期望的。但对于习惯 JavaScript 的开发者来说，这可能会令人惊讶。

对于 POJO，值的来源并不重要。如果两个 POJO 具有相同的值，它们是兼容的：

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

这是一个权衡。名义化类型可以更明确并帮助捕获错误，但它也可能更具限制性且更难使用。

### 你应该使用哪种方法？

`enum` 方法更明确，可以帮助你重构代码。对于来自其他语言的开发者来说，它也更熟悉。

`as const` 方法更灵活，更容易使用。对于 JavaScript 开发者来说，它也更熟悉。

总的来说，如果你正在与习惯使用 `enum` 的团队合作，你应该使用 `enum`。但如果我今天要开始一个项目，我会使用 `as const` 而不是枚举。

## 练习

### 练习 1：减少键的重复

这里我们有一个名为 `FormValues` 的接口：

```typescript
interface FormValues {
  name: string;
  email: string;
  password: string;
}
```

这个 `inputs` 变量被类型化为一个 Record，它指定了一个键，可以是 `name`、`email` 或 `password`，以及一个值，该值是一个对象，具有 `initialValue` 和 `label` 属性，两者都是字符串：

```typescript
const inputs: Record<
  "name" | "email" | "password", // 修改这里！
  {
    initialValue: string;
    label: string;
  }
> = {
  name: {
    initialValue: "",
    label: "Name",
  },
  email: {
    initialValue: "",
    label: "Email",
  },
  password: {
    initialValue: "",
    label: "Password",
  },
};
```

注意这里有很多重复。`FormValues` 接口和 `inputs` Record 都包含 `name`、`email` 和 `password`。

你的任务是修改 `inputs` Record，使其键派生自 `FormValues` 接口。

### 练习 2：从值派生类型

这里，我们有一个名为 `configurations` 的对象，它包含一组用于 `development`、`production` 和 `staging` 的部署环境。

每个环境都有其自己的 url 和 timeout 设置：

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
  },
};
```

一个 `Environment` 类型已声明如下：

```typescript
type Environment = "development" | "production" | "staging";
```

我们希望在整个应用程序中使用 `Environment` 类型。但是，`configurations` 对象应该用作事实来源。

您的任务是更新 `Environment` 类型，使其从 `configurations` 对象派生。

### 练习 3：访问特定值

这里我们有一个 `programModeEnumMap` 对象，用于保持不同分组的同步。还有一个 `ProgramModeMap` 类型，它使用 `typeof` 来表示整个枚举映射：

```typescript
export const programModeEnumMap = {
  GROUP: "group",
  ANNOUNCEMENT: "announcement",
  ONE_ON_ONE: "1on1",
  SELF_DIRECTED: "selfDirected",
  PLANNED_ONE_ON_ONE: "planned1on1",
  PLANNED_SELF_DIRECTED: "plannedSelfDirected",
} as const;

type ProgramModeMap = typeof programModeEnumMap;
```

目标是拥有一个 `Group` 类型，该类型始终与 `ProgramModeEnumMap` 的 `group` 值保持同步。目前它被类型化为 `unknown`：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";
// ---cut---
type Group = unknown;

type test = Expect<Equal<Group, "group">>;
```

你的任务是找到正确的方法来类型化 `Group`，以便测试按预期通过。

### 练习 4：使用索引访问类型的联合类型

本练习从与前一个练习相同的 `programModeEnumMap` 和 `ProgramModeMap` 开始：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";
// ---cut---
export const programModeEnumMap = {
  GROUP: "group",
  ANNOUNCEMENT: "announcement",
  ONE_ON_ONE: "1on1",
  SELF_DIRECTED: "selfDirected",
  PLANNED_ONE_ON_ONE: "planned1on1",
  PLANNED_SELF_DIRECTED: "plannedSelfDirected",
} as const;

type ProgramModeMap = typeof programModeEnumMap;

type PlannedPrograms = unknown;

type test = Expect<
  Equal<PlannedPrograms, "planned1on1" | "plannedSelfDirected">
>;
```

这一次，你的挑战是更新 `PlannedPrograms` 类型，以使用索引访问类型来提取 `ProgramModeMap` 值中包含 "`planned`" 的联合。

### 练习 5：提取所有值的联合

我们又回到了 `programModeEnumMap` 和 `ProgramModeMap` 类型：

```typescript
export const programModeEnumMap = {
  GROUP: "group",
  ANNOUNCEMENT: "announcement",
  ONE_ON_ONE: "1on1",
  SELF_DIRECTED: "selfDirected",
  PLANNED_ONE_ON_ONE: "planned1on1",
  PLANNED_SELF_DIRECTED: "plannedSelfDirected",
} as const;

type ProgramModeMap = typeof programModeEnumMap;
```

这次我们感兴趣的是从 `programModeEnumMap` 对象中提取所有的值：

```typescript
import { Equal, Expect } from "@total-typescript/helpers";
// ---cut---
type AllPrograms = unknown;

type test = Expect<
  Equal<
    AllPrograms,
    | "group"
    | "announcement"
    | "1on1"
    | "selfDirected"
    | "planned1on1"
    | "plannedSelfDirected"
  >
>;
```

利用你目前所学到的知识，你的任务是更新 `AllPrograms` 类型，以使用索引访问类型从 `programModeEnumMap` 对象创建所有值的联合。

### 练习 6：从 `as const` 数组创建联合类型

这里有一个用 `as const` 包装的 `programModes` 数组：

```typescript
export const programModes = [
  "group",
  "announcement",
  "1on1",
  "selfDirected",
  "planned1on1",
  "plannedSelfDirected",
] as const;
```

已经编写了一个测试来检查 `AllPrograms` 类型是否是 `programModes` 数组中所有值的联合：

```typescript
import { Equal, Expect } from "@total-typescript/helpers";
type AllPrograms = unknown;
// ---cut---

type test = Expect<
  Equal<
    AllPrograms,
    | "group"
    | "announcement"
    | "1on1"
    | "selfDirected"
    | "planned1on1"
    | "plannedSelfDirected"
  >
>;
```

你的任务是确定如何创建 `AllPrograms` 类型，以便测试按预期通过。

请注意，仅使用 `keyof` 和 `typeof` 并采用与上一个练习解决方案类似的方法并不能完全解决这个问题！这很难找到——但作为一个提示：你可以将原始类型传递给索引访问类型。

### 解决方案 1：减少键的重复

解决方案是使用 `keyof` 从 `FormValues` 接口中提取键，并将它们用作 `inputs` Record 的键：

```typescript
const inputs: Record<
  keyof FormValues, // "name" | "email" | "password"
  {
    initialValue: string;
    label: string;
  } = {
    // 和之前的对象一样
  };
```

现在，如果 `FormValues` 接口发生更改，`inputs` Record 将自动更新以反映这些更改。`inputs` 是从 `FormValues` 派生的。

### 解决方案 2：从值派生类型

解决方案是使用 `typeof` 关键字结合 `keyof` 来创建 `Environment` 类型。

你可以将它们组合在一行中使用：

```typescript
type Environment = keyof typeof configurations;
```

或者，你可以首先从 `configurations` 对象创建一个类型，然后更新 `Environment` 以使用 `keyof` 来提取键的名称：

```ts twoslash
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
  },
};
// ---cut---
type Configurations = typeof configurations;
//   ^?

type Environment = keyof Configurations;
//   ^?
```

### 解决方案 3：访问特定值

使用索引访问类型，我们可以从 `ProgramModeMap` 类型中访问 `GROUP` 属性：

```ts twoslash
export const programModeEnumMap = {
  GROUP: "group",
  ANNOUNCEMENT: "announcement",
  ONE_ON_ONE: "1on1",
  SELF_DIRECTED: "selfDirected",
  PLANNED_ONE_ON_ONE: "planned1on1",
  PLANNED_SELF_DIRECTED: "plannedSelfDirected",
} as const;

type ProgramModeMap = typeof programModeEnumMap;

// ---cut---
type Group = ProgramModeMap["GROUP"];
//   ^?
```

通过此更改，`Group` 类型将与 `ProgramModeEnumMap` 的 `group` 值保持同步。这意味着我们的测试将按预期通过。

### 解决方案 4：使用索引访问类型的联合类型

为了创建 `PlannedPrograms` 类型，我们可以使用索引访问类型来提取 `ProgramModeMap` 值中包含 "`planned`" 的联合：

```typescript
type Key = "PLANNED_ONE_ON_ONE" | "PLANNED_SELF_DIRECTED";
type PlannedPrograms = ProgramModeMap[Key];
```

通过此更改，`PlannedPrograms` 类型将是 `planned1on1` 和 `plannedSelfDirected` 的联合，这意味着我们的测试将按预期通过。

### 解决方案 5：提取所有值的联合

将 `keyof` 和 `typeof` 一起使用是解决此问题的方法。

最简洁的解决方案如下所示：

```typescript
type AllPrograms = (typeof programModeEnumMap)[keyof typeof programModeEnumMap];
```

使用中间类型，你可以首先使用 `typeof programModeEnumMap` 从 `programModeEnumMap` 对象创建一个类型，然后使用 `keyof` 提取键：

```ts twoslash
export const programModeEnumMap = {
  GROUP: "group",
  ANNOUNCEMENT: "announcement",
  ONE_ON_ONE: "1on1",
  SELF_DIRECTED: "selfDirected",
  PLANNED_ONE_ON_ONE: "planned1on1",
  PLANNED_SELF_DIRECTED: "plannedSelfDirected",
} as const;

// ---cut---
type ProgramModeMap = typeof programModeEnumMap;
type AllPrograms = ProgramModeMap[keyof ProgramModeMap];
//   ^?
```

两种解决方案都会产生 `programModeEnumMap` 对象中所有值的联合，这意味着我们的测试将按预期通过。

### 解决方案 6：从 `as const` 数组创建联合类型

当将 `typeof` 和 `keyof` 与索引访问类型一起使用时，我们可以提取所有值，但我们也会得到一些意外的值，比如 `6` 和一个 `IterableIterator` 函数：

```ts twoslash
export const programModes = [
  "group",
  "announcement",
  "1on1",
  "selfDirected",
  "planned1on1",
  "plannedSelfDirected",
] as const;

// ---cut---
type AllPrograms = (typeof programModes)[keyof typeof programModes];
//   ^?
```

提取的额外内容导致测试失败，因为它只期望原始值而不是数字和函数。

回想一下，我们可以使用 `programModes[0]` 访问第一个元素，使用 `programModes[1]` 访问第二个元素，依此类推。这意味着我们可以使用所有可能索引值的联合来从 `programModes` 数组中提取值：

```typescript
type AllPrograms = (typeof programModes)[0 | 1 | 2 | 3 | 4 | 5];
```

这个解决方案使测试通过，但它不能很好地扩展。如果 `programModes` 数组发生更改，我们将需要手动更新 `AllPrograms` 类型。

相反，我们可以使用 `number` 类型作为索引访问类型的参数来表示所有可能的索引值：

```typescript
type AllPrograms = (typeof programModes)[number];
```

现在可以将新项添加到 `programModes` 数组中，而无需手动更新 `AllPrograms` 类型。此解决方案使测试按预期通过，并且是在您自己的项目中应用的一个很好的模式。

## 从函数派生类型

到目前为止，我们只研究了从对象和数组派生类型。但是从函数派生类型可以帮助解决 TypeScript 中的一些常见问题。

### `Parameters`

`Parameters` 工具类型从给定的函数类型中提取参数，并将其作为元组返回。

例如，这个 `sellAlbum` 函数接收一个 `Album`、一个 `price` 和一个 `quantity`，然后返回一个表示总价的数字：

```typescript
function sellAlbum(album: Album, price: number, quantity: number) {
  return price * quantity;
}
```

使用 `Parameters` 工具类型，我们可以从 `sellAlbum` 函数中提取参数并将它们分配给一个新类型：

```ts twoslash
type Album = {
  title: string;
  artist: string;
  releaseYear: number;
};

function sellAlbum(album: Album, price: number, quantity: number) {
  return price * quantity;
}
// ---cut---
type SellAlbumParams = Parameters<typeof sellAlbum>;
//   ^?
```

请注意，我们需要使用 `typeof` 从 `sellAlbum` 函数创建一个类型。直接将 `sellAlbum` 传递给 `Parameters` 本身是行不通的，因为 `sellAlbum` 是一个值而不是一个类型：

```ts twoslash
// @errors: 2749
type Album = {
  title: string;
  artist: string;
  releaseYear: number;
};
function sellAlbum(album: Album, price: number, quantity: number) {
  return price * quantity;
}
// ---cut---
type SellAlbumParams = Parameters<sellAlbum>;
```

这个 `SellAlbumParams` 类型是一个元组类型，它包含来自 `sellAlbum` 函数的 `Album`、`price` 和 `quantity` 参数。

如果我们需要从 `SellAlbumParams` 类型中访问特定参数，我们可以使用索引访问类型：

```typescript
type Price = SellAlbumParams[1]; // number
```

### `ReturnType`

`ReturnType` 工具类型从给定的函数中提取返回类型：

```ts twoslash
type Album = {
  title: string;
  artist: string;
  releaseYear: number;
};
function sellAlbum(album: Album, price: number, quantity: number) {
  return price * quantity;
}
// ---cut---
type SellAlbumReturn = ReturnType<typeof sellAlbum>;
//   ^?
```

在这种情况下，`SellAlbumReturn` 类型是一个数字，它是从 `sellAlbum` 函数派生的。

### `Awaited`

在本书的前面部分，我们在处理异步代码时使用了 `Promise` 类型。

`Awaited` 工具类型用于解包 `Promise` 类型并提供已解析值的类型。可以把它看作是类似于使用 `await` 或 `.then()` 方法的快捷方式。

这对于派生 `async` 函数的返回类型特别有用。

要使用它，你需要将一个 `Promise` 类型传递给 `Awaited`，它将返回已解析值的类型：

```typescript
type AlbumPromise = Promise<Album>;

type AlbumResolved = Awaited<AlbumPromise>;
```

### 为什么从函数派生类型？

能够从函数派生类型一开始可能看起来不是很有用。毕竟，如果我们控制函数，那么我们就可以自己编写类型，并根据需要重用它们：

```typescript
type Album = {
  title: string;
  artist: string;
  releaseYear: number;
};

const sellAlbum = (album: Album, price: number, quantity: number) => {
  return price * quantity;
};
```

没有理由在 `sellAlbum` 上使用 `Parameters` 或 `ReturnType`，因为我们自己定义了 `Album` 类型和返回类型。

但是那些你不控制的函数呢？

一个常见的例子是第三方库。一个库可能会导出一个你可以使用的函数，但可能不会导出相应的类型。我最近遇到的一个例子是来自 `@monaco-editor/react` 库的一个类型。

```tsx
import { Editor } from "@monaco-editor/react";

// 这是 JSX 组件，对我们来说等同于...
<Editor
  onMount={(editor) => {
    // ...
  }}
/>;

// ...直接用一个对象调用函数
Editor({
  onMount: (editor) => {
    // ...
  },
});
```

在这种情况下，我想知道 `editor` 的类型，以便可以在其他地方的函数中重用它。但是 `@monaco-editor/react` 库没有导出它的类型。

首先，我提取了组件期望的对象类型：

```typescript
type EditorProps = Parameters<typeof Editor>[0];
```

然后，我使用索引访问类型来提取 `onMount` 属性的类型：

```typescript
type OnMount = EditorProps["onMount"];
```

最后，我从 `OnMount` 类型中提取了第一个参数以获取 `editor` 的类型：

```typescript
type Editor = Parameters<OnMount>[0];
```

这使我能够在代码的其他地方的函数中重用 `Editor` 类型。

通过将索引访问类型与 TypeScript 的工具类型相结合，您可以解决第三方库的局限性，并确保您的类型与您正在使用的函数保持同步。

## 练习

### 练习 7：单一事实来源

这里我们有一个 `makeQuery` 函数，它接受两个参数：一个 `url` 和一个可选的 `opts` 对象。

```typescript
const makeQuery = (
  url: string,
  opts?: {
    method?: string;
    headers?: {
      [key: string]: string;
    };
    body?: string;
  }
) => {};
```

我们希望将这些参数指定为一个名为 `MakeQueryParameters` 的元组，其中元组的第一个参数是字符串，第二个成员是可选的 `opts` 对象。

手动指定 `MakeQueryParameters` 大致如下：

```typescript
type MakeQueryParameters = [
  string,
  {
    method?: string;
    headers?: {
      [key: string]: string;
    };
    body?: string;
  }?
];
```

除了编写和阅读起来有点麻烦之外，上面的另一个问题是我们现在有两个事实来源：一个是 `MakeQueryParameters` 类型，另一个是在 `makeQuery` 函数中。

你的任务是使用一个工具类型来解决这个问题。

### 练习 8：基于返回值的类型化

假设我们正在使用来自第三方库的 `createUser` 函数：

```typescript
const createUser = (id: string) => {
  return {
    id,
    name: "John Doe",
    email: "example@email.com",
  };
};
```

为了本练习的目的，假设我们不知道函数的实现。

目标是创建一个 `User` 类型，该类型表示 `createUser` 函数的返回类型。已经编写了一个测试来检查 `User` 类型是否匹配：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";
// ---cut---
type User = unknown;

type test = Expect<
  Equal<
    User,
    {
      id: string;
      name: string;
      email: string;
    }
  >
>;
```

你的任务是更新 `User` 类型，以便测试按预期通过。

### 练习 9：解包 Promise

这次来自第三方库的 `createUser` 函数是异步的：

```ts twoslash
// @errors: 2344 2304
import { Equal, Expect } from "@total-typescript/helpers";
// ---cut---
const fetchUser = async (id: string) => {
  return {
    id,
    name: "John Doe",
    email: "example@email.com",
  };
};

type test = Expect<
  Equal<
    User,
    {
      id: string;
      name: string;
      email: string;
    }
  >
>;
```

和以前一样，假设您无法访问 `WorkspaceUser` 函数的实现。

您的任务是更新 `User` 类型，以便测试按预期通过。

### 解决方案 7：单一事实来源

`Parameters` 工具类型是此解决方案的关键，但还有一个额外的步骤需要遵循。

直接将 `makeQuery` 传递给 `Parameters` 本身是行不通的，因为 `makeQuery` 是一个值而不是一个类型：

```ts twoslash
// @errors: 2749
const makeQuery = (
  url: string,
  opts?: {
    method?: string;
    headers?: {
      [key: string]: string;
    };
    body?: string;
  }
) => {};
// ---cut---
type MakeQueryParameters = Parameters<makeQuery>;
```

正如错误消息所建议的，我们需要使用 `typeof` 从 `makeQuery` 函数创建一个类型，然后将该类型传递给 `Parameters`：

```ts twoslash
const makeQuery = (
  url: string,
  opts?: {
    method?: string;
    headers?: {
      [key: string]: string;
    };
    body?: string;
  }
) => {};
// ---cut---
type MakeQueryParameters = Parameters<typeof makeQuery>;
//   ^?
```

我们现在有了 `MakeQueryParameters`，它表示一个元组，其中第一个成员是一个 `url` 字符串，第二个成员是可选的 `opts` 对象。

通过索引到该类型，我们可以创建一个表示 `opts` 对象的 `Opts` 类型：

```typescript
type Opts = MakeQueryParameters[1];
```

### 解决方案 8：基于返回值的类型化

使用 `ReturnType` 工具类型，我们可以从 `createUser` 函数中提取返回类型并将其分配给一个新类型。请记住，由于 `createUser` 是一个值，我们需要使用 `typeof` 从它创建一个类型：

```ts twoslash
const createUser = (id: string) => {
  return {
    id,
    name: "John Doe",
    email: "example@email.com",
  };
};

// ---cut---
type User = ReturnType<typeof createUser>;
//   ^?
```

这个 `User` 类型与预期类型匹配，这意味着我们的测试将按预期通过。

### 解决方案 9：解包 Promise

当将 `ReturnType` 工具类型与异步函数一起使用时，结果类型将被包装在 `Promise` 中：

```ts twoslash
const fetchUser = async (id: string) => {
  return {
    id,
    name: "John Doe",
    email: "example@email.com",
  };
};

// ---cut---
type User = ReturnType<typeof fetchUser>;
//   ^?
```

为了解包 `Promise` 类型并提供已解析值的类型，我们可以使用 `Awaited` 工具类型：

```typescript
type User = Awaited<ReturnType<typeof fetchUser>>;
```

和以前一样，`User` 类型现在与预期类型匹配，这意味着我们的测试将按预期通过。

也可以创建中间类型，但是组合运算符和类型派生为我们提供了一个更简洁的解决方案。

## 转换派生类型

在上一节中，我们研究了如何从不受您控制的函数派生类型。有时，您还需要对不受您控制的*类型*执行相同的操作。

### `Exclude`

`Exclude` 工具类型用于从联合类型中移除类型。让我们想象一下，我们有一个联合类型，表示我们的专辑可能处于的不同状态：

```typescript
type AlbumState =
  | {
      type: "released";
      releaseDate: string;
    }
  | {
      type: "recording";
      studio: string;
    }
  | {
      type: "mixing";
      engineer: string;
    };
```

我们想要创建一个代表非“released”状态的类型。我们可以使用 `Exclude` 工具类型来实现这一点：

```ts twoslash
type AlbumState =
  | {
      type: "released";
      releaseDate: string;
    }
  | {
      type: "recording";
      studio: string;
    }
  | {
      type: "mixing";
      engineer: string;
    };

// ---cut---
type UnreleasedState = Exclude<AlbumState, { type: "released" }>;
//   ^?
```

在这种情况下，`UnreleasedState` 类型是 `recording` 和 `mixing` 状态的联合，这些状态不是 "released"。`Exclude` 会过滤掉联合中 `type` 为 `released` 的任何成员。

我们本可以通过检查 `releaseDate` 属性来做到这一点：

```typescript
type UnreleasedState = Exclude<AlbumState, { releaseDate: string }>;
```

这是因为 `Exclude` 通过模式匹配工作。它将从联合中删除任何与您提供的模式匹配的类型。

这意味着我们可以用它来从联合中删除所有字符串：

```ts twoslash
type Example = "a" | "b" | 1 | 2;

type Numbers = Exclude<Example, string>;
//   ^?
```

### `NonNullable`

`NonNullable` 用于从类型中移除 `null` 和 `undefined`。这在从部分对象中提取类型时非常有用：

```ts twoslash
type Album = {
  artist?: {
    name: string;
  };
};

type Artist = NonNullable<Album["artist"]>;
//   ^?
```

这与 `Exclude` 的操作类似：

```typescript
type Artist = Exclude<Album["artist"], null | undefined>;
```

但是 `NonNullable` 更明确，也更容易阅读。

### `Extract`

`Extract` 与 `Exclude` 相反。它用于从联合类型中提取类型。例如，我们可以使用 `Extract` 从 `AlbumState` 类型中提取 `recording` 状态：

```ts twoslash
type AlbumState =
  | {
      type: "released";
      releaseDate: string;
    }
  | {
      type: "recording";
      studio: string;
    }
  | {
      type: "mixing";
      engineer: string;
    };

// ---cut---
type RecordingState = Extract<AlbumState, { type: "recording" }>;
//   ^?
```

当您想要从不受您控制的联合类型中提取特定类型时，这非常有用。

与 `Exclude` 类似，`Extract` 通过模式匹配工作。它将从联合中提取任何与您提供的模式匹配的类型。

这意味着，要反转我们之前的 `Extract` 示例，我们可以使用它从联合中提取所有字符串：

```ts twoslash
type Example = "a" | "b" | 1 | 2 | true | false;

type Strings = Extract<Example, string>;
//   ^?
```

值得注意的是 `Exclude`/`Extract` 和 `Omit/Pick` 之间的相似之处。一个常见的错误是认为可以从联合类型中 `Pick`，或者在对象上使用 `Exclude`。这里有一个小表格可以帮助你记住：

| 名称      | 用于     | 操作     | 示例                        |
| --------- | -------- | -------- | --------------------------- |
| `Exclude` | 联合类型 | 排除成员 | `Exclude<'a' \| 1, string>` |
| `Extract` | 联合类型 | 提取成员 | `Extract<'a' \| 1, string>` |
| `Omit`    | 对象     | 排除属性 | `Omit<UserObj, 'id'>`       |
| `Pick`    | 对象     | 提取属性 | `Pick<UserObj, 'id'>`       |

## 派生与解耦

感谢这些章节中的工具，我们现在知道如何从各种来源派生类型：函数、对象和类型。但是在派生类型时需要考虑一个权衡：耦合。

当您从源派生类型时，您正在将派生类型与该源耦合。如果您从另一个派生类型派生类型，这可能会在您的应用程序中创建很长的耦合链，从而难以管理。

### 何时解耦有意义

让我们假设我们在 `db.ts` 文件中有一个 `User` 类型：

```typescript
export type User = {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
};
```

在本例中，我们假设我们使用的是像 React、Vue 或 Svelte 这样的基于组件的框架。我们有一个 `AvatarImage` 组件，用于呈现用户的图像。我们可以直接传入 `User` 类型：

```tsx
import { User } from "./db";

export const AvatarImage = (props: { user: User }) => {
  return <img src={props.user.imageUrl} alt={props.user.name} />;
};
```

但事实证明，我们只使用了 `User` 类型中的 `imageUrl` 和 `name` 属性。让您的函数和组件只要求它们运行所需的数据是一个好主意。这有助于防止您传递不必要的数据。

让我们尝试派生。我们将创建一个名为 `AvatarImageProps` 的新类型，它只包含我们需要的属性：

```tsx
import { User } from "./db";

type AvatarImageProps = Pick<User, "imageUrl" | "name">;
```

但是让我们想一想。我们现在已经将 `AvatarImageProps` 类型与 `User` 类型耦合起来了。`AvatarImageProps` 现在不仅依赖于 `User` 的形状，还依赖于它在 `db.ts` 文件中的*存在*。这意味着如果我们将来移动 `User` 类型的位置，或者将其拆分为单独的接口，我们就需要考虑 `AvatarImageProps`。

让我们尝试另一种方式。与其从 `User` 派生 `AvatarImageProps`，不如将它们解耦。我们将创建一个新类型，它只包含我们需要的属性：

```tsx
type AvatarImageProps = {
  imageUrl: string;
  name: string;
};
```

现在，`AvatarImageProps` 与 `User` 解耦了。我们可以移动 `User`，将其拆分为单独的接口，甚至删除它，而 `AvatarImageProps` 不会受到影响。

在这种特殊情况下，解耦似乎是正确的选择。这是因为 `User` 和 `AvatarImage` 是不同的关注点。`User` 是一种数据类型，而 `AvatarImage` 是一个 UI 组件。它们有不同的职责和不同的更改原因。通过解耦它们，`AvatarImage` 变得更易于移植和维护。

使解耦成为一个困难决定的原因是，派生会让你感觉“聪明”。`Pick` 之所以吸引我们，是因为它使用了 TypeScript 更高级的特性，这让我们为应用了所学知识而感觉良好。但通常情况下，做简单的事情，保持类型解耦会更明智。

### 何时派生有意义

当您要耦合的代码共享一个共同的关注点时，派生最有意义。本章中的示例就是很好的例子。例如，我们的 `as const` 对象：

```typescript
const albumTypes = {
  CD: "cd",
  VINYL: "vinyl",
  DIGITAL: "digital",
} as const;

type AlbumType = (typeof albumTypes)[keyof typeof albumTypes];
```

在这里，`AlbumType` 是从 `albumTypes` 派生的。如果我们将其解耦，我们将不得不维护两个密切相关的真实来源：

```typescript
type AlbumType = "cd" | "vinyl" | "digital";
```

因为 `AlbumType` 和 `albumTypes` 密切相关，所以从 `albumTypes` 派生 `AlbumType` 是有意义的。

另一个例子是一个类型与另一个类型直接相关。例如，我们的 `User` 类型可能有一个从它派生的 `UserWithoutId` 类型：

```typescript
type User = {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
};

type UserWithoutId = Omit<User, "id">;

const updateUser = (id: string, user: UserWithoutId) => {
  // ...
};
```

同样，这些关注点密切相关。将它们解耦会使我们的代码更难维护，并给我们的代码库带来更多不必要的繁琐工作。

决定派生还是解耦，关键在于减少你未来的工作量。

这两种类型是否如此相关，以至于对一种类型的更新需要传递给另一种类型？那就派生。

它们是否如此不相关，以至于耦合它们可能会在将来导致更多的工作？那就解耦。
