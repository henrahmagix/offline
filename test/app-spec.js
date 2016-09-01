describe('Offline', function () {

    beforeEach(function () {

        module('app');

        this.CONFIG_MOCK = {
            OFFLINE: {
                STORAGE_MODE: 'memory'
            }
        };

        var testRunner = this;
        module(function ($provide) {
            $provide.constant('CONFIG', testRunner.CONFIG_MOCK);
        });

        inject(function ($rootScope, $componentController, $httpBackend, connectionStatus) {
            this.$rootScope = $rootScope;
            this.$componentController = $componentController;
            this.$httpBackend = $httpBackend;
            this.connectionStatus = connectionStatus;
        });

        spyOn(this.connectionStatus, 'isOnline');
        this.setOnline = function (status) {
            this.connectionStatus.isOnline.and.returnValue(status);
            const event = document.createEvent('HTMLEvents');
            event.initEvent('online', true, true);
            event.name = 'online';
            window.dispatchEvent(event);
        };
        this.setOnline(true);

    });

    afterEach(function () {
        this.$httpBackend.verifyNoOutstandingExpectation();
        this.$httpBackend.verifyNoOutstandingRequest();
    });

    describe('clickPost', function () {

        beforeEach(function () {

            this.ctrl = this.$componentController('clickPost');

        });

        it('should post regularly when online', function () {
            this.$httpBackend.expectPOST('/post')
                .respond('post response');
            this.ctrl.post();
            this.$rootScope.$apply();
            this.$httpBackend.flush();
            expect(this.ctrl.result).toBe('post response');
        });

        it('should not post when offline', function () {
            this.setOnline(false);
            this.ctrl.post();
            this.$rootScope.$apply();
            expect(this.ctrl.result).toBeUndefined();
        });

        it('should store post requests when offline and send them when online', function () {
            let counter = 0;
            this.$httpBackend.whenPOST('/post')
                .respond(function () {
                    counter++;
                    return [200, 'result' + counter];
                });

            this.setOnline(false);
            this.$httpBackend.expectPOST('/post');
            this.ctrl.post();
            this.$httpBackend.expectPOST('/post');
            this.ctrl.post();

            this.$rootScope.$apply();
            expect(this.ctrl.result).toBeUndefined();

            this.setOnline(true);
            this.$rootScope.$apply();
            this.$httpBackend.flush();
            expect(this.ctrl.result).toBe('result2');

            this.setOnline(false);
            this.$httpBackend.expectPOST('/post');
            this.ctrl.post();

            this.$rootScope.$apply();
            expect(this.ctrl.result).toBe('result2');

            this.setOnline(true);
            this.$rootScope.$apply();
            this.$httpBackend.flush();
            expect(this.ctrl.result).toBe('result3');
        });

    });

});
