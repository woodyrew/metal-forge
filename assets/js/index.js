var Pinkyfier = require("./modules/Pinkyfier"),
    pinkyfier = new Pinkyfier("text");

pinkyfier.pink();

document.getElementById("fat").onclick = function () {
    require(["./modules/Fattyfier"], function (Fattyfier) {
        var fattyfier = new Fattyfier("text");
        fattyfier.fat();
    });
}