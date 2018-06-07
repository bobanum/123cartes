/*jslint browser:true, esnext:true*/
/*global Jeu, Pile, Carte */
class Klondike extends Jeu {
    /**
     * Creates an instance of Klondike.
     * @memberOf Klondike
     */
    constructor() {
        super();
        this.cartes = [];
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
        return this.jeu.colonnes.map(c=>c.dessus().carte);
    }
    static main() {
        this.paquet = this.brasser(this.nouveauPaquet());
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
            let carte = pile.ajouter(this.talon.dessus());
            // this.empiler(this.colonnes[i].dessus(), carte);
            this.colonnes[i].dessus().ajouter(carte);
            carte.retourner();
            for (let j = i + 1; j < 7; j += 1) {
                carte = this.talon.dessus();
                // this.empiler(this.colonnes[j].dessus(), this.talon.dessus());
                this.colonnes[j].dessus().ajouter(carte);
            }
        }
        document.body.addEventListener("mousedown", this.dragstart);
        this.afficherJouables();
        return;
    }
    static pile_fondation() {
        var resultat, i, maison;
        resultat = new this.Pile("fondation");
        resultat.dx = 10;
        resultat.dy = 0;
        for (i = 0; i < 4; i += 1) {
            maison = resultat.ajouter(this.pile_maison(i));
            this.maisons.push(maison);
        }
        return resultat;
    }
    static pile_tableau() {
        var resultat, i, colonne;
        resultat = new this.Pile("tableau");
        for (i = 0; i < 7; i += 1) {
            colonne = resultat.ajouter(this.pile_colonne(i));
            this.colonnes.push(colonne);
        }
        return resultat;
    }
    static pile_talon(cartes) {
        var resultat;
        resultat = new this.Pile("talon");
        cartes.forEach(function (carte) {
            var pile = resultat.ajouter(new this.Pile());
            pile.ajouter(carte);
        }, this);
        return resultat;
    }
    static pile_defausse() {
        var resultat;
        resultat = new this.Pile("defausse");
        return resultat;
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
        var pile, carte, origine, possibilites, self=this;
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
        pile = carte.closest(".pile");
        if (pile.classList.contains("maison")) {
            return;
        }
        pile.classList.add("prise");
        this.masquerJouables();
        origine = pile.parentNode;
        possibilites = this.trouverPossibilites(carte.obj);
        this.afficherPossibilites(possibilites);
        possibilites = possibilites.maisons.concat(possibilites.colonnes);
        this.depiler(pile);
        pile.decalage = {
            x: e.offsetX,
            y: e.offsetY
        };

        function dragmove(e) {
            pile.style.left = e.clientX - pile.decalage.x + "px";
            pile.style.top = e.clientY - pile.decalage.y + "px";
        }

        function drop() {
            self.deposerCarte(pile, possibilites, origine);
            dragstop();
        }

        function dragcancel() {
            self.empiler(origine, pile);
            pile.classList.remove("prise");
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
    static deposerCarte(pile, possibilites, origine) {
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
                this.empiler(choix.element, pile);
            } else {
                this.empiler(choix.element, pile);
            }
            //		var cartes = document.querySelectorAll("#tableau .pile:not(.visible) > .carte:only-child");
            var cartes = this.getCartesObj("#tableau .pile:not(.visible) > .carte:only-child");
            cartes.forEach(function (carte) {
                this.retournerCarte(carte);
            }, this);
        } else {
            this.empiler(origine, pile);
        }
        pile.classList.remove("prise");
        return pile;
    }

    static distribuer3cartes() {
        var carte;
        this.masquerJouables();
        var pile = this.defausse;
        for (var i = 0; i < 3 && this.talon.firstChild; i += 1) {
            carte = this.talon.dessus();
            this.retournerCarte(carte);
            this.empiler(pile, carte);
            pile = carte;
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
            this.retournerCarte(carte);
            this.empiler(this.talon, carte);
        });
        this.afficherJouables();
        return;
    }
    static dessusDefausse() {
        var resultat;
//        resultat = document.querySelector("#defausse > .pile:last-child .carte:only-child");
        resultat = this.defausse.dessus();
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
        piles = this.cartes.filter(function (carte) {
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
        window.addEventListener("load", function () {
            Klondike.load();
        });

    }
}
Klondike.init();

Klondike.Carte = class extends Carte {
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
        dessus = this.jeu.maisons[this.sorte].dessus();
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
