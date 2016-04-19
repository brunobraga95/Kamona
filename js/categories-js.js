/**
 * Created by Bruno Braga on 15/04/2016.
 */
$(function(){
    $(".ask-question-button").on('click',function(e){
        var firebase = new Firebase("https://brunobraga.firebaseio.com");
        var userNewTopic= firebase.child("kamona/users").child(uid).child("topics_created");
        userNewTopic = userNewTopic.push();
        userNewTopic.set({
            "categorie":current_categorie,
            "topic":$(".title-question-form").val(),
            "description":$(".question-form").val(),
            "date":Firebase.ServerValue.TIMESTAMP
        });

        var NewTopic = firebase.child("kamona/topics").child(current_categorie);
        newTopic = newTopic.push();
        userNewTopic.set({
            "user":uid,
            "topic":$(".title-question-form").val(),
            "description":$(".question-form").val(),
            "date":Firebase.ServerValue.TIMESTAMP
        });

    });

});