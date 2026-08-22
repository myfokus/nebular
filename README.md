# myfokus/nebular

This is a **compatibility fork** of [akveo/nebular](https://github.com/akveo/nebular), forked at the
`v17.0.0` release. Upstream is MIT licensed; `LICENSE.txt` and the original copyright headers are
kept intact.

It exists for one reason: `@nebular/theme@17.0.0` is the newest published Nebular and still declares
`@angular/*` and `@angular/cdk` peers of `^21.0.0`. Both Fokus dashboards run Angular 22, which only
worked because pnpm does not enforce peer ranges and because `@angular/cdk` was deliberately pinned a
major behind the framework. That blocked Angular 23. This fork retargets the packages we actually use
at Angular 22 / CDK 22 and nothing else.

**It is not a redesign, and it is not a general-purpose Nebular.** Do not add features here.

## What we publish

| Fork package                 | Upstream package     | Consumed by                        |
| ---------------------------- | -------------------- | ---------------------------------- |
| `@myfokus/nebular-theme`     | `@nebular/theme`     | dok-dashboard, dok-admin-dashboard |
| `@myfokus/nebular-eva-icons` | `@nebular/eva-icons` | dok-dashboard, dok-admin-dashboard |
| `@myfokus/nebular-date-fns`  | `@nebular/date-fns`  | dok-dashboard                      |

Everything else in `src/framework` (`auth`, `moment`, `security`, `firebase-auth`, `bootstrap`,
`icons`) is **left untouched at its Angular 21 state and is not built, tested or published**. It is
kept only so the diff against upstream stays small. Do not assume it compiles.

Versioning follows the upstream base: the fork is `17.1.0`, meaning "upstream 17.0.0 plus our
compatibility changes". Keeping the major aligned with upstream is what makes "which release is this
forked from?" answerable at a glance.

## How this fork diverges from upstream

### Toolchain

- Root `package.json`: all `@angular/*`, `@angular-devkit/*`, `@angular/cli`, `ng-packagr` and
  `angular-eslint` moved `^21.0.0` → `^22.0.0`; `typescript` `~5.9.2` → `~6.0.3` (Angular 22 requires
  `>=6.0 <6.1`); `date-fns` `^2.0.0` → `^4.1.0`; `@types/node` bumped; `@types/fancy-log` added.
- `.nvmrc`: `20.19.5` → `22.22.3`. Angular 22 requires Node `^22.22.3 || ^24.15.0 || >=26.0.0`.
- TypeScript 6.0 turns `strict` on by default and deprecates `baseUrl` / `moduleResolution: node10`.
  The build-tooling configs (`tools/gulp`, `tools/dev-schematics`, `theme/tsconfig.schematics.json`)
  pin the pre-6.0 behaviour explicitly rather than have the tooling rewritten. The root `tsconfig.json`
  drops `baseUrl` outright, so its `paths` entries had to become relative (`./src/...`).

### Package identity

- The three published packages are renamed to the `@myfokus` scope, their `@angular/*` and
  `@angular/cdk` peers retargeted to `^22.0.0`, and `repository`/`bugs`/`homepage` repointed here.
  `author` stays `akveo` — they wrote it.
- `@myfokus/nebular-date-fns` peers on `date-fns` `^3.0.0 || ^4.0.0`, not `^2.0.0`. The upstream
  package imported `date-fns` submodules as **default** exports (`import { default as parse } from
'date-fns/parse'`), which date-fns 3 removed. Against the `date-fns@4` the dashboards actually
  install, upstream's build is broken. Those imports are now named. date-fns 2 is consequently no
  longer supported by this package.
- `tsconfig.json` gains a `@myfokus/nebular-*` path mapping alongside the upstream `@nebular/*` one,
  so the internal cross-package imports resolve. Only `date-fns` and `eva-icons` were repointed at
  the new scope; the unmaintained packages still import `@nebular/*`.

### CDK 21 → 22 source changes

CDK 22 moved its components to `inject()`-based DI, so a whole family of Nebular classes that
extended a CDK class and forwarded constructor arguments now call a zero-argument `super()`:

- `cdk/adapter/viewport-ruler-adapter.ts`, `cdk/adapter/scroll-dispatcher-adapter.ts` — `super()`;
  the parameters that existed only to be forwarded are gone. `NB_DOCUMENT` is `useExisting: DOCUMENT`,
  which is exactly what CDK now injects itself, so nothing changes behaviourally.
- `cdk/adapter/block-scroll-strategy-adapter.ts` — `NbScrollStrategyOptions` calls `super()`.
  `BlockScrollStrategy` itself still takes its two arguments and is untouched.
- `cdk/table/cell.ts`, `cdk/table/table.module.ts`, `tree-grid/tree-grid-def.component.ts`,
  `tree-grid/tree-grid.component.ts` — same treatment. `NbTable` no longer needs a constructor at all.
- `cdk/a11y/focus-trap.ts` — the opposite direction: CDK 22's `FocusTrap` constructor _gained_ an
  `Injector` parameter, so `NbFocusTrap` takes and forwards one and `NbFocusTrapFactoryService`
  injects it.

Two consequences of that move needed explicit repair, because CDK used to receive Nebular's adapters
as constructor arguments and now looks them up in the injector instead:

- `cdk/adapter/adapter.module.ts` gains `{ provide: ViewportRuler, useExisting: NbViewportRulerAdapter }`.
  Without it the scroll strategies measure the window instead of the `nb-layout` scroll container.
- `NB_TABLE_PROVIDERS` now carries the same mapping for `CdkTable`, which previously got the adapter
  through its constructor.

`NB_VIEW_REPEATER_STRATEGY` is **removed** — CDK 22 deleted `_VIEW_REPEATER_STRATEGY` and no longer
accepts an injected view-repeater strategy. It only ever supplied `_DisposeViewRepeaterStrategy`,
which is CDK's default anyway, so behaviour is unchanged. This is the one intentional public API
break in the fork.

### Angular 22 source changes

- `tree-grid/tree-grid-def.component.ts` — `ngOnChanges(changes: SimpleChanges)` →
  `SimpleChanges<this>`; Angular 22 made the type generic and the base signature is now narrower.
- `calendar/calendar-range.component.ts` — `monthCellComponent` was declared as an `@Input()` _and_
  bound again through the aliased `@Input('monthCellComponent') set _monthCellComponent` setter.
  Angular 22's new NG1054 diagnostic rejects the duplicate binding. The plain `@Input()` was dropped,
  which makes the property consistent with its `dayCellComponent` and `yearCellComponent` siblings —
  neither of those carried one. Upstream bug, surfaced by the compiler.

**Inputs on dynamically created components.** This one is worth understanding before you touch the
datepicker or window code, because it is subtle and it silently produced wrong output rather than an
error.

Angular 22 runs a component's first change detection _while the portal is attaching_. Upstream sets
the picker's inputs by plain property assignment (`this.picker.visibleDate = date`) **after** the
attach, and that is not recorded as an input change — it only ever worked because Angular 21's first
change-detection pass happened later, after the assignment. Under Angular 22 the calendar rendered
once with nothing set (falling back to today's month, no selection) and only corrected itself on
some later, unrelated change-detection run. Anything reading the picker straight after `show()` saw
the stale render. The same shape broke the window: `NbWindowRef` mutates state that the template
reads through getters, so minimizing and restoring left the body as first rendered.

- `datepicker/datepicker.component.ts`, `datepicker/date-timepicker.component.ts` — a
  `setPickerInput()` helper routes every input through `ComponentRef.setInput()`, which records the
  change and marks the view. `openDatepicker()` then renders once synchronously so callers see the
  patched state. As a side effect this also repairs an upstream bug: `patchWithInputs` assigned
  `picker._cellComponent`, which only exists on `NbCalendarRangeComponent`, so custom day/month/year
  cells were silently ignored by the plain `nb-datepicker`. The public input names work for both.
- `window/window.component.ts` — subscribes to `windowRef.stateChange` and marks itself for check.

Together these fix five `datepicker.spec.ts` regressions and one in `window.service.spec.ts`.

### CI and release

- `.github/workflows/pr-check.yml` is **replaced**. Upstream's version builds the docs site, the
  playground and a BrowserStack matrix using akveo's own hardcoded BrowserStack credentials, which
  are not ours to use. Ours builds and tests the three packages. **Resolve rebase conflicts in this
  file in favour of our version.**
- `.github/workflows/deploy-docs.yml` is **deleted** — it publishes the Nebular docs site to
  gh-pages, which this fork has no business doing.
- `.github/workflows/publish.yml` and `tools/publish-myfokus.sh` are new (see below).
- New npm scripts, all prefixed `myfokus` so a rebase makes the divergence obvious:
  `build:myfokus`, `build:myfokus-sass`, `test:myfokus`, `publish:myfokus`.

## Releasing

Publishing uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC), so there
is no long-lived `NPM_TOKEN` in this repo.

### One-time bootstrap

npm attaches a trusted publisher to an **existing package**, and the setting is per package — there
is no organisation- or scope-level equivalent, and "each package can only have one trusted publisher
configured at a time". So the three packages have to exist on npmjs before OIDC can take over, which
makes the very first publish a manual one. Done once, by a human with publish rights on the org:

1. Create the `@myfokus` organisation on npmjs.
2. On a machine logged in to npm (`npm login`), from the repo root:

   ```bash
   npm ci && npm run build:myfokus && npm run publish:myfokus
   ```

   `tools/publish-myfokus.sh` passes `--access=public`, which a first publish under a new scope
   needs, and publishes theme first because the other two peer on it.

3. For each of `@myfokus/nebular-theme`, `@myfokus/nebular-eva-icons` and
   `@myfokus/nebular-date-fns`, open the package's settings on npmjs and add a trusted publisher:
   repository `myfokus/nebular`, workflow `publish.yml`. The workflow filename must match exactly.

Every release after that runs through the workflow. Note that npm does not validate a trusted
publisher configuration when you save it — a mismatch only shows up at publish time, and it surfaces
as a misleading `E404 Not Found` rather than an auth error.

### Cutting a release

1. Bump `version` in all three `src/framework/*/package.json` files, and the
   `@myfokus/nebular-theme` peer range in `date-fns` and `eva-icons`.
2. Tag it `myfokus-v<version>` and push the tag.

The tag prefix is `myfokus-v`, not `v`, so it can never collide with the upstream release tags this
fork inherited (`v1.0.0` … `v17.0.0`) or with any that arrive in a future rebase. The workflow
verifies the tag matches the theme package version before publishing, then publishes theme first
because the other two peer on it.

If trusted publishing is ever not an option, the fallback is an automation token in an Actions secret
and `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` on the publish step — a two-line change to
`publish.yml`.

## Rebasing onto a future upstream release

If akveo ever ships an Angular 22+ release, most of this fork should evaporate.

```bash
git remote add upstream https://github.com/akveo/nebular.git   # once
git fetch upstream --tags
git rebase v18.0.0                                             # or whatever the new tag is
```

Then, in order:

1. **Drop what upstream fixed.** Every CDK/Angular source change listed above exists only because
   upstream was on 21. If the new release did the same work, take upstream's version wholesale.
2. **Keep the package identity changes.** Scope, version, peer ranges, `repository`, the
   `@myfokus/nebular-*` path mapping, and the date-fns named imports are ours regardless of the
   upstream version — unless upstream also fixed date-fns 3/4, in which case take theirs.
3. **Keep our CI and release files.** `pr-check.yml` will conflict; resolve in favour of ours.
   `deploy-docs.yml` will come back; delete it again. `publish.yml`, `tools/publish-myfokus.sh` and
   the `myfokus`-prefixed npm scripts are ours and will not conflict.
4. **Re-check the divergence list above** and rewrite it to match what actually remains.
5. Run `npm ci && npm run build:myfokus && npm run test:myfokus`, then verify against the dashboards
   before publishing.

If upstream is still dead and you are bumping Angular again, the CDK-inheritance sites listed above
are where breakage lands; everything else has been stable.

## Test suite state

`npm run test:myfokus` is **not green, and was not green upstream either.** Measured on the same
hardware, `ng test theme`:

|                                  | failing | passing |
| -------------------------------- | ------- | ------- |
| upstream `v17.0.0` on Angular 21 | 162     | 654     |
| this fork on Angular 22 / CDK 22 | 101     | 714     |

Compared spec-by-spec rather than by count: the fork **fixes 47 specs** that upstream fails and
**regresses none**. `date-fns` is 6/6 green; `eva-icons` has no specs.

CI therefore runs `test:myfokus-ci`, which covers `date-fns` and `eva-icons` but not the theme
suite — gating on a suite that is red upstream would mean a permanently red CI that nobody reads.
`test:myfokus` still runs all three locally.

Because the suite is red on both sides, **treat the diff in failures as the gate, not the absolute
count.** Capture a baseline before and after any change:

```bash
git worktree add ../nebular-baseline v17.0.0
cd ../nebular-baseline && npm ci && npx ng test theme --watch=false
```

The ~100 remaining failures are inherited from upstream and were not investigated. They are spread
across chat, button-group, select, stepper, tag and the overlay directives, and most look like
change-detection timing assumptions in the specs themselves rather than broken components.

---

# Nebular [<img src="https://i.imgur.com/oMcxwZ0.png" alt="Eva Design System" height="20px" />](https://eva.design?utm_campaign=eva_design%20-%20home%20-%20nebular%20github%20readme&utm_source=nebular&utm_medium=referral&utm_content=github_readme_hero_pic) [![npm](https://img.shields.io/npm/l/@nebular/theme.svg)]() [![npm](https://img.shields.io/npm/dt/@nebular/theme.svg)](https://www.npmjs.com/package/@nebular/theme) [![Codecov](https://img.shields.io/codecov/c/github/akveo/nebular/master.svg?style=flat-square)](https://codecov.io/gh/akveo/nebular/branch/master)

> Everything below this line is upstream's original README, kept for reference.

[Documentation](https://akveo.github.io/nebular/docs/getting-started/what-is-nebular?utm_campaign=nebular%20-%20home%20-%20nebular%20github%20readme&utm_source=nebular&utm_medium=referral&utm_content=documentation) | [Stackblitz Template](https://stackblitz.com/github/akveo/nebular-seed) | [Angular templates](https://www.akveo.com/templates?utm_campaign=services%20-%20github%20-%20templates&utm_source=nebular&utm_medium=referral&utm_content=github%20readme%20top%20angular%20templates%20link)

Nebular is a customizable Angular UI Library with a focus on beautiful design and ability to adapt it to your brand easily. It comes with 4 stunning visual themes, a powerful theming engine with runtime theme switching and support of custom css properties mode. Nebular is based on Eva Design System specifications.

<a href="https://akveo.github.io/nebular/?utm_campaign=nebular%20-%20home%20-%20nebular%20github%20readme&utm_source=nebular&utm_medium=referral&utm_content=nebular_readme_pic"><img src="https://i.imgur.com/vu5Ro3A.jpg"></a>

## What's included

- **4 Visual Themes, including new Dark** easily customizable to your brand
- **35+ Angular UI components** with a bunch of handy settings and configurations
- **Configurable options** - colors, sizes, appearances, shapes, and other useful settings
- **3 Auth strategies and Security** - authentication and security layer easily configurable for your API
- **Powerful theming engine** with custom CSS properties mode
- **SVG Eva Icons support** - 480+ general purpose icons

## Repository state and engagement with the community

Repository is currently in a state of minimal maintenance. Our primary focus is on ensuring that the Angular version used in this project is kept up to date. Our capacity to engage in other aspects of repository management is currently limited.

We are not actively reviewing or merging pull requests, responding to or resolving issues at this time. We appreciate the effort and contributions from the community and we understand that issues are crucial for the community. But now our current focus is solely on maintaining Angular.

## Quick Start

You can install Nebular with Angular CLI:

```bash
ng add @nebular/theme
```

Configuration will be done automatically.

If you want to have more control over setup process you can [use manual setup guide](https://akveo.github.io/nebular/docs/guides/install-nebular?utm_campaign=nebular%20-%20home%20-%20nebular%20github%20readme&utm_source=nebular&utm_medium=referral&utm_content=install_manually#manually).

## Browser Support

Nebular supports most recent browsers. Browser support list can be found <a href="https://angular.io/guide/browser-support" target="_blank">here</a>.

## Starters

- [ngx-admin](http://github.com/akveo/ngx-admin) - 20k+ stars application based on Nebular modules with beautiful E-Commerce & IOT components, for boosting your developing process. [Live Demo](https://www.akveo.com/ngx-admin?utm_campaign=ngx_admin%20-%20demo%20-%20nebular%20github%20readme%20-%20traffic&utm_source=nebular&utm_medium=referral&utm_content=github_readme).
- [ngx-admin-starter](https://github.com/akveo/ngx-admin/tree/starter-kit) - clean application based on Nebular modules with a limited number of additional dependencies.

## UI Bakery

Need a visual admin dashboard builder? Check out [UI Bakery](https://uibakery.io).

<a href="https://uibakery.io"><img src="https://storage.uibakery.io/video-assets/landing/Logo/UIB%20400x150.png" height="80" /></a>

## License

[MIT](LICENSE.txt) license.

## More from Akveo

- [Eva Icons](https://github.com/akveo/eva-icons) - 480+ beautiful Open Source icons
- [Akveo templates](https://www.akveo.com/templates?utm_campaign=services%20-%20github%20-%20templates&utm_source=nebular&utm_medium=referral&utm_content=nebular%20github%20readme%20more%20from%20akveo%20link) - 10+ Ready-to-use apps templates to speed up your apps developments

## How can I support the developers?

- Star our GitHub repo :star:
- Create pull requests, submit bugs, suggest new features or documentation updates :wrench:
- Read us on [Medium](https://medium.com/akveo-engineering)
- Follow us on [Twitter](https://twitter.com/akveo_inc) :feet:
- Like our page on [Facebook](https://www.facebook.com/akveo/) :thumbsup:

## From Developers

Made with :heart: by [Akveo team](https://www.akveo.com?utm_campaign=service%20-%20akveo%20website%20-%20nebular%20github%20readme%20-%20traffic&utm_source=nebular&utm_medium=referral&utm_content=github_readme). Follow us on [Twitter](https://twitter.com/akveo_inc) to get the latest news first!
We're always happy to receive your feedback!
