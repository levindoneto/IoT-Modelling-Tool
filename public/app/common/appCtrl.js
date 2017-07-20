
app.controller("appCtrl", ['$rootScope', '$scope', '$state', '$location', 'Flash','appSettings','$firebaseAuth','$firebaseObject','$firebaseArray',
function ($rootScope, $scope, $state, $location, Flash,appSettings,$firebaseAuth,  $firebaseObject, $firebaseArray) {

    $rootScope.theme = appSettings.theme;
    $rootScope.layout = appSettings.layout;

    var vm = this;
    vm.auth = $firebaseAuth();

$scope.readNotification = function(){

  var ref = firebase.database().ref('users/'+$rootScope.userDB.uid)
  var userDB = $firebaseObject(ref);
  userDB.$loaded().then(function(){
      userDB.$save().then(function(ref) {

      }, function(error) {
          console.log("Error:", error);
      });

  })
}

    vm.auth.$onAuthStateChanged(function(firebaseUser) {
        if (firebaseUser) {

            vm.currentUser = vm.auth.$getAuth();
            $rootScope.userDB = vm.currentUser;
            console.log(vm.currentUser.uid);
            var refUser = firebase.database().ref('users/'+vm.currentUser.uid);
            var user = $firebaseObject(refUser);

            user.$loaded().then(function(){
                console.log(user);
                $rootScope.user = user;
                console.log($rootScope.user)
                //Check if it is banned CPF
                var alreadyExist = false;
            });
            console.log(vm.currentUser);

        } else {
            console.log("Signed out");
            $state.go('login');
        }
    });

    //avalilable themes
    vm.themes = [
        {
            theme: "black",
            color: "skin-black",
            title: "Dark Blue",
            icon:""
        },
        {
            theme: "purple",
            color: "skin-purple",
            title: "Gray and Purple",
            icon: ""
        },
        {
            theme: "black",
            color: "skin-black-light",
            title: "White",
            icon:"-o"
        },
        {
            theme: "blue",
            color: "skin-blue",
            title: "Blue and Gray",
            icon:""
        },
        {
            theme: "blue",
            color: "skin-blue-light",
            title: "White and Blue",
            icon:"-o"
        },
        {
            theme: "green",
            color: "skin-green",
            title: "Gray and Green",
            icon:""
        },
        {
            theme: "green",
            color: "skin-green-light",
            title: "White and Green",
            icon:"-o"
        },
        {
            theme: "yellow",
            color: "skin-yellow",
            title: "Yellow and Gray",
            icon:""
        },
        {
            theme: "yellow",
            color: "skin-yellow-light",
            title: "White and Yellow",
            icon:"-o"
        },
        {
            theme: "red",
            color: "skin-red",
            title: "Red and Gray",
            icon: ""
        },
        {
            theme: "red",
            color: "skin-red-light",
            title: "White and Red",
            icon: "-o"
        },
        {
            theme: "purple",
            color: "skin-purple-light",
            title: "Purple and White",
            icon: "-o"
        }
    ];

    //available layouts
    vm.layouts = [
        {
            name: "Boxed",
            layout: "layout-boxed"
        },
        {
            name: "Fixed",
            layout: "fixed"
        },
        {
            name: "Sidebar Collapse",
            layout: "sidebar-collapse"
        },
    ];


    //Main menu items of the dashboard
    vm.menuItems = [
        {
            title: "My Account",
            icon: "user",
            state: "myaccount"
        },
        {
            title: "Add Default @Context",
            icon: "cubes",
            state: "adddefaultcontext"
        },
        {
            title: "Add Specific @Context",
            icon: "linode",
            state: "addspecificcontext"
        },
        {
            title: "Add Default @Graph",
            icon: "compass",
            state: "adddefaultgraph"
        },
        {
            title: "My @Context",
            icon: "fa fa-tablet",
            state: "mycontext"
        },
        {
            title: "My @Graph",
            icon: "exchange",
            state: "mygraph"
        },
        {
            title: "IoT Modelling Environment",
            icon: "fa fa-home",
            state: "digitalenvironment"
        },
        {
            title: "Add Device",  // Can be devices, actuators or sensors
            icon: "plus-circle",
            state: "addbelonging"
        },
        {
            title: "My Devices",
            icon: "thermometer-three-quarters",
            state: "mybelongings"
        },
        {
            title: "Add Additional Properties",
            icon: "puzzle-piece",
            state: "addadditionalproperties"
        },
        {
            title: "Search",
            icon: "search",
            state: "search"
        },
    ];

    //set the theme selected
    vm.setTheme = function (value) {
        $rootScope.theme = value;
    };


    //set the Layout in normal view
    vm.setLayout = function (value) {
        $rootScope.layout = value;
    };


    //controll sidebar open & close in mobile and normal view
    vm.sideBar = function (value) {
        if($(window).width()<=767){
            if ($("body").hasClass('sidebar-open'))
            $("body").removeClass('sidebar-open');
            else
            $("body").addClass('sidebar-open');
        }
        else {
            if(value==1){
                if ($("body").hasClass('sidebar-collapse'))
                $("body").removeClass('sidebar-collapse');
                else
                $("body").addClass('sidebar-collapse');
            }
        }
    };

    //navigate to search page
    vm.search = function () {
        $state.go('app.search');
    };

    console.log('getting into the app controller');

}]);
