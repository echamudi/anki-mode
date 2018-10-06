// ==UserScript==
// @name           Memrise Anki Mode
// @namespace      https://github.com/ezhmd
// @description    Review Memrise words like Anki, answer by correct or false.
// @match          https://www.memrise.com/course/*/garden/*
// @match          https://www.memrise.com/garden/review/*
// @version        0.0.10
// @updateURL      https://github.com/ezhmd/anki-mode/raw/master/memrise-anki-mode.user.js
// @downloadURL    https://github.com/ezhmd/anki-mode/raw/master/memrise-anki-mode.user.js
// @grant          none
// ==/UserScript==

// Inspired from https://github.com/cooljingle/memrise-all-multiple-choice

$(document).ready(function() {
    $(`
    <style>
    .choices {
        display:flex !important;
        flex-direction: column;
    }
    .choices,
    .choice{
        width: 100% !important;
    }
    .choice:not(:hover) .val:not(:empty) {
        color: rgba(0, 0, 0, 0) !important;
    }
    .choice.correct:not(:hover) .val:not(:empty) {
        color: #FFF !important;
    }
    .choice .val:empty:after {
        content: "✖✖ Don't Know";
    }
    /* peek colours */
    .peek.choice:not(:hover) .val:not(:empty) {
        color: #000 !important;
    }
    .active.peek.choice:not(:hover) .val:not(:empty),
    .correct.choice.correct:not(:hover) .val:not(:empty){
        color: #FFF !important;
    }
    /* peek button */
    #button-peek {
         display: block;
         background: #00000017;
         width: 200px;
         text-align: center;
         padding: 10px;
         border-radius: 2px;
         font-weight: bold;
         cursor: pointer;
    }
    </style>
    `).appendTo($('head'));

    MEMRISE.garden._events.start.push(() => {
        enableAllMultipleChoice();
    });

    MEMRISE.garden._events.start.push(() => {
        $.each(MEMRISE.garden.screens, function (i) {
            MEMRISE.garden.screens[i].multiple_choice.choices = [""];
            MEMRISE.garden.screens[i].reversed_multiple_choice.choices = [""];
        });
    });

    MEMRISE.garden._events.activate.push(() => {
        addPeekButton();
    });

    function addPeekButton() {
        if(MEMRISE.garden.box.template == "multiple_choice" || MEMRISE.garden.box.template == "reversed_multiple_choice") {
            $("#boxes").prepend(`<div id="button-peek">PEEK</div>`);
            $("#button-peek").click(function(){
                $('.choice:not(:hover) .val:not(:empty)').parent().toggleClass('peek');
            });
        }
    }

    function enableAllMultipleChoice() {
        MEMRISE.garden.session.box_factory.make = (function() {
            var cached_function = MEMRISE.garden.session.box_factory.make;
            return function() {
                var result = cached_function.apply(this, arguments);
                var shouldSetMultipleChoice = ["presentation", "copytyping", "multiple_choice", "reversed_multiple_choice"].indexOf(result.template) < 0 &&
                    MEMRISE.garden.session.box_factory.isTestPossible(result, "multiple_choice");
                if(shouldSetMultipleChoice)
                    result.template = "multiple_choice";
                return result;
            };
        }());
    }
});
