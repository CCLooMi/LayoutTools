/**
 * Created by Seemie on 2023/8/19 14:40:23.
 */
(function (app) {
    function ce(name) {
        return document.createElement(name);
    }
    const cache = {};
    function isAutoClose(ele) {
        var n = ele.localName;
        if (!n) {
            return false;
        }
        var r = cache[n];
        if (r !== undefined) {
            return r;
        }
        var h = ce(n).outerHTML;
        if (h == `<${n}>`) {
            return (cache[n] = true);
        }
        return (cache[n] = false);
    }
    function toHTML(ele, func) {
        function _toHTML(ele, ls) {
            var n = ele.localName;
            if (!n) {
                n = ele.textContent.trim();
                n && ls.push(n);
                return;
            }
            const k = func ? func(ele) : 0;
            if(k===2){//skip this element
                return;
            }
            if (k !== 1) {//skip self but not children
                var attrs = '';
                Array.from(ele.attributes)
                    .forEach(attr => attrs += ` ${attr.name}="${attr.value}"`);
                ls.push(`<${n}${attrs}>`);
            }
            const cds = (ele.shadowRoot || ele).childNodes;
            for (var i = 0; i < cds.length; i++) {
                _toHTML(cds[i], ls);
            }
            if (isAutoClose(ele)) {
                return;
            }
            if(k!=1){
                ls.push(`</${n}>`);
            }
        }
        const ls = [];
        _toHTML(ele, ls);
        return ls.join('');
    }
    app.controller('mainCtrl', ['$element', '$scope', '$modal', '$compile', '$icons', 'S_itemLoader', function ($ele, scope, $md, $compile, $icons, itemLoader) {
        scope.showCode = function () {
            var da = $ele.findOne('[drop-area]>sv');
            var ls = da.find('divider');
            for (var i = 0, li; i < ls.length; i++) {
                li = ls[i];
                li.removeAttribute('style');
            }
            $md.dialog('Layout Code')
                .content(app.getPaths('views/modal/showCode.atom'))
                .scope({ code: toHTML(da,function(ele){
                    if(ele.localName=='form'||ele.localName=='link'){
                        return 1;
                    }
                })})
                .width(999)
                .height(450)
                .ok(function () { });
        }
        var reg = / +/, regs = [pxReg = /^\d+px$/, pcReg = /^\d+%$/, frReg = /^\d+fr$/, autoReg = /^auto$/];
        function mkDivider(ds, i, attrName, ...regs) {
            for (var j = 0, ri; j < regs.length; j++) {
                ri = regs[j];
                if (ri.test(ds[i - 1])) {
                    var di = ce('divider');
                    di.attr(attrName, (i - 1));
                    ds[i] = di;
                    return i;
                }
                if (ri.test(ds[i + 1])) {
                    var di = ce('divider');
                    di.attr(attrName, -(i + 1));
                    ds[i++] = di;
                    return i;
                }
            }
        }
        function getSV(ele) {
            if (!ele instanceof Node) {
                return;
            }
            if (ele.localName == 'sv') {
                return ele;
            }
            return getSV(ele.parentElement);
        }
        scope.items = [{
            icon: $icons.isvg('grid-rows'),
            drop: function (e, undoList) {
                const target = getSV(e.target);
                var grid = { gridRows: '', rows: [] };
                var unwatch = Atom.watchChange(grid, 'gridRows', function (ov, nv) {
                    grid.rows = nv.split(reg);
                    for (var i = 0, ri; i < grid.rows.length; i++) {
                        ri = grid.rows[i];
                        if (ri == '|') {
                            i = mkDivider(grid.rows, i, 'cc-ns-resize', ...regs);
                        }
                    }
                });
                grid.gridRows = '60px 1fr';

                $md.dialog()
                    .content(app.getPaths('views/modal/gridRows.atom'))
                    .scope(grid)
                    .width(555)
                    .ok(function () {
                        var ds = grid.rows
                        var es = [];
                        for (var i = 0, ei; i < ds.length; i++) {
                            ei = ds[i];
                            if (!ei) continue;
                            if (ei instanceof Node) {
                                ei = ei.cloneNode(Infinity);
                                target.append(ei);
                                es.push(ei);
                                ds[i] = '1px';
                                $compile(ei);
                                continue;
                            }
                            ei = ce('sv');
                            target.append(ei);
                            es.push(ei);
                        }
                        target.css('grid-template-rows', grid.rows.join(' '));
                        undoList.push(function () {
                            for (var i = 0; i < es.length; i++) {
                                es[i].remove();
                            }
                            es.length = 0;
                            this.css('grid-template-rows', '');
                        }.bind(target));
                    })
                    .cancel(() => 0)
                    .onDestroy(unwatch);
            }
        }, {
            icon: $icons.isvg('grid-columns'),
            drop: function (e, undoList) {
                const target = getSV(e.target);
                var grid = { gridCols: '', cols: [] };
                var unwatch = Atom.watchChange(grid, 'gridCols', function (ov, nv) {
                    grid.cols = nv.split(reg);
                    for (var i = 0, ri; i < grid.cols.length; i++) {
                        ri = grid.cols[i];
                        if (ri == '|') {
                            i = mkDivider(grid.cols, i, 'cc-ew-resize', ...regs);
                        }
                    }
                });
                grid.gridCols = '220px | 1fr';
                $md.dialog()
                    .content(app.getPaths('views/modal/gridCols.atom'))
                    .scope(grid)
                    .width(555)
                    .ok(function () {
                        var ds = grid.cols;
                        var es = [];
                        for (var i = 0, ei; i < ds.length; i++) {
                            ei = ds[i];
                            if (!ei) continue;
                            if (ei instanceof Node) {
                                ei = ei.cloneNode(Infinity);
                                target.append(ei);
                                es.push(ei);
                                ds[i] = '1px';
                                $compile(ei);
                                continue;
                            }
                            ei = ce('sv');
                            target.append(ei);
                            es.push(ei);
                        }
                        target.css('grid-template-columns', grid.cols.join(' '));
                        if (!target.style.gridTemplateRows) {
                            target.css('grid-template-rows', '1fr');
                        }
                        undoList.push(function () {
                            for (var i = 0; i < es.length; i++) {
                                es[i].remove();
                            }
                            es.length = 0;
                            this.css('grid-template-columns', '');
                            this.css('grid-template-rows', '');
                        }.bind(target));
                    })
                    .cancel(() => 0)
                    .onDestroy(unwatch);
            }
        }, {
            icon: $icons.isvg('grid-layout'),
            drop: function (e, undoList) {
                const target = getSV(e.target);
                var grid = { gridRows: '', gridCols: '', cols: [], rows: [] };
                var unwatchRows = Atom.watchChange(grid, 'gridRows', function (ov, nv) {
                    grid.rows = nv.split(reg);
                    for (var i = 0, ri; i < grid.rows.length; i++) {
                        ri = grid.rows[i];
                        if (ri == '|') {
                            i = mkDivider(grid.rows, i, 'cc-ns-resize', ...regs);
                        }
                    }
                });
                var unwatchCols = Atom.watchChange(grid, 'gridCols', function (ov, nv) {
                    grid.cols = nv.split(reg);
                    for (var i = 0, ri; i < grid.cols.length; i++) {
                        ri = grid.cols[i];
                        if (ri == '|') {
                            i = mkDivider(grid.cols, i, 'cc-ew-resize', ...regs);
                        }
                    }
                });
                grid.gridCols = '220px | 1fr';
                grid.gridRows = '60px 1fr';
                $md.dialog()
                    .content(app.getPaths('views/modal/grid.atom'))
                    .scope(grid)
                    .width(555)
                    .ok(function () {
                        var cols = grid.cols, rows = grid.rows;
                        var es = [];
                        for (var i = 0, ri; i < rows.length; i++) {
                            ri = rows[i];
                            if (!ri) continue;
                            if (ri instanceof Node) {
                                for (var j = 0, ci; j < cols.length; j++) {
                                    ci = cols[j];
                                    if (ci instanceof Node) {
                                        var ss = [ci.attr('cc-ew-resize'), ri.attr('cc-ns-resize')];
                                        ci = ce('divider');
                                        ci.attr('cc-resize', ss.join(','));
                                    } else {
                                        ci = ri.cloneNode(Infinity);
                                    }
                                    target.append(ci);
                                    es.push(ci);
                                    $compile(ci);
                                }
                                continue;
                            }
                            for (var j = 0, ci; j < cols.length; j++) {
                                ci = cols[j];
                                if (!ci) continue;
                                if (ci instanceof Node) {
                                    ci = ci.cloneNode(Infinity);
                                    target.append(ci);
                                    es.push(ci);
                                    $compile(ci);
                                    continue;
                                }
                                ci = ce('sv');
                                target.append(ci);
                                es.push(ci);
                            }
                        }
                        cols = cols.map(a => (a instanceof Node ? '1px' : a));
                        rows = rows.map(a => (a instanceof Node ? '1px' : a));
                        target.css('grid-template-columns', cols.join(' '));
                        target.css('grid-template-rows', rows.join(' '));
                        if (!target.style.gridTemplateRows) {
                            target.css('grid-template-rows', '1fr');
                        }
                        undoList.push(function () {
                            for (var i = 0; i < es.length; i++) {
                                es[i].remove();
                            }
                            es.length = 0;
                            this.css('grid-template-columns', '');
                            this.css('grid-template-rows', '');
                        }.bind(target));
                    })
                    .cancel(() => 0)
                    .onDestroy(() => (unwatchCols(), unwatchRows()));
            }
        }];
        itemLoader.loadItems('dropItem/items.atom').then(function (items) {
            scope.items.push(...items);
        }, console.error);
    }]);
})(Atom.app('LayoutTools'))