/*jslint browser:true*/
/*globals coordAbs, positionAbsolue, positionRelative, unirPiles*/
/*exported g,nouveauPaquet,brasser,placerPile,transfererCarte,transfererPile,activation,unirPiles,getValeur,getSorte,getCouleur,positionAbsolue,positionRelative*/
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
	pile = document.body.appendChild(document.createElement("div"));
	pile.id = id;
	pile.className = "pile";
	pile.decalage = decalage || {
		left: 0,
		top: 0
	};
	pile.style.left = left + "em";
	pile.style.top = top + "em";
	for (i = 0; i < cartes.length; i += 1) {
		carte = pile.appendChild(document.createElement("div"));
		carte.className = "carte";
		carte.carte = cartes[i];
		carte.style.marginLeft = i * pile.decalage.left + "em";
		carte.style.marginTop = i * pile.decalage.top + "em";
		carte.style.backgroundPosition = (g.valeurs.indexOf(carte.carte[1]) * -5) + "em " + (g.sortes.indexOf(carte.carte[0]) * -7) + "em";
	}
	return pile;
}

function retourner(carte, etat) {
	if (etat === true) {
		carte.className = "carte ouverte";
	} else if (etat === false) {
		carte.className = "carte";
	} else {
		if (carte.className === "carte ouverte") {
			carte.className = "carte";
		} else {
			carte.className = "carte ouverte";
		}
	}
	return carte;
}

function transfererCarte(carte, pile, left, top, tourner) {
	var coords, deltaX, deltaY, fonction;

	coords = coordAbs(pile);
	deltaX = coords.left;
	deltaY = coords.top;
	positionAbsolue(carte);
	if (tourner) {
		fonction = function () {
			retourner(carte);
			positionRelative(carte, pile);
		};
	} else {
		fonction = function () {
			positionRelative(carte, pile);
		};
	}
	if (carte.style.marginLeft === "") {
		carte.style.marginLeft = "0em";
	}
	if (carte.style.marginTop === "") {
		carte.style.marginTop = "0em";
	}

	carte.style.left = deltaX + "em";
	carte.style.top = deltaY + "em";
	carte.style.marginLeft = left + "em";
	carte.style.marginTop = top + "em";
	positionRelative(carte, pile);
	if (tourner) {
		retourner(carte);
	}
	return;
}

function transfererPile(pile1, pile2, left, top) {
	var coords, deltaX, deltaY, fonction;
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

function getValeur(carte) {
	return g.valeurs.indexOf(carte.carte[1]);
}

function getSorte(carte) {
	return g.sortes.indexOf(carte.carte[0]);
}

function getCouleur(carte) {
	return getSorte(carte) % 2;
}
window.addEventListener("load", main);
