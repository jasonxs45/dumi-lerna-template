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

### 懒人初始化

```sh
rm -rf node_modules && npm install && npm run clean && npm run bootstrap
```

or

```sh
npm run initialize
```
