/*jslint browser:true, esnext:true */
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
        Math.seedrandom("test");
//        Math.seedrandom("testC");
        window.addEventListener("load", function () {
            App.load();
        });
    }
}
App.init();
