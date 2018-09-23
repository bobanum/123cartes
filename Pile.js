/*jslint browser:true, esnext:true */
/*global Thing */
class Pile extends Thing {
    /**
     * Creates an instance of Pile.
     * @memberOf Pile
     */
    constructor(id) {
        super();
		this.id = id;
        this.elements = [];
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
    }
    push(element) {
        if (arguments.length > 1) {
			element = Array.from(arguments);
		}
		if (element instanceof Array) {
			return element.forEach(e => this.push(e));
		}
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
        var pos = element.coordinates;
        element.pile.elements.splice(idx, 1);
        element.pile = null;
        document.body.appendChild(element.dom);
//        element.dom.style.left = pos.x + "px";
//        element.dom.style.top = pos.y + "px";
		element.coordinates = pos;
        return element;
    }
    /**
     * Returns the first element on top of the pile
     * @returns {Pile|Card} [[Description]]
     */
    top() {
        var result;
        if (this.length === 0) {
            //This is an empty pile
			return this;
        }
        result = this.elements[this.length - 1];
        return result.top();
    }
    get carte() {
        return this.elements[0];
    }
	get visible() {
		return this.carte.visible;
	}
	set visible(val) {
		this.carte.visible = val;
	}
	get length() {
		return this.elements.length;
	}
    flip(state, duration) {
		return this.carte.flip(state, duration);
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
	remove() {
		this.detach();
		this.dom.parentNode.removeChild(this.dom);
		return this;
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
