module.exports = {
  title: '枫之谷',
  description: '这个人很懒，但还是想留下些什么东西。',
  dest: 'public',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
    ],
    [
      'meta',
      {
        name: 'viewport',
        content: 'width=device-width,initial-scale=1,user-scalable=no',
      },
    ],
  ],
  locales: {
    '/': {
      lang: 'zh-CN',
    },
  },
  theme: 'reco',
  themeConfig: {
    type: 'blog',
    logo: '/avatar.jpg',
    nav: [
      {
        text: 'Home',
        link: '/',
        icon: 'reco-home',
      },
      {
        text: '时光轴',
        link: '/timeline/',
        icon: 'reco-date',
      },
      {
        text: '订阅',
        link: 'https://zakum.cn/rss.xml',
        icon: 'reco-rss',
      },
      {
        text: '关于我',
        link: '/about/',
        icon: 'reco-account',
      },
      {
        text: 'GitHub',
        link: 'https://github.com/realDuang/blog',
        icon: 'reco-github',
      },
    ],
    subSidebar: 'auto',
    blogConfig: {
      category: {
        location: 2,
        text: '分类',
      },
      tag: {
        location: 3,
        text: '标签',
      },
      socialLinks: [
        // 信息栏展示社交信息
        { icon: 'reco-github', link: 'https://github.com/realDuang' },
        { icon: 'reco-zhihu', link: 'https://www.zhihu.com/people/realDuang' },
        { icon: 'reco-qq', link: 'http://wpa.qq.com/msgrd?v=3&uin=250407778&site=qq&menu=yes' },
        { icon: 'reco-mail', link: 'mailto:250407778@qq.com' },
        { icon: 'reco-facebook', link: 'https://www.facebook.com/kelekexiao' },
      ],
    },
    vssueConfig: {
      platform: 'github',
      owner: 'realDuang',
      repo: 'blog',
      clientId: 'c538ce05be000c1afab3',
      clientSecret: '7755987b5e4e3964ac1096dbb626858ac7b40cb0',
    },
    friendLink: [{ title: 'Leetcode In JavaScript', link: 'https://realDuang.github.io/leetcode-in-javascript/' }],
    // logo: '/logo.png',
    search: true,
    searchMaxSuggestions: 10,
    lastUpdated: 'Last Updated',
    author: 'Duang',
    authorAvatar: '/avatar.jpg',
    record: 'https://www.zakum.cn',
    cyberSecurityRecord: '粤ICP备20067728号',
    cyberSecurityLink: 'http://www.beian.gov.cn',
    startYear: '2016',
  },
  markdown: {
    lineNumbers: true,
  },

  plugins: [
    // 看板娘
    [
      '@vuepress-reco/vuepress-plugin-kan-ban-niang',
      {
        theme: ['z16'],
        clean: true,
        messages: {
          welcome: `欢迎来到枫之谷~`,
        }
      },
    ],
  ],
};
