author: Christina Lin
authors: Christina Lin
summary: Take a small game from a laptop to Google Cloud — a project, a region, a managed database, a hosted model, and a serverless deployment — guided by the interactive Cloud 101 Workbench.
id: cloud-foundation-one
categories: cloud,gcp,ai
environments: Web
status: Published
feedback link: https://github.com/gca-americas/cloud-foundation-one/issues

# Your First Course on Google Cloud 2026

## Introduction

This codelab guides you through taking a local application—**DinoQuest**, a side-scrolling runner game with a score leaderboard—and moving it from a single terminal process to a public, serverless production deployment on Google Cloud. Along the way, you provision and connect the foundational pieces every cloud application requires: a project boundary, billing and budget guardrails, a physical region, a managed document database, a hosted generative model, and a serverless container runtime.

### The scenario

You have built **DinoQuest** in Python. It runs in your terminal, serves a browser game over `localhost:8080`, and tracks high scores. While running locally in a terminal is enough to build and test the game, four operational limitations prevent anyone else from using it:

- **Process fragility**: The application stops the moment you close your terminal or Cloud Shell session shuts down, and every score stored in process memory vanishes on restart.
- **Private addressing**: `localhost:8080` only answers requests originating on the same machine, and Cloud Shell Web Preview sits behind your personal sign-in.
- **Physical operations**: Running a public server requires power, cooling, network routing, and hardware replacement.
- **Capacity and cost management**: Hardware owned for peak midday traffic sits idle at 3 AM while still costing money.

To solve these problems without buying or managing servers, you will migrate DinoQuest to Google Cloud. You will persist leaderboard records in **Firestore**, generate custom pixel-art dinosaur sprites on demand using **Gemini** on the **Gemini Enterprise Agent Platform**, and deploy the application as an auto-scaling container on **Cloud Run**.

### What you learn

- **Cloud economics and the rental model**: Cloud computing is renting computing resources instead of owning them. You evaluate the three defining properties of a cloud service—*on-demand provisioning*, *pay-per-use billing*, and *provider-operated infrastructure*—and apply that same rental arrangement three times: renting storage, renting intelligence, and renting compute.
- **Projects, billing, and cost guardrails**: Resources require an administrative and financial boundary. You create a Google Cloud **project**, link an external **billing account**, configure a **budget alert** to account for batched billing delays, and enable project-scoped API switches.
- **Global infrastructure and region selection**: Cloud resources run in physical data centers grouped into **regions** connected by Google's private fiber network. You analyze how physical distance drives network latency and how to balance user proximity, data residency rules, and service availability.
- **Service taxonomy and managed persistence**: Over two hundred cloud products map into five durable categories: *Compute*, *Storage*, *Databases*, *Networking*, and *AI*. You distinguish between opaque files and structured records, provision a regional **Firestore** database, and rewire DinoQuest's storage layer so leaderboard scores survive process restarts.
- **Hosted models on the Gemini Enterprise Agent Platform**: Calling a foundation model over the network follows the same rental pattern as compute and storage. You configure the **Google Gen AI SDK** (`google-genai`) using Application Default Credentials (ADC) without API keys, use the `global` endpoint for classroom capacity, and enforce a structured JSON `response_schema` so **Gemini** returns a deterministic 24×24 pixel-art sprite grid.
- **Serverless containers and production identity**: Production services require public HTTPS routing, least-privilege identity, and externalized configuration. You package DinoQuest into a container image using **Cloud Build** and **Artifact Registry** without writing a Dockerfile, grant the **Cloud Run** service account `roles/datastore.user` and `roles/aiplatform.user`, and deploy a service that scales to zero when idle.

### How this codelab is organized

This codelab serves as your conceptual and architectural reference. Each section explains the cloud engineering principles behind the corresponding workbench step, presents the reference code and CLI commands, and describes what to observe during execution. Review each section alongside the corresponding exercise in the workbench.

Hands-on work takes place in the **Cloud 101 Workbench**, a companion web application (`server/` and `web/`) running in Cloud Shell on port **4800**.

Unlike traditional codelabs where you copy and paste opaque flag strings, the **Cloud 101 Workbench** is built around three interactive mechanisms:

- **Intent-driven exercises**: Exercises ask you to describe the outcome you want in your own words, the way you would instruct an assistant (for example, *"Set up a Firestore database in my region to keep the scores"*). The workbench (`server/services/intent.py`) evaluates your phrasing against required concept groups and misconception filters—explaining why if you ask for a file bucket instead of a database, or an API key instead of IAM credentials—and runs the real command in your Cloud Shell environment. Every prompt includes a **Help me** button if you want a working request filled in.
- **Scoped code rewrites and embedded live preview**: Each code change rewrites a single marked section of `app/main.py` (`begin store` / `end store` and `begin dino` / `end dino`) and highlights the diff in the workbench file viewer while leaving the game engine and HTTP routes untouched. The workbench (`server/services/appproc.py`) reverse-proxies your local DinoQuest process (`localhost:8080`) at `/app`, allowing you to start, play, stop, and inspect server logs inside the browser over a single Cloud Shell port.
- **Live account verification**: Nothing in the workbench is simulated. Every check (`server/services/probes.py`) runs a real read-only command (`gcloud`, `curl`, `python3`, or `cat`) against your active Google Cloud account and displays both the output and the exact command that produced it—so every verification check also teaches you how to inspect your cloud resources from a terminal without the workbench.

```
   ┌──────────────────────────────────────────────────────────────┐
   │  Browser — Cloud 101 Workbench UI (web/dist)                 │
   │                                                              │
   │   reading pane        exercise             checks            │
   │   markdown + SVG      intent boxes,        live read-only    │
   │   figures             terminal, widgets,   probe results     │
   │                       file explorer, app                     │
   └───────┬──────────────────────┬───────────────────┬───────────┘
           │ /api/…               │ /events (SSE)     │ /app/…
   ┌───────▼──────────────────────▼───────────────────▼───────────┐
   │  Cloud 101 Workbench Server — FastAPI (server/)   port 4800  │
   │                                                              │
   │   content     intent      probes       runs      appproc     │
   │   YAML + md   matcher     read-only    streams   start/stop  │
   │                           commands     output    + proxy     │
   └───────┬───────────────────────────────────────────┬──────────┘
           │ subprocess: gcloud, bash, python3         │ reverse proxy
           ▼                                           ▼
   ┌────────────────────────┐              ┌──────────────────────┐
   │  Your real Google      │              │  DinoQuest (app/)    │
   │  Cloud project         │              │  a separate process  │
   └────────────────────────┘              │  on port 8080        │
                                           └──────────────────────┘
```

## Setup

### Claim your workshop credits

If you are attending an instructor-led workshop, your instructor will distribute credits for your Google Cloud account. Redeem your credit link before continuing—claiming the credit creates the open billing account that you link to your project.

### Open Cloud Shell

**Cloud Shell** is a browser-based Linux environment with `gcloud`, Python, Node.js, `uv`, and `git` preinstalled and authenticated with your Google account.

To launch Cloud Shell:

1. Navigate to the [Google Cloud console](https://console.cloud.google.com/).
2. In the top navigation header, click **Activate Cloud Shell** (the terminal window icon).

A terminal session opens at the bottom of your browser window.

### Clone and initialize the repository

Run the following commands in your Cloud Shell terminal to clone the repository and start the **Cloud 101 Workbench**:

```bash
git clone https://github.com/gca-americas/cloud-foundation-one.git
cd cloud-foundation-one
./scripts/start.sh
```

`scripts/start.sh` prepares the environment and launches the workbench:

- Creates a Python virtual environment in `.venv` using `uv` and installs the locked backend dependencies (`fastapi`, `uvicorn`, `pyyaml`).
- Builds the React frontend into `web/dist` (`npm install && npm run build`) if the static bundle is not yet present.
- Starts the FastAPI workbench server (`server.main:app`) on port **4800**.

When startup finishes, the terminal displays:

```console
  Cloud 101 Workbench
  http://localhost:4800
```

To open the workbench in your browser:

1. Click **Web Preview** (the preview icon at the top of the Cloud Shell toolbar).
2. Select **Change port**, enter **4800**, and click **Change and Preview**.

Positive
: Keep `scripts/start.sh` running in this Cloud Shell tab for the duration of the lab. Every terminal command, app start/stop action, and account verification check runs directly through the workbench interface on port **4800**.

#### Configuration options

The workbench reads optional environment variables at startup (`server/config.py`):

| Variable | Default | Purpose |
|---|---|---|
| `CLOUD101_PORT` | `4800` | Port served by the FastAPI workbench (`server/main.py`) |
| `CLOUD101_APP_PORT` | `8080` | Local port where `app/main.py` runs before reverse-proxying to `/app` |
| `CLOUD101_PROJECT_NAME` | `my-dinoquest` | Prefix used when creating and checking your Google Cloud project |
| `CLOUD101_SERVICE` | `dinoquest` | Name of the Cloud Run service deployed to production |
| `CLOUD101_AGENT_URL` | *(unset)* | Optional external agent endpoint for evaluating open-ended student intents |

If your organization requires you to use an existing Google Cloud project rather than creating a new one, start the workbench with that project's ID or prefix:

```bash
CLOUD101_PROJECT_NAME=your-existing-project ./scripts/start.sh
```


### Repository layout

The repository separates the student application, the course curriculum, the automation scripts, and the workbench server:

```text
cloud-foundation-one/
├── app/                        # DinoQuest — the student's application
│   ├── main.py                 
│   ├── requirements.txt        
│   ├── Procfile                
│   └── static/                 # Frontend game engine (game.js), HTML, audio, and dino.png sprite
└── scripts/                    
    └── reset_app.py            # Rewinds app/ to its initial state without modifying cloud resources
```

## Run the app where it is

In the **Cloud 101 Workbench**, navigate to **Run the app where it is** and open **The application**.

Before moving anything to Google Cloud, inspect the application as it exists on disk, start it in Cloud Shell, and observe how process memory behaves when a server stops.

### The application

All server logic lives in `app/main.py` with zero external dependencies. Python's standard `http.server` serves the static game assets from `app/static/` (`index.html`, `game.js`, `dino.png`, and audio files) and answers three JSON routes:

- `GET /api/scores`: Returns the top 10 scores in descending order.
- `POST /api/scores`: Accepts `{"name": "...", "score": 123}`, records the score, and returns the updated leaderboard.
- `GET /api/health`: Reports where scores are currently stored (`where`) and whether AI sprite generation is active (`dino`).

Open `app/main.py` in the workbench file browser and examine the leaderboard store section bounded by `begin store` and `end store`:

```python
# ── the leaderboard ──────────────────────────────────────────── begin store ──

WHERE = "in this process's memory"

SCORES: list[dict] = []


def add_score(name: str, score: int) -> list[dict]:
    """Record a score and return the leaderboard."""
    SCORES.append({"name": name[:MAX_NAME] or "anon", "score": score})
    SCORES.sort(key=lambda row: row["score"], reverse=True)
    del SCORES[KEEP:]
    return SCORES


def leaderboard() -> list[dict]:
    return SCORES

# ──────────────────────────────────────────────────────────────── end store ──
```

`SCORES` is an ordinary Python list inside the running `python3 main.py` process.

### Hands-on execution

In the workbench exercise panel:

1. Browse `app/main.py` and `app/static/` in the **Look at the app** file explorer.
2. In the **Start the app** terminal panel (`server/services/workspace.py`), move into the `app` directory and start the server:
   ```bash
   cd app
   python3 main.py
   ```
3. Once `python3 main.py` listens on port `8080`, the workbench reverse-proxies it at `/app` and embeds the live **DinoQuest** game. Enter your name, press **Space** or click to jump over cactuses, and record a score on the leaderboard.
4. Run the verification check at the bottom of the page. The workbench executes a read-only probe against your local server:
   ```bash
   curl -s -o /dev/null -w %{http_code} http://127.0.0.1:8080/api/health
   ```
   When the endpoint returns `200`, click **Stop the app**.

### Requirements for a public app

In the workbench, advance to **Requirements for a public app**.

Running DinoQuest inside Cloud Shell proves the game code works, but four structural barriers keep anyone else from playing it:

- **The program must run somewhere that stays on**: Cloud Shell shuts down after inactivity or when you close your browser tab.
- **That location needs a public address**: `localhost:8080` means *this computer*—a request to `localhost` never leaves the machine that made it. Cloud Shell's Web Preview URL is a private proxy tunnel tied to your personal Google sign-in; sending that link to someone else gives them a sign-in page rather than your game.
- **Someone must operate the building**: Physical servers require power, cooling, network peering, and technicians to replace failed drives and apply security patches.
- **Someone must pay for the capacity**: Running hardware continuously requires paying for electricity, space, and network transit.

Positive
: Every Google Cloud service introduced in the rest of this course addresses one of these four requirements. When you encounter an unfamiliar cloud product later, ask which of these four problems it solves.

Run the verification check at the bottom of the page (`gcloud version`) to confirm that the Google Cloud CLI is installed and ready.

## What cloud computing is

In the **Cloud 101 Workbench**, navigate to **What cloud computing is** and open **Renting instead of owning**.

### Renting instead of owning

For decades, launching an application meant buying physical servers, waiting weeks for delivery, and placing them in a room you managed. Because ordering hardware takes weeks, you had to buy enough capacity to survive your busiest hour of the year—and you continued paying for those idle machines at 3 AM every night.

**Cloud computing is renting computing resources instead of owning them.**

| Dimension | Owning Hardware | Renting on the Cloud |
|---|---|---|
| **Capacity sizing** | Sized in advance for peak demand | Scaled dynamically to current demand |
| **Lead time** | Adding capacity takes weeks | Adding capacity takes seconds |
| **Planning horizon** | Planned a year ahead | Adjusted the same day or minute |
| **Hardware maintenance** | You replace failed disks and patch hosts | The provider operates the building and hardware |
| **Billing model** | Upfront capital expenditure | Pay per second, gigabyte, or request |

Three traits distinguish a cloud service from a traditional server rental contract:

- **On demand**: You request capacity through an API or CLI and receive it in seconds without a purchase order.
- **Pay for what you use**: You are billed by the second, gigabyte, or API call. When you stop or delete a resource, billing stops.
- **Operated by the provider**: The provider manages the data center, power, cooling, physical network, hardware replacement, and host security updates. You rent the outcome rather than the equipment.

#### Comparing cost curves

In the workbench exercise panel, use the **Running it yourself compared with renting it** widget:

- Drag the **traffic volume** and **peak-to-average ratio** sliders from zero users on the left toward high traffic on the right.
- Observe how **owning** (the red step curve) requires buying discrete blocks of hardware ahead of demand and paying for unused headroom during quiet hours, while **renting** (the blue curve) tracks actual consumption and drops to zero when nobody is using the app.

### Cost and trade-offs

In the workbench, advance to **Cost and trade-offs**.

Cloud computing is a pricing model whose cost depends on the shape of your demand:

- **Renting costs less** when demand is variable, spiky, uncertain, or small—which describes almost every new application and workshop project.
- **Owning can cost less** when demand is large, flat, and predictable 24 hours a day, which is why some large organizations run steady baseline workloads on owned hardware.

Across the rest of this course, you apply the same rental arrangement to three resources: **compute**, **storage**, and **intelligence**.

#### Creating your project

Before you can provision resources, Google Cloud needs a **project** to hold them:

1. In the **Create your project** panel, click **Do it for me** (or create a project named `my-dinoquest` in the console and click **I made it**). The workbench (`server/services/project.py`) creates a globally unique project ID (`my-dinoquest-NNNN`), sets it as your active `gcloud` project, and saves the ID to `~/project_id.txt`:
   ```bash
   gcloud projects create my-dinoquest-$RANDOM --name="my-dinoquest"
   gcloud config set project YOUR_PROJECT_ID
   echo YOUR_PROJECT_ID > ~/project_id.txt
   ```
2. In the **Confirm your account and project** terminal panel, verify your active identity and project configuration:
   ```bash
   gcloud auth list
   gcloud config get-value project
   ```
3. Run the verification checks at the bottom of the page (`gcloud config get-value account`, `gcloud projects list --filter=projectId:my-dinoquest*`, and `cat ~/project_id.txt`).

## Projects and billing

In the **Cloud 101 Workbench**, navigate to **Projects and billing** and open **Projects, identifiers, and billing accounts**.

### Projects, identifiers, and billing accounts

Every Google Cloud resource belongs to exactly one **project**, which establishes five boundaries around everything inside it:

- **Billing aggregation**: Usage costs report out by project, allowing teams to separate development, staging, and production bills.
- **Permissions (IAM)**: Access granted on a project reaches the resources inside that project.
- **Enabled services**: Every API is switched off by default in a new project until explicitly enabled.
- **Quotas**: Rate limits and resource allocations are tracked per project.
- **Lifecycle cleanup**: Deleting the project deletes every service, image, and database inside it in one action.

Positive
: When something fails in Google Cloud, check three things in order: **the active project**, **whether the service API is enabled**, and **IAM permissions**.

Every project has three identifiers:

- **Project Name** (e.g., `my-dinoquest`): A human-readable display label you can change at any time.
- **Project ID** (e.g., `my-dinoquest-4821`): A **globally unique, permanent identifier** used in CLI commands, SDK configurations, and URLs. It can never be changed or reused after deletion.
- **Project Number**: A system-assigned integer used internally by Google Cloud service accounts and IAM policies.

#### Linking a billing account

A **billing account** is a standalone resource separate from any project, and one billing account can pay for multiple projects. In the **Link a billing account** panel, click **Do it for me** (`server/services/billing.py`) or run:

```bash
gcloud billing accounts list
gcloud billing projects link $(cat ~/project_id.txt) --billing-account=ACCOUNT_ID
```

Run the verification check (`gcloud billing projects describe $PROJECT --format=value(billingEnabled)`) to confirm billing is active.

### Budget alerts

In the workbench, advance to **Budget alerts**.

A **budget alert** sets a monthly spending threshold on a billing account and sends email notifications when usage crosses specified percentages (such as 50%, 90%, and 100%).

Negative
: **A budget alert tells you; it does not stop spending.** It sends email notifications only and never shuts down resources. Because cloud services report usage in batches, an alert can arrive hours after the spending occurred.

Two habits cover for batched billing delays:

- **Set the threshold low** ($5 or $10) on the day the project is created so even a delayed alert triggers early.
- **Delete resources when you stop using them** rather than waiting for an alert.

In the **Create a budget alert** panel, open the [Budgets console](https://console.cloud.google.com/billing/budgets) or click **Do it for me** (`server/services/budget.py`):

```bash
gcloud services enable billingbudgets.googleapis.com

gcloud billing budgets create \
  --billing-account=ACCOUNT_ID \
  --display-name="DinoQuest" \
  --budget-amount=10USD \
  --threshold-rule=percent=0.5 \
  --threshold-rule=percent=0.9 \
  --threshold-rule=percent=1.0
```

Run the verification check (`python3 scripts/probe_budget.py`) to confirm the budget exists.

### Enabling services

In the workbench, advance to **Enabling services**.

In a new project, service APIs are disabled by default. Enabling an API flips a switch on the project and **costs nothing**—you are charged only for resources you use. DinoQuest requires five APIs:

| Service API | Product Name | Role in DinoQuest |
|---|---|---|
| `run.googleapis.com` | **Cloud Run** | Runs the containerized application at a public HTTPS URL |
| `cloudbuild.googleapis.com` | **Cloud Build** | Packages `app/` source code into a container image |
| `artifactregistry.googleapis.com` | **Artifact Registry** | Stores the built container image |
| `firestore.googleapis.com` | **Firestore** | Stores leaderboard scores outside the application process |
| `aiplatform.googleapis.com` | **Gemini Enterprise Agent Platform** | Serves hosted Gemini models to draw custom dino sprites |

In the **Enable the APIs in the console** panel, click **Do it for me** (`server/services/apis.py`) or run:

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com
```

Then run `gcloud services list --enabled --format=value(config.name)` in the workbench terminal and verify all four service checks pass.

## Choose a region

In the **Cloud 101 Workbench**, navigate to **Choose a region** and open **Data centers and regions**.

### Data centers and regions

Every cloud resource runs inside a physical building:

- **Data center**: A physical facility housing thousands of servers, power distribution, and cooling systems.
- **Region**: A cluster of data centers in one geographic area (such as `us-central1` in Iowa, `europe-west2` in London, or `asia-northeast1` in Tokyo), connected by high-speed fiber so they behave as one location.

Explore the **3D Globe** in the workbench reading pane. Each dot represents a Google Cloud region, and the lines between them represent Google's private global network and undersea fiber cables.

### Distance and latency

Light travels through fiber-optic cable at roughly **200,000 kilometers per second**. Physical distance establishes a lower bound on every network round trip:

| Player Location | Application Region | Approximate Round-Trip Latency |
|---|---|---|
| London | London (`europe-west2`) | ~5 ms |
| London | Virginia (`us-east4`) | ~80 ms |
| London | Sydney (`australia-southeast1`) | ~250 ms |

Your Python code runs at the same speed in all three places; the difference is purely the distance the request travels.

### Selecting a region

Positive
: **Choose the region nearest the people who will use the application—not the region nearest you.** You feel your own latency only when deploying; your users feel theirs on every request.

Two constraints can override user proximity:

- **Data residency**: Legal or regulatory requirements that mandate data remain inside a specific country or jurisdiction.
- **Service availability**: Not every product or model is available in every region.

Complete the **Four situations** (`region-quiz`) interactive widget in the workbench exercise panel, and set your default CLI region when needed:

```bash
gcloud config set run/region us-central1
gcloud config set compute/region us-central1
```

## What's on the menu

In the **Cloud 101 Workbench**, navigate to **What's on the menu** and open **Five service categories**.

### Five service categories

Google Cloud has more than two hundred products, but they fall into five durable categories that outlast individual product names:

| Problem You Need Solved | Cloud Category | What DinoQuest Uses |
|---|---|---|
| **Somewhere to run code** | **Compute** | **Cloud Run** (with Cloud Build & Artifact Registry) |
| **Somewhere to keep records** | **Databases** | **Firestore** |
| **Somewhere to make it smart** | **AI** | **Gemini** on Gemini Enterprise Agent Platform |
| **Somewhere to keep files** | **Storage** | *(Not needed — `dino.png` ships inside the container)* |
| **Something to connect it** | **Networking** | *(Default HTTPS routing provided by Cloud Run)* |

### Files versus records

- **A file is opaque**: You store it whole and hand it back whole (photos, videos, PDFs, audio). Storage never looks inside a file to sort or update a single field.
- **A record is structured**: Your application reads, filters, sorts, and updates individual fields as it runs (user accounts, leaderboard scores, messages).

Because DinoQuest's leaderboard is a sorted list of `{name, score}` entries, it requires a **database** (`Firestore`), not a file storage bucket.

### Compute options

Within **Compute**, the key architectural question is **how much machine you want to manage**:

- **Virtual Machines (Compute Engine)**: You rent an entire computer and manage the operating system, patches, and disks yourself.
- **Kubernetes Clusters (GKE)**: You run many containers across a cluster of machines when one container is not enough.
- **Serverless Containers (Cloud Run)**: You provide a container; Google Cloud runs copies when requests arrive, stops them when idle, and leaves you no machines to patch.

## Give the app a memory

In the **Cloud 101 Workbench**, navigate to **Give the app a memory** and open **Process memory versus databases**.

### Process memory versus databases

Anything an application keeps in memory (`SCORES = []` in `app/main.py`) lasts only as long as that operating system process. A **database** is a separate program running outside your application on persistent storage, outliving application restarts, crashes, and container scale-downs.

### Databases on Google Cloud

| Database Service | Data Shape & Strengths | When to Reach for It |
|---|---|---|
| **Firestore** | Serverless document database, schema-flexible, scales to zero | Application records when you want no database servers to manage |
| **Cloud SQL** | Managed PostgreSQL, MySQL, or SQL Server with joins and transactions | Relational data with strict schemas and SQL queries |
| **Spanner** | Globally distributed relational database with horizontal scale | Global financial or gaming backends at massive scale |
| **Bigtable** | Wide-column NoSQL store built for high-throughput writes | Time-series telemetry and IoT streams |
| **BigQuery** | Serverless enterprise data warehouse for analytical SQL | Business intelligence and analytics over historical data |

**Firestore** suits DinoQuest because there is no instance to provision or patch, it runs in the region you chose, and it scales to zero when nobody is playing.

### Provisioning and connecting Firestore

Work through the tasks in the workbench exercise panel:

1. **Watch a score disappear**: Start DinoQuest in the embedded app panel, play a round to put a score on the board, click **Stop**, and click **Start** again. Observe that the leaderboard is empty.
2. **Make the score survive a restart**: In the intent box, describe what you want provisioned in your own words:
   ```text
   Set up a Firestore database in my region to keep the scores
   ```
   If you ask for a `bucket` or `file storage`, `server/services/intent.py` explains why a leaderboard requires records rather than opaque files. When your phrasing names a database, the workbench runs `bash scripts/create_database.sh`:
   ```bash
   gcloud firestore databases create --location=$(gcloud config get-value compute/region)
   ```
3. **Get the app writing to it**: In the code intent box, describe the application change:
   ```text
   Change the app to save scores in Firestore instead of the list
   ```
   The workbench runs `python3 scripts/connect_firestore.py`, installing `google-cloud-firestore` into `app/.venv` and rewriting only the marked `store` section of `app/main.py`:

```python
# ── the leaderboard ──────────────────────────────────────────── begin store ──

from google.cloud import firestore          # noqa: E402

WHERE = "in Firestore"
COLLECTION = "scores"

_db = firestore.Client()


def add_score(name: str, score: int) -> list[dict]:
    """Record a score and return the leaderboard."""
    _db.collection(COLLECTION).add({"name": name[:MAX_NAME] or "anon", "score": score})
    return leaderboard()


def leaderboard() -> list[dict]:
    rows = (
        _db.collection(COLLECTION)
        .order_by("score", direction=firestore.Query.DESCENDING)
        .limit(KEEP)
        .stream()
    )
    return [{"name": r.get("name"), "score": r.get("score")} for r in rows]

# ──────────────────────────────────────────────────────────────── end store ──
```

### What to expect and why

- **Isolated code change**: Inspect the diff in the file viewer. The game engine, HTML, and HTTP routes are untouched—changing where records live only replaced the 25 lines between `begin store` and `end store`.
- **Durable scores across restarts**: Restart DinoQuest in the app panel, post a score, then click **Stop** and **Start** again. The score remains on the leaderboard because it now lives in Firestore outside the Python process.
- **Live verification**: Run the four verification probes at the bottom of the page (`gcloud firestore databases list`, `cat app/main.py`, and `curl -s http://127.0.0.1:8080/api/health`).

## The AI platform

In the **Cloud 101 Workbench**, navigate to **The AI platform** and open **Hosted models and Model Garden**.

### Hosted models and Model Garden

Google Cloud runs foundation models on its own accelerators and answers requests over the network. Calling a hosted model is the third rental in this course: no weights to download, no GPUs to reserve, and nothing left running between calls.

Positive
: Google Cloud's unified AI platform was called **Vertex AI** until 2026 and is now the **Gemini Enterprise Agent Platform** (while **Gemini Enterprise** is the workplace assistant product). The API service remains `aiplatform.googleapis.com`.

**Model Garden** is the catalogue of more than 200 models—including **Google models** (Gemini, Imagen, Veo, Lyria), **open models** (Gemma), and **partner models**—alongside their documentation, context windows, and per-token pricing.

### Environment configuration

In the workbench, advance to **Generating sprites with Gemini**.

DinoQuest draws its character from `app/static/dino.png`. Instead of calling an image diffusion model, DinoQuest asks `gemini-3.5-flash` to return a **24×24 grid of characters** and a **6-color hex palette** constrained by a JSON **response schema**, and turns that character grid into `app/static/dino.png`.

Settings that change between machines belong in `app/.env` rather than in source code:

| Environment Variable | Value in DinoQuest | Purpose |
|---|---|---|
| `GOOGLE_GENAI_USE_VERTEXAI` | `True` | Use Google Cloud IAM credentials rather than an API key |
| `GOOGLE_CLOUD_PROJECT` | `my-dinoquest-NNNN` | Which project is billed and whose quota is spent |
| `GOOGLE_CLOUD_LOCATION` | `global` | Which endpoint answers the request |
| `DINO_MODEL` | `gemini-3.5-flash` | Which model in Model Garden to call |

Negative
: `GOOGLE_CLOUD_LOCATION=global` is a deliberate classroom choice. A production service names a specific region (`us-central1`) for data residency and predictable latency; `global` trades regional pinning for routing capacity so thirty students calling the same model simultaneously do not hit single-region rate limits.

### The Google Gen AI SDK

Every call with the `google-genai` SDK has the same shape:

```python
from google import genai
from google.genai import types

client = genai.Client(
    vertexai=True,
    project=os.environ["GOOGLE_CLOUD_PROJECT"],
    location=os.environ.get("GOOGLE_CLOUD_LOCATION", "global"),
)

answer = client.models.generate_content(
    model=MODEL,
    contents=f"The player asked for: {idea or 'a friendly green dinosaur'}",
    config=types.GenerateContentConfig(
        system_instruction=INSTRUCTIONS,
        response_mime_type="application/json",
        response_schema=SHAPE,
        temperature=0.9,
    ),
)
```

There is **no API key**. With `vertexai=True`, the SDK signs requests using the Google Cloud credentials already active in Cloud Shell.

### Generating sprites with Gemini

Complete the three tasks in the workbench exercise panel:

1. **Get the app ready to reach a model**: Describe the setup in the intent box:
   ```text
   Set up what the app needs to call Gemini
   ```
   If you ask for an `api key` or `secret`, the intent matcher explains why IAM credentials replace static keys. When accepted, the workbench runs `python3 scripts/setup_gemini_env.py` across four pipeline stages (**Settings** → **Endpoint** → **The SDK** → **Ready**), writing `app/.env` and installing `google-genai`.
2. **Have the model draw the dino**: Describe the code change in the second intent box:
   ```text
   Change the code so Gemini draws a new dino when I ask
   ```
   The workbench runs `python3 scripts/connect_gemini.py`, rewriting the `# ── the dino ── begin dino ──` section of `app/main.py` with `make_dino()`, `restore_dino()`, retry handling, and PNG synthesis.
3. **Run it and ask for a dino**: Start (or restart) DinoQuest in the app panel, enter a character description into **Draw me a new dino**, click **Generate**, and play a round with your custom sprite.

### What to expect and why

- **Schema-guaranteed JSON**: Because `response_schema=SHAPE` is passed in `GenerateContentConfig`, Gemini always returns a valid `palette` array and 24 `rows` of 24 characters that `_png()` can immediately encode into `app/static/dino.png`.
- **Reversible changes**: Clicking **Original dino** in the game invokes `POST /api/dino/original`, which copies `app/static/dino.default.png` back over `app/static/dino.png`.
- **Live verification**: Run the four verification checks at the bottom of the page to confirm `aiplatform.googleapis.com` is enabled, `google-genai` is in `app/requirements.txt`, `genai.Client(` is in `app/main.py`, and `/api/health` reports `"dino": true`.

## Deploy to Cloud Run

In the **Cloud 101 Workbench**, navigate to **Deploy to Cloud Run** and open **Serverless containers**.

### Serverless containers

**Cloud Run** runs containers on Google-operated infrastructure, assigns each service a public HTTPS `.run.app` address, scales copies up when requests arrive, and scales down to zero copies when idle so you pay nothing while nobody is playing.

A **container** seals your code, runtime, and dependencies into a single image. DinoQuest needs no `Dockerfile`: Google Cloud buildpacks inspect `app/requirements.txt` and `app/Procfile` (`web: python3 main.py`) and build the container across four stages:

1. **Upload**: The contents of `app/` are uploaded to **Cloud Build**.
2. **Build**: **Cloud Build** installs dependencies and builds the container image.
3. **Store**: The image is stored in **Artifact Registry**.
4. **Run**: **Cloud Run** starts the service and returns an HTTPS URL.

### Cold starts and revisions

- **Cold starts**: When a service has scaled to zero, the first request waits a moment for a container copy to start—the latency trade-off for paying nothing while idle.
- **Revisions**: Every deployment creates an immutable revision. Rolling back a change moves traffic back to the previous revision in seconds without rebuilding.

### Service accounts and runtime settings

Negative
: Two things change when your application moves from Cloud Shell to Cloud Run:
1. **Identity**: The app no longer runs as *you*; it runs as a dedicated **service account** (`PROJECT_NUMBER-compute@developer.gserviceaccount.com`) that has no permissions until granted **`roles/datastore.user`** (for Firestore) and **`roles/aiplatform.user`** (for Gemini).
2. **Configuration**: Local `app/.env` is not inside the container; those environment variables must be set on the Cloud Run service via `--set-env-vars`.

`scripts/deploy_app.py` grants both IAM roles and passes the environment variables automatically:

```bash
gcloud run deploy dinoquest \
  --source app/ \
  --region=$REGION \
  --allow-unauthenticated \
  --set-env-vars=GOOGLE_GENAI_USE_VERTEXAI=True,GOOGLE_CLOUD_LOCATION=global,DINO_MODEL=gemini-3.5-flash
```

### Deploying the service

In the workbench exercise panel:

1. **Give the app a public address**: Enter your deployment request in the intent box:
   ```text
   Deploy DinoQuest to Cloud Run so anyone can play it
   ```
   The workbench runs `python3 scripts/deploy_app.py` and advances through the four pipeline stages (**Permission** → **Upload** → **Build** → **Running**). When complete, it displays your live `https://dinoquest-....run.app` link.
2. **Confirm it is the same app**: Open the public HTTPS URL, play a round, verify that the leaderboard shows the same Firestore scores you recorded locally, and generate a new dino sprite in production.
3. **Verify**: Run the three `gcloud run services describe dinoquest` checks at the bottom of the page.

## Cost and cleanup

In the **Cloud 101 Workbench**, navigate to **Cost and cleanup** and open **AI developer tools**.

### AI developer tools

Having built each cloud component by hand lets you review what automated AI tools provision on your behalf:

- **Google AI Studio (Build mode)**: Describe an application and deploy it directly to **Cloud Run**, with automatic provisioning for **Firestore** (with Firebase Auth) or **Cloud SQL for PostgreSQL** while keeping model credentials server-side.
- **Google Antigravity**: An agentic development platform across desktop, CLI, IDE, and SDK that connects to the **Google Developer Knowledge MCP server** for live Google Cloud documentation and uses project **agent skills** (`SKILL.md`) to follow your engineering conventions.

### Understanding the bill

In the workbench, advance to **Understanding the bill**. Open the [Billing report](https://console.cloud.google.com/billing) to inspect the four categories that make up a cloud bill:

- **Compute time**: Container CPU and memory while actively handling requests ($0 while idle).
- **Storage**: Leaderboard documents in **Firestore** and the container image in **Artifact Registry**—charged whether or not anyone plays.
- **Requests**: Per-call charges, including Firestore reads/writes and **Gemini** tokens.
- **Egress**: Data leaving Google's network to reach players over the internet.

### Shutting down the project

Because every resource was created inside one **project** box, deleting the project removes the Cloud Run service, the Artifact Registry container image, and the Firestore database in a single action.

1. In the **Delete the project** panel, open [IAM & Admin → Settings](https://console.cloud.google.com/iam-admin/settings), verify the project name at the top, click **Shut down**, and confirm with your project ID—or click **Do it for me** (`server/services/project.py`).
2. Complete the reflection checklist: your **billing account** and any other projects linked to it are untouched, because a billing account belongs to you rather than to the deleted project.
3. If you shut down the project, run the final verification check (`gcloud projects describe $PROJECT --format=value(lifecycleState)`).

## Summary

| Step | Cloud Architecture & Concepts | Implementation Pattern |
|---|---|---|
| **Run the app where it is** | Local process memory vs. public hosting requirements | `python3 app/main.py`, `localhost:8080`, `/app` proxy |
| **What cloud computing is** | Renting vs. owning (on-demand, pay-per-use, provider-operated) | `cost-curve` model, `gcloud projects create` |
| **Projects and billing** | Project boundaries, billing accounts, budget alerts, API switches | `gcloud billing projects link`, `gcloud billing budgets create`, `gcloud services enable` |
| **Choose a region** | Data centers, private fiber network latency, data residency | Regional selection and `gcloud config set run/region` |
| **What's on the menu** | Compute, Storage, Databases, Networking, and AI categories | Structured records vs. opaque files; serverless vs. VMs |
| **Give the app a memory** | Managed NoSQL persistence outside the process boundary | `gcloud firestore databases create`, `firestore.Client()` |
| **The AI platform** | Hosted Gemini models, ADC credentials, structured outputs | `google-genai` SDK, `vertexai=True`, `response_schema` |
| **Deploy to Cloud Run** | Buildpack containers, revisions, scale-to-zero, service account IAM | `roles/datastore.user`, `roles/aiplatform.user`, `gcloud run deploy --source` |
| **Cost and cleanup** | Billing line items and project-level lifecycle teardown | `gcloud projects delete` and billing report inspection |

### Core architectural principles

1. **Renting instead of owning**: Compute (Cloud Run), storage (Firestore), and intelligence (Gemini) all follow the same on-demand, pay-per-use arrangement operated by the provider.
2. **State lives outside the process**: Anything stored in process memory disappears when a container stops or restarts; durable records belong in a managed database.
3. **Identity over static keys**: Production cloud code authenticates with Application Default Credentials and least-privilege service account roles (`datastore.user`, `aiplatform.user`) rather than hardcoded API keys.
4. **Configuration outside source code**: Environment settings (`GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `DINO_MODEL`) live in `.env` locally and `--set-env-vars` on the deployed service.
5. **Two habits that prevent surprise bills**: Set a low budget alert on the day a project is created, and delete the project container when you finish using it.
