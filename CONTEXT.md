# Formulaire de demande de devis

Une application publique qui recueille les besoins d’un prospect, produit une estimation indicative et transmet sa demande, sans compte ni espace d’administration.

## Langage

**Demande de devis** :
Le parcours guidé par lequel un prospect décrit ses besoins et son délai avant de laisser ses coordonnées.
_Éviter_ : constructeur de formulaire, compte client

**Estimation indicative** :
Le montant calculé à partir des choix du prospect ; il informe sans constituer un devis contractuel.
_Éviter_ : prix définitif, devis signé

**Estimation enregistrée** :
L’estimation conservée avec une demande enregistrée, telle qu’elle a été présentée au prospect au moment de sa soumission.
_Éviter_ : recalcul de l’historique, tarif actuel

**Catalogue de prestations** :
L’ensemble des prestations d’identité de marque, web, imprimé et digital proposées dans le parcours, avec leurs options et règles d’estimation.
_Éviter_ : liste de produits, configurateur

**Parcours conditionnel** :
Le parcours qui ne présente au prospect que les étapes correspondant aux familles de prestations qu’il a sélectionnées.
_Éviter_ : formulaire fixe, questionnaire linéaire

**Sélection de prestations** :
L’ensemble des familles, prestations, options et quantités choisies dans une demande de devis.
_Éviter_ : commande, panier

**Qualification de la demande** :
Le délai souhaité renseigné par le prospect pour donner du contexte à Pauline.
_Éviter_ : validation commerciale

**Délai souhaité** :
L’horizon déclaré par le prospect pour son projet : flexible, normal ou express.
_Éviter_ : date de livraison garantie, engagement de délai

**Prospect** :
La personne ou l’organisation qui remplit une demande de devis.
_Éviter_ : utilisateur, client

**Description du projet** :
Le message libre par lequel le prospect donne le contexte, les objectifs ou les contraintes que le parcours ne couvre pas.
_Éviter_ : commentaire interne, note admin

**Coordonnées de contact** :
Les informations permettant à Pauline de recontacter le prospect : nom et e-mail sont requis ; téléphone, entreprise et site web sont facultatifs.
_Éviter_ : profil, compte

**Notification de demande** :
L’e-mail envoyé à Pauline après la soumission d’une demande de devis, contenant son récapitulatif et les coordonnées du prospect.
_Éviter_ : lead, alerte admin

**État de notification** :
Le statut de la dernière tentative de notification d’une demande enregistrée : à envoyer, envoyée ou échouée.
_Éviter_ : entité e-mail, historique de livraison

**Soumission** :
L’envoi réussi d’une demande de devis vers Pauline ; seule une soumission acceptée donne accès à la confirmation.
_Éviter_ : clic sur envoyer, brouillon

**Demande enregistrée** :
La trace durable, autonome et immuable d’une demande soumise ; une même personne peut avoir plusieurs demandes distinctes.
_Éviter_ : historique de navigation, compte client, fiche prospect

**Politique de confidentialité** :
La page qui explique au prospect l’usage de ses données de demande de devis et la manière d’exercer ses droits.
_Éviter_ : conditions générales, case de consentement
