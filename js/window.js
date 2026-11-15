/* ===== window.js =====
   管窗口的物理：造出窗口、拖动、缩放、关闭。
   它提供：makeDraggable()、openWindow()
   它需要：无
   ===== */
/* 任务栏高度：直接问 DOM 要，不写死 30 */
let taskbarEl = document.querySelector('.taskbar');
let TASKBAR_H = taskbarEl ? taskbarEl.offsetHeight : 0;
/* ===== 拖动管理：一份代码，服务所有窗口 ===== */
let dragging = false;
let activeWin = null;
let offsetX = 0;
let offsetY = 0;

document.onmousemove = function (e) {
    if (!dragging) return;

    let left = e.clientX - offsetX;
    let top = e.clientY - offsetY;

    let maxLeft = document.documentElement.clientWidth - activeWin.offsetWidth;
    let maxTop = document.documentElement.clientHeight - TASKBAR_H - activeWin.offsetHeight;

    if (maxLeft < 0) maxLeft = 0;
    if (maxTop < 0) maxTop = 0;

    if (left < 0) left = 0;
    if (left > maxLeft) left = maxLeft;
    if (top < 0) top = 0;
    if (top > maxTop) top = maxTop;

    activeWin.style.left = left + 'px';
    activeWin.style.top = top + 'px';
    activeWin.style.maxHeight = (document.documentElement.clientHeight - TASKBAR_H - top) + 'px';
};

document.onmouseup = function () {
    dragging = false;
};

/* ===== 给某个窗口装上"能拖 + 能关" ===== */
function makeDraggable(winEl) {
    winEl.querySelector('.titlebar').onmousedown = function (e) {
        dragging = true;
        activeWin = winEl; //全局只有一个 mousemove 处理器，它靠 activeWin 知道该动哪个窗口。你按下 A 的标题栏，activeWin 就变成 A；松开再按 B，activeWin 就变成 B
        activeWin.style.maxHeight = (document.documentElement.clientHeight - TASKBAR_H - top) + 'px';
        offsetX = e.clientX - winEl.offsetLeft;
        offsetY = e.clientY - winEl.offsetTop;
    };

    winEl.querySelector('.btn-close').onclick = function () {
        winEl.remove();
    };
    makeResizable(winEl);
}

/* ===== 打开一个新窗口 ===== */
function openWindow(name, html,bodyClass) {
    let winEl = document.createElement('div');  //凭空造出一个 <div>
    let count = document.querySelectorAll('.window').length; //让浏览器数有几个窗口
    winEl.className = 'window';  //等于在 HTML 里写 class="window"
    let top = Math.min(100 + count * 24, document.documentElement.clientHeight - TASKBAR_H - 200);
    winEl.style.left = (180 + count * 24) + 'px';  //offset * 24 让每个新窗口往右下错开 24px
    winEl.style.top = top + 'px';
    winEl.style.maxHeight = (document.documentElement.clientHeight - TASKBAR_H - top) + 'px';

    winEl.innerHTML =
        '<div class="titlebar">' +
            '<span>' + name + '</span>' +
            '<span class="btns">' +
                '<span class="btn">_</span>' +
                '<span class="btn">□</span>' +
                '<span class="btn btn-close">×</span>' +
            '</span>' +
        '</div>' +
        '<div class="window-body' + (bodyClass ? ' ' + bodyClass : '') + '">' +
            (html || '<p>这篇笔记还没有内容。</p>') +
        '</div>';
// notes[name] 从笔记对象里按名字取。取到了就是那段 HTML。
// || 是“或者”：取不到就用后面那句兜底。所以哪个图标在 notes 里没登记，也不会显示 “undefined”
    document.body.appendChild(winEl); //appendChild = 往父元素里追加一个子元素。document.body 是 <body>，所以是“把新窗口塞进 body 最后”
    makeDraggable(winEl);       //让它能拖
    fitWindow(winEl);
    return winEl;
}

/* ===== 内容比可用空间高时，把高度钉住，免得拖动时被拉长 ===== */
function fitWindow(winEl) {
    if (!winEl) return;

    let fit = document.documentElement.clientHeight - TASKBAR_H - winEl.offsetTop;

    // 先量内容"本来想长多高"：临时松开高度和天花板
    let prevH = winEl.style.height;
    let prevMax = winEl.style.maxHeight;
    winEl.style.height = 'auto';
    winEl.style.maxHeight = 'none';
    let natural = winEl.offsetHeight;
    winEl.style.height = prevH;
    winEl.style.maxHeight = prevMax;

    if (natural > fit) winEl.style.height = fit + 'px';
}

/* ===== 右下角缩放 ===== */
let resizeWin = null;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartW = 0;
let resizeStartH = 0;

function makeResizable(winEl) {
    let handle = document.createElement('div');
    handle.className = 'resizer';
    winEl.appendChild(handle);

    handle.onmousedown = function (e) {
        e.preventDefault();

        resizeWin = winEl;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeStartW = winEl.offsetWidth;
        resizeStartH = winEl.offsetHeight;
    };
}

document.addEventListener('mousemove', function (e) {
    if (!resizeWin) return;

    let w = resizeStartW + (e.clientX - resizeStartX);
    let h = resizeStartH + (e.clientY - resizeStartY);
    let maxW = document.documentElement.clientWidth - resizeWin.offsetLeft;
    let maxH = document.documentElement.clientHeight - TASKBAR_H - resizeWin.offsetTop;

    if (w < 260) w = 260;
    if (h < 140) h = 140;
    if (w > maxW) w = maxW;
    if (h > maxH) h = maxH;

    resizeWin.style.width = w + 'px';
    resizeWin.style.height = h + 'px';
});

document.addEventListener('mouseup', function () {
    resizeWin = null;
});

/* ===== 任务栏时钟 ===== */
function tickClock() {
    let d = new Date();
    let h = d.getHours();
    let m = d.getMinutes();

    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;

    document.getElementById('clock').textContent = h + ':' + m;
}

tickClock();
setInterval(tickClock, 1000);