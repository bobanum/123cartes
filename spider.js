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
        var pile, origine, possibilites, pos, self = this;
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
        pile = e.target.closest(".deplacable");
        if (!pile) {
            return;
        }
        pile.classList.add("prise");
        this.masquerJouables();
        this.demarquerDeplacables();
        origine = pile.parentNode;
        possibilites = this.trouverPossibilites(pile.obj);
        if (pile.obj.valeur === 12) {
            possibilites.push(document.querySelector("#fondation > .maison:empty"));
        }
        this.afficherPossibilites(possibilites);
        pos = pile.coordonnees;
        document.body.appendChild(pile);
        pile.style.left = pos.x + "px";
        pile.style.top = pos.y + "px";
        pile.decalage = {
            x: e.offsetX,
            y: e.offsetY
        };

        function dragmove(e) {
            pile.style.left = e.clientX - pile.decalage.x + "px";
            pile.style.top = e.clientY - pile.decalage.y + "px";
        }

        function drop() {
            var choix, position, i, possibilite, d;
            choix = {
                element: null,
                distance: Infinity
            };
            position = pile.coordonneesCentre;
            for (i = 0; i < possibilites.length; i += 1) {
                possibilite = possibilites[i];
                d = self.distance(position, possibilite.coordonneesCentre);
                if (d < choix.distance) {
                    choix.element = possibilite;
                    choix.distance = d;
                }
            }
            if (choix.element) {
                if (choix.element.classList.contains("maison")) {
                    choix.element.top().push(pile);
                } else {
                    choix.element.push(pile);
//                    self.empiler(choix.element, pile);
                }
                //			var cartes = document.querySelectorAll("#tableau .pile:not(.visible) > .carte:only-child");
                var cards = self.getCartesObj("#tableau .pile:not(.visible) > .carte:only-child");
                cards.forEach(self.flipCard);
            } else {
//                self.empiler(origine, pile);
                origine.push(pile);
            }
            pile.classList.remove("prise");

            document.body.removeEventListener("mousemove", dragmove);
            document.body.removeEventListener("mouseleave", dragcancel);
            document.body.removeEventListener("mouseup", drop);
            self.afficherJouables();
            self.masquerPossibilites();
        }

        function dragcancel() {
            origine.push(pile);
            pile.classList.remove("prise");
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
    static trouverJouables() {
        var resultat, dessus, deplacables;
        resultat = [];
        dessus = this.trouverDessus();
        deplacables = this.trouverDeplacables();
        deplacables.filter(function (deplacable) {
            var possibilites = this.trouverPossibilites(deplacable.obj, dessus.obj);
            return (possibilites.length > 0);
        });
        return resultat;
    }
    static trouverPossibilites(pile, dessus) {
        var trous, empilables;
        trous = this.getTrous();
        if (dessus === undefined) {
            dessus = this.trouverDessus();
        }
        empilables = dessus.reduce(function (r, d) {
            if (this.estEmpilable(d, pile)) {
                r.push(d);
            }
        }, [], this);
        return [].concat(trous, empilables);
    }
    static getTrous() {
        return this.getCartesObj("#tableau .colonne:empty");
    }
    static trouverDessus() {
        return this.getCartesObj(
            "#tableau .pile.visible .carte:only-child",
            null,
            (carte) => (carte.parentNode.obj)
        );
    }
    static estDeplacable(pile) {
        if (pile.classList.contains("deplacable")) {
            return true;
        }
        if (pile.children.length === 1) {
            pile.classList.add("deplacable");
            return true;
        }
        var suivant = pile.children[1];
        if (!this.estDeplacable(suivant)) {
            return false;
        }
        if (this.estEmpilable(pile.obj, suivant.obj, true)) {
            pile.classList.add("deplacable");
            return true;
        }
        return false;
    }
    static estEmpilable(dessous, dessus, strict) {
        if (dessous.obj.valeur !== dessus.obj.valeur + 1) {
            return false;
        }
        if (!strict) {
            return true;
        }
        if (dessous.obj.sorte === dessus.obj.sorte) {
            return true;
        }
        return false;
    }
    static trouverDeplacables() {
        return this.getCartesObj("#tableau .pile.visible", this.estDeplacable);
    }
    static demarquerDeplacables() {
        var deplacables = document.querySelectorAll(".deplacable");
        deplacables.forEach(function (deplacable) {
            deplacable.classList.remove("deplacable");
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
