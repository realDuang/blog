import { defineUserConfig } from "vuepress";
import recoTheme from "vuepress-theme-reco";
import { viteBundler } from "@vuepress/bundler-vite";

export default defineUserConfig({
  title: "枫之谷",
  description: "这个人很懒，但还是想留下些什么东西。",
  bundler: viteBundler(),
  theme: recoTheme({
    repo: "realDuang/blog",

    colorMode: "dark",
    primaryColor: "#366cf0",
    style: "@vuepress-reco/style-default",

    logo: "/avatar.jpg",
    author: "Duang",
    authorAvatar: "/avatar.jpg",

    catalogTitle: "导航条",

    navbar: [
      { text: "Home", link: "/", icon: "Home" },
      { text: "时间轴", link: "/timeline.html", icon: "TimePlot" },
      {
        text: "订阅",
        link: "https://blog.realduang.com/rss.xml",
        icon: "Rss",
      },
      { text: "留言板", link: "/docs/message-board/", icon: "Chat" },
      {
        text: "更多",
        icon: "Friendship",
        children: [
          {
            text: "Leetcode In JavaScript",
            link: "https://realDuang.github.io/leetcode-in-javascript/",
          },
        ],
      },
      {
        text: "关于我",
        link: "/docs/about/",
        icon: "Collaborate",
      },
    ],

    commentConfig: {
      type: "waline",
      options: {
        serverURL: "https://waline-roan-gamma.vercel.app",
        hideComments: false
      },
    },
  }),
});
