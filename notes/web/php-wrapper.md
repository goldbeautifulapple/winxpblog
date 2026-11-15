
# PHP 伪协议

## 介绍


当一个字符串以 `scheme://` 开头，PHP 的文件类函数不会把它当路径，而是交给对应的处理器去取数据

## 漏洞

`include($file)` 只要求「给我一个文件」，但 PHP 在打开之前会先看开头：

- 普通路径 → 当文件打开
- `xxx://` →  当协议处理、

`include` 在执行时也会顺便执行被 Include 的文件的代码


## 三个开关

-  `allow_url_fopen`  —— 默认 **On**。管 `http://`、`ftp://` 这类远程
-  `allow_url_include` —— 默认 **Off**（PHP 5.2 起）。管 include 时能不能用伪协议/远程
- `open_basedir` —— 限制 PHP 能访问的目录范围，影响所有本地文件访问\

**allow_url_include** 和 **allow_url_fopen** 是两个相关但不同的配置选项：

- **allow_url_fopen**：控制是否允许通过 URL 打开远程文件，影响函数如 _fopen()_、_file_get_contents()_ 等。
    
- **allow_url_include**：控制是否允许通过 URL 包含远程文件，影响函数如 _include()_ 和 _require()_。
    

需要注意的是，**allow_url_include** 依赖于 **allow_url_fopen**，如果后者被禁用，前者也无法生效



## 按能力分类

### 读

-  `php://filter`  —— 过滤器链，读源码 默认就能用
-  `file://` —— 本地文件，注意三个斜杠 `file:///`
-  `phar://` —— 读 phar 内的文件（**触发反序列化**）

### 执行代码

- `php://input`  —— 读 POST 的原始 body
- `data://`  —— 数据直接内联在 URL 里

这两个都需要 `allow_url_include = On`。

### 反序列化

- `phar://` *—— 任何文件操作碰到它就解包


## `php://filter` 

[[SWPUCTF 2021 新生赛]include - CTF 题目 - NSSCTF](https://www.nssctf.cn/problem/427)
[[SWPUCTF 2022 新生赛]ez_ez_php - CTF 题目 - NSSCTF](https://www.nssctf.cn/problem/2640)
[[SWPUCTF 2022 新生赛]ez_ez_php(revenge) - CTF 题目 - NSSCTF](https://www.nssctf.cn/problem/2821)
第三题和第二题类似，最后的 resource 别忘了/ -- `/flag`
第三题如果不加/会出不了 flag，
个人猜测可能跟路径有关，也就是说第二题的 flag 文件跟第三题不在同一个位置，第三题的 flag 文件在根目录而不是服务器的工作目录
```
php://filter/[read=<过滤器>]/[write=<过滤器>]/resource=<目标>
```



1.  `resource=` 必须放在最后
2. 多个过滤器用 `|` 连接：`convert.base64-encode|convert.base64-encode`（套两层）
3. `read=` 是读时用的链，`write=` 是写时用的，都可以省
4. 常用过滤器：
    - `convert.base64-encode` / `convert.base64-decode`


## `data://`

格式：



```
data://[类型][;base64],<数据>
```

三种写法：



```
data://text/plain,hello
data://text/plain;base64,aGVsbG8=
data://text/plain,<?php echo 111;?>
```

- 同样需要 `allow_url_include = On`
- **数据在 URL 里** → 会进访问日志、浏览器历史、Referer
- **长度受限**（URL 上限，通常几千字节）
- 特殊字符要 URL 编码，`#` 会被当锚点截断

当使用 `file_get_contents` 时，一般首选 `data `

[[SWPUCTF 2021 新生赛]PseudoProtocols - CTF 题目 - NSSCTF](https://www.nssctf.cn/problem/441)
这题就用到了