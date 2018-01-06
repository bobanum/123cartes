/*jslint browser:true, forin:true*/
/*globals g, coordAbs, positionAbsolue, placerJeu, placerTrous, distribuer3cartes, deplacerColonne, afficherJouables, transition2, masquerJouables, replacerDefausse, deplacerDefausse, trouverPossibilites, afficherPossibilites, calculerDistance, masquerPossibilites, grouperColonne, retourner*/
/*globals nouveauPaquet,brasser,placerPile,transfererCarte,transfererPile,activation,getValeur,getSorte,getCouleur*/
/*exported placerJeu, distribuer3cartes, replacerDefausse, placerTrous, deplacerDefausse, deplacerColonne, trouverPossibilites, afficherPossibilites, masquerPossibilites, afficherJouables, masquerJouables, calculerDistance, grouperColonne*/
//'use strict';

function klondike_main() {
	g.paquet = brasser(nouveauPaquet());
	g.talon = null;
	g.defausse = null;
	g.maisons = [];
	g.colonnes = [];
	g.pref.distanceColonne = (15/8);
	g.pref.distanceDefausse = (10/8);
	placerJeu();
	return;
}

function placerJeu() {
	var delai, cartes, i, j, tourner, carte;
	placerTrous();
	g.talon = placerPile("talon", g.paquet, (5/8), (5/8), {
		left: 0,
		top: 0
	});
	g.talon.addEventListener(g.MOUSEDOWN, distribuer3cartes, false);
	g.defausse = placerPile("defausse", [], (50/8), (5/8), {
		left: (20),
		top: 0
	});
	for (i = 0; i < 4; i += 1) {
		g.maisons.push(placerPile("maison" + i, [], i * (45/8) + (140/8), 5/8, {
			left: 0,
			top: 0
		}));
	}
	for (i = 0; i < 7; i += 1) {
		g.colonnes.push(placerPile("colonne" + i, [], i * (45/8) + (5/8), 67/8, {
			left: 0,
			top: 30
		}));
	}
	delai = 0;

	cartes = [];
	for (i = 0; i < 7; i += 1) {
		for (j = i; j < 7; j += 1) {
			tourner = (i === j);
			if (tourner) {
				activation(g.talon.lastChild, deplacerColonne, true);
			}
			carte = transfererCarte(positionAbsolue(g.talon.lastChild), g.colonnes[j], i * g.colonnes[j].decalage.left, i * g.colonnes[j].decalage.top, tourner, 200, delai);
			cartes.push(carte);
			delai += 100;
		}
	}
	transition2(cartes, function () {
		afficherJouables();
	});
	return;
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
				carte2 = transfererCarte(positionAbsolue(carte), g.defausse, i * g.defausse.decalage.left, i * g.defausse.decalage.top, true, 100, i * 100);
				cartes.push(carte2);
			}
		}
		transition2(cartes, function () {
			afficherJouables();
		});
		activation(carte, deplacerDefausse, true);
	} else {
		replacerDefausse();
		cartes = [];
		while (g.defausse.lastChild) {
			carte = transfererCarte(positionAbsolue(g.defausse.lastChild), g.talon, 0, 0, true, 0);
			cartes.push(carte);
		}
		transition2(cartes, function () {
			afficherJouables();
		});
	}
}

function replacerDefausse() {
	var c;
	if (g.defausse.lastChild) {
		activation(g.defausse.lastChild, deplacerDefausse, false);
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
	trou = document.body.appendChild(document.createElement("div"));
	trou.className = "carte trou";
	trou.style.left = 5/8 + "em";
	trou.style.top = 5/8 + "em";
	for (i = 0; i < 4; i += 1) {
		trou = document.body.appendChild(document.createElement("div"));
		trou.className = "carte trou";
		trou.style.left = (i * (45/8) + (140/8)) + "em";
		trou.style.top = 5/8 + "em";
	}
	for (i = 0; i < 7; i += 1) {
		trou = document.body.appendChild(document.createElement("div"));
		trou.className = "carte trou";
		trou.style.left = (i * (45/8) + (5/8)) + "em";
		trou.style.top = 67/8 + "em";
	}
}

function deplacerDefausse(e) {
	var carte, touche, poss, marginTop, marginLeft;
	carte = e.target;
	e.preventDefault();
	if (g.iPod) {
		touche = e.touches[0];
	} else {
		touche = e;
	}
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
			carte = transfererCarte(carte, poss, marginLeft, marginTop, false, 200);
			activation(carte, deplacerDefausse, false);
			activation(carte, deplacerColonne, true);
			activation(g.defausse.lastChild, deplacerDefausse, true);
		} else {
			carte = transfererCarte(carte, carte.deplacement.parent, carte.deplacement.marginLeft, carte.deplacement.marginTop, false, 200);
			activation(carte, deplacerColonne, false);
		}
		transition2(carte, function () {
			afficherJouables();
		});
		masquerPossibilites(carte.deplacement.possibilites);
		delete carte.deplacement;
	}
}

function deplacerColonne(e) {
	var carte, touche, coords, pile, poss, marginTop, marginLeft;
	carte = e.target;
	e.preventDefault();
	if (g.iPod) {
		touche = e.touches[0];
	} else {
		touche = e;
	}
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

			pile = transfererPile(carte.parentNode, poss, marginLeft, marginTop, 200);
			if (carte.deplacement.parent.lastChild) {
				if (carte.deplacement.parent.lastChild.className === "carte") {
					retourner(carte.deplacement.parent.lastChild);
					activation(carte.deplacement.parent.lastChild, deplacerColonne, true);
				}
			}
		} else { // On la retourne au point de depart
			pile = transfererPile(carte.parentNode, carte.deplacement.parent, carte.deplacement.marginLeft, carte.deplacement.marginTop, false, 200);
		}
		transition2(pile, function () {
			afficherJouables();
		});
		masquerPossibilites(carte.deplacement.possibilites);
		delete carte.deplacement;
		return;
	}
}

function trouverPossibilites(carte) {
	var sorte, valeur, couleur, resultat, i, maison, colonne;
	sorte = getSorte(carte);
	valeur = getValeur(carte);
	couleur = getCouleur(carte);
	resultat = {
		maisons: [],
		colonnes: []
	};
	if (!carte.nextSibling) {
		for (i = 0; i < g.maisons.length; i += 1) {
			maison = g.maisons[i];
			if (maison.lastChild) {
				if (sorte === getSorte(maison.lastChild) && valeur === getValeur(maison.lastChild) + 1) {
					resultat.maisons.push(maison);
				}
			} else {
				if (carte.carte[1] === "1") {
					resultat.maisons.push(maison);
				}
			}
		}
	}
	for (i = 0; i < g.colonnes.length; i += 1) {
		colonne = g.colonnes[i];
		if (colonne.lastChild) {
			if (colonne.lastChild.className === "carte ouverte" && couleur !== getCouleur(colonne.lastChild) && valeur === getValeur(colonne.lastChild) - 1) {
				resultat.colonnes.push(colonne);
			}
		} else {
			if (carte.carte[1] === "R") {
				resultat.colonnes.push(colonne);
			}
		}
	}
	return resultat;
}

function estJouable(carte) {
	var valeur, sorte, couleur, i, maison, colonne;
	valeur = getValeur(carte);
	sorte = getSorte(carte);
	couleur = getCouleur(carte);
	if (!carte.nextSibling) {
		for (i = 0; i < g.maisons.length; i += 1) {
			maison = g.maisons[i];
			if (maison.lastChild) {
				if (sorte === getSorte(maison.lastChild) && valeur === getValeur(maison.lastChild) + 1) {
					return true;
				}
			} else {
				if (carte.carte[1] === "1") {
					return true;
				}
			}
		}
	}
	for (i = 0; i < g.colonnes.length; i += 1) {
		colonne = g.colonnes[i];
		if (colonne.id !== carte.parentNode.id) {
			if (colonne.lastChild) {
				if (colonne.lastChild.className === "carte ouverte" && couleur !== getCouleur(colonne.lastChild) && valeur === getValeur(colonne.lastChild) - 1) {
					return true;
				}
			} else {
				if (carte.carte[1] === "R") {
					return true;
				}
			}
		}
	}
	return false;
}

function afficherPossibilites(possibilites) {
	var j, i;
	for (j in possibilites) {
		for (i = 0; i < possibilites[j].length; i += 1) {
			if (possibilites[j][i].lastChild) {
				possibilites[j][i].lastChild.style.backgroundColor = "cyan";
			} else {
				possibilites[j][i].style.backgroundColor = "cyan";
			}
		}
	}
}

function masquerPossibilites(possibilites) {
	var j, i;
	for (j in possibilites) {
		for (i = 0; i < possibilites[j].length; i += 1) {
			if (possibilites[j][i].lastChild) {
				possibilites[j][i].lastChild.style.backgroundColor = "";
			} else {
				possibilites[j][i].style.backgroundColor = "";
			}
		}
	}
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
			carte = colonne.lastChild;
			while (carte && carte.className === "carte ouverte") {
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
		jouables[i].style.backgroundColor = "yellow";
	}
}

function masquerJouables() {
	var resultat, i, colonne, carte;
	resultat = [];
	if (g.defausse.lastChild) {
		g.defausse.lastChild.style.backgroundColor = "";
	}
	for (i = 0; i < g.colonnes.length; i += 1) {
		colonne = g.colonnes[i];
		if (colonne.lastChild) {
			carte = colonne.lastChild;
			while (carte && carte.className === "carte ouverte") {
				carte.style.backgroundColor = "";
				carte = carte.previousSibling;
			}
		}
	}
	return resultat;
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
