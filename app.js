(function (angular) {

    const app = angular.module('app', [
        'ngMockE2E',
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
            template: '<click-get></click-get><click-post></click-post>',
            controllerAs: 'ctrl',
            controller: function () {
                console.log('/ ctrl');
            }
        });
    });

    app.run(function (
        $httpBackend,
        $http,
        CacheFactory,
        offline
    ) {
        $httpBackend.whenGET('/get').respond({data: 'get response'});
        $httpBackend.whenPOST('/post').respond({data: 'post response'});
        offline.start($http);
        $http.defaults.cache = CacheFactory.createCache('offline.get');
        offline.stackCache = CacheFactory.createCache('offline.post');
    });

    app.component('clickGet', {
        template: '<button ng-click="$ctrl.get()">Click to get</button><p>Result: {{$ctrl.result}}, count: {{$ctrl.counter}}</p>',
        controller: function ClickGetCtrl ($http) {
            this.counter = 0;
            this.get = function () {
                console.log('clickGet');
                this.counter++;
                $http.get('/get').then(response => this.result = response.data);
            };
        }
    });

    app.component('clickPost', {
        template: '<button ng-click="$ctrl.post()">Click to post</button><p>Result: {{$ctrl.result}}, count: {{$ctrl.counter}}</p>',
        controller: function ClickPostCtrl ($http) {
            this.counter = 0;
            this.post = function () {
                console.log('clickPost');
                this.counter++;
                $http.post('/post', {}).then(response => this.result = response.data);
            };
        }
    });

}(window.angular));
