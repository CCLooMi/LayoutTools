/**
 * Created by Seemie on 2023/9/20 11:05:10.
 */
(function (app) {
    var ce = document.createElement.bind(document);
    var cdf = document.createDocumentFragment.bind(document);
    function newFunc(body, ...argNames) {
        return new Function(argNames, body);
    }
    function cleanList(nodeList) {
        for (var i = 0; i < nodeList.length; i++) {
            if (nodeList[i].nodeType == 1) {
                continue;
            }
            nodeList[i].remove(); i--;
        }
        return nodeList;
    }
    function parseNode(node, app, callback) {
        var nodes = node.childNodes,
            icon = node.attr('icon'),
            script = '', style = '', body = '';
        var deps = [];
        for (var i = 0; i < nodes.length; i++) {
            var ni = nodes[i];
            if (ni instanceof Element) {
                if (ni.localName == 'style') {
                    style += ni.innerHTML + '\n';
                } else if (ni.localName == 'script') {
                    if (ni.attr('type') == 'text/less') {
                        style += ni.innerHTML + '\n';
                        continue;
                    }
                    script += ni.innerHTML + '\n';
                    var dep = ni.attr('inject');
                    if (dep = dep?.trim()) {
                        deps.push(...dep.split(/[ ,]+/));
                    }
                } else {
                    body += ni.outerHTML + '\n';
                }
            }
        }
        return callback(icon, script.trim(), deps, style.trim(), body.trim(), app)
    }
    app.factory('S_itemLoader', ['$http', '$icons', function ($http, $icons) {
        function genItem(icon, script, deps, style, body, app) {
            var aa = ['$event','undoList', 'style', 'body', 'ce', 'cdf', ...deps];
            var aaFunc = newFunc(script, ...aa);
            var ps = [aaFunc];
            ps.push(new Promise(function (resolve) {
                app.invoke([...deps, (...deps) => { resolve(deps); }]).catch(resolve);
            }));
            if (style) {
                ps.push(new Promise(function (resolve, reject) {
                    Atom.invoke(['$less', function ($less) {
                        $less.renderToStyleElement(style).then(resolve, reject);
                    }]).catch(reject);
                }));
            }
            return Promise.all(ps).then(function ([aaFunc, deps, style]) {
                if (Array.isArray(deps)) {
                    return {
                        icon: $icons.isvg(icon),
                        drop: function (event,undoList) {
                            aaFunc(event,undoList,style, body, ce, cdf, ...deps || []);
                        }
                    };
                }
                return {
                    icon: $icons.isvg(icon),
                    drop: function () {
                        console.warn(deps);
                    }
                };
            });
        }
        function processComponent(componentStr, app) {
            var pss = [];
            var nodes = cleanList(Atom.toNodes(componentStr));
            for (var i = 0; i < nodes.length; i++) {
                if (nodes.attr('icon')) {
                    pss.push(parseNode(nodes[i], app, genItem));
                }
            }
            return Promise.all(pss);
        }
        return {
            loadItems: function (...urls) {
                return $http.gets(app.getPaths(...urls))
                    .each(p => p.responseText())
                    .then(function (a) {
                        const ps = [];
                        for (var i = 0; i < a.length; i++) {
                            ps.push(processComponent(a[i].response, app));
                        }
                        return Promise.all(ps).then(a=>{
                            const aa=[];
                            a.forEach(ai=>aa.push(...ai));
                            return aa;
                        });
                    });
            }
        }
    }]);
})(Atom.app('LayoutTools'))