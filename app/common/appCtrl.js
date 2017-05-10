
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
      userDB.haveNotification = false;
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


            var ref = firebase.database().ref('notifications/');
            var notificationsList = $firebaseArray(ref);
            notificationsList.$loaded().then(function(){
                $scope.notifications = notificationsList;
            });


            user.$loaded().then(function(){
                console.log(user);
                $rootScope.user = user;
                console.log($rootScope.user)
                //Check if it is banned CPF
                var refBan = firebase.database().ref('admin/banned');
                var bannedList = $firebaseArray(refBan);
                var alreadyExist = false;
                bannedList.$loaded().then(function(){
                    angular.forEach(bannedList, function(cpf) {
                        console.log(cpf);
                        if(user.CPF == cpf.$value){
                            Flash.create('danger', 'CPF - Banido!', 'large-text');
                            vm.auth.$signOut();


                        }
                    })

                });
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
            title: "Cinza escuro",
            icon:""
        },
        {
            theme: "black",
            color: "skin-black-light",
            title: "Branco",
            icon:"-o"
        },
        {
            theme: "blue",
            color: "skin-blue",
            title: "Azul com cinza",
            icon:""
        },
        {
            theme: "blue",
            color: "skin-blue-light",
            title: "Branco com azul",
            icon:"-o"
        },
        {
            theme: "green",
            color: "skin-green",
            title: "Cinza com verde",
            icon:""
        },
        {
            theme: "green",
            color: "skin-green-light",
            title: "Branco com verde",
            icon:"-o"
        },
        {
            theme: "yellow",
            color: "skin-yellow",
            title: "Amarelo com cinza",
            icon:""
        },
        {
            theme: "yellow",
            color: "skin-yellow-light",
            title: "Branco com amarelo",
            icon:"-o"
        },
        {
            theme: "red",
            color: "skin-red",
            title: "Vermelho com cinza",
            icon: ""
        },
        {
            theme: "red",
            color: "skin-red-light",
            title: "Branco com vermelho",
            icon: "-o"
        },
        {
            theme: "purple",
            color: "skin-purple",
            title: "Cinza com roxo",
            icon: ""
        },
        {
            theme: "purple",
            color: "skin-purple-light",
            title: "Roxo com branco",
            icon: "-o"
        },
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
            title: "Digital Environment",
            icon: "exchange",
            state: "trades"
        },
        {
            title: "My Models",
            icon: "book",
            state: "mymodels"
        },
        {
            title: "Add Model",  // Can be devices, actuators or sensors
            icon: "plus-circle",
            state: "addmodel"
        },
        {
            title: "Search other Models",
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

    console.log('getting in to the app controller');

}]);
