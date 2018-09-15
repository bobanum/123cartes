/*jslint browser:true, esnext:true */
/*global Card */
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
     * Returns shuffled array
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
		card.flip(state);
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

    /**
     * Returns the distance between 2 points
     * @param   {object} p1 Point of origin
     * @param   {object} p2 Point of destination
     * @returns {number} The distance
     */
    static distance(p1, p2) {
        var dx, dy;
        dx = p1.x - p2.x;
        dy = p1.y - p2.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    /**
     * Adds "playable" HTML class to dom for given elements
     * @param {Card[]} playables Optional. The cards to change or every playable cards
     */
    static showPlayables(playables) {
 		//TODO Evaluate the possibility of only changing the stylesheet and putting the class on evaluation (findMoves)
       	playables = playables || this.findPlayables();
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
    /**
     * Remove class
     * @returns {[[Type]]} [[Description]]
     */
    static hidePlayables() {
		//TODO Evaluate the possibility of only changing the stylesheet and putting the class on evaluation (findMoves)
        var playables = document.querySelectorAll(".jouable");
        playables.forEach(function (playable) {
            playable.classList.remove("jouable");
        });
        return playables;
    }
    /**
     * Adds "move" HTML class to given objects
     * @param {[[Type]]} moves [[Description]]
     */
    static showMoves(moves) {
		//TODO Evaluate the possibility of only changing the stylesheet and putting the class on evaluation (findMoves)
		moves.forEach(move => {
			move.dom.classList.add("move");
		});
    }
    /**
     * Removes "move" HTML class from given elements
     * @returns {[[Type]]} [[Description]]
     */
    static hideMoves() {
		//TODO Evaluate the possibility of only changing the stylesheet and putting the class on evaluation (findMoves)
        var moves = this.selectObjects(".move");
        moves.forEach(move => {
            move.dom.classList.remove("move");
        });
        return moves;
    }
	static duration(distance) {
		return Math.pow(distance, 0.3)*this.pref.animationSpeed;
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
		this.pref.animationSpeed = 40;
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
