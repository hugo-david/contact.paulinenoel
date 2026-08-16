# Besoin fonctionnel — formulaire de demande de devis

## Objectif

Proposer un parcours public en français qui permet à un prospect de qualifier son projet, d’obtenir une estimation indicative et d’envoyer une demande de devis à Pauline Noël.

L’application reprend le catalogue de prestations, les options et les règles d’estimation de [la maquette HTML de référence](./reference/formulaire-devis-reference.html).

## Catalogue de référence

Le parcours couvre les quatre familles suivantes et leurs branches conditionnelles.

### Identité & branding

- Formule refonte ;
- Formule mixte ;
- Formule création.

### Site internet · design UX/UI

- Site vitrine ;
- Site e-commerce ;
- Landing page ;
- Refonte de site ;
- Refonte de landing page ;
- nombre de pages quand il est pertinent ;
- option de wireframe pour les parcours concernés ;
- options d’intégration et de mise en ligne ;
- blog / actualités, événement, paiement en ligne, réservation / RDV, multilingue et espace membre.

### Supports de communication imprimés

- Flyer, affiche, plaquette / dépliant et carte de visite ;
- kakemono, bâche, covering total et covering partiel ;
- enseigne / panneaux, lettre en-tête et goodies.

### Supports de communication digitaux

- Signature e-mail ;
- bandeaux réseaux sociaux ;
- template de cinq posts réseaux sociaux ;
- newsletter ;
- présentation de cinq slides.

## Hors périmètre

- Aucun compte prospect, authentification ou espace administrateur.
- Aucun devis contractuel ou paiement en ligne.
- Aucun historique consultable depuis l’application.

## Parcours du prospect

1. Une introduction explique le principe de la demande.
2. Le prospect sélectionne une ou plusieurs familles de prestations : identité de marque, web, imprimé et digital.
3. Le parcours n’affiche que les étapes utiles aux familles choisies et recueille leurs options.
4. Le prospect indique son délai souhaité et son budget.
5. Un récapitulatif présente les choix et une estimation indicative, mise à jour selon les prestations sélectionnées.
6. Le prospect renseigne ses coordonnées et une description de son projet.
7. Après une soumission réussie, un écran de confirmation est affiché.

Le prospect peut revenir à une étape précédente sans perdre ses réponses. Le parcours est utilisable sur mobile comme sur desktop.

## Estimation

- L’estimation est affichée pendant le parcours et dans le récapitulatif.
- Elle est explicitement présentée comme indicative, donc non contractuelle.
- Elle est calculée à partir des prestations et options ; le budget sert uniquement à qualifier la demande. Le délai `express` applique une majoration fixe de 25 % ; les délais `flexible` et `normal` ne modifient pas le calcul.
- Les prestations sur mesure restent signalées comme telles plutôt que chiffrées artificiellement.
- Les tarifs sont maintenus dans une configuration technique ; aucune interface d’administration n’est prévue pour les modifier.

## Données de la demande

Champs requis : nom, e-mail valide et description du projet (« Un mot sur votre projet »).

Champs facultatifs : téléphone, entreprise et site web.

La demande comprend également toutes les sélections, son estimation, son délai et son budget indicatif.

Les sélections et l’estimation sont conservées telles qu’elles ont été présentées lors de la soumission ; une évolution ultérieure des tarifs ne modifie jamais une demande existante.

## Soumission et suivi

- La demande est enregistrée en base de données avant la notification e-mail.
- La base est une archive fiable des demandes, sans fonctionnalité de reporting métier.
- La base conserve aussi l’état de cette notification : à envoyer, envoyée ou échouée.
- Pauline reçoit un e-mail récapitulatif après l’enregistrement.
- La confirmation n’est affichée que lorsque l’envoi est accepté.
- En cas d’échec, le prospect voit un message explicite, ses réponses sont conservées et il peut réessayer.

## Confidentialité

- Le formulaire affiche une information de confidentialité et renvoie vers une politique dédiée.
- Les demandes sont conservées trois ans à compter du dernier contact avec le prospect, puis supprimées.
