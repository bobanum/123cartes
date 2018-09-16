/*jslint browser:true, esnext:true */
/*global Thing, Game, Pile */
class Card extends Thing {
    /**
     * Creates an instance of Card.
     * @memberOf Card
     */
    constructor(suit, value) {
        super();
        this.initMoves();
        this.suit = suit;
        this.value = value;
        this._visible = false;
    }
    get color() {
        return this.suit % 2;
    }
    get visible() {
        return this._visible;
    }
    set visible(val) {
        this._visible = !!val;
        this.dom.classList.remove("visible");
        if (this._visible) {
            this.dom.classList.add("visible");
        }
    }
    get estJouable() {
        return this.moves.global.length > 0;
    }
    initMoves() {
        this.moves = {
            global: [],
        };
    }
    findPlayables() {
        throw "This method should be overloaded;";
    }
	flip(state, duration) {
		if (state === undefined) {
			state = !this.visible;
		}
		if (state === this.visible) {
			return Promise.resolve(this);
		}
		if (duration === undefined) {
			duration = Game.pref.animationSpeed * 5;
		}
		if (duration < 20) {
			return new Promise(resolve => {
				this.visible = state;
				resolve(this);
			});
		}
		return new Promise(resolve => {
			let transport = new Pile();
			this.pile.push(transport);
			transport.push(this);
			transport.dom.classList.add("transport");
			transport.dom.classList.add("flip");

			var temp = transport.dom.appendChild(this.dom.cloneNode());
			temp.style.zIndex = "1000";
			transport.dom.style.transform = "rotateY(180deg)";
			this.visible = state;
			transport.dom.addEventListener("transitionend", (e)=>{
				if (e.target.style.transition && e.propertyName === "transform") {
					event.stopPropagation();
					e.target.style.transition = "";
					transport.pile.push(transport.elements);
					transport.remove();
					resolve(this);
				}
			});
			window.setTimeout(() => {
				transport.dom.style.transform = "rotateY(0deg)";
				temp.style.transition = duration + "ms";
				temp.style.zIndex = "-1000";
				transport.dom.style.transition = duration + "ms";
			}, 10);
		});
	}
    /**
     * Retourne un element HTML représentant une carte dont la description est passée en paramètre.
     * @returns {HTMLElement} Le div représentant la carte
     */
    dom_create() {
        var resultat;
        resultat = document.createElement("div");
        resultat.classList.add("carte");
        resultat.setAttribute("data-carte", this.suit + this.value.toString(13));
        resultat.style.backgroundPositionX = (this.value * -5) + "em";
        resultat.style.backgroundPositionY = (this.suit * -7) + "em";
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
