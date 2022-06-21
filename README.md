# dumi & lerna 实现组件分包

> <font size='2'> 此文档主要是对使用 dumi 开发组件及文档有一定经验的同学起到帮助作用</font>

## 概念:单一代码库（monorepos） vs 多代码库（multirepos）

在使用[**_dumi_**](https://d.umijs.org/zh-CN/)开发组件过程中，通常我们会使用一个代码库（git 仓库），开发其他每个毫无关联的组件时，通常的做法也是再初始化一个 git 仓库。但是如果这两个组件 A、B 存在 B 依赖于 A 组件的情况时，如果组件 A 版本更新了，那么我们自然要同步去更新 B，这样我们先打包发布组件 A，然后再去组件 B 仓库里完成更新操作。这种模式（<u>多代码库 multirepos</u>）开发起来就会非常麻烦。

如果能在一个仓库内同时管理 A、B 组件，同时管理好组件之间的依赖，并且各个组件之间又能够做到被独立引入的时候，单纯仅仅依靠 dumi 是无法实现的。使用 dumi 官方模板示例将多个组件同时打包出来的结果更像是一个组件库，无法做到组件的单独引入，必须引入整个组件库。

此时如果考虑在一个 git 仓库内维护多个不同组件，且多个不同组件能够独立发布，被单独安装，即这些项目虽然有可能是相关的，但通常在逻辑上是独立的，甚至由不同的团队维护。这种只有一个版本控制仓库包含多个组件代码的仓库就称为：<u>单一代码库（monorepos）</u>。常见 Babel/React/VUE/UMI 就是使用这种模式。

---

## lerna

目前实现单一代码库的工具有比较多，这里就只介绍[**_lerna_**](https://github.com/lerna/lerna)。

一个 lerna 项目结构是什么？如下：

```
my-lerna-repo/
  lerna.json
  package.json
  packages/
    package-1/
      src
      package.json
    package-2/
      src
      package.json
```

可以看到，一个项目中根目录下有一个 package.json 文件，同时根目录下还有一个 packages（通常）， packages 目录下就是各个单独的包，这些包就是我们需要开发的组件所在的位置，每个包下面都有自己的 package.json 文件。根目录下的 lerna.json 文件就是 lerna 的配置文件，通常如下：

```json
{
  "version": "1.1.3",
  "npmClient": "npm",
  "command": {
    "publish": {
      "ignoreChanges": ["ignored-file", "*.md"],
      "message": "chore(release): publish",
      "registry": "https://npm.pkg.github.com"
    },
    "bootstrap": {
      "ignore": "component-*",
      "npmClientArgs": ["--no-package-lock"]
    }
  },
  "packages": ["packages/*"]
}
```

- version: 当前库的版本。
- npmClient: 指定特定客户端来运行命令的选项（还可以根据每个命令指定）。如果想用 yarn 运行所有的命令，就把这个值修改为"yarn"。默认是 “npm”。
- command.publish.ignoreChanges: 全局数组，里面指定文件的改动将不会包含在 lerna changed/\* publish 中。使用这个是为了阻止一些对不必要的修改进行发布，例如修改 REANME.md 。
- command.publish.message: 当发布版本时自定义提交信息。
- command.publish.registry: 使用这个设置自动发布源，如果需要认证，必须要先进行认证。默认是 npmjs.org 仓库
- command.bootstrap.ignore: 全局数组，里面指定的内容，当运行 lerna bootstrap 命令时，将不会进行关联。
- command.bootstrap.npmClientArgs: 一组参数的全局数组，在运行 lerna bootstrap 命令时，直接传递给 npm install 命令的参数。
- command.bootstrap.scope: 一个全局数组，用于限制运行 lerna bootstrap 命令时将引导哪些包。
- packages: 用作包的位置的全局数组，可以写成示例模式，也可以手动指定，**<u>这样 lerna 就会根据数组里面包的顺序来打包发布，因为很可能有的包依赖于另一个包，被依赖的包必须先打包</u>**。

## 怎么做

### 初始化

使用 dumi 初始化项目后，在项目根目录下执行

```sh
$ npx lerna init
```

> **leran 所在项目必须使用 git 管理**

这将会创建一个 lerna.json 配置文件和一个 packages 文件夹，然后我们删除根目录下的 src 文件夹，然后在 packages 文件夹下面创建各个不同的组件包。同时根目录下 package.json 里面会多一个开发依赖：

```json
  "devDependencies": {
    "lerna": "^5.1.4"
  }
```

> 注意 lerna init 命令可以携携带参数 lerna init --independent。在 independent 模式下运行时，需将 lerna.json 文件中的 version 字段的值设置为 independent 。

Independent 模式的 Lerna 项目允许维护者提升每个包各自的版本。每次你发布，你将会受到针对每个已更改包的提示，以指定它是补丁（patch）、小更改（minor）、大更改（major ）还是自定义（custom）更改。

### 安装依赖 lerna bootstrap

此命令会为 packages 内部的所有包安装依赖并连接所有的交叉依赖。**根目录下的依赖需要独立安装**。

> 默认会在 packages 每个包下面安装 node_modules。但是 lerna 还可以配置[Yarn Workspaces](https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-workspaces-install-phase-1.md)，这种情况下只会在项目根目录下安装 node_modules，即 packages 目录下的所有依赖都会安装到外层根目录下。Yarn Workspaces 模式需要进行如下设置:

- lerna.json

```json
    {
        ...
        "npmClient": "yarn",
        "useWorkspaces": true
    }
```

- 根目录下 package.json

```json
    {
        ...,
        "workspaces": ["packages/*"]
    }
```

### 清理依赖 lerna clean

删除所有包下的 node_modules，但是不会删除根目录下的 node_modules

---

至此，将 dumi 初始化的项目仓库改造就完成了。后续就是使用 dumi 正常开发项目，打包组件了。至于后续 leran 如何发布组件，可查看[leran 官网](https://github.com/lerna/lerna)。
