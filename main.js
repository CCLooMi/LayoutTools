/**
 * Created by guest on 2023/8/19 08:15:13.
 */
(function (app) {
    app.state("main", {
        url: "/main",
        templateUrl: "views/main.atom",
        deps: ['servs/itemLoaderServ.js', 'ctrls/mainCtrl.js']
    });
    app.regLoadingJobs(app.loadComponents('ic/ic.atom'), new Promise(function (resolve, reject) {
        ld('ic-monaco').then(resolve, reject);
    }));
    app.directive('drop-area', function () {
        const undoList = [];
        return {
            restrict: 'A',
            link: function (scope, ele, attrs) {
                ele.dropabble = true;
                ele.ondragover = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                };
                ele.ondrop = function (e) {
                    e.preventDefault();
                    const df = e.dataTransfer;
                    const func = Atom.shareData[df.getData('data')];
                    if (func instanceof Function) {
                        func(e,undoList);
                        return;
                    }
                }
                attacheEvent(document)
                    .on('keydown', function (e) {
                        if (e.ctrlKey && e.key == 'z') {
                            e.preventDefault();
                            e.stopPropagation();
                            if(undoList.length){
                                undoList.pop()();
                            }
                        }
                    })
                    .getDispose(function (dsp) {
                        watchInDomTree(ele, dsp);
                    });
            }
        }
    });
})(Atom.app("LayoutTools"));