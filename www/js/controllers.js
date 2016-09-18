angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $timeout, Foods) {
  $scope.plotData = Foods.getPlotData();
  $scope.refreshDiaries = function () {
    $timeout(function () {
      $scope.plotData = Foods.getPlotData();
      $scope.$broadcast('scroll.refreshComplete');
    }, 1000);
  };
})

.controller('FoodsCtrl', function($scope, $state, $timeout, $ionicFilterBar, $ionicPopup, Foods) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  var filterBarInstance;

  $scope.showFilterBar = function () {
    filterBarInstance = $ionicFilterBar.show({
      items: $scope.foods,
      update: function (filteredItems, filterText) {
        $scope.foods = filteredItems;
        if (filterText) {
          console.log(filterText);
        }
      }
    });
  };
  $scope.add = function(view){
    $state.go(view);
  }
  $scope.refreshFoods = function () {
    if (filterBarInstance) {
      filterBarInstance();
      filterBarInstance = null;
    }
 
    $timeout(function () {
      $scope.foods = Foods.all();
      $scope.$broadcast('scroll.refreshComplete');
    }, 1000);
  };
  $scope.showPopup = function(food) {
    $scope.newDiary = {
      id: Foods.getDiaries().length,
      food: food,
    };
    $scope.data = {};
    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/foods-popup.html',
      title: 'Make a Calories Diary',
      subTitle: 'How Many Ozs and When did you eat '+food.name,
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Confirm</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.amount || !$scope.data.date || !$scope.data.time) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              var datetime = $scope.data.date.getFullYear()+'-'
              +("0"+($scope.data.date.getMonth()+1)).slice(-2)+'-'
              +("0"+$scope.data.date.getDate()).slice(-2)+'T'
              +("0"+$scope.data.time.getHours()).slice(-2)+':'
              +("0"+$scope.data.time.getMinutes()).slice(-2)+':'
              +("0"+$scope.data.time.getSeconds()).slice(-2);
              
              $scope.newDiary.amount = $scope.data.amount;
              $scope.newDiary.date = datetime;
              Foods.addDiary($scope.newDiary);
              return $scope.data;
            }
          }
        }
      ]
    });
  }

  $scope.foods = Foods.all();
  $scope.remove = function(food) {
    Foods.remove(food);
  };
})

.controller('AddCtrl', function($scope, $state, $cordovaCamera, Foods){
  $scope.foods = Foods.all();
  $scope.newFood = {
    id: $scope.foods.length,
    name: '',
    lastText: '',
    face: ''
  }

  $scope.takePhoto = function () {
    var options = {
      quality: 75,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 300,
      targetHeight: 300,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };

    $cordovaCamera.getPicture(options).then(function (imageData) {
      $scope.imgURI = "data:image/jpeg;base64," + imageData;
      $scope.newFood.face = $scope.imgURI;
    }, function (err) {
        // An error occured. Show a message to the user
    });
  };

  $scope.confirm = function () {
    Foods.add($scope.newFood);
    $scope.close();
  };
  $scope.close = function() {
    $state.go('tab.foods'); 
  };
})

.controller('FoodDetailCtrl', function($scope, $stateParams, Foods) {
  $scope.food = Foods.get($stateParams.foodId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
