# Modèle métier des demandes de devis

## Agrégat central

Une **demande enregistrée** est l’unité autonome conservée en base. Elle représente une soumission précise, à un instant donné. Une même personne peut donc soumettre plusieurs demandes : elles ne sont ni fusionnées ni rattachées à un compte.

## Composition d’une demande enregistrée

```text
Demande enregistrée
├── Coordonnées de contact          1
├── Description du projet           1
├── Qualification de la demande     1
├── Sélection de prestations        1
├── Estimation enregistrée           1
└── État de notification             1
```

- Les **coordonnées de contact** portent le nom, l’e-mail et, si fournis, le téléphone, l’entreprise et le site web.
- La **description du projet** est le message libre requis.
- Le **délai souhaité** précise l’horizon du projet. Le délai `express` applique une majoration fixe de 20 % à l’estimation.
- La **sélection de prestations** conserve les choix, options et quantités effectués pendant le parcours.
- L’**estimation enregistrée** conserve les lignes, montants et total tels qu’ils étaient affichés au prospect.
- L’**état de notification** vaut `à envoyer`, `envoyée` ou `échouée`.

Chaque demande porte également sa date de création. Elle est supprimée trois ans après le dernier contact avec le prospect.

## Limites du modèle

- Le **prospect** n’est pas une entité conservée séparément : il n’existe ni compte ni fiche prospect.
- Le **catalogue de prestations** n’est pas une donnée historique à administrer : il reste une configuration technique utilisée pour les nouvelles demandes.
- La notification e-mail n’est pas une entité métier distincte ; son état appartient à la demande.
- La base sert d’archive fiable. Elle ne doit pas, dans cette première version, porter de tableaux de bord ou de reporting par prestation.

## Cycle de vie

1. Le prospect remplit son parcours et soumet sa demande.
2. La demande est enregistrée avec l’état `à envoyer`.
3. Une notification e-mail est tentée.
4. En cas de succès, l’état devient `envoyée` et le prospect voit la confirmation.
5. En cas d’échec, l’état devient `échouée` ; le prospect peut réessayer sans perdre ses réponses.
