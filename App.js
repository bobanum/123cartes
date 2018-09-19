/*jslint browser:true, esnext:true */
console.trace = (true) ? console.log : function () {return true;}
class App {
    /**
     * Creates an instance of App.
     * @memberOf App
     */
    constructor() {

    }
    /**
     * Exécuté lors de la chargement de la page
     * @static
     * @memberOf App
     */
    static load() {

    }
    /**
     * Inits the class properties
     * @static
     * @memberOf App
     */
    static init() {
		var seed = Math.random() + "";
		console.log(seed);
//        Math.seedrandom(seed);
//        Math.seedrandom("test");
//        Math.seedrandom("0.47793571906247045");
//        Math.seedrandom("testC");
        window.addEventListener("load", function () {
            App.load();
        });
    }
}
App.init();
