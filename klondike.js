/*jslint browser:true, forin:true*/
/*globals g, coordAbs, positionAbsolue, placerJeu, placerTrous, distribuer3cartes, evt_deplacerColonne, afficherJouables, masquerJouables, replacerDefausse, evt_deplacerDefausse, trouverPossibilites, afficherPossibilites, calculerDistance, masquerPossibilites, grouperColonne, retournerCarte, html_trou, html_pile, empiler*/
/*globals nouveauPaquet,brasser,placerPile,transfererCarte,transfererPile,getValeur,getSorte,getCouleur*/
/*exported placerJeu, distribuer3cartes, replacerDefausse, placerTrous, evt_deplacerDefausse, evt_deplacerColonne, trouverPossibilites, afficherPossibilites, masquerPossibilites, afficherJouables, masquerJouables, calculerDistance, grouperColonne*/
//'use strict';

function klondike_main() {
	g.paquet = brasser(nouveauPaquet());
	g.talon = null;
	g.defausse = null;
	g.maisons = [];
	g.colonnes = [];
	g.plateau = null;
	placerJeu();
	return;
}

function placerJeu() {
	var cartes, i, j, carte, maison, colonne;
	g.plateau = document.createElement("div");
	g.plateau.setAttribute("id", "plateau");
	document.body.appendChild(g.plateau);

	placerTrous();
	g.talon = placerPile("talon", g.paquet, 1, 1, {
		left: 0,
		top: 0
	});
	g.talon.addEventListener(g.MOUSEDOWN, distribuer3cartes, false);
	g.defausse = placerPile("defausse", [], 7, 1, {
		left: 1,
		top: 0
	});
	for (i = 0; i < 4; i += 1) {
		maison = html_maison(i);
		g.maisons.push(maison);
		g.plateau.appendChild(maison);
	}
	for (i = 0; i < 7; i += 1) {
		colonne = html_colonne(i);
		g.colonnes.push(colonne);
		g.plateau.appendChild(colonne);
	}

	cartes = [];
	for (i = 0; i < 7; i += 1) {
		for (j = i; j < 7; j += 1) {
			carte = g.talon.lastChild;
			transfererCarte(carte, g.colonnes[j]);
			cartes.push(carte);
		}
		retournerCarteColonne(g.colonnes[i]);
	}
	document.body.addEventListener("mousedown", dragstart);
	afficherJouables();
	return;
}
function html_maison(no) {
	var resultat;
	resultat = html_pile(0, 0);
	resultat.setAttribute("id", "maison" + no);
	resultat.classList.add("maison");
	resultat.style.left = (no * 6 + 19) + "em";
	resultat.style.top = 1 + "em";
	return resultat;
}
function html_colonne(no) {
	var resultat;
	resultat = html_pile(0, 1);
	resultat.setAttribute("id", "colonne" + no);
	resultat.classList.add("colonne");
	resultat.style.left = (no * 6 + 1) + "em";
	resultat.style.top = 9 + "em";
	return resultat;
}
function retournerCarteColonne(colonne) {
	var carte = colonne.lastChild;
	retournerCarte(carte);
	var pile = html_pile(0, 1);
	empiler(pile, carte);
	empiler(colonne, pile);
//	colonne.appendChild(pile);
	return;
}
function dragstart(e) {
	var pile, carte, origine, possibilites, pos;
	carte = e.target.closest(".ouverte");
	if (!carte) {
		return;
	}
	pile = carte.closest(".pile");
	if (pile.classList.contains("maison")) {
		return;
	}
	pile.classList.add("prise");
	masquerJouables();
	origine = pile.parentNode;
	possibilites = trouverPossibilites(carte);
	afficherPossibilites(possibilites);
	possibilites = possibilites.maisons.concat(possibilites.colonnes);
	pos = coordonnees(pile);
	document.body.appendChild(pile);
	pile.style.left = pos.x + "px";
	pile.style.top = pos.y + "px";
	pile.decalage = {x: e.offsetX, y: e.offsetY};
	console.log("c'est parti", e.type);
	function dragmove(e) {
		//console.log("déplacer la carte", e.type);
		pile.style.left = e.clientX - pile.decalage.x + "px";
		pile.style.top = e.clientY - pile.decalage.y + "px";
	}
	function drop(e) {
		var position = coordonneesCentre(pile);
		var choix = null;
		var distance = null;
		possibilites.forEach(function(p) {
			var c = coordonneesCentre(p);
			var dx = c.x - position.x;
			var dy = c.y - position.y;
			var d = Math.sqrt(dx*dx + dy*dy);
			if (distance === null || d < distance) {
				distance = d;
				choix = p;
			}
		});
		if (choix) {
			if (choix.classList.contains("maison")) {
				empiler(choix, pile.firstChild);
				pile.parentNode.removeChild(pile);
			} else {
				empiler(choix, pile);
			}
			var cartes = document.querySelectorAll(".colonne .carte:last-child:not(.ouverte)");
			for (var i = 0; i < cartes.length; i += 1) {
				retournerCarteColonne(cartes[i].closest(".colonne"));
			}
		} else {
			empiler(origine, pile);
		}
		pile.classList.remove("prise");

		console.log("Rendu ???", e.type);
		document.body.removeEventListener("mousemove", dragmove);
		document.body.removeEventListener("mouseleave", dragcancel);
		document.body.removeEventListener("mouseup", drop);
		afficherJouables();
		masquerPossibilites();
	}
	function dragcancel(e) {
		console.log("Fini!", e.type, e.eventPhase);
		empiler(origine, pile);
		pile.classList.remove("prise");
		afficherJouables();
		masquerPossibilites();
		document.body.removeEventListener("mousemove", dragmove);
		document.body.removeEventListener("mouseleave", dragcancel);
		document.body.removeEventListener("mouseup", drop);
	}
	document.body.addEventListener("mousemove", dragmove);
	document.body.addEventListener("mouseleave", dragcancel);
	document.body.addEventListener("mouseup", drop);
	document.body.addEventListener("mousedown", dragstart);
}
function distribuer3cartes() {
	var cartes, i, carte, carte2;
	masquerJouables();
	if (g.talon.lastChild) {
		replacerDefausse();
		cartes = [];
		for (i = 0; i < 3; i += 1) {
			if (g.talon.lastChild) {
				carte = g.talon.lastChild;
				carte2 = transfererCarte(positionAbsolue(carte), g.defausse, i * g.defausse.decalage.left, i * g.defausse.decalage.top, true);
				cartes.push(carte2);
			}
		}
		afficherJouables();
	} else {
		replacerDefausse();
		cartes = [];
		while (g.defausse.lastChild) {
			carte = transfererCarte(positionAbsolue(g.defausse.lastChild), g.talon, 0, 0, true);
			cartes.push(carte);
		}
		afficherJouables();
	}
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
function replacerDefausse() {
	var c;
	if (g.defausse.lastChild) {
		c = g.defausse.lastChild;
		c.style.marginLeft = c.style.marginTop = "0em";
		if (c.previousSibling) {
			c = c.previousSibling;
			c.style.marginLeft = c.style.marginTop = "0em";
		}
	}
}

function placerTrous() {
	var trou, i;
	trou = html_trou(1, 1);
	g.plateau.appendChild(trou);
	for (i = 0; i < 4; i += 1) {
		trou = html_trou(i * 6 + 19, 1);
		g.plateau.appendChild(trou);
	}
	for (i = 0; i < 7; i += 1) {
		trou = html_trou(i * 6 + 1, 9);
		g.plateau.appendChild(trou);
	}
}

function evt_deplacerDefausse(e) {
	var carte, touche, poss, marginTop, marginLeft;
	carte = e.target;
	e.preventDefault();
	touche = e;
	if (e.type === g.MOUSEDOWN && !carte.deplacement) {
		masquerJouables();
		carte.deplacement = {};
		carte.deplacement.parent = carte.parentNode;
		carte.deplacement.marginLeft = parseInt(carte.style.marginLeft, 10) || 0;
		carte.deplacement.marginTop = parseInt(carte.style.marginTop, 10) || 0;
		positionAbsolue(carte);
		carte.deplacement.offsetX = touche.clientX - parseFloat(carte.style.left);
		carte.deplacement.offsetY = touche.clientY - parseFloat(carte.style.top);
		carte.deplacement.possibilites = trouverPossibilites(carte);
		afficherPossibilites(carte.deplacement.possibilites);
	} else if ((e.type === g.MOUSEMOVE || e.type === g.MOUSEOUT) && carte.deplacement) {
		carte.style.left = touche.clientX - carte.deplacement.offsetX + "px";
		carte.style.top = touche.clientY - carte.deplacement.offsetY + "px";
	} else if (e.type === g.MOUSEUP && carte.deplacement) {
		poss = null;
		if (carte.deplacement.possibilites.maisons.length) {
			poss = carte.deplacement.possibilites.maisons[calculerDistance(carte.parentNode, carte.deplacement.possibilites.maisons)];
		} else if (carte.deplacement.possibilites.colonnes.length) {
			poss = carte.deplacement.possibilites.colonnes[calculerDistance(carte.parentNode, carte.deplacement.possibilites.colonnes)];
		}
		if (poss) {
			marginTop = poss.childNodes.length * poss.decalage.top;
			marginLeft = poss.childNodes.length * poss.decalage.left;
			carte = transfererCarte(carte, poss, marginLeft, marginTop, false);
		} else {
			carte = transfererCarte(carte, carte.deplacement.parent, carte.deplacement.marginLeft, carte.deplacement.marginTop, false);
		}
		afficherJouables();
		masquerPossibilites(carte.deplacement.possibilites);
		delete carte.deplacement;
	}
}

function evt_deplacerColonne(e) {
	var carte, touche, coords, pile, poss, marginTop, marginLeft;
	carte = e.target;
	console.log(carte, e.type);
	e.preventDefault();
	touche = e;
	if (e.type === g.MOUSEDOWN && !carte.deplacement) {
		masquerJouables();
		carte.deplacement = {};
		carte.deplacement.parent = carte.parentNode;
		carte.deplacement.marginLeft = parseInt(carte.style.marginLeft, 10) || 0;
		carte.deplacement.marginTop = parseInt(carte.style.marginTop, 10) || 0;
		coords = coordAbs(carte);
		carte.deplacement.offsetX = touche.clientX - coords.left;
		carte.deplacement.offsetY = touche.clientY - coords.top;
		pile = grouperColonne(carte);
		carte.deplacement.possibilites = trouverPossibilites(carte);
		afficherPossibilites(carte.deplacement.possibilites);
		return;
	} else if ((e.type === g.MOUSEMOVE || e.type === g.MOUSEOUT) && carte.deplacement) {
		carte.parentNode.style.left = touche.clientX - carte.deplacement.offsetX + "px";
		carte.parentNode.style.top = touche.clientY - carte.deplacement.offsetY + "px";
		return;
	} else if (e.type === g.MOUSEUP && carte.deplacement) {
		poss = null;
		if (carte.deplacement.possibilites.maisons.length) {
			poss = carte.deplacement.possibilites.maisons[calculerDistance(carte.parentNode, carte.deplacement.possibilites.maisons)];
		} else if (carte.deplacement.possibilites.colonnes.length) {
			poss = carte.deplacement.possibilites.colonnes[calculerDistance(carte.parentNode, carte.deplacement.possibilites.colonnes)];
		}
		if (poss) { // Si on peut placer la colonne qq part
			marginTop = poss.childNodes.length * poss.decalage.top;
			marginLeft = poss.childNodes.length * poss.decalage.left;

			pile = transfererPile(carte.parentNode, poss, marginLeft, marginTop);
			if (carte.deplacement.parent.lastChild) {
				if (carte.deplacement.parent.lastChild.classList.contains("carte")) {
					retournerCarte(carte.deplacement.parent.lastChild);
				}
			}
		} else { // On la retourne au point de depart
			pile = transfererPile(carte.parentNode, carte.deplacement.parent, carte.deplacement.marginLeft, carte.deplacement.marginTop, false);
		}
		afficherJouables();
		masquerPossibilites(carte.deplacement.possibilites);
		delete carte.deplacement;
		return;
	}
}

function trouverPossibilites(carte) {
	var resultat;
	resultat = {
		maisons: trouverPossibilitesMaison(carte),
		colonnes: trouverPossibilitesColonne(carte)
	};
	return resultat;
}

function trouverPossibilitesMaison(carte) {
	var sorte, valeur, resultat, i, dessus;
	sorte = getSorte(carte);
	valeur = getValeur(carte);
	resultat = [];

	if (carte.nextSibling) {
		return [];
	}
	if (valeur === 0) {
		var maisons = document.querySelectorAll(".maison:empty");
		for (i = 0; i < maisons.length; i += 1) {
			resultat.push(maisons[i]);
		}
		return resultat;
	}
	for (i = 0; i < g.maisons.length; i += 1) {
		dessus = g.maisons[i].lastChild;
		if (dessus) {
			if (sorte === getSorte(dessus) && valeur === getValeur(dessus) + 1) {
				resultat.push(g.maisons[i]);
			}
		}
	}
	return resultat;
}

function trouverPossibilitesColonne(carte) {
	var resultat, valeur, couleur, i;
	resultat = [];
	valeur = getValeur(carte);
	couleur = getCouleur(carte);
	if (valeur === 12) {
		var colonnes = document.querySelectorAll(".colonne:empty");
		for (i = 0; i < colonnes.length; i += 1) {
			resultat.push(colonnes[i]);
		}
		return resultat;
	}
	var cartes = document.querySelectorAll(".colonne .carte:only-child");
	for (i = 0; i < cartes.length; i += 1) {
		if (couleur !== getCouleur(cartes[i]) && valeur === getValeur(cartes[i]) - 1) {
			resultat.push(cartes[i]);
		}
	}
	return resultat;
}

function estJouable(carte) {
	if (estJouableMaison(carte)) {
		return true;
	}
	if (estJouableColonne(carte)) {
		return true;
	}
	return false;
}

function estJouableMaison(carte) {
	var valeur, sorte, couleur, i, dessus;
	valeur = getValeur(carte);
	sorte = getSorte(carte);
	couleur = getCouleur(carte);
	if (carte.nextSibling) {
		return false;
	}
	if (valeur === 0 && document.querySelector(".maison:empty")) {
		return true;
	}
	for (i = 0; i < g.maisons.length; i += 1) {
		dessus = g.maisons[i].lastChild;
		if (dessus) {
			if (sorte === getSorte(dessus) && valeur === getValeur(dessus) + 1) {
				return true;
			}
		}
	}
	return false;
}

function estJouableColonne(carte) {
	var valeur, couleur, i;
	valeur = getValeur(carte);
	couleur = getCouleur(carte);
	if (valeur === 12 && document.body.querySelector(".colonne:empty")) {
		return true;
	}
	var cartes = document.querySelectorAll(".colonne .carte:only-child");
	for (i = 0; i < cartes.length; i += 1) {
		if (couleur !== getCouleur(cartes[i]) && valeur === getValeur(cartes[i]) - 1) {
			return true;
		}
	}
	return false;
}

function afficherPossibilites(possibilites) {
	var j, i, element;
	for (j in possibilites) {
		for (i = 0; i < possibilites[j].length; i += 1) {
			if (possibilites[j][i].lastChild) {
				element = possibilites[j][i].lastChild;
			} else {
				element = possibilites[j][i];
			}
			element.classList.add("possibilite");
		}
	}
}

function masquerPossibilites() {
	var i, elements;
	elements = document.querySelectorAll(".possibilite");
	for (i = 0; i < elements.length; i += 1) {
		elements[i].classList.remove("possibilite");
	}
	return elements;
}

function trouverJouables() {
	var resultat, i, colonne, carte;
	resultat = [];
	if (g.defausse.lastChild && estJouable(g.defausse.lastChild)) {
		resultat.push(g.defausse.lastChild);
	}
	for (i = 0; i < g.colonnes.length; i += 1) {
		colonne = g.colonnes[i];
		if (colonne.lastChild) {
			carte = colonne.lastChild.firstChild;
			while (carte && carte.classList.contains("ouverte")) {
				if (estJouable(carte)) {
					resultat.push(carte);
				}
				carte = carte.previousSibling;
			}
		}
	}
	return resultat;
}

function afficherJouables(jouables) {
	var i;
	jouables = jouables || trouverJouables();
	for (i = 0; i < jouables.length; i += 1) {
		jouables[i].classList.add("jouable");
	}
}

function masquerJouables() {
	var i;
	var jouables = document.querySelectorAll(".jouable");
	for (i = 0; i < jouables.length; i += 1) {
		jouables[i].classList.remove("jouable");
	}
	return jouables;
}

function calculerDistance(carte, possibilites) {
	var resultat, coords1, distance, i, coords2, left, top, d;
	resultat = -1;
	coords1 = coordAbs(carte);
	distance = 99999999999999999999999;
	for (i = 0; i < possibilites.length; i += 1) {
		if (possibilites[i].lastChild) {
			coords2 = coordAbs(possibilites[i].lastChild);
		} else {
			coords2 = coordAbs(possibilites[i]);
		}
		left = coords1.left - coords2.left;
		top = coords1.top - coords2.top;
		d = Math.pow(left, 2) + Math.pow(top, 2);
		if (d < distance) {
			distance = d;
			resultat = i;
		}
	}
	return resultat;
}

function grouperColonne(carte) {
	var decalage, coords, pile, proc;
	decalage = parseInt(carte.style.marginTop, 10);
	coords = coordAbs(carte);
	pile = placerPile("transport", [], coords.left, coords.top);
	while (carte) {
		proc = carte.nextSibling;
		carte.style.marginTop = parseInt(carte.style.marginTop, 10) - decalage + "px";
		pile.appendChild(carte.parentNode.removeChild(carte));
		carte = proc;
	}
	return pile;
}
window.addEventListener("load", klondike_main);
