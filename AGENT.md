# PostCare Plus Prior Authorization Review Assistant

## What this agent does

This is an internal Prior Authorization (PA) review assistant built for a fictional health
insurer, PostCare Plus. It is a Mastra agent with a custom three-column web frontend, backed
by a stubbed 12-drug specialty formulary and a persistent, Postgres-backed case-file store.

Given a case reference ID (or by browsing a case queue), the agent:
1. Pulls the full case file for that patient/prescription (never trusting a reviewer's
   paraphrase — it always fetches the record itself).
2. Looks up that drug's coverage criteria in the stubbed formulary (diagnosis requirements,
   step-therapy rules, quantity/age limits, renewal requirements) — its only source of
   coverage criteria; it never reasons from general/training knowledge about a drug.
3. Compares the case's diagnosis code, prior therapies tried, and dosing/quantity against
   those criteria, reasoning explicitly about which are met and which are not.
4. Proposes an approve/deny determination with a rationale citing the specific criteria used,
   and presents it to the reviewer for acceptance or override.

The agent never finalizes a case on its own. A case only closes — and the stubbed patient
notification only fires — when the human reviewer explicitly accepts or overrides the
proposed determination in the conversation. The agent never talks to prescribers, pharmacy
staff, or patients directly.

## Intended use case

The sole intended user is a PostCare Plus internal PA reviewer working their daily case
queue. It is a productivity/decision-support tool for that reviewer: it triages cases,
surfaces the relevant formulary criteria so the reviewer doesn't have to look them up
manually, and drafts a reasoned recommendation — but the reviewer retains full authority
over every determination and every patient notification. This is a demo/illustrative
project: the formulary data, case files, and patient notifications are all synthetic/stubbed
and are explicitly not derived from any real payer's actual PA criteria.
