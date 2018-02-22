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
    var explode_array =  Array.from({length: 12}, () => Math.floor(Math.random() * 20));
    var maximal_pumps = 186;
    var pumpmeup; // number pumps in a given round; is updated each round
    var number_pumps = []; // arrays for saving number of pumps
    var exploded = []; // array for saving whether ballon has exploded
    var explosion; // will an explosion occur? 1 = yes, 0 = no
    var last_win = 0; // initialize variable that contains the win of the previous round
    var current_win = 0;

    var id1 = $('#uid').text();
    console.log(id1);
    
    
    // initialize language
    var label_press = 'PUMP';
    var label_collect = 'COLLECT $';
    var label_balance = 'Balance:';
    var label_last = 'Last Round:';
    var label_current = 'Current Round:';
    var label_currency = ' $';
    var total_term= 'Total Money you Earned ';
    var label_header = 'Round ';
    var label_gonext1 = 'Next Balloon';
    var label_gonext2 = 'Save and Continue';
    var msg_explosion1 = '<p>The balloon popped ! ';
    var msg_explosion2 = 'You did not earn any money in this round.</p>';

    var msg_collect1 = '<p>Money saved ! ';
    var msg_collect2 = '  You can see your balance at the bottom of the screen</p>';

    var msg_end1 = '<p>TThank you for playing the Balloon Game. Please go back to the survey. ';
    var msg_end2 = ' ';

    var err_msg = 'Please press air into balloon';
    var messagesRef = firebase.database().ref('messages');
   // document.getElementById('surveyForm').addEventListener('submit', submitForm);
    var el = document.getElementById('surveyForm');
    if(el){
        el.addEventListener('submit', submitForm);
        }




    // initialize labels
    $('#press').html(label_press);
    $('#collect').html(label_collect);
    $('#total_term').html(label_balance);
    $('#total_value').html(total + label_currency);
    $('#last_term').html(label_last);
    $('#last_value').html(last_win + label_currency);
    
    $('#Current_value').html(current_win + label_currency);
    $('#Current_term').html(label_current);
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
        current_win=pumps;
        current_value();
         $('#Current').show();
        $('#ballon').width(size);
        $('#ballon').height(size);
        $('#ballon').show();
        if(round< 3){
            $('#round').html('<h2>' + label_header + round + ' (Trial) <h2>');
        }else{
             $('#round').html('<h2>' + label_header + ( round - 2 ) + '<h2>');
        }
        
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
        $('#Current').remove();
        $('#ssubmit').show();
        store_data();
        $('#bigwrap').hide();
    };
    
    var store_data = function () {
        var id1 = $('#uid').text();
        console.log(id1);
            var clientip=$('#ipad').text();
         $("#userIP").val(clientip);
        $("#userId").val(id1);
        $("#numberOfPumps").val(number_pumps);
        $("#noOfExplosen").val(exploded);
        $("#Total").val(total.toFixed(2));
        $("#TotalMoney").val((total*0.02).toFixed(2));
         $('#EarnM').html(total_term + (total*0.02).toFixed(2) + label_currency);

    };

    // message shown if balloon explodes
    var explosion_message = function () {
        $('#collect').hide();
        $('#press').hide();
        $('#Current').hide();
        $('#message').html(msg_explosion1 + msg_explosion2).show();
    };

    // message shown if balloon does not explode
    var collected_message = function () {
        $('#collect').hide();
        $('#press').hide();
        $('#Current').hide();
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
        $('#total_value').html((total*0.02).toFixed(2) + label_currency);
    };

    var show_last = function () {
        $('#last_value').html((last_win*0.02).toFixed(2) + label_currency);
    };
    
    var current_value = function(){
         $('#Current_value').html((current_win*0.02).toFixed(2) + label_currency);
    };

    // button functionalities

    // pump button functionality
    $('#press').click(function () {
        if (pumps >= 0 && pumps < maximal_pumps) { // interacts with the collect function, which sets pumps to -1, making the button temporarily unclickable
            explosion = 0; // is set to one if pumping goes beyond explosion point; see below
            pumps += 1;
             current_win =pumps; 
                current_value();
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


       
    
    function submitForm(e) {
        e.preventDefault();

        // Get values
        var UserID = getInputVal('userId');
        var UserIP = getInputVal('userIP');
        var NumberofPupms = getInputVal('numberOfPumps');
        var NumberofExpln = getInputVal('noOfExplosen');
        var TotalMoney = getInputVal('TotalMoney');
        
        
        
        // Save message
       
        saveMessage(UserID, NumberofPupms, NumberofExpln, TotalMoney,UserIP);

        // Show alert
        document.querySelector('.alert').style.display = 'block';

        // Hide alert after 3 seconds
        setTimeout(function () {
            document.querySelector('.alert').style.display = 'none';
        }, 3000);

        // Clear form
        $('#surveyForm').hide();
        window.location = "https://ubcbusiness.qualtrics.com/jfe/form/SV_2uEXrMHhS6O59dz";
    }
    
    

    function saveMessage(UserID, NumberofPupms, NumberofExpln, TotalMoney,UserIP) {
        var newMessageRef = messagesRef.push();
        newMessageRef.set({
            UserID: UserID,
            NumberofPupms: NumberofPupms,
            NumberofExpln: NumberofExpln,
            TotalMoney: TotalMoney,
            UserIP:UserIP
        });
    }

    function getInputVal(id) {
        return document.getElementById(id).value;
    }

    // start the game!
    new_round();


});
