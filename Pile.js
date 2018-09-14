/*jslint browser:true, esnext:true */
class Pile {
    /**
     * Creates an instance of Pile.
     * @memberOf Pile
     */
    constructor(id) {
        this.id = id;
        this._dom = null;
        this.elements = [];
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
    }
    get dom() {
        if (!this._dom) {
            this._dom = this.dom_create();
            this._dom.obj = this;
        }
        return this._dom;
    }
    push(element) {
        element.detach();
        this.elements.push(element);
        element.pile = this;
        this.dom.appendChild(element.dom);
        element.dom.style.removeProperty("top");
        element.dom.style.removeProperty("left");
        return element;
    }

	/**
	 * Puts the pile loose on the board: not part of another pile.
	 * @returns {Pile} this
	 */
	detach(element) {
		if (!element) {
			element = this;
		}
		if (!element.pile) {
            //Pile is not in a pile. Nothing to do.
			return element;
        }
        var idx = element.pile.elements.indexOf(element);
        var pos = element.coordonnees;
        element.pile.elements.splice(idx, 1);
        element.pile = null;
        document.body.appendChild(element.dom);
        element.dom.style.left = pos.x + "px";
        element.dom.style.top = pos.y + "px";
        return element;
    }
    /**
     * Returns the first element on top of the pile
     * @returns {Pile|Card} [[Description]]
     */
    top() {
        var result;
        if (this.elements.length === 0) {
            //This is an empty pile
			return this;
        }
        result = this.elements.slice(-1)[0];
        return result.top();
    }
    get carte() {
        return this.elements[0];
    }
    get coordonnees() {
        return Pile.coordonnees(this.dom);
    }
    get coordonneesCentre() {
        return Pile.coordonneesCentre(this.dom);
    }
    retourner(etat) {
        this.elements.forEach(function (e) {
            e.retourner(etat);
        }, this);
    }
    static coordonnees(element, ref) {
        ref = ref || document.body;
        var resultat = {x: 0, y: 0};
        while (element && element !== ref && element !== document.body) {
            resultat.x += element.offsetLeft;
            resultat.y += element.offsetTop;
            element = element.parentNode;
        }
        return resultat;
    }
    static coordonneesCentre(element, ref) {
        ref = ref || document.body;
        var resultat = this.coordonnees(element, ref);
        resultat.x += element.offsetWidth / 2;
        resultat.y += element.offsetHeight / 2;
        return resultat;
    }
    /**
     * Retourne un élément html représentant une pile vide.
     * @param   {string}      id     Le id à donner à la pile
     * @returns {HTMLElement} Un élément div.pile#id
     */
    dom_create() {
        var resultat;
        resultat = document.createElement("div");
        if (this.id) {
            resultat.setAttribute("id", this.id);
        }
        resultat.classList.add("pile");
        return resultat;
    }
    /**
     *
     * @static
     * @memberOf Pile
     */
    static load() {

    }
    /**
     * Inits the class properties
     * @static
     * @memberOf Pile
     */
    static init() {
        window.addEventListener("load", function () {
            Pile.load();
        });

    }
}
Pile.init();
