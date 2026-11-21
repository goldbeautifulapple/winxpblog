/* ===== notes.js =====
   管内容：笔记清单、md 渲染、把一篇笔记读进容器里。
   它提供：sections、openNote()、openFolder()、openBrowser()、openPage()
   它需要：window.js 的 openWindow()
   ===== */

/* ===== 笔记内容 ===== */
/* ===== 笔记清单：名字 → 文件名 ===== */
/* ===== 两个内容域 ===== */
let sections = {
    "Web笔记": {
        dir: "web",
        ui: "grid",
        notes: {
            "php伪协议": "php-wrapper.md",
            "无回显RCE": "N-RCE.md"
        }
    },
    "漏洞复现记录":{
        dir: "hole",
        ui: "grid",
        notes:{
            "ThinkPHP5 5.0.22 远程代码执行漏洞":"thinkphp5-rce.md"
        }
    },
    "gar'smod": {
        dir: "gmod",
        ui: "browser",
        notes: {
            "入门": "intro.md",
            "Garry's Mall 2 (gm_gmall_2)":"gm_gmall_2.md",
            "rp_downtown的故事":"rp_downtown.md"
        }
    }
};

/* ===== 把 md 文本渲染到任意容器里 ===== */
function renderMarkdown(text, container, base) {
    text = text.replace(/!\[\[([^\]]+)\]\]/g, '![]($1)');

    container.innerHTML = marked.parse(text ,{ breaks: true });

    container.querySelectorAll('pre code').forEach(function (code) {
        hljs.highlightElement(code);
    });

    container.querySelectorAll('img').forEach(function (img) {
        let alt = img.getAttribute('alt');
        if (alt && /^\d+$/.test(alt)) {
            img.style.width = alt + 'px';
            img.setAttribute('alt', '');
        }


        let src = img.getAttribute('src');
        if (!src) return;
        if (/^[a-z]+:\/\//i.test(src) || src.charAt(0) === '/') return;
        if (src.indexOf('/') === -1) src = 'assets/' + src;
        img.src = base + src;
                img.onload = function () {
            fitWindow(container.closest('.window'));
        };
    });
    //篝火动图(写死的)
    let line1 = document.createElement("div");
    line1.className = "note-sep";
    container.appendChild(line1);
    let img1 = document.createElement("img");
    let src1 = "images/bonfire.gif"
    container.appendChild(img1);
    img1.onload = function () {
            fitWindow(container.closest('.window'));
    };
    img1.className="note-gif";
    img1.src=src1;
    //篝火下加个文字
    let FIRE = document.createElement("div");
    FIRE.textContent="BONFIRE LIT";
    FIRE.className="fire";
    container.appendChild(FIRE);
    fitWindow(container.closest('.window'));
}

/* ===== 读一篇 md 并显示到容器里 ===== */
function loadMarkdown(container, dir, file) {
    container.innerHTML = '<p>加载中…</p>';

    fetch('notes/' + dir + '/' + file, { cache: 'no-store' })
        .then(function (res) {
            if (!res.ok) throw new Error(res.status);
            return res.text();
        })
        .then(function (text) {
            renderMarkdown(text, container, 'notes/' + dir + '/');
        })
        .catch(function (err) {
            container.textContent = '读不到 notes/' + dir + '/' + file + '（' + err.message + '）';
        });
}

/* ===== 从 .md 文件读一篇 ===== */
function openNote(section, noteName) {
    let s = sections[section];
    if (!s) return;

    let file = s.notes[noteName];
    if (!file) {
        openWindow(noteName, '<p>没登记这篇：' + noteName + '</p>');
        return;
    }

    let winEl = openWindow(noteName, '<p>加载中…</p>');
    loadMarkdown(winEl.querySelector('.window-body'), s.dir, file);
}
/* ===== 文件夹：把 notes 里的每一条画成一个图标 ===== */
function openFolder(section) {
    let s = sections[section];
    if (!s) return;

    let html = '<div class="note-grid">';

    Object.keys(s.notes).forEach(function (name) {
        html +=
            '<div class="note-item">' +
                '<div class="icon-img file"></div>' +
                '<div class="note-item-name">' + name + '</div>' +
            '</div>';
    });

    html += '</div>';

    let winEl = openWindow(section, html);

    winEl.querySelectorAll('.note-item').forEach(function (item) {
        item.ondblclick = function () {
            let name = item.querySelector('.note-item-name').textContent;
            openNote(section, name);
        };
    });
        /* 单击顶替（和桌面图标同一套做法） */
    if (window.matchMedia('(hover: none)').matches) {
        let lastTap = 0;
        winEl.querySelectorAll('.note-item').forEach(function (item) {
            item.onclick = function () {
                let now = Date.now();
                if (now - lastTap < 600) return;
                lastTap = now;
                item.ondblclick();
            };
        });
    }
}

/* ===== 浏览器壳：地址栏 + 左侧专栏 + 右侧正文 ===== */
function openBrowser(section) {
    let s = sections[section];
    if (!s) return;

    let winEl = openWindow(section, '<p>…</p>', 'browser');
    let body = winEl.querySelector('.window-body');

    body.innerHTML =
        '<div class="browser-bar">' +
            '<div class="browser-url"></div>' +
        '</div>' +
        '<div class="browser-main">' +
            '<div class="browser-side"></div>' +
            '<div class="browser-page"></div>' +
        '</div>';

    let side = body.querySelector('.browser-side');

    Object.keys(s.notes).forEach(function (noteName) {
        let item = document.createElement('div');
        item.className = 'side-item';
        item.textContent = noteName;

        item.onclick = function () {
            openPage(section, noteName, winEl);
        };

        side.appendChild(item);
    });

    let first = Object.keys(s.notes)[0];
    if (first) openPage(section, first, winEl);
}

function openPage(section, noteName, winEl) {
    let s = sections[section];
    let file = s.notes[noteName];
    if (!file) return;

    winEl.querySelector('.browser-url').textContent = s.dir + '://' + noteName;

    winEl.querySelectorAll('.side-item').forEach(function (el) {
        if (el.textContent === noteName) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });

    loadMarkdown(winEl.querySelector('.browser-page'), s.dir, file);
}
