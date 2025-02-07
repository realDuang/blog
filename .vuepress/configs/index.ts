import type { RecoThemeData } from "vuepress-theme-reco/lib/types";
import * as zhCnConfig from "./zh-cn";

export const themeConfig: RecoThemeData = {
  repo: "realDuang/blog",

  colorMode: "dark",
  primaryColor: "#366cf0",

  logo: "/avatar.jpg",
  author: "Duang",
  authorAvatar: "/avatar.jpg",

  catalogTitle: "导航条",

  socialLinks: [
    { icon: "IconZhihu", link: "https://www.zhihu.com/people/realDuang" },
    { icon: "IconEmail", link: "mailto:250407778@qq.com" },
  ],

  locales: {
    "/": {
      selectLanguageName: "简体中文",
      lastUpdatedText: "最后更新时间",
      navbar: zhCnConfig.navbar,
      series: zhCnConfig.series,
      commentConfig: zhCnConfig.commentConfig,
      catalogTitle: "页面导航",
      tip: "提示",
      info: "信息",
      warning: "警告",
      danger: "危险",
      details: "详情",
      editLinkText: "编辑当前页面",
      notFound: "哇哦，没有发现这个页面！",
      backToHome: "返回首页",
    },
  },
};
