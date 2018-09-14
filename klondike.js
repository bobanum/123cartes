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
        this.plateau = null;
        this.plateau = this.html_plateau();
        document.body.appendChild(this.plateau);
        this.commencerJeu();
        return;
    }
    static html_plateau() {
        var resultat;
        resultat = document.createElement("div");
        resultat.setAttribute("id", "plateau");

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
        this.afficherJouables();
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
        var pile_dom, pile, carte, origin, possibilites, self=this;
        if (e.target === this.talon) {
            this.replacerTalon();
            return;
        }
        if (e.target.closest("#talon")) {
            this.distribuer3cartes();
            return;
        }
        carte = e.target.closest(".visible");
        if (!carte) {
            return;
        }
        pile_dom = carte.closest(".pile");
		pile = pile_dom.obj;
        if (pile_dom.classList.contains("maison")) {
            return;
        }
        pile_dom.classList.add("prise");
        this.masquerJouables();
        origin = pile_dom.parentNode;
        possibilites = this.trouverPossibilites(carte.obj);
        this.afficherPossibilites(possibilites);
        possibilites = possibilites.maisons.concat(possibilites.colonnes);
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
            self.deposerCarte(pile, possibilites, origin.obj);
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
            self.masquerPossibilites();
            self.afficherJouables();
        }
        document.body.addEventListener("mousemove", dragmove);
        document.body.addEventListener("mouseleave", dragcancel);
        document.body.addEventListener("mouseup", drop);
    }
    static deposerCarte(pile, possibilites, origin) {
        var position, choix;
        position = pile.coordonneesCentre;
        choix = {
            element: null,
            distance: Infinity
        };
        possibilites.forEach(function (possibilite) {
            var d = this.distance(position, possibilite.coordonneesCentre);
            if (d < choix.distance) {
                choix.element = possibilite;
                choix.distance = d;
            }
        });
        if (choix.element) {
            if (choix.element.classList.contains("maison")) {
                choix.element.push(pile);
//                this.empiler(choix.element, pile);
            } else {
                choix.element.push(pile);
//                this.empiler(choix.element, pile);
            }
            //		var cartes = document.querySelectorAll("#tableau .pile:not(.visible) > .carte:only-child");
            var cards = this.getCartesObj("#tableau .pile:not(.visible) > .carte:only-child");
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
        this.masquerJouables();
        var pile = this.defausse;
        for (let i = 0; i < 3 && this.talon.firstChild; i += 1) {
            let card = this.talon.top();
            this.flipCard(card);
			pile.push(card);
//            this.empiler(pile, card);
            pile = card;
        }
        this.afficherJouables();
        return pile;
    }
    static replacerTalon() {
        var cartes;
        this.masquerJouables();
        //	cartes = document.querySelectorAll("#defausse .pile");
        cartes = this.getCartesObj("#defausse .pile");
        cartes.forEach(function (carte) {
            this.flipCard(carte);
            this.talon.push(carte);
//            this.empiler(this.talon, carte);
        });
        this.afficherJouables();
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
    static trouverPossibilites(carte) {
        var resultat;
        resultat = {
            maisons: this.trouverPossibilitesMaison(carte),
            colonnes: this.trouverPossibilitesColonne(carte)
        };
        return resultat;
    }
    static trouverPossibilitesMaison(carte) {
        var sorte, valeur, resultat, dessus;
        sorte = carte.sorte;
        valeur = carte.valeur;
        resultat = [];

        if (carte.nextSibling) {
            return [];
        }
        if (valeur === 0) {
            resultat.push(this.maisons[sorte]);
            return resultat;
        }
        dessus = this.maisons[sorte].lastChild;
        if (dessus && valeur === dessus.obj.valeur + 1) {
            resultat.push(this.maisons[sorte]);
        }
        return resultat;
    }
    static trouverPossibilitesColonne(carte) {
        var resultat, valeur, couleur;
        resultat = [];
        valeur = carte.valeur;
        couleur = carte.couleur;
        if (valeur === 12) {
            //		var colonnes = document.querySelectorAll(".colonne:empty");
            var colonnes = this.getCartesObj(".colonne:empty");
            resultat = resultat.concat(colonnes);
            return resultat;
        }
        //	var cartes = document.querySelectorAll(".colonne .carte:only-child");
        var cartes = this.getCartesObj(
            ".colonne .carte:only-child",
            (carte) => (couleur !== carte.couleur && valeur === carte.valeur - 1),
            (carte) => (carte.dom.parentNode.obj)
        );
        resultat = resultat.concat(cartes);
        return resultat;
    }
    static trouverJouables() {
        var resultat, carte, piles;
        resultat = [];
        carte = this.dessusDefausse();
        if (carte && carte.estJouable()) {
            resultat.push(carte);
        }

        //    piles = Array.from(document.querySelectorAll("#tableau .pile.visible"));
        //    piles = piles.map(pile => pile.obj);
        //    piles = piles.filter((pile) => estJouable(pile));
//        piles = this.getCartesObj("#tableau .pile.visible", this.estJouable);
        piles = this.cards.filter(function (carte) {
            return carte.possibilites.global.length > 0;
        }, this);
        resultat = [].concat(resultat, piles);
        return resultat;
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
    constructor(sorte, valeur) {
        super(sorte, valeur);
    }
    get estJouable() {
        return this.possibilites.global.length > 0;
    }
    initPossibilites() {
        this.possibilites = {
            maison: [],
            colonnes: [],
            global: [],
        };
    }
    trouverPossibilites() {
        this.initPossibilites();
        if (!this._visible) {
            return [];
        }
        this.trouverPossibilitesMaison();
        this.trouverPossibilitesColonnes();
        this.possibilites.global = [].concat(this.possibilites.maison, this.possibilites.colonnes);
        return this.possibilites.global;
    }
    trouverPossibilitesMaison() {
        var resultat, dessus, carte;
        resultat = [];
        // Si la carte n'est pas sur le dessus de la pile, elle ne peut être jouable
        if (this.pile.elements.length > 1) {
            this.possibilites.maison = [];
            return;
        }
        dessus = this.jeu.maisons[this.sorte].top();
        if (this.valeur === 0) {
            this.possibilites.maison = [dessus];
            return;
        }
        carte = dessus.carte;
        if (carte && this.sorte === carte.sorte && this.valeur === carte.valeur + 1) {
            this.possibilites.maison = [dessus];
            return;
        }
    }
    trouverPossibilitesColonne() {
        if (this.valeur === 12) {
            console.log("valider");
            this.possibilites.colonnes = this.jeu.colonnes.filter(c=>c.elements.length === 0);
            return;
        } else {
            var dessusColonnes = this.jeu.dessusColonnes;
            this.possibilites.colonnes = dessusColonnes.filter(function(carte) {
                return this.couleur !== carte.couleur && this.valeur === carte.valeur - 1;
            }, this);
            return;
        }
    }
};

Klondike.Pile = class extends Pile {
};
