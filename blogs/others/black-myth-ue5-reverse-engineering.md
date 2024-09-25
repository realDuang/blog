---
title: Unreal Engine 5 逆向工程与游戏开发 - 黑神话悟空
date: 2024-09-25 17:21:22
categories:
  - 其他
tags:
  - 逆向工程
  - 游戏开发
---

![20240925152320](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240925152320.png)

---

:::tip
本文将以 **黑神话：悟空** 为例，介绍如何对基于虚幻 5 引擎的游戏进行逆向工程。包括游戏解包、文件导出、资产制作、替换和打包，以及 mod 的安装和运行参数设置。
:::

<!-- more -->

## 获取游戏解包密码 AES

首先，我们需要获取黑神话悟空的解包密码 AES，这是进行游戏文件解包的必要步骤。

**步骤:**

1. **找到游戏安装执行目录**: 通常位于 steam 游戏安装目录的 `BlackMythWukong\b1\Binaries\Win64`。
2. **搜索相关工具**: 常见的工具有 `AES_finder` 等。
3. **查找密码**: 使用特定脚本或工具从游戏执行文件中，在该目录下运行并提取 key。

![https://www.bilibili.com/video/BV1VpsWekEPa](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240925133342.png)

---

## 获取 Mappings.usmap 文件

为了准确解包和解析游戏数据，需要从游戏目录中获取 `Mappings.usmap` 文件。

**步骤:**

1. **使用 DLL_injector 工具**: 通过 DLL 注入工具获取游戏内存中的 `Mappings.usmap` 文件。
2. **导入 UE Mapping Dumper**: 这是一个将为 UE 生成映射文件的项目，几乎所有未来的 UE5 游戏都是必需的，以便从游戏文件中读取数据。去 [Github](https://github.com/TheNaeem/UnrealMappingsDumper) 上下载。
3. **运行游戏**: 运行游戏后，打开 `DLL injector`, 加载 `UE Mapping Dumper`并等待 `Mappings.usmap` 文件生成。

![https://www.bilibili.com/video/BV1VpsWekEPa](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240925134329.png)

---

## 导出文件到 FModel

`FModel` 是一个强大的工具，可以帮助我们对 UE4/5 的资源文件进行逆向分析。

**解包工具**:

- FModel: [https://github.com/4sval/FModel/releases](https://github.com/4sval/FModel/releases)
- UE Viewer: [https://www.gildor.org/en/projects/umodel](https://www.gildor.org/en/projects/umodel)

**步骤:**

1. **下载并安装 FModel**: [FModel GitHub](https://github.com/FModel/FModel)
2. **加载 Mappings.usmap 文件**:
   - 打开 FModel，选择 `Mappings` 选项卡。
   - 导入从游戏解包得到的 `Mappings.usmap` 文件。

![https://www.bilibili.com/video/BV1VpsWekEPa](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240925134601.png)

3. **分析资源文件**: 选择需要逆向的资源 pak 文件进行分析和导出。黑神话悟空的 pak 文件使用了 AES 加密，需要提供正确的 AES 密钥。填入第一步中获取到的 AES 密钥即可。

![https://www.bilibili.com/video/BV1VpsWekEPa](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240925134734.png)

**FYI**: pak 文件大致对应的资源类型:

![https://www.bilibili.com/video/BV1VpsWekEPa](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240925135228.png)

至此，我们已经成功导出了游戏资源文件，逆向工程结束，接下来可以就开始为黑神话悟空制作资产了。

---

## 使用三维软件制作资产

一旦资源文件导出完毕，我们需要使用三维软件进行资产的制作。

**常用软件:**

- [Blender](https://www.blender.org/)
- 3ds Max
- 3D Viewer
- Maya

**步骤:**

1. **导入资源文件**: 通过 FModel 导出的模型文件可以导入到三维软件中进行编辑。

![https://www.bilibili.com/video/BV1VpsWekEPa](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/image-1.png)

![https://www.bilibili.com/video/BV1VpsWekEPa](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/image-3.png)

![https://www.bilibili.com/video/BV1VpsWekEPa](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/image-2.png)

1. **导出资产**: 以 Unreal Engine 5 兼容的格式导出模型，如 `.fbx`, `.psk`(For Blender) 格式。

2. **制作新资产**: 根据需要制作或修改模型。

![https://www.bilibili.com/video/BV1VpsWekEPa](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240925150459.png)

![https://www.bilibili.com/video/BV1VpsWekEPa](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/image-5.png)

关于纹理、贴图和材质的制作，可以使用 Photoshop 或 Substance Painter 等软件进行。与 Maya 或 Blender 等三维软件配合使用，可以制作出高质量的游戏资产。这里就不展开细说了。

---

## 使用 UE5 引擎替换和打包资产

下一步是使用 UE5 引擎替换并打包我们制作的资产。

**步骤:**

1. **打开 UE5 项目**:
   - 打开 Unreal Engine 5。
   - 创建或打开一个新项目。
2. **导入新资产**:
   - 将 `.fbx` 文件导入到 UE5。
   - 替换原有模型或添加新模型到 UE 中。
     ![https://www.bilibili.com/video/BV1VpsWekEPa](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/image-6.png)
3. **打包项目**:
   - 在 UE5 中选择 `File > Package Project`。
   - 选择目标平台（Windows）并开始打包。
4. **生成 mod 文件**:
   - 选择打包 target 为 pak 文件。
   - 将打包生成的文件移动到游戏 mod 目录中。

---

## 7. mod 的安装和运行参数

最后，简单介绍一下安装和运行 mod 的步骤。

1. 先给游戏本体注入 Mod Loader: [RE-UE4SS](https://www.nexusmods.com/blackmythwukong/mods/19)
2. **复制打包文件**: 将 UE5 打包的文件复制到游戏 mod 目录中。
3. **配置运行参数**: 根据需要修改游戏启动选项以加载 mod。

```markdown
BlackMythWukong\b1\Binaries\Win64
dwmapi.dll (124,928)
ue4ss
UE4SS-settings.ini
UE4SS.dll
VTableLayout.ini
Mods
```

---

## 彩蛋 -- 解包发现的有趣数据

![1629427721289528](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/1629427721289528.gif)

翻滚的无敌帧是 `0.3s`, `0.34s`, `0.365s` (连续翻滚的动画效果与无敌时间都是不同的)，其中出现完美闪避(闪避时原地留下残影)的窗口是 `0.1s`。

大圣的攻击动作共分为 5 段，前四段收招后进行下一段连击前可以进行识破。

大圣出棍动作维持时间（以棍形态为例）是 `0.8s`，`1.1s`，`1.0s`，`1.4s`（终结棍 由于不能接识破，不计入动作），其中判断连击的窗口是 `0.3s`。

因此，要打出识破，必须要提前进行某一段攻击行为，并在连击窗口期间对手攻击生效，此时打出重击进行识破。可以注意到，1，2，3 段动作由于动作持续时间较短，更容易打出识破。

![https://www.bilibili.com/video/BV1ZUpue6EXM](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/image-7.png)

[参考来源](https://www.bilibili.com/video/BV1ZUpue6EXM)

---

## 8. 总结

通过此教程，我们已经学习了针对黑神话悟空的解包工具的使用、文件提取、三维资产制作、替换和打包、以及 mod 的安装和运行参数设置。这只是一个基础教程，但其中已经包含了游戏资产开发的所有步骤与流程，感兴趣的同学可以探索更多高级功能和优化流程。

![20240925152424](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240925152424.png)

## 参考

[黑神话·悟空 mod 制作教学](https://www.bilibili.com/video/BV1VpsWekEPa)

[N 网](https://www.nexusmods.com/blackmythwukong)
