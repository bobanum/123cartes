/*jslint browser:true, esnext:true */
/*global Carte, Pile */
class Jeu {
    /**
     * Creates an instance of Jeu.
     * @memberOf Jeu
     */
    constructor() {

    }
    ////////////////////////////////////////

    /**
     * Retourne un nouveau paquet de cartes en fonction des variables globales. Les cartes sont les désignations sous forme de chaine.
     * @returns {[string]} Le tableau
     */
    static nouveauPaquet() {
        var resultat, s, v;
        resultat = [];
        for (s = 0; s < this.sortes.length; s += 1) {
            for (v = 0; v < this.valeurs.length; v += 1) {
                resultat.push(new Carte(s, v));
            }
        }
        return resultat;
    }

    /**
     * Retourne un tableau mélangé
     * @param   {Array} paquet Le tableau à mélanger
     * @returns {Array} une copie du tableau
     */
    static brasser(paquet) {
        var resultat, copie, carte, pos;
        copie = paquet.slice();
    //	autre version :
    //	copie.sort( function () { return Math.random() < 0.5; });
    //	return copie;
        resultat = [];
        while (copie.length > 0) {
            pos = Math.floor(Math.random() * copie.length);
            carte = copie[pos];
            copie.splice(pos, 1);
            resultat.push(carte);
        }
        return resultat;
    }

    /**
     * Rend visible (ou non) la face carte.
     * @param   {HTMLElement} carte L'élément HTML représentant la carte
     * @param   {boolean}     etat  L'état final de la carte. Par défaut, on inverse l'état actuel.
     * @returns {HTMLElement} La carte ainsi changée
     */
    static retournerCarte(carte, etat) {
        carte.obj = etat;
        return carte;
    }

    /**
     * Transfere la carte donnée vers une autre pile
     * @param   {Pile} destination La pile qui recoit
     * @param   {Pile} pile        La pile ou carte à mettre par-dessus
     * @returns undefined
     * @todo RÉVISER
     */
    static empiler(destination, element) {
        this.depiler(element);
        destination.ajouter(element);
    }
    static depiler(element) {
        Pile.retirer(element);
        return element;
    }

    static distance(p1, p2) {
        var dx, dy;
        dx = p1.x - p2.x;
        dy = p1.y - p2.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    /**
     * Retourne l'indice de la sorte de la carte passée en paramètre.
     * @todo Réviser
     * @param   {object Carte} carte La carte.
     * @returns {number} L'indice de la valeur de la carte. Un nombre entre 0 et 3 en fonction de this.sortes
     */
    static getSorte(carte) {
        return carte.dom.sorte;
    }

    static afficherJouables() {
        var jouables, i;
        jouables = this.trouverJouables();
        for (i = 0; i < jouables.length; i += 1) {
            jouables[i].dom.classList.add("jouable");
        }
    }
    static getCartesObj(selector, filter, map) {
        var cartes;
        cartes = Array.from(document.querySelectorAll(selector));
        cartes = cartes.map(carte => carte.obj);
        if (filter) {
            cartes = cartes.filter(filter);
        }
        if (map) {
            cartes = cartes.map(map);
        }
        return cartes;
    }
    static masquerJouables() {
        var jouables = document.querySelectorAll(".jouable");
        jouables.forEach(function (jouable) {
            jouable.classList.remove("jouable");
        });
        return jouables;
    }
    static afficherPossibilites(possibilites) {
        var i;
        if (possibilites instanceof Array) {
            for (i = 0; i < possibilites.length; i += 1) {
                possibilites[i].classList.add("possibilite");
            }
        } else {
            for (i in possibilites) {
                this.afficherPossibilites(possibilites[i]);
            }
        }
    }
    static masquerPossibilites() {
        var possibilites = document.querySelectorAll(".possibilite");
        possibilites.forEach(function (possibilite) {
            possibilite.classList.remove("possibilite");
        });
        return possibilites;
    }
/////////////////////////////////
/////////////////////////////////
/////////////////////////////////
    /**
     *
     *
     * @static
     *
     * @memberOf Jeu
     */
    static load() {
    }
    /**
     * Inits the class properties
     *
     * @static
     *
     * @memberOf Jeu
     */
    static init() {
        this.sortes = "CTKP";
        this.valeurs = "1234567890VDR";
        this.pref = {};
        this.MOUSEDOWN = 'mousedown';
        this.MOUSEUP = 'mouseup';
        this.MOUSEMOVE = 'mousemove';
        this.MOUSEOUT = 'mouseout';

        window.addEventListener("load", function () {
            Jeu.load();
        });

    }
}
Jeu.init();


