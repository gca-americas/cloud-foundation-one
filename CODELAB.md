author: Google Cloud Americas' Advocacy team
summary: Take a small game from a laptop to Google Cloud — a project, a region, a managed database, a hosted model, and a serverless deployment.
id: cloud-foundation-one
categories: cloud,gcp,ai
environments: Web
status: Draft
feedback link: https://github.com/gca-americas/cloud-foundation-one/issues

# Cloud Foundation - One

## Before you begin
Duration: 0:05:00

This codelab takes one small application — **DinoQuest**, a runner game with a
leaderboard — and moves it from a terminal to Google Cloud. Along the way you
meet the pieces every cloud application needs: a project, a region, a managed
database, a hosted model, and somewhere to run.

### What you'll learn

- What a cloud provider actually rents you, and how that differs from owning
- How projects, billing and budgets fit together
- Why a region is a decision and how to choose one
- How a managed database outlives the process that writes to it
- How to call a hosted Gemini model from your own code
- How to deploy a container to Cloud Run and give it a public address

### What you'll need

- A Google account
- A Google Cloud billing account, or a credit to claim
- A browser — everything runs in **Cloud Shell**, so nothing is installed

Positive
: There is an interactive version of this course. It asks you to describe what
you want in your own words instead of copying commands, and checks your account
after each step. See the repository README for how to run it.

### Get the code

```bash
git clone https://github.com/gca-americas/cloud-foundation-one.git
cd cloud-foundation-one
```

## Run the app where it is
Duration: 0:10:00

Before moving anything, see what you have.

```bash
cd app
python3 main.py
```

Open it with **Web Preview** on port 8080. Play a round and put a score on the
leaderboard.

Now stop it with `Ctrl+C` and start it again. **The leaderboard is empty.**

The scores were in a Python list inside the process. When the process ended, so
did the list. That is not a bug to fix later — it is the first thing worth
noticing, and step 5 fixes it properly.

Look at what is actually there:

```bash
cat main.py
```

The whole application is one short file with no dependencies. The leaderboard
is these few lines:

```python
WHERE = "in this process's memory"
SCORES: list[dict] = []

def add_score(name, score):
    SCORES.append({"name": name, "score": score})
    ...
```

Negative
: Four things a terminal cannot do for an app: keep it running when you close
the laptop, let anyone else reach it, restart it when it crashes, and serve
more people than one process can.

## What cloud computing is
Duration: 0:15:00

Cloud computing is **renting instead of owning**.

Owning means buying for your busiest hour and paying for it at 3am. Renting
means three things at once:

- **On demand** — you ask for capacity and get it in seconds
- **Pay per use** — you are charged for what runs, not what exists
- **Operated for you** — someone else patches, replaces and powers it

That last one is the part people underestimate. A machine you own also needs a
room, power, cooling, spare parts and somebody on call.

This idea is the thesis of the whole course. You will rent a **machine** in
step 7, **storage** in step 5, and **intelligence** in step 6 — the same
arrangement, three times.

## Make a project
Duration: 0:15:00

A **project** is the box everything you make goes in. It carries one bill, one
set of permissions, one set of enabled services, and one namespace for names.

```bash
gcloud projects create my-dinoquest-$RANDOM --name="my-dinoquest"
gcloud config set project YOUR_PROJECT_ID
echo YOUR_PROJECT_ID > ~/project_id.txt
```

Positive
: Project **ids** are globally unique, so `my-dinoquest` is almost certainly
taken. The id is permanent; the display name is not.

### Link billing

Nothing chargeable works until a billing account is attached.

```bash
gcloud billing accounts list
gcloud billing projects link YOUR_PROJECT_ID --billing-account=ACCOUNT_ID
```

### Set a budget alert

Do this now, not later.

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

Negative
: A budget alert **tells you**, it does not stop spending. Some services report
usage hours late, so an alert can arrive after the money is spent.

### Enable the services this course needs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com
```

Check what is on:

```bash
gcloud services list --enabled
```

## Choose a region
Duration: 0:15:00

Google Cloud runs in **regions** — clusters of data centres in one part of the
world, joined by Google's own private network.

A region is a real decision, and it trades three things:

- **Distance** — every request pays the round trip, and physics does not
  negotiate
- **Price** — the same machine costs different amounts in different regions
- **Rules** — where data is allowed to live is often not your choice

Pick one near the people who will use the app:

```bash
gcloud config set run/region us-central1
gcloud config set compute/region us-central1
```

Positive
: The question to ask is "where are my users?", not "which is cheapest?". A
region on the wrong continent costs every request 150ms, forever.

## What's on the menu
Duration: 0:15:00

Google Cloud has hundreds of products. They fall into a handful of categories,
and the categories outlast the product names.

| You need | The category | What this course uses |
|---|---|---|
| Somewhere to run code | Compute | Cloud Run |
| Somewhere to keep records | Databases | Firestore |
| Somewhere to keep files | Storage | *(not used here)* |
| Something to connect it | Networking | *(defaults)* |
| Something to make it smart | AI | Gemini |

For compute, the question is **how much machine you want to think about**: a
virtual machine is a whole computer you look after, a container on Cloud Run is
just your code, and GKE is many containers when one is not enough.

## Give the app a memory
Duration: 0:30:00

The leaderboard disappears because it lives inside the process. A **database**
is a program whose whole job is keeping records safe, running somewhere else,
outliving everything your app does.

**Firestore** suits this app: documents, no schema, no server to run, and it
scales to zero.

### Create the database

```bash
gcloud firestore databases create --location=$(gcloud config get-value compute/region)
```

### Point the app at it

```bash
python3 scripts/connect_firestore.py
```

That rewrites **one marked section** of `app/main.py` and installs the client
library. Read what changed — the game, the routes and the two API calls are
untouched. Moving where the data lives did not mean rewriting the application.

```python
from google.cloud import firestore

WHERE = "in Firestore"
_db = firestore.Client()

def add_score(name, score):
    _db.collection("scores").add({"name": name, "score": score})
    return leaderboard()
```

### Prove it

```bash
cd app && python3 main.py
```

Play a round, stop the app, start it again. **The score is still there.**

## The AI platform
Duration: 0:35:00

Google runs large models on its own hardware and answers requests to them.
There is no model to download and no accelerator to reserve — the third time
this course has rented something instead of owning it.

Positive
: The platform was called **Vertex AI** until 2026 and is now the **Gemini
Enterprise Agent Platform**. The API is unchanged and the service is still
`aiplatform.googleapis.com`.

**Model Garden** is the catalogue: Google models, open models and partner
models, with the price and documentation next to each one. This course calls
Gemini.

### Settings, not code

```bash
python3 scripts/setup_gemini_env.py
```

That writes `app/.env`:

```
GOOGLE_GENAI_USE_VERTEXAI=True
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=global
DINO_MODEL=gemini-3.5-flash
```

There is **no API key**. The SDK signs each request with the credentials Cloud
Shell already has.

Negative
: `GOOGLE_CLOUD_LOCATION=global` is deliberate and is *not* what a production
service does. A named region says where the request is handled; `global` gives
that up in exchange for capacity. In a classroom, capacity is what fails first.

### The Google Gen AI SDK

A call has the same shape every time:

```python
from google import genai
from google.genai import types

client = genai.Client(vertexai=True, project="my-dinoquest", location="global")

answer = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Describe a dinosaur in one sentence.",
    config=types.GenerateContentConfig(
        system_instruction="You write for a children's game.",
        temperature=0.9,
    ),
)

print(answer.text)
```

### Let the model draw the dino

```bash
python3 scripts/connect_gemini.py
```

The model does not return a picture. It returns a grid of letters and a colour
for each letter, held to a **response schema**, and about forty lines of code
turn that into the PNG the game already loads.

Restart the app, type an idea into **Draw me a new dino**, and reload.

## Give the app a home
Duration: 0:30:00

**Cloud Run** runs containers and gives each one a public address. It starts
copies when requests arrive, stops them when they stop, and charges for the
time they ran — nothing while idle.

A **container** is your code, its runtime and its dependencies sealed into one
image. DinoQuest has no Dockerfile: the build reads `requirements.txt` and
`Procfile` and works out the rest.

### Deploy

```bash
python3 scripts/deploy_app.py
```

Four things happen: the source is uploaded, Cloud Build makes an image,
Artifact Registry keeps it, and Cloud Run starts a service and returns an HTTPS
address. The first deployment takes a few minutes.

Negative
: Two things change once it is deployed. The app no longer runs as **you** — it
runs as a **service account** that has been granted nothing, so it needs
`roles/datastore.user` and `roles/aiplatform.user`. And `app/.env` is a local
file that is not in the container, so the same settings must be set on the
service with `--set-env-vars`. The deploy script does both.

### Two things to expect

- **Cold starts.** When nothing is running, the first request waits for a copy
  to start. That is the price of not paying for idle capacity.
- **Revisions.** Every deployment makes a new one and the old ones stay. A
  rollback moves traffic, it does not rebuild, so it takes seconds.

Open the address and play a round. The leaderboard is the same Firestore
database your terminal was writing to, and the dino is drawn by the same model.
Nothing in the code changed to make that work.

## Cost and cleanup
Duration: 0:20:00

Four things make up the bill, and everyone is surprised by exactly one of them:

- **Compute time** — the container, while it is running
- **Storage** — the database and the stored image, whether or not anyone asks
- **Requests** — per call, including the model
- **Egress** — data leaving Google's network, which is the one nobody expects

Scaling to zero is not the same as costing zero: the image in Artifact Registry
and the rows in Firestore are still there.

Open the [billing report](https://console.cloud.google.com/billing) and find
the line items above in your own numbers.

### Delete the box, not the contents

A project is the box everything went in: one bill, one set of permissions, one
namespace. Deleting it removes the Cloud Run service, the container image, the
Firestore database and everything else, in one action.

Open [project settings](https://console.cloud.google.com/iam-admin/settings),
check the project name at the top, choose **Shut down** and confirm with the
project id.

Negative
: This is the one step that cannot be undone. A service, a database or an image
can be made again; a project id cannot be reused, and after the 30-day grace
period the contents are gone. Do this when you have finished.

Your **billing account** is not deleted — it belongs to you, not to the
project. Deleting what you stopped using is the habit that makes a budget alert
never fire.

## What's next
Duration: 0:10:00

You rented a machine, rented storage, and rented intelligence — the same
arrangement three times, which is the whole idea.

### Draw it

From memory, draw what you built: the project, the region, the container, the
database, the model, and who talks to whom. Structure matters, neatness does
not.

### Doing this without doing it by hand

Most of what you just built can be done for you, and having built it by hand is
what lets you tell whether the result is right.

**Google AI Studio** has a Build mode: describe an application and it writes
and deploys one. Each deployment creates a **Cloud Run service**, and if the
app needs to store something the agent offers to provision **Firestore** with
Firebase Authentication, or **Cloud SQL for PostgreSQL**, and wires it in. On
the free Starter Tier, Google creates and runs the project for you; to go
further you point it at your own project with billing enabled.

**Google Antigravity** is an agent platform for writing software — a desktop
app, a CLI, an IDE and an SDK over one agent. Two parts matter here. Through
**MCP** it can use the **Google Developer Knowledge MCP server**, the official
Google Cloud, Android and Firebase documentation, re-indexed within a day of
any change. And an **agent skill** — a folder with a `SKILL.md` plus any
scripts it needs — teaches it your way of working.

Positive
: Both do what you just did by hand. Knowing what a Cloud Run service, a
Firestore database and a service account are is what makes their output
reviewable rather than magic.

### What this course deliberately skipped

- **Identity and access** — service accounts, roles, least privilege, and how a
  process proves who it is without a stored credential
- **Failure and resilience** — zonal, regional and multi-regional, and what
  redundancy costs
- **Containers in depth** — images, layers, and writing your own Dockerfile
- **Infrastructure as code** — Terraform, and genuinely the next thing to learn
- **Networking, GKE, the data platform, CI/CD**

### Two habits worth keeping

1. Set a budget before you build, not after.
2. Delete what you stopped using, as a habit rather than an afterthought.
