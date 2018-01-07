/*jslint browser:true*/
/*globals g, coordAbs, positionAbsolue, unirPiles, placerJeu, placerTrous, placerBoutons, distribuer10cartes, deplacerColonne, transition2, afficherJouables, masquerJouables, evtRecommencer, evtNllePartie, evtUndo, trouverPossibilites, grouperColonne, afficherPossibilites, trouverTouche, calculerDistance, retourner, masquerPossibilites, estDeplacable, confirm*/
/*globals nouveauPaquet,brasser,placerPile,transfererCarte,transfererPile,activation,unirPiles,getValeur,getSorte,getCouleur*/
/*exported distribuer10cartes, placerTrous, placerBoutons, trouverPossibilites, estDeplacable, afficherPossibilites, masquerPossibilites, calculerDistance, trouverTouche, evtUndo, evtRecommencer, evtNllePartie*/
//'use strict';

function spider_main() {
	g.paquet = brasser(nouveauPaquet().concat(nouveauPaquet()));
	g.talon = null;
	g.maisons = [];
	g.colonnes = [];
	g.undo = [];
	g.pref.afficherPossibilites = false;
	g.pref.animTalon = 0;
	g.pref.animColonne = 0;
	placerJeu(g.paquet);
}

function placerJeu(paquet) {
	var i, delai, cartes, j, tourner, carte;
	g.maisons = [];
	g.colonnes = [];
	g.undo = [];
	placerTrous();
	placerBoutons(7, 1);
	g.talon = placerPile("talon", paquet, 1, 1, {
		left: 0,
		top: 0
	});
	g.talon.addEventListener(g.MOUSEDOWN, distribuer10cartes, false); //***
	for (i = 0; i < 8; i += 1) {
		g.maisons.push(placerPile("maison" + i, [], i * 2 + 21, 1, {
			left: 0,
			top: 0
		}));
	}
	for (i = 0; i < 10; i += 1) {
		g.colonnes.push(placerPile("colonne" + i, [], i * 6 + 1, 9, {
			left: 0,
			top: 1
		}));
	}
	delai = 0;

	cartes = [];
	for (i = 0; i < 6; i += 1) {
		for (j = 0; j < 10; j += 1) {
			tourner = ((j >= 4 && i === 4) || (j < 4 && i === 5));
			if (tourner) {
				activation(g.talon.lastChild, deplacerColonne, true);
			}
			carte = transfererCarte(positionAbsolue(g.talon.lastChild), g.colonnes[j], i * g.colonnes[j].decalage.left, i * g.colonnes[j].decalage.top, tourner, g.pref.animTalon, delai);
			cartes.push(carte);
			delai += 100;
			if (j >= 3 && i === 5) {
				break;
			}
		}
	}
	//tourner les premières cartes
	transition2(cartes, function () {
		afficherJouables();
	});
	return;
}

function viderEcran() {
	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild);
	}
}

function distribuer10cartes() {
	var i, colonne, cartes, carte, carte2;
	masquerJouables();
	if (g.talon.lastChild) {
		g.undo.push({
			type: 'distribuer'
		});
		cartes = [];
		for (i = 0; i < 10; i += 1) {
			if (g.talon.lastChild) {
				colonne = g.colonnes[i];
				carte = g.talon.lastChild;
				activation(carte, deplacerColonne, true);
				carte2 = transfererCarte(positionAbsolue(carte), colonne, colonne.decalage.left * colonne.childNodes.length, colonne.decalage.top * colonne.childNodes.length, true, g.pref.animTalon, i * 100);
				cartes.push(carte2);
			}
		}
		transition2(cartes, function () {
			afficherJouables();
		});
	}
}

function placerTrous() {
	var i, trou;
	trou = document.body.appendChild(document.createElement("div"));
	trou.className = "carte trou";
	trou.style.left = 1 + "em";
	trou.style.top = 1 + "em";
	for (i = 0; i < 8; i += 1) {
		trou = document.body.appendChild(document.createElement("div"));
		trou.className = "carte trou";
		trou.style.left = (i * 6 + 13) + "em";
		trou.style.top = 1 + "em";
	}
	for (i = 0; i < 7; i += 1) {
		trou = document.body.appendChild(document.createElement("div"));
		trou.className = "carte trou";
		trou.style.left = (i * 6 + 1) + "em";
		trou.style.top = 9 + "em";
	}
}

function placerBoutons(left, top) {
	var bouton;
	bouton = document.body.appendChild(document.createElement("div"));
	bouton.innerHTML = "&#x27F2;";
	bouton.className = "bouton";
	bouton.style.left = left + "em";
	bouton.style.top = top + 1 + "em";
	bouton.addEventListener('click', evtRecommencer, false); //***
	bouton = document.body.appendChild(document.createElement("div"));
	bouton.innerHTML = "&#x27f4;";
	bouton.className = "bouton";
	bouton.style.left = left + 3 + "em";
	bouton.style.top = top + 1 + "em";
	bouton.addEventListener('click', evtNllePartie, false); //***
	bouton = document.body.appendChild(document.createElement("div"));
	bouton.innerHTML = "&#x293e;";
	bouton.className = "bouton";
	bouton.style.left = left + "em";
	bouton.style.top = top + 4 + "em";
	bouton.style.width = 5 + "em";
	bouton.addEventListener('click', evtUndo, false); //***
	return;
}

function deplacerColonne(e) {
	var touche, carte, coords, poss, noPoss, tourne, marginTop, marginLeft, pile;
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
		carte.deplacement.possibilites = trouverPossibilites(carte);
		pile = grouperColonne(carte);
		if (g.pref.afficherPossibilites) {
			afficherPossibilites(carte.deplacement.possibilites);
		}
		return;
	} else if ((e.type === g.MOUSEMOVE || e.type === g.MOUSEOUT) && carte.deplacement) {
		carte.parentNode.style.left = touche.clientX - carte.deplacement.offsetX + "px";
		carte.parentNode.style.top = touche.clientY - carte.deplacement.offsetY + "px";
		return;
	} else if (e.type === g.MOUSEUP && carte.deplacement) {
		poss = null;
		touche = trouverTouche(carte, carte.deplacement.possibilites);
		if (touche.length) {
			poss = touche[calculerDistance(carte.parentNode, touche)];
		} else {
			for (noPoss = 0; noPoss < carte.deplacement.possibilites.length; noPoss += 1) {
				if (carte.deplacement.possibilites[noPoss].length) {
					poss = carte.deplacement.possibilites[noPoss][calculerDistance(carte.parentNode, carte.deplacement.possibilites[noPoss])];
					break;
				}
			}
		}
		if (poss) { // Si on peut placer la colonne qq part
			tourne = (carte.deplacement.parent.lastChild && carte.deplacement.parent.lastChild.className === "carte");
			g.undo.push({
				type: 'pile',
				objet: carte,
				origine: carte.deplacement.parent,
				tourne: tourne
			});
			marginTop = poss.childNodes.length * poss.decalage.top;
			marginLeft = poss.childNodes.length * poss.decalage.left;

			pile = transfererPile(carte.parentNode, poss, marginLeft, marginTop, g.pref.animColonne);
			if (carte.deplacement.parent.lastChild) {
				if (carte.deplacement.parent.lastChild.className === "carte") {
					retourner(carte.deplacement.parent.lastChild);
					activation(carte.deplacement.parent.lastChild, deplacerColonne, true);
				}
			}
		} else { // On la retourne au point de depart
			pile = transfererPile(carte.parentNode, carte.deplacement.parent, carte.deplacement.marginLeft, carte.deplacement.marginTop, g.pref.animColonne);
		}
		transition2(pile, function () {
			afficherJouables();
		});
		if (g.pref.afficherPossibilites) {
			masquerPossibilites(carte.deplacement.possibilites);
		}
		delete carte.deplacement;
		return;
	}
}

function trouverPossibilites(carte) { // += 1+
	var resultat, sorte, valeur, ptr, i, maison, colonne;
	resultat = [[], [], [], []];
	if (!estDeplacable(carte)) {
		return resultat;
	}
	sorte = getSorte(carte);
	valeur = getValeur(carte);
	if (valeur === 12) {
		ptr = carte;
		while (ptr.nextSibling) {
			ptr = ptr.nextSibling;
		}
		if (getValeur(ptr) === 0) {
			for (i = 0; i < g.maisons.length; i += 1) {
				maison = g.maisons[i];
				if (!maison.firstChild) {
					resultat[0].push(maison);
					break;
				}
			}
		}
	}
	for (i = 0; i < g.colonnes.length; i += 1) {
		colonne = g.colonnes[i];
		if (colonne.lastChild) {
			if (colonne.lastChild.className === "carte ouverte" && valeur === getValeur(colonne.lastChild) - 1 && sorte === getSorte(colonne.lastChild)) {
				resultat[1].push(colonne);
			} else if (colonne.lastChild.className === "carte ouverte" && valeur === getValeur(colonne.lastChild) - 1) {
				resultat[2].push(colonne);
			}
		} else {
			resultat[3].push(colonne);
		}
	}
	return resultat;
}

function estJouable(carte) { // += 1+
	var sorte, couleur, valeur, i, colonne;
	if (!estDeplacable(carte)) {
		return false;
	}
	sorte = getSorte(carte);
	couleur = getCouleur(carte);
	valeur = getValeur(carte);
	for (i = 0; i < g.colonnes.length; i += 1) {
		colonne = g.colonnes[i];
		if (colonne.id !== carte.parentNode.id) {
			if (colonne.lastChild) {
				if (colonne.lastChild.className === "carte ouverte" && valeur === getValeur(colonne.lastChild) - 1) {
					return true;
				}
			} else {
				return true;
			}
		}
	}
	return false;
}

function estDeplacable(carte) { // += 1+
	if (carte.className !== "carte ouverte") {
		return false;
	}
	if (carte.nextSibling && getSorte(carte) !== getSorte(carte.nextSibling)) {
		return false;
	}
	if (carte.nextSibling && getValeur(carte) !== getValeur(carte.nextSibling) + 1) {
		return false;
	}
	if (carte.nextSibling && !estDeplacable(carte.nextSibling)) {
		return false;
	}
	return true;
}

function afficherPossibilites(possibilites) {
	var i, j;
	for (j = 0; j < possibilites.length; j += 1) {
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
	var i, j;
	for (j = 0; j < possibilites.length; j += 1) {
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

function trouverTouche(carte, possibilites) {
	var poss, i, resultat, coords1, obj, coords2;
	poss = [];
	for (i = 0; i < possibilites.length; i += 1) {
		poss = poss.concat(possibilites[i]);
	}
	resultat = [];
	coords1 = coordAbs(carte);
	for (i = 0; i < poss.length; i += 1) {
		if (poss[i].lastChild) {
			obj = poss[i].lastChild;
		} else {
			obj = poss[i];
		}
		coords2 = coordAbs(obj);
		if (coords1.left <= coords2.left + obj.clientWidth && coords2.left <= coords1.left + obj.clientWidth && coords1.top <= coords2.top + obj.clientHeight && coords2.top <= coords1.top + obj.clientHeight) {
			resultat.push(poss[i]);
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

function evtUndo() {
	var undo, i, carte, pile;
	if (g.undo.length) {
		masquerJouables();
		undo = g.undo.splice(g.undo.length - 1, 1);
		undo = undo[0];
		if (undo.type === 'pile') {
			if (undo.tourne) {
				retourner(undo.origine.lastChild);
			}
			pile = grouperColonne(undo.objet);
			unirPiles(pile, undo.origine);
		} else if (undo.type === 'distribuer') {
			for (i = 9; i >= 0; i -= 1) {
				carte = g.colonnes[i].lastChild;
				retourner(carte);
				activation(carte, deplacerColonne, true);
				pile = grouperColonne(carte);
				unirPiles(pile, g.talon);
			}
		}
		afficherJouables();
	}
	return;
}

function evtRecommencer() {
	if (confirm('Recommencer la partie ?')) {
		viderEcran();
		placerJeu(g.paquet);
	}
}

function evtNllePartie() {
	if (confirm('Nouvelle la partie ?')) {
		g.paquet = brasser(nouveauPaquet().concat(nouveauPaquet()));
		viderEcran();
		placerJeu(g.paquet);
	}
}
window.addEventListener("load", spider_main);
