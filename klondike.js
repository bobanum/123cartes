/*jslint browser:true, esnext:true*/
/*global Game, Pile, Card */
class Klondike extends Game {
    /**
     * Creates an instance of Klondike.
     * @memberOf Klondike
     */
    constructor() {
        super();
        this.cards = [];
        this._dessusColonnes = null;
    }
    ////////////////////////////////
    ////////////////////////////////
    ////////////////////////////////
    static get dessusColonnes() {
        if (this._dessusColonnes === null) {
            this._dessusColonnes = this.getDessusColonnes();
        }
        return this._dessusColonnes;
    }
    static set dessusColonnes(val) {
        this._dessusColonnes = val;
    }
    static getDessusColonnes() {
        return this.jeu.colonnes.map(c=>c.top().carte);
    }
    static main() {
        this.paquet = this.shuffle(this.newDeck());
        this.talon = null;
        this.defausse = null;
        this.maisons = [];
        this.colonnes = [];
        this.board = null;
        this.board = this.dom_board();
        document.body.appendChild(this.board);
        this.commencerJeu();
        return;
    }
    static dom_board() {
        var resultat;
        resultat = document.createElement("div");
        resultat.setAttribute("id", "board");

        this.talon = this.pile_talon(this.paquet);
        resultat.appendChild(this.talon.dom);
        this.defausse = this.pile_defausse(this.paquet);
        resultat.appendChild(this.defausse.dom);
        this.fondation = this.pile_fondation();
        resultat.appendChild(this.fondation.dom);
        this.tableau = this.pile_tableau(this.paquet);
        resultat.appendChild(this.tableau.dom);
        return resultat;
    }
    static commencerJeu() {
        for (let i = 0; i < 7; i += 1) {
            let pile = new this.Pile();
            let card = pile.push(this.talon.top());
            this.colonnes[i].top().push(card);
            card.retourner();
            for (let j = i + 1; j < 7; j += 1) {
                card = this.talon.top();
                this.colonnes[j].top().push(card);
            }
        }
        document.body.addEventListener("mousedown", e => this.dragstart(e));
        this.showPlayables();
        return;
    }
    static pile_fondation() {
        var resultat, i, maison;
        resultat = new this.Pile("fondation");
        resultat.dx = 10;
        resultat.dy = 0;
        for (i = 0; i < 4; i += 1) {
            maison = resultat.push(this.pile_maison(i));
            this.maisons.push(maison);
        }
        return resultat;
    }
    static pile_tableau() {
        var resultat, i, column;
        resultat = new this.Pile("tableau");
        for (i = 0; i < 7; i += 1) {
            column = resultat.push(this.pile_colonne(i));
            this.colonnes.push(column);
        }
        return resultat;
    }
    static pile_talon(cards) {
        var result;
        result = new this.Pile("talon");
        cards.forEach(function (card) {
            var pile = result.push(new this.Pile());
            pile.push(card);
        }, this);
        return result;
    }
    static pile_defausse() {
        var result;
        result = new this.Pile("defausse");
        return result;
    }
    static pile_maison(no) {
        var resultat;
        resultat = new this.Pile("maison" + no);
        return resultat;
    }
    static pile_colonne(no) {
        var resultat;
        resultat = new this.Pile("colonne" + no);
        return resultat;
    }
    static dragstart(e) {
        var pile_dom, pile, card, origin, moves, self=this;
        if (e.target === this.talon) {
            this.replacerTalon();
            return;
        }
        if (e.target.closest("#talon")) {
            this.distribuer3cartes();
            return;
        }
        card = e.target.closest(".visible");
        if (!card) {
            return;
        }
        pile_dom = card.closest(".pile");
		pile = pile_dom.obj;
        if (pile_dom.classList.contains("maison")) {
            return;
        }
        pile_dom.classList.add("prise");
        this.hidePlayables();
        origin = pile_dom.parentNode;
        moves = this.findMoves(card.obj);
        this.showMoves(moves);
        moves = moves.maisons.concat(moves.colonnes);
        pile.detach();
        pile_dom.decalage = {
            x: e.offsetX-pile_dom.clientLeft,
            y: e.offsetY-pile_dom.clientTop,
        };
        function dragmove(e) {
            pile_dom.style.left = e.clientX - pile_dom.decalage.x + "px";
            pile_dom.style.top = e.clientY - pile_dom.decalage.y + "px";
        }

        function drop() {
            self.deposerCarte(pile, moves, origin.obj);
            dragstop();
        }

        function dragcancel() {
            debugger;
			origin.obj.push(pile);
//			self.empiler(origin.obj, pile.obj);
            pile_dom.classList.remove("prise");
            dragstop();
        }

        function dragstop() {
			document.body.removeEventListener("mousemove", dragmove);
            document.body.removeEventListener("mouseleave", dragcancel);
            document.body.removeEventListener("mouseup", drop);
            self.hideMoves();
            self.showPlayables();
        }
        document.body.addEventListener("mousemove", dragmove);
        document.body.addEventListener("mouseleave", dragcancel);
        document.body.addEventListener("mouseup", drop);
    }
    static deposerCarte(pile, moves, origin) {
        var position, choices;
        position = pile.coordonneesCentre;
        choices = {
            element: null,
            distance: Infinity
        };
        moves.forEach(function (move) {
            var d = this.distance(position, move.coordonneesCentre);
            if (d < choices.distance) {
                choices.element = move;
                choices.distance = d;
            }
        });
        if (choices.element) {
            if (choices.element.classList.contains("maison")) {
                choices.element.push(pile);
//                this.empiler(choix.element, pile);
            } else {
                choices.element.push(pile);
//                this.empiler(choix.element, pile);
            }
            //		var cartes = document.querySelectorAll("#tableau .pile:not(.visible) > .carte:only-child");
            var cards = this.selectObjects("#tableau .pile:not(.visible) > .carte:only-child");
            cards.forEach(function (card) {
                this.flipCard(card);
            }, this);
        } else {
//            this.empiler(origin, pile);
            origin.push(pile);
        }
        pile.dom.classList.remove("prise");
        return pile;
    }

    static distribuer3cartes() {
        this.hidePlayables();
        var pile = this.defausse;
        for (let i = 0; i < 3 && this.talon.firstChild; i += 1) {
            let card = this.talon.top();
            this.flipCard(card);
			pile.push(card);
//            this.empiler(pile, card);
            pile = card;
        }
        this.showPlayables();
        return pile;
    }
    static replacerTalon() {
        var cartes;
        this.hidePlayables();
        cartes = this.selectObjects("#defausse .pile");
        cartes.forEach(function (carte) {
            this.flipCard(carte);
            this.talon.push(carte);
        });
        this.showPlayables();
        return;
    }
    static dessusDefausse() {
        var resultat;
//        resultat = document.querySelector("#defausse > .pile:last-child .carte:only-child");
        resultat = this.defausse.top();
        if (resultat.elements.length) {
            return resultat;
        } else {
            return null;
        }
    }
    /**
     * Returns an array of possible moves for given Card object
     * @param   {Card}   card Card object to evaluate
     * @returns {Pile[]} All piles tah can receive the card
     */
    static findMoves(card) {
        var result;
        result = {
            maisons: this.findMoves_foundation(card),
            colonnes: this.findMoves_tableau(card)
        };
        return result;
    }
    static findMoves_foundation(card) {
        var suit, value, result, top;
        suit = card.suit;
        value = card.value;
        result = [];

        if (card.dom.nextSibling) {
            return [];
        }
        if (value === 0) {
            result.push(this.maisons[suit]);
            return result;
        }
        top = this.maisons[suit].lastChild;
		if (!top) {
			return result;
		}
        if (value === top.obj.value + 1) {
            result.push(this.maisons[suit]);
        }
        return result;
    }
    static findMoves_tableau(card) {
        var result, value, color;
        result = [];
        value = card.value;
        color = card.color;
        if (value === 12) {
            var columns = this.selectObjects(".colonne:empty");
            result.push(...columns);
            return result;
        }
        var cards = this.selectObjects(
            ".colonne .carte:only-child",
            (card) => (color !== card.color && value === card.value - 1),
            (card) => (card.dom.parentNode.obj)
        );
        result = result.concat(cards);
        return result;
    }
    /**
     * Returns all playable cards on the board
     * @returns {Card[]|Pile[]} An array of objects
     */
    static findPlayables() {
        var result, card, piles;
        result = [];
        card = this.dessusDefausse();
        if (card && card.estJouable()) {
            result.push(card);
        }

        //    piles = Array.from(document.querySelectorAll("#tableau .pile.visible"));
        //    piles = piles.map(pile => pile.obj);
        //    piles = piles.filter((pile) => estJouable(pile));
//        piles = this.selectObjects("#tableau .pile.visible", this.estJouable);
        piles = this.cards.filter(function (card) {
            return (card.moves.global.length > 0);
        }, this);
        result.push(...piles);
        return result;
    }
    /////////////////////////////
    /////////////////////////////
    /////////////////////////////
    /**
     *
     *
     * @static
     *
     * @memberOf Klondike
     */
    static load() {
        this.main();
    }
    /**
     * Inits the class properties
     *
     * @static
     *
     * @memberOf Klondike
     */
    static init() {
        window.addEventListener("load", e => this.load(e));
    }
}
Klondike.init();

Klondike.Card = class extends Card {
    constructor(suit, value) {
        super(suit, value);
    }
    get estJouable() {
        return this.moves.global.length > 0;
    }
    initMoves() {
        this.moves = {
            maison: [],
            colonnes: [],
            global: [],
        };
    }
    /**
     * Returns all playable cards of the game
     * Sets property moves {}
     * @returns {Card[]|Pile[]} An array of Card or Pile objects
     * @date_modify 2018-09-14
     */
    findMoves() {
        this.initMoves();
        if (!this._visible) {
            return [];
        }
        this.findMoves_foundation();
        this.findMoves_tableau();
        this.moves.global = [].concat(this.moves.maison, this.moves.colonnes);
        return this.moves.global;
    }
    findMoves_foundation() {
        var resultat, dessus, carte;
        resultat = [];
        // Si la carte n'est pas sur le dessus de la pile, elle ne peut être jouable
        if (this.pile.elements.length > 1) {
            this.moves.maison = [];
            return;
        }
        dessus = this.jeu.maisons[this.suit].top();
        if (this.value === 0) {
            this.moves.maison = [dessus];
            return;
        }
        carte = dessus.carte;
        if (carte && this.suit === carte.suit && this.value === carte.value + 1) {
            this.moves.maison = [dessus];
            return;
        }
    }
    findMoves_tableau() {
        if (this.value === 12) {
            console.log("valider");
            this.moves.colonnes = this.jeu.colonnes.filter(c=>c.elements.length === 0);
            return;
        } else {
            var dessusColonnes = this.jeu.dessusColonnes;
            this.moves.colonnes = dessusColonnes.filter(function(carte) {
                return this.color !== carte.color && this.value === carte.value - 1;
            }, this);
            return;
        }
    }
};

Klondike.Pile = class extends Pile {
};
