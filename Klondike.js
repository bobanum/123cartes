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
		this.stock.waste = this.waste;
		this.waste.stock = this.stock;
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
						let pile = new this.Tableau();
						data.pile.push(pile);
						pile.push(data);
					});
				}
			}
        }
        document.body.addEventListener("mousedown", e => this.dragstart(e));
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
        result = new this.Waste();
        return result;
    }


    static dragstart(e) {
        var pile_dom, pile, origin;
        pile = e.target.obj;
        if (!pile) {
            return;
        }
		if (pile instanceof Card) {
			pile = pile.pile;
		}
		pile.dragstart(e, this);
    }
    /**
     * Puts a pile on a pile
     * @param   {Pile}     pile   The pile to move
     * @param   {Pile[]}   moves  Array of possible destination
     * @param   {Pile}     origin The pile from which we took the pile in case we don't have a move and to help choos the next move
     * @returns {[[Type]]} [[Description]]
     */
    static dropCard(pile, destination) {
		destination = destination || pile.findBestMove();
		return new Promise(resolve => {
			pile.moveTo(destination).then(() => {
				Promise.all(this.tableau.map(column => {
					return column.normalize();
				}));
			});
			pile.dom.classList.remove("prise");
			return resolve(pile);
		});
    }

    static zzzdeal3cards() {
        var pile = new this.Pile();
        this.waste.push(pile);
		var result = Promise.resolve();
        for (let i = 0; i < 3 && this.stock.top(); i += 1) {
			result = result.then(() => this.stock.top().moveTo(pile, true));
        }
        return pile;
    }
    static wasteTop() {
        var resultat;
//        resultat = document.querySelector("#waste > .pile:last-child .carte:only-child");
        resultat = this.waste.top();
        if (resultat.length) {
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
			var columns = this.tableau.filter(column => column.length === 0);
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
        if (this.pile.length > 1) {
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
            this.moves.tableau = this.jeu.tableau.filter(c=>c.length === 0);
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
Klondike.Stock = class extends Klondike.Pile {
	constructor(cards = []) {
		super("stock");
        cards.forEach(card => {
			this.push(card);
        });
	}
    reset() {
        var card;
		while ((card = this.waste.top()) !== this.waste) {
			card.visible = false;
			this.push(card);
		}
		this.waste.normalize();
        return;
    }
    deal3cards() {
        var pile = new Klondike.Pile();
        this.waste.push(pile);
		var result = Promise.resolve();
        for (let i = 0; i < 3 && this.top(); i += 1) {
			result = result.then(() => this.top().moveTo(pile, true));
        }
        return pile;
    }
	dragstart(e, game) {
//		console.log(e, game);
		if (this.elements.length === 0) {
            this.reset();
            return;
        }
		this.deal3cards();
		return;
	}
	top(n = 1) {
		if (n > 1) {
			return this.elements.slice(-n);
		} else {
			return this.elements.slice(-n)[0];
		}
	}
};
Klondike.Waste = class extends Klondike.Pile {
	constructor() {
		super("waste");
	}
    dragstart(e, game) {
		console.log(e, game);
		debugger;
		/////VIEUX
		if (pile.root() === this.waste) {
			if (pile === this.waste.top()) {
//				debugger;
			} else {
				return;
			}
		}
		/////
	}
	top() {
		var topPile = this.topPile();
		if (!topPile) {
			return this;
		} else {
			return topPile.elements[topPile.length - 1];
		}
	}
	topPile() {
		if (this.length === 0) {
			return false;
		} else {
			for (let pos = this.length - 1; pos >= 0; pos -= 1) {
				if (this.elements[pos].length > 0) {
					return this.elements[pos];
				}
			}
			// All empty piles
			return false;
		}
	}
	push3(cards, instant = false) {
		var pile = new Klondike.Pile();
        this.push(pile);
		var result = Promise.resolve();
		if (instant) {
			cards.forEach(card => {
				pile.push(card);
			});
		} else {
			cards.forEach(card => {
				result = result.then(() => card.moveTo(pile, true));
			});
		}
		return result;
	}
    zzzreset() {
        var card;
		while ((card = this.top()) !== this) {
			card.visible = false;
			this.stock.push(card);
		}
		this.normalize();
        return;
    }
	getAllCards() {
		var result = [];
		this.elements.forEach(pile => {
			result.push(...pile.elements);
		});
		return result;
	}
	normalize() {
		var cards = this.getAllCards();
		cards.forEach(card => card.detach());
		Array.from(this.elements).forEach(element => {
			element.detach();
			element.remove();
		});
		while (cards.length > 0) {
			this.push3(cards.splice(0, 3), true);
		}
	}
};
Klondike.Tableau = class extends Klondike.Pile {
	constructor(no) {
		super("colonne"+no);
	}
	get mainCard() {
		return this.elements[0];
	}
	grab() {

	}
	drop() {
		Klondike.dropCard(this);
		delete this.moves;
		delete this.origin;
	}
    dragstart(e) {
		var mainCard = this.mainCard;
		if (!mainCard.visible) {
			return false;
		}
        this.dom.classList.add("prise");
        this.origin = this.pile;
        this.moves = Klondike.findMoves(mainCard).global;
        Klondike.showMoves(this.moves);
        this.detach();
        var offset = this.offset(e);
		var evts = {
			dragmove: e => {
				this.dom.style.left = e.clientX - offset.x + "px";
				this.dom.style.top = e.clientY - offset.y + "px";
			},

			drop: () => {
				this.drop();
				evts.dragstop();
			},

			dragcancel: () => {
				this.drop(this.origin);
				evts.dragstop();
			},

			dragstop: () => {
				document.body.removeEventListener("mousemove", evts.dragmove);
				document.body.removeEventListener("mouseleave", evts.dragcancel);
				document.body.removeEventListener("mouseup", evts.drop);
				Klondike.hideMoves();
			}
		};
        document.body.addEventListener("mousemove", evts.dragmove);
        document.body.addEventListener("mouseleave", evts.dragcancel);
        document.body.addEventListener("mouseup", evts.drop);
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
			var pile = data.pile.push(new this.constructor());
			pile.push(data);
			return data;
		});
	}
};
Klondike.Foundation = class extends Klondike.Pile {
	constructor(no) {
		super("foundation" + no);
	}
    dragstart(e, game) {
		console.log(e, game);
		debugger;
		/////VIEUX
        if (pile_dom.classList.contains("foundation")) {
            return;
        }
		/////
	}
	top() {
		if (this.length === 0) {
			return -1;
		} else {
			return this.elements.slice(-1)[0];
		}
	}
	value() {
		return this.length - 1;
	}
	canTake(card) {
		return this.value + 1 === card.value;
	}
};
