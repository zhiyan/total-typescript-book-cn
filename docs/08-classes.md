Class 是 JavaScript 的一项功能，可帮助你将数据和行为封装到单个单元中。它们是面向对象编程的基础部分，用于创建具有属性和方法的对象。

你可以使用 `class` 关键字定义一个 class，然后使用 `new` 关键字创建该 class 的实例。TypeScript 为 class 添加了一个静态类型检查层，这可以帮助你捕获错误并在代码中强制执行结构。

让我们从头开始构建一个 class，看看它是如何工作的。

## 创建一个 Class

要创建一个 class，请使用 `class` 关键字，后跟 class 的名称。与 type 和 interface 类似，约定是将名称写成 PascalCase，这意味着名称中每个单词的首字母都大写。

我们将以类似于创建 type 或 interface 的方式开始创建 `Album` class：

```ts twoslash
// @errors: 2564
class Album {
  title: string;
  artist: string;
  releaseYear: number;
}
```

此时，即使它看起来像一个 type 或 interface，TypeScript 也会为 class 中的每个属性给出一个错误。
我们该如何解决这个问题？

### 添加一个 Constructor

为了修复这些错误，我们需要向 class 添加一个 `constructor`。`constructor` 是一个特殊的方法，在创建 class 的新实例时运行。你可以在这里设置对象的初始状态。

首先，我们将添加一个 constructor，为 `Album` class 的属性分配值：

```typescript
class Album {
  title: string;
  artist: string;
  releaseYear: number;

  constructor() {
    this.title = "Loop Finding Jazz Records";
    this.artist = "Jan Jelinek";
    this.releaseYear = 2001;
  }
}
```

现在，当我们创建 `Album` class 的一个新实例时，我们可以访问我们在 constructor 中设置的属性和值：

```typescript
const loopFindingJazzRecords = new Album();

console.log(loopFindingJazzRecords.title); // 输出: Loop Finding Jazz Records
```

`new` 关键字创建 `Album` class 的一个新实例，constructor 设置我们 class 属性的初始值。在这种情况下，由于属性是硬编码的，因此 `Album` class 的每个实例都将具有相同的值。

#### 你并非总是需要键入 Class 属性

正如我们将看到的，TypeScript 可以对 class 进行一些非常智能的推断。它能够从我们在 constructor 中分配它们的位置推断出属性的类型，所以我们实际上可以去掉一些类型注解：

```typescript
class Album {
  title;
  artist;
  releaseYear;

  constructor() {
    this.title = "Loop Finding Jazz Records";
    this.artist = "Jan Jelinek";
    this.releaseYear = 2001;
  }
}
```

然而，通常也会在 class 主体中指定类型，因为它们充当了 class 的一种文档形式，易于快速阅读。

### 向 Constructor 添加参数

我们可以使用 constructor 为 class 声明参数。这允许我们在创建 class 的新实例时传入值。

更新 constructor 以接受一个 `opts` 参数，该参数包含 `Album` class 的属性：

```typescript
// 在 Album class 内部
constructor(opts: { title: string; artist: string; releaseYear: number }) {
 // ...
}
```

然后在 constructor 的主体内部，我们将 `this.title`、`this.artist` 和 `this.releaseYear` 赋值给 `opts` 参数的值。

```typescript
// 在 Album class 内部
constructor(opts: { title: string; artist: string; releaseYear: number }) {
  this.title = opts.title;
  this.artist = opts.artist;
  this.releaseYear = opts.releaseYear;
}
```

`this` 关键字指的是 class 的实例，用于访问 class 的属性和方法。

现在，当我们创建 `Album` class 的新实例时，我们可以传递一个包含我们要设置的属性的对象。

```typescript
const loopFindingJazzRecords = new Album({
  title: "Loop Finding Jazz Records",
  artist: "Jan Jelinek",
  releaseYear: 2001,
});

console.log(loopFindingJazzRecords.title); // 输出: Loop Finding Jazz Records
```

### 使用 Class 作为类型

TypeScript 中 class 的一个有趣特性是它们可以用作变量和函数参数的类型。语法类似于你使用任何其他 type 或 interface 的方式。

在这种情况下，我们将使用 `Album` class 来键入 `printAlbumInfo` 函数的 `album` 参数：

```typescript
function printAlbumInfo(album: Album) {
  console.log(
    `${album.title} by ${album.artist}, released in ${album.releaseYear}.`
  );
}
```

然后我们可以调用该函数并传入 `Album` class 的一个实例：

```typescript
printAlbumInfo(sixtyNineLoveSongsAlbum);

// 输出: 69 Love Songs by The Magnetic Fields, released in 1999.
```

虽然可以将 class 用作类型，但更常见的模式是要求 class 实现特定的 interface。

## Class 中的属性

现在我们已经了解了如何创建 class 并创建它的新实例，让我们更仔细地看看属性是如何工作的。

### Class 属性初始化器

你可以直接在 class 主体中为属性设置默认值。这些称为 class 属性初始化器。

```typescript
class Album {
  title = "Unknown Album";
  artist = "Unknown Artist";
  releaseYear = 0;
}
```

你可以将它们与类型注解结合起来：

```typescript
class Album {
  title: string = "Unknown Album";
  artist: string = "Unknown Artist";
  releaseYear: number = 0;
}
```

重要的是，class 属性初始化器在 constructor 被调用*之前*解析。这意味着你可以通过在 constructor 中分配不同的值来覆盖默认值：

```typescript
class User {
  name = "Unknown User";

  constructor() {
    this.name = "Matt Pocock";
  }
}

const user = new User();

console.log(user.name); // 输出: Matt Pocock
```

### `readonly` Class 属性

正如我们对 type 和 interface 所看到的那样，`readonly` 关键字可用于使属性不可变。这意味着一旦设置了属性，就无法更改它：

```typescript
class Album {
  readonly title: string;
  readonly artist: string;
  readonly releaseYear: number;
}
```

### 可选的 Class 属性

我们也可以像对象一样，使用 `?:` 注解将属性标记为可选：

```typescript
class Album {
  title?: string;
  artist?: string;
  releaseYear?: number;
}
```

从上面没有错误可以看出，这也意味着它们不需要在 constructor 中设置。

### `public` 和 `private` 属性

`public` 和 `private` 关键字用于控制 class 属性的可见性和可访问性。

默认情况下，属性是 `public` 的，这意味着可以从 class 外部访问它们。

如果我们想限制对某些属性的访问，可以将它们标记为 `private`。这意味着它们只能从 class 内部访问。

例如，假设我们想向 album class 添加一个 `rating` 属性，该属性仅在 class 内部使用：

```typescript
class Album {
  private rating = 0;
}
```

现在，如果我们尝试从 class 外部访问 `rating` 属性，TypeScript 会给我们一个错误：

```ts twoslash
// @errors: 2341
class Album {
  private rating = 0;
}

const loopFindingJazzRecords = new Album();
// ---cut---
console.log(loopFindingJazzRecords.rating);
```

然而，这实际上并不能阻止它在运行时被访问——`private` 只是一个编译时注解。你可以使用 `@ts-ignore`（我们稍后会看到）来抑制错误，并且仍然可以访问该属性：

```typescript
// @ts-ignore
console.log(loopFindingJazzRecords.rating); // 输出: 0
```

#### 运行时 Private 属性

要在运行时获得相同的行为，你还可以使用 `#` 前缀将属性标记为 private：

```typescript
class Album {
  #rating = 0;
}
```

`#` 语法的行为与 `private` 相同，但它是一个较新的特性，是 ECMAScript 标准的一部分。这意味着它既可以在 JavaScript 中使用，也可以在 TypeScript 中使用。

尝试从 class 外部访问以 `#` 为前缀的属性将导致语法错误：

```ts twoslash
// @errors: 18013
class Album {
  #rating = 0;
}

const loopFindingJazzRecords = new Album();
// ---cut---
console.log(loopFindingJazzRecords.#rating); // SyntaxError
```

尝试通过动态字符串访问它会返回 `undefined`——并且仍然会给出 TypeScript 错误。

```ts twoslash
// @errors: 7053
class Album {
  #rating = 0;
}

const loopFindingJazzRecords = new Album();

// ---cut---
console.log(loopFindingJazzRecords["#rating"]); // 输出: undefined
```

因此，如果你想确保一个属性是真正 private 的，你应该使用 `#` 语法。

## Class 方法

除了属性之外，class 还可以包含方法。这些函数有助于表达 class 的行为，并且可以用于与 public 和 private 属性进行交互。

### 实现 Class 方法

让我们向 `Album` class 添加一个 `printAlbumInfo` 方法，该方法将记录专辑的标题、艺术家和发行年份。

有几种将方法添加到 class 的技术。

第一种是遵循与 constructor 相同的模式，直接将方法添加到 class 主体中：

```typescript
// 在 Album class 内部
printAlbumInfo() {
  console.log(`${this.title} by ${this.artist}, released in ${this.releaseYear}.`);
}
```

另一种选择是使用箭头函数来定义方法：

```typescript
// 在 Album class 内部
printAlbumInfo = () => {
  console.log(
    `${this.title} by ${this.artist}, released in ${this.releaseYear}.`
  );
};
```

添加 `printAlbumInfo` 方法后，我们可以调用它来记录专辑的信息：

```typescript
loopFindingJazzRecords.printAlbumInfo();

// 输出: Loop Finding Jazz Records by Jan Jelinek, released in 2001.
```

#### 箭头函数还是 Class 方法？

箭头函数和 class 方法的行为确实不同。区别在于处理 `this` 的方式。

这是运行时的 JavaScript 行为，因此略微超出了本书的范围。但是为了有用起见，这里有一个例子：

```typescript
class MyClass {
  location = "Class";

  arrow = () => {
    console.log("arrow", this);
  };

  method() {
    console.log("method", this);
  }
}

const myObj = {
  location: "Object",
  arrow: new MyClass().arrow,
  method: new MyClass().method,
};

myObj.arrow(); // { location: 'Class' }
myObj.method(); // { location: 'Object' }
```

在 `arrow` 方法中，`this` 绑定到定义它的 class 实例。在 `method` 方法中，`this` 绑定到调用它的对象。

这在处理 class 时可能有点棘手，无论是在 JavaScript 还是 TypeScript 中。

## Class 继承

与我们可以扩展 type 和 interface 的方式类似，我们也可以在 TypeScript 中扩展 class。这允许你创建一个 class 层次结构，这些 class 可以相互继承属性和方法，从而使你的代码更有条理和可重用。

对于这个例子，我们将回到我们的基本 `Album` class，它将作为我们的基类：

```typescript
class Album {
  title: string;
  artist: string;
  releaseYear: number;

  constructor(opts: { title: string; artist: string; releaseYear: number }) {
    this.title = title;
    this.artist = artist;
    this.releaseYear = releaseYear;
  }

  displayInfo() {
    console.log(
      `${this.title} by ${this.artist}, released in ${this.releaseYear}.`
    );
  }
}
```

目标是创建一个 `SpecialEditionAlbum` class，它扩展 `Album` class 并添加一个 `bonusTracks` 属性。

### 扩展一个 Class

第一步是使用 `extends` 关键字创建 `SpecialEditionAlbum` class：

```typescript
class SpecialEditionAlbum extends Album {}
```

添加 `extends` 关键字后，添加到 `SpecialEditionAlbum` class 的任何新属性或方法都将是它从 `Album` class 继承的内容的补充。例如，我们可以向 `SpecialEditionAlbum` class 添加一个 `bonusTracks` 属性：

```typescript
class SpecialEditionAlbum extends Album {
  bonusTracks: string[];
}
```

接下来，我们需要添加一个 constructor，它包含来自 `Album` class 的所有属性以及 `bonusTracks` 属性。在扩展 class 时，关于 constructor 有几点需要注意。

首先，constructor 的参数应与父 class 中使用的形状匹配。在这种情况下，它是一个 `opts` 对象，具有 `Album` class 的属性以及新的 `bonusTracks` 属性。

其次，我们需要包含对 `super()` 的调用。这是一个特殊的方法，它调用父 class 的 constructor 并设置它定义的属性。这对于确保正确初始化基属性至关重要。我们将 `opts` 传递给 `super()` 方法，然后设置 `bonusTracks` 属性：

```typescript
class SpecialEditionAlbum extends Album {
  bonusTracks: string[];

  constructor(opts: {
    title: string;
    artist: string;
    releaseYear: number;
    bonusTracks: string[];
  }) {
    super(opts);
    this.bonusTracks = opts.bonusTracks;
  }
}
```

现在我们已经设置了 `SpecialEditionAlbum` class，我们可以像创建 `Album` class 一样创建一个新实例：

```typescript
const plasticOnoBandSpecialEdition = new SpecialEditionAlbum({
  title: "Plastic Ono Band",
  artist: "John Lennon",
  releaseYear: 2000,
  bonusTracks: ["Power to the People", "Do the Oz"],
});
```

此模式可用于向 `SpecialEditionAlbum` class 添加更多方法、属性和行为，同时仍保留 `Album` class 的属性和方法。

### `protected` 属性

除了 `public` 和 `private` 之外，还有第三个可见性修饰符叫做 `protected`。这类似于 `private`，但它允许从扩展该 class 的 class 内部访问该属性。

例如，如果我们想让 `Album` class 的 `title` 属性 `protected`，我们可以这样做：

```typescript
class Album {
  protected title: string;
  // ...
}
```

现在，可以从 `SpecialEditionAlbum` class 内部访问 `title` 属性，而不能从 class 外部访问。

### 使用 `override` 安全地覆盖

如果在子类中尝试覆盖方法，则在扩展类时可能会遇到麻烦。假设我们的 `Album` 类实现了一个 `displayInfo` 方法：

```typescript
class Album {
  // ...
  displayInfo() {
    console.log(
      `${this.title} by ${this.artist}, released in ${this.releaseYear}.`
    );
  }
}
```

我们的 `SpecialEditionAlbum` 类也实现了一个 `displayInfo` 方法：

```typescript
class SpecialEditionAlbum extends Album {
  // ...
  displayInfo() {
    console.log(
      `${this.title} by ${this.artist}, released in ${this.releaseYear}.`
    );
    console.log(`Bonus tracks: ${this.bonusTracks.join(", ")}`);
  }
}
```

这将覆盖 `Album` 类中的 `displayInfo` 方法，为附赠曲目添加额外的日志记录。

但是，如果我们将 `Album` 中的 `displayInfo` 方法更改为 `displayAlbumInfo` 会发生什么？`SpecialEditionAlbum` 不会自动更新，其覆盖将不再起作用。

为了防止这种情况，你可以在子类中使用 `override` 关键字来指示你有意覆盖父类中的方法：

```typescript
class SpecialEditionAlbum extends Album {
  // ...
  override displayInfo() {
    console.log(
      `${this.title} by ${this.artist}, released in ${this.releaseYear}.`
    );
    console.log(`Bonus tracks: ${this.bonusTracks.join(", ")}`);
  }
}
```

现在，如果 `Album` 类中的 `displayInfo` 方法被更改，TypeScript 将在 `SpecialEditionAlbum` 类中给出一个错误，让你知道该方法不再被覆盖。

你还可以通过在 `tsconfig.json` 文件中将 `noImplicitOverride` 设置为 `true` 来强制执行此操作。这将强制你在覆盖方法时始终指定 `override`：

```json
{
  "compilerOptions": {
    "noImplicitOverride": true
  }
}
```

### `implements` 关键字

在某些情况下，你希望强制一个 class 遵循特定的结构。为此，你可以使用 `implements` 关键字。

我们在上一个示例中创建的 `SpecialEditionAlbum` class 向 `Album` class 添加了一个 `bonusTracks` 属性，但是常规的 `Album` class 没有 `trackList` 属性。

让我们创建一个 interface 来强制任何实现它的 class 都必须具有 `trackList` 属性。

我们将该 interface 称为 `IAlbum`，并包含 `title`、`artist`、`releaseYear` 和 `trackList` 属性的属性：

```typescript
interface IAlbum {
  title: string;
  artist: string;
  releaseYear: number;
  trackList: string[];
}
```

请注意，`I` 前缀用于指示 interface，而 `T` 表示 type。不必使用这些前缀，但它是一种常见的约定，称为匈牙利表示法，可以使代码在阅读时更清楚地了解 interface 的用途。我不建议对所有 interface 和 type 都这样做——仅当它们与同名 class 冲突时才这样做。

创建 interface 后，我们可以使用 `implements` 关键字将其与 `Album` class 关联起来。

```ts twoslash
// @errors: 2420
interface IAlbum {
  title: string;
  artist: string;
  releaseYear: number;
  trackList: string[];
}

// ---cut---
class Album implements IAlbum {
  title: string;
  artist: string;
  releaseYear: number;

  constructor(opts: { title: string; artist: string; releaseYear: number }) {
    this.title = opts.title;
    this.artist = opts.artist;
    this.releaseYear = opts.releaseYear;
  }
}
```

由于 `Album` class 中缺少 `trackList` 属性，TypeScript 现在会给我们一个错误。为了修复它，需要将 `trackList` 属性添加到 `Album` class。添加属性后，我们可以相应地更新 interface 或设置 getter 和 setter：

```typescript
class Album implements IAlbum {
  title: string;
  artist: string;
  releaseYear: number;
  trackList: string[];

  constructor(opts: {
    title: string;
    artist: string;
    releaseYear: number;
    trackList: string[];
  }) {
    this.title = opts.title;
    this.artist = opts.artist;
    this.releaseYear = opts.releaseYear;
    this.trackList = opts.trackList;
  }

  // ...
}
```

这使我们可以为 `Album` class 定义一个契约，该契约强制执行 class 的结构并帮助及早发现错误。

### Abstract Classes

你可以用来定义基类的另一种模式是 `abstract` 关键字。Abstract class 模糊了类型和运行时之间的界限。你可以像这样声明一个 abstract class：

```typescript
abstract class AlbumBase {}
```

然后你可以像常规 class 一样在它上面定义方法和行为：

```typescript
abstract class AlbumBase {
  title: string;
  artist: string;
  releaseYear: number;
  trackList: string[] = [];

  constructor(opts: { title: string; artist: string; releaseYear: number }) {
    this.title = opts.title;
    this.artist = opts.artist;
    this.releaseYear = opts.releaseYear;
  }

  addTrack(track: string) {
    this.trackList.push(track);
  }
}
```

但是如果你尝试创建 `AlbumBase` class 的一个实例，TypeScript 会给你一个错误：

```ts twoslash
// @errors: 2511
abstract class AlbumBase {
  title: string;
  artist: string;
  releaseYear: number;
  trackList: string[] = [];

  constructor(opts: { title: string; artist: string; releaseYear: number }) {
    this.title = opts.title;
    this.artist = opts.artist;
    this.releaseYear = opts.releaseYear;
  }

  addTrack(track: string) {
    this.trackList.push(track);
  }
}

// ---cut---
const albumBase = new AlbumBase({
  title: "Unknown Album",
  artist: "Unknown Artist",
  releaseYear: 0,
});
```

相反，你需要创建一个扩展 `AlbumBase` class 的 class：

```typescript
class Album extends AlbumBase {
  // 你想要的任何额外功能
}

const album = new Album({
  title: "Unknown Album",
  artist: "Unknown Artist",
  releaseYear: 0,
});
```

你会注意到这个想法类似于实现 interface——除了 abstract class 还可以包含实现细节。

这意味着你可以稍微模糊类型和运行时之间的界限。你可以为一个 class 定义一个类型契约，但使其更具可重用性。

#### Abstract 方法

在我们的 abstract class 上，我们可以在方法之前使用 `abstract` 关键字来指示任何扩展 abstract class 的 class 都必须实现它：

```typescript
abstract class AlbumBase {
  // ...其他属性和方法

  abstract addReview(author: string, review: string): void;
}
```

现在，任何扩展 `AlbumBase` 的 class 都必须实现 `addReview` 方法：

```typescript
class Album extends AlbumBase {
  // ...其他属性和方法

  addReview(author: string, review: string) {
    // ...实现
  }
}
```

这为我们提供了另一种工具来表达 class 的结构并确保它们遵守特定的契约。

## 练习

### 练习 1：创建一个 Class

这里我们有一个名为 `CanvasNode` 的 class，它当前的功能与空对象完全相同：

```typescript
class CanvasNode {}
```

在测试用例中，我们通过调用 `new CanvasNode()` 来实例化该 class。

然而，我们有一些错误，因为我们希望它包含两个属性，特别是 `x` 和 `y`，每个属性的默认值为 `0`：

```ts twoslash
// @errors: 2339
import { it, expect } from "vitest";

class CanvasNode {}

// ---cut---
it("Should store some basic properties", () => {
  const canvasNode = new CanvasNode();

  expect(canvasNode.x).toEqual(0);
  expect(canvasNode.y).toEqual(0);

  // @ts-expect-error Property is readonly
  canvasNode.x = 10;

  // @ts-expect-error Property is readonly
  canvasNode.y = 20;
});
```

从 `@ts-expect-error` 指令可以看出，我们还希望这些属性是 readonly 的。

你的挑战是实现 `CanvasNode` class 以满足这些要求。为了额外练习，请分别使用和不使用 constructor 来解决这个挑战。

### 练习 2：实现 Class 方法

在这个练习中，我们简化了 `CanvasNode` class，使其不再具有只读属性：

```typescript
class CanvasNode {
  x = 0;
  y = 0;
}
```

有一个测试用例用于能够将 `CanvasNode` 对象移动到新位置：

```ts twoslash
// @errors: 2339
import { it, expect } from "vitest";
class CanvasNode {
  x = 0;
  y = 0;
}
// ---cut---
it("Should be able to move to a new location", () => {
  const canvasNode = new CanvasNode();

  expect(canvasNode.x).toEqual(0);
  expect(canvasNode.y).toEqual(0);

  canvasNode.move(10, 20);

  expect(canvasNode.x).toEqual(10);
  expect(canvasNode.y).toEqual(20);
});
```

目前，`move` 方法调用下有一个错误，因为 `CanvasNode` class 没有 `move` 方法。

你的任务是向 `CanvasNode` class 添加一个 `move` 方法，该方法将 `x` 和 `y` 属性更新到新位置。

### 练习 3：实现一个 Getter

让我们继续使用 `CanvasNode` class，它现在有一个 constructor，接受一个可选参数，重命名为 `position`。这个 `position` 是一个对象，取代了我们之前单独的 `x` 和 `y`：

```typescript
class CanvasNode {
  x: number;
  y: number;

  constructor(position?: { x: number; y: number }) {
    this.x = position?.x ?? 0;
    this.y = position?.y ?? 0;
  }

  move(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
```

在这些测试用例中，访问 `position` 属性时出现错误，因为它当前不是 `CanvasNode` class 的属性：

```ts twoslash
// @errors: 2339
import { it, expect } from "vitest";

class CanvasNode {
  x: number;
  y: number;

  constructor(position?: { x: number; y: number }) {
    this.x = position?.x ?? 0;
    this.y = position?.y ?? 0;
  }

  move(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

// ---cut---
it("Should be able to move", () => {
  const canvasNode = new CanvasNode();

  expect(canvasNode.position).toEqual({ x: 0, y: 0 });

  canvasNode.move(10, 20);

  expect(canvasNode.position).toEqual({ x: 10, y: 20 });
});

it("Should be able to receive an initial position", () => {
  const canvasNode = new CanvasNode({
    x: 10,
    y: 20,
  });

  expect(canvasNode.position).toEqual({ x: 10, y: 20 });
});
```

你的任务是更新 `CanvasNode` class 以包含一个 `position` getter，从而允许测试用例通过。

### 练习 4：实现一个 Setter

`CanvasNode` class 已更新，因此 `x` 和 `y` 现在是 private 属性：

```typescript
class CanvasNode {
  #x: number;
  #y: number;

  constructor(position?: { x: number; y: number }) {
    this.#x = position?.x ?? 0;
    this.#y = position?.y ?? 0;
  }

  // 你的 `position` getter 方法在这里

  // move 方法和以前一样
}
```

`x` 和 `y` 属性前面的 `#` 表示它们是 `readonly` 的，不能在 class 外部直接修改。此外，当存在 getter 而没有 setter 时，其属性也将被视为 `readonly`，如本测试用例所示：

```ts twoslash
// @errors: 2540
declare const canvasNode: {
  readonly position: { x: number; y: number };
};

// ---cut---
canvasNode.position = { x: 10, y: 20 };
```

你的任务是为 `position` 属性编写一个 setter，以允许测试用例通过。

### 练习 5：扩展一个 Class

这里我们有一个更复杂的 `CanvasNode` class 版本。

除了 `x` 和 `y` 属性之外，该 class 现在还有一个 `viewMode` 属性，其类型为 `ViewMode`，可以设置为 `hidden`、`visible` 或 `selected`：

```typescript
type ViewMode = "hidden" | "visible" | "selected";

class CanvasNode {
  x = 0;
  y = 0;
  viewMode: ViewMode = "visible";

  constructor(options?: { x: number; y: number; viewMode?: ViewMode }) {
    this.x = options?.x ?? 0;
    this.y = options?.y ?? 0;
    this.viewMode = options?.viewMode ?? "visible";
  }

  /* getter、setter 和 move 方法和以前一样 */
```

想象一下，如果我们的应用程序有一个 `Shape` class，它只需要 `x` 和 `y` 属性以及移动的能力。它不需要 `viewMode` 属性或与之相关的逻辑。

你的任务是重构 `CanvasNode` class，将 `x` 和 `y` 属性拆分到一个名为 `Shape` 的单独 class 中。然后，`CanvasNode` class 应扩展 `Shape` class，添加 `viewMode` 属性和与之相关的逻辑。

如果你愿意，可以使用 `abstract` class 来定义 `Shape`。

### 解决方案 1：创建一个 Class

这是一个 `CanvasNode` class 的示例，它带有一个满足要求的 constructor：

```typescript
class CanvasNode {
  readonly x: number;
  readonly y: number;

  constructor() {
    this.x = 0;
    this.y = 0;
  }
}
```

如果没有 constructor，`CanvasNode` class 可以通过直接分配属性来实现：

```typescript
class CanvasNode {
  readonly x = 0;
  readonly y = 0;
}
```

### 解决方案 2：实现 Class 方法

`move` 方法可以作为常规方法或箭头函数来实现：

这是常规方法：

```typescript
class CanvasNode {
  x = 0;
  y = 0;

  move(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
```

这是箭头函数：

```typescript
class CanvasNode {
  x = 0;
  y = 0;

  move = (x: number, y: number) => {
    this.x = x;
    this.y = y;
  };
}
```

正如前面部分所讨论的，使用箭头函数更安全，以避免 `this` 的问题。

### 解决方案 3：实现一个 Getter

以下是如何更新 `CanvasNode` class 以包含 `position` 属性的 getter：

```typescript
class CanvasNode {
  x: number;
  y: number;

  constructor(position?: { x: number; y: number }) {
    this.x = position?.x ?? 0;
    this.y = position?.y ?? 0;
  }

  move(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get position() {
    return { x: this.x, y: this.y };
  }
}
```

有了 getter 之后，测试用例就会通过。

请记住，使用 getter 时，你可以像访问 class 实例上的常规属性一样访问该属性：

```typescript
const canvasNode = new CanvasNode();
console.log(canvasNode.position.x); // 0
console.log(canvasNode.position.y); // 0
```

### 解决方案 4：实现一个 Setter

以下是如何向 `CanvasNode` class 添加 `position` setter：

```typescript
class CanvasNode {
  // 在 CanvasNode class 内部
  set position(pos) {
    this.x = pos.x;
    this.y = pos.y;
  }
}
```

请注意，我们不必向 `pos` 参数添加类型，因为 TypeScript 足够智能，可以根据 getter 的返回类型推断它。

### 解决方案 5：扩展一个 Class

新的 `Shape` class 看起来与原始的 `CanvasNode` class 非常相似：

```typescript
class Shape {
  #x: number;
  #y: number;

  constructor(options?: { x: number; y: number }) {
    this.#x = options?.x ?? 0;
    this.#y = options?.y ?? 0;
  }

  // position getter 和 setter 方法

  move(x: number, y: number) {
    this.#x = x;
    this.#y = y;
  }
}
```

然后，`CanvasNode` class 将扩展 `Shape` class 并添加 `viewMode` 属性。constructor 也将更新以接受 `viewMode` 并调用 `super()` 将 `x` 和 `y` 属性传递给 `Shape` class：

```typescript
class CanvasNode extends Shape {
  #viewMode: ViewMode;

  constructor(options?: { x: number; y: number; viewMode?: ViewMode }) {
    super(options);
    this.#viewMode = options?.viewMode ?? "visible";
  }
}
```
