# Import de questions par CSV

Fonctionnalité demandée au point client n°8 (30/06/2026). L'import se fait
depuis le dashboard admin, onglet **Questions / Quiz → Importer CSV**, ou via
l'API `POST /api/questions/import` (permission `write:questions`).

## Format du fichier

- Encodage **UTF-8** (le BOM Excel est toléré).
- Séparateur **`;`** (recommandé, défaut d'Excel français) ou **`,`** — détecté
  automatiquement sur la ligne d'en-tête.
- Les champs contenant le séparateur, des guillemets ou des retours à la ligne
  doivent être entourés de guillemets doubles (`"…"`), guillemets internes
  doublés (`""`) — c'est le comportement d'export par défaut d'Excel/LibreOffice.
- Première ligne = en-tête **obligatoire** :

```csv
categorie;niveau;question;optionA;optionB;optionC;optionD;bonneReponse;premium
```

## Colonnes

| Colonne | Obligatoire | Valeurs | Description |
|---|---|---|---|
| `categorie` | oui | slug (`bail-commercial`) ou nom exact (`Bail commercial`) | Type de bail — insensible à la casse |
| `niveau` | oui | `1` à `4` | 1 = Facile, 2 = Moyen, 3 = Difficile, 4 = Étude de cas |
| `question` | oui | texte | Énoncé de la question |
| `optionA`…`optionD` | oui | texte | Les 4 réponses proposées |
| `bonneReponse` | oui | `A`, `B`, `C` ou `D` | Insensible à la casse |
| `premium` | non | `oui`/`non` (aussi `true`/`1`/`x`) | Question réservée aux abonnés — défaut : `non` |

## Exemple

```csv
categorie;niveau;question;optionA;optionB;optionC;optionD;bonneReponse;premium
bail-commercial;1;Quelle est la durée minimale d'un bail commercial ?;9 ans;3 ans;6 ans;1 an;A;non
bail-professionnel;2;"Le bail professionnel s'applique aux activités…";libérales;commerciales;agricoles;artisanales;A;oui
```

## Comportement de l'import

- L'import **n'est pas tout-ou-rien** : chaque ligne valide crée une question
  (statut ACTIF, sans thème ni pack — à compléter ensuite dans l'admin si besoin),
  chaque ligne invalide est ignorée et rapportée avec son numéro de ligne et la
  raison (`{ imported, total, errors: [{ line, message }] }`).
- Un en-tête incomplet ou un fichier vide rejette tout l'import (HTTP 400).
- Taille maximale du fichier : ~2 Mo.
- Un modèle prêt à remplir est téléchargeable depuis le bouton d'import de
  l'admin.
