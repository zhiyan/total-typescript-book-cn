import { defineConfig } from "vitepress";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Total Typescript Book 中文版",
  description: "Total Typescript Book",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "中文", link: "/chapters/01-setup-typescript" },
      { text: "English", link: "/chapters-en/01-setup-typescript" },
    ],

    sidebar: {
      "/chapters/": [
        {
          text: "章节",
          items: [
            {
              text: "01. 设置 TypeScript",
              link: "/chapters/01-setup-typescript",
            },
            { text: "02. IDE", link: "/chapters/02-ide-superpowers" },
            {
              text: "03. 融入开发流程",
              link: "/chapters/03-typescript-in-the-development-pipeline",
            },
            {
              text: "04. 基本类型和类型注解",
              link: "/chapters/04-essential-types-and-annotations",
            },
            {
              text: "05. 联合类型、字面量类型和类型收窄",
              link: "/chapters/05-unions-literals-and-narrowing",
            },
            { text: "06. 对象", link: "/chapters/06-objects" },
            { text: "07. 可变性", link: "/chapters/07-mutability" },
            { text: "08. 类", link: "/chapters/08-classes" },
            {
              text: "09. TypeScript 特有功能",
              link: "/chapters/09-typescript-only-features",
            },
            { text: "10. 派生类型", link: "/chapters/10-deriving-types" },
            {
              text: "11. 类型注解和类型断言",
              link: "/chapters/11-annotations-and-assertions",
            },
            { text: "12. ts的怪异部分", link: "/chapters/12-the-weird-parts" },
            {
              text: "13. 模块、脚本和声明文件",
              link: "/chapters/13-modules-scripts-declaration-files",
            },
            {
              text: "14. 配置 TypeScript",
              link: "/chapters/14-configuring-typescript",
            },
            {
              text: "15. 设计你的类型",
              link: "/chapters/15-designing-your-types",
            },
            { text: "16. utils 文件夹", link: "/chapters/16-the-utils-folder" },
          ],
        },
      ],
      "/chapters-en/": [
        {
          text: "Chapters",
          items: [
            {
              text: "01. Setup TypeScript",
              link: "/chapters-en/01-setup-typescript",
            },
            {
              text: "02. IDE Superpowers",
              link: "/chapters-en/02-ide-superpowers",
            },
            {
              text: "03. TypeScript in the Development Pipeline",
              link: "/chapters-en/03-typescript-in-the-development-pipeline",
            },
            {
              text: "04. Essential Types and Annotations",
              link: "/chapters-en/04-essential-types-and-annotations",
            },
            {
              text: "05. Unions, Literals, and Narrowing",
              link: "/chapters-en/05-unions-literals-and-narrowing",
            },
            { text: "06. Objects", link: "/chapters-en/06-objects" },
            { text: "07. Mutability", link: "/chapters-en/07-mutability" },
            { text: "08. Classes", link: "/chapters-en/08-classes" },
            {
              text: "09. TypeScript-Only Features",
              link: "/chapters-en/09-typescript-only-features",
            },
            {
              text: "10. Deriving Types",
              link: "/chapters-en/10-deriving-types",
            },
            {
              text: "11. Annotations and Assertions",
              link: "/chapters-en/11-annotations-and-assertions",
            },
            {
              text: "12. The Weird Parts",
              link: "/chapters-en/12-the-weird-parts",
            },
            {
              text: "13. Modules, Scripts, and Declaration Files",
              link: "/chapters-en/13-modules-scripts-declaration-files",
            },
            {
              text: "14. Configuring TypeScript",
              link: "/chapters-en/14-configuring-typescript",
            },
            {
              text: "15. Designing Your Types",
              link: "/chapters-en/15-designing-your-types",
            },
            {
              text: "16. The Utils Folder",
              link: "/chapters-en/16-the-utils-folder",
            },
          ],
        },
      ],
    },

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/zhiyan/total-typescript-book-cn",
      },
    ],
  },

  markdown: {
    // @ts-ignore
    codeTransformers: [transformerTwoslash()],
    // Explicitly load these languages for types hightlighting
    // @ts-ignore
    languages: ["js", "jsx", "ts", "tsx"],
  },
});
