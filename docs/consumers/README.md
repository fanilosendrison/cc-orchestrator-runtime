# Consumer-layer documentation

Ce dossier contient la documentation des **consommateurs** du runtime, séparée de la documentation du runtime lui-même.

## Pourquoi cette séparation

Le runtime (code dans `src/`, specs dans `specs/NIB-*`) est un **runtime d'exécution durable de machines à états** (FSM persistantes avec suspension par exit + reprise par relancement). Il est **générique** — il ne connaît ni Claude Code, ni skills, ni agents, ni quoi que ce soit de spécifique à un hôte particulier. Le protocole stdout qu'il émet (`@@CC_ORCH@@`, tag historique) est consommé par **un parent process**, quel qu'il soit.

Un **consommateur** est un produit qui s'appuie sur ce runtime pour offrir un service métier à son propre public. L'intégration Claude Code est **le premier** consommateur — et le seul aujourd'hui — mais il pourrait y en avoir d'autres (CI runners, REPLs, autres systèmes d'agents).

Garder la documentation consommateur séparée évite :

- que les docs runtime ne s'encombrent de références à Claude Code
- que les évolutions rapides côté consommateur (UX, meta-skills, hooks) ne polluent le rythme de stabilisation du runtime
- que le runtime soit perçu, par erreur, comme couplé à son premier consommateur

## Sous-dossiers

| Dossier | Consommateur | Statut |
|---|---|---|
| [`claude-code/`](claude-code/) | Intégration Claude Code (binaire `cc-orch`, meta-skills, hook `UserPromptSubmit`, templates) | En design — voir `claude-code/UX-VISION-AND-GAPS.md` |

Futurs consommateurs potentiels (hors scope actuel) : GitHub Actions, shell scripts génériques, autres agents LLM.
