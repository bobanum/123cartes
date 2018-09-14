/*jslint browser:true, esnext:true */
class Card {
    /**
     * Creates an instance of Card.
     * @memberOf Card
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
	/**
	 * Puts the card loose on the board: not part of another pile.
	 * @returns {Card} this
	 */
	detach() {
		if (!this.pile) {
            //Card is not in a pile. Nothing to do.
			return this;
        }
		return this.pile.detach(this);
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
     * Afin de faire fonctionner top() avec tout contenu d'une pile.
     * @returns {Card} - this
     */
    top() {
        return this.pile || this;
    }
    /**
     *
     *
     * @static
     *
     * @memberOf Card
     */
    static load() {

    }
    /**
     * Inits the class properties
     *
     * @static
     *
     * @memberOf Card
     */
    static init() {
        window.addEventListener("load", function () {
            Card.load();
        });

    }
}
Card.init();
