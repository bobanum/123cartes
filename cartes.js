/*jslint browser:true*/
/*globals coordAbs, positionAbsolue, positionRelative, unirPiles*/
/*exported g,nouveauPaquet,brasser,placerPile,transfererCarte,transfererPile,activation,unirPiles,getValeur,getSorte,getCouleur,positionAbsolue,positionRelative,retournerCarte,html_trou*/
//'use strict';
var g = {};

function main() {
	g.sortes = "CTKP";
	g.valeurs = "1234567890VDR";
	g.pref = {};
	if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
		g.iPod = true;
		g.MOUSEDOWN = 'touchstart';
		g.MOUSEUP = 'touchend';
		g.MOUSEMOVE = 'touchmove';
		g.MOUSEOUT = 'mouseout';
	} else {
		g.iPod = false;
		g.MOUSEDOWN = 'mousedown';
		g.MOUSEUP = 'mouseup';
		g.MOUSEMOVE = 'mousemove';
		g.MOUSEOUT = 'mouseout';
	}
}

function nouveauPaquet() {
	var resultat, s, v;
	resultat = [];
	for (s = 0; s < g.sortes.length; s += 1) {
		for (v = 0; v < g.valeurs.length; v += 1) {
			resultat.push(g.sortes[s] + g.valeurs[v]);
		}
	}
	return resultat;
}

function brasser(paquet) {
	var resultat, carte;
	paquet = paquet.concat();
	resultat = [];
	while (paquet.length) {
		carte = paquet.splice(Math.floor(Math.random() * paquet.length), 1)[0];
		resultat.push(carte);
	}
	return resultat;
}

function placerPile(id, cartes, left, top, decalage) {
	var pile, i, carte;
	decalage = decalage || {
		left: 0,
		top: 0
	};
	pile = html_pile(id, decalage.left, decalage.top);
	document.body.appendChild(pile);
	pile.style.left = left + "em";
	pile.style.top = top + "em";
	for (i = 0; i < cartes.length; i += 1) {
		carte = html_carte(cartes[i]);
		pile.appendChild(carte);
	}
	return pile;
}
function html_pile(id, dX, dY) {
	var resultat;
	dX = dX || 0;
	dY = dY || 0;
	resultat = document.createElement("div");
	resultat.id = id;
	resultat.classList.add("pile");
	resultat.setAttribute("data-dX", dX);
	resultat.setAttribute("data-dY", dY);
	return resultat;
}
/**
 * Retourne un element HTML représentant une carte dont la description est passée en paramètre.
 * @param   {string}   str_carte [[Description]]
 * @returns {[[Type]]} [[Description]]
 */
function html_carte(str_carte) {
	var resultat;
	resultat = document.createElement("div");
	resultat.classList.add("carte");
	resultat.setAttribute("data-carte", str_carte);
	resultat.style.backgroundPositionX = (getValeur(str_carte) * -5) + "em";
	resultat.style.backgroundPositionY = (getSorte(str_carte) * -7) + "em";
	return resultat;
}
/**
 * Retourne un element HTML représentant un trou.
 * @param   {number}      left Position horizontale du trou
 * @param   {number}      top  Position verticale du trou
 * @returns {HTMLElement} L'élément représentant le trou
 */
function html_trou(left, top) {
	var resultat;
	resultat = document.body.appendChild(document.createElement("div"));
	resultat.classList.add("trou");
	resultat.style.left = left + "em";
	resultat.style.top = top + "em";
	return resultat;
}

/**
 * Rend visible (ou non) la face carte.
 * @param   {HTMLElement} carte L'élément HTML représentant la carte
 * @param   {boolean}     etat  L'état final de la carte. Par défaut, on inverse l'état actuel.
 * @returns {HTMLElement} La carte ainsi changée
 */
function retournerCarte(carte, etat) {
	if (etat === undefined) {
		carte.classList.toggle("ouverte");
	} else if (etat === false) {
		carte.classList.remove("ouverte");
	} else {
		carte.classList.add("ouverte");
	}
	return carte;
}

/**
 * Transfere la carte donnée vers une autre pile
 * @param {object}   carte   [[Description]]
 * @param {[[Type]]} pile    [[Description]]
 * @param {[[Type]]} left    [[Description]]
 * @param {[[Type]]} top     [[Description]]
 * @param {[[Type]]} tourner [[Description]]
 */
function transfererCarte(carte, pile) {
	carte.parentNode.removeChild(carte);
	carte.style.top = pile.children.length * pile.getAttribute("data-dY") + "em";
	carte.style.left = pile.children.length * pile.getAttribute("data-dX") + "em";
	pile.appendChild(carte);
	return carte;
}

function transfererPile(pile1, pile2, left, top) {
	var coords, deltaX, deltaY, fonction;
	debugger;
	coords = coordAbs(pile2);
	deltaX = coords.left;
	deltaY = coords.top;

	fonction = function () {
		unirPiles(pile1, pile2);
	};
	pile1.style.left = deltaX + left + "px";
	pile1.style.top = deltaY + top + "px";
	unirPiles(pile1, pile2);
	return;
}

function coordAbs(carte) {
	var left, top, ptr;
	left = 0;
	top = 0;
	ptr = carte;
	while (ptr.nodeName !== "BODY") {
		left += ptr.offsetLeft;
		top += ptr.offsetTop;
		ptr = ptr.parentNode;
	}
	return {
		left: left,
		top: top
	};
}

function positionAbsolue(carte) {
	var coords = coordAbs(carte);
	if (carte.style.marginLeft !== "") {
		carte.style.marginLeft = "0px";
	}
	if (carte.style.marginTop !== "") {
		carte.style.marginTop = "0px";
	}
	carte.style.left = coords.left + "px";
	carte.style.top = coords.top + "px";
	document.body.appendChild(carte.parentNode.removeChild(carte));
	return carte;
}

function coordRel(carte, pile) {
	var left, top, ptr;
	left = 0;
	top = 0;
	ptr = pile;
	while (ptr.nodeName !== "BODY") {
		left += ptr.offsetLeft;
		top += ptr.offsetTop;
		ptr = ptr.parentNode;
	}
	return {
		left: parseFloat(carte.style.left) - left,
		top: parseFloat(carte.style.top) - top
	};
}

function positionRelative(carte, pile) {
	var coords = coordRel(carte, pile);
	carte.style.left = coords.left + "px";
	carte.style.top = coords.top + "px";
	pile.appendChild(carte.parentNode.removeChild(carte));
	return carte;
}

function activation(carte, handler, actif) {
	if (carte) {
		if (actif === true) {
			carte.addEventListener(g.MOUSEDOWN, handler, true);
			carte.addEventListener(g.MOUSEUP, handler, true);
			carte.addEventListener(g.MOUSEMOVE, handler, true);
			carte.addEventListener(g.MOUSEOUT, handler, true);
		} else {
			carte.removeEventListener(g.MOUSEDOWN, handler, true);
			carte.removeEventListener(g.MOUSEUP, handler, true);
			carte.removeEventListener(g.MOUSEMOVE, handler, true);
			carte.removeEventListener(g.MOUSEOUT, handler, true);
		}
	}
}

function unirPiles(pile1, pile2) {
	var carte = pile1.firstChild;
	while (carte) {
		carte.style.marginLeft = pile2.decalage.left * pile2.childNodes.length + "px";
		carte.style.marginTop = pile2.decalage.top * pile2.childNodes.length + "px";
		pile2.appendChild(carte.parentNode.removeChild(carte));
		carte = pile1.firstChild;
	}
	pile1.parentNode.removeChild(pile1);
}

/**
 * Retourne l'indice de la valeur de la carte passée en paramètre.
 * @param   {string} carte La description de la carte. Ex: K7. Si carte n'est pas un string, on présume qu'il s'agit de l'objet HTML et récupère l'attribut data-carte.
 * @returns {number} L'indice de la valeur de la carte. Un nombre entre 0 et 12 en fonction de g.valeurs
 */
function getValeur(carte) {
	if (typeof carte !== "string") {
		carte = carte.getAttribute("data-carte");
	}
	return g.valeurs.indexOf(carte.charAt(1));
}

/**
 * Retourne l'indice de la sorte de la carte passée en paramètre.
 * @param   {string} carte La description de la carte. Ex: K7. Si carte n'est pas un string, on présume qu'il s'agit de l'objet HTML et récupère l'attribut data-carte.
 * @returns {number} L'indice de la valeur de la carte. Un nombre entre 0 et 3 en fonction de g.sortes
 */
function getSorte(carte) {
	if (typeof carte !== "string") {
		carte = carte.getAttribute("data-carte");
	}
	return g.sortes.indexOf(carte.charAt(0));
}

/**
 * Retourne la couleur de la carte passée en paramètre.
 * @param   {string} carte La description de la carte. Ex: K7. Si carte n'est pas un string, on présume qu'il s'agit de l'objet HTML et récupère l'attribut data-carte.
 * @returns {number} La couleur de la carte. 0 pour rouge et 1 pour noir.
 */
function getCouleur(carte) {
	return getSorte(carte) % 2;
}
window.addEventListener("load", main);
