我们现在对 TypeScript 的大多数功能有了很好的理解。让我们更进一步。通过探索 TypeScript 中一些更不寻常和鲜为人知的部分，我们将更深入地了解它的工作原理。

## 进化的 `any` 类型

虽然大多数时候我们希望类型保持静态，但可以创建像 JavaScript 中那样可以动态更改其类型的变量。这可以通过一种称为“进化 `any`”的技术来完成，该技术利用了在未指定类型时变量的声明和推断方式。

首先，使用 `let` 声明变量而不指定类型，TypeScript 会将其推断为 `any`：

```ts twoslash
let myVar;
//  ^?
```

现在 `myVar` 变量将采用赋给它的任何值的推断类型。

例如，我们可以给它赋一个数字，然后调用像 `toExponential()` 这样的数字方法。之后，我们可以将其更改为字符串并将其转换为大写：

```tsx
myVar = 659457206512;

console.log(myVar.toExponential()); // 输出 "6.59457206512e+11"

myVar = "mf doom";

console.log(myVar.toUpperCase()); // 输出 "MF DOOM"
```

这就像一种高级形式的类型收窄，其中变量的类型根据赋给它的值进行收窄。

### 进化的 `any` 数组

这种使用进化 `any` 的技术也适用于数组。当您声明一个没有特定类型的数组时，您可以向其中推送各种类型的元素：

```ts twoslash
const evolvingArray = [];

evolvingArray.push("abc");

const elem = evolvingArray[0];
//    ^?

evolvingArray.push(123);

const elem2 = evolvingArray[1];
//    ^?
```

即使没有指定类型，TypeScript 在捕捉您的操作以及您向进化 `any` 类型推送的行为方面也非常智能。

## 额外的属性警告

TypeScript 中一个令人困惑的部分是它如何处理对象中的额外属性。在许多情况下，当处理对象时，TypeScript 不会显示您可能期望的错误。

让我们创建一个 `Album` interface，其中包含 `title` 和 `releaseYear` 属性：

```tsx
interface Album {
  title: string;
  releaseYear: number;
}
```

这里我们创建一个未类型化的 `rubberSoul` 对象，其中包含一个额外的 `label` 属性：

```tsx
const rubberSoul = {
  title: "Rubber Soul",
  releaseYear: 1965,
  label: "Parlophone",
};
```

现在，如果我们创建一个接受 `Album` 并将其记录的 `processAlbum` 函数，我们可以传入 `rubberSoul` 对象而不会有任何问题：

```tsx
const processAlbum = (album: Album) => console.log(album);

processAlbum(rubberSoul); // 没有错误！
```

这看起来很奇怪！我们期望 TypeScript 会为额外的 `label` 属性显示一个错误，但它没有。

更奇怪的是，当我们*内联*传递对象时，我们确实会收到一个错误：

```ts twoslash
// @errors: 2353
type Album = {
  title: string;
  releaseYear: number;
};
const processAlbum = (album: Album) => console.log(album);

// ---cut---
processAlbum({
  title: "Rubber Soul",
  releaseYear: 1965,
  label: "Parlophone",
});
```

为什么行为不同？

### 变量上没有额外的属性检查

在第一个示例中，我们将专辑赋给一个变量，然后将该变量传递给我们的函数。在这种情况下，TypeScript 不会检查额外的属性。

原因是，我们可能在其他地方使用该变量，而这些地方需要额外的属性。TypeScript 不想妨碍这一点。

但是，当我们内联对象时，TypeScript 知道我们不会在其他地方使用它，所以它会检查额外的属性。

这可能会让你*认为* TypeScript 关心额外的属性——但事实并非如此。它只在某些情况下检查它们。

当您拼写错可选参数的名称时，这种行为可能会令人沮丧。假设您将 `timeout` 拼写成了 `timeOut`：

```typescript
const myFetch = (options: { url: string; timeout?: number }) => {
  // 实现
};

const options = {
  url: "/",
  timeOut: 1000,
};

myFetch(options); // 没有错误！
```

在这种情况下，TypeScript 不会显示错误，并且您不会得到预期的运行时行为。找出错误的唯一方法是为 `options` 对象提供类型注解：

```ts twoslash
// @errors: 2561
const options: { timeout?: number } = {
  timeOut: 1000,
};
```

现在，我们将内联对象与类型进行比较，TypeScript 将检查额外的属性。

### 比较函数时没有额外的属性检查

TypeScript 不会检查额外属性的另一种情况是比较函数时。

假设我们有一个 `remapAlbums` 函数，它本身接受一个函数：

```tsx
const remapAlbums = (albums: Album[], remap: (album: Album) => Album) => {
  return albums.map(remap);
};
```

此函数接受一个 `Album` 数组和一个重新映射每个 `Album` 的函数。这可以用来更改数组中每个 `Album` 的属性。

我们可以像这样调用它，将每个专辑的 `releaseYear` 增加一：

```tsx
const newAlbums = remapAlbums(albums, (album) => ({
  ...album,
  releaseYear: album.releaseYear + 1,
}));
```

但事实证明，我们可以向函数的返回类型传递一个额外的属性，而 TypeScript 不会报错：

```tsx
const newAlbums = remapAlbums(albums, (album) => ({
  ...album,
  releaseYear: album.releaseYear + 1,
  strangeProperty: "This is strange",
}));
```

现在，我们的 `newAlbums` 数组将在每个 `Album` 对象上都有一个额外的 `strangeProperty` 属性，而 TypeScript 甚至不知道。它认为函数的返回类型是 `Album[]`，但实际上是 `(Album & { strangeProperty: string })[]`。

我们让这个“工作”的方法是向我们的内联函数添加一个返回类型注解：

```ts twoslash
// @errors: 2353
type Album = {
  title: string;
  releaseYear: number;
};

const remapAlbums = (albums: Album[], remap: (album: Album) => Album) => {
  return albums.map(remap);
};

const albums: Album[] = [
  { title: "Rubber Soul", releaseYear: 1965 },
  { title: "Revolver", releaseYear: 1966 },
  { title: "Sgt. Pepper's Lonely Hearts Club Band", releaseYear: 1967 },
];

// ---cut---
const newAlbums = remapAlbums(
  albums,
  (album): Album => ({
    // 指定返回类型为 Album
    ...album,
    releaseYear: album.releaseYear + 1,
    strangeProperty: "This is strange",
  })
);
```

这将导致 TypeScript 为额外的 `strangeProperty` 属性显示错误。

这是因为在这种情况下，我们将内联对象（我们返回的值）直接与类型进行比较。TypeScript 在这种情况下会检查额外的属性。

如果没有返回类型注解，TypeScript 最终会尝试比较两个函数，如果一个函数返回太多属性，它并不会太在意。

### 开放与封闭对象类型

TypeScript 默认将所有对象视为*开放的*。在任何时候，它都期望对象上可能存在其他属性。

其他语言，如 Flow，默认将对象视为*封闭的*。Flow 是 Meta 的内部类型系统，默认情况下要求对象是精确的（它们称之为“封闭的”）。

```js
function method(obj: { foo: string }) {
  /* ... */
}

method({ foo: "test", bar: 42 }); // 错误！
```

您可以在 Flow 中使用 `...` 语法选择加入开放（或非精确）对象：

```js
function method(obj: { foo: string, ... }) {
  /* ... */
}

method({ foo: "test", bar: 42 }); // 不再有错误！
```

但 Flow 建议您默认使用封闭对象。他们认为，尤其是在使用扩展运算符时，谨慎一点更好。

### 为什么 TypeScript 将对象视为开放的？

开放对象更接近 JavaScript 的实际工作方式。任何针对 JavaScript（一种非常动态的语言）的类型系统都必须对其真正“安全”的程度持相对谨慎的态度。

因此，TypeScript 默认将对象视为开放的决定反映了它试图类型化的语言。它也更接近对象在其他语言中的工作方式。

问题在于，额外的属性警告常常会让你认为 TypeScript 使用封闭对象。

但实际上，额外的属性警告更像是一种“礼貌”。它仅在对象无法在其他地方修改的情况下使用。

## 对象键是松散类型的

TypeScript 具有开放对象类型的一个后果是，迭代对象的键可能会令人沮丧。

在 JavaScript 中，使用对象调用 `Object.keys` 将返回一个表示键的字符串数组。

```ts twoslash
const yetiSeason = {
  title: "Yeti Season",
  artist: "El Michels Affair",
  releaseYear: 2021,
};

const keys = Object.keys(yetiSeason);
//    ^?
```

理论上，然后您可以使用这些键来访问对象的值：

```ts twoslash
// @errors: 7053
const yetiSeason = {
  title: "Yeti Season",
  artist: "El Michels Affair",
  releaseYear: 2021,
};

const keys = Object.keys(yetiSeason);
// ---cut---
keys.forEach((key) => {
  console.log(yetiSeason[key]); // key 下方出现红色波浪线
});
```

但是我们遇到了一个错误。TypeScript 告诉我们不能使用 `string` 来访问 `yetiSeason` 的属性。

这唯一可行的方法是将 `key` 类型化为 `'title' | 'artist' | 'releaseYear'`。换句话说，即 `keyof typeof yetiSeason`。但它不是——它被类型化为 `string`。

原因在于 `Object.keys` —— 它返回 `string[]`，而不是 `(keyof typeof obj)[]`。

```ts twoslash
// @errors: 2304
const keys = Object.keys(yetiSeason);
//     ^?
```

顺便说一句，`for ... in` 循环也会发生同样的行为：

```ts twoslash
// @errors: 7053
const yetiSeason = {
  title: "Yeti Season",
  artist: "El Michels Affair",
  releaseYear: 2021,
};

const keys = Object.keys(yetiSeason);

// ---cut---
for (const key in yetiSeason) {
  console.log(yetiSeason[key]);
}
```

这是 TypeScript 开放对象类型的结果。TypeScript 无法在编译时知道对象的精确键，因此它必须假定每个对象上都存在未指定的键。当您枚举对象的键时，它能做的最安全的事情就是将它们都视为 `string`。

我们将在下面的练习中研究一些解决方法。

## 空对象类型

开放对象类型的另一个结果是空对象类型 `{}` 的行为可能与您预期的不同。

为了做好铺垫，让我们回顾一下类型可分配性图表：

图表顶部是 `unknown` 类型，它可以接受所有其他类型。底部是 `never` 类型，没有其他类型可以分配给它，但 `never` 类型本身可以分配给任何其他类型。

在 `never` 和 `unknown` 类型之间是一个类型的宇宙。空对象类型 `{}` 在这个宇宙中占有独特的位置。与您可能想象的不同，它实际上代表*任何不是 `null` 或 `undefined` 的东西*，而不是代表一个空对象。

这意味着它可以接受许多其他类型：string、number、boolean、function、symbol 以及包含属性的对象。

以下所有都是有效的赋值：

```typescript
const coverArtist: {} = "Guy-Manuel De Homem-Christo";
const upcCode: {} = 724384260910;

const submit = (homework: {}) => console.log(homework);
submit("Oh Yeah");
```

然而，尝试使用 `null` 或 `undefined` 调用 `submit` 将导致 TypeScript 错误：

```ts twoslash
// @errors: 2345
const submit = (homework: {}) => console.log(homework);
// ---cut---
submit(null);
```

这可能感觉有点奇怪。但是当您记住 TypeScript 的对象是*开放的*时，这就说得通了。想象一下我们的 `success` 函数实际上接受一个包含 `message` 的对象。如果我们给它传递一个额外的属性，TypeScript 会很高兴：

```tsx
const success = (response: { message: string }) =>
  console.log(response.message);

const messageWithExtra = { message: "Success!", extra: "This is extra" };

success(messageWithExtra); // 没有错误！
```

空对象实际上是“最开放”的对象。字符串、数字、布尔值在 JavaScript 中都可以被视作对象。它们各自都有属性和方法。因此，TypeScript 很乐意将它们赋给空对象类型。

JavaScript 中唯一没有属性的是 `null` 和 `undefined`。尝试访问这两者之一的属性将导致运行时错误。因此，它们不符合 TypeScript 中对象的定义。

考虑到这一点，空对象类型 `{}` 是一个相当优雅的解决方案，用于表示任何不是 `null` 或 `undefined` 的东西。

## 类型世界和值世界

在很大程度上，TypeScript 可以分为两个语法空间：类型世界和值世界。这两个世界可以并存于同一行代码中：

```tsx
const myNumber: number = 42;
//    ^^^^^^^^  ^^^^^^   ^^
//    值         类型     值
```

这可能会令人困惑，尤其因为 TypeScript 喜欢在两个世界中重复使用相同的关键字：

```tsx
if (typeof key === "string" && (key as keyof typeof obj)) {
  //^^^^^^^^^^^^^^^^^^^^^^          ^^^^^^^^^^^^^^^^^^^
  //值                               类型
}
```

但是 TypeScript 非常严格地对待这个边界。例如，您不能在值世界中使用类型：

```ts twoslash
// @errors: 2693
const processAlbum = (album: Album) => console.log(album);
// ---cut---
type Album = {
  title: string;
  artist: string;
};

processAlbum(Album);
```

如您所见，`Album` 甚至不存在于值世界中，因此当我们尝试将其用作值时，TypeScript 会显示错误。

另一个常见的例子是尝试将值直接传递给类型：

```ts twoslash
// @errors: 2749
const processAlbum = (album: Album) => console.log(album);

// ---cut---
type Album = ReturnType<processAlbum>;
```

在这种情况下，TypeScript 建议使用 `typeof processAlbum` 而不是 `processAlbum` 来修复错误。

这些边界非常清晰——除了一些特殊情况。有些实体可以同时存在于类型世界和值世界中。

### Classes (类)

考虑这个 `Song` class，它使用了在构造函数中声明属性的快捷方式：

```tsx
class Song {
  title: string;
  artist: string;

  constructor(title: string, artist: string) {
    this.title = title;
    this.artist = artist;
  }
}
```

我们可以使用 `Song` class 作为类型，例如用来类型化函数的参数：

```tsx
const playSong = (song: Song) =>
  console.log(`Playing ${song.title} by ${song.artist}`);
```

此类型指的是 `Song` class 的一个*实例*，而不是 class 本身：

```ts twoslash
// @errors: 2345
class Song {
  title: string;
  artist: string;

  constructor(title: string, artist: string) {
    this.title = title;
    this.artist = artist;
  }
}

const playSong = (song: Song) =>
  console.log(`Playing ${song.title} by ${song.artist}`);

// ---cut---
const song1 = new Song("Song 1", "Artist 1");

playSong(song1);

playSong(Song);
```

在这种情况下，当我们尝试将 `Song` class 本身传递给 `playSong` 函数时，TypeScript 会显示一个错误。这是因为 `Song` 是一个 class，而不是该 class 的实例。

因此，class 同时存在于类型世界和值世界中，并且在用作类型时表示 class 的实例。

### Enums (枚举)

Enums 也可以跨越世界。

考虑这个 `AlbumStatus` enum，以及一个确定是否有折扣的函数：

```tsx
enum AlbumStatus {
  NewRelease = 0,
  OnSale = 1,
  StaffPick = 2,
  Clearance = 3,
}

function logAlbumStatus(status: AlbumStatus) {
  if (status === AlbumStatus.NewRelease) {
    console.log("No discount available."); // 没有折扣
  } else {
    console.log("Discounted price available."); // 有折扣价
  }
}
```

您可以使用 `typeof AlbumStatus` 来引用 enum 本身的整个结构：

```typescript
function logAlbumStatus(status: typeof AlbumStatus) {
  // ...实现
}
```

但是那样你就需要向函数传入一个匹配该 enum 的结构：

```typescript
logAlbumStatus({
  NewRelease: 0,
  OnSale: 1,
  StaffPick: 2,
  Clearance: 3,
});
```

当用作类型时，enums 指的是 enum 的成员，而不是整个 enum 本身。

### `this` 关键字

`this` 关键字也可以跨越类型世界和值世界。

为了说明这一点，我们将使用这个 `Song` class，它的实现与我们之前看到的略有不同：

```typescript
class Song {
  playCount: number;

  constructor(title: string) {
    this.playCount = 0;
  }

  play(): this {
    this.playCount += 1;
    return this;
  }
}
```

在 `play` 方法内部，`this.playCount` 使用 `this` 作为值来访问 `this.playCount` 属性，同时也使用 `this` 作为类型来限定该方法的返回值类型。

当 `play` 方法返回 `this` 时，在类型世界中，它表示该方法返回当前 class 的一个实例。

这意味着我们可以创建一个新的 `Song` 实例并链式调用多次 `play` 方法：

```tsx
const earworm = new Song("Mambo No. 5", "Lou Bega").play().play().play();
```

`this` 是一个罕见的情况，即 `this` 和 `typeof this` 是同一个东西。我们可以用 `typeof this` 替换 `this` 返回类型，代码仍然会以同样的方式工作：

```typescript
class Song {
  // ...实现

  play(): typeof this {
    this.playCount += 1;
    return this;
  }
}
```

两者都指向 class 的当前实例。

### 类型和值同名

最后，可以将类型和值命名为相同的东西。当您想将类型用作值，或将值用作类型时，这可能很有用。

考虑这个 `Track` 对象，它已创建为一个常量，并注意大写字母“T”：

```tsx
export const Track = {
  play: (title: string) => {
    console.log(`Playing: ${title}`); // 播放：
  },
  pause: () => {
    console.log("Song paused"); // 歌曲已暂停
  },
  stop: () => {
    console.log("Song stopped"); // 歌曲已停止
  },
};
```

接下来，我们将创建一个 `Track` 类型，以镜像 `Track` 常量：

```tsx
export type Track = typeof Track;
```

我们现在有两个以相同名称导出的实体：一个是值，另一个是类型。这使得 `Track` 在我们使用它时可以同时充当两者。

假设我们在另一个文件中，我们可以导入 `Track` 并在一个只播放 "Mambo No. 5" 的函数中使用它：

```tsx
import { Track } from "./other-file"; // 从 "./other-file" 导入 Track

const mamboNumberFivePlayer = (track: Track) => {
  track.play("Mambo No. 5");
};

mamboNumberFivePlayer(Track);
```

在这里，我们使用 `Track` 作为类型来类型化 `track` 参数，并作为值传递给 `mamboNumberFivePlayer` 函数。

将鼠标悬停在 `Track` 上会显示它既是类型也是值：

```tsx
// 将鼠标悬停在 { Track } 上显示：

(alias) type Track = {
  play: (title: string) => void;
  pause: () => void;
  stop: () => void;
}

(alias) const Track = {
  play: (title: string) => void;
  pause: () => void;
  stop: () => void;
}
```

如我们所见，TypeScript 已将 `Track` 别名为类型和值。这意味着它在两个世界中都可用。

一个简单的例子是断言 `Track as Track`：

```tsx
console.log(Track as Track);
//          ^^^^^    ^^^^^
//          值        类型
```

TypeScript 可以无缝地在两者之间切换，当您想要将类型重用为值，或将值重用为类型时，这可能非常有用。

这种双重功能非常有用，尤其是当您有一些感觉像是类型的东西，并且希望在代码的其他地方重用它们时。

## 函数中的 `this`

我们已经了解了如何在 class 中使用 `this` 来引用 class 的当前实例。但是 `this` 也可以在函数和对象中使用。

### `this` 与 `function`

这里我们有一个表示专辑的对象，其中包含一个用 `function` 关键字编写的 `sellAlbum` 函数：

```tsx
const solidAir = {
  title: "Solid Air",
  artist: "John Martyn",
  sales: 40000,
  price: 12.99,
  sellAlbum: function () {
    this.sales++;
    console.log(`${this.title} has sold ${this.sales} copies.`); // `${this.title} 已售出 ${this.sales} 份。`
  },
};
```

请注意，在 `sellAlbum` 函数内部，`this` 用于访问 `album` 对象的 `sales` 和 `title` 属性。

当我们调用 `sellAlbum` 函数时，它将增加 `sales` 属性并记录预期的消息：

```tsx
album.sellAlbum(); // 输出 "Solid Air has sold 40001 copies."
```

这是因为当使用 `function` 关键字声明函数时，`this` 将始终引用该函数所属的对象。即使函数实现在对象外部编写，当调用该函数时，`this` 仍将引用该对象：

```tsx
function sellAlbum() {
  this.sales++;
  console.log(`${this.title} has sold ${this.sales} copies.`); // `${this.title} 已售出 ${this.sales} 份。`
}

const album = {
  title: "Solid Air",
  artist: "John Martyn",
  sales: 40000,
  price: 12.99,
  sellAlbum,
};
```

虽然 `sellAlbum` 函数可以工作，但目前 `this.title` 和 `this.sales` 属性被类型化为 any。因此我们需要找到某种方法在函数中类型化 `this`：

幸运的是，我们可以在函数签名中将 `this` 类型化为一个参数：

```tsx
function sellAlbum(this: { title: string; sales: number }) {
  this.sales++;
  console.log(`${this.title} has sold ${this.sales} copies.`); // `${this.title} 已售出 ${this.sales} 份。`
}
```

请注意，`this` 不是在调用函数时需要传入的参数。它只是指函数所属的对象。

现在，我们可以将 `sellAlbum` 函数传递给 `album` 对象：

```tsx
const album = {
  sellAlbum,
};
```

这里的类型检查以一种奇怪的方式工作——它不是立即检查 `this`，而是在调用函数时检查它：

```ts twoslash
// @errors: 2684
function sellAlbum(this: { title: string; sales: number }) {
  this.sales++;
  console.log(`${this.title} has sold ${this.sales} copies.`); // `${this.title} 已售出 ${this.sales} 份。`
}

const album = {
  sellAlbum,
};

// ---cut---
album.sellAlbum();
```

我们可以通过向 `album` 对象添加 `title` 和 `sales` 属性来解决这个问题：

```tsx
const album = {
  title: "Solid Air",
  sales: 40000,
  sellAlbum,
};
```

现在当我们调用 `sellAlbum` 函数时，TypeScript 将知道 `this` 指向一个具有 `string` 类型 `title` 属性和 `number` 类型 `sales` 属性的对象。

### 箭头函数

与 `function` 关键字函数不同，箭头函数不能用 `this` 参数进行注解：

```ts twoslash
// @errors: 2730
const sellAlbum = (this: { title: string; sales: number }) => {
  // 实现
};
```

这是因为箭头函数无法从调用它们的作用域继承 `this`。相反，它们从*定义*它们的作用域继承 `this`。这意味着它们只能在 class 内部定义时访问 `this`。

## 函数可分配性

让我们更深入地研究 TypeScript 中函数是如何比较的。

### 比较函数参数

在检查一个函数是否可分配给另一个函数时，并非所有函数参数都需要实现。这可能有点令人惊讶。

假设我们正在构建一个 `handlePlayer` 函数。此函数侦听音乐播放器并在某些事件发生时调用用户定义的回调。它应该能够接受一个具有单个 `filename` 参数的回调：

```typescript
handlePlayer((filename: string) => console.log(`Playing ${filename}`)); // 播放 ${filename}
```

它还应该处理带有 `filename` 和 `volume` 的回调：

```tsx
handlePlayer(
  (filename: string, volume: number) =>
    console.log(`Playing ${filename} at volume ${volume}`) // 以音量 ${volume} 播放 ${filename}
);
```

最后，它应该能够处理带有 `filename`、`volume` 和 `bassBoost` 的回调：

```tsx
handlePlayer((filename: string, volume: number, bassBoost: boolean) => {
  console.log(`Playing ${filename} at volume ${volume} with bass boost on!`); // 以音量 ${volume} 播放 ${filename} 并开启低音增强！
});
```

将 `CallbackType` 类型化为三种不同函数类型的联合类型可能很诱人：

```tsx
type CallbackType =
  | ((filename: string) => void)
  | ((filename: string, volume: number) => void)
  | ((filename: string, volume: number, bassBoost: boolean) => void);

const handlePlayer = (callback: CallbackType) => {
  // 实现
};
```

然而，在使用单个和双参数回调调用 `handlePlayer` 时，这将导致隐式 `any` 错误：

```ts twoslash
// @errors: 7006
type CallbackType =
  | ((filename: string) => void)
  | ((filename: string, volume: number) => void)
  | ((filename: string, volume: number, bassBoost: boolean) => void);

const handlePlayer = (callback: CallbackType) => {
  // 实现
};
// ---cut---
handlePlayer((filename) => console.log(`Playing ${filename}`)); // 播放 ${filename}

handlePlayer(
  (filename, volume) => console.log(`Playing ${filename} at volume ${volume}`) // 以音量 ${volume} 播放 ${filename}
);

handlePlayer((filename, volume, bassBoost) => {
  console.log(`Playing ${filename} at volume ${volume} with bass boost on!`); // 以音量 ${volume} 播放 ${filename} 并开启低音增强！
}); // 没有错误
```

这个函数联合显然不起作用。有一个更简单的解决方案。

您实际上可以删除联合的前两个成员，只包含具有所有三个参数的成员：

```tsx
type CallbackType = (
  filename: string,
  volume: number,
  bassBoost: boolean
) => void;
```

进行此更改后，其他两个回调版本的隐式 `any` 错误将消失。

```typescript
handlePlayer((filename) => console.log(`Playing ${filename}`)); // 没有错误 // 播放 ${filename}

handlePlayer(
  (filename, volume) => console.log(`Playing ${filename} at volume ${volume}`) // 没有错误 // 以音量 ${volume} 播放 ${filename}
);
```

乍一看这可能很奇怪——这些功能难道没有被充分说明吗？

让我们分解一下。传递给 `handlePlayer` 的回调将使用三个参数调用。如果回调只接受一个或两个参数，这没关系！回调忽略参数不会导致运行时错误。

如果回调接受的参数多于传入的参数，TypeScript 会显示错误：

```ts twoslash
// @errors: 2345 7006
type CallbackType = (
  filename: string,
  volume: number,
  bassBoost: boolean
) => void;

const handlePlayer = (callback: CallbackType) => {
  // 实现
};

// ---cut---
handlePlayer((filename, volume, bassBoost, extra) => {
  console.log(`Playing ${filename} at volume ${volume} with bass boost on!`); // 以音量 ${volume} 播放 ${filename} 并开启低音增强！
});
```

由于 `extra` 永远不会传递给回调，TypeScript 会显示错误。

但是，再次强调，实现比预期少的参数是可以的。为了进一步说明，我们可以在对数组调用 `map` 时看到这个概念的实际应用：

```tsx
["macarena.mp3", "scatman.wma", "cotton-eye-joe.ogg"].map((file) =>
  file.toUpperCase()
);
```

`.map` 总是用三个参数调用：当前元素、索引和整个数组。但是我们不必全部使用它们。在这种情况下，我们只关心 `file` 参数。

因此，仅仅因为一个函数可以接收一定数量的参数，并不意味着它必须在其实现中使用所有这些参数。

### 函数的联合类型

当创建函数的联合类型时，TypeScript 会做一些可能出乎意料的事情。它会创建参数的交集。

考虑这个 `formatterFunctions` 对象：

```tsx
const formatterFunctions = {
  title: (album: { title: string }) => `Title: ${album.title}`,
  artist: (album: { artist: string }) => `Artist: ${album.artist}`,
  releaseYear: (album: { releaseYear: number }) =>
    `Release Year: ${album.releaseYear}`,
};
```

`formatterFunctions` 对象中的每个函数都接受一个具有特定属性的 `album` 对象并返回一个字符串。

现在，让我们创建一个 `getAlbumInfo` 函数，它接受一个 `album` 对象和一个 `key`，该 `key` 将用于从 `formatterFunctions` 对象调用相应的函数：

```tsx
const getAlbumInfo = (album: any, key: keyof typeof formatterFunctions) => {
  const functionToCall = formatterFunctions[key];

  return functionToCall(album);
};
```

我们现在将 `album` 注解为 `any`，但让我们花点时间思考一下：它应该被注解为什么？

我们可以通过将鼠标悬停在 `functionToCall` 上来获得线索：

```tsx
// 将鼠标悬停在 functionToCall 上显示：
const functionToCall:
  | ((album: { title: string }) => string)
  | ((album: { artist: string }) => string)
  | ((album: { releaseYear: number }) => string);
```

`functionToCall` 被推断为来自 `formatterFunctions` 对象的三个不同函数的联合。

当然，这意味着我们应该用三种不同类型的 `album` 对象的联合来调用它，对吧？

```ts twoslash
// @errors: 2345
const formatterFunctions = {
  title: (album: { title: string }) => `Title: ${album.title}`,
  artist: (album: { artist: string }) => `Artist: ${album.artist}`,
  releaseYear: (album: { releaseYear: number }) =>
    `Release Year: ${album.releaseYear}`,
};
// ---cut---
const getAlbumInfo = (
  album: { title: string } | { artist: string } | { releaseYear: number },
  key: keyof typeof formatterFunctions
) => {
  const functionToCall = formatterFunctions[key];

  return functionToCall(album);
};
```

我们可以从错误中看出我们哪里错了。`functionToCall` 实际上需要用这三种不同类型的 `album` 对象的*交集*来调用，而不是它们的联合。

这很有道理。为了满足每个函数，我们需要提供一个具有所有三个属性的对象：`title`、`artist` 和 `releaseYear`。如果我们漏掉其中一个属性，我们将无法满足其中一个函数。

因此，我们可以提供一个类型，它是三种不同类型的 `album` 对象的交集：

```tsx
const getAlbumInfo = (
  album: { title: string } & { artist: string } & { releaseYear: number },
  key: keyof typeof formatterFunctions
) => {
  const functionToCall = formatterFunctions[key];

  return functionToCall(album);
};
```

它可以简化为一个单一的对象类型：

```tsx
const getAlbumInfo = (
  album: { title: string; artist: string; releaseYear: number },
  key: keyof typeof formatterFunctions
) => {
  const functionToCall = formatterFunctions[key];

  return functionToCall(album);
};
```

现在，当我们调用 `getAlbumInfo` 时，TypeScript 会知道 `album` 是一个具有 `title`、`artist` 和 `releaseYear` 属性的对象。

```tsx
const formatted = getAlbumInfo(
  {
    title: "Solid Air",
    artist: "John Martyn",
    releaseYear: 1973,
  },
  "title"
);
```

这种情况相对容易解决，因为每个参数都与其他参数兼容。但是当处理不兼容的参数时，事情可能会变得更复杂一些。我们将在练习中对此进行更深入的研究。

## 练习

### 练习 1：接受除 `null` 和 `undefined` 之外的任何内容

这里我们有一个函数 `acceptAnythingExceptNullOrUndefined`，它还没有被分配类型注解：

```ts twoslash
// @errors: 7006
const acceptAnythingExceptNullOrUndefined = (input) => {};
```

此函数可以使用各种输入进行调用：字符串、数字、布尔表达式、symbols、对象、数组、函数、正则表达式和 `Error` class 实例：

```typescript
acceptAnythingExceptNullOrUndefined("hello");
acceptAnythingExceptNullOrUndefined(42);
acceptAnythingExceptNullOrUndefined(true);
acceptAnythingExceptNullOrUndefined(Symbol("foo"));
acceptAnythingExceptNullOrUndefined({});
acceptAnythingExceptNullOrUndefined([]);
acceptAnythingExceptNullOrUndefined(() => {});
acceptAnythingExceptNullOrUndefined(/foo/);
acceptAnythingExceptNullOrUndefined(new Error("foo"));
```

这些输入都不应该抛出错误。

然而，正如函数名称所示，如果我们向函数传递 `null` 或 `undefined`，我们希望它抛出一个错误。

```ts twoslash
// @errors: 2578
const acceptAnythingExceptNullOrUndefined = (input: any) => {};
// ---cut---
acceptAnythingExceptNullOrUndefined(
  // @ts-expect-error
  null
);
acceptAnythingExceptNullOrUndefined(
  // @ts-expect-error
  undefined
);
```

您的任务是向 `acceptAnythingExceptNullOrUndefined` 函数添加一个类型注解，使其能够接受除 `null` 或 `undefined` 之外的任何值。

\<Exercise title="练习 1：接受除 `null` 和 `undefined` 之外的任何内容" filePath="/src/050-the-weird-parts/150-empty-object-type.problem.ts" resourceId="NMpTvrI4rUCyVa4GW2ViSR"\>\</Exercise\>

### 练习 2：检测对象中的额外属性

在这个练习中，我们处理一个 `options` 对象以及一个 `WorkspaceOptions` interface，它指定了 `url`、`method`、`headers` 和 `body`：

```ts twoslash
// @errors: 2578
interface FetchOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

const options = {
  url: "/",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  // @ts-expect-error
  search: new URLSearchParams({
    limit: "10",
  }),
};
```

请注意，`options` 对象有一个额外的属性 `search`，它没有在 `WorkspaceOptions` interface 中指定，同时还有一个当前不起作用的 `@ts-expect-error` 指令。

还有一个 `myFetch` 函数，它接受一个 `WorkspaceOptions` 类型的对象作为其参数，当使用 `options` 对象调用时没有任何错误：

```typescript
const myFetch = async (options: FetchOptions) => {};

myFetch(options);
```

您的挑战是确定 `@ts-expect-error` 指令为什么不起作用，并重构代码使其起作用。尝试用多种方法解决它！

\<Exercise title="练习 2：检测对象中的额外属性" filePath="/src/050-the-weird-parts/152-excess-properties-warnings.problem.ts" resourceId="PUZfccUL9g0ocvr45qbRoQ"\>\</Exercise\>

### 练习 3：检测函数中的额外属性

这是另一个 TypeScript 在我们期望的地方没有触发访问属性警告的练习。

这里我们有一个 `User` interface，包含 `id` 和 `name` 属性，以及一个 `users` 数组，其中包含两个用户对象，“Waqas”和“Zain”。

```typescript
interface User {
  id: number;
  name: string;
}

const users = [
  {
    name: "Waqas",
  },
  {
    name: "Zain",
  },
];
```

一个 `usersWithIds` 变量被类型化为一个 `User` 数组。一个 `map()` 函数用于将用户展开到一个新创建的对象中，该对象具有 `id` 和一个 `age` 为 30：

```ts twoslash
// @errors: 2578
interface User {
  id: number;
  name: string;
}

const users = [
  {
    name: "Waqas",
  },
  {
    name: "Zain",
  },
];

// ---cut---
const usersWithIds: User[] = users.map((user, index) => ({
  ...user,
  id: index,
  // @ts-expect-error
  age: 30,
}));
```

尽管 TypeScript 不期望 `User` 上有 `age` 属性，但它没有显示错误，并且在运行时该对象确实会包含一个 `age` 属性。

您的任务是确定为什么 TypeScript 在这种情况下没有引发错误，并找到两种不同的解决方案，使其在添加意外属性时适当地报错。

\<Exercise title="练习 3：检测函数中的额外属性" filePath="/src/050-the-weird-parts/153-excess-properties-warnings-in-functions.problem.ts" resourceId="PUZfccUL9g0ocvr45qbS8Y"\>\</Exercise\>

### 练习 4：迭代对象

考虑一个具有 `id` 和 `name` 属性的 `User` interface，以及一个接受 `User` 作为其参数的 `printUser` 函数：

```typescript
interface User {
  id: number;
  name: string;
}

function printUser(user: User) {}
```

在测试设置中，我们希望使用 `id` 为 `1` 和 `name` 为 "Waqas" 来调用 `printUser` 函数。期望是 `console.log` 上的 spy 首先被调用时参数为 `1`，然后是 "Waqas"：

```typescript
it("Should log all the keys of the user", () => {
  // 应该记录用户的所有键
  const consoleSpy = vitest.spyOn(console, "log");

  printUser({
    id: 1,
    name: "Waqas",
  });

  expect(consoleSpy).toHaveBeenCalledWith(1);
  expect(consoleSpy).toHaveBeenCalledWith("Waqas");
});
```

您的任务是实现 `printUser` 函数，以便测试用例按预期通过。

显然，您可以手动记录 `printUser` 函数内部的属性，但这里的目标是迭代对象的每个属性。

尝试用 `for` 循环解决此练习作为一种方案，用 `Object.keys().forEach()` 作为另一种方案。作为加分项，尝试将函数参数的类型扩展到 `User` 之外作为第三种方案。

请记住，`Object.keys()` 的类型被指定为始终返回一个字符串数组。

\<Exercise title="练习 4：迭代对象" filePath="/src/050-the-weird-parts/154.6-iterating-over-objects.problem.ts" resourceId="PUZfccUL9g0ocvr45qbSW2"\>\</Exercise\>

### 练习 5：函数参数比较

这里我们有一个 `listenToEvent` 函数，它接受一个回调，该回调可以根据调用方式处理不同数量的参数。目前 `CallbackType` 设置为 `unknown`：

```typescript
type Event = "click" | "hover" | "scroll";

type CallbackType = unknown;

const listenToEvent = (callback: CallbackType) => {};
```

例如，我们可能希望调用 `listenToEvent` 并传递一个不接受任何参数的函数——在这种情况下，根本不需要担心参数：

```typescript
listenToEvent(() => {});
```

或者，我们可以传递一个期望单个参数 `event` 的函数：

```ts twoslash
// @errors: 7006 2344
import { Equal, Expect } from "@total-typescript/helpers";

type Event = "click" | "hover" | "scroll";

type CallbackType = unknown;

const listenToEvent = (callback: CallbackType) => {};

// ---cut---
listenToEvent((event) => {
  type tests = [Expect<Equal<typeof event, Event>>];
});
```

更进一步，我们可以用 `event`、`x` 和 `y` 来调用它：

```ts twoslash
// @errors: 7006 2344
import { Equal, Expect } from "@total-typescript/helpers";

type Event = "click" | "hover" | "scroll";

type CallbackType = unknown;

const listenToEvent = (callback: CallbackType) => {};

// ---cut---
listenToEvent((event, x, y) => {
  type tests = [
    Expect<Equal<typeof event, Event>>,
    Expect<Equal<typeof x, number>>,
    Expect<Equal<typeof y, number>>
  ];
});
```

最后，该函数可以接受参数 `event`、`x`、`y` 和 `screenID`：

```ts twoslash
// @errors: 7006 2344
import { Equal, Expect } from "@total-typescript/helpers";

type Event = "click" | "hover" | "scroll";

type CallbackType = unknown;

const listenToEvent = (callback: CallbackType) => {};

// ---cut---
listenToEvent((event, x, y, screenId) => {
  type tests = [
    Expect<Equal<typeof event, Event>>,
    Expect<Equal<typeof x, number>>,
    Expect<Equal<typeof y, number>>,
    Expect<Equal<typeof screenId, number>>
  ];
});
```

几乎在所有情况下，TypeScript 都会给出错误。

您的任务是更新 `CallbackType` 以确保它可以处理所有这些情况。

\<Exercise title="练习 5：函数参数比较" filePath="/src/050-the-weird-parts/155-function-parameter-comparisons.problem.ts" resourceId="jUJqrXCHRph0Z4Fs6VxI9r"\>\</Exercise\>

### 练习 6：带有对象参数的函数联合

这里我们处理两个函数：`logId` 和 `logName`。`logId` 函数将对象中的 `id` 记录到控制台，而 `logName` 对 `name` 执行相同的操作：

这些函数被分组到一个名为 `loggers` 的数组中：

```typescript
const logId = (obj: { id: string }) => {
  console.log(obj.id);
};

const logName = (obj: { name: string }) => {
  console.log(obj.name);
};

const loggers = [logId, logName];
```

在 `logAll` 函数内部，一个当前未类型化的对象作为参数传递。然后使用此对象调用 `loggers` 数组中的每个 logger 函数：

```ts twoslash
// @errors: 7006
const logId = (obj: { id: string }) => {
  console.log(obj.id);
};

const logName = (obj: { name: string }) => {
  console.log(obj.name);
};

const loggers = [logId, logName];

// ---cut---
const logAll = (obj) => {
  loggers.forEach((func) => func(obj));
};
```

您的任务是确定如何类型化 `logAll` 函数的 `obj` 参数。仔细查看各个 logger 函数的类型签名，以了解此对象应该是什么类型。

\<Exercise title="练习 6：带有对象参数的函数联合" filePath="/src/050-the-weird-parts/156-unions-of-functions-with-object-params.problem.ts" resourceId="NMpTvrI4rUCyVa4GW2ViZX"\>\</Exercise\>

### 练习 7：具有不兼容参数的函数联合

这里我们正在处理一个名为 `objOfFunctions` 的对象，它包含按 `string`、`number` 或 `boolean` 键控的函数。每个键都有一个关联的函数来处理该类型的输入：

```typescript
const objOfFunctions = {
  string: (input: string) => input.toUpperCase(),
  number: (input: number) => input.toFixed(2),
  boolean: (input: boolean) => (input ? "true" : "false"),
};
```

`format` 函数接受一个可以是 `string`、`number` 或 `boolean` 的输入。它通过常规的 `typeof` 运算符从此输入中提取类型，但它将该运算符断言为 `string`、`number` 或 `boolean`。

它看起来像这样：

```ts twoslash
// @errors: 2345
const objOfFunctions = {
  string: (input: string) => input.toUpperCase(),
  number: (input: number) => input.toFixed(2),
  boolean: (input: boolean) => (input ? "true" : "false"),
};

// ---cut---
const format = (input: string | number | boolean) => {
  // 'typeof' 不够智能，不知道
  // 它只能是 'string'、'number' 或 'boolean'，
  // 所以我们需要使用 'as'
  const inputType = typeof input as "string" | "number" | "boolean";
  const formatter = objOfFunctions[inputType];

  return formatter(input);
};
```

从 `objOfFunctions` 中提取的 `formatter` 最终被类型化为函数的联合。这是因为它可能是任何一个接受 `string`、`number` 或 `boolean` 的函数：

```tsx
// 鼠标悬停在 formatter 上显示：
const formatter:
  | ((input: string) => string)
  | ((input: number) => string)
  | ((input: boolean) => "true" | "false");
```

当前在 `format` 函数的 return 语句中的 `input` 上存在错误。您的挑战是在类型级别解决此错误，即使代码在运行时可以工作。尝试使用断言作为一种解决方案，使用类型守卫作为另一种解决方案。

一个有用的小知识——`any` 不能分配给 `never`。

\<Exercise title="练习 7：具有不兼容参数的函数联合" filePath="/src/050-the-weird-parts/157-unions-of-functions.problem.ts" resourceId="Mcr8ILwjCSlKdfKEBg8upM"\>\</Exercise\>

### 解决方案 1：接受除 `null` 和 `undefined` 之外的任何内容

解决方案是向 `input` 参数添加一个空对象注解：

```typescript
const acceptAnythingExceptNullOrUndefined = (input: {}) => {};
```

由于 `input` 参数被类型化为空对象，它将接受除 `null` 或 `undefined` 之外的任何值。

### 解决方案 2：检测对象中的额外属性

我们在练习的起点没有看到错误，因为 TypeScript 的对象是开放的，而不是封闭的。`options` 对象具有 `WorkspaceOptions` interface 的所有必需属性，因此 TypeScript 认为它可以分配给 `WorkspaceOptions`，并且不关心是否添加了其他属性。

让我们看看几种使额外属性错误按预期工作的方法：

#### 选项 1：添加类型注解

向 `options` 对象添加类型注解将导致额外属性的错误：

```typescript
const options: FetchOptions = {
  url: "/",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  // @ts-expect-error
  search: new URLSearchParams({
    limit: "10",
  }),
};
```

这会触发额外属性错误，因为 TypeScript 直接将对象字面量与类型进行比较。

#### 选项 2：使用 `satisfies` 关键字

触发额外属性检查的另一种方法是在变量声明的末尾添加 `satisfies` 关键字：

```tsx
const options = {
  url: "/",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  // @ts-expect-error
  search: new URLSearchParams({
    limit: "10",
  }),
} satisfies FetchOptions;
```

这出于同样的原因起作用。

#### 选项 3：内联变量

最后，如果变量内联到函数调用中，TypeScript 也会检查额外的属性：

```typescript
const myFetch = async (options: FetchOptions) => {};

myFetch({
  url: "/",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  // @ts-expect-error
  search: new URLSearchParams({
    limit: "10",
  }),
});
```

在这种情况下，TypeScript 会提供一个错误，因为它知道 `search` 不是 `WorkspaceOptions` interface 的一部分。

开放对象最终比它们最初看起来更有用。如果一直执行额外属性检查（就像 Flow 的情况一样），那可能会很麻烦，因为您必须在将其传递给 fetch 之前手动删除 `search`。

### 解决方案 3：检测函数中的额外属性

我们将为此练习研究两种解决方案。

#### 选项 1：给映射函数一个返回类型

解决此问题的第一个方法是注解 map 函数。

在这种情况下，映射函数将接收一个 `user`，它是一个具有 `name` 字符串的对象，以及一个 `index`，它将是一个数字。

然后对于返回类型，我们将指定它必须返回一个 `User` 对象。

```tsx
const usersWithIds: User[] = users.map(
  (user, index): User => ({
    // 返回类型注解为 User
    ...user,
    id: index,
    // @ts-expect-error
    age: 30,
  })
);
```

通过此设置，`age` 上会出现错误，因为它不是 `User` 类型的一部分。

#### 选项 2：使用 `satisfies`

对于此解决方案，我们将使用 `satisfies` 关键字来确保从 map 函数返回的对象满足 `User` 类型：

```tsx
const usersWithIds: User[] = users.map(
  (user, index) =>
    ({
      ...user,
      id: index,
      // @ts-expect-error
      age: 30,
    } satisfies User)
);
```

TypeScript 的额外属性检查有时会导致意外行为，尤其是在处理函数返回时。为避免此问题，请始终为可能包含额外属性的变量声明类型，或在函数中指明预期的返回类型。

### 解决方案 4：迭代对象

让我们看一下 `printUser` 函数的两种循环方法。

#### 选项 1：使用 `Object.keys().forEach()`

第一种方法是使用 `Object.keys().forEach()` 迭代对象键。在 `forEach` 回调内部，我们将使用 `key` 变量访问键的值：

```ts twoslash
// @errors: 7053
type User = {
  id: number;
  name: string;
};
// ---cut---
function printUser(user: User) {
  Object.keys(user).forEach((key) => {
    console.log(user[key]);
  });
}
```

此更改将使测试用例通过，但 TypeScript 在 `user[key]` 上引发类型错误。

问题在于 `User` interface 没有索引签名。为了在不修改 `User` interface 的情况下解决类型错误，我们可以在 `key` 上使用类型断言来告诉 TypeScript 它的类型是 `keyof User`：

```tsx
console.log(user[key as keyof User]);
```

`keyof User` 将是属性名称的联合，例如 `id` 或 `name`。通过使用 `as`，我们告诉 TypeScript `key` 就像一个更精确的字符串。

通过此更改，错误消失了——但我们的代码安全性降低了一些。如果我们的对象有一个意外的键，我们可能会得到一些奇怪的行为。

#### 选项 2：使用 `for` 循环

`for` 循环方法类似于 `Object.keys().forEach()` 方法。我们可以使用 `for` 循环并传入一个对象而不是一个 `user`：

```tsx
function printUser(user: User) {
  for (const key in user) {
    console.log(user[key as keyof typeof user]);
  }
}
```

和以前一样，由于 TypeScript 处理额外属性检查的方式，我们需要使用 `keyof typeof`。

#### 选项 3：扩大类型

另一种方法是在 `printUser` 函数内部扩大类型。在这种情况下，我们将指定传入的 `user` 是一个具有 `string` 键和 `unknown` 值的 `Record`。

在这种情况下，传入的对象不必是 `user`，因为我们只是要映射它接收到的每个键：

```tsx
function printUser(obj: Record<string, unknown>) {
  Object.keys(obj).forEach((key) => {
    console.log(obj[key]);
  });
}
```

这在运行时和类型级别上都可以正常工作，没有错误。

#### 选项 4：`Object.values`

迭代对象的另一种方法是使用 `Object.values`：

```tsx
function printUser(user: User) {
  Object.values(user).forEach(console.log);
}
```

这种方法避免了与键有关的整个问题，因为 `Object.values` 将返回一个包含对象值的数组。当此选项可用时，这是避免处理松散类型键问题的好方法。

在迭代对象键时，处理此问题主要有两种选择：您可以通过 `as keyof typeof` 使键访问稍微不安全，或者可以使被索引的类型更宽松。两种方法都可行，因此您可以根据自己的用例决定哪种方法更好。

### 解决方案 5：函数参数比较

解决方案是将 `CallbackType` 类型化为一个指定每个可能参数的函数：

```tsx
type CallbackType = (
  event: Event,
  x: number,
  y: number,
  screenId: number
) => void;
```

回想一下，在实现函数时，它不必关注传入的每个参数。但是，它不能使用其定义中不存在的参数。

通过使用每个可能的参数来类型化 `CallbackType`，无论传入多少参数，测试用例都将通过。

### 解决方案 6：带有对象参数的函数联合

将鼠标悬停在 `loggers.forEach()` 上，我们可以看到 `func` 是两种不同类型函数之间的联合：

```ts
const logAll = (obj) => {
  loggers.forEach((func) => func(obj));
};

// 鼠标悬停在 forEach 上显示：

(parameter) func: ((obj: {
  id: string;
}) => void) | ((obj: {
  name: string;
}) => void)
```

一个函数接受一个 `id` 字符串，另一个函数接受一个 `name` 字符串。

这是有道理的，因为当我们调用数组时，我们不知道在什么时候得到哪一个。

我们可以对 `id` 和 `name` 的对象使用交集类型：

```tsx
const logAll = (obj: { id: string } & { name: string }) => {
  loggers.forEach((func) => func(obj));
};
```

或者，我们可以只传入一个具有 `id` 字符串和 `name` 字符串属性的常规对象。正如我们所见，拥有一个额外的属性不会导致运行时问题，TypeScript 也不会对此抱怨：

```tsx
const logAll = (obj: { id: string; name: string }) => {
  loggers.forEach((func) => func(obj));
};
```

在这两种情况下，结果都是 `func` 是一个包含所有可能传入参数的函数：

```tsx
// 鼠标悬停在 func 上显示：
(parameter) func: (obj: {
    id: string;
} & {
    name: string;
}) => void
```

这种行为很有意义，并且在处理具有不同需求的函数时，这种模式很有用。

### 解决方案 7：具有不兼容参数的函数联合

将鼠标悬停在 `formatter` 函数上会显示其 `input` 被类型化为 `never`，因为它是类型不兼容的联合：

```tsx
// 鼠标悬停在 formatter 上显示：
const formatter: (input: never) => string;
```

为了解决类型级别的问题，我们可以使用 `as never` 断言来告诉 TypeScript `input` 的类型是 `never`：

```tsx
// 在 format 函数内部
return formatter(input as never);
```

这有点不安全，但我们从运行时行为知道 `input` 将始终是 `string`、`number` 或 `boolean`。

有趣的是，`as any` 在这里不起作用，因为 `any` 不能分配给 `never`：

```ts twoslash
// @errors: 2345
const objOfFunctions = {
  string: (input: string) => input.toUpperCase(),
  number: (input: number) => input.toFixed(2),
  boolean: (input: boolean) => (input ? "true" : "false"),
};

// ---cut---
const format = (input: string | number | boolean) => {
  const inputType = typeof input as "string" | "number" | "boolean";
  const formatter = objOfFunctions[inputType];

  return formatter(input as any);
};
```

解决此问题的另一种方法是通过在调用 `formatter` 之前缩小 `input` 的类型来放弃我们的函数联合：

```tsx
const format = (input: string | number | boolean) => {
  if (typeof input === "string") {
    return objOfFunctions.string(input);
  } else if (typeof input === "number") {
    return objOfFunctions.number(input);
  } else {
    return objOfFunctions.boolean(input);
  }
};
```

这个解决方案更冗长，编译后的效果不如 `as never` 好，但它会按预期修复错误。
