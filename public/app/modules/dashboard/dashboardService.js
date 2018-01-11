
dashboard.service('dashboardService', ['$http', '$q', 'Flash', 'apiService', function ($http, $q, Flash, apiService) {

    var dashboardService = {};


    //service to communicate with users model to verify login credentials
    var accessLogin = function (parameters) {
        var deferred = $q.defer();
        apiService.get('users', parameters).then((response) => {
            if (response) {
                deferred.resolve(response);
            }
            else {
                deferred.reject('Something went wrong while processing your request. Please Contact Administrator.');
            }
        },
            (response) => {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    //service to communicate with users to include a new user
    var registerUser = function (parameters) {
        var deferred = $q.defer();
        apiService.create('users', parameters).then(function (response) {
            if (response) {
                deferred.resolve(response);
            }
            else {
                deferred.reject('Something went wrong while processing your request. Please Contact Administrator.');
            }
        },
            (response) => {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    /* Function to emulate the for i in range with AngularJS 
     * for (min, max, step) {
     *     do something;
     * }
     */
    var range = function (min, max, step) {
        step = step || 1;
        const input = [];
        let i;
        for (i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };

    dashboardService.accessLogin = accessLogin;
    dashboardService.registerUser = registerUser;

    return dashboardService;
}]);
