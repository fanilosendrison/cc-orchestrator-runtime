# Consumer-layer documentation

Ce dossier contient la documentation des **consommateurs** du runtime, séparée de la documentation du runtime lui-même.

## Pourquoi cette séparation

Le runtime (code dans `src/`, specs dans `specs/NIB-*`) orchestre une FSM TypeScript dont les phases sont **soit mécaniques (in-process)**, **soit agent-déléguées** (cf. README.md racine + NIB-S §1.2). Seules les phases agent-déléguées requièrent un host agent-capable — pour les phases mécaniques, le runtime n'a besoin de personne. Le runtime est **host-agnostique au niveau protocole** uniquement pour ce qui concerne les phases déléguées : il définit trois catégories canoniques de primitives agent-host (`kind: "skill" | "agent" | "agent-batch"`) qu'il sait demander via `@@TURNLOCK@@` sur stdout, mais il n'interprète **jamais** ce que ces primitives signifient concrètement — c'est le rôle du consommateur.

Un **consommateur** est l'intégration entre le runtime et un **host agent-capable** précis (Claude Code, Codex, Cursor, opencode, Aider, …). Il fournit :

1. Le **mapping** des trois `kind` vers les primitives concrètes du host (Claude Code `skill` → SKILL.md ; `agent` → Task tool ; etc.).
2. La **glue** qui lit les blocs `@@TURNLOCK@@`, exécute les primitives demandées, écrit les résultats dans `runDir/`, et relance le binaire avec `--resume`.
3. Les **conventions UX et tooling** spécifiques (binaires CLI, meta-skills, hooks, templates).

Garder la documentation consommateur séparée évite :

- que les docs runtime ne s'encombrent de références à un host particulier
- que les évolutions rapides côté consommateur (UX, meta-skills, hooks) ne polluent le rythme de stabilisation du runtime
- que le runtime soit perçu, par erreur, comme couplé à son premier consommateur

## Sous-dossiers

| Dossier | Consommateur (host) | Statut |
|---|---|---|
| [`claude-code/`](claude-code/) | Claude Code (binaire `cc-orch`, meta-skills, hook `UserPromptSubmit`, templates) | En design — voir `claude-code/UX-VISION-AND-GAPS.md` |

Hosts agent-capables potentiels (hors scope actuel, intégrations à écrire) : Codex, Cursor, opencode, Aider, scripts custom orchestrant des sessions LLM.

## Mapping `kind` → primitive host

Les trois `kind` du protocole `@@TURNLOCK@@` désignent des **catégories canoniques de primitives agent-host**. Cette table ne concerne **que les phases agent-déléguées** — les phases mécaniques s'exécutent in-process sans aller-retour avec le host. Chaque consommateur fournit son propre mapping concret :

| `kind` | Catégorie générique | Claude Code | Codex (futur) | Cursor (futur) | opencode (futur) | Aider (futur) |
|---|---|---|---|---|---|---|
| `skill` | Capacité nommée invokable du host avec args structurés | Skill (`~/.claude/skills/<name>/SKILL.md`) | TBD | TBD | TBD | TBD |
| `agent` | Délégation freeform à un sub-agent du host | Task tool (sub-agent ad hoc, prompt + agentType) | TBD | TBD | TBD | TBD |
| `agent-batch` | N délégations parallèles à des sub-agents | N Task tools en parallèle (un par job du batch) | TBD | TBD | TBD | TBD |

**Pourquoi ces trois catégories et pas d'autres** : ce sont les trois shapes de primitives qu'un script Node ne peut pas invoquer directement depuis le host (capacité nommée structurée, délégation freeform unitaire, délégation freeform parallèle). Elles couvrent les cas observés sur Claude Code et plausiblement transposables sur Codex/Cursor/opencode/Aider. Voir `docs/SEPARATION.md` L2-6 pour la délibération qui a clos ce vocabulaire.
