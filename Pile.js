/*jslint browser:true, esnext:true */
class Pile {
    /**
     * Creates an instance of Pile.
     * @memberOf Pile
     */
    constructor() {
        this.cartes = [];
    }
    /**
     *
     *
     * @static
     *
     * @memberOf Pile
     */
    static load() {

    }
    /**
     * Inits the class properties
     *
     * @static
     *
     * @memberOf Pile
     */
    static init() {
        window.addEventListener("load", function () {
            Pile.load();
        });

    }
}
Pile.init();
