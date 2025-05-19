# 设计你的类型

随着你构建 TypeScript 应用，你会注意到一些事情。你设计类型的方式将显著影响应用程序的可维护性。

你的类型不仅仅是在编译时捕获错误的一种方式。它们有助于反映和传达它们所代表的业务逻辑。

我们已经见过像 `interface extends` 这样的语法以及像 `Pick` 和 `Omit` 这样的类型助手。我们理解从其他类型派生类型的好处和权衡。在本章中，我们将更深入地探讨如何在 TypeScript 中设计你的类型。

我们将添加几种用于组合和转换类型的技术。我们将使用泛型类型，它可以将你的类型转换为“类型函数”。我们还将介绍模板字面量类型，用于定义和强制执行特定的字符串格式，以及映射类型，用于从一种类型派生另一种类型的结构。

## 泛型类型 (Generic Types)

泛型类型允许你将类型转换为可以接收参数的“类型函数”。我们以前见过泛型类型，比如 `Pick` 和 `Omit`。这些类型接收一个类型和一个键，并根据该键返回一个新类型：

```tsx
type Example = Pick<{ a: string; b: number }, "a">;
```

现在，我们将创建自己的泛型类型。这些类型在减少代码重复方面最为有用。

考虑这些 `StreamingPlaylist` 和 `StreamingAlbum` 类型，它们共享相似的结构：

```tsx
type StreamingPlaylist =
  | {
      status: "available";
      content: {
        id: number;
        name: string;
        tracks: string[];
      };
    }
  | {
      status: "unavailable";
      reason: string;
    };

type StreamingAlbum =
  | {
      status: "available";
      content: {
        id: number;
        title: string;
        artist: string;
        tracks: string[];
      };
    }
  | {
      status: "unavailable";
      reason: string;
    };
```

这两种类型都表示一个流媒体资源，该资源要么具有特定内容可用，要么由于某种原因不可用。

主要区别在于 `content` 对象的结构：`StreamingPlaylist` 类型有一个 `name` 属性，而 `StreamingAlbum` 类型有一个 `title` 和 `artist` 属性。尽管存在此差异，但类型的整体结构是相同的。

为了减少重复，我们可以创建一个名为 `ResourceStatus` 的泛型类型，它可以表示 `StreamingPlaylist` 和 `StreamingAlbum`。

要创建泛型类型，我们使用一个*类型参数*，它声明了该类型必须接收什么类型的参数。

要指定参数，我们使用尖括号语法，这对于在本书前面看到的各种类型助手来说会很熟悉：

```tsx
type ResourceStatus<TContent> = unknown;
```

我们的 `ResourceStatus` 类型将接收一个 `TContent` 的类型参数，它将表示特定于每个资源的 `content` 对象的结构。现在，我们将解析的类型设置为 `unknown`。

通常，类型参数使用单字母名称，如 `T`、`K` 或 `V`，但你可以根据自己的喜好命名它们。

现在我们已经将 `ResourceStatus` 声明为泛型类型，我们可以向它传递一个*类型参数*。

让我们创建一个 `Example` 类型，并提供一个对象类型作为 `TContent` 的类型参数：

```tsx
type Example = ResourceStatus<{
  id: string;
  name: string;
  tracks: string[];
}>;
```

就像 `Pick` 和 `Omit` 一样，类型参数作为参数传递给泛型类型。

但是 `Example` 会是什么类型呢？

```tsx
// hovering over Example shows
type Example = unknown;
```

我们将 `ResourceStatus` 的结果设置为 `unknown`。为什么会这样呢？我们可以通过将鼠标悬停在 `ResourceStatus` 类型中的 `TContent` 参数上来获得线索：

```tsx
type ResourceStatus<TContent> = unknown;

// hovering over TContent shows:
// Type 'TContent' is declared but its value is never read.
```

我们没有*使用* `TContent` 参数。无论传入什么，我们都只是返回 `unknown`。因此，`Example` 类型也是 `unknown`。

所以，让我们使用它。让我们更新 `ResourceStatus` 类型以匹配 `StreamingPlaylist` 和 `StreamingAlbum` 类型的结构，并将我们希望动态的部分替换为 `TContent` 类型参数：

```tsx
type ResourceStatus<TContent> =
  | {
      status: "available";
      content: TContent;
    }
  | {
      status: "unavailable";
      reason: string;
    };
```

我们现在可以重新定义 `StreamingPlaylist` 和 `StreamingAlbum` 来使用它：

```tsx
type StreamingPlaylist = ResourceStatus<{
  id: number;
  name: string;
  tracks: string[];
}>;

type StreamingAlbum = ResourceStatus<{
  id: number;
  title: string;
  artist: string;
  tracks: string[];
}>;
```

现在，如果我们将鼠标悬停在 `StreamingPlaylist` 上，我们会看到它具有与原来相同的结构，但它现在是使用 `ResourceStatus` 类型定义的，而无需手动提供其他属性：

```tsx
// hovering over StreamingPlaylist shows:

type StreamingPlaylist =
  | {
      status: "unavailable";
      reason: string;
    }
  | {
      status: "available";
      content: {
        id: number;
        name: string;
        tracks: string[];
      };
    };
```

`ResourceStatus` 现在是一个泛型类型。它是一种类型函数，这意味着它在运行时函数有用的所有方面都很有用。我们可以使用泛型类型来捕获类型中的重复模式，并使我们的类型更加灵活和可重用。

### 多个类型参数 (Multiple Type Parameters)

泛型类型可以接受多个类型参数，从而提供更大的灵活性。

我们可以扩展 `ResourceStatus` 类型以包含第二个类型参数，该参数表示伴随资源的元数据：

```tsx
type ResourceStatus<TContent, TMetadata> =
  | {
      status: "available";
      content: TContent;
      metadata: TMetadata;
    }
  | {
      status: "unavailable";
      reason: string;
    };
```

现在我们可以定义 `StreamingPlaylist` 和 `StreamingAlbum` 类型，我们可以包含特定于每个资源的元数据：

```tsx
type StreamingPlaylist = ResourceStatus<
  {
    id: number;
    name: string;
    tracks: string[];
  },
  {
    creator: string;
    artwork: string;
    dateUpdated: Date;
  }
>;

type StreamingAlbum = ResourceStatus<
  {
    id: number;
    title: string;
    artist: string;
    tracks: string[];
  },
  {
    recordLabel: string;
    upc: string;
    yearOfRelease: number;
  }
>;
```

和以前一样，每种类型都保持 `ResourceStatus` 中定义的相同结构，但具有自己的内容和元数据。

你可以在泛型类型中使用任意数量的类型参数。但是就像函数一样，参数越多，类型就可能变得越复杂。

### 必须提供所有类型参数 (All Type Arguments Must Be Provided)

如果我们不向泛型类型传递类型参数会发生什么？让我们用 `ResourceStatus` 类型试试：

```ts twoslash
// @errors: 2314
type ResourceStatus<TContent, TMetadata> =
  | {
      status: "available";
      content: TContent;
      metadata: TMetadata;
    }
  | {
      status: "unavailable";
      reason: string;
    };
// ---cut---
type Example = ResourceStatus;
```

TypeScript 显示一个错误，告诉我们 `ResourceStatus` 需要两个类型参数。这是因为默认情况下，所有泛型类型都*要求*传入其类型参数，就像运行时函数一样。

### 默认类型参数 (Default Type Parameters)

在某些情况下，你可能希望为泛型类型参数提供默认类型。与函数一样，你可以使用 `=` 来分配默认值。

通过将 `TMetadata` 的默认值设置为空对象，我们基本上可以使 `TMetadata` 成为可选的：

```tsx
type ResourceStatus<TContent, TMetadata = {}> =
  | {
      status: "available";
      content: TContent;
      metadata: TMetadata;
    }
  | {
      status: "unavailable";
      reason: string;
    };
```

现在，我们可以创建一个 `StreamingPlaylist` 类型，而无需提供 `TMetadata` 类型参数：

```tsx
type StreamingPlaylist = ResourceStatus<{
  id: number;
  name: string;
  tracks: string[];
}>;
```

如果我们将鼠标悬停在它上面，我们会看到它的类型符合预期，`metadata` 是一个空对象：

```tsx
type StreamingPlaylist =
  | {
      status: "unavailable";
      reason: string;
    }
  | {
      status: "available";
      content: {
        id: number;
        name: string;
        tracks: string[];
      };
      metadata: {};
    };
```

默认值可以帮助使你的泛型类型更灵活且更易于使用。

### 类型参数约束 (Type Parameter Constraints)

要设置类型参数的约束，我们可以使用 `extends` 关键字。

我们可以强制 `TMetadata` 类型参数是一个对象，同时仍然默认为空对象：

```tsx
type ResourceStatus<TContent, TMetadata extends object = {}> = // ...
```

还有一个机会为 `TContent` 类型参数提供约束。

`StreamingPlaylist` 和 `StreamingAlbum` 类型都在其 `content` 对象中具有 `id` 属性。这将是约束的一个很好的候选者。

我们可以创建一个 `HasId` 类型来强制执行 `id` 属性的存在：

```tsx
type HasId = {
  id: number;
};

type ResourceStatus<TContent extends HasId, TMetadata extends object = {}> =
  | {
      status: "available";
      content: TContent;
      metadata: TMetadata;
    }
  | {
      status: "unavailable";
      reason: string;
    };
```

有了这些更改，现在要求 `TContent` 类型参数必须包含 `id` 属性。`TMetadata` 类型参数是可选的，但如果提供，则必须是一个对象。

当我们尝试使用 `ResourceStatus` 创建一个没有 `id` 属性的类型时，TypeScript 将引发一个错误，准确地告诉我们哪里出了问题：

```ts twoslash
// @errors: 2344
type HasId = {
  id: number;
};

type ResourceStatus<TContent extends HasId, TMetadata extends object = {}> =
  | {
      status: "available";
      content: TContent;
      metadata: TMetadata;
    }
  | {
      status: "unavailable";
      reason: string;
    };

// ---cut---
type StreamingPlaylist = ResourceStatus<
  {
    name: string;
    tracks: string[];
  },
  {
    creator: string;
    artwork: string;
    dateUpdated: Date;
  }
>;
```

一旦将 `id` 属性添加到 `TContent` 类型参数，错误就会消失。

#### 约束描述必需的属性 (Constraints Describe Required Properties)

请注意，我们在此处提供的这些约束只是对象必须包含的属性的描述。只要 `TContent` 具有 `id` 属性，我们就可以将 `name` 和 `tracks` 传递给它。

换句话说，这些约束是*开放的*，而不是*封闭的*。你在这里不会收到多余的属性警告。你传入的任何多余属性都将添加到类型中。

#### `extends`, `extends`, `extends`

到目前为止，我们已经在几种不同的上下文中看到了 `extends` 的用法：

- 在泛型类型中，用于设置类型参数的约束
- 在类中，用于扩展另一个类
- 在接口中，用于扩展另一个接口

`extends` 甚至还有另一种用法——条件类型，我们将在本章稍后介绍。

TypeScript 的一个恼人习惯是它倾向于在不同的上下文中重用相同的关键字。因此，理解 `extends` 在不同地方意味着不同的东西非常重要。

## TypeScript 中的模板字面量类型 (Template Literal Types in TypeScript)

与 JavaScript 中的模板字面量允许你将值插入字符串类似，TypeScript 中的模板字面量类型可用于将其他类型插入字符串类型。

例如，让我们创建一个 `PngFile` 类型，它表示以 ".png" 结尾的字符串：

```tsx
type PngFile = `${string}.png`;
```

现在，当我们将一个新变量键入为 `PngFile` 时，它必须以 ".png" 结尾：

```tsx
let myImage: PngFile = "my-image.png"; // OK
```

当字符串与 `PngFile` 类型中定义的模式不匹配时，TypeScript 将引发错误：

```ts twoslash
// @errors: 2322
type PngFile = `${string}.png`;

// ---cut---
let myImage: PngFile = "my-image.jpg";
```

使用模板字面量类型强制执行特定的字符串格式在你的应用程序中可能很有用。

### 将模板字面量类型与联合类型结合使用 (Combining Template Literal Types with Union Types)

当与联合类型结合使用时，模板字面量类型会变得更加强大。通过将联合传递给模板字面量类型，你可以生成一个表示该联合所有可能组合的类型。

例如，假设我们有一组颜色，每种颜色都有从 `100` 到 `900` 的可能色度：

```tsx
type ColorShade = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type Color = "red" | "blue" | "green";
```

如果我们想要所有可能的颜色和色度的组合，我们可以使用模板字面量类型来生成一个新类型：

```tsx
type ColorPalette = `${Color}-${ColorShade}`;
```

现在，`ColorPalette` 将表示所有可能的颜色和色度的组合：

```tsx
let myColor: ColorPalette = "red-500"; // OK
let myColor2: ColorPalette = "blue-900"; // OK
```

这是 27 种可能的组合——三种颜色乘以九种色度。

如果你希望在应用程序中强制执行任何类型的字符串模式，从路由到 URI 再到十六进制代码，模板字面量类型都可以提供帮助。

### 转换字符串类型 (Transforming String Types)

TypeScript 甚至有几个用于转换字符串类型的内置实用程序类型。例如，`Uppercase` 和 `Lowercase` 可用于将字符串转换为大写或小写：

```ts twoslash
type UppercaseHello = Uppercase<"hello">;
//   ^?
type LowercaseHELLO = Lowercase<"HELLO">;
//   ^?
```

`Capitalize` 类型可用于将字符串的第一个字母大写：

```ts twoslash
type CapitalizeMatt = Capitalize<"matt">;
//   ^?
```

`Uncapitalize` 类型可用于将字符串的第一个字母小写：

```ts twoslash
type UncapitalizePHD = Uncapitalize<"PHD">;
//   ^?
```

这些实用程序类型偶尔可用于转换应用程序中的字符串类型，并证明 TypeScript 的类型系统是多么灵活。

## 条件类型 (Conditional Types)

你可以在 TypeScript 中使用条件类型在类型中创建 if/else 逻辑。这在处理非常复杂的代码的库设置中最有用，但我会给你看一个简单的例子，以防你遇到它。

假设我们创建了一个 `ToArray` 泛型类型，它将一个类型转换为数组类型：

```tsx
type ToArray<T> = T[];
```

这没问题，除非我们传入一个已经是数组的类型。如果我们这样做，我们会得到一个数组的数组：

```ts twoslash
type ToArray<T> = T[];
// ---cut---
type Example = ToArray<string>;
//   ^?

type Example2 = ToArray<string[]>;
//   ^?
```

我们实际上希望 `Example2` 也最终成为 `string[]`。因此，我们需要检查 `T` 是否已经是数组，如果是，我们将返回 `T` 而不是 `T[]`。

我们可以使用条件类型来做到这一点。这使用了一个三元运算符，类似于 JavaScript：

```tsx
type ToArray<T> = T extends any[] ? T : T[];
```

第一次看到它可能会觉得很吓人，但让我们分解一下。

```tsx
type ToArray<T> = T extends any[] ? T : T[];
//                ^^^^^^^^^^^^^^^   ^   ^^^
//                condition       true/false
```

### 条件 (The Condition)

条件类型中的“条件”是 `?` 之前的部分。在这种情况下，它是 `T extends any[]`。

```tsx
type ToArray<T> = T extends any[] ? T : T[];
//                ^^^^^^^^^^^^^^^
//                   condition
```

这会检查 `T` 是否可以分配给 `any[]`。要理解这个检查，可以把它想象成一个函数：

```tsx
const toArray = (t: any[]) => {
  // implementation
};
```

可以向此函数传递什么？只有数组：

```ts twoslash
// @errors: 2345
const toArray = (t: any[]) => {
  // implementation
};

// ---cut---
toArray([1, 2, 3]); // OK
toArray("hello");
```

`T extends any[]` 检查 `T` 是否可以传递给期望 `any[]` 的函数。如果我们想检查 `T` 是否为字符串，我们会使用 `T extends string`。

### 'True' 和 'False' ('True' and 'False')

```tsx
type ToArray<T> = T extends any[] ? T : T[];
//                                  ^   ^^^
//                                 true/false
```

如果条件为真，它会解析为“true”部分，就像普通的三元运算符一样。如果为假，它会解析为“false”部分。

在这种情况下，如果 `T` 是一个数组，它会解析为 `T`。如果不是，它会解析为 `T[]`。

这意味着我们上面的示例现在可以按预期工作：

```ts twoslash
type ToArray<T> = T extends any[] ? T : T[];

// ---cut---
type Example = ToArray<string>;
//   ^?

type Example2 = ToArray<string[]>;
//   ^?
```

条件类型将 TypeScript 的类型系统变成了一种完整的编程语言。它们非常强大，但也可能非常复杂。你在应用程序代码中很少需要它们，但它们可以在库代码中发挥奇效。

## 映射类型 (Mapped Types)

TypeScript 中的映射类型允许你通过迭代现有类型的键和值来创建新的对象类型。这可以让你在创建新的对象类型时极具表现力。

考虑这个 `Album` 接口：

```tsx
interface Album {
  name: string;
  artist: string;
  songs: string[];
}
```

假设我们想创建一个新类型，使所有属性都可选且可为空。如果它只是可选的，我们可以使用 `Partial`，但我们希望最终得到一个如下所示的类型：

```tsx
type AlbumWithNullable = {
  name?: string | null;
  artist?: string | null;
  songs?: string[] | null;
};
```

让我们开始，不要重复属性，而是使用映射类型：

```tsx
type AlbumWithNullable = {
  [K in keyof Album]: K;
};
```

这看起来类似于索引签名，但我们使用 `[K in keyof Album]` 而不是 `[k: string]`。这将迭代 `Album` 中的每个键，并在对象中创建具有该键的属性。`K` 是我们选择的名称：你可以选择任何你喜欢的名称。

在这种情况下，我们然后使用 `K` 作为属性的值。这最终不是我们想要的，但这是一个好的开始：

```tsx
// Hovering over AlbumWithNullable shows:
type AlbumWithNullable = {
  name: "name";
  artist: "artist";
  songs: "songs";
};
```

我们可以看到 `K` 代表*当前迭代的键*。这意味着我们可以使用它通过索引访问类型来获取原始 `Album` 属性的类型：

```tsx
type AlbumWithNullable = {
  [K in keyof Album]: Album[K];
};

// Hovering over AlbumWithNullable shows:
type AlbumWithNullable = {
  name: string;
  artist: string;
  songs: string[];
};
```

太棒了——我们现在重新创建了 `Album` 的对象类型。现在我们可以向每个属性添加 `| null`：

```tsx
type AlbumWithNullable = {
  [K in keyof Album]: Album[K] | null;
};

// Hovering over AlbumWithNullable shows:
type AlbumWithNullable = {
  name: string | null;
  artist: string | null;
  songs: string[] | null;
};
```

这差不多了，我们只需要让每个属性都可选。我们可以通过在键后面添加一个 `?` 来做到这一点：

```tsx
type AlbumWithNullable = {
  [K in keyof Album]?: Album[K] | null;
};

// Hovering over AlbumWithNullable shows:
type AlbumWithNullable = {
  name?: string | null;
  artist?: string | null;
  songs?: string[] | null;
};
```

现在，我们有了一个从 `Album` 类型派生出来的新类型，但所有属性都是可选且可为空的。

本着正确设计我们的类型的精神，我们应该通过将其包装在泛型类型 `Nullable<T>` 中来使此行为可重用：

```tsx
type Nullable<T> = {
  [K in keyof T]?: T[K] | null;
};

type AlbumWithNullable = Nullable<Album>;
```

映射类型是转换对象类型的一种非常有用的方法，并且在应用程序代码中有许多不同的用途。

### 使用 `as` 进行键重映射 (Key Remapping with `as`)

在前面的示例中，我们不需要更改正在迭代的对象的键。但是如果我们确实需要呢？

假设我们想创建一个与 `Album` 具有相同属性的新类型，但键名大写。我们可以尝试在 `keyof Album` 上使用 `Uppercase`：

```ts twoslash
// @errors: 2536
interface Album {
  name: string;
  artist: string;
  songs: string[];
}

// ---cut---
type AlbumWithUppercaseKeys = {
  [K in Uppercase<keyof Album>]: Album[K];
};
```

但这不起作用。我们不能使用 `K` 来索引 `Album`，因为 `K` 已经被转换为其大写版本。相反，我们需要找到一种方法来保持 `K` 与以前相同，同时使用 `K` 的大写版本作为键。

我们可以通过使用 `as` 关键字来重映射键来实现这一点：

```tsx
type AlbumWithUppercaseKeys = {
  [K in keyof Album as Uppercase<K>]: Album[K];
};

// Hovering over AlbumWithUppercaseKeys shows:
type AlbumWithUppercaseKeys = {
  NAME: string;
  ARTIST: string;
  SONGS: string[];
};
```

`as` 允许我们在循环中保持原始键可访问的同时重映射键。这与我们将 `as` 用于类型断言时不同——这是关键字的完全不同的用法。

### 将映射类型与联合类型一起使用 (Using Mapped Types with Union Types)

映射类型不一定总是使用 `keyof` 来迭代对象。它们也可以映射对象潜在属性键的联合。

例如，我们可以创建一个 `Example` 类型，它是 'a'、'b' 和 'c' 的联合：

```tsx
type Example = "a" | "b" | "c";
```

然后，我们可以创建一个 `MappedExample` 类型，它映射 `Example` 并返回相同的值：

```tsx
type MappedExample = {
  [E in Example]: E;
};

// hovering over MappedExample shows:
type MappedExample = {
  a: "a";
  b: "b";
  c: "c";
};
```

本章应该让你对在 TypeScript 中设计类型的高级方法有一个很好的理解。通过使用泛型类型、模板字面量类型、条件类型和映射类型，你可以创建富有表现力且可重用的类型，以反映应用程序的业务逻辑。

## 练习 (Exercises)

### 练习 1: 创建 `DataShape` 类型助手 (Exercise 1: Create a `DataShape` Type Helper)

考虑类型 `UserDataShape` 和 `PostDataShape`：

```tsx
type ErrorShape = {
  error: {
    message: string;
  };
};

type UserDataShape =
  | {
      data: {
        id: string;
        name: string;
        email: string;
      };
    }
  | ErrorShape;

type PostDataShape =
  | {
      data: {
        id: string;
        title: string;
        body: string;
      };
    }
  | ErrorShape;
```

看看这些类型，它们都共享一个一致的模式。`UserDataShape` 和 `PostDataShape` 都拥有一个 `data` 对象和一个 `error` 结构，其中 `error` 结构在两者中是相同的。两者之间唯一的区别是 `data` 对象，它为每种类型保存不同的属性。

你的任务是创建一个泛型 `DataShape` 类型以减少 `UserDataShape` 和 `PostDataShape` 类型中的重复。

### 练习 2: 类型化 `PromiseFunc` (Exercise 2: Typing `PromiseFunc`)

此 `PromiseFunc` 类型表示一个返回 promise 的函数：

```tsx
type PromiseFunc = (input: any) => Promise<any>;
```

这里提供了两个使用 `PromiseFunc` 类型的示例测试，它们具有当前存在错误的不同输入：

```ts twoslash
// @errors: 2315
import { Equal, Expect } from "@total-typescript/helpers";
type PromiseFunc = (input: any) => Promise<any>;

// ---cut---
type Example1 = PromiseFunc<string, string>;

type test1 = Expect<Equal<Example1, (input: string) => Promise<string>>>;

type Example2 = PromiseFunc<boolean, number>;

type test2 = Expect<Equal<Example2, (input: boolean) => Promise<number>>>;
```

错误消息告诉我们 `PromiseFunc` 类型不是泛型的。我们还期望 `PromiseFunc` 类型接收两个类型参数：promise 的输入类型和返回类型。

你的任务是更新 `PromiseFunc`，以便两个测试都通过且没有错误。

### 练习 3: 使用 `Result` 类型 (Exercise 3: Working with the `Result` Type)

假设我们有一个 `Result` 类型，它可以是成功也可以是错误：

```tsx
type Result<TResult, TError> =
  | {
      success: true;
      data: TResult;
    }
  | {
      success: false;
      error: TError;
    };
```

我们还有一个 `createRandomNumber` 函数，它返回一个 `Result` 类型：

```ts twoslash
// @errors: 2314
type Result<TResult, TError> =
  | {
      success: true;
      data: TResult;
    }
  | {
      success: false;
      error: TError;
    };
// ---cut---
const createRandomNumber = (): Result<number> => {
  const num = Math.random();

  if (num > 0.5) {
    return {
      success: true,
      data: 123,
    };
  }

  return {
    success: false,
    error: new Error("Something went wrong"),
  };
};
```

因为只有一个 `number` 作为类型参数发送，所以我们有一个错误消息。我们只指定数字是因为每次使用 `Result` 类型时总是指定 `success` 和 `error` 类型可能有点麻烦。

如果我们能将 `Error` 类型指定为 `Result` 的 `TError` 的默认类型，那就更容易了，因为大多数错误都将键入为 `Error`。

你的任务是调整 `Result` 类型，以便 `TError` 默认为 `Error` 类型。

### 练习 4: 约束 `Result` 类型 (Exercise 4: Constraining the `Result` Type)

在更新 `Result` 类型以具有 `TError` 的默认类型后，最好对传入内容的形状添加约束。

以下是一些使用 `Result` 类型的示例：

```ts twoslash
// @errors: 2578
type Result<TResult, TError = Error> =
  | {
      success: true;
      data: TResult;
    }
  | {
      success: false;
      error: TError;
    };

// ---cut---
type BadExample = Result<
  { id: string },
  // @ts-expect-error Should be an object with a message property
  string
>;

type GoodExample = Result<{ id: string }, TypeError>;
type GoodExample2 = Result<{ id: string }, { message: string; code: number }>;
type GoodExample3 = Result<{ id: string }, { message: string }>;
type GoodExample4 = Result<{ id: string }>;
```

`GoodExample` 应该无错误通过，但 `BadExample` 应该引发错误，因为 `TError` 类型不是具有 `message` 属性的对象。目前，情况并非如此，正如 `@ts-expect-error` 指令下的错误所示。

你的任务是向 `Result` 类型添加一个约束，以确保 `BadExample` 测试引发错误，而 `GoodExample` 无错误通过。

### 练习 5: 更严格的 `Omit` 类型 (Exercise 5: A Stricter `Omit` Type)

在本书的前面，我们使用了 `Omit` 类型助手，它允许你创建一个新类型，从现有类型中省略特定属性。

有趣的是，`Omit` 助手还允许你尝试省略类型中不存在的键。

在此示例中，我们尝试从仅具有属性 `a` 的类型中省略属性 `b`：

```tsx
type Example = Omit<{ a: string }, "b">;
```

由于 `b` 不是类型的一部分，你可能会期望 TypeScript 显示错误，但它没有。

相反，我们希望实现一个 `StrictOmit` 类型，它只接受所提供类型中存在的键。否则，应显示错误。

这是 `StrictOmit` 的开头，目前在 `K` 下有一个错误：

```ts twoslash
// @errors: 2344
type StrictOmit<T, K> = Omit<T, K>;
```

目前，`StrictOmit` 类型的行为与常规 `Omit` 相同，如此失败的 `@ts-expect-error` 指令所示：

```ts twoslash
// @errors: 2344 2578
type StrictOmit<T, K> = Omit<T, K>;
// ---cut---
type ShouldFail = StrictOmit<
  { a: string },
  // @ts-expect-error
  "b"
>;
```

你的任务是更新 `StrictOmit`，使其仅接受所提供类型 `T` 中存在的键。如果传递了无效键 `K`，TypeScript 应返回错误。

以下是一些测试，以显示 `StrictOmit` 应如何表现：

```tsx
type tests = [
  Expect<Equal<StrictOmit<{ a: string; b: number }, "b">, { a: string }>>,
  Expect<Equal<StrictOmit<{ a: string; b: number }, "b" | "a">, {}>>,
  Expect<
    Equal<StrictOmit<{ a: string; b: number }, never>, { a: string; b: number }>
  >
];
```

你需要记住 `keyof` 以及如何约束类型参数才能完成此练习。

### 练习 6: 路由匹配 (Exercise 6: Route Matching)

这里我们有一个 `route`，类型为 `AbsoluteRoute`：

```tsx
type AbsoluteRoute = string;

const goToRoute = (route: AbsoluteRoute) => {
  // ...
};
```

我们期望 `AbsoluteRoute` 表示任何以正斜杠开头的字符串。例如，我们期望以下字符串是有效的 `route`：

```tsx
goToRoute("/home");
goToRoute("/about");
goToRoute("/contact");
```

但是，如果我们尝试传递一个不以正斜杠开头的字符串，目前不会出现错误：

```ts twoslash
// @errors: 2578
type AbsoluteRoute = string;

const goToRoute = (route: AbsoluteRoute) => {
  // ...
};
// ---cut---
goToRoute(
  // @ts-expect-error
  "somewhere"
);
```

因为 `AbsoluteRoute` 当前类型为 `string`，TypeScript 未能将其标记为错误。

你的任务是优化 `AbsoluteRoute` 类型，以准确期望字符串以正斜杠开头。

### 练习 7: 三明治排列 (Exercise 7: Sandwich Permutations)

在本练习中，我们想要构建一个 `Sandwich` 类型。

这个 `Sandwich` 期望包含三种面包类型（`"rye"`、`"brown"`、`"white"`）和三种馅料类型（`"cheese"`、`"ham"`、`"salami"`）的所有可能组合：

```tsx
type BreadType = "rye" | "brown" | "white";

type Filling = "cheese" | "ham" | "salami";

type Sandwich = unknown;
```

如测试所示，面包和馅料有几种可能的组合：

```tsx
type tests = [
  Expect<
    Equal<
      Sandwich,
      | "rye sandwich with cheese"
      | "rye sandwich with ham"
      | "rye sandwich with salami"
      | "brown sandwich with cheese"
      | "brown sandwich with ham"
      | "brown sandwich with salami"
      | "white sandwich with cheese"
      | "white sandwich with ham"
      | "white sandwich with salami"
    >
  >
];
```

你的任务是使用模板字面量类型来定义 `Sandwich` 类型。这只需一行代码即可完成！

### 练习 8: 属性获取器 (Exercise 8: Attribute Getters)

这里我们有一个 `Attributes` 接口，其中包含 `firstName`、`lastName` 和 `age`：

```tsx
interface Attributes {
  firstName: string;
  lastName: string;
  age: number;
}
```

接下来，我们有 `AttributeGetters`，目前类型为 `unknown`：

```tsx
type AttributeGetters = unknown;
```

如测试所示，我们期望 `AttributeGetters` 是一个由函数组成的对象。调用时，这些函数中的每一个都应返回与 `Attributes` 接口中的键匹配的值：

```ts twoslash
// @errors: 2344
import { Equal, Expect } from "@total-typescript/helpers";

interface Attributes {
  firstName: string;
  lastName: string;
  age: number;
}

type AttributeGetters = unknown;
// ---cut---
type tests = [
  Expect<
    Equal<
      AttributeGetters,
      {
        firstName: () => string;
        lastName: () => string;
        age: () => number;
      }
    >
  >
];
```

你的任务是定义 `AttributeGetters` 类型，使其与预期输出匹配。为此，你需要迭代 `Attributes` 中的每个键，并生成一个函数作为值，该函数然后返回该键的值。

### 练习 9: 在映射类型中重命名键 (Exercise 9: Renaming Keys in a Mapped Type)

在前面的练习中创建 `AttributeGetters` 类型后，最好重命名键以使其更具描述性。

以下是 `AttributeGetters` 的一个测试用例，目前存在错误：

```tsx
type tests = [
  Expect<
    Equal<
      AttributeGetters,
      {
        getFirstName: () => string;
        getLastName: () => string;
        getAge: () => number;
      }
    >
  >
];
```

你的挑战是调整 `AttributeGetters` 类型以按指定重映射键。你需要使用 `as` 关键字、模板字面量以及 TypeScript 的内置 `Capitalize<string>` 类型助手。

### 解决方案 1: 创建 `DataShape` 类型助手 (Solution 1: Create a `DataShape` Type Helper)

泛型 `DataShape` 类型如下所示：

```tsx
type DataShape<TData> =
  | {
      data: TData;
    }
  | ErrorShape;
```

定义此类型后，可以更新 `UserDataShape` 和 `PostDataShape` 类型以使用它：

```tsx
type UserDataShape = DataShape<{
  id: string;
  name: string;
  email: string;
}>;

type PostDataShape = DataShape<{
  id: string;
  title: string;
  body: string;
}>;
```

### 解决方案 2: 类型化 `PromiseFunc` (Solution 2: Typing `PromiseFunc`)

我们要做的第一件事是通过向 `PromiseFunc` 添加类型参数使其成为泛型。

在这种情况下，由于我们希望它有两个参数，因此我们将它们称为 `TInput` 和 `TOutput` 并用逗号分隔它们：

```tsx
type PromiseFunc<TInput, TOutput> = (input: any) => Promise<any>;
```

接下来，我们需要将 `any` 类型替换为类型参数。

在这种情况下，`input` 将使用 `TInput` 类型，而 `Promise` 将使用 `TOutput` 类型：

```tsx
type PromiseFunc<TInput, TOutput> = (input: TInput) => Promise<TOutput>;
```

完成这些更改后，错误消失了，测试也通过了，因为 `PromiseFunc` 现在是一个泛型类型。任何作为 `TInput` 传递的类型都将用作输入类型，而任何作为 `TOutput` 传递的类型都将用作 Promise 的输出类型。

### 解决方案 3: 使用 `Result` 类型 (Solution 3: Working with the `Result` Type)

与设置默认值的其他情况类似，解决方案是使用等号。

在这种情况下，我们将在 `TError` 类型参数后添加 `=`，然后将 `Error` 指定为默认类型：

```tsx
type Result<TResult, TError = Error> =
  | {
      success: true;
      data: TResult;
    }
  | {
      success: false;
      error: TError;
    };
```

`Result` 类型是确保正确处理错误的好方法。例如，在访问 `data` 属性之前，必须检查此处的 `result` 是否成功：

```tsx
const result = createRandomNumber();

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error.message);
}
```

此模式可以很好地替代 JavaScript 中的 `try...catch` 块。

### 解决方案 4: 约束 `Result` 类型 (Solution 4: Constraining the `Result` Type)

我们希望对 `TError` 设置约束，以确保它是一个具有 `message` 字符串属性的对象，同时保留 `Error` 作为 `TError` 的默认类型。

为此，我们将对 `TError` 使用 `extends` 关键字，并指定具有 `message` 属性的对象作为约束：

```tsx
type Result<TResult, TError extends { message: string } = Error> =
  | {
      success: true;
      data: TResult;
    }
  | {
      success: false;
      error: TError;
    };
```

现在，如果我们从 `BadExample` 中删除 `@ts-expect-error` 指令，我们将在 `string` 下收到一个错误：

```ts twoslash
// @errors: 2344
type Result<TResult, TError extends { message: string } = Error> =
  | {
      success: true;
      data: TResult;
    }
  | {
      success: false;
      error: TError;
    };

// ---cut---
type BadExample = Result<{ id: string }, string>;
```

约束类型参数和添加默认值的行为类似于运行时参数。但是，与运行时参数不同，你可以添加其他属性并且仍然满足约束：

```tsx
type GoodExample2 = Result<{ id: string }, { message: string; code: number }>;
```

运行时参数约束将仅限于包含 `message` 字符串属性而没有任何其他属性，因此上述方式将无法以相同的方式工作。

### 解决方案 5: 更严格的 `Omit` 类型 (Solution 5: A Stricter `Omit` Type)

以下是 `StrictOmit` 类型的起点以及我们需要修复的 `ShouldFail` 示例：

```ts twoslash
// @errors: 2344 2578
type StrictOmit<T, K> = Omit<T, K>;

type ShouldFail = StrictOmit<
  { a: string },
  // @ts-expect-error
  "b"
>;
```

我们的目标是更新 `StrictOmit`，使其仅接受所提供类型 `T` 中存在的键。如果传递了无效键 `K`，TypeScript 应返回错误。

由于 `ShouldFail` 类型的键为 `a`，因此我们将首先更新 `StrictOmit` 的 `K` 以扩展 `a`：

```tsx
type StrictOmit<T, K extends "a"> = Omit<T, K>;
```

从 `ShouldFail` 中删除 `@ts-expect-error` 指令现在将在 `"b"` 下显示错误：

```ts twoslash
// @errors: 2344
type StrictOmit<T, K extends "a"> = Omit<T, K>;
// ---cut---
type ShouldFail = StrictOmit<{ a: string }, "b">;
```

这表明 `ShouldFail` 类型按预期失败。

但是，我们希望通过指定 `K` 将扩展传入的对象 `T` 中的任何键来使其更具动态性。

我们可以通过将约束从 `"a"` 更改为 `keyof T` 来实现此目的：

```tsx
type StrictOmit<T, K extends keyof T> = Omit<T, K>;
```

现在在 `StrictOmit` 类型中，`K` 被绑定为扩展 `T` 的键。这对类型参数 `K` 施加了限制，即它必须属于 `T` 的键。

通过此更改，所有测试都按预期通过，并且传入的任何键都有效：

```tsx
type tests = [
  Expect<Equal<StrictOmit<{ a: string; b: number }, "b">, { a: string }>>,
  Expect<Equal<StrictOmit<{ a: string; b: number }, "b" | "a">, {}>>,
  Expect<
    Equal<StrictOmit<{ a: string; b: number }, never>, { a: string; b: number }>
  >
];
```

### 解决方案 6: 路由匹配 (Solution 6: Route Matching)

为了指定 `AbsoluteRoute` 是一个以正斜杠开头的字符串，我们将使用模板字面量类型。

以下是我们如何创建一个表示以正斜杠开头，后跟 "home"、"about" 或 "contact" 的字符串的类型：

```tsx
type AbsoluteRoute = `/${"home" | "about" | "contact"}`;
```

通过此设置，我们的测试将通过，但我们将仅限于这三个路由。

相反，我们希望允许任何以正斜杠开头的字符串。

为此，我们只需在模板字面量中使用 `string` 类型即可：

```tsx
type AbsoluteRoute = `/${string}`;
```

通过此更改，`somewhere` 字符串将导致错误，因为它不以正斜杠开头：

```tsx
goToRoute(
  // @ts-expect-error
  "somewhere"
);
```

### 解决方案 7: 三明治排列 (Solution 7: Sandwich Permutations)

遵循测试的模式，我们可以看到期望的结果被命名为：

```
bread "sandwich with" filling
```

这意味着我们应该将 `BreadType` 和 `Filling` 联合传递给 `Sandwich` 模板字面量，并在它们之间加上字符串 `"sandwich with"`：

```tsx
type BreadType = "rye" | "brown" | "white";
type Filling = "cheese" | "ham" | "salami";
type Sandwich = `${BreadType} sandwich with ${Filling}`;
```

TypeScript 生成所有可能的组合，从而使 `Sandwich` 类型为：

```tsx
| "rye sandwich with cheese"
| "rye sandwich with ham"
| "rye sandwich with salami"
| "brown sandwich with cheese"
| "brown sandwich with ham"
| "brown sandwich with salami"
| "white sandwich with cheese"
| "white sandwich with ham"
| "white sandwich with salami"
```

### 解决方案 8: 属性获取器 (Solution 8: Attribute Getters)

我们的挑战是根据 `Attributes` 接口推导出 `AttributeGetters` 的形状：

```tsx
interface Attributes {
  firstName: string;
  lastName: string;
  age: number;
}
```

为此，我们将使用映射类型。我们将首先使用 `[K in keyof Attributes]` 来迭代 `Attributes` 中的每个键。然后，我们将为每个键创建一个新属性，该属性将是一个返回 `Attributes` 中相应属性类型的函数：

```tsx
type AttributeGetters = {
  [K in keyof Attributes]: () => Attributes[K];
};
```

`Attributes[K]` 部分是解决此挑战的关键。它允许我们索引到 `Attributes` 对象并返回每个键的实际值。

通过这种方法，我们获得了预期的输出，并且所有测试都按预期通过：

```tsx
type tests = [
  Expect<
    Equal<
      AttributeGetters,
      {
        firstName: () => string;
        lastName: () => string;
        age: () => number;
      }
    >
  >
];
```

### 解决方案 9: 在映射类型中重命名键 (Solution 9: Renaming Keys in a Mapped Type)

我们的目标是创建一个新的映射类型 `AttributeGetters`，它将 `Attributes` 中的每个键更改为一个以 "get" 开头并大写原始键的新键。例如，`firstName` 将变为 `getFirstName`。

在给出解决方案之前，让我们看一个不正确的方法。

#### 不正确的方法 (The Incorrect Approach)

人们可能很容易认为应该在 `keyof Attributes` 到达映射类型之前对其进行转换。

为此，我们将创建一个 `NewAttributeKeys` 类型，并将其设置为一个模板字面量，其中包含添加到 `get` 的 `keyof Attributes`：

```tsx
type NewAttributeKeys = `get${keyof Attributes}`;
```

但是，将鼠标悬停在 `NewAttributeKeys` 上会显示它并不完全正确：

```tsx
// hovering over NewAttributeKeys shows:
type NewAttributeKeys = "getfirstName" | "getlastName" | "getage";
```

添加全局 `Capitalize` 助手会导致键格式正确：

```tsx
type NewAttributeKeys = `get${Capitalize<keyof Attributes>}`;
```

由于我们具有格式化的键，因此我们现在可以在映射类型中使用 `NewAttributeKeys`：

```ts twoslash
// @errors: 2536
interface Attributes {
  firstName: string;
  lastName: string;
  age: number;
}
type NewAttributeKeys = `get${Capitalize<keyof Attributes>}`;

// ---cut---
type AttributeGetters = {
  [K in NewAttributeKeys]: () => Attributes[K];
};
```

但是，我们遇到了一个问题。我们不能使用 `K` 来索引 `Attributes`，因为每个 `K` 都已更改并且不再存在于 `Attributes` 上。

我们需要在映射类型内部保持对原始键的访问。

#### 正确的方法 (The Correct Approach)

为了保持对原始键的访问，我们可以使用 `as` 关键字。

我们可以更新映射类型以使用 `keyof Attributes as`，后跟我们想要进行的转换，而不是使用我们之前尝试的 `NewAttributeKeys` 类型：

```tsx
type AttributeGetters = {
  [K in keyof Attributes as `get${Capitalize<K>}`]: () => Attributes[K];
};
```

我们现在迭代 `Attributes` 中的每个键 `K`，并在一个模板字面量类型中使用它，该类型以 "get" 为前缀并大写原始键。然后，与每个新键配对的值是一个返回 `Attributes` 中原始键类型的函数。

现在，当我们将鼠标悬停在 `AttributeGetters` 类型上时，我们会看到它是正确的，并且测试按预期通过：

```tsx
// hovering over AttributeGetters shows:
type AttributeGetters = {
  getFirstName: () => string;
  getLastName: () => string;
  getAge: () => number;
};
```
