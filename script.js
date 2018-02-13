// standard version of the BART

$(document).ready(function () {

    var config = {
        apiKey: "AIzaSyCQD8-6FZebvC-rqaiAQtJumVc_aOvGRh0",
        authDomain: "survey-b0ce3.firebaseapp.com",
        databaseURL: "https://survey-b0ce3.firebaseio.com",
        projectId: "survey-b0ce3",
        storageBucket: "",
        messagingSenderId: "390860367232"
    };
    firebase.initializeApp(config);
    var saveThis = 'hidden'; // text fields that saves data should not be shown; can be shown in testing

    // initialize values
    var round = 0;
    var start_size = 150; // start value of widht & height of the image; must correspond to the value that is specified for the #ballon id in style.css
    var increase = 2; // number of pixels by which balloon is increased each pump
    var size; // start_size incremented by 'increase'
    var pumps;
    var total = 0; // money that has been earned in total
    var rounds_played = 12;
    var explode_array = Array.from({length: 10}, () => Math.floor(Math.random() * 40));
    var maximal_pumps = 186;
    var pumpmeup; // number pumps in a given round; is updated each round
    var number_pumps = []; // arrays for saving number of pumps
    var exploded = []; // array for saving whether ballon has exploded
    var explosion; // will an explosion occur? 1 = yes, 0 = no
    var last_win = 0; // initialize variable that contains the win of the previous round

    // initialize language
    var label_press = 'Press Ballon';
    var label_collect = 'Collect money';
    var label_balance = 'Balance:';
    var label_last = 'Last Round:';
    var label_currency = ' $';
    var label_header = 'Rounde NO ';
    var label_gonext1 = 'Next Round';
    var label_gonext2 = 'Save and Continue';
    var msg_explosion1 = '<p>The Balloon burst! ';
    var msg_explosion2 = ' You didnt earn any money in this round</p>';

    var msg_collect1 = '<p>The Balloon didnt burst! ';
    var msg_collect2 = '  Your money has been saved!</p>';

    var msg_end1 = '<p>This completes this part of the study. You are in the balloon game ';
    var msg_end2 = ' Taler profit made. </p><p> click on <i> Continue</i>, to continue with the study.</p>';

    var err_msg = 'Error."';
    var messagesRef = firebase.database().ref('messages');
    document.getElementById('surveyForm').addEventListener('submit', submitForm);



    // initialize labels
    $('#press').html(label_press);
    $('#collect').html(label_collect);
    $('#total_term').html(label_balance);
    $('#total_value').html(total + label_currency);
    $('#last_term').html(label_last);
    $('#last_value').html(last_win + label_currency);

    // below: create functions that define game functionality



    // what happens when a new round starts
    var new_round = function () {
        console.log(round);
        $('#gonext').hide();
        $('#message').hide();
        $('#collect').show();
        $('#press').show();
        round += 1;
        size = start_size;
        pumps = 0;
        $('#ballon').width(size);
        $('#ballon').height(size);
        $('#ballon').show();
        $('#round').html('<h2>' + label_header + round + '<h2>');
        console.log(round);

    };

    // what happens when the game ends
    var end_game = function () {
        $('#total').remove();
        $('#collect').remove();
        $('#ballon').remove();
        $('#press').remove();
        $('#gonext').remove();
        $('#round').remove();
        $('#last_round').remove();
        //$('#goOn').show();
        // $('#message').html(msg_end1+total+msg_end2).show();
        // store_data(); // note: this function needs to be defined properly

        $('#ssubmit').show();
        store_data();
        $('#bigwrap').hide();
    };
    
    // Important: this function will have to be replaced to ensure that
    // the data is actually sent to _your_ server: 
    var store_data = function () {
        var id1 = $('#uid').text();
        console.log(id1);
        $("#userId").val(id1);
        $("#numberOfPumps").val(number_pumps);
        $("#noOfExplosen").val(exploded);
        $("#Total").val(total);

    };

    // message shown if balloon explodes
    var explosion_message = function () {
        $('#collect').hide();
        $('#press').hide();
        $('#message').html(msg_explosion1 + msg_explosion2).show();
    };

    // message shown if balloon does not explode
    var collected_message = function () {
        $('#collect').hide();
        $('#press').hide();
        $('#message').html(msg_collect1 + msg_collect2).show();
    };

    // animate explosion using jQuery UI explosion
    var balloon_explode = function () {
        $('#ballon').hide("explode", {
            pieces: 48
        }, 1000);

        // activate this if you have a sound file to play a sound
        // when the balloon explodes:

        // document.getElementById('explosion_sound').play();
    };

    // show button that starts next round
    var gonext_message = function () {
        $('#ballon').hide();
        if (round < rounds_played) {
            $('#gonext').html(label_gonext1).show();
        } else {
            $('#gonext').html(label_gonext2).show();
        }
    };

    // add money to bank
    var increase_value = function () {
        $('#total_value').html((total*0.05) + label_currency);
    };

    var show_last = function () {
        $('#last_value').html((last_win*0.05) + label_currency);
    };

    // button functionalities

    // pump button functionality
    $('#press').click(function () {
        if (pumps >= 0 && pumps < maximal_pumps) { // interacts with the collect function, which sets pumps to -1, making the button temporarily unclickable
            explosion = 0; // is set to one if pumping goes beyond explosion point; see below
            pumps += 1;
            if (pumps < explode_array[round - 1]) {
                size += increase;
                $('#ballon').width(size);
                $('#ballon').height(size);
            } else if(round > 2) {
                last_win = 0;
                pumpmeup = pumps;
                pumps = -1; // makes pumping button unclickable until new round starts
                explosion = 1; // save that balloon has exploded this round
                balloon_explode();
                exploded.push(explosion); // save whether balloon has exploded or not
                number_pumps.push(pumpmeup); // save number of pumps
                setTimeout(explosion_message, 1200);
                setTimeout(gonext_message, 1200);
                setTimeout(show_last, 1200);
            }
            else if(round < 3){
                last_win = 0;
                pumpmeup = pumps;
                pumps = -1; // makes pumping button unclickable until new round starts
                explosion = 1; // save that balloon has exploded this round
                balloon_explode();
                setTimeout(explosion_message, 1200);
                setTimeout(gonext_message, 1200);
                setTimeout(show_last, 1200);
            }
        }
    });


    // collect button: release pressure and hope for money
    $('#collect').click(function () {
        if (pumps === 0) {
            alert(err_msg);
        } else if (pumps > 0 && round > 2) { // only works after at least one pump has been made
            exploded.push(explosion); // save whether balloon has exploded or not
            // activate this if you have a sound file to play a sound
            // when the balloon does not explode:

            // document.getElementById('tada_sound').play(); 
            number_pumps.push(pumps); // save number of pumps
            pumpmeup = pumps;
            pumps = -1; // makes pumping button unclickable until new round starts
            $('#ballon').hide();
            collected_message();
            gonext_message();
            total += pumpmeup;
            last_win = pumpmeup;
            increase_value();
            show_last();
        }
        else if(pumps > 0 && round < 3){
            pumpmeup = pumps;
            pumps = -1; // makes pumping button unclickable until new round starts
            $('#ballon').hide();
            collected_message();
            gonext_message();
            last_win = pumpmeup;
            show_last();
        }
    });

    // click this button to start the next round (or end game when all rounds are played)
    $('#gonext').click(function () {
        if (round < rounds_played) {
            console.log(number_pumps);
            console.log(exploded);
            new_round();

        } else {
            console.log(number_pumps);
            console.log(exploded);
            end_game();

        }
    });

    // continue button is shown when the game has ended. This needs to be replaced
    // by a function that takes into account on which platform the BART runs (i.e.
    // how will the page be submitted?)
    //  $("#goOn").click(function () {
    //    $("form[name=f1]").submit();
    //    });


    function submitForm(e) {
        e.preventDefault();

        // Get values
        var UserID = getInputVal('userId');
        var NumberofPupms = getInputVal('numberOfPumps');
        var NumberofExpln = getInputVal('noOfExplosen');
        var Total = getInputVal('Total');

        // Save message
        saveMessage(UserID, NumberofPupms, NumberofExpln, Total);

        // Show alert
        document.querySelector('.alert').style.display = 'block';

        // Hide alert after 3 seconds
        setTimeout(function () {
            document.querySelector('.alert').style.display = 'none';
        }, 3000);

        // Clear form
        $('#surveyForm').hide();
    }

    function saveMessage(UserID, NumberofPupms, NumberofExpln, Total) {
        var newMessageRef = messagesRef.push();
        newMessageRef.set({
            UserID: UserID,
            NumberofPupms: NumberofPupms,
            NumberofExpln: NumberofExpln,
            Total: Total
        });
    }

    function getInputVal(id) {
        return document.getElementById(id).value;
    }

    // start the game!
    new_round();


});
