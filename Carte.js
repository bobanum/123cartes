/*jslint browser:true, esnext:true */
class Carte {
    /**
     * Creates an instance of Carte.
     * @memberOf Carte
     */
    constructor(sorte, valeur) {
        this._dom = null;
        this.initPossibilites();
        this.sorte = sorte;
        this.valeur = valeur;
        this._visible = false;
    }
    get couleur() {
        return this.sorte % 12;
    }
    get dom() {
        if (!this._dom) {
            this._dom = this.dom_create();
            this._dom.obj = this;
        }
        return this._dom;
    }
    get visible() {
        return this._visible;
    }
    set visible(val) {
        this._visible = val;
        this.dom.classList.remove("visible");
        if (this._visible) {
            this.dom.classList.add("visible");
        }
    }
    get estJouable() {
        return this.possibilites.global.length > 0;
    }
    initPossibilites() {
        this.possibilites = {
            global: [],
        };
    }
    trouverJouables() {
        throw "Cette méthode devrait être surchargée;";
    }
    /**
     * Retourne un element HTML représentant une carte dont la description est passée en paramètre.
     * @returns {HTMLElement} Le div représentant la carte
     */
    dom_create() {
        var resultat;
        resultat = document.createElement("div");
        resultat.classList.add("carte");
        resultat.setAttribute("data-carte", this.sorte + this.valeur.toString(13));
        resultat.style.backgroundPositionX = (this.valeur * -5) + "em";
        resultat.style.backgroundPositionY = (this.sorte * -7) + "em";
        resultat.obj = this;
        return resultat;
    }
    retourner(etat) {
        if (etat === undefined) {
            this.visible = !this._visible;
        } else {
            this.visible = etat;
        }
        return this;
    }
    /**
     * Une carte est toujours de dessus d'une pile.
     * Afin de faire fonctionner dessus() avec tout contenu d'une pile.
     * @returns {Carte} - this
     */
    dessus() {
        return this.pile || this;
    }
    /**
     *
     *
     * @static
     *
     * @memberOf Carte
     */
    static load() {

    }
    /**
     * Inits the class properties
     *
     * @static
     *
     * @memberOf Carte
     */
    static init() {
        window.addEventListener("load", function () {
            Carte.load();
        });

    }
}
Carte.init();