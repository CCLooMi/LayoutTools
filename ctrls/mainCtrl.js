/**
 * Created by Seemie on 2023/8/19 14:40:23.
 */
(function (app) {
    function ce(name) {
        return document.createElement(name);
    }
    app.controller('mainCtrl', ['$element', '$scope', '$modal', '$compile','$icons', 'S_itemLoader', function ($ele, scope, $md, $compile,$icons,itemLoader) {
        scope.showCode = function () {
            var da = $ele.findOne('[drop-area]');
            da = da.cloneNode(Infinity);
            da.removeAttribute('drop-area');
            var ls = da.find('divider');
            for (var i = 0, li; i < ls.length; i++) {
                li = ls[i];
                li.removeAttribute('style');
            }
            $md.dialog('Layout Code')
                .content(app.getPaths('views/modal/showCode.atom'))
                .scope({ code: da?.outerHTML })
                .width(999)
                .height(450)
                .ok(function () { });
        }
        var reg = / +/, regs=[pxReg = /^\d+px$/,pcReg=/^\d+%$/,frReg = /^\d+fr$/,autoReg=/^auto$/], tgList = [];
        function mkDivider(ds, i, attrName , ...regs) {
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
        scope.items = [{
            icon: $icons.isvg('grid-rows'),
            drop: function (target) {
                if (target.hasClass('divider')) {
                    target = target.parentElement;
                }
                var grid = { gridRows: '', rows: [] };
                var unwatch = Atom.watchChange(grid, 'gridRows', function (ov, nv) {
                    grid.rows = nv.split(reg);
                    for (var i = 0, ri; i < grid.rows.length; i++) {
                        ri = grid.rows[i];
                        if (ri == '|') {
                            i=mkDivider(grid.rows,i,'cc-ns-resize',...regs);
                        }
                    }
                });
                grid.gridRows = '60px 1fr';

                $md.dialog()
                    .content(app.getPaths('views/modal/gridRows.atom'))
                    .scope(grid)
                    .width(555)
                    .ok(function () {
                        if (target.undo) {
                            target.undo();
                        }
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
                        target.undo = function () {
                            for (var i = 0; i < es.length; i++) {
                                es[i].remove();
                            }
                            es.length = 0;
                            this.css('grid-template-rows', '');
                        }
                        tgList.push(target);
                    })
                    .cancel(() => 0)
                    .onDestroy(unwatch);
            }
        }, {
            icon: $icons.isvg('grid-columns'),
            drop: function (target) {
                if (target.localName=='divider') {
                    target = target.parentElement;
                }
                var grid = { gridCols: '', cols: [] };
                var unwatch = Atom.watchChange(grid, 'gridCols', function (ov, nv) {
                    grid.cols = nv.split(reg);
                    for (var i = 0, ri; i < grid.cols.length; i++) {
                        ri = grid.cols[i];
                        if (ri == '|') {
                            i = mkDivider(grid.cols,i,'cc-ew-resize',...regs);
                        }
                    }
                });
                grid.gridCols = '220px | 1fr';
                $md.dialog()
                    .content(app.getPaths('views/modal/gridCols.atom'))
                    .scope(grid)
                    .width(555)
                    .ok(function () {
                        if (target.undo) {
                            target.undo();
                        }
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
                        target.undo = function () {
                            for (var i = 0; i < es.length; i++) {
                                es[i].remove();
                            }
                            es.length = 0;
                            this.css('grid-template-columns', '');
                            this.css('grid-template-rows', '');
                        }
                        tgList.push(target);
                    })
                    .cancel(() => 0)
                    .onDestroy(unwatch);
            }
        }, {
            icon: $icons.isvg('grid-layout'),
            drop: function (target) {
                if (target.localName=='divider') {
                    target = target.parentElement;
                }
                var grid = { gridRows: '', gridCols: '', cols: [], rows: [] };
                var unwatchRows = Atom.watchChange(grid, 'gridRows', function (ov, nv) {
                    grid.rows = nv.split(reg);
                    for (var i = 0, ri; i < grid.rows.length; i++) {
                        ri = grid.rows[i];
                        if (ri == '|') {
                            i = mkDivider(grid.rows,i,'cc-ns-resize',...regs);
                        }
                    }
                });
                var unwatchCols = Atom.watchChange(grid, 'gridCols', function (ov, nv) {
                    grid.cols = nv.split(reg);
                    for (var i = 0, ri; i < grid.cols.length; i++) {
                        ri = grid.cols[i];
                        if (ri == '|') {
                            i = mkDivider(grid.cols,i,'cc-ew-resize',...regs);
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
                        if (target.undo) {
                            target.undo();
                        }
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
                        target.undo = function () {
                            for (var i = 0; i < es.length; i++) {
                                es[i].remove();
                            }
                            es.length = 0;
                            this.css('grid-template-columns', '');
                            this.css('grid-template-rows', '');
                        }
                        tgList.push(target);
                    })
                    .cancel(() => 0)
                    .onDestroy(() => (unwatchCols(), unwatchRows()));
            }
        }];
        itemLoader.loadItems('dropItem/items.atom').then(function(items){
            scope.items.push(...items);
            console.log(items);
        },console.error);
        attacheEvent(document)
            .on('keydown', function (e) {
                if (e.ctrlKey && e.key == 'z') {
                    e.preventDefault();
                    e.stopPropagation();
                    tgList.pop()?.undo();
                }
            })
            .getDispose(function (dsp) {
                watchInDomTree($ele, dsp);
            });
    }]);
})(Atom.app('LayoutTools'))