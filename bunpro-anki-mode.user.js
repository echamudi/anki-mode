// ==UserScript==
// @name         Bunpro Anki Mode
// @namespace    ezhmd
// @version      1.7.2
// @description  Anki mode for Bunpro
// @author       Ezzat Chamudi
// @match        https://bunpro.jp/study*
// @match        http://bunpro.jp/study*
// @grant        none
// @updateURL      https://github.com/ezhmd/anki-mode/raw/master/bunpro-anki-mode.user.js
// @downloadURL    https://github.com/ezhmd/anki-mode/raw/master/bunpro-anki-mode.user.js
// @license      GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// ==/UserScript==


(function() {
    'use strict';

var css = "\
    .anki-show { \
        background-color: #000099; \
    } \
    .anki-yes { \
        background-color: #009900; \
    } \
    .anki-no { \
        background-color: #990000; \
    } \
    .anki-button { \
        display: inline-block; \
        font-size: 0.8125em; \
        color: #FFFFFF; \
        cursor: pointer; \
        padding: 10px; \
        width: 30%; \
	    max-width: 130px; \
    } \
    \
    .review-padding-bottom {\
	    text-align: center;\
	}\
";

$(`<style>${css}</style>
<span class="anki-button anki-no" onclick='answerShow();'>Don't Know</span>
<span class="anki-button anki-show" onclick='answerShow();'>Show Answer</span>
<span class="anki-button anki-yes" onclick='answerCorrect();'>Know</span>`)
.appendTo(".review-padding-bottom");

$(".anki-show").click(function() {
	$("#show-answer").click();
	$("#study-answer-input").val($(".study-area-input").text());
});

$(".anki-yes").click(function() {
	$("#submit-study-answer").click();
});

$(".anki-no").click(function() {
	$("#study-answer-input").val("あああああああ");
	$("#submit-study-answer").click();
});

})();
