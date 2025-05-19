当你构建TypeScript应用程序时，你会注意到一件事。你设计类型的方式将显著改变你的应用程序的可维护性。

你的类型不仅仅是在编译时捕获错误的方式。它们有助于反映和传达它们所代表的业务逻辑。

我们已经看到了像`interface extends`这样的语法和像`Pick`和`Omit`这样的类型助手。我们理解从其他类型派生类型的好处和权衡。在本章中，我们将深入探讨在TypeScript中设计你的类型。

我们将添加更多组合和转换类型的技术。我们将使用泛型类型，它可以将你的类型转变为"类型函数"。我们还将介绍模板字面量类型，用于定义和强制特定的字符串格式，以及映射类型，用于从另一个类型派生一个类型的形状。

## 泛型类型

泛型类型让你将类型转变为可以接收参数的"类型函数"。我们之前已经见过泛型类型，如`Pick`和`Omit`。这些类型接收一个类型和一个键，并基于该键返回一个新类型：

```tsx
type Example = Pick<{ a: string; b: number }, "a">;
```

现在，我们将创建我们自己的泛型类型。这些在减少代码重复方面最有用。

考虑这些`StreamingPlaylist`和`StreamingAlbum`类型，它们共享类似的结构：

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

这两种类型都表示一个流媒体资源，它要么是可用的，带有特定内容，要么是不可用的，带有不可用的原因。

主要区别在于`content`对象的结构：`StreamingPlaylist`类型有一个`name`属性，而`StreamingAlbum`类型有`title`和`artist`属性。尽管有这种差异，但类型的整体结构是相同的。

为了减少重复，我们可以创建一个名为`ResourceStatus`的泛型类型，它可以表示`StreamingPlaylist`和`StreamingAlbum`。

要创建泛型类型，我们使用_类型参数_，声明类型必须接收什么类型的参数。

要指定参数，我们使用尖括号语法，这在使用我们在本书前面看到的各种类型助手时会很熟悉：

```tsx
type ResourceStatus<TContent> = unknown;
```

我们的`ResourceStatus`类型将接收一个`TContent`类型参数，它将表示特定于每个资源的`content`对象的形状。现在，我们将解析类型设置为`unknown`。

类型参数通常以单个字母名称命名，如`T`、`K`或`V`，但你可以随意命名它们。

现在我们已经将`ResourceStatus`声明为泛型类型，我们可以传递一个_类型参数_。

让我们创建一个`Example`类型，并为`TContent`提供一个对象类型作为类型参数：

```tsx
type Example = ResourceStatus<{
  id: string;
  name: string;
  tracks: string[];
}>;
```

就像`Pick`和`Omit`一样，类型参数作为参数传递给泛型类型。

但`Example`会是什么类型？

```tsx
// 悬停在Example上显示
type Example = unknown;
```

我们将`ResourceStatus`的结果设置为`unknown`。为什么会这样？我们可以通过悬停在`ResourceStatus`类型中的`TContent`参数上得到线索：

```tsx
type ResourceStatus<TContent> = unknown;

// 悬停在TContent上显示：
// 类型'TContent'已声明但其值从未被读取。
```

我们没有_使用_`TContent`参数。我们只是返回`unknown`，无论传入什么。所以，`Example`类型也是`unknown`。

所以，让我们使用它。让我们更新`ResourceStatus`类型以匹配`StreamingPlaylist`和`StreamingAlbum`类型的结构，用我们想要动态的部分替换为`TContent`类型参数：

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

我们现在可以重新定义`StreamingPlaylist`和`StreamingAlbum`来使用它：

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

现在如果我们悬停在`StreamingPlaylist`上，我们将看到它具有与原来相同的结构，但现在它是用`ResourceStatus`类型定义的，而不必手动提供额外的属性：

```tsx
// 悬停在StreamingPlaylist上显示：

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

`ResourceStatus`现在是一个泛型类型。它是一种类型函数，这意味着它在运行时函数有用的所有方面都很有用。我们可以使用泛型类型来捕获类型中重复的模式，并使我们的类型更灵活和可重用。

### 多个类型参数

泛型类型可以接受多个类型参数，允许更大的灵活性。

我们可以扩展`ResourceStatus`类型，包括第二个类型参数，表示伴随资源的元数据：

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

现在我们可以定义`StreamingPlaylist`和`StreamingAlbum`类型，我们可以包括特定于每个资源的元数据：

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

像以前一样，每种类型都保持`ResourceStatus`中定义的相同结构，但有自己的内容和元数据。

你可以在泛型类型中使用任意多的类型参数。但就像函数一样，参数越多，你的类型可能变得越复杂。

### 必须提供所有类型参数

如果我们不向泛型类型传递类型参数会发生什么？让我们用`ResourceStatus`类型试试：

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

TypeScript显示一个错误，告诉我们`ResourceStatus`需要两个类型参数。这是因为默认情况下，所有泛型类型_需要_传入它们的类型参数，就像运行时函数一样。

### 默认类型参数

在某些情况下，你可能想为泛型类型参数提供默认类型。像函数一样，你可以使用`=`来分配默认值。

通过将`TMetadata`的默认值设置为空对象，我们可以基本上使`TMetadata`成为可选的：

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

现在，我们可以创建一个`StreamingPlaylist`类型，而不提供`TMetadata`类型参数：

```tsx
type StreamingPlaylist = ResourceStatus<{
  id: number;
  name: string;
  tracks: string[];
}>;
```

如果我们悬停在它上面，我们会看到它按预期类型化，`metadata`是一个空对象：

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

默认值可以帮助使你的泛型类型更灵活和更容易使用。

### 类型参数约束

要对类型参数设置约束，我们可以使用`extends`关键字。

我们可以强制`TMetadata`类型参数成为一个对象，同时仍然默认为空对象：

```tsx
type ResourceStatus<TContent, TMetadata extends object = {}> = // ...
```

还有机会为`TContent`类型参数提供约束。

`StreamingPlaylist`和`StreamingAlbum`类型在它们的`content`对象中都有一个`id`属性。这将是约束的好候选。

我们可以创建一个`HasId`类型，强制存在`id`属性：

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

有了这些变化，现在要求`TContent`类型参数必须包含一个`id`属性。`TMetadata`类型参数是可选的，但如果提供，它必须是一个对象。

当我们尝试创建一个没有`id`属性的`ResourceStatus`类型时，TypeScript将引发一个错误，告诉我们确切的问题所在：

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

一旦将`id`属性添加到`TContent`类型参数中，错误将消失。

#### 约束描述必需的属性

注意，我们在这里提供的这些约束只是对象必须包含的属性的描述。只要它有一个`id`属性，我们就可以将`name`和`tracks`传递给`TContent`。

换句话说，这些约束是_开放的_，而不是_封闭的_。你不会在这里得到多余属性警告。你传入的任何多余属性都将添加到类型中。

#### `extends`，`extends`，`extends`

到目前为止，我们已经在几个不同的上下文中看到了`extends`的使用：

- 在泛型类型中，设置类型参数的约束
- 在类中，扩展另一个类
- 在接口中，扩展另一个接口

`extends`还有另一个用途 - 条件类型，我们将在本章后面看到。

TypeScript的一个令人讨厌的习惯是它倾向于在不同的上下文中重用相同的关键字。所以理解`extends`在不同的地方意味着不同的事情很重要。

## TypeScript中的模板字面量类型

类似于JavaScript中的模板字面量允许你将值插入到字符串中，TypeScript中的模板字面量类型可以用来将其他类型插入到字符串类型中。

例如，让我们创建一个表示以".png"结尾的字符串的`PngFile`类型：

```tsx
type PngFile = `${string}.png`;
```

现在当我们将一个新变量类型化为`PngFile`时，它必须以".png"结尾：

```tsx
let myImage: PngFile = "my-image.png"; // 正确
```

当字符串不匹配`PngFile`类型中定义的模式时，TypeScript将引发错误：

```ts twoslash
// @errors: 2322
type PngFile = `${string}.png`;

// ---cut---
let myImage: PngFile = "my-image.jpg";
```

使用模板字面量类型强制特定的字符串格式在你的应用程序中可能很有用。

### 将模板字面量类型与联合类型结合

当与联合类型结合时，模板字面量类型变得更加强大。通过将联合传递给模板字面量类型，你可以生成一个表示联合所有可能组合的类型。

例如，让我们想象我们有一组颜色，每种颜色都有从`100`到`900`的可能色调：

```tsx
type ColorShade = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type Color = "red" | "blue" | "green";
```

如果我们想要所有可能的颜色和色调的组合，我们可以使用模板字面量类型生成一个新类型：

```tsx
type ColorPalette = `${Color}-${ColorShade}`;
```

现在，`ColorPalette`将表示所有可能的颜色和色调组合：

```tsx
let myColor: ColorPalette = "red-500"; // 正确
let myColor2: ColorPalette = "blue-900"; // 正确
```

这是27种可能的组合 - 三种颜色乘以九种色调。

如果你有任何想在应用程序中强制执行的字符串模式，从路由到URI到十六进制代码，模板字面量类型都可以帮助你。

### 转换字符串类型

TypeScript甚至有几个内置的实用类型用于转换字符串类型。例如，`Uppercase`和`Lowercase`可以用来将字符串转换为大写或小写：

```ts twoslash
type UppercaseHello = Uppercase<"hello">;
//   ^?
type LowercaseHELLO = Lowercase<"HELLO">;
//   ^?
```

`Capitalize`类型可以用来将字符串的第一个字母大写：

```ts twoslash
type CapitalizeMatt = Capitalize<"matt">;
//   ^?
```

`Uncapitalize`类型可以用来将字符串的第一个字母小写：

```ts twoslash
type UncapitalizePHD = Uncapitalize<"PHD">;
//   ^?
```

这些实用类型偶尔对转换应用程序中的字符串类型很有用，并证明了TypeScript的类型系统可以多么灵活。

## 条件类型

你可以在TypeScript中使用条件类型来在类型中创建if/else逻辑。这在处理非常复杂的代码的库设置中主要有用，但我会给你一个简单的例子，以防你遇到它。

让我们想象我们创建一个将类型转换为数组类型的`ToArray`泛型类型：

```tsx
type ToArray<T> = T[];
```

这很好，除非我们传入一个已经是数组的类型。如果我们这样做，我们将得到一个数组的数组：

```ts twoslash
type ToArray<T> = T[];
// ---cut---
type Example = ToArray<string>;
//   ^?

type Example2 = ToArray<string[]>;
//   ^?
```

我们实际上希望`Example2`也最终成为`string[]`。所以，我们需要检查`T`是否已经是一个数组，如果是，我们将返回`T`而不是`T[]`。

我们可以使用条件类型来做到这一点。这使用三元运算符，类似于JavaScript：

```tsx
type ToArray<T> = T extends any[] ? T : T[];
```

当你第一次看到这个时，它可能看起来很可怕，但让我们分解它。

```tsx
type ToArray<T> = T extends any[] ? T : T[];
//                ^^^^^^^^^^^^^^^   ^   ^^^
//                条件             真/假
```

### 条件

条件类型中的"条件"是`?`之前的部分。在这种情况下，它是`T extends any[]`。

```tsx
type ToArray<T> = T extends any[] ? T : T[];
//                ^^^^^^^^^^^^^^^
//                   条件
```

这检查`T`是否可以分配给`any[]`。要理解这个检查，想象它像一个函数：
