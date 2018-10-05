// ==UserScript==
// @name         Wanikani Anki Mode
// @namespace    ezhmd
// @version      1.7.2
// @description  Anki mode for Wanikani
// @author       Ezzat Chamudi
// @match        https://www.wanikani.com/review/session*
// @match        http://www.wanikani.com/review/session*
// @grant        none
// @license      GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// ==/UserScript==

// Original author: Oleg Grishin <og402@nyu.edu>
// Modified by: https://community.wanikani.com/u/mempo
// Modified by: https://community.wanikani.com/u/ezhmd

console.log('/// Start of Wanikani Anki Mode');


// Save the original evaluator
var originalChecker = answerChecker.evaluate;

console.log(originalChecker);

var checkerYes = function (itemType, correctValue) {
    return {
        accurate: !0,
        passed: !0
    };
};

var checkerNo = function (itemType, correctValue) {
    return {
        accurate: !0,
        passed: 0
    };
};

var activated = false;
var answerShown = false;

//AUTOSTART
var autostart = false;

// MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function (mutations, observer) {
    $("#user-response").blur();
});

var WKANKIMODE_toggle = function () {

    if (activated) {
        if (autostart) {
            //DISABLE ANKI MODE
            $("#WKANKIMODE_anki").text("Anki Mode Off");
            $("#answer-form form button").prop("disabled", false);
            $("#user-response").off("focus");
            $("#user-response").focus();

            answerChecker.evaluate = originalChecker;
            observer.disconnect();

            localStorage.setItem("WKANKI_autostart", false);
            activated = false;
            autostart = false;
            console.log("back to #1");

        } else {
            //ENABLE AUTOSTART
            activated = true;
            autostart = true;
            localStorage.setItem("WKANKI_autostart", true);

            $("#WKANKIMODE_anki").text("Anki Mode Auto Start");

            // start observer to force blur
            observer.observe(document.getElementById("answer-form"), {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: false
            });
        }

    } else {
        //ENABLE ANKI MODE
        $("#WKANKIMODE_anki").text("Anki Mode On");
        $("#answer-form form button").prop("disabled", true);
        $("#user-response").on("focus", function () {
            $("#user-response").blur();
        });
        activated = true;
        autostart = false;
        // start observer to force blur
        observer.observe(document.getElementById("answer-form"), {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: false
        });
    }
};

var answerIndexZero = ""; // first answer for question with multiple answers
var answer = "";

var WKANKIMODE_showAnswer = function () {
    if (!$("#answer-form form fieldset").hasClass("correct") &&
        !$("#answer-form form fieldset").hasClass("incorrect") &&
        !answerShown) {
        var currentItem = $.jStorage.get("currentItem");
        var questionType = $.jStorage.get("questionType");
        if (questionType === "meaning") {
            answer = currentItem.en.join(", ");
            if (currentItem.syn.length) {
                answer += " (" + currentItem.syn.join(", ") + ")";
            }
            $("#user-response").val(answer);
        } else { //READING QUESTION
            var i = 0;
            answer = "";

            console.log(currentItem);

            if (currentItem.voc) {
                answerIndexZero = currentItem.kana[0];
                answer += currentItem.kana.join(", ");
            } else if (currentItem.emph == 'kunyomi') {
                answerIndexZero = currentItem.kun[0];
                answer += currentItem.kun.join(", ");
            } else if (currentItem.emph == 'nanori') {
                answerIndexZero = currentItem.nanori[0];
                answer += currentItem.nanori.join(", ");
            } else {
                answerIndexZero = currentItem.on[0];
                answer += currentItem.on.join(", ");
            }
            $("#user-response").val(answer);
        }
        answerShown = true;
    }
};

var WKANKIMODE_answerYes = function () {

    // Fix for multiple answers in reading
    if (answerIndexZero) {
        $("#user-response").val(answerIndexZero);
        answerIndexZero = "";
    }

    if (answerShown) {
        answerChecker.evaluate = checkerYes;
        $("#answer-form form button").click();
        answerShown = false;
        answerChecker.evaluate = originalChecker;
        return;
    }

    // if answer is shown, press '1' one more time to go to next
    if ($("#answer-form form fieldset").hasClass("correct") ||
        $("#answer-form form fieldset").hasClass("incorrect")) {
        $("#answer-form form button").click();
    }

};

var WKANKIMODE_answerNo = function () {

    // Fix for multiple answers in reading
    if (answerIndexZero) {
        $("#user-response").val(answerIndexZero);
        answerIndexZero = "";
    }

    if (answerShown) {
        answerChecker.evaluate = checkerNo;
        $("#answer-form form button").click();
        answerShown = false;
        answerChecker.evaluate = originalChecker;
        return;
    }

    if ($("#answer-form form fieldset").hasClass("correct") ||
        $("#answer-form form fieldset").hasClass("incorrect")) {
        $("#answer-form form button").click();
    }

};

/*jshint multistr: true */
var css = "\
    #WKANKIMODE_anki { \
        background-color: #000099; \
        margin: 0 5px; \
    } \
    #WKANKIMODE_yes { \
        background-color: #009900; \
        margin: 0 0 0 5px; \
    } \
    #WKANKIMODE_no { \
        background-color: #990000; \
    } \
    .WKANKIMODE_button { \
        display: inline-block; \
        font-size: 0.8125em; \
        color: #FFFFFF; \
        cursor: pointer; \
        padding: 10px; \
    } \
    #WKANKIMODE_anki.hidden { \
        display: none; \
    } \
    .incorrect { \
        background-color: #990000; \
        min-width: calc(25vw - 10px); \
        margin: 0 5px !important; \
    } \
    .correct { \
            background-color: #009900; \
            min-width: calc(25vw - 10px); \
            margin: 0 5px !important; \
        } \
    .show { \
        background-color: #000099; \
        min-width: calc(25vw - 10px); \
        margin: 0 5px !important; \
        } \
";

function addStyle(aCss) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (head) {
        style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.textContent = aCss;
        head.appendChild(style);
        return style;
    }
    return null;
}

var addButtons = function () {
    //CHECK AUTOSTART
    autostart = localStorage.getItem('WKANKI_autostart') === "true" ? true : false;

    $("<div />", {
            id: "WKANKIMODE_anki",
            title: "Anki Mode",
        })
        .text("Anki Mode Off")
        .addClass("WKANKIMODE_button")
        .on("click", WKANKIMODE_toggle)
        .prependTo("footer");

    // add physical buttons to press yes/no/show answer
    // made by https://community.wanikani.com/u/neicul

    $("<div />", {
            id: "WKANKIMODE_anki_incorrect",
            title: "No",
        })
        .text("Don't know")
        .addClass("WKANKIMODE_button incorrect")
        .on("click", WKANKIMODE_answerNo)
        .appendTo("#answer-form");

    $("<div />", {
            id: "WKANKIMODE_anki_show",
            title: "Show",
        })
        .text("Show")
        .addClass("WKANKIMODE_button show")
        .on("click", WKANKIMODE_showAnswer)
        .appendTo("#answer-form");

    $("<div />", {
            id: "WKANKIMODE_anki_correct",
            title: "Yes",
        })
        .text("Know")
        .addClass("WKANKIMODE_button correct")
        .on("click", WKANKIMODE_answerYes)
        .appendTo("#answer-form");

    // TO-DO
    // add physical buttons to press yes/no/show answer

    // var yesButton = "<div id='WKANKIMODE_yes' class='WKANKIMODE_button' title='Correct' onclick='WKANKIMODE_correct();'>Correct</div>";
    // var noButton = "<div id='WKANKIMODE_no' class='WKANKIMODE_button' title='Incorrect' onclick='WKANKIMODE_incorrect();'>Incorrect</div>";

    // $("footer").prepend($(noButton).hide());
    // $("footer").prepend($(yesButton).hide());

};

var autostartFeature = function () {
    console.log("///////////// AUTOSTART: " + autostart);
    if (autostart) {
        $("#WKANKIMODE_anki").text("Anki Mode Auto Start");
        $("#answer-form form button").prop("disabled", true);
        $("#user-response").on("focus", function () {
            $("#user-response").blur();
        });
        activated = true;
        // start observer to force blur
        observer.observe(document.getElementById("answer-form"), {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: false
        });
    }
};

var bindHotkeys = function () {
    $(document).on("keydown.reviewScreen", function (event) {
        if ($("#reviews").is(":visible") && !$("*:focus").is("textarea, input")) {
            switch (event.keyCode) {
                case 32:
                    event.stopPropagation();
                    event.preventDefault();

                    if (activated)
                        WKANKIMODE_showAnswer();

                    return;
                case 49:
                    event.stopPropagation();
                    event.preventDefault();

                    if (activated)
                        WKANKIMODE_answerYes();

                    return;
                case 50:

                    event.stopPropagation();
                    event.preventDefault();

                    if (activated)
                        WKANKIMODE_answerNo();

                    return;
            }
        }
    });
};

addStyle(css);
addButtons();
autostartFeature();
bindHotkeys();
