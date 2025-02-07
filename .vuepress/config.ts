import { defineUserConfig } from "vuepress";
import recoTheme from "vuepress-theme-reco";
import { viteBundler } from "@vuepress/bundler-vite";
import { feedPlugin } from "@vuepress/plugin-feed";
import { themeConfig } from "./configs";

export const HOST_NAME = "https://blog.realduang.com";

export default defineUserConfig({
  title: "枫之谷",
  description: "这个人很懒，但还是想留下些什么东西。",
  bundler: viteBundler({}),
  theme: recoTheme(themeConfig),
  plugins: [
    feedPlugin({
      rss: true,
      atom: true,
      json: true,
      hostname: HOST_NAME,
      devServer: true,
      devHostname: "http://localhost:8080",
    }),
  ],
});
