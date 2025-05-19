根据我目前告诉你的内容，你可能认为TypeScript只是"带类型的JavaScript"。JavaScript处理运行时代码，而TypeScript用类型描述它。

但TypeScript实际上有一些在JavaScript中不存在的运行时特性。这些特性被编译成JavaScript，但它们不是JavaScript语言本身的一部分。

在本章中，我们将看几个这些TypeScript独有的特性，包括参数属性、枚举和命名空间。在此过程中，我们将讨论优缺点，以及何时你可能想坚持使用JavaScript。

## 类参数属性

一个在JavaScript中不存在的TypeScript特性是类参数属性。这些允许你直接从构造函数参数声明和初始化类成员。

考虑这个`Rating`类：

```typescript
class Rating {
  constructor(public value: number, private max: number) {}
}
```

构造函数在`value`参数前包含`public`，在`max`参数前包含`private`。在JavaScript中，这会编译成将参数分配给类上属性的代码：

```typescript
class Rating {
  constructor(value, max) {
    this.value = value;
    this.max = max;
  }
}
```

与手动处理赋值相比，这节省了大量代码并保持类定义简洁。

但与其他TypeScript特性不同，输出的JavaScript不是TypeScript代码的直接表示。如果你不熟悉这个特性，这可能使理解发生的事情变得困难。

## 枚举

你可以使用`enum`关键字定义一组命名常量。这些可以用作类型或值。

枚举在TypeScript的第一个版本中就被添加了，但它们还没有被添加到JavaScript中。这意味着它是一个TypeScript独有的运行时特性。而且，正如我们将看到的，它带有一些奇怪的行为。

枚举的一个好用例是当有一组有限的相关值，预计不会改变时。

### 数字枚举

数字枚举将一组相关成员组合在一起，并自动从0开始为它们分配数字值。例如，考虑这个`AlbumStatus`枚举：

```typescript
enum AlbumStatus {
  NewRelease,
  OnSale,
  StaffPick,
}
```

在这种情况下，`AlbumStatus.NewRelease`将是0，`AlbumStatus.OnSale`将是1，依此类推。

要将`AlbumStatus`用作类型，我们可以使用它的名称：

```typescript
function logStatus(genre: AlbumStatus) {
  console.log(genre); // 0
}
```

现在，`logStatus`只能接收来自`AlbumStatus`枚举对象的值。

```typescript
logStatus(AlbumStatus.NewRelease);
```

#### 带有显式值的数字枚举

你也可以为枚举的每个成员分配特定值。例如，如果你想为`NewRelease`分配值1，为`OnSale`分配2，为`StaffPick`分配3，你可以这样做：

```typescript
enum AlbumStatus {
  NewRelease = 1,
  OnSale = 2,
  StaffPick = 3,
}
```

现在，`AlbumStatus.NewRelease`将是1，`AlbumStatus.OnSale`将是2，依此类推。

#### 自动递增的数字枚举

如果你选择只为枚举分配_一些_数字值，TypeScript将自动从最后分配的值递增其余的值。例如，如果你只为`NewRelease`分配一个值，`OnSale`和`StaffPick`将分别是2和3。

```typescript
enum AlbumStatus {
  NewRelease = 1,
  OnSale,
  StaffPick,
}
```

### 字符串枚举

字符串枚举允许你为枚举的每个成员分配字符串值。例如：

```typescript
enum AlbumStatus {
  NewRelease = "NEW_RELEASE",
  OnSale = "ON_SALE",
  StaffPick = "STAFF_PICK",
}
```

上面的相同`logStatus`函数现在会记录字符串值而不是数字。

```typescript
function logStatus(genre: AlbumStatus) {
  console.log(genre); // "NEW_RELEASE"
}

logStatus(AlbumStatus.NewRelease);
```

### 枚举很奇怪

在JavaScript中没有与`enum`关键字等效的语法。所以，TypeScript可以制定枚举如何工作的规则。这意味着它们有一些略微奇怪的行为。

#### 数字枚举如何转译

枚举转换成JavaScript代码的方式可能感觉有点意外。

例如，枚举`AlbumStatus`：

```typescript
enum AlbumStatus {
  NewRelease,
  OnSale,
  StaffPick,
}
```

将被转译成以下JavaScript：

```javascript
var AlbumStatus;
(function (AlbumStatus) {
  AlbumStatus[(AlbumStatus["NewRelease"] = 0)] = "NewRelease";
  AlbumStatus[(AlbumStatus["OnSale"] = 1)] = "OnSale";
  AlbumStatus[(AlbumStatus["StaffPick"] = 2)] = "StaffPick";
})(AlbumStatus || (AlbumStatus = {}));
```

这段相当不透明的JavaScript一次性做了几件事。它创建了一个对象，为每个枚举值设置属性，它还创建了值到键的反向映射。

结果将类似于以下内容：

```javascript
var AlbumStatus = {
  0: "NewRelease",
  1: "OnSale",
  2: "StaffPick",
  NewRelease: 0,
  OnSale: 1,
  StaffPick: 2,
};
```

这种反向映射意味着枚举上可用的键比你预期的要多。所以，对枚举执行`Object.keys`调用将返回键和值。

```typescript
console.log(Object.keys(AlbumStatus)); // ["0", "1", "2", "NewRelease", "OnSale", "StaffPick"]
```

如果你不期望这种情况，这可能是一个真正的陷阱。

#### 字符串枚举如何转译

字符串枚举的行为与数字枚举不同。当你指定字符串值时，转译的JavaScript要简单得多：

```typescript
enum AlbumStatus {
  NewRelease = "NEW_RELEASE",
  OnSale = "ON_SALE",
  StaffPick = "STAFF_PICK",
}
```

```javascript
var AlbumStatus;
(function (AlbumStatus) {
  AlbumStatus["NewRelease"] = "NEW_RELEASE";
  AlbumStatus["OnSale"] = "ON_SALE";
  AlbumStatus["StaffPick"] = "STAFF_PICK";
})(AlbumStatus || (AlbumStatus = {}));
```

现在，没有反向映射，对象只包含枚举值。`Object.keys`调用将只返回键，正如你可能预期的那样。

```typescript
console.log(Object.keys(AlbumStatus)); // ["NewRelease", "OnSale", "StaffPick"]
```

数字枚举和字符串枚举之间的这种差异感觉不一致，可能是混淆的来源。

#### 数字枚举的行为像联合类型

枚举的另一个奇怪特性是字符串枚举和数字枚举在用作类型时行为不同。

让我们用数字枚举重新定义我们的`logStatus`函数：

```typescript
enum AlbumStatus {
  NewRelease = 0,
  OnSale = 1,
  StaffPick = 2,
}

function logStatus(genre: AlbumStatus) {
  console.log(genre);
}
```

现在，我们可以用枚举的成员调用`logStatus`：

```typescript
logStatus(AlbumStatus.NewRelease);
```

但我们也可以用普通数字调用它：

```typescript
logStatus(0);
```

如果我们用不是枚举成员的数字调用它，TypeScript将报告错误：

```ts twoslash
// @errors: 2345
enum AlbumStatus {
  NewRelease = 0,
  OnSale = 1,
  StaffPick = 2,
}

function logStatus(genre: AlbumStatus) {
  console.log(genre);
}

// ---cut---
logStatus(3);
```

这与字符串枚举不同，后者只允许枚举成员用作类型：

```ts twoslash
// @errors: 2345
enum AlbumStatus {
  NewRelease = "NEW_RELEASE",
  OnSale = "ON_SALE",
  StaffPick = "STAFF_PICK",
}

function logStatus(genre: AlbumStatus) {
  console.log(genre);
}

logStatus(AlbumStatus.NewRelease);
logStatus("NEW_RELEASE");
```

字符串枚举的行为感觉更自然 - 它与C#和Java等其他语言中枚举的工作方式相匹配。

但它们与数字枚举不一致的事实可能是混淆的来源。

事实上，字符串枚举在TypeScript中是独特的，因为它们是_名义上_比较的。TypeScript中的所有其他类型都是_结构上_比较的，这意味着如果两个类型具有相同的结构，它们被认为是相同的。但字符串枚举是基于它们的名称（名义上）比较的，而不是它们的结构。

这意味着如果两个字符串枚举具有相同的成员，但名称不同，它们被认为是不同的类型：

```ts twoslash
// @errors: 2345
enum AlbumStatus {
  NewRelease = "NEW_RELEASE",
  OnSale = "ON_SALE",
  StaffPick = "STAFF_PICK",
}
function logStatus(genre: AlbumStatus) {
  console.log(genre);
}

// ---cut---
enum AlbumStatus2 {
  NewRelease = "NEW_RELEASE",
  OnSale = "ON_SALE",
  StaffPick = "STAFF_PICK",
}

logStatus(AlbumStatus2.NewRelease);
```

对于习惯于结构类型的我们来说，这可能有点令人惊讶。但对于习惯于其他语言中枚举的开发人员来说，字符串枚举将感觉最自然。

#### `const`枚举

`const`枚举的声明与其他枚举类似，但首先有`const`关键字：

```typescript
const enum AlbumStatus {
  NewRelease = "NEW_RELEASE",
  OnSale = "ON_SALE",
  StaffPick = "STAFF_PICK",
}
```

你可以使用`const`枚举声明数字或字符串枚举 - 它们与常规枚举具有相同的行为。

主要区别是`const`枚举在TypeScript转译为JavaScript时会消失。不是创建一个带有枚举值的对象，转译的JavaScript将直接使用枚举的值。

例如，如果创建一个访问枚举值的数组，转译的JavaScript将最终包含这些值：

```typescript
let albumStatuses = [
  AlbumStatus.NewRelease,
  AlbumStatus.OnSale,
  AlbumStatus.StaffPick,
];

// 上面转译为：
let albumStatuses = ["NEW_RELEASE", "ON_SALE", "STAFF_PICK"];
```

`const`枚举确实有一些限制，特别是在声明文件中声明时（我们稍后会介绍）。TypeScript团队实际上建议在你的库代码中避免使用`const`枚举，因为它们对你的库的消费者可能表现得不可预测。

### 你应该使用枚举吗？

枚举是一个有用的特性，但它们有一些怪癖，可能使它们难以使用。

有一些枚举的替代方案你可能想考虑，比如普通的联合类型。但我更喜欢的替代方案使用了我们还没有介绍的一些语法。

我们将在第10章的`as const`部分讨论你是否应该一般使用枚举。

## 命名空间

命名空间是TypeScript的早期特性，试图解决当时JavaScript的一个大问题 - 缺乏模块系统。它们是在ES6模块标准化之前引入的，它们是TypeScript组织代码的尝试。

命名空间让你指定可以导出函数和类型的闭包。这允许你使用不会与全局作用域中声明的其他东西冲突的名称。

考虑一个场景，我们正在构建一个TypeScript应用程序来管理音乐收藏。可能有函数来添加专辑、计算销售额和生成报告。使用命名空间，我们可以逻辑地分组这些函数：

```typescript
namespace RecordStoreUtils {
  export namespace Album {
    export interface Album {
      title: string;
      artist: string;
      year: number;
    }
  }

  export function addAlbum(title: string, artist: string, year: number) {
    // 添加专辑到收藏的实现
  }

  export namespace Sales {
    export function recordSale(
      albumTitle: string,
      quantity: number,
      price: number,
    ) {
      // 记录专辑销售的实现
    }

    export function calculateTotalSales(albumTitle: string): number {
      // 计算专辑总销售额的实现
      return 0; // 占位符返回
    }
  }
}
```

在这个例子中，`AlbumCollection`是主命名空间，`Sales`是嵌套命名空间。这种结构有助于按功能组织代码，并明确应用程序的每个函数属于哪一部分。

`AlbumCollection`内的东西可以用作值或类型：

```typescript
const odelay: AlbumCollection.Album.Album = {
  title: "Odelay!",
  artist: "Beck",
  year: 1996,
};

AlbumCollection.Sales.recordSale("Odelay!", 1, 10.99);
```

### 命名空间如何编译

命名空间编译成相对简单的JavaScript。例如，`RecordStoreUtils`命名空间的一个更简单版本...

```typescript
namespace RecordStoreUtils {
  export function addAlbum(title: string, artist: string, year: number) {
    // 添加专辑到收藏的实现
  }
}
```

...将被转译成以下JavaScript：

```javascript
var RecordStoreUtils;
(function (RecordStoreUtils) {
  function addAlbum(title, artist, year) {
    // 添加专辑到收藏的实现
  }
  RecordStoreUtils.addAlbum = addAlbum;
})(RecordStoreUtils || (RecordStoreUtils = {}));
```

与枚举类似，这段代码创建了一个对象，为命名空间中的每个函数和类型设置属性。这意味着命名空间可以作为对象访问，其属性可以作为方法或属性访问。

### 合并命名空间

就像接口一样，命名空间可以通过声明合并合并。这允许你将两个或更多个单独的声明组合成一个单一的定义。

这里我们有两个`RecordStoreUtils`的声明 - 一个带有`Album`命名空间，另一个带有`Sales`命名空间：

```typescript
namespace RecordStoreUtils {
  export namespace Album {
    export interface Album {
      title: string;
      artist: string;
      year: number;
    }
  }
}

namespace RecordStoreUtils {
  export namespace Sales {
    export function recordSale(
      albumTitle: string,
      quantity: number,
      price: number,
    ) {
      // 记录专辑销售的实现
    }

    export function calculateTotalSales(albumTitle: string): number {
      // 计算专辑总销售额的实现
      return 0; // 占位符返回
    }
  }
}
```

因为命名空间支持声明合并，两个声明自动组合成一个单一的`RecordStoreUtils`命名空间。`Album`和`Sales`命名空间都可以像以前一样访问：

```typescript
const loaded: RecordStoreUtils.Album.Album = {
  title: "Loaded",
  artist: "The Velvet Underground",
  year: 1970,
};

RecordStoreUtils.Sales.calculateTotalSales("Loaded");
```

#### 合并命名空间内的接口

命名空间内的接口也可以合并。如果我们有两个不同的`RecordStoreUtils`，每个都有自己的`Album`接口，TypeScript会自动将它们合并成一个包含所有属性的单一`Album`接口：

```typescript
namespace RecordStoreUtils {
  export interface Album {
    title: string;
    artist: string;
    year: number;
  }
}

namespace RecordStoreUtils {
  export interface Album {
    genre: string[];
    recordLabel: string;
  }
}

const madvillainy: RecordStoreUtils.Album = {
  title: "Madvillainy",
  artist: "Madvillain",
  year: 2004,
  genre: ["Hip Hop", "Experimental"],
  recordLabel: "Stones Throw",
};
```

当我们稍后查看命名空间的关键用例：全局作用域类型时，这些信息将变得至关重要。

### 你应该使用命名空间吗？

想象一下，如果ES模块，带有`import`和`export`，从未存在。在这个世界中，你声明的所有东西都在全局作用域中。你必须小心命名事物，并且必须想出一种组织代码的方法。

这就是TypeScript诞生的世界。像CommonJS（`require`）和ES模块（`import`，`export`）这样的模块系统还不流行。所以，命名空间是避免命名冲突和组织代码的关键方式。

但现在ES模块被广泛支持，你应该使用它们而不是命名空间。命名空间在现代TypeScript代码中几乎没有相关性，除了一些例外，我们将在全局作用域章节中探讨。

## 何时偏好ES vs. TS
