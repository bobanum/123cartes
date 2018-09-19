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
        this._dessusColumns = null;
    }
    ////////////////////////////////
    ////////////////////////////////
    ////////////////////////////////
    static get dessusColumns() {
        if (this._dessusColumns === null) {
            this._dessusColumns = this.getDessusColumns();
        }
        return this._dessusColumns;
    }
    static set dessusColumns(val) {
        this._dessusColumns = val;
    }
    static getDessusColumns() {
        return this.jeu.tableau.map(c=>c.top().carte);
    }
    static main() {
        this.deck = this.shuffle(this.newDeck());
        this.stock = null;
        this.waste = null;
        this.foundation = [];
        this.tableau = [];
        this.board = null;
        this.board = this.dom_board();
        document.body.appendChild(this.board);
        this.start();
        return;
    }
    static dom_board() {
        var resultat;
        resultat = document.createElement("div");
        resultat.setAttribute("id", "board");

        this.stock = new this.Stock(this.deck);
        resultat.appendChild(this.stock.dom);
        this.waste = this.pile_waste(this.deck);
        resultat.appendChild(this.waste.dom);
        this.foundation_pile = this.pile_foundation();
        resultat.appendChild(this.foundation_pile.dom);
        this.tableau_pile = this.pile_tableau();
        resultat.appendChild(this.tableau_pile.dom);
        return resultat;
    }
    static start() {
		var result = Promise.resolve();
        for (let i = 0; i < 7; i += 1) {
			for (let j = i; j < 7; j += 1) {
				result = result.then(() => this.stock.top().moveTo(this.tableau[j], i === j));
				if (i==j) {
					result = result.then(data => {
						let pile = new Pile();
						data.pile.push(pile);
						pile.push(data);
					});
				}
			}
        }
        document.body.addEventListener("mousedown", e => this.dragstart(e));
        this.showPlayables();
        return result;
    }
    static pile_foundation() {
        var resultat, i, pile;
        resultat = new this.Pile("foundation");
        resultat.dx = 10;
        resultat.dy = 0;
        for (i = 0; i < 4; i += 1) {
            pile = resultat.push(new this.Foundation(i));
            this.foundation.push(pile);
        }
        return resultat;
    }
    static pile_tableau() {
        var resultat, i, column;
        resultat = new this.Pile("tableau");
        for (i = 0; i < 7; i += 1) {
            column = resultat.push(new this.Tableau(i));
            this.tableau.push(column);
        }
        return resultat;
    }
    static pile_waste() {
        var result;
        result = new this.Pile("waste");
        return result;
    }


    static dragstart(e) {
        var pile_dom, pile, card, origin, moves, self=this;
        if (e.target === this.stock) {
            this.resetStock();
            return;
        }
        if (e.target.closest("#stock")) {
            this.distribuer3cartes();
            return;
        }
        card = e.target.closest(".visible");
        if (!card) {
            return;
        }
        pile_dom = card.closest(".pile");
		pile = pile_dom.obj;
        if (pile_dom.classList.contains("foundation")) {
            return;
        }
        pile_dom.classList.add("prise");
        this.hidePlayables();
        origin = pile.pile;
        moves = this.findMoves(card.obj);
        moves = moves.global;
        this.showMoves(moves);
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
            self.dropCard(pile, moves, origin);
            dragstop();
        }

        function dragcancel() {
			origin.push(pile);
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
    /**
     * Puts a pile on a pile
     * @param   {Pile}     pile   The pile to move
     * @param   {Pile[]}   moves  Array of possible destination
     * @param   {Pile}     origin The pile from which we took the pile in case we don't have a move and to help choos the next move
     * @returns {[[Type]]} [[Description]]
     */
    static dropCard(pile, moves, origin) {
		return new Promise(resolve => {
			var position, choices, destination;
			position = pile.coordinates_center;
			choices = moves.map(move => {
				return {element: move, distance: this.distance(position, move.coordinates_center)};
			});
			choices.sort((a,b) => a.distance > b.distance);
			if (choices.length > 0) {
				destination = choices[0].element;
			} else {
				destination = origin;
			}
			pile.moveTo(destination).then(() => {
				Promise.all(this.tableau.map(column => {
					return column.normalize();
				}));
			});
			pile.dom.classList.remove("prise");
			return resolve(pile);
		});
    }

    static distribuer3cartes() {
        this.hidePlayables();
        var pile = this.waste;
        for (let i = 0; i < 3 && this.stock.firstChild; i += 1) {
            let card = this.stock.top();
            this.flipCard(card);
			pile.push(card);
            pile = card;
        }
        this.showPlayables();
        return pile;
    }
    static resetStock() {
        var cartes;
        this.hidePlayables();
        cartes = this.selectObjects("#waste .pile");
        cartes.forEach(function (carte) {
            this.flipCard(carte);
            this.stock.push(carte);
        });
        this.showPlayables();
        return;
    }
    static wasteTop() {
        var resultat;
//        resultat = document.querySelector("#waste > .pile:last-child .carte:only-child");
        resultat = this.waste.top();
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
            foundation: this.findMoves_foundation(card),
            tableau: this.findMoves_tableau(card)
        };
		result.global = [].concat(result.foundation, result.tableau);
        return result;
    }
    static findMoves_foundation(card) {
        var suit, value, result, top;
        suit = card.suit;
        value = card.value;
        result = [];
        if (!card.isOnTop()) {
            return [];
        }
//        if (value === 0) {
//            result.push(this.foundation[suit]);
//            return result;
//        }
        top = this.foundation[suit].value();
//		if (top < 0) {
//			return result;
//		}
        if (value === top + 1) {
            result.push(this.foundation[suit]);
        }
        return result;
    }
    static findMoves_tableau(card) {
        var result;
        result = [];
        var value = card.value;
        var color = card.color;
        if (value === 12) {
			var columns = this.tableau.filter(column => column.elements.length === 0);
            result.push(...columns);
            return result;
        }
        var cards = this.selectObjects(
            "#tableau .carte:only-child",
            (card) => (color !== card.color && value === card.value - 1),
            (card) => (card.pile)
        );
        result.push(...cards);
        return result;
    }
    /**
     * Returns all playable cards on the board
     * @returns {Card[]|Pile[]} An array of objects
     */
    static findPlayables() {
        var result, card, piles;
        result = [];
        card = this.wasteTop();
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
            foundation: [],
            tableau: [],
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
        this.moves.global = [].concat(this.moves.foundation, this.moves.tableau);
        return this.moves.global;
    }
    zzz_findMoves_foundation() {
        var resultat, dessus, carte;
        resultat = [];
        // Si la carte n'est pas sur le dessus de la pile, elle ne peut être jouable
        if (this.pile.elements.length > 1) {
            this.moves.foundation = [];
            return;
        }
        dessus = this.jeu.foundation[this.suit].top();
        if (this.value === 0) {
            this.moves.foundation = [dessus];
            return;
        }
        carte = dessus.carte;
        if (carte && this.suit === carte.suit && this.value === carte.value + 1) {
            this.moves.foundation = [dessus];
            return;
        }
    }
    zzz_findMoves_tableau() {
            console.log("valider");
        if (this.value === 12) {
            this.moves.tableau = this.jeu.tableau.filter(c=>c.elements.length === 0);
            return;
        } else {
            var dessusColumns = this.jeu.dessusColumns;
            this.moves.tableau = dessusColumns.filter(function(carte) {
                return this.color !== carte.color && this.value === carte.value - 1;
            }, this);
            return;
        }
    }
};

Klondike.Pile = class extends Pile {
};
Klondike.Stock = class extends Pile {
	constructor(cards = []) {
		super("stock");
        cards.forEach(card => {
			this.push(card);
        });
	}
	top(n = 1) {
		if (n > 1) {
			return this.elements.slice(-n);
		} else {
			return this.elements.slice(-n)[0];
		}
	}
};
Klondike.Tableau = class extends Pile {
	constructor(no) {
		super("colonne"+no);
	}
	top(n = 1) {
		if (n > 1) {
			return this.elements.slice(-n);
		} else {
			return this.elements.slice(-n)[0];
		}
	}

	/**
	 * Makes sure the pile is ready to be played on (top card flipped)
	 * @returns {Promise} Resolves when ready
	 */
	normalize() {
		var card = this.top();
		if (!card || card.visible === true) {
			return Promise.resolve(this);
		}
		return card.flip(true).then(data=>{
			var pile = data.pile.push(new Pile());
			pile.push(data);
			return data;
		});
	}
};
Klondike.Foundation = class extends Pile {
	constructor(no) {
		super("foundation" + no);
	}
	top() {
		if (this.elements.length === 0) {
			return -1;
		} else {
			return this.elements.slice(-1)[0];
		}
	}
	value() {
		return this.elements.length - 1;
	}
	canTake(card) {
		return this.value + 1 === card.value;
	}
};
