/*jslint browser:true, esnext:true */
/*global Card, Pile */
/**
 * Class Game.
 */
class Game {
    /**
     * Creates an instance of Game.
     * @memberOf Game
     */
    constructor() {

    }

    /**
     * Returns a new deck of cards according to global properties.
     * @returns {Card[]} The deck
     */
    static newDeck() {
        var result;
        result = [];
        for (let s = 0; s < this.suits.length; s += 1) {
            for (let v = 0; v < this.values.length; v += 1) {
                let card  = new this.Card(s, v);
                this.cards.push(card);
                card.jeu = this;
                result.push(card);
            }
        }
        return result;
    }

    /**
     * Returns shuffles array
     * @param   {Card[]} deck The array to shuffle
     * @returns {Card[]} A shuffled copy of the deck
     */
    static shuffle(deck) {
        var result;
        result = Array.from(deck);
    	result.sort(() => Math.random() < 0.5);
        return result;
    }

    /**
     * Rend visible (ou non) la face carte.
     * @param   {HTMLElement} card L'élément HTML représentant la carte
     * @param   {boolean}     state  L'état final de la carte. Par défaut, on inverse l'état actuel.
     * @returns {HTMLElement} La carte ainsi changée
     * @obselete ? Use Card method instead
     */
    static flipCard(card, state) {
        debugger;
		card.obj.flip(state);
        return card;
    }

    /**
     * Transfere la carte donnée vers une autre pile
     * @param   {Pile}      destination The receiving Pile object
     * @param   {Pile|Card} element  	   La pile ou carte à mettre par-dessus
     * @returns undefined
     * @todo RÉVISER
     */
    static zzzempiler(destination, element) {
        element.detach();
        destination.push(element);
    }

    static distance(p1, p2) {
        var dx, dy;
        dx = p1.x - p2.x;
        dy = p1.y - p2.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    static afficherJouables() {
        var playables;
        playables = this.findPlayables();
		playables.forEach(playable => {
            playable.dom.classList.add("jouable");
		});
    }
    /**
     * Returns an array of cards according to given selector.
     * Array can be filtered or mapped with respective functions
     * @param   {string}   selector Selector to get all the wanted cards (and more).
     * @param   {function} filter   Function to filter cards
     * @param   {function} map      Treatment to apply to remaining cards
     * @returns {Card[]} Card objects
     */
    static selectObjects(selector, filter, map) {
        var result;
		if (typeof selector === "string") {
        	result = Array.from(document.querySelectorAll(selector));
		} else {
        	result = Array.from(selector);
		}
        result = result.map(card => (card.obj || card));
        if (filter) {
            result = result.filter(filter);
        }
        if (map) {
            result = result.map(map);
        }
        return result;
    }
    static masquerJouables() {
        var jouables = document.querySelectorAll(".jouable");
        jouables.forEach(function (jouable) {
            jouable.classList.remove("jouable");
        });
        return jouables;
    }
    static afficherPossibilites(moves) {
        var i;
        if (moves instanceof Array) {
            for (i = 0; i < moves.length; i += 1) {
                moves[i].classList.add("possibilite");
            }
        } else {
            for (i in moves) {
                this.afficherPossibilites(moves[i]);
            }
        }
    }
    static masquerPossibilites() {
        var moves = document.querySelectorAll(".possibilite");
        moves.forEach(function (possibilite) {
            possibilite.classList.remove("possibilite");
        });
        return moves;
    }
/////////////////////////////////
/////////////////////////////////
/////////////////////////////////
    /**
     *
     *
     * @static
     *
     * @memberOf Game
     */
    static load() {
    }
    /**
     * Inits the class properties
     *
     * @static
     *
     * @memberOf Game
     */
    static init() {
        this.suits = "HDCD";
        this.values = "1234567890VDR";
        this.pref = {};
        this.cards = [];
        this.MOUSEDOWN = 'mousedown';
        this.MOUSEUP = 'mouseup';
        this.MOUSEMOVE = 'mousemove';
        this.MOUSEOUT = 'mouseout';

        window.addEventListener("load", function () {
            Game.load();
        });

    }
}
Game.init();

Game.Card = Card;
