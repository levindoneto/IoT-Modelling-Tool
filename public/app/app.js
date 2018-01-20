var app = angular.module('app', [
    'ui.router',
    'ui.bootstrap',
    'flash',
    'login',
    'dashboard',
    'firebase',
    'ngFileUpload'
]);

app.config([
    '$stateProvider',
    '$locationProvider',
    '$urlRouterProvider',
    function (
        $stateProvider,
        $locationProvider,
        $urlRouterProvider,
        $modalInstance
    ) {
        //IdleScreenList
        $stateProvider.state('app', {
            url: '/app',
            templateUrl: 'app/common/app.html',
            controller: 'appCtrl',
            controllerAs: 'vm',
            data: {
                pageTitle: 'Login'
            }
        });
        $urlRouterProvider.otherwise('login');
    }
]);

// set global configuration of application and it can be accessed by injecting appSettings in any modules
app.constant('appSettings', appConfig);
