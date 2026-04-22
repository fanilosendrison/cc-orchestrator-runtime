# Runtime / Consumer Separation — Work Log

**Date d'ouverture** : 2026-04-22
**Statut** : Level 1 terminé (éditorial), Level 2 en attente de validation

## Contexte

Une analyse de la codebase a révélé que ce repo contient **deux produits distincts** qui cohabitaient sans distinction claire :

- **Produit A — le runtime** (implémenté, quasi stable) : un runtime générique d'exécution de machines à états durable. Le core ne connaît ni Claude Code, ni skills, ni agents — il émet des strings opaques sur stdout et fait confiance à un parent process pour interpréter et relancer.

- **Produit B — l'intégration Claude Code** (à l'état de spec) : l'ensemble des meta-skills, binaire CLI, hook, templates, conventions filesystem qui font de A un outil utile dans une session Claude Code. Consomme A comme dépendance.

Garder les deux fusionnés :
- empêche A d'être découvert par des consommateurs non-Claude,
- attache A au rythme d'évolution rapide de B (churns Claude Code),
- pollue le mental model des lecteurs qui voient "cc-orchestrator" et croient à un outil Claude-only.

## Level 1 — Éditorial (terminé 2026-04-22)

Ajustements **locaux, réversibles, sans toucher au protocole ni aux specs** :

- [x] `docs/UX-VISION-AND-GAPS.md` → `docs/consumers/claude-code/UX-VISION-AND-GAPS.md` (c'est de la doc consommateur B, pas runtime A)
- [x] `.gitignore` mis à jour avec le nouveau chemin
- [x] `docs/consumers/README.md` créé — explique la séparation conceptuelle
- [x] `docs/consumers/claude-code/README.md` créé — cadre le scope de l'intégration Claude
- [x] `CLAUDE.md` projet repositionné : "runtime" (pas "lib d'infrastructure"), neutralité du cœur explicitée
- [x] `README.md` racine repositionné : durable FSM runtime avec Claude Code comme premier consommateur

## Level 2 — Dé-claudification en profondeur (à planifier)

Changements qui touchent le **contrat du runtime** et/ou les **specs autoritatives**. Chacun mérite une délibération dédiée avant exécution.

### L2-1 · Renommer le tag protocole `@@CC_ORCH@@` → `@@ORCH@@` (ou autre)

**Scope** :
- `src/services/protocol.ts` (writer + parser)
- `tests/services/protocol.test.ts`, `tests/helpers/protocol-asserts.ts`, `tests/helpers/mock-stdio.ts`
- ~40 mentions dans les NIBs (`NIB-S-CCOR`, `NIB-M-PROTOCOL`, `NIB-M-BINDINGS`, `NIB-T-CCOR`)
- Doc NX consolidé

**Impact** : changement de protocole (breaking). Pas d'impact externe aujourd'hui car aucun consommateur publié. Le `PROTOCOL_VERSION` reste à `1` (c'est une dé-ornementation du tag, pas un changement de sémantique).

**Nom à trancher** : `@@ORCH@@` (court, générique) vs `@@DFSM@@` (durable finite-state-machine, plus descriptif mais jargonneux) vs `@@PHASE@@` (centré sur le concept phase) vs autre.

**Condition d'exécution** : décision explicite du mainteneur sur le nom.

### L2-2 · Généraliser le chemin `RUN_DIR`

**Scope** : `src/services/run-dir.ts` — aujourd'hui hardcodé à `<cwd>/.claude/run/cc-orch/<orchestratorName>/<runId>/`.

**Impact** : changement breaking pour quiconque se base sur ce chemin (aucun consommateur public aujourd'hui). Le chemin par défaut pourrait devenir `<cwd>/.orch-runs/<orchestratorName>/<runId>/` ou paramétrable via env var / config.

**Condition d'exécution** : réflexion sur la convention par défaut et le mécanisme de surcharge (env var `ORCH_RUN_DIR` ? Champ `OrchestratorConfig.runDirRoot` ?).

### L2-3 · Renommer le package npm

**Scope** : `package.json` — `cc-orchestrator-runtime` → nom neutre (`durable-fsm-runtime` ? `phase-runtime` ? autre).

**Impact** :
- Pré-publication : trivial.
- Post-publication : nécessite deprecation du nom actuel + republication sous nouveau nom.

**Condition d'exécution** : décision produit + dispo du nom sur npm.

### L2-4 · Mettre à jour les NIBs pour neutraliser "Claude Code"

**Scope** : les 4 NIBs qui mentionnent Claude, skills, agents comme si c'était partie intégrante du runtime alors que ce sont des concepts **de consommateur**.

**Impact** : travail éditorial significatif (~30+ passages à reformuler). Les specs deviennent **vraiment** neutres, la couche consommateur est mentionnée comme une illustration, pas comme une hypothèse.

**Condition d'exécution** : slot dédié (0.5-1j de travail).

### L2-5 · Extraction du produit B dans un repo séparé

**Scope** : créer `cc-orch-claude` (ou équivalent) comme repo git distinct qui dépend de A via npm. Y migrer `docs/consumers/claude-code/` et tout le code B futur (binaire CLI, meta-skills, hook, templates).

**Impact** : sépare physiquement les deux produits. A devient publishable seul. Les deux ont des lifecycles indépendants. C'est le vrai objectif de la séparation.

**Condition d'exécution** :
- Décision sur le nom du repo B
- Décision sur l'org GitHub / owner
- Décision sur la stratégie de publication npm pour B

## Pourquoi Level 1 avant Level 2

Level 1 est **sans risque** : pas de changement de protocole, pas de rupture de specs, pas de migration externe. Il **clarifie la pensée** (A vs B bien identifiés dans l'arborescence docs) et **prépare le terrain** pour les décisions Level 2.

Level 2 bouge des contrats (protocole, chemins, noms de package). Chaque item mérite une délibération ciblée, car les décisions sont **difficiles à revenir** une fois publiées externement.

## Référence — message de synthèse original

Ce chantier a été ouvert suite à une conversation où il est devenu clair que le nom "cc-orchestrator-runtime" et le cadrage "lib d'infrastructure pour Claude Code" sous-décrivaient la nature réelle de l'artefact : **un runtime générique de FSM durable, dont Claude Code est le premier consommateur parmi d'autres possibles**.
