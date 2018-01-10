/*jslint browser:true*/
/*globals coordAbs, positionAbsolue, positionRelative, unirPiles*/
/*exported g,distance,nouveauPaquet,brasser,placerPile,transfererCarte,transfererPile,unirPiles,getValeur,getSorte,getCouleur,positionAbsolue,positionRelative,retournerCarte,empiler, dessusPile,coordonnees,coordonneesCentre*/
//'use strict';
var g = {};

/**
 * Initialisation des variables globales. Est exécuré lors du "load" de la page.
 */
function main() {
	g.sortes = "CTKP";
	g.valeurs = "1234567890VDR";
	g.pref = {};
	g.MOUSEDOWN = 'mousedown';
	g.MOUSEUP = 'mouseup';
	g.MOUSEMOVE = 'mousemove';
	g.MOUSEOUT = 'mouseout';
}

/**
 * Retourne un nouveau paquet de cartes en fonction des variables globales. Les cartes sont les désignations sous forme de chaine.
 * @returns {[string]} Le tableau
 */
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

/**
 * Retourne un tableau mélangé
 * @param   {Array} paquet Le tableau à mélanger
 * @returns {Array} une copie du tableau
 */
function brasser(paquet) {
	var resultat, copie, carte, pos;
	copie = paquet.slice();
//	autre version :
//	copie.sort( function () { return Math.random() < 0.5; });
//	return copie;
	resultat = [];
	while (copie.length > 0) {
		pos = Math.floor(Math.random() * copie.length);
		carte = copie[pos];
		copie.splice(pos, 1);
		resultat.push(carte);
	}
	return resultat;
}

/**
 * Place une nouvelle pile sur le jeu. N'est exécutée qu'une seule fois.
 * @param   {string}      id           Le id à donner à la pile
 * @param   {array}       cartes       Les cartes à mettre dans la pile
 * @param   {number}      left         La position en x du coin supérieur gauche de la pile
 * @param   {number}      top          La position en y du coin supérieur gauche de la pile
 * @param   {object}      [decalage={] Le décalage à appliquer aux éléments de la pile
 * @returns {HTMLElement} Un élément div.pile#id
 */
function placerPile(id, cartes, left, top, decalage) {
	var pile, i, carte;
	decalage = decalage || {
		left: 0,
		top: 0
	};
	pile = html_pile(decalage.left, decalage.top);
	pile.setAttribute("id", id);
	g.plateau.appendChild(pile);
	pile.style.left = left + "em";
	pile.style.top = top + "em";
	for (i = 0; i < cartes.length; i += 1) {
		carte = html_carte(cartes[i]);
		pile.appendChild(carte);
	}
	return pile;
}
/**
 * Retourne un élément html représentant une pile vide.
 * @param   {string}      id     Le id à donner à la pile
 * @returns {HTMLElement} Un élément div.pile#id
 */
function html_pile() {
	var resultat;
	resultat = document.createElement("div");
	resultat.classList.add("pile");
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
 * Rend visible (ou non) la face carte.
 * @param   {HTMLElement} carte L'élément HTML représentant la carte
 * @param   {boolean}     etat  L'état final de la carte. Par défaut, on inverse l'état actuel.
 * @returns {HTMLElement} La carte ainsi changée
 */
function retournerCarte(carte, etat) {
	carte = carte.closest(".pile");
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
 * @param   {HTMLElement} carte La carte à transferer
 * @param   {HTMLElement} pile  La pile sur laquelle mettre la carte
 * @returns {HTMLElement} La carte originale
 * @todo RÉVISER
 */
function empiler(destination, pile) {
	destination = destination.closest(".pile");
	if (pile.parentNode) {
		pile.parentNode.removeChild(pile);
	}
	destination.appendChild(pile);
	return destination;
}

function dessusPile(pile) {
	var resultat;
	resultat = pile.querySelector(".carte:only-child");
	if (resultat === null) {
		return pile;
	}
	return resultat.closest(".pile");
}

/**
 * Transfere la carte donnée vers une autre pile
 * @param   {HTMLElement} carte La carte à transferer
 * @param   {HTMLElement} pile  La pile sur laquelle mettre la carte
 * @returns {HTMLElement} La carte originale
 */
function transfererCarte(carte, pile) {
	carte.parentNode.removeChild(carte);
	pile.appendChild(carte);
	return carte;
}

/**
 * Déplace une pile sur une autre pile
 * @param {HTMLElement} pile1 [[Description]]
 * @param {HTMLElement} pile2 [[Description]]
 * @param {number}      left  La position en x de la pile1 dans la pile 2
 * @param {number}      top   La position en y de la pile1 dans la pile 2
 */
function transfererPile(pile1, pile2) {
	if (pile1.parentNode) {
		pile1.parentNode.removeChild(pile1);
	}
	pile2.appendChild(pile1);
	return pile1;
}
function coordonnees(element, ref) {
	if (ref === undefined) {
		ref = document.body;
	}
	var resultat = {x: 0, y: 0};
	while (element !== ref && element !== document.body) {
		resultat.x += element.offsetLeft;
		resultat.y += element.offsetTop;
		element = element.parentNode;
	}
	return resultat;
}
function coordonneesCentre(element, ref) {
	if (ref === undefined) {
		ref = document.body;
	}
	var resultat = coordonnees(element, ref);
	resultat.x += element.offsetWidth / 2;
	resultat.y += element.offsetHeight / 2;
	return resultat;
}
function distance(p1, p2) {
	var dx, dy;
	dx = p1.x - p2.x;
	dy = p1.y - p2.y;
	return Math.sqrt(dx*dx + dy*dy);
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
	g.plateau.appendChild(carte.parentNode.removeChild(carte));
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
 * Retourne la désignation de la carte passée en paramètre.
 * @param   {string|HTMLElement} carte La carte. Si carte est un string, on le retourne. Sinon, on le récupère de la pile ou de la carte.
 * @returns {string}             L'indice de la valeur de la carte. Un nombre entre 0 et 12 en fonction de g.valeurs
 */
function getDesignation(carte) {
	if (typeof carte === "string") {
		return carte;
	} else if (carte.firstChild !== null) {
		return getDesignation(carte.firstChild);
	} else if (carte.hasAttribute("data-carte")) {
		return carte.getAttribute("data-carte");
	}
}

/**
 * Retourne l'indice de la sorte de la carte passée en paramètre.
 * @todo Réviser
 * @param   {string|HTMLElement} carte La carte. @see getDesignation.
 * @returns {number} L'indice de la valeur de la carte. Un nombre entre 0 et 3 en fonction de g.sortes
 */
function getSorte(carte) {
	var designation = getDesignation(carte);
	return g.sortes.indexOf(designation.charAt(0));
}

/**
 * Retourne l'indice de la valeur de la carte passée en paramètre.
 * @param   {string|HTMLElement} carte La carte. @see getDesignation.
 * @returns {number} L'indice de la valeur de la carte. Un nombre entre 0 et 12 en fonction de g.valeurs
 */
function getValeur(carte) {
	var designation = getDesignation(carte);
	return g.valeurs.indexOf(designation.charAt(1));
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
