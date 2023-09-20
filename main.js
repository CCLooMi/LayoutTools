/**
 * Created by guest on 2023/8/19 08:15:13.
 */
(function (app) {
    app.state("main", {
        url: "/main",
        templateUrl: "views/main.atom",
        deps: ['servs/itemLoaderServ.js','ctrls/mainCtrl.js']
    });
    app.regLoadingJobs(app.loadComponents('ic/ic.atom'), new Promise(function (resolve, reject) {
        ld('ic-monaco').then(resolve, reject);
    }));
    app.directive('drop-area', function () {
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
                    const target = e.target;
                    const df = e.dataTransfer;
                    const func = Atom.shareData[df.getData('data')];
                    if (func instanceof Function) {
                        return func(target);
                    }
                }
            }
        }
    });
})(Atom.app("LayoutTools"));