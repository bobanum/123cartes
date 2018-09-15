/*jslint browser:true, esnext:true */
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
