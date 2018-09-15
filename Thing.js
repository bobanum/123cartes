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
		if (Game.pref.animationSpeed === 0) {
			return new Promise(resolve => {
				destination.push(this);
				if (flip) {
					this.flip();
				}
				resolve();
			});
		}
		return new Promise(resolve => {
			let start = this.coordinates;
			destination.push(this);
			let stop = this.coordinates;
			let distance = Game.distance(stop, start);
			this.detach();
			let transport = new Pile();
			transport.push(this);
			transport.dom.classList.add("transport");
			document.body.appendChild(transport.dom);
			if (flip) {
				var temp = transport.dom.appendChild(this.dom.cloneNode());
				temp.style.zIndex = "1000";
				this.flip();
				transport.dom.style.transform = "rotateY(180deg)";
			}
			transport.coordinates = start;
			transport.dom.addEventListener("transitionend", (e)=>{
				if (e.target.style.transition && e.propertyName !== "z-index") {
					e.target.style.transition = "";
					destination.push(this);
					transport.remove();
					resolve(this);
				}
			});
			window.setTimeout(() => {
				var duration = Game.duration(distance);
				transport.coordinates = stop;
				if (flip) {
					transport.dom.style.transform = "rotateY(0deg)";
					temp.style.transition = duration + "ms";
					temp.style.zIndex = "-1000";
				}
				transport.dom.style.transition = duration + "ms";
			}, 10);
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
