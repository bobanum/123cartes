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
        this.paquet = this.shuffle(this.newDeck().concat(this.newDeck()));
        this.talon = null;
        this.maisons = [];
        this.colonnes = [];
        this.pref.afficherPossibilites = false;
        this.plateau = this.html_plateau();
        document.body.appendChild(this.plateau);
        this.commencerJeu();
    }
    static html_plateau() {
        var resultat;
        resultat = document.createElement("div");
        resultat.setAttribute("id", "plateau");

        this.talon = this.pile_talon(this.paquet);
        resultat.appendChild(this.talon);
        this.fondation = this.html_fondation();
        resultat.appendChild(this.fondation);
        this.tableau = this.html_tableau();
        resultat.appendChild(this.tableau);
        return resultat;
    }
    static pile_talon(cartes) {
        var result, pile;
        result = new this.Pile("talon");
        cartes.forEach(function (card) {
            pile = result.push(new this.Pile());
            pile.push(card);
        }, this);
        result.dom.setAttribute("data-n", result.elements.length);
        return result;
    }
    static html_fondation() {
        var resultat, i, maison;
        resultat = this.html_pile();
        resultat.setAttribute("id", "fondation");
        for (i = 0; i < 8; i += 1) {
            maison = this.html_maison(i);
            this.maisons.push(maison);
            resultat.appendChild(maison);
        }
        return resultat;
    }
    static html_maison(no) {
        var resultat;
        resultat = this.html_pile();
        resultat.setAttribute("id", "maison" + no);
        resultat.classList.add("maison");
        return resultat;
    }
    static html_tableau() {
        var resultat, i, colonne;
        resultat = this.html_pile();
        resultat.setAttribute("id", "tableau");
        for (i = 0; i < 10; i += 1) {
            colonne = this.html_colonne(i);
            this.colonnes.push(colonne);
            resultat.appendChild(colonne);
        }
        return resultat;
    }
    static html_colonne(no) {
        var resultat;
        resultat = this.html_pile();
        resultat.setAttribute("id", "colonne" + no);
        resultat.classList.add("colonne");
        return resultat;
    }
    static commencerJeu() {
        var card, i, j;
        for (i = 0; i < 6; i += 1) {
            for (j = 0; j < 10; j += 1) {
                if (i === 5 && j > 3) {
                    break;
                }
                card = this.talon.lastChild;
                this.colonnes[j].top().push(card);
                this.talon.setAttribute("data-n", this.talon.childElementCount);
            }
        }
        //tourner les premières cartes
        for (j = 0; j < 10; j += 1) {
            card = this.colonnes[j].top();
            this.flipCard(card);
        }
        document.body.addEventListener("mousedown", this.dragstart);
        this.afficherJouables();
        return;
    }
    static dragstart(e) {
        var pile_dom, origine, moves, pos, self = this;
        if (e.target.closest("#talon")) {
            if (document.querySelector("#tableau > .colonne:empty")) {
                return;
            }
            if (this.talon.childElementCount === 0) {
                return;
            }
            this.distribuer10cartes();
            return;
        }
        pile_dom = e.target.closest(".deplacable");
        if (!pile_dom) {
            return;
        }
        pile_dom.classList.add("prise");
        this.masquerJouables();
        this.demarquerDeplacables();
        origine = pile_dom.parentNode;
        moves = this.findMoves(pile_dom.obj);
        if (pile_dom.obj.valeur === 12) {
            moves.push(document.querySelector("#fondation > .maison:empty"));
        }
        this.afficherPossibilites(moves);
        pos = pile_dom.coordonnees;
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
            var choix, position, i, possibilite, d;
            choix = {
                element: null,
                distance: Infinity
            };
            position = pile_dom.coordonneesCentre;
            for (i = 0; i < moves.length; i += 1) {
                possibilite = moves[i];
                d = self.distance(position, possibilite.coordonneesCentre);
                if (d < choix.distance) {
                    choix.element = possibilite;
                    choix.distance = d;
                }
            }
            if (choix.element) {
                if (choix.element.classList.contains("maison")) {
                    choix.element.top().push(pile_dom);
                } else {
                    choix.element.push(pile_dom);
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
            self.afficherJouables();
            self.masquerPossibilites();
        }

        function dragcancel() {
            origine.push(pile_dom);
            pile_dom.classList.remove("prise");
            self.afficherJouables();
            self.masquerPossibilites();
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
        this.masquerJouables();
        this.demarquerDeplacables();
        if (this.talon.lastChild) {
            for (i = 0; i < 10; i += 1) {
                colonne = this.colonnes[i];
                carte = this.talon.top();
                this.flipCard(carte);
                colonne.top().push(carte);
                this.talon.setAttribute("data-n", this.talon.childElementCount);
            }
        }
        this.afficherJouables();
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
		//TODO REVISE AND DOC
		var result, stackables;
		result = this.getHoles();
		if (top === undefined) {
			top = this.findTops();
		}
		stackables = top.filter(d => {
			return this.isStackable(d, pile);
		});
		result.push(...stackables);
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
        if (bottom.valeur !== top.valeur + 1) {
            return false;
        }
        if (!strict) {
            return true;
        }
        if (bottom.sorte === top.sorte) {
            return true;
        }
        return false;
    }
    /**
     * Returns all cards that can be place elsewhere
     * @returns {Pile[]} An Array of Pile objects
     */
    static findMovables() {
        return this.selectCards("#tableau .pile.visible", this.isMovable);
    }
    static demarquerDeplacables() {
        var deplacables = document.querySelectorAll(".deplacable");
        deplacables.forEach(function (deplacable) {
            deplacable.classList.remove("movable");
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
