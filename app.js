(function (angular) {

    const app = angular.module('app', [
        'ngRoute',
        'angular-cache',
        'offline'
    ]);

    app.constant('CONFIG', {
        OFFLINE: {
            STORAGE_MODE: 'localStorage'
        }
    });

    app.config(function (
        $provide,
        $routeProvider,
        offlineProvider
    ) {
        offlineProvider.debug(true);
        $routeProvider.when('/', {
            template: '' +
                '<click-get></click-get>' +
                '<click-post></click-post>' +
                '<online></online>' +
            ''
        });
    });

    app.run(function (
        $http,
        CacheFactory,
        offline,
        CONFIG
    ) {
        offline.stackCache = CacheFactory.createCache('offline.post', {
            storageMode: CONFIG.OFFLINE.STORAGE_MODE
        });
        offline.start($http);
    });

    app.component('clickGet', {
        template: '<button ng-click="$ctrl.get()">Click to get</button><p>Result: {{$ctrl.result}}, count: {{$ctrl.counter}}</p>',
        controller: function ClickGetCtrl ($http) {
            this.counter = 0;
            this.get = function () {
                this.counter++;
                $http.get('/get.json', {offline: true}).then(function (response) {
                    this.result = response.data
                }.bind(this));
            };
        }
    });

    app.component('clickPost', {
        template: '<button ng-click="$ctrl.post()">Click to post</button><p>Result: {{$ctrl.result}}, count: {{$ctrl.counter}}</p>',
        controller: function ClickPostCtrl ($http, $rootScope, offline) {
            this.counter = 0;
            this.post = function () {
                this.counter++;
                const counter = this.counter;
                const data = {data: 'some data', counter};

                const dataResolve = function (data) {
                    console.log('dataResolve', data);
                    this.result = data;
                }.bind(this);

                console.log('posting...', counter);
                $http.post('/post', data, {offline: true})

                    .then(function (response) {
                        console.log('post success', counter, response);
                        dataResolve(response.data);
                    }.bind(this))

                    .catch(function (error) {
                        console.log('post error', counter, error.message);
                        console.error(error.message);
                        if (error.message === offline.ERRORS.REQUEST_QUEUED) {
                            $rootScope.$on('offline-request:success', function ($event, response, request) {
                                if (request.data.counter === counter) {
                                    return dataResolve(response.data);
                                }
                            }.bind(this));
                        }
                    }.bind(this));
            };
        }
    });

    app.component('online', {
        template: '' +
            '<button class="toggle">Click to toggle online</button>' +
            '<button class="trigger">Click to trigger online</button>' +
            '<p>Online: {{$ctrl.online}}, count: {{$ctrl.counter}}</p>' +
        '',
        controller: function ClickPostCtrl ($http, $element) {
            this.counter = 0;
            this.toggle = function () {
                this.counter++;
                window.isOnline = !window.isOnline;
                console.log('toggle isOnline', window.isOnline);
            };
            this.event = document.createEvent('HTMLEvents');
            this.event.initEvent('online', true, true);
            this.event.name = 'online';
            this.trigger = function () {
                this.counter++;
                window.dispatchEvent(this.event);
            };
            $element.find('button').on('click', function (event) {
                const $button = angular.element(event.target);
                if ($button.hasClass('toggle')) {
                    this.toggle();
                } else if ($button.hasClass('trigger')) {
                    this.trigger();
                }
            }.bind(this));
        }
    });

}(window.angular));
