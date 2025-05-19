import { defineConfig } from "vitepress";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Total Typescript Book 中文版",
  description: "Total Typescript Book",

  // 顶层 locales 配置
  locales: {
    root: {
      label: "简体中文",
      lang: "zh-CN",
    },
    en: {
      label: "English",
      lang: "en-US",
      link: "/en/", // 英文内容的根路径
    },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // 全局 nav，VitePress 会在此基础上添加语言切换器
    // nav: [
    //   { text: "中文", link: "/01-setup-typescript" },
    //   { text: "English", link: "/en/01-setup-typescript" },
    // ],

    // socialLinks 是全局的
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/zhiyan/total-typescript-book-cn",
      },
    ],

    sidebar: {
      "/": [
        {
          text: "章节",
          items: [
            {
              text: "01. 设置 TypeScript",
              link: "/01-setup-typescript",
            },
            { text: "02. IDE", link: "/02-ide-superpowers" },
            {
              text: "03. 融入开发流程",
              link: "/03-typescript-in-the-development-pipeline",
            },
            {
              text: "04. 基本类型和类型注解",
              link: "/04-essential-types-and-annotations",
            },
            {
              text: "05. 联合类型、字面量类型和类型收窄",
              link: "/05-unions-literals-and-narrowing",
            },
            { text: "06. 对象", link: "/06-objects" },
            { text: "07. 可变性", link: "/07-mutability" },
            { text: "08. 类", link: "/08-classes" },
            {
              text: "09. TypeScript 特有功能",
              link: "/09-typescript-only-features",
            },
            { text: "10. 派生类型", link: "/10-deriving-types" },
            {
              text: "11. 类型注解和类型断言",
              link: "/11-annotations-and-assertions",
            },
            {
              text: "12. ts的怪异部分",
              link: "/12-the-weird-parts",
            },
            {
              text: "13. 模块、脚本和声明文件",
              link: "/13-modules-scripts-declaration-files",
            },
            {
              text: "14. 配置 TypeScript",
              link: "/14-configuring-typescript",
            },
            {
              text: "15. 设计你的类型",
              link: "/15-designing-your-types",
            },
            {
              text: "16. utils 文件夹",
              link: "/16-the-utils-folder",
            },
          ],
        },
      ],
      "/en/": [
        {
          text: "Chapters",
          items: [
            {
              text: "01. Setup TypeScript",
              link: "/en/01-setup-typescript",
            },
            {
              text: "02. IDE Superpowers",
              link: "/en/02-ide-superpowers",
            },
            {
              text: "03. TypeScript in the Development Pipeline",
              link: "/en/03-typescript-in-the-development-pipeline",
            },
            {
              text: "04. Essential Types and Annotations",
              link: "/en/04-essential-types-and-annotations",
            },
            {
              text: "05. Unions, Literals, and Narrowing",
              link: "/en/05-unions-literals-and-narrowing",
            },
            { text: "06. Objects", link: "/en/06-objects" },
            { text: "07. Mutability", link: "/en/07-mutability" },
            { text: "08. Classes", link: "/en/08-classes" },
            {
              text: "09. TypeScript-Only Features",
              link: "/en/09-typescript-only-features",
            },
            {
              text: "10. Deriving Types",
              link: "/en/10-deriving-types",
            },
            {
              text: "11. Annotations and Assertions",
              link: "/en/11-annotations-and-assertions",
            },
            {
              text: "12. The Weird Parts",
              link: "/en/12-the-weird-parts",
            },
            {
              text: "13. Modules, Scripts, and Declaration Files",
              link: "/en/13-modules-scripts-declaration-files",
            },
            {
              text: "14. Configuring TypeScript",
              link: "/en/14-configuring-typescript",
            },
            {
              text: "15. Designing Your Types",
              link: "/en/15-designing-your-types",
            },
            {
              text: "16. The Utils Folder",
              link: "/en/16-the-utils-folder",
            },
          ],
        },
      ],
    },
  },

  markdown: {
    // @ts-ignore
    codeTransformers: [transformerTwoslash()],
    // Explicitly load these languages for types hightlighting
    // @ts-ignore
    languages: ["js", "jsx", "ts", "tsx"],
  },
});
