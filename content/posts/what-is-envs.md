---
author: Yang
date: "2024-12-09T22:26:55+08:00"
lastmod: "2024-12-10T00:09:36+08:00"
description: "我明明已经安装了Git，为什么还是显示“无法识别的命令”？"
title: "什么是环境变量"
summary: "环境变量是什么？为什么会有环境变量？我该不该修改它？怎么修改？"
tags: ["ELI5", "computer"]
categories: "computer"
# cover: 
#    image: "images/.jpg"
# draft: true
comments: true
hideMeta: false
searchHidden: false
ShowBreadCrumbs: true
ShowReadingTime: false
---

## 1. 环境变量是什么

环境变量是操作系统用来存储有关系统环境和用户信息的变量，这些信息通常包含系统配置、程序执行路径等内容。环境变量会影响操作系统及程序的行为。例如，它可以决定程序的执行路径、日志文件的存放位置等。环境变量的值通常由一组键值对组成，系统和应用程序可以通过读取这些变量来获取所需的配置信息。

## 2. 系统环境变量与用户环境变量

- **系统环境变量 (System Environment Variables)**:
  - 适用于所有用户，是在操作系统层级上配置的变量。
  - 只有管理员（或具有管理员权限的用户）可以修改。
  - 设置后，系统中的所有用户都可以访问这些变量。
  - 例如，Windows中的`TEMP`、`PATH`、`COMPUTERNAME`等。

- **用户环境变量 (User Environment Variables)**:
  - 仅适用于当前用户，即该变量仅对当前登录的用户有效。
  - 任何登录的用户可以修改自己的用户环境变量。
  - 例如，Windows中的`USERPROFILE`、`APPDATA`等。

## 3. 环境变量的作用

- **配置程序运行环境**：一些程序需要特定的环境配置才能正常运行。例如，设置Java的`JAVA_HOME`变量指向JDK的安装目录，使得程序能够找到Java编译器。
- **改变程序行为**：通过设置环境变量，用户可以控制程序的执行方式。比如，配置数据库的连接信息，控制程序的日志文件输出路径等。
- **提供系统信息**：一些环境变量会提供系统的一些基本信息，比如操作系统的版本、计算机的名称等。

## 4. `PATH` 变量详解

`PATH` 是最常见的环境变量之一，它决定了操作系统在执行命令时，搜索可执行文件的位置。每次在命令行中输入一个命令时，操作系统会按照 `PATH` 变量中列出的路径顺序，查找对应的可执行文件。这个变量在开发和运维中非常重要。

{{< alert class="info" >}}
**在CMD中输入命令后，Windows如何查找可执行文件？**

1. 首先会在CMD当前目录下搜索该程序，如果找到了该程序，便会启动。
2. 如果CMD目录下没有这个程序，则系统会进入到path环境变量保存的目录下去搜索，如果找到了则启动程序
3. 如果path中没有添加此程序的目录，那么此次的搜索结果就是没有找到此程序，便会报错：“'xxx' 不是内部或外部命令，也不是可运行的程序或批处理文件。”。
{{< /alert >}}

### 作用

- `PATH` 变量中的路径列表决定了操作系统在查找可执行程序时的搜索顺序。操作系统会依次在 `PATH` 中列出的目录中查找该命令对应的可执行文件。
- 通过修改 `PATH` 变量，用户可以方便地管理和使用不同目录下的程序，而无需在命令行中输入完整的路径。

### 例子

1. **Windows 中的 PATH 变量**

   假设 `PATH` 变量中包含以下路径：

   ```
   C:\Windows\System32;C:\Program Files\Java\jdk1.8.0_221\bin;C:\Users\YourUsername\Scripts
   ```

   当你在命令行中输入 `java` 命令时，Windows 会首先在 `C:\Windows\System32` 目录下查找是否有 `java.exe` 文件，如果没有，就继续查找 `C:\Program Files\Java\jdk1.8.0_221\bin` 和 `C:\Users\YourUsername\Scripts` 等目录，直到找到匹配的可执行文件。

2. **Linux / macOS 中的 PATH 变量**

   假设 `PATH` 变量中包含以下路径：

   ```
   /usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:/home/user/.local/bin
   ```

   当你在终端中输入命令时，Linux 或 macOS 会按顺序查找这些路径，直到找到与输入命令对应的可执行文件。

### 如何设置和修改 PATH 变量

- **Windows**:
  1. 打开“系统属性”（右键点击“我的电脑”或“此电脑”，选择“属性”）。
  2. 进入“高级系统设置”。
  3. 点击“环境变量”。
  4. 在“系统变量”或“用户变量”中，找到 `PATH` 变量，并进行修改。
  5. 将新路径追加到 `PATH` 变量中，每个路径用分号 `;` 分隔。

- **Linux/macOS**:
  1. 打开终端。
  2. 编辑 `.bashrc` 或 `.zshrc` 文件（根据所使用的 Shell 不同）。例如：

     ```bash
     nano ~/.bashrc
     ```

  3. 在文件末尾添加路径：

     ```bash
     export PATH=$PATH:/your/custom/path
     ```

  4. 保存文件并执行 `source ~/.bashrc` 或 `source ~/.zshrc` 来使修改生效。

### 举例说明

假设你安装了 Python 和 Git，并且它们的安装路径分别是：

- Python：`C:\Python39\`
- Git：`C:\Program Files\Git\cmd\`

你希望能够在命令行中直接输入 `python` 和 `git` 来执行它们，而不必输入完整路径。你可以将以下路径添加到 `PATH` 环境变量中：

```
C:\Python39\;C:\Program Files\Git\cmd\
```

修改后，你可以在命令行中直接输入 `python` 或 `git`，系统会根据 `PATH` 变量自动找到对应的可执行文件并运行。

## 5. 总结

- **环境变量**是操作系统和应用程序用来存储信息的一种方式，影响程序的行为和系统的运行。
- **系统环境变量**对所有用户有效，而 **用户环境变量**仅对当前用户有效。
- `PATH` 变量非常重要，它帮助操作系统确定命令的执行路径，通过修改它可以方便地管理和使用不同路径下的程序。
