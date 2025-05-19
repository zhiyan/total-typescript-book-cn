类是JavaScript的一个特性，帮助你将数据和行为封装到一个单一单元中。它们是面向对象编程的基本部分，用于创建具有属性和方法的对象。

你可以使用`class`关键字定义一个类，然后使用`new`关键字创建该类的实例。TypeScript为类添加了静态类型检查层，这可以帮助你捕获错误并在代码中强制结构。

让我们从头开始构建一个类，看看它是如何工作的。

## 创建类

要创建一个类，你使用`class`关键字后跟类的名称。与类型和接口类似，约定是使用PascalCase命名，这意味着名称中每个单词的首字母都大写。

我们将开始创建`Album`类，方式类似于创建类型或接口：

```ts twoslash
// @errors: 2564
class Album {
  title: string;
  artist: string;
  releaseYear: number;
}
```

此时，尽管它看起来像一个类型或接口，TypeScript对类中的每个属性都给出了错误。
我们如何修复这个问题？

### 添加构造函数

为了修复这些错误，我们需要向类添加一个`constructor`。`constructor`是一个特殊的方法，在创建类的新实例时运行。这是你可以设置对象初始状态的地方。

首先，我们将添加一个构造函数，为`Album`类的属性分配值：

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

现在，当我们创建`Album`类的新实例时，我们可以访问我们在构造函数中设置的属性和值：

```typescript
const loopFindingJazzRecords = new Album();

console.log(loopFindingJazzRecords.title); // 输出: Loop Finding Jazz Records
```

`new`关键字创建`Album`类的新实例，构造函数设置我们类属性的初始值。在这种情况下，因为属性是硬编码的，`Album`类的每个实例都将具有相同的值。

#### 你并不总是需要为类属性添加类型

正如我们将看到的，TypeScript可以对类进行一些非常智能的推断。它能够从我们在构造函数中分配的地方推断属性的类型，所以我们实际上可以删除一些类型注解：

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

然而，在类体中指定类型是很常见的，因为它们作为类的文档形式，可以快速阅读。

### 向构造函数添加参数

我们可以使用构造函数为类声明参数。这允许我们在创建类的新实例时传入值。

更新构造函数以接受包含`Album`类属性的`opts`参数：

```typescript
// 在Album类内部
constructor(opts: { title: string; artist: string; releaseYear: number }) {
 // ...
}
```

然后在构造函数的主体内，我们将`this.title`、`this.artist`和`this.releaseYear`分配给`opts`参数的值。

```typescript
// 在Album类内部
constructor(opts: { title: string; artist: string; releaseYear: number }) {
  this.title = opts.title;
  this.artist = opts.artist;
  this.releaseYear = opts.releaseYear;
}
```

`this`关键字指的是类的实例，用于访问类的属性和方法。

现在，当我们创建`Album`类的新实例时，我们可以传递一个包含我们想要设置的属性的对象。

```typescript
const loopFindingJazzRecords = new Album({
  title: "Loop Finding Jazz Records",
  artist: "Jan Jelinek",
  releaseYear: 2001,
});

console.log(loopFindingJazzRecords.title); // 输出: Loop Finding Jazz Records
```

### 使用类作为类型

TypeScript中类的一个有趣特性是它们可以用作变量和函数参数的类型。语法类似于你使用任何其他类型或接口的方式。

在这种情况下，我们将使用`Album`类为`printAlbumInfo`函数的`album`参数添加类型：

```typescript
function printAlbumInfo(album: Album) {
  console.log(
    `${album.title} by ${album.artist}, released in ${album.releaseYear}.`,
  );
}
```

然后我们可以调用函数并传入`Album`类的实例：

```typescript
printAlbumInfo(sixtyNineLoveSongsAlbum);

// 输出: 69 Love Songs by The Magnetic Fields, released in 1999.
```

虽然可以使用类作为类型，但要求类实现特定接口是一种更常见的模式。

## 类中的属性

现在我们已经看到了如何创建一个类并创建它的新实例，让我们更仔细地看看属性是如何工作的。

### 类属性初始化器

你可以直接在类体中为属性设置默认值。这些被称为类属性初始化器。

```typescript
class Album {
  title = "Unknown Album";
  artist = "Unknown Artist";
  releaseYear = 0;
}
```

你可以将它们与类型注解结合使用：

```typescript
class Album {
  title: string = "Unknown Album";
  artist: string = "Unknown Artist";
  releaseYear: number = 0;
}
```

重要的是，类属性初始化器在调用构造函数_之前_解析。这意味着你可以通过在构造函数中分配不同的值来覆盖默认值：

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

### `readonly`类属性

正如我们在类型和接口中看到的，`readonly`关键字可以用来使属性不可变。这意味着一旦设置了属性，就不能更改它：

```typescript
class Album {
  readonly title: string;
  readonly artist: string;
  readonly releaseYear: number;
}
```

### 可选类属性

我们也可以像对象一样标记属性为可选，使用`?:`注解：

```typescript
class Album {
  title?: string;
  artist?: string;
  releaseYear?: number;
}
```

从上面没有错误可以看出，这也意味着它们不需要在构造函数中设置。

### `public`和`private`属性

`public`和`private`关键字用于控制类属性的可见性和可访问性。

默认情况下，属性是`public`的，这意味着它们可以从类外部访问。

如果我们想限制对某些属性的访问，我们可以将它们标记为`private`。这意味着它们只能从类本身内部访问。

例如，假设我们想向专辑类添加一个只在类内部使用的`rating`属性：

```typescript
class Album {
  private rating = 0;
}
```

现在，如果我们尝试从类外部访问`rating`属性，TypeScript会给我们一个错误：

```ts twoslash
// @errors: 2341
class Album {
  private rating = 0;
}

const loopFindingJazzRecords = new Album();
// ---cut---
console.log(loopFindingJazzRecords.rating);
```

然而，这实际上并不能阻止它在运行时被访问 - `private`只是一个编译时注解。你可以使用`@ts-ignore`（我们稍后会看到）来抑制错误，仍然可以访问该属性：

```typescript
// @ts-ignore
console.log(loopFindingJazzRecords.rating); // 输出: 0
```

#### 运行时私有属性

要在运行时获得相同的行为，你也可以使用`#`前缀将属性标记为私有：

```typescript
class Album {
  #rating = 0;
}
```

`#`语法的行为与`private`相同，但它是ECMAScript标准的一个较新特性。这意味着它可以在JavaScript和TypeScript中使用。

尝试从类外部访问带有`#`前缀的属性将导致语法错误：

```ts twoslash
// @errors: 18013
class Album {
  #rating = 0;
}

const loopFindingJazzRecords = new Album();
// ---cut---
console.log(loopFindingJazzRecords.#rating); // 语法错误
```

尝试通过动态字符串访问它将返回`undefined` - 并且仍然会给出TypeScript错误。

```ts twoslash
// @errors: 7053
class Album {
  #rating = 0;
}

const loopFindingJazzRecords = new Album();

// ---cut---
console.log(loopFindingJazzRecords["#rating"]); // 输出: undefined
```

所以，如果你想确保一个属性真正是私有的，你应该使用`#`语法。

## 类方法

除了属性外，类还可以包含方法。这些函数帮助表达类的行为，可以用于与公共和私有属性交互。

### 实现类方法

让我们向`Album`类添加一个`printAlbumInfo`方法，它将记录专辑的标题、艺术家和发行年份。

有几种向类添加方法的技术。

第一种是遵循与构造函数相同的模式，直接将方法添加到类体中：

```typescript
// 在Album类内部
printAlbumInfo() {
  console.log(`${this.title} by ${this.artist}, released in ${this.releaseYear}.`);
}
```

另一个选项是使用箭头函数定义方法：

```typescript
// 在Album类内部
printAlbumInfo = () => {
  console.log(
    `${this.title} by ${this.artist}, released in ${this.releaseYear}.`,
  );
};
```

一旦添加了`printAlbumInfo`方法，我们可以调用它来记录专辑的信息：

```typescript
loopFindingJazzRecords.printAlbumInfo();

// 输出: Loop Finding Jazz Records by Jan Jelinek, released in 2001.
```

#### 箭头函数还是类方法？

箭头函数和类方法在行为上确实有所不同。区别在于`this`的处理方式。

这是运行时JavaScript行为，所以略微超出了本书的范围。但为了有所帮助，这里有一个例子：

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

在`arrow`方法中，`this`绑定到定义它的类的实例。在`method`方法中，`this`绑定到调用它的对象。

这在使用类时可能是一个小陷阱，无论是在JavaScript还是TypeScript中。

## 类继承

类似于我们可以扩展类型和接口，我们也可以在TypeScript中扩展类。这允许你创建可以相互继承属性和方法的类层次结构，使你的代码更有组织性和可重用性。

对于这个例子，我们将回到我们的基本`Album`类，它将作为我们的基类：

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
      `${this.title} by ${this.artist}, released in ${this.releaseYear}.`,
    );
  }
}
```

目标是创建一个扩展`Album`类并添加`bonusTracks`属性的`SpecialEditionAlbum`类。

### 扩展类

第一步是使用`extends`关键字创建`SpecialEditionAlbum`类：

```typescript
class SpecialEditionAlbum extends Album {}
```

一旦添加了`extends`关键字，添加到`SpecialEditionAlbum`类的任何新属性或方法都将是对它从`Album`类继承的内容的补充。例如，我们可以向`SpecialEditionAlbum`类添加一个`bonusTracks`属性：

```typescript
class SpecialEditionAlbum extends Album {
  bonusTracks: string[];
}
```

接下来，我们需要添加一个包含`Album`类所有属性以及`bonusTracks`属性的构造函数。关于扩展类时的构造函数，有几点重要的事情需要注意。

首先，构造函数的参数应该与父类中使用的形状匹配。在这种情况下，那是一个带有`Album`类属性以及新的`bonusTracks`属性的`opts`对象。

其次，我们需要包含对`super()`的调用。这是一个特殊的方法，它调用父类的构造函数并设置它定义的属性。这对于确保基本属性正确初始化至关重要。我们将把`opts`传递给`super()`方法，然后设置`bonusTracks`属性：

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

现在我们已经设置了`SpecialEditionAlbum`类，我们可以创建一个新实例，类似于我们对`Album`类的方式：

```typescript
const plasticOnoBandSpecialEdition = new SpecialEditionAlbum({
  title: "Plastic Ono Band",
  artist: "John Lennon",
  releaseYear: 2000,
  bonusTracks: ["Power to the People", "Do the Oz"],
});
```

这种模式可以用来向`SpecialEditionAlbum`类添加更多的方法、属性和行为，同时仍然保持`Album`类的属性和方法。

### `protected`属性

除了`public`和`private`，还有第三个可见性修饰符叫做`protected`。这类似于`private`，但它允许从扩展该类的类中访问该属性。

例如，如果我们想让`Album`类的`title`属性成为`protected`，我们可以这样做：

```typescript
class Album {
  protected title: string;
  // ...
}
```

现在，`title`属性可以从`SpecialEditionAlbum`类内部访问，但不能从类外部访问。

### 使用`override`安全覆盖

如果你尝试在子类中覆盖方法，扩展类时可能会遇到麻烦。假设我们的`Album`类实现了一个`displayInfo`方法：

```typescript
class Album {
  // ...
  displayInfo() {
    console.log(
      `${this.title} by ${this.artist}, released in ${this.releaseYear}.`,
    );
  }
}
```

而我们的`SpecialEditionAlbum`类也实现了一个`displayInfo`方法：

```typescript
class SpecialEditionAlbum extends Album {
  // ...
  displayInfo() {
    console.log(
      `${this.title} by ${this.artist}, released in ${this.releaseYear}.`,
    );
    console.log(`Bonus tracks: ${this.bonusTracks.join(", ")}`);
  }
}
```

这覆盖了`Album`类的`displayInfo`方法，为奖励曲目添加了额外的日志。

但是，如果我们将`Album`中的`displayInfo`方法更改为`displayAlbumInfo`会发生什么？`SpecialEditionAlbum`不会自动更新，其覆盖将不再有效。

为了防止这种情况，你可以在子类中使用`override`关键字，表明你有意覆盖父类中的方法：

```typescript
class SpecialEditionAlbum extends Album {
  // ...
  override displayInfo() {
    console.log(
      `${this.title} by ${this.artist}, released in ${this.releaseYear}.`,
    );
    console.log(`Bonus tracks: ${this.bonusTracks.join(", ")}`);
  }
}
```

现在，如果`Album`类中的`displayInfo`方法被更改，TypeScript将在`SpecialEditionAlbum`类中给出一个错误，让你知道该方法不再被覆盖。

你也可以通过设置`noImplicitOverride`为`true`来强制执行这一点
