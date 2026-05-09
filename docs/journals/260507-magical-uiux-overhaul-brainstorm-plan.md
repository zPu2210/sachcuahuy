# Magical UI/UX Overhaul — Brainstorm + Plan Creation

**Date**: 2026-05-07 09:30 (Saigon)
**Severity**: High
**Component**: sachcuahuy.com homepage, catalog, author pages, podcast integration
**Status**: Planning Complete, Ready for Execution

## What Happened

Conducted full brainstorm + planning session for site aesthetic overhaul. User provided 20+ reference images (~Downloads/sachcuahuy/) revealing brand mismatch: site used navy+gold luxury-hotel palette, but actual author brand is navy+terracotta+cream with hand-drawn ink + watercolor illustration style. Session resulted in 6-phase implementation plan with vertical-slice MVP approach (home first, validate vibe before scaling).

## The Brutal Truth

Production site completely misrepresents author's actual creative identity. Gold-and-navy palette screams "5-star resort" when Huy's real work breathes "literary garden with ink brushstrokes." Mismatch compounds in detail — generic icons where decorative monoline motifs belong, no illustration anywhere. User relief when direction clarified: "finally captured the aesthetic I was after." This was critical alignment moment.

## Technical Details

**Aesthetic Pivot:**
- Primary: Navy #1F2937 (unchanged)
- Accent: Terracotta #C75D2C → #A04420 for body text (4.5:1 contrast vs cream background)
- Secondary: Cobalt #3B5BF0 for interactive accents
- Background: Cream #FEF5E7

**Image Strategy (4 types):**
- Motifs: SVG monoline (decorative borders, chapter markers, author signature)
- Ambient: WebP landscapes (watercolor scenes, natural light study photos)
- Scene illustrations: AI-generated + human-curated (Nano Banana 2 img2img with author reference art)
- Author portraits: Huy hand-drawn, WebP-optimized

**Constraints & Trade-offs:**
- A11y: Terracotta borderline on contrast — solved via font-weight + size hierarchy
- Audit plan 260504-2119 was designed but not executed — now bidirectional dependency (blocker for Phase 0)
- Book covers untouched (real artwork from author, high IP value)
- Podcast page scope unknown until scout phase

## What We Tried

1. **Foundation-first approach** (audit → tokens → component lib) — rejected as too slow for MVP validation. User wants to see vibe on home by end of week.
2. **Asset sprint in parallel** (design + dev simultaneous, different teams) — rejected due to single-dev team constraint (no parallel capacity).
3. **Color palette: straight replacement** (swap gold→terracotta globally) — rejected as insufficient. Terracotta needs cobalt secondary + darker accent variant for accessibility.

## Root Cause Analysis

User vision for site aesthetic was never captured during initial build. Moodboard research did happen but outputs (20 reference images) were parked in Downloads, never integrated into design system or brand guidelines. No feedback loop between visual direction and frontend implementation. Result: site launched with default luxury-hotel assumptions instead of author's actual book-garden sensibility.

## Decisions Documented

Via AskUserQuestion approval:
- **Aesthetic:** Hybrid navy (primary) + terracotta (accent) + cobalt (secondary)
- **Scope:** Whole site (home + catalog detail + gioi-thieu + podcast)
- **Approach:** B — Vertical Slice (home MVP first)
- **Images:** All 4 types + WebP encoding for SEO
- **Illustration:** Mixed style (monoline inks + watercolor painterly scenes)
- **Audit:** Run as Phase 0 blocker (delegate to existing plan 260504-2119)
- **Performance:** Lighthouse ≥85 (moderate bar, not extreme)

## Next Steps

1. **Phase 0** (2-4h): Run audit per 260504-2119. Check current Lighthouse, A11y, image quality, broken links. Output: audit report, recommendations for re-scope.
2. **Phase 1** (6-10h): Home vertical slice. Hero section new palette, monoline motifs, WebP ambient bg, author portrait, quick-links redesigned.
3. **Phases 2-4**: Catalog detail page, gioi-thieu podcast section, SEO/perf gate with OG images + JSON-LD.
4. **User action**: Can start immediately with `/ck:cook plans/260506-2335-magical-uiux-overhaul/phase-00-audit-execution.md`

**Ownership**: Self-assigned to implementation flow (user will cook via CLI, subagents execute phases).

## Lessons Learned

- **Moodboards need active integration.** Parking reference images in Downloads is design theater. Must feed into brand doc, design tokens, component library, or execution plan.
- **Vertical slice validates aesthetic faster than foundation-first.** User got clarity by seeing home prototype in proposed palette rather than reading design document.
- **Accessibility constraints are solvable with typography.** Terracotta contrast looked broken until we layered type-weight + size-hierarchy. Don't reject color choices before exploring full solution space.
- **Audit plan dependency is a gate.** Audit might surface re-scope (e.g., broken 50 images discovered → Phase 1 effort jumps 6h→10h). Wire blocker explicitly.

## Unresolved Questions

- Podcast page actual structure/scope? (Need scout phase to answer)
- Author timeline content (5-7 milestones) — will Huy provide real data or use placeholder?
- Nano Banana 2 API access confirmed? (ai-artist skill needs verification)
- Audit Phase 0 outcomes — could trigger Phase 1 re-scope?
