import { HOST_NAME } from "../../config";

export const navbar = [
  { text: "博客", link: "/", icon: "IconHome" },

  {
    text: "VS Code For Web 深入浅出",
    icon: "IconDocument",
    link: "/docs/vscode-for-web/0.introductory",
  },

  {
    text: "Leetcode 题解",
    link: "https://realDuang.github.io/leetcode-in-javascript/",
  },

  { text: "留言板", link: "/docs/message-board/", icon: "IconChat" },
  {
    text: "关于我",
    link: "/docs/about/",
    icon: "IconCollaborate",
  },
  { text: "时间轴", link: "/timeline.html", icon: "IconTimePlot" },
  {
    text: "订阅",
    link: `${HOST_NAME}/feed.json`,
    icon: "IconRss",
  },
];
