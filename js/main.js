/* ===== main.js =====
   接线：页面加载完之后，把图标和初始窗口挂上去。
   它需要：window.js 的 makeDraggable()、notes.js 的 sections
   它必须最后加载。
   ===== */

/* ===== 双击桌面图标 ===== */
let icons = document.querySelectorAll('.icon');

icons.forEach(function (icon) {
    icon.ondblclick = function () {
        let name = icon.querySelector('.icon-name').textContent;

        if (!sections[name]) {
            openWindow('出错', '<p>sections 里没有这个分区：' + name + '</p>');
            return;
        }

        if (sections[name].ui === 'browser') {
            openBrowser(name);
        } else {
            openFolder(name);
        }
    };
});
/* ===== HTML 里原来那个窗口也要能拖能关 ===== */
makeDraggable(document.querySelector('.window'));
