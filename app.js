(function (angular) {

    const app = angular.module('app', [
        'ngRoute',
        'angular-cache',
        'offline'
    ]);

    app.config(function (
        offlineProvider
    ) {
        offlineProvider.debug(true);
    });

    app.config(function (
        $routeProvider
    ) {
        $routeProvider.when('/', {
            template: '<click-get></click-get><click-post></click-post>'
        });
    });

    app.run(function (
        $http,
        CacheFactory,
        offline
    ) {
        offline.start($http);
        window.getcache = $http.defaults.cache = CacheFactory.createCache('offline.get');
        window.postcache = offline.stackCache = CacheFactory.createCache('offline.post');
    });

    app.component('clickGet', {
        template: '<button ng-click="$ctrl.get()">Click to get</button><p>Result: {{$ctrl.result}}, count: {{$ctrl.counter}}</p>',
        controller: function ClickGetCtrl ($http) {
            this.counter = 0;
            this.get = function () {
                this.counter++;
                $http.get('/get.json').then(response => this.result = response.data);
            };
        }
    });

    app.component('clickPost', {
        template: '<button ng-click="$ctrl.post()">Click to post</button><p>Result: {{$ctrl.result}}, count: {{$ctrl.counter}}</p>',
        controller: function ClickPostCtrl ($http) {
            this.counter = 0;
            this.post = function () {
                this.counter++;
                $http.post('/post', {}).then(response => this.result = response.data);
            };
        }
    });

}(window.angular));
