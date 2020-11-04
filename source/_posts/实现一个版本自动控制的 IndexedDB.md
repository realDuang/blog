---
title: 实现一个版本自动控制的 IndexedDB
categories: JavaScript
tags: IndexedDB
abbrlink: 3d6
date: 2020-07-13 16:05:22
---

随着现代大型项目复杂度的提升，渲染一个 WEB 页面需要的数据越来越多，在多次打开并渲染的过程中，有许多数据都是重复并且不常更新的，因此这部分的数据需要通过浏览器缓存来缓解网络压力，同时提升页面打开速度。

<!-- more -->

## IndexedDB 的存储方案比较

在 IndexedDB 推出以前，浏览器数据的存储方案就已经有了一些实现，例如 cookie，localStorage 等等。

cookie 不用多说，每次都需要随着请求全部带给服务端，并且大小只有可怜的 4KB。cookie 用来做存储数据缓存必然会给网络请求带来更大的压力，因此在该种情况下不是一个合适的载体。

localStorage 作为一个 HTML5 标准，很适合用来做存储数据的本地缓存，并且它能够在不同的标签页之间共享数据，一些网站利用这个特点能够实现一些神奇的操作。它的存储限制比 cookie 要大，根据浏览器的实现不同，大部分浏览器至少支持 5MB - 50MB 的存储。但是，由于 localStorage 的实现与 cookie 类似，存储格式只能为 key-value, 并且 value 只能为 string 类型。因此需要存储复杂类型时，还必须得进行一次 JSON 的序列化转换。于此同时，localStorage 的读写是同步的，会阻塞主线程的执行，因此在存取复杂类型或大数据量的缓存数据时，localStorage 并不是一个很合适的选择。

为了解决 localStorage 存在的上述问题，W3C 提出了浏览器数据库 —— IndexedDB 标准。一个*无大小限制*的（一般只取决于硬盘容量）、*异步*的、*支持存储任意类型数据*的浏览器存储方案。

## IndexedDB 的基本概念

要学习 IndexedDB 的使用，首先得了解它的一些核心概念。

### 数据库版本

和所有数据库一样，IndexedDB 也有 Database 的概念。每个同源策略下，都可以有多个数据库。

由于 IndexedDB 存在于客户端，数据存储在浏览器中。因此开发人员不能直接访问它。因此 IndexedDB 有一个独特的 scheme 版本控制机制，引申出来数据库版本的概念。同一时间统一数据库只保留唯一且最新的版本，低于此版本的标签页会触发 upgradeneeded 事件升级版本库。修改数据库结构的操作（如增删表、索引等），只能通过升级数据库版本完成。

### ObjectStore

IndexedDB 用来存储数据集的单位是 ObjectStore，相当于关系型数据库的表，或是非关系型数据库的集合。

### 事务

事务相当于是一个原子操作，在一个事务中若出现报错，整个事务之中执行的所有功能都不会生效。从而使得数据库能够保证数据一致性，提升业务可靠性。

IndexedDB 的一大特点就是事务化，所有的数据操作都必须被包裹在事务之内执行。IndexedDB 的层级关系为：请求 -> 事务 -> 数据库，我们也可以通过这个关系链来进行错误处理的事件委托，从而集中错误捕获逻辑处理。

## IndexedDB API 的原生使用

IndexedDB 的 API 较为繁杂，由于并不是本文要讲的重点，在此不展开，对原生 API 感兴趣的可以参考一下 MDN 的文档：[https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)。

由于原生 API 的异步过程采用的是*监听回调机制*，在现代项目中使用起来不是很方便，一般来说推荐使用 Promise 的方式在外部封装一层，更能够贴合现代项目的使用场景。

## 建立版本自动控制的 IndexedDB

### 解决思路

从使用文档中可以知道，IDBFactory.open 方法用于打开一个数据库连接，它通过传入数据库名称以及版本号 version 两个参数，执行以下步骤，并在相应的时期触发指定回调的钩子。

> 1. 指定数据库已经存在时，等待 versionchange 操作完成。如果数据库已计划删除，那等着删除完成。
> 2. 如果已有数据库版本高于给定的 version，中止操作并返回 Error。
> 3. 如果已有数据库版本，且版本低于给定的 version，触发一个 versionchange 操作。
> 4. 如果数据库不存在，创建指定名称的数据库，将版本号设置为给定版本，如果没有给定版本号，则设置为 1。
> 5. 创建数据库连接。

从这里可以看出，这个方法兼具了创建数据库与建立数据库连接两个功能，这里与我们常用数据库的操作不太一致，因此使用起来会有些奇怪。

事实上，IndexedDB 的设计初衷及推荐用法是让我们在代码中硬编码 version 这个版本号，从而在触发的 versionchange 事件中根据版本号不同给出确定的响应。

```js
    const openRequest: IDBOpenDBRequest = this.dbFactory.open(this.dbName, version);

    openRequest.onupgradeneeded = (e) => {
        versionChangeCb(e);
        if (e.oldVersion < 1) {
            const objectStore = db.createObjectStore('test_objectStore');
        } else if(e.oldVersion === 1) {
            ...
        } else {
            ...
        }
    };
```

这与我们对熟悉的数据库认知是不一致的。有的时候，我们希望 IndexedDB 只像一个建立在浏览器本地的普通的数据库一样在项目执行时进行任意的增删表操作，并不想关心当前最新的版本号是多少，希望能自动控制版本。

而现有的IndexedDB能力对于这样的使用场景来说就变得非常艰难。因为在不知道当前最新版本号的情况下根本没法打开最新版本的数据库，并且，在不打开数据库得到数据库实例之前也没法获取当前数据库的最新版本！这就形成了一个死结，我们必须在某个本地位置记录下当前数据库的最新版本，以便下次打开表时能够直接读取到。

理清了处理思路，接下来就是具体的实现环节。

### 本地存取某个数据库的最新版本

首先我们需要解决的就是在本地存储版本号的问题。

本地存取的方式有很多，在之前也简单介绍过各种本地存储的解决方案。在这里，考虑到最大的兼容性，使用的是多使用一个版本固定不变的IndexedDB数据库。(这里使用 localStorage 等存储方案也同样合适)

```typescript
    private getDBLatestVersion(dbName: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            const openRequest: IDBOpenDBRequest = this.dbFactory.open('DBVersion', 1);
            openRequest.onerror = () => {
                reject(INDEXEDDB_ERROR.OPEN_FAILED);
            };

            openRequest.onsuccess = () => {
                const db = openRequest.result;
                const objectStore = db.transaction(['version'], 'readonly').objectStore('version');
                const request = objectStore.get(dbName);
                // 找不到说明应该是新建的数据库
                request.onerror = function () {
                    resolve(0);
                };
                request.onsuccess = function () {
                    if (request.result?.version) {
                        resolve(request.result.version);
                    } else {
                        resolve(0);
                    }
                };
            };

            openRequest.onupgradeneeded = () => {
                const db = openRequest.result;
                const objectStore = db.createObjectStore('version', {
                    keyPath: 'dbName',
                });
                objectStore.createIndex('dbName', 'dbName', { unique: true });
                objectStore.createIndex('version', 'version', { unique: false });
            };
        });
    }

    private updateDBLatestVersion(dbName: string, newVersion: number) {
        return new Promise(async (resolve, reject) => {
            const openRequest: IDBOpenDBRequest = this.dbFactory.open('DBVersion', 1);
            openRequest.onerror = () => {
                reject(INDEXEDDB_ERROR.OPEN_FAILED);
            };

            openRequest.onsuccess = () => {
                const db = openRequest.result;
                const objectStore = db.transaction(['version'], 'readwrite').objectStore('version');
                // 更新数据库版本字段
                const updateRequest = objectStore.put({ dbName, version: newVersion });
                updateRequest.onerror = reject;
                updateRequest.onsuccess = resolve;
            };

            openRequest.onupgradeneeded = () => {
                const db = openRequest.result;
                const objectStore = db.createObjectStore('version', {
                    keyPath: 'dbName',
                });
                objectStore.createIndex('dbName', 'dbName', { unique: true });
                objectStore.createIndex('version', 'version', { unique: false });
            };
        });
    }
```

这里使用*dbName*与*version*两个字段来对每一个数据库以及其最新版本进行存储映射。这里需要注意的是，若是无法在这里找到该数据库名称，说明应该是数据库在新建过程中，也是正常情况，根据建表方法所需，返回0。

### 建立数据库连接

为了像普通数据库一样操作，首先我们需要拆分IndexedDB.open这个API的建立连接和新增表这两个功能，先来看建连部分。

```typescript
    private getDBConnection(version?: number): Promise<IDBDatabase> {
        if (this.hasDBOpened && this.db) {
            return Promise.resolve(this.db);
        }

        const openRequest: IDBOpenDBRequest = this.dbFactory.open(this.dbName, version || this.dbVersion);

        return new Promise((resolve, reject) => {
            openRequest.onerror = () => {
                this.close();
                reject(INDEXEDDB_ERROR.CONNECTION_FAILED);
            };

            openRequest.onblocked = () => {
                this.close();
                reject(INDEXEDDB_ERROR.CONNECTION_FAILED);
            };

            openRequest.onsuccess = () => {
                this.db = openRequest.result;
                this.hasDBOpened = true;
                resolve(openRequest.result);
            };

            // 此时会新建一个数据库，不正确的调用
            openRequest.onupgradeneeded = () => {
                this.close();
                reject(INDEXEDDB_ERROR.CONNECTION_FAILED);
            };
        });
    }

    public close() {
        if (this.db) {
            this.db.close();
        }
        this.db = null;
        this.hasDBOpened = false;
    }
```

这块逻辑挺好理解，在取得最新版本号后打开数据库，并对高于或低于当前版本的输入均抛出报错。目的是为了确保该方法仅执行打开连接的操作。

断开连接即使用 IDBDatabase.close 方法，并重置标记位即可。

### 增删表操作

新建表的逻辑为，再打开数据库前，先获取到当前数据库的最新版本，并在该基础上+1，这是为了确保触发onupgradeneeded事件，从而在这里进行更新数据库版本与创建新表的操作。

由于版本号是一个 unsigned long long 类型，因此不要使用浮点数来记录它的版本，否则会被强行取整。

```typescript
    public createTable(options: {
        tableName: string;
        objectStoreOptions
    }): Promise<IDBDatabase> {
        if (this.hasDBOpened) this.close();

        const { tableName, createIndexParamsArr, primaryKey } = options;

        return new Promise(async (resolve, reject) => {
            const version = await this.getDBLatestVersion(this.dbName);
            const newVersion = version + 1;

            const openRequest: IDBOpenDBRequest = this.dbFactory.open(this.dbName, newVersion);

            openRequest.onupgradeneeded = () => {
                // 版本更新
                this.dbVersion = newVersion;
                this.updateDBLatestVersion(this.dbName, newVersion);

                db.createObjectStore(tableName, objectStoreOptions);
            };
            openRequest.onsuccess = () => {
                this.db = openRequest.result;
                this.hasDBOpened = true;
                resolve(openRequest.result);
            };
            openRequest.onerror = () => {
                this.close();
                reject(INDEXEDDB_ERROR.OPEN_FAILED);
            };
            openRequest.onblocked = () => {
                this.close();
            };
        });
    }
```

删表也是同理

```js
    public deleteTable(tableName: string): Promise<IDBDatabase> {
        if (this.hasDBOpened) this.close();
        return new Promise(async (resolve, reject) => {
            const version = await this.getDBLatestVersion(this.dbName);
            const newVersion = version + 1;

            const openRequest: IDBOpenDBRequest = this.dbFactory.open(this.dbName, newVersion);
            openRequest.onupgradeneeded = () => {
                // 版本更新
                this.dbVersion = newVersion;
                this.updateDBLatestVersion(this.dbName, newVersion);

                const db = openRequest.result;
                if (db.objectStoreNames.contains(tableName)) {
                    db.deleteObjectStore(tableName);
                    resolve(db);
                } else {
                    reject(INDEXEDDB_ERROR.CAN_NOT_FIND_TABLE);
                }
            };
            openRequest.onsuccess = () => {
                this.db = openRequest.result;
                resolve(openRequest.result);
            };
            openRequest.onerror = () => {
                this.close();
                reject(INDEXEDDB_ERROR.OPEN_FAILED);
            };
        });
    }
```

至此，就能实现一个能够进行自动版本控制的 IndexedDB promise 封装了。

当然，接下来还需要对表的增删改查进行promise化处理，并支持批量增删、索引与主键查询、多条件查询等等，就能封装成一个完整可用的库了。由于跟本次主题无关，就不将代码贴上来了，感兴趣的可以自己实现一下。
