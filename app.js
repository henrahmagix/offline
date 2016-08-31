(function (angular) {

    const app = angular.module('app', [
        'ngRoute',
        'angular-cache',
        'offline'
    ]);

    app.config(function (
        $provide,
        $routeProvider,
        offlineProvider
    ) {

        window.isOnline = true;
        $provide.decorator('connectionStatus', function ($delegate) {
            $delegate.isOnline = function () {
                console.log('isOnline', window.isOnline);
                return window.isOnline;
            };
            return $delegate;
        });

        offlineProvider.debug(true);

        $routeProvider.when('/', {
            template: `
                <click-get></click-get>
                <click-post></click-post>
                <online></online>
            `
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

    app.directive('online', function () {
        return {
            template: `
                <button class="toggle">Click to toggle online</button>
                <button class="trigger">Click to trigger online</button>
                <p>Online: {{$ctrl.online}}, count: {{$ctrl.counter}}</p>
            `,
            controller: function ClickPostCtrl ($http) {
                this.counter = 0;
                this.toggle = function () {
                    console.log('toggle');
                    this.counter++;
                    window.isOnline = !window.isOnline;
                };
                this.event = document.createEvent('HTMLEvents');
                this.event.initEvent('online', true, true);
                this.event.name = 'online';
                this.trigger = function () {
                    console.log('trigger');
                    this.counter++;
                    window.dispatchEvent(this.event);
                };
            },
            link: function ($scope, $element, $attrs) {
                console.log('$element', $element.find('.toggle')[0]);
                $element.find('.toggle').on('click', function () {
                    console.log('click toggle');
                    this.toggle();
                });
                $element.find('.trigger').on('click', function () {
                    console.log('click trigge');
                    this.trigger();
                });
            }
        };
    });

}(window.angular));
