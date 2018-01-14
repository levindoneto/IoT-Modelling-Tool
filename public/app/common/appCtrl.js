

app.controller('appCtrl', ['$rootScope', '$scope', '$state', '$location', 'Flash', 'appSettings', '$firebaseAuth', '$firebaseObject',
function ($rootScope, $scope, $state, $location, Flash, appSettings, $firebaseAuth, $firebaseObject) {
    const vm = this;
    $rootScope.theme = appSettings.theme;
    $rootScope.layout = appSettings.layout;
    vm.auth = $firebaseAuth();

    vm.auth.$onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
            vm.currentUser = vm.auth.$getAuth();
            $rootScope.userDB = vm.currentUser;
            const refUser = firebase.database().ref(`users/${vm.currentUser.uid}`);
            const user = $firebaseObject(refUser);
            localStorage.setItem('loggedUser', vm.currentUser.uid);
            user.$loaded().then(() => {
                $rootScope.user = user;
                var alreadyExist = false;
            });
        } else {
            $state.go('login');
        }
    });

    //avalilable themes
    vm.themes = [
        {
            theme: 'black',
            color: 'skin-black',
            title: 'Dark Blue',
            icon:''
        },
        {
            theme: 'purple',
            color: 'skin-purple',
            title: 'Gray and Purple',
            icon: ''
        },
        {
            theme: 'black',
            color: 'skin-black-light',
            title: 'White',
            icon:'-o'
        },
        {
            theme: 'blue',
            color: 'skin-blue',
            title: 'Blue and Gray',
            icon:''
        },
        {
            theme: 'blue',
            color: 'skin-blue-light',
            title: 'White and Blue',
            icon:'-o'
        },
        {
            theme: 'green',
            color: 'skin-green',
            title: 'Gray and Green',
            icon:''
        },
        {
            theme: 'green',
            color: 'skin-green-light',
            title: 'White and Green',
            icon:'-o'
        },
        {
            theme: 'yellow',
            color: 'skin-yellow',
            title: 'Yellow and Gray',
            icon:''
        },
        {
            theme: 'yellow',
            color: 'skin-yellow-light',
            title: 'White and Yellow',
            icon:'-o'
        },
        {
            theme: 'red',
            color: 'skin-red',
            title: 'Red and Gray',
            icon: ''
        },
        {
            theme: 'red',
            color: 'skin-red-light',
            title: 'White and Red',
            icon: '-o'
        },
        {
            theme: 'purple',
            color: 'skin-purple-light',
            title: 'Purple and White',
            icon: '-o'
        }
    ];

    // Available layouts
    vm.layouts = [
        {
            name: 'Boxed',
            layout: 'layout-boxed'
        },
        {
            name: 'Fixed',
            layout: 'fixed'
        },
        {
            name: 'Sidebar Collapse',
            layout: 'sidebar-collapse'
        },
    ];


    // Admins' menu items
    vm.menuItems = [
        {
            title: 'My Account',
            icon: 'user',
            state: 'myaccount'
        },
        {
            title: 'Add Default @Context',
            icon: 'cubes',
            state: 'adddefaultcontext'
        },
        {
            title: 'Add Specific @Context',
            icon: 'database',
            state: 'addspecificcontext'
        },
        {
            title: 'Add Default @Graph',
            icon: 'compass',
            state: 'adddefaultgraph'
        },
        {
            title: 'IoT Lite @Context',
            icon: 'bullseye',
            state: 'mycontext'
        },
        {
            title: 'IoT Lite @Graph',
            icon: 'exchange',
            state: 'mygraph'
        },
        {
            title: 'IoT Modelling Environment',
            icon: 'home',
            state: 'digitalenvironment'
        },
        {
            title: 'Add Device or Component',  // They can be devices, actuators or sensors
            icon: 'plus-circle',
            state: 'addbelonging'
        },
        {
            title: 'Devices and Components',
            icon: 'tablet',
            state: 'mybelongings'
        },
        {
            title: 'Add Additional Properties',
            icon: 'puzzle-piece',
            state: 'addadditionalproperties'
        },
        {
            title: 'Search',
            icon: 'search',
            state: 'search'
        },
    ];

    // Normal users' menu items
    vm.menuItemsNormalUser = [
        {
            title: 'My Account',
            icon: 'user',
            state: 'myaccount'
        },
        {
            title: 'IoT Modelling Environment',
            icon: 'home',
            state: 'digitalenvironment'
        }
    ];

    // Set the theme selected
    vm.setTheme = function (value) {
        $rootScope.theme = value;
    };


    // Set the Layout in normal view
    vm.setLayout = function (value) {
        $rootScope.layout = value;
    };


    // Controll sidebar open & close in mobile and normal view
    vm.sideBar = function (value) {
        if($(window).width()<=767){
            if ($('body').hasClass('sidebar-open'))
                $('body').removeClass('sidebar-open');
            else
                $('body').addClass('sidebar-open');
        } else {
            if(value==1){
                if ($('body').hasClass('sidebar-collapse'))
                    $('body').removeClass('sidebar-collapse');
                else
                    $('body').addClass('sidebar-collapse');
            }
        }
    };

    // Navigate to search page
    vm.search = function () {
        $state.go('app.search');
    };
}]);
