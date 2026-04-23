# Runtime / Consumer Separation — Work Log

**Date d'ouverture** : 2026-04-22
**Statut** : Level 1 terminé (éditorial), Level 2 partiellement exécuté (rename `turnlock` — 2026-04-23), reste en attente de validation

## Contexte

Une analyse de la codebase a révélé que ce repo contient **deux produits distincts** qui cohabitaient sans distinction claire :

- **Produit A — le runtime** (implémenté, quasi stable, aujourd'hui nommé **turnlock**) : un runtime générique d'exécution de machines à états durable. Le core ne connaît ni Claude Code, ni skills, ni agents — il émet des strings opaques sur stdout et fait confiance à un parent process pour interpréter et relancer.

- **Produit B — l'intégration Claude Code** (à l'état de spec) : l'ensemble des meta-skills, binaire CLI, hook, templates, conventions filesystem qui font de A un outil utile dans une session Claude Code. Consomme A comme dépendance.

Garder les deux fusionnés :
- empêche A d'être découvert par des consommateurs non-Claude,
- attache A au rythme d'évolution rapide de B (churns Claude Code),
- polluait le mental model des lecteurs qui voyaient "cc-orchestrator" et croyaient à un outil Claude-only (résolu par le rename `turnlock`, 2026-04-23).

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

### L2-1 · Renommer le tag protocole `@@CC_ORCH@@` → `@@TURNLOCK@@` + identifiants onomastiques associés — ✅ EXÉCUTÉ 2026-04-23

**Scope exécuté** :
- [x] `src/services/protocol.ts` (writer + parser, 5 occurrences) → `@@TURNLOCK@@`
- [x] Env var `CC_ORCH_TEST` → `TURNLOCK_TEST` dans `src/engine/context.ts`
- [x] `tests/services/protocol.test.ts`, `tests/helpers/protocol-asserts.ts`, `tests/helpers/mock-stdio.ts`
- [x] Fixtures de tests `tests/fixtures/protocol/*.txt`
- [x] Mentions dans les NIBs (`NIB-S-CCOR`, `NIB-M-PROTOCOL`, `NIB-M-BINDINGS`, `NIB-T-CCOR`)
- [x] Doc NX consolidé (renommé `NX-TURNLOCK.md`)
- [x] `constants.ts` : aucun identifiant encodant "CC_ORCH" confirmé.

**Impact** : changement de protocole (breaking). Pas d'impact externe (aucun consommateur publié). `PROTOCOL_VERSION` reste à `1` (dé-ornementation du tag, pas changement de sémantique). Bump package version `0.1.0` → `0.2.0`.

### L2-2 · Généraliser le chemin `RUN_DIR`

**Scope** :
- `src/services/run-dir.ts` — aujourd'hui hardcodé à `<cwd>/.claude/run/cc-orch/<orchestratorName>/<runId>/` (2 endroits).
- **Tests qui hardcodent le chemin** (à migrer en cohérence, sinon les tests cassent) :
  - `tests/bindings/skill-binding.test.ts:7`
  - `tests/bindings/agent-binding.test.ts:7`
  - `tests/bindings/agent-batch-binding.test.ts:8`
  - `tests/services/run-dir.test.ts` (10+ occurrences)
  - `tests/helpers/temp-run-dir.ts:25-27` (le helper qui fabrique les chemins temp)
- `.gitignore` contient `.claude/run/` (ligne 91) — à ajuster selon la nouvelle convention.
- NIBs qui décrivent la convention `RUN_DIR` (cf L2-4).

**Impact** : changement breaking pour quiconque se base sur ce chemin (aucun consommateur public aujourd'hui). Le chemin par défaut pourrait devenir `<cwd>/.orch-runs/<orchestratorName>/<runId>/` ou paramétrable via env var / config.

**Condition d'exécution** : réflexion sur la convention par défaut et le mécanisme de surcharge (env var `ORCH_RUN_DIR` ? Champ `OrchestratorConfig.runDirRoot` ?).

### L2-3 · Renommer le package npm + métadonnées associées — ✅ PARTIELLEMENT EXÉCUTÉ 2026-04-23

**Scope exécuté** :
- [x] `package.json` field `name` : `cc-orchestrator-runtime` → `turnlock`
- [x] `package.json` field `description` reformulée (neutre, sans mention Claude Code)
- [x] Nom du repo GitHub : repositionné sur `github.com/turnlock` (handle réservé, remote origin mis à jour)
- [x] Package npm `turnlock` (nom nu) réservé

**Reste ouvert** :
- [ ] `package.json` `license: "UNLICENSED"` + `private: true` — à trancher au moment de la première publication npm (MIT ? Apache-2 ?)
- [ ] Description du repo GitHub à aligner via `gh repo edit` ou UI

**Impact** :
- Pré-publication npm : exécuté côté package.
- Post-publication : N/A (premier publish sera sous `turnlock`).

### L2-4 · Mettre à jour les specs et docs de conception pour neutraliser "Claude Code" — ✅ PARTIELLEMENT EXÉCUTÉ 2026-04-23

**Scope exécuté (identifiants onomastiques cc-orchestrator-runtime / CCOR)** :
- [x] `NIB-S-CCOR.md` → `NIB-S-TURNLOCK.md`
- [x] `NIB-T-CCOR.md` → `NIB-T-TURNLOCK.md`
- [x] `docs/NX-CC-ORCHESTRATOR-RUNTIME.md` → `docs/NX-TURNLOCK.md` (fichier local gitignored, renommé pour cohérence)
- [x] Mentions `cc-orchestrator-runtime` remplacées dans les 15 `NIB-M-*.md` et autres docs
- [x] Cross-refs `NIB-S-CCOR §X` et `NIB-T-CCOR §X` mises à jour → `NIB-S-TURNLOCK §X` / `NIB-T-TURNLOCK §X`

**Reste ouvert (dé-claudification éditoriale profonde)** :
- [ ] Neutraliser les examples skills `senior-review`, `loop-clean`, `backlog-crush` dans les NIBs — garder avec note "exemple illustratif issu du consommateur Claude Code" ou renommer en `phase-foo` / `consumer-skill-x`
- [ ] Passe éditoriale sur `NIB-M-PROTOCOL.md`, `NIB-M-BINDINGS.md`, `NIB-S-TURNLOCK.md`, `NIB-T-TURNLOCK.md` pour reformuler les passages qui présupposent Claude Code
- [ ] `STACK_EVAL.yaml` : noter que `~/.claude/scripts` était le premier cas d'usage, pas un prérequis
- [ ] `PROJECT_INDEX.md` et `SPEC_MANIFEST.md` — régénérer via `/repo-indexer` après le rename

**Impact** : le rename d'identifiants est mécanique et fait. La dé-claudification profonde reste un chantier éditorial dédié (~1j).

### L2-5 · Extraction du produit B dans un repo séparé

**Scope** : créer `cc-orch-claude` (ou équivalent) comme repo git distinct qui dépend de A via npm. Y migrer :
- `docs/consumers/claude-code/` (toute la vision UX actuelle)
- **Tout le code B futur qui n'existe pas encore** :
  - Binaire CLI `cc-orch` (gap CRITICAL de [`consumers/claude-code/UX-VISION-AND-GAPS.md`](consumers/claude-code/UX-VISION-AND-GAPS.md) §9.3)
  - Meta-skills `cc-orch` et `orchestrator-author`
  - Hook `detect-approval.ts` (optionnel, §9.2)
  - Templates (`main.ts.hbs`, `skill.md.hbs`)
  - Convention filesystem `~/.cc-orch/adhoc/`, `~/.claude/scripts/`

**Important** : aucun code B n'existe aujourd'hui. L'extraction consiste essentiellement à **créer un repo vide avec la structure cible** + y déposer `docs/consumers/claude-code/`. Le timing est donc **optimal** — plus on attend, plus du code s'accumule dans A qui devrait être dans B.

**Impact** : sépare physiquement les deux produits. A devient publishable seul. Les deux ont des lifecycles indépendants. C'est **le vrai objectif** de la séparation — L2-1 à L2-4 préparent le terrain, L2-5 le matérialise.

**Condition d'exécution** :
- Décision sur le nom du repo B (`cc-orch-claude` ? `cc-orch` ? autre ?)
- Décision sur l'org GitHub / owner
- Décision sur la stratégie de publication npm pour B (publier ? garder privé ? publier seulement le runtime A ?)
- Décision sur la licence de B (peut différer de A)

### L2-6 · Décision sur le vocabulaire des bindings (`skill` / `agent` / `agent-batch`)

**Constat** : l'API publique du runtime utilise un vocabulaire **onomastiquement Claude** pour classifier les délégations :

- **Types** : `SkillDelegationRequest`, `AgentDelegationRequest`, `AgentBatchDelegationRequest` (`src/types/delegation.ts`)
- **Tags** : `kind: "skill" | "agent" | "agent-batch"` (7+ endroits : `types/delegation`, `types/events`, `bindings/types`, `state-io`, `protocol`, `engine/context`, `engine/shared`)
- **Bindings** : `skillBinding`, `agentBinding`, `agentBatchBinding` (`src/bindings/`)
- **Méthodes de `PhaseIO`** : `delegateSkill`, `delegateAgent`, `delegateAgentBatch` (`src/types/phase.ts`)

Ce vocabulaire est **plus qu'un nommage cosmétique** — il encode dans la sémantique publique l'hypothèse que le consommateur parle en "skills" et "agents", ce qui est **vrai pour Claude Code**, **faux pour un autre consommateur** (un runner CI n'a pas de "skills", un REPL n'a pas d'"agents").

**Décision à trancher** :

| Option | ✅ Avantage | ❌ Inconvénient |
|---|---|---|
| **A : Garder le vocabulaire** avec note "convention portable" | Aucun breaking change API/protocole/specs. Un parent non-Claude peut simplement mapper `skill → commande shell`, `agent → worker`, `agent-batch → pool`. | Onomastique Claude dans la surface publique — perception "c'est pour Claude". |
| **B : Neutraliser** en `kind: "sync" \| "async" \| "parallel"` (ou `"task" \| "subtask" \| "batch"`) | API et specs vraiment neutres. Cohérent avec la position "runtime générique". | Breaking change majeur : protocole, types publics, méthodes de `PhaseIO`, bindings, tests, NIBs. ~1-2j de travail. |

**Recommandation softe** : Option A avec documentation explicite ("`skill` est un label générique — toute tâche synchrone à résultat unique" etc.). Option B deviendra intéressante si/quand un second consommateur émerge et qu'on découvre qu'un mapping 1-1 vers son vocabulaire est tordu.

**Condition d'exécution** : décision explicite à prendre avant L2-5 (l'extraction). Si l'option B est retenue, la faire **avant** ou **pendant** L2-4 pour éviter deux chantiers éditoriaux.

---

## Pourquoi Level 1 avant Level 2

Level 1 est **sans risque** : pas de changement de protocole, pas de rupture de specs, pas de migration externe. Il **clarifie la pensée** (A vs B bien identifiés dans l'arborescence docs) et **prépare le terrain** pour les décisions Level 2.

Level 2 bouge des contrats (protocole, chemins, noms de package). Chaque item mérite une délibération ciblée, car les décisions sont **difficiles à revenir** une fois publiées externement.

## Référence — message de synthèse original

Ce chantier a été ouvert suite à une conversation où il est devenu clair que le nom "cc-orchestrator-runtime" et le cadrage "lib d'infrastructure pour Claude Code" sous-décrivaient la nature réelle de l'artefact : **un runtime générique de FSM durable, dont Claude Code est le premier consommateur parmi d'autres possibles**. Rename exécuté le 2026-04-23 : le runtime s'appelle désormais **turnlock** — les trois lectures (tour agentique, transition atomique, O_EXCL lock single-writer) convergent toutes sur ce que fait le produit.
