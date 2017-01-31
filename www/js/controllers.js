angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
            $scope.closeLogin();
        }, 1000);
    };
})

.controller('PlaylistsCtrl', function($scope) {
    $scope.playlists = [
        { title: 'Reggae', id: 1 },
        { title: 'Chill', id: 2 },
        { title: 'Dubstep', id: 3 },
        { title: 'Indie', id: 4 },
        { title: 'Rap', id: 5 },
        { title: 'Cowbell', id: 6 }
    ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {})
.controller('CroppieCtrl', function($scope, $timeout, $cordovaImagePicker, $cordovaCamera, $http, $ionicLoading, $ionicModal) {
    // document.addEventListener("deviceready", function () {
        var el = document.getElementById('image-preview');
        var feedUploader = null;
        var imgUrl = null; // User selected image
        /*
        * orientation 1 = width > height
        * orientation 2 = width < height
        *
        * Default orientation is 1
        */
        var orientation = 1;

        // Show/Hide next, rotate, and label
        $scope.show = false;

        // Default selected category
        $scope.feed = {
            category:"Make-up"
        }

        // Default option for croppie
        feedUploader = new Croppie(el, {
            viewport: {
                width: 250,
                height: 180
            },
            boundary: {
                width: 300,
                height: 300
            }
        });

        // Called when user rotate the crop orientation
        $scope.rotate = function(){
            // Destroy the old croppie object
            feedUploader.destroy();

            // Create a new croppie object based on the orientation selected
            if(orientation==2){
                orientation = 1;
                feedUploader = new Croppie(el, {
                    viewport: {
                        width: 250,
                        height: 180
                    },
                    boundary: {
                        width: 300,
                        height: 300
                    }
                });
            }else{
                orientation = 2;
                feedUploader = new Croppie(el, {
                    viewport: {
                        width: 180,
                        height: 250
                    },
                    boundary: {
                        width: 300,
                        height: 300
                    }
                });
            }
            addImage();
        }

        // Add/Bind image url feedUploader object to display and crop image
        function addImage(){
            if(imgUrl){
                feedUploader.bind({
                    url: imgUrl
                });

                // Show the hidden div that contains the image to be crop
                $timeout(function(){
                    $scope.show = true;
                });
            }
        }

        // Called when user selects gallery option.
        $scope.gallery = function(){
            // http://ngcordova.com/docs/plugins/imagePicker/
            var options = {
                maximumImagesCount: 1,
                width: 0,
                height: 0,
                quality: 100
            };

            $cordovaImagePicker.getPictures(options)
            .then(function(result) {
                imgUrl = result[0];
                addImage();
            }, function(error) {
                // error getting photos
            });

        }

        // Called when user selects camera option.
        // Open camera for photo capture
        $scope.camera = function(){

            // http://ngcordova.com/docs/plugins/camera/
            var options = {
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType: Camera.PictureSourceType.CAMERA,
            };
            
            $cordovaCamera.getPicture(options).then(function(imageURI) {
                imgUrl = imageURI;
                addImage();
            }, function(err) {
                // error
                $timeout(function(){
                    alert(error);
                },50);
            });

        }

        // Create the feed-upload modal that we will use later
        $ionicModal.fromTemplateUrl('templates/feed-upload.html', {
            scope: $scope // allow modal to access $scope variable
        }).then(function(modal) {
            $scope.modal = modal;
        });


        // Triggered in the feed modal to close it
        $scope.closeFeedModal = function() {
            $scope.modal.hide();
        };


        // Called when user click next after cropping the image
        $scope.next = function() {
            $ionicLoading.show();
            feedUploader.result({
                type: 'base64',
                format: 'jpeg'
            }).then(function(base64) {
                $timeout(function(){
                    $scope.base64ImageData = base64;
                    $scope.modal.show();
                    $ionicLoading.hide();
                }); 
            });
        }

        function validate_link(link){

            var patt = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
            var result = patt.exec(link);

            if(result!=null){
                return result[0];
            }else{
                return false;
            }
        }


         // Triggered in the feed modal to close it
        $scope.uploadFeed = function(feed) {

            if(feed.link){
                if(validate_link(feed.link)){
                    feed.link = validate_link(feed.link);
                }else{
                    // Not a valid link
                    alert("Please enter a valid link");
                    return;
                }
            }else{
                delete feed.link;
            }
            console.log(feed);

            var re = /#(\w+)(?!\w)/g, hashTag, tagsValue = [];
            while (hashTag = re.exec(feed.description)) {
                tagsValue.push(hashTag[1]);
            }
            console.log(tagsValue);
            alert(JSON.stringify(tagsValue));
            alert(JSON.stringify(feed));
            return;
            // Continue only if description, and base64ImageData is present
            $ionicLoading.show();

            // Upload to server
            $http({
                method: 'POST',
                url: 'http://139.162.27.64/api/image-upload-base64',
                data: {
                    imgType : 'feeds',
                    path : 'feed-id',
                    img : $scope.base64ImageData
                }
            }).then(function successCallback(response) {
                $ionicLoading.hide();
                $timeout(function(){
                    $scope.closeFeedModal();
                    alert(response.data.imageName);
                    // TODO
                    // Upload data to firbase
                });
            }, function errorCallback(error) {
                $ionicLoading.hide();
                alert("Please check your internet connection try again.");
            });
            
        };
    // }, false);
})
