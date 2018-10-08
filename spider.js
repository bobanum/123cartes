/*jslint browser:true, esnext:true*/
/*global Game, Pile, Card */
class Spider extends Game {
    /**
     * Creates an instance of Spider.
     * @memberOf Spider
     */
    constructor() {
        super();
        this.cards = [];
    }
    ////////////////////////////////
    ////////////////////////////////
    ////////////////////////////////


    static spider_main() {
        this.deck = this.shuffle(this.newDeck().concat(this.newDeck()));
        this.stock = null;
        this.foundation = [];
        this.tableau = [];
        this.pref.showMoves = true;
        this.board = this.dom_board();
        document.body.appendChild(this.board);
        this.start();
    }
    static dom_board() {
        var resultat;
        resultat = document.createElement("div");
        resultat.setAttribute("id", "board");

        this.stock = this.pile_stock(this.deck);
        resultat.appendChild(this.stock);
        this.foundation = this.dom_foundation();
        resultat.appendChild(this.foundation);
        this.tableau_dom = this.dom_tableau();
        resultat.appendChild(this.tableau_dom);
        return resultat;
    }
    static pile_stock(cartes) {
        var result, pile;
        result = new this.Pile("stock");
        cartes.forEach(function (card) {
            pile = result.push(new this.Pile());
            pile.push(card);
        }, this);
        result.dom.setAttribute("data-n", result.length);
        return result;
    }
    static dom_foundation() {
        var resultat, i, pile;
        resultat = this.dom_pile();
        resultat.setAttribute("id", "foundation");
        for (i = 0; i < 8; i += 1) {
            pile = this.dom_foundationPile(i);
            this.foundation.push(pile);
            resultat.appendChild(pile);
        }
        return resultat;
    }
    static dom_foundationPile(no) {
        var resultat;
        resultat = this.dom_pile();
        resultat.setAttribute("id", "foundation" + no);
        resultat.classList.add("foundation");
        return resultat;
    }
    static dom_tableau() {
        var resultat, i, colonne;
        resultat = this.dom_pile();
        resultat.setAttribute("id", "tableau");
        for (i = 0; i < 10; i += 1) {
            colonne = this.dom_colonne(i);
            this.tableau.push(colonne);
            resultat.appendChild(colonne);
        }
        return resultat;
    }
    static dom_colonne(no) {
        var resultat;
        resultat = this.dom_pile();
        resultat.setAttribute("id", "colonne" + no);
        resultat.classList.add("colonne");
        return resultat;
    }
    static start() {
        var card, i, j;
        for (i = 0; i < 6; i += 1) {
            for (j = 0; j < 10; j += 1) {
                if (i === 5 && j > 3) {
                    break;
                }
                card = this.stock.lastChild;
                this.tableau[j].top().push(card);
                this.stock.setAttribute("data-n", this.stock.childElementCount);
            }
        }
        //tourner les premières cartes
        for (j = 0; j < 10; j += 1) {
            card = this.tableau[j].top();
            this.flipCard(card);
        }
        document.body.addEventListener("mousedown", this.dragstart);
        this.showPlayables();
        return;
    }
    static dragstart(e) {
        var pile_dom, origine, moves, pos, self = this;
        if (e.target.closest("#stock")) {
            if (document.querySelector("#tableau > .colonne:empty")) {
                return;
            }
            if (this.stock.childElementCount === 0) {
                return;
            }
            this.distribuer10cartes();
            return;
        }
        pile_dom = e.target.closest(".movable");
        if (!pile_dom) {
            return;
        }
        pile_dom.classList.add("prise");
        this.hidePlayables();
        this.unmarkMovables();
        origine = pile_dom.parentNode;
        moves = this.findMoves(pile_dom.obj);
        if (pile_dom.obj.value === 12) {
            moves.push(document.querySelector("#foundation > .foundation:empty"));
        }
        this.showMoves(moves.global);
        pos = pile_dom.coordinates;
        document.body.appendChild(pile_dom);
        pile_dom.style.left = pos.x + "px";
        pile_dom.style.top = pos.y + "px";
        pile_dom.decalage = {
            x: e.offsetX,
            y: e.offsetY
        };

        function dragmove(e) {
            pile_dom.style.left = e.clientX - pile_dom.decalage.x + "px";
            pile_dom.style.top = e.clientY - pile_dom.decalage.y + "px";
        }

        function drop() {
            var choice, position;
            choice = {
                element: null,
                distance: Infinity
            };
            position = pile_dom.coordinates_center;
            moves.forEach(move => {
                var distance = Thing.distance(position, move.coordinates_center);
                if (distance < choice.distance) {
                    choice.element = move;
                    choice.distance = distance;
                }
			});
            if (choice.element) {
                if (choice.element.classList.contains("foundation")) {
                    choice.element.top().push(pile_dom);
                } else {
                    choice.element.push(pile_dom);
//                    self.empiler(choix.element, pile);
                }
                //			var cartes = document.querySelectorAll("#tableau .pile:not(.visible) > .carte:only-child");
                var cards = self.selectObjects("#tableau .pile:not(.visible) > .carte:only-child");
                cards.forEach(self.flipCard);
            } else {
//                self.empiler(origine, pile);
                origine.push(pile_dom);
            }
            pile_dom.classList.remove("prise");

            document.body.removeEventListener("mousemove", dragmove);
            document.body.removeEventListener("mouseleave", dragcancel);
            document.body.removeEventListener("mouseup", drop);
            self.showPlayables();
            self.hideMoves();
        }

        function dragcancel() {
            origine.push(pile_dom);
            pile_dom.classList.remove("prise");
            self.showPlayables();
            self.hideMoves();
            document.body.removeEventListener("mousemove", dragmove);
            document.body.removeEventListener("mouseleave", dragcancel);
            document.body.removeEventListener("mouseup", drop);
        }
        document.body.addEventListener("mousemove", dragmove);
        document.body.addEventListener("mouseleave", dragcancel);
        document.body.addEventListener("mouseup", drop);
        document.body.addEventListener("mousedown", self.dragstart);
    }
    static distribuer10cartes() {
        var i, colonne, carte;
        this.hidePlayables();
        this.unmarkMovables();
        if (this.stock.lastChild) {
            for (i = 0; i < 10; i += 1) {
                colonne = this.tableau[i];
                carte = this.stock.top();
                this.flipCard(carte);
                colonne.top().push(carte);
                this.stock.setAttribute("data-n", this.stock.childElementCount);
            }
        }
        this.showPlayables();
    }
    /**
     * Returns all playable cards or piles on the board
     * @returns {Card[]|Pile[]} An array
     */
    static findPlayables() {
        var result, top, movables;
        result = [];
		//TODO Revise. findTops returns an array... not dom
        top = this.findTops().obj;
        movables = this.findMovables();
		//TODO Validate the assignation
        movables = movables.filter(movable => (this.findMoves(movable, top).length > 0));
        return result;
    }
    /**
     * Returns all the moves that can be made with given cards (or tops of piles)
     * @param   {Pile}     pile The pile to evaluate
     * @param   {[[Type]]} top  [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    static findMoves(pile, top) {
		//TODO REVISE AND DOC. use .global
		var result, stackables;
		result = {};
		result.global = this.getHoles();
		if (top === undefined) {
			top = this.findTops();
		}
		stackables = top.filter(d => {
			return this.isStackable(d, pile);
		});
		result.global.push(...stackables);
		return result;
    }
    /**
     * Returns all the holes in the "tableau"
     * @returns {Pile[]} Some of the columns
     */
    static getHoles() {
        return this.selectObjects("#tableau .colonne:empty");
    }
    /**
     * Returns all cards on the top of each column in the tablbeau
     * @returns {Card[]} An array of Card objects
     */
    static findTops() {
        return this.selectObjects(
            "#tableau .pile.visible .carte:only-child",
            null,
            (card) => (card.parentNode.obj)
        );
    }
    /**
     * Returns true if given pile can be moved to another pile
     * @param   {HTMLElement}  pile_dom The Pile object to assert
     * @returns {boolean} true if pile is movable
     */
    static isMovable(pile_dom) {
        if (pile_dom.classList.contains("movable")) {
            return true;
        }
        if (pile_dom.children.length === 1) {
            pile_dom.classList.add("movable");
            return true;
        }
        var next = pile_dom.children[1];
        if (!this.isMovable(next)) {
            return false;
        }
        if (this.isStackable(pile_dom.obj, next.obj, true)) {
            pile_dom.classList.add("movable");
            return true;
        }
        return false;
    }
    /**
     * Returns true if top pile can be put on bottom pile in an ascending sequence
     * @param   {Pile?|Card?} bottom The card on which to put top
     * @param   {Pile?|Card?} top    The card to place on bottom
     * @param   {boolean}     strict If true, suit must match
     * @returns {boolean}
     */
    static isStackable(bottom, top, strict) {
        if (bottom.value !== top.value + 1) {
            return false;
        }
        if (!strict) {
            return true;
        }
        if (bottom.suit === top.suit) {
            return true;
        }
        return false;
    }
    /**
     * Returns all cards that can be place elsewhere
     * @returns {Pile[]} An Array of Pile objects
     */
    static findMovables() {
        return this.selectObjects("#tableau .pile.visible", this.isMovable);
    }
    /**
     * Remove "movable" class from all dom
     */
    static unmarkMovables() {
        var movables = document.querySelectorAll(".movable");
        movables.forEach(function (movable) {
            movable.classList.remove("movable");
        });
        return;
    }
    /////////////////////////////
    /////////////////////////////
    /////////////////////////////
    /**
     *
     *
     * @static
     *
     * @memberOf Spider
     */
    static load() {
        this.main();
    }
    /**
     * Inits the class properties
     *
     * @static
     *
     * @memberOf Spider
     */
    static init() {
        window.addEventListener("load", function () {
            Spider.load();
        });

    }
}
Spider.init();


Spider.Card = class extends Card {
};

Spider.Pile = class extends Pile {
};
