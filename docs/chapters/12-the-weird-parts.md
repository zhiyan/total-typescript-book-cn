我们现在已经对TypeScript的大多数特性有了很好的理解。让我们更进一步。通过探索TypeScript中一些更不寻常和鲜为人知的部分，我们将更深入地了解它的工作原理。

## 进化的`any`类型

虽然大多数时候我们希望我们的类型保持静态，但可以创建可以像JavaScript中那样动态改变其类型的变量。这可以通过一种称为"进化的`any`"的技术来实现，该技术利用了在未指定类型时变量如何声明和推断的方式。

首先，使用`let`声明变量而不指定类型，TypeScript将推断它为`any`：

```ts twoslash
let myVar;
//  ^?
```

现在`myVar`变量将采用分配给它的任何内容的推断类型。

例如，我们可以给它分配一个数字，然后在它上面调用数字方法，如`toExponential()`。之后，我们可以将其更改为字符串并将其转换为全大写：

```tsx
myVar = 659457206512;

console.log(myVar.toExponential()); // 记录 "6.59457206512e+11"

myVar = "mf doom";

console.log(myVar.toUpperCase()); // 记录 "MF DOOM"
```

这就像一种高级形式的缩小，其中变量的类型基于分配给它的值而缩小。

### 进化的`any`数组

使用进化的`any`的这种技术也适用于数组。当你声明一个没有特定类型的数组时，你可以向其中推送各种类型的元素：

```ts twoslash
const evolvingArray = [];

evolvingArray.push("abc");

const elem = evolvingArray[0];
//    ^?

evolvingArray.push(123);

const elem2 = evolvingArray[1];
//    ^?
```

即使没有指定类型，TypeScript在捕捉你的行为和你推送到进化`any`类型的行为方面非常聪明。

## 多余属性警告

TypeScript的一个深度令人困惑的部分是它如何处理对象中的多余属性。在许多情况下，TypeScript不会显示你在使用对象时可能期望的错误。

让我们创建一个包含`title`和`releaseYear`属性的`Album`接口：

```tsx
interface Album {
  title: string;
  releaseYear: number;
}
```

这里我们创建一个包含多余`label`属性的无类型`rubberSoul`对象：

```tsx
const rubberSoul = {
  title: "Rubber Soul",
  releaseYear: 1965,
  label: "Parlophone",
};
```

现在，如果我们创建一个接受`Album`并记录它的`processAlbum`函数，我们可以毫无问题地传入`rubberSoul`对象：

```tsx
const processAlbum = (album: Album) => console.log(album);

processAlbum(rubberSoul); // 没有错误！
```

这看起来很奇怪！我们期望TypeScript为多余的`label`属性显示错误，但它没有。

更奇怪的是，当我们_内联_传递对象时，我们确实得到了错误：

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

为什么会有不同的行为？

### 变量上没有多余属性检查

在第一个例子中，我们将专辑分配给一个变量，然后将变量传递到我们的函数中。在这种情况下，TypeScript不会检查多余的属性。

原因是我们可能在其他需要多余属性的地方使用该变量。TypeScript不想妨碍这一点。

但当我们内联对象时，TypeScript知道我们不会在其他地方使用它，所以它会检查多余的属性。

这可能会让你_认为_TypeScript关心多余的属性 - 但事实并非如此。它只在某些情况下检查它们。

当你拼错可选参数的名称时，这种行为可能会令人沮丧。想象一下，你将`timeout`拼错为`timeOut`：

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

在这种情况下，TypeScript不会显示错误，你也不会得到你期望的运行时行为。找出错误的唯一方法是为`options`对象提供类型注解：

```ts twoslash
// @errors: 2561
const options: { timeout?: number } = {
  timeOut: 1000,
};
```

现在，我们正在将内联对象与类型进行比较，TypeScript将检查多余的属性。

### 比较函数时没有多余属性检查

TypeScript不会检查多余属性的另一种情况是在比较函数时。

让我们想象我们有一个`remapAlbums`函数，它本身接受一个函数：

```tsx
const remapAlbums = (albums: Album[], remap: (album: Album) => Album) => {
  return albums.map(remap);
};
```

这个函数接受一个`Album`数组和一个重新映射每个`Album`的函数。这可以用来更改数组中每个`Album`的属性。

我们可以这样调用它，将每个专辑的`releaseYear`增加一：

```tsx
const newAlbums = remapAlbums(albums, (album) => ({
  ...album,
  releaseYear: album.releaseYear + 1,
}));
```

但事实证明，我们可以将多余的属性传递给函数的返回类型，而TypeScript不会抱怨：

```tsx
const newAlbums = remapAlbums(albums, (album) => ({
  ...album,
  releaseYear: album.releaseYear + 1,
  strangeProperty: "This is strange",
}));
```

现在，我们的`newAlbums`数组将在每个`Album`对象上有一个多余的`strangeProperty`属性，而TypeScript甚至不知道它。它认为函数的返回类型是`Album[]`，但实际上是`(Album & { strangeProperty: string })[]`。

我们让这个"工作"的方式是为我们的内联函数添加返回类型注解：

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
    ...album,
    releaseYear: album.releaseYear + 1,
    strangeProperty: "This is strange",
  }),
);
```

这将导致TypeScript为多余的`strangeProperty`属性显示错误。

这之所以有效，是因为在这种情况下，我们直接将内联对象（我们返回的值）与类型进行比较。TypeScript将在这种情况下检查多余的属性。

没有返回类型注解，TypeScript最终会尝试比较两个函数，它并不真正介意函数是否返回太多属性。

### 开放与封闭对象类型

TypeScript默认将所有对象视为_开放的_。它期望对象上随时可能存在其他属性。

其他语言，如Flow，默认将对象视为_封闭的_。Flow是Meta的内部类型系统，默认要求对象是精确的（他们对"封闭"的术语）。

```js
function method(obj: { foo: string }) {
  /* ... */
}

method({ foo: "test", bar: 42 }); // 错误！
```

你可以在Flow中使用`...`语法选择开放（或不精确）对象：

```js
function method(obj: { foo: string, ... }) {
  /* ... */
}

method({ foo: "test", bar: 42 }); // 不再有错误！
```

但Flow建议你默认使用封闭对象。他们认为，特别是在使用展开运算符时，最好谨慎行事。

### 为什么TypeScript将对象视为开放的？

开放对象更接近JavaScript的实际工作方式。任何JavaScript的类型系统 - 一种非常动态的语言 - 必须相对谨慎地考虑它能真正"安全"到什么程度。

因此，TypeScript决定默认将对象视为开放的，这反映了它试图类型化的语言。它也更接近其他语言中对象的工作方式。

问题是多余属性警告常常会让你认为TypeScript使用封闭对象。

但实际上，多余属性警告更像是一种礼貌。它只在对象不能在其他地方修改的情况下使用。

## 对象键松散类型化

TypeScript具有开放对象类型的一个后果是迭代对象的键可能会令人沮丧。

在JavaScript中，使用对象调用`Object.keys`将返回表示键的字符串数组。

```ts twoslash
const yetiSeason = {
  title: "Yeti Season",
  artist: "El Michels Affair",
  releaseYear: 2021,
};

const keys = Object.keys(yetiSeason);
//    ^?
```

理论上，你可以使用这些键访问对象的值：

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
  console.log(yetiSeason[key]); // key下有红色波浪线
});
```

但我们得到了一个错误。TypeScript告诉我们，我们不能使用`string`访问`yetiSeason`的属性。

唯一可行的方式是如果`key`被类型化为`'title' | 'artist' | 'releaseYear'`。换句话说，作为`keyof typeof yetiSeason`。但它不是 - 它被类型化为`string`。

这个原因回到`Object.keys` - 它返回`string[]`，而不是`(keyof typeof obj)[]`。

```ts twoslash
// @errors: 2304
const keys = Object.keys(yetiSeason);
//     ^?
```

顺便说一下，`for ... in`循环也会发生相同的行为：

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

这是TypeScript开放对象类型的后果。TypeScript在编译时无法知道对象的确切键，所以它必须假设每个对象上都有未指定的键。对它来说最安全的做法是，当你枚举对象的键时，将它们全部视为`string`。

我们将在下面的练习中看几种解决这个问题的方法。

## 空对象类型

开放对象类型的另一个后果是空对象类型`{}`的行为可能不如你所期望的那样。

为了设置舞台，让我们重新审视类型可分配性图表：

![类型可分配性图表](https://res.cloudinary.com/total-typescript/image/upload/v1708622408/150-empty-object-type.solution.1_htrfmv.png)

图表顶部是`unknown`类型，它可以接受所有其他类型。底部是`never`类型，没有其他类型可以分配给它，但`never`类型本身可以分配给任何其他类型。

在`never`和`unknown`类型之间是一个类型的宇宙。空对象类型`{}`在这个宇宙中有一个独特的位置。它不是表示空对象，如你可能想象的那样，而是实际上表示_任何不是`null`或`undefined`的东西_。

这意味着它可以接受许多其他类型：字符串、数字、布尔值、函数、符号和包含属性的对象。

以下所有都是有效的赋值：

```typescript
const coverArtist: {} = "Guy-Manuel De Homem-Christo";
const upcCode: {} = 724384260910;

const submit = (homework: {}) => console.log(homework);
submit("Oh Yeah");
```

然而，尝试用`null`或`undefined`调用`submit`将导致TypeScript错误：

```ts twoslash
// @errors: 2345
const submit = (homework: {}) => console.log(homework);
// ---cut---
submit(null);
```

这可能感觉有点奇怪。但当你记住TypeScript的对象是_开放的_时，它是有意义的。想象一下，我们的成功函数实际上接受了一个包含`message`的对象。如果我们传递一个多余的属性，TypeScript会很高兴：

```tsx
const success = (response: { message: string }) =>
  console.log(response.message);

const messageWithExtra = { message: "Success!", extra: "This is extra" };

success(messageWithExtra); // 没有错误！
```

空对象实际上是"最开放"的对象。字符串、数字、布尔值在JavaScript中都可以被视为对象。它们都有属性和方法。所以TypeScript很乐意将它们分配给空对象类型。

JavaScript中唯一没有属性的是`null`和`undefined`。尝试访问其中任何一个的属性都会导致运行时错误。所以，它们不符合TypeScript中对象的定义。

考虑到这一点，空对象类型`{}`是表示任何不是`null`或`undefined`的东西的相当优雅的解决方案。

## 类型世界和值世界

在大多数情况下，TypeScript可以分为两个语法空间：类型世界和值世界。这两个世界可以在同一行代码中并存：

```tsx
const myNumber: number = 42;
//    ^^^^^^^^  ^^^^^^   ^^
//    值        类型     值
```

这可能令人困惑，特别是因为TypeScript喜欢在两个世界中重用相同的关键字：

```tsx
if (typeof key === "string" && (key as keyof typeof obj)) {
  //^^^^^^^^^^^^^^^^^^^^^^          ^^^^^^^^^^^^^^^^^^^
  //值                              类型
}
```

但TypeScript非常严格地对待这个边界。例如，你不能在值世界中使用类型：

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

如你所见，`Album`在值世界中甚至不存在，所以当我们尝试将其用作值时，TypeScript会显示错误。

另一个常见的例子是尝试直接将值传递给类型：

```ts twoslash
// @errors: 2749
const processAlbum = (album: Album) => console.log(album);

// ---cut---
type Album = ReturnType<processAlbum>;
```

在这种情况下，TypeScript建议使用`typeof processAlbum`而不是`processAlbum`来修复错误。

这些边界非常清晰 - 除了少数情况。有些实体可以同时存在于类型和值世界中。

### 类

考虑这个使用在构造函数中声明属性的快捷方式的`Song`类：

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

我们可以使用`Song`类作为类型，例如为函数的参数添加类型：

```tsx
const playSong = (song: Song) =>
  console.log(`Playing ${song.title} by ${song.artist}`);
```

这个类型指的是`Song`类的_实例_，而不是类本身：

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

在这种情况下，当我们尝试将`Song`类本身传递给`playSong`函数时，TypeScript会显示错误。这是因为`Song`是一个类，而不是类的实例。

所以，类同时存在于类型和值世界中，当用作类型时，表示类的实例。

### 枚举

枚举也可以跨越世界。

考虑这个`AlbumStatus`枚举，以及一个确定是否有折扣的函数：

```tsx
enum AlbumStatus {
  NewRelease = 0,
  OnSale = 1,
  StaffPick = 2,
  Clearance = 3,
}

function logAlbumStatus(status: AlbumStatus) {
  if (status === AlbumStatus.NewRelease) {
    console.log("No discount available.");
  } else {
    console.log("Discounted price available.");
  }
}
```

你可以使用`typeof AlbumStatus`来引用枚举本身的整个结构：

```typescript
function logAlbumStatus(status: typeof AlbumStatus) {
  // ...实现
}
```

但然后你需要传入一个结构
