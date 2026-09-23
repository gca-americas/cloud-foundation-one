# Cloud Foundation - One

A Google Cloud foundations lab for people who have never used it. Nine steps,
around four hours, ending with a deployed app that calls a model.

Brought to you by Google Cloud Americas' Advocacy team.

The lab runs in **Cloud Shell**. Every step teaches the concept first and puts
the exercise last, so nobody types a command before knowing what it is for.

---

## What makes it different from a codelab

**Students don't copy commands. They ask for what they want.**

Each exercise asks the student to describe what they need in their own words,
the way they would put it to an assistant. The workbench judges the request,
and if the intent is right it runs the real command in their Cloud Shell.

> *"You just watched the leaderboard empty itself. Describe what you want set
> up so that stops happening."*
>
> → `bash scripts/create_database.sh`

Remembering flags has stopped being the skill. Knowing what to ask for, and
recognising whether you got it, has not. Every ask box has a **Help me** button
that fills in a request that works, so nobody is stuck guessing at wording.

**Checks ask Google Cloud, not the student.** Every check runs a real read-only
command against the student's own account and shows both the answer and the
command that produced it — so a check is also a lesson in how to find that out
without a workbench.

**Nothing blocks progress.** A failing check explains what is missing. A
student stuck at 9pm can move on and come back.

---

## Architecture

Three processes, and the separation between them is deliberate.

```
   ┌──────────────────────────────────────────────────────────────┐
   │  Browser — React + Vite, built to web/dist                   │
   │                                                              │
   │   reading pane        exercise             checks            │
   │   markdown + SVG      ask boxes, terminal, probe results     │
   │                       file explorer, app                     │
   └───────┬──────────────────────┬───────────────────┬───────────┘
           │ /api/…               │ /events (SSE)     │ /app/…
   ┌───────▼──────────────────────▼───────────────────▼───────────┐
   │  Workbench — FastAPI (server/)                    port 4800  │
   │                                                              │
   │   content     intent      probes       runs      appproc     │
   │   YAML + md   matcher     read-only    streams   start/stop  │
   │                           commands     output    + proxy     │
   └───────┬───────────────────────────────────────────┬──────────┘
           │ subprocess: gcloud, bash, python3         │ reverse proxy
           ▼                                           ▼
   ┌────────────────────────┐              ┌──────────────────────┐
   │  The student's real    │              │  DinoQuest (app/)    │
   │  Google Cloud project  │              │  a separate process  │
   └────────────────────────┘              │  on port 8080        │
                                           └──────────────────────┘
```

Nothing is simulated. The commands are real, the account is theirs, and the
app in the iframe is a real process answering real requests.

### The content is data, not code

A step is a folder under `content/steps/`, named `NN-slug` — the number is the
order, and there is no registry to keep in sync. `step.yaml` declares the step,
its parts, the exercise tasks and the checks; the prose lives in markdown
beside it.

```
content/steps/06-ai-platform/
├── step.yaml        meta, parts, exercise, checks
├── a-platform.md    one part's concepts
└── b-generate.md
```

A step is made of **parts** — short screens, each with its own headline,
figures and sometimes its own exercise. Parts keep a screen from becoming a
wall: a student moves through 6a, 6b rather than scrolling one long page.

Markdown is extended with a few block directives, which nest:

| Directive | Renders |
|---|---|
| `:::section kicker="…" headline="…"` | A titled panel |
| `:::figure id="…" caption="…"` | An inline SVG figure, by id |
| `:::key` / `:::note` / `:::warn` | A callout |
| `:::columns` | Side-by-side panels, split on `---` |
| `:::console url="…" label="…" note="…"` | A button out to the Cloud console |

Figures are **inline SVG components**, not image files, so each one works in
both light and dark themes — they draw with the same CSS variables the page
does. They live in `web/src/illustrations/` and are referenced by id.

### Task kinds

An exercise is a list of tasks, and each kind is a different component:

| Kind | What the student does |
|---|---|
| `intent` | Describes what they want; the workbench runs the command |
| `provision` | Same, with an animation instead of a log |
| `deploy` | Same, with a staged pipeline, the live URL and share buttons |
| `files` | Describes a code change; one marked section is rewritten and highlighted |
| `terminal` | Types real commands into a terminal that runs them |
| `app` | Starts, plays and stops DinoQuest, embedded in the page |
| `console` | Opens the Cloud console at the right page, with a checklist |
| `widget` | An interactive diagram — a globe, a cost curve, a quiz |
| `reflect` | Answers a question; nothing runs |

A task that takes a request may declare `stages`. When it does, the command and
its log are hidden behind a **Show log** button and replaced by a pipeline that
advances as the output matches each stage's pattern — read from the log rather
than driven by a timer, which would keep moving while something was stuck.

### How a request is judged

`server/services/intent.py`. A task's `expect` lists concept groups. The
wording has to hit **one synonym from each group**, and must avoid the
`rejects` groups, which exist to catch a specific wrong mental model:

```yaml
expect:
  requires:
    - [database, firestore, records, storage, persist]
    - [create, make, set up, need, want, add, new]
  rejects:
    - [bucket, file storage, object storage]
  feedback:
    rejected: >
      A bucket holds files you hand back whole. A leaderboard is records.
```

Matching is local and deterministic. Set `CLOUD101_AGENT_URL` to send requests
to a deployed agent instead, for wording too open to match on synonyms.

### How checks work

`server/services/probes.py`. A check is a read-only command plus an assertion
(`contains`, `not_contains`, `matches`, `json_contains`, `nonempty`, …). Only
`gcloud`, `bq`, `gsutil`, `curl`, `python3` and `cat` may run, there is no
shell, and any `gcloud` verb that is not read-only is refused. The student sees
the command and its real output either way.

### The terminal is not a shell

`server/services/workspace.py` matches each command and carries it out in
Python — `pwd`, `ls`, `cd`, `cat`, `clear`, `help`, and `python3 main.py`,
which starts the real process. Anything else answers "command not found". There
is no interpreter to escape from, every path is confined to the repository, and
symlinks are resolved before the check.

`gcloud` runs for real, in the student's own account, with two guards:

- **Irreversible commands are refused** — `projects delete`, `auth revoke`,
  `billing accounts`, `organizations`, `resource-manager`. Deleting a *service*
  is allowed, because step 8 teaches cleanup and a Cloud Run service can be
  made again. A project and an account cannot.
- **Interactive commands are refused with an explanation** rather than left to
  hang. `gcloud auth login` and `gcloud init` wait for a keyboard this terminal
  does not have, so it says so and prints the command to run in a real tab.

### The student's app

`app/` runs as a separate process, started and stopped exactly as
`python3 app/main.py` would be. The workbench reverse-proxies it at `/app`, so
the page can embed it same-origin and Cloud Shell needs only one port opened
with Web Preview. For that to work the app asks for **relative** URLs
(`game.js`, not `/game.js`).

Status is "is anything answering on the port", not "did we start it", so a
student who started it in a terminal still sees it as running.

The app grows one marked section at a time. Every step that changes code
rewrites one region of one file between comment markers — small enough to read,
and reversible.

---

## Run it

Requires `uv`, Node 18+, and the `gcloud` CLI signed in.

```bash
scripts/start.sh          # builds if needed, serves on http://localhost:4800
scripts/dev.sh            # API on 4800, Vite with hot reload on 5273
```

In Cloud Shell, open port **4800** with **Web Preview**.

### Configuration

| Variable | Default | Changes |
|---|---|---|
| `CLOUD101_PORT` | `4800` | The workbench port |
| `CLOUD101_APP_PORT` | `8080` | The port DinoQuest runs on |
| `CLOUD101_PROJECT_NAME` | `my-dinoquest` | The project name students are asked to create |
| `CLOUD101_SERVICE` | `dinoquest` | The Cloud Run service name |
| `CLOUD101_AGENT_URL` | *(unset)* | An agent endpoint to judge requests |
| `CLOUD101_AGENT_TIMEOUT` | `8` | Seconds to wait for that agent |

Accounts that cannot create projects, or must reuse one:

```bash
CLOUD101_PROJECT_NAME=existing-project scripts/start.sh
```

The panel, the printed instruction and all three checks follow that value.

---

## For instructors

### Reset a student's app

Every step that changes code changes one marked section, so rewinding is exact
rather than a guess:

```bash
python3 scripts/reset_app.py
```

The leaderboard returns to an in-memory list, the model code is removed,
`app/.env` is deleted and the original dino sprite is restored. **Nothing in
Google Cloud is touched** — the database, the deployment and the project all
stay. Safe to run at any point, including mid-step, and safe to run twice.

Use it when a student's code is in a state nobody can read, or to walk a step a
second time.

### Restart the app

Students use the **Start** and **Stop** buttons on any `app` task. A process
left over from a previous session is still found by Stop, because the process
id is recorded in `runs/app.pid` rather than only held in memory.

From a terminal:

```bash
curl -X POST localhost:4800/api/app/stop
```

If the app will not start, or misbehaves while running, press **Show log** on
the app panel. It shows what the app has printed and refreshes while it runs,
which is where a missing dependency or a bad setting will say so.

### Reload content while teaching

Step content is read from disk on every request, so **editing a `step.yaml` or
a markdown file and refreshing the browser is enough**. No restart.

Two things are compiled into the page and need a rebuild:

```bash
cd web && npm run build      # after changing a figure or a component
```

Restart the workbench itself only after changing something under `server/`.

### Reset cloud resources

Step 8 ends by having students **delete the project**, which removes the Cloud
Run service, the container image and the Firestore database with it. That is
done in the console, not the workbench: `gcloud projects delete` is on the
refused list, because a project id cannot be reused and a service can always be
made again.

To take down one student's resources without deleting their project:

```bash
gcloud run services delete dinoquest --region=$REGION --quiet
gcloud artifacts repositories delete cloud-run-source-deploy --location=$REGION --quiet
gcloud firestore databases delete --database='(default)' --quiet
```

A billing account belongs to the person, not the project, and survives either
way.

### Running it for a room

- Set `CLOUD101_PROJECT_NAME` if students should not all create `my-dinoquest`.
  Project ids are globally unique, so what gets created is `my-dinoquest-NNNN`
  with the display name kept — step 3's lesson arriving early. Checks match on
  the prefix, never an exact id.
- Insist on the budget alert in step 2 before anyone reaches step 6.
- Step 6 uses the **global endpoint** for Gemini on purpose: in a room of
  thirty people calling the same model in the same region, capacity fails
  first. The step says so, and says why a production service names a region.
- Model calls retry three times, a minute apart, before giving up. The
  workbench's proxy waits long enough to cover that.
- Some logins can *use* a billing account without being allowed to list them.
  That is reported as "no accounts visible", not as "no billing".

---

## The course

| Part | Steps |
|---|---|
| Understand it | 0 DinoQuest in Cloud Shell · 1 Cloud computing |
| Set up your corner | 2 Projects and billing · 3 Regions |
| Learn what's available | 4 What's on the menu |
| Make it do more | 5 Give your app a memory · 6 The AI platform |
| Put your app on the cloud | 7 Give your app a home |
| Run it like a professional | 8 Review and cleanup |

Two ideas carry through every step:

- **The thesis** — cloud computing is renting instead of owning. You rent the
  machine, the storage, and finally the intelligence. Step 6 closes it.
- **The trade-off** — every decision trades speed, cost and resilience. Named
  in step 2 and referred to by name at each later decision, so it transfers to
  services this course never taught.

### The app it builds

`app/` is DinoQuest: a runner game with a leaderboard, and the thing the course
moves to the cloud.

| Step | The app | What it motivates |
|---|---|---|
| 0 | Runs in Cloud Shell, scores in a Python list, lost on restart | "Always on" |
| 5 | Scores move to Firestore and survive a restart | A managed database |
| 6 | A model draws a new dino sprite on request | Renting intelligence |
| 7 | Deployed, with a public URL other people can play on | Serverless hosting |

It starts with no dependencies: `python3 app/main.py` is the whole setup, and
`main.py` is short enough for a beginner to read — step 0 asks them to. The
dino is a PNG rather than shapes on a canvas, so step 6 swaps a file instead of
rewriting the game.

---

## Layout

```
app/          DinoQuest — the student's app, no dependencies at the start
content/      the course: course.yaml and one folder per step
scripts/      what the exercises run, and reset_app.py
server/       FastAPI: content, intent, probes, runs, app process, proxy
web/          React page — components, illustrations, widgets
CODELAB.md    the same course as a linear Google Codelab
CLOUD-102.md  what this course leaves out, and why
```

## What it leaves out

Identity and access, failure and resilience, containers in depth,
infrastructure as code, networking, GKE, the data platform and CI/CD are all
deliberately out of scope. `CLOUD-102.md` records each one, why it was cut, and
what a follow-on course would cover.
