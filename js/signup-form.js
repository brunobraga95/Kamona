/**
 * Created by Bruno Braga on 08/04/2016.
 */
function LiveLinks(fbname) {
    var firebase = new Firebase("https://"+ fbname + ".firebaseio.com");
    this.firebase = firebase;
    var kamonaUsers= this.firebase.child('kamona/users');
    this.kamonaUsers= kamonaUsers;
    console.log("kamonaUsers:"+this.kamonaUsers);
    var uid;
    var instance = this;

    //overridable functions
    this.onLogin = function(user) {};
    this.onLoginFailure = function() {};
    this.onLogout = function() {};
    this.onError = function(error) {};

    // long running firebase listener
    this.start = function() {
        firebase.onAuth(function (authResponse) {
            if (authResponse) {
                console.log("user is logged in");
                kamonaUsers.child(authResponse.uid).once('value', function(snapshot) {
                    console.log(snapshot.val());
                    console.log(authResponse);
                        instance.userData = authResponse;
                    instance.onLogin(snapshot.val());
                });
            } else {
                console.log("user is logged out");
                instance.onLogout();
            }
        });
    };

    this.uid = function() {return uid;};
    // signup with an alias
    this.signup = function(email,password,name,lastname) {
        this.firebase.createUser({
            email : email,
            password : password
        }, function(error, userData) {
            if (error) {
                instance.onError("Error creating user" + error);
                console.log(error);
            }
            else {
                instance.userData = userData;
                console.log("user data",userData);
                kamonaUsers.child(userData.uid).set({
                    "email":email,
                    "name":name,
                    "lastname":lastname,
                    "uid":userData.uid
                }, function(error) {
                    if (error) {
                        instance.onError(error);
                        console.log(error);
                    }
                    else {
                        instance.login(email,password);
                    }
                });
            }
        });
        return false;
    };
    // login with email and password
    this.login = function(email,password) {
        this.firebase.authWithPassword({
            email: email,
            password : password
        }, function(error, authData) {
            if (!error) {
                instance.auth = authData;
                console.log("uid loged in:", authData.uid);
            } else {
                instance.onError("login failed! " + error);
                instance.onLoginFailure();
            }
        }, {
            remember : "sessionOnly"
        });
    };
    this.loginFacebook = function(email,password) {
        this.firebase.authWithOAuthPopup("facebook", function(error, authData) {
            if (error) {
                console.log("Login Failed!", error);
            } else {
                console.log("Authenticated successfully with payload:", authData);
                instance.auth = authData;
                console.log("uid:", authData.uid);
                instance.userData = authData,
                    kamonaUsers.child(authData.uid).set({
                        "name":authData.facebook.displayName,
                    }, function(error) {
                        if (error) {
                            instance.onError(error);
                            console.log(error);
                        }

                    });
            }
        },{
            remember : "sessionOnly"
        });
    };
    // logout
    this.logout = function() {
        this.firebase.unauth();
        instance.auth=null;
    };
}

$(function(){

    $('footer').hide();
    $('header').hide();
    $('body').css('background', '#000 url(images/capa_protesto.jpg) no-repeat');
    $(".container").hide();
    var ll = new LiveLinks("brunobraga");
    $('.tab a').on('click', function (e) {

        e.preventDefault();

        $(this).parent().addClass('active');
        $(this).parent().siblings().removeClass('active');

        target = $(this).attr('href');

        $('.tab-content > div').not(target).hide();

        $(target).fadeIn(600);

    });

    $("#signup-button").on('click',function(e){
        e.preventDefault();
        ll.signup($("#user-email").val(),$("#user-password").val(),$("#first-name").val(),$("#last-name").val());
    });

    $("#facebook-login-button").on('click',function(e){
        ll.loginFacebook();
    });

    $("#login-button").on('click',function(e){
        e.preventDefault();
        ll.login($("#login-user-email").val(),$("#login-user-password").val());
    });

    ll.onLogin = function(user) {
        $(".form").hide();
        $('body').css('background', '#E9EAED');
        $('footer').show();
        $('#header').hide();
        $('header').show();
        $(".container").show();
        if(ll.userData.hasOwnProperty("facebook")){
            $(".user-photo").attr("src",ll.userData.facebook.profileImageURL);
            $(".first-name").html(ll.userData.facebook.displayName);
        }
        else{
            $(".first-name").html(user.name);
            $(".last-name").html(user.lastname);
            $(".user-photo").attr("src",ll.userData.password.profileImageURL);
        }

    };

    ll.onLogout = function() {
        console.log("in onLogout");
        $(".form").show();
    };

    ll.onLoginFailure = function() {
        console.log("in onLoginFailure");
        $(".form").show();
    };

    $('.form').find('input, textarea').on('keyup blur focus', function (e) {

        var $this = $(this),
            label = $this.prev('label');

        if (e.type === 'keyup') {
            if ($this.val() === '') {
                label.removeClass('active highlight');
            } else {
                label.addClass('active highlight');
            }
        } else if (e.type === 'blur') {
            if( $this.val() === '' ) {
                label.removeClass('active highlight');
            } else {
                label.removeClass('highlight');
            }
        } else if (e.type === 'focus') {

            if( $this.val() === '' ) {
                label.removeClass('highlight');
            }
            else if( $this.val() !== '' ) {
                label.addClass('highlight');
            }
        }

    });
    ll.logout();
// start firebase auth listener only after all callbacks are in place
    ll.start();
});
