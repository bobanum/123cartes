/*jslint browser:true, esnext:true */
/*global Game, Pile */
class Thing {
	constructor() {
		this._dom = null;

	}
    get dom() {
        if (!this._dom) {
            this._dom = this.dom_create();
            this._dom.obj = this;
        }
        return this._dom;
    }
    get coordinates() {
        return Thing.coordinates(this.dom);
    }
    set coordinates(val) {
		this.dom.style.left = val.x + "px";
		this.dom.style.top = val.y + "px";
    }
    get coordinates_center() {
        return Thing.coordinates_center(this.dom);
    }
	moveTo(destination, flip = false) {
		var start = this.coordinates;
		//console.trace("moveto Promise");

		destination.push(this);
		var stop = this.coordinates;
		var distance = Game.distance(stop, start);
		var duration = Game.duration(distance);
		if (duration < 20 || Game.pref.animationSpeed === 0) {
			return new Promise(resolve => {
				destination.push(this);
				if (flip) {
					this.flip(true, 0);
				}
				resolve(this);
			});
		}
		var movePromise = new Promise(resolve => {
			let transport = new Pile();
			transport.push(this);
			transport.dom.classList.add("transport");
			transport.dom.classList.add("moveTo");
			document.body.appendChild(transport.dom);
			transport.coordinates = start;
			transport.dom.addEventListener("transitionend", (e)=>{
				if (transport.dom.style.transition && ["top", "left"].indexOf(e.propertyName) >= 0) {
					//console.trace("moveTo transitionend");
					event.stopPropagation();
					transport.dom.style.transition = "";
					resolve(transport);
				}
			});
			window.setTimeout(() => {
				//console.trace("moveTo start");
				transport.dom.style.transition = duration + "ms";
				transport.coordinates = stop;
			}, 10);
		});
		var flipPromise;
		if (flip) {
			flipPromise = this.flip(true, duration *1.1);
		} else {
			flipPromise = Promise.resolve();
		}
		return Promise.all([
			movePromise,
			flipPromise,
		]).then(data => {
			//console.trace("moveto and flip resolved");
			destination.push(data[0].elements);
			data[0].remove();
			return this;
		});
	}
    static coordinates(element, ref) {
        ref = ref || document.body;
        var resultat = {x: 0, y: 0};
        while (element && element !== ref && element !== document.body) {
            resultat.x += element.offsetLeft;
            resultat.y += element.offsetTop;
            element = element.parentNode;
        }
        return resultat;
    }
    static coordinates_center(element, ref) {
        ref = ref || document.body;
        var resultat = this.coordinates(element, ref);
        resultat.x += element.offsetWidth / 2;
        resultat.y += element.offsetHeight / 2;
        return resultat;
    }
}
