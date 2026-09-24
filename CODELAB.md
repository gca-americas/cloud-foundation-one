author: Christina Lin
authors: Christina Lin
summary: Take a small game from a laptop to Google Cloud — a project, a region, a managed database, a hosted model, and a serverless deployment — guided by the interactive Cloud 101 Workbench.
id: cloud-foundation-one
status: Published
feedback link: https://github.com/gca-americas/cloud-foundation-one/issues

# Your First Course on Google Cloud 2026

## Introduction

This codelab introduces the foundational architecture of Google Cloud by guiding you through migrating **DinoQuest**—a web-based runner game with a player leaderboard—from a single local Python process to a publicly accessible, serverless production deployment. Along the way, you work with the core building blocks required by modern cloud applications: a Google Cloud project boundary, Cloud Billing and budget guardrails, a physical data center region, a managed document database, a hosted foundation model, and an auto-scaling container runtime.

### The scenario

**DinoQuest** is a Python web application that serves a browser game over `localhost:8080` and records player high scores. While running a local server in a terminal is sufficient for initial development, four operational limitations prevent external users from playing the game:

- **Process fragility**: The application terminates as soon as the terminal session closes or Cloud Shell shuts down, and every leaderboard score held in process memory is wiped on restart.
- **Private loopback addressing**: `localhost:8080` only accepts traffic originating on the same machine, and Cloud Shell Web Preview requires authentication with your personal Google account.
- **Physical infrastructure operations**: Serving public internet traffic continuously requires redundant power, cooling, physical network routing, and automated hardware replacement.
- **Capacity and cost management**: Purchasing physical servers sized for peak midday traffic leaves hardware sitting idle during off-peak hours while still incurring capital and operational expenses.

To resolve these limitations without purchasing or managing servers, you migrate DinoQuest to Google Cloud—persisting leaderboard records in **Firestore**, generating custom dinosaur sprites using **Gemini** on the **Gemini Enterprise Agent Platform**, and deploying the service as an auto-scaling container on **Cloud Run**.

### What you learn

- **Cloud economics and the consumption model**: Understand how on-demand provisioning, pay-per-use metering, and provider-managed infrastructure replace upfront hardware ownership across compute, storage, and AI inference.
- **Projects, billing, and cost guardrails**: Organize resources inside a Google Cloud **project**, link an external **Cloud Billing account**, configure a **budget alert** that accounts for asynchronous billing delays, and enable project-scoped service APIs.
- **Global infrastructure and region selection**: Evaluate how physical data centers, **regions**, and Google's private subsea fiber network determine round-trip network latency, and balance user proximity against data residency and service availability.
- **Core service taxonomy and managed databases**: Map cloud products into five foundational categories (*Compute*, *Object Storage*, *Databases*, *Networking*, and *AI*), distinguish between unstructured files and structured records, and persist application state in **Firestore**.
- **Hosted models on the Gemini Enterprise Agent Platform**: Authenticate to **Gemini** using Application Default Credentials (ADC) rather than static API keys, understand when to use regional versus global endpoints, and enforce structured JSON outputs to generate custom game sprites.
- **Serverless containers and production security**: Package application source code into an immutable container image using **Cloud Build** and **Artifact Registry**, assign least-privilege IAM roles to a dedicated **Cloud Run** service account, and deploy a service that scales to zero when idle.

## Setup

### Claim your workshop credits

If you are attending an instructor-led workshop or event, redeem the Google Cloud credit link provided by your instructor before starting. Redeeming the credit creates the active Cloud Billing account that you will link to your project in the workbench.

### Open Cloud Shell

**Google Cloud Shell** is a browser-accessible Linux environment preconfigured with the Google Cloud CLI (`gcloud`), Python, Node.js, `uv`, and `git`, already authenticated with your Google account.

1. Open the [Google Cloud console](https://console.cloud.google.com/).
2. Click **Activate Cloud Shell** (the terminal icon in the top navigation bar) to open a terminal session at the bottom of your browser.

### Launch the Cloud 101 Workbench

In your Cloud Shell terminal, clone the course repository and start the **Cloud 101 Workbench**:

```bash
git clone https://github.com/gca-americas/cloud-foundation-one.git
cd cloud-foundation-one
./scripts/start.sh
```

When the startup script completes, it launches the workbench server in the background (returning your Cloud Shell prompt immediately) and outputs the local workbench address on port **4800**:

```console
  Cloud 101 Workbench (running in background, PID 12345)
  http://localhost:4800
  Stop anytime with: ./scripts/stop.sh
```

To open the workbench UI in your browser:

1. Click **Web Preview** in the top-right corner of the Cloud Shell toolbar.
2. Select **Change port**, enter **4800**, and click **Change and Preview**.

If you ever need to stop the background workbench server (and any running DinoQuest game process), run:

```bash
./scripts/stop.sh
```

### How the Cloud 101 Workbench is set up

Running `./scripts/start.sh` provisions and launches a self-contained learning environment in the background of your Cloud Shell instance:

- **Python environment and dependencies (`uv`)**: The startup script creates an isolated Python virtual environment (`.venv`) and runs `uv sync` to install the workbench backend (FastAPI and Uvicorn) alongside the libraries used by the DinoQuest application (`google-cloud-firestore` and `google-genai`).
- **Interactive frontend build (`web/dist`)**: On its first run, the script installs Node.js packages and compiles the React and Vite single-page application into `web/dist`, bundling the interactive architecture diagrams, cost and latency simulators, and step-by-step course curriculum from `content/`.
- **Background daemon and process management (`runs/`)**: The script launches the FastAPI server (`server.main:app`) in the background, writes its process ID to `runs/workbench.pid` and logs to `runs/workbench.log`, and waits until `localhost:4800` is accepting connections before returning control of your terminal. Running `./scripts/stop.sh` terminates both the background workbench server and any spawned DinoQuest process (`runs/app.pid`).
- **Single-port reverse proxy (`localhost:4800`)**: The FastAPI server binds to port `4800` to serve the workbench UI and API. Whenever you run the DinoQuest game server (`app/main.py` on port `8080`), the workbench reverse-proxies requests under `/app/*` to the student application process. This same-origin proxy allows you to preview and play DinoQuest directly inside the workbench browser tab while exposing only port `4800` through Cloud Shell Web Preview.
- **Live Google Cloud verification engine**: Because the FastAPI backend runs inside your authenticated Cloud Shell session, it shares your active `gcloud` CLI configuration and Application Default Credentials (ADC). When you complete a task and click **Verify**, the workbench runs live, read-only inspections against Google Cloud APIs to confirm your project configuration, billing linkage, budget alerts, enabled APIs, Firestore documents, Gemini credentials, and Cloud Run deployment in real time.

<aside class="special">
<p><strong>You no longer need this codelab once the Cloud 101 Workbench opens in your browser.</strong> Because the workbench provides the reading material, interactive simulators, live DinoQuest preview (<code>/app</code>), and real-time Google Cloud verification checks in a single browser tab, you will complete the remainder of the workshop directly inside the <strong>Cloud 101 Workbench</strong> on port <code>4800</code>. You can use the final page of this codelab as a conceptual reference and architectural summary.</p>
</aside>

## Summary

<aside class="special">
<p><strong>Work directly in the Cloud 101 Workbench (<code>http://localhost:4800</code>) to complete all hands-on exercises.</strong> The <strong>Cloud 101 Workbench</strong> tab you opened in the previous step guides you step by step through running DinoQuest, provisioning your Google Cloud project and billing guardrails, creating a Firestore database, integrating Gemini sprite generation, and deploying to Cloud Run. Each module in the workbench includes interactive concepts, guided exercises, and live read-only checks against your Google Cloud account. Use the sections below as a comprehensive conceptual reference and summary of the architectural principles covered in the workbench.</p>
</aside>

### Local processes versus cloud infrastructure

A local application running in a development terminal combines static file serving and in-memory state inside a single operating system process. While convenient during development, a local terminal process has two fundamental architectural constraints:

- **Loopback network isolation**: Binding a server to `localhost` (`127.0.0.1`) restricts network traffic to the local loopback interface on the host machine. Even when accessed through a developer tunnel such as Cloud Shell Web Preview, access is gated behind personal session authentication rather than a public HTTPS endpoint.
- **Volatile process memory**: Any data structures held in process memory—such as a Python list storing leaderboard scores—exist only for the lifetime of that process. Terminating, restarting, or crashing the process immediately erases all in-memory state.

Transitioning a prototype into a public web service requires four operational capabilities: infrastructure that stays on independently of a developer's laptop, a publicly routable HTTPS address, continuous physical data center maintenance (power, cooling, networking, and hardware replacement), and a governance boundary for cost accounting and access control.

### Cloud computing and the consumption model

Cloud computing replaces upfront capital investment in physical servers with the on-demand consumption of compute, storage, and AI platform services over the network.

When an organization owns physical servers, capacity must be procured weeks or months in advance and sized to handle the highest projected traffic spike. During low-traffic hours (such as overnight), that hardware sits idle while continuing to incur depreciation, power, cooling, and facility costs.

| Operational Dimension | Owned Infrastructure | Cloud Infrastructure |
|---|---|---|
| **Capacity sizing** | Provisioned upfront for peak projected demand | Scaled dynamically to match active traffic |
| **Provisioning lead time** | Weeks or months of hardware procurement | Seconds via API or CLI |
| **Planning horizon** | Multi-year capital capacity planning | Real-time elastic adjustment |
| **Hardware maintenance** | Internal engineering teams replace failed components | Google Cloud manages physical hardware and host patching |
| **Cost structure** | Upfront capital expenditure (CapEx) | Consumption-based operating expense (OpEx) |

Three characteristics distinguish cloud computing from traditional fixed-term server hosting:

1. **On-demand self-service**: Compute, storage, and foundation models are provisioned programmatically in seconds without manual contracts or procurement workflows.
2. **Consumption-based metering**: Services bill by the second, gigabyte, or API request. Scaling a resource to zero or deleting it immediately stops resource charges.
3. **Provider-managed operations**: The cloud provider operates the physical facilities, power distribution, cooling, physical security, networking, and hardware replacement.

Cloud infrastructure is most cost-effective when demand is variable, spiky, uncertain, or growing—characteristic of nearly all new applications. Owned hardware can become cost-competitive only when a workload is large, continuous, and highly predictable over multi-year periods with consistently high utilization.

### Projects, billing, and cost governance

Every Google Cloud resource belongs to exactly one **project**. The project acts as the foundational organizational and security container, establishing five boundaries around everything inside it:

- **Billing aggregation**: All resource consumption inside a project reports out together, enabling organizations to separate development, staging, and production costs cleanly.
- **Identity and Access Management (IAM)**: Permissions granted at the project boundary govern who and what can access the resources inside that project.
- **Service API enablement**: All service APIs are disabled by default in a new project and must be explicitly switched on before use. Enabling an API is free; charges apply only when resources are consumed.
- **Quotas and rate limits**: Resource allocations and API request limits are tracked and enforced per project.
- **Lifecycle management**: Deleting a project deprovisions every service, container image, and database inside it in a single operation.

Every Google Cloud project has three distinct identifiers:

- **Project Name**: A human-readable display label that can be changed at any time.
- **Project ID**: A globally unique, immutable string identifier used in CLI commands, SDK configurations, and URLs. Once created, a Project ID can never be changed or reused.
- **Project Number**: A system-generated integer assigned by Google Cloud and used internally by IAM policies and managed service accounts.

A **Cloud Billing account** is a separate financial resource that exists outside individual projects. One billing account can be linked to multiple projects, allowing organizations to let developers create isolated projects while consolidating payment under a single billing account.

A **budget alert** monitors monthly spend on a billing account or project and sends email notifications when actual or forecasted spend crosses configured thresholds. Two operational properties of budget alerts are critical to understand:

- **Alerts notify; they do not cap spending**: Crossing a budget threshold sends an email notification but never shuts down running services or blocks requests.
- **Billing telemetry arrives in asynchronous batches**: Because cloud services report usage metrics in batches ranging from an hour to a day, a budget alert evaluates historical reported spend rather than instantaneous usage. Setting a low threshold ($5 or $10) and deprovisioning unused resources immediately protects against delayed notifications.

### Global infrastructure and region selection

Google Cloud resources execute inside physical facilities distributed globally:

- **Data centers** are physical buildings housing thousands of servers, storage arrays, power systems, and cooling equipment.
- **Regions** are geographic areas containing multiple data centers connected by high-speed fiber links (such as `us-central1` in Iowa, `europe-west2` in London, or `asia-northeast1` in Tokyo).

Traffic moving between Google Cloud regions travels over Google's private global fiber network—including dedicated subsea cables—rather than traversing the public internet, improving throughput and reliability.

Because light travels through optical fiber at roughly 200,000 kilometers per second, physical distance imposes a hard lower bound on network round-trip latency regardless of server speed:

| Client Location | Application Region | Typical Round-Trip Latency |
|---|---|---|
| London | London (`europe-west2`) | ~5 ms |
| London | Northern Virginia (`us-east4`) | ~80 ms |
| London | Sydney (`australia-southeast1`) | ~250 ms |

When selecting a region for your application and database, apply three rules in order:

1. **Data residency and compliance first**: If legal or regulatory rules require data to remain within a specific jurisdiction (such as patient records in Germany), select a region inside that jurisdiction (`europe-west3` in Frankfurt).
2. **Service availability**: Verify that the specific cloud products, hardware accelerators, or foundation models your workload requires are offered in the target region.
3. **Proximity to end users**: Within those constraints, always select the region closest to your **end users**—not the region closest to the developer—so every user request travels the shortest possible physical distance. When users are distributed across multiple continents, deploy across multiple regions behind a global load balancer.

### Core service taxonomy and compute models

Although Google Cloud offers more than two hundred products, almost all application architectures are built from five durable service categories:

| Architectural Need | Service Category | Role in DinoQuest |
|---|---|---|
| **Executing application code** | **Compute** | **Cloud Run** (supported by **Cloud Build** and **Artifact Registry**) |
| **Storing structured application state** | **Databases** | **Firestore** |
| **Generating intelligent outputs** | **AI and Machine Learning** | **Gemini** on the **Gemini Enterprise Agent Platform** |
| **Storing unstructured binary files** | **Object Storage** | **Cloud Storage** *(not needed when static assets travel inside the container)* |
| **Routing and securing traffic** | **Networking** | **Virtual Private Cloud & Load Balancing** *(handled automatically by Cloud Run defaults)* |

Within storage, distinguishing between **object storage** and **databases** prevents common architectural bottlenecks:

- **Object storage (files)** treats each item as an opaque binary blob (images, videos, PDFs, backups). You upload and retrieve the entire object as a single unit without querying or modifying fields inside it.
- **Databases (records)** store structured records with fields that can be indexed, filtered, sorted, and updated individually (user profiles, leaderboard scores, order histories).

Within compute, Google Cloud offers three primary execution models differentiated by how much underlying infrastructure you manage:

- **Virtual Machines (Compute Engine)**: You rent dedicated virtual machines and remain responsible for the guest operating system, security patches, disk management, and capacity scaling.
- **Kubernetes Clusters (GKE)**: You orchestrate multi-container microservice fleets across a cluster of nodes when workloads require complex internal networking or specialized hardware scheduling.
- **Serverless Containers (Cloud Run)**: You supply a container image or source code; Google Cloud manages all underlying infrastructure, scales container instances automatically from zero to match request traffic, and bills only while requests are actively processed.

### Managed databases and Firestore

To make application state durable across server restarts, crashes, and container scale-downs, state must be moved out of process memory into an external managed database. Google Cloud provides specialized databases tailored to distinct data shapes:

| Database Service | Data Model and Strengths | Primary Workload Fit |
|---|---|---|
| **Firestore** | Serverless NoSQL document database that scales to zero | Web and mobile application state without managing database servers |
| **Cloud SQL** | Managed PostgreSQL, MySQL, and SQL Server instances | Relational data requiring SQL joins, foreign keys, and ACID transactions |
| **Spanner** | Globally distributed relational database with horizontal scaling | Mission-critical financial and global transactional workloads |
| **Bigtable** | Wide-column NoSQL store optimized for high-throughput writes | Time-series telemetry, IoT streams, and high-frequency operational data |
| **BigQuery** | Serverless enterprise data warehouse for analytical SQL | Petabyte-scale analytics, business intelligence, and historical reporting |

For an application like DinoQuest, **Firestore** provides durable document persistence in the chosen region without requiring dedicated database instances, disk sizing, or idle hourly compute charges. Decoupling data access behind a clean storage interface allows an application to switch from an in-memory list to Firestore without modifying HTTP route handlers or frontend code.

### Hosted foundation models and the Gemini Enterprise Agent Platform

Calling a foundation model on Google Cloud follows the same serverless consumption pattern as managed compute and databases: Google operates the accelerators and model weights, and your application sends stateless requests over HTTPS metered per token.

Google Cloud's unified AI developer platform—formerly called **Vertex AI** and now the **Gemini Enterprise Agent Platform** (distinct from **Gemini Enterprise**, the turnkey workplace assistant)—organizes capabilities around three layers:

1. **Model Garden**: A unified catalog of over 200 models, including **Google models** (**Gemini** for multimodal reasoning, **Imagen** for images, **Veo** for video, **Lyria** for music), **open-weight models** (**Gemma**, Llama, Mistral), and **partner models**. Reviewing a model card in Model Garden reveals its context window, supported modalities, pricing per million tokens, and lifecycle status (Generally Available vs. Preview).
2. **The Generative AI Lifecycle**: Production AI systems extend single model calls with **Agent Studio** for prompt design, **Google Gen AI SDK** (`google-genai`) for unified client integration, **grounding** (via Google Search or RAG Engine over enterprise documents) to inject authoritative facts without retraining weights, **fine-tuning** for behavior adaptation, the **Gen AI Evaluation Service** to score output quality quantitatively, and **Model Armor** to screen for prompt injection and policy violations.
3. **Autonomous Agents**: While a model answers a single prompt, an **agent** combines a reasoning model with multi-turn memory and external tools across four platform pillars:
   - **Build** with the open-source **Agent Development Kit (ADK)**, **Agent Studio**, and **Agent Garden**.
   - **Scale** on **Agent Runtime** with **Sessions** and **Memory Bank**.
   - **Govern** using **Agent Registry**, **Agent Identity**, **Agent Gateway**, and **Model Armor**.
   - **Optimize** with **Agent Evaluation** and **Agent Observability**, connecting to tools via the **Model Context Protocol (MCP)** and collaborating with other agents via **Agent2Agent (A2A)**.

When integrating Gemini into a cloud application using the **Google Gen AI SDK**, three architectural practices ensure reliability and security:

- **Authenticate with Application Default Credentials (ADC), not static API keys**: Setting `vertexai=True` instructs the SDK to sign requests using the caller's Google Cloud IAM identity rather than embedding fragile API keys in code.
- **Understand regional versus global endpoints**: Production workloads with data locality requirements pin requests to a specific region (`us-central1`), whereas the `global` endpoint dynamically routes requests across available regions to maximize quota capacity during high concurrency.
- **Enforce structured outputs with a response schema**: Passing a JSON schema (`response_schema`) in the request configuration constrains the model's decoder so it is guaranteed to return valid, machine-readable JSON matching the exact structure your code expects.

### Serverless container deployment on Cloud Run

Deploying an application to **Cloud Run** packages the application into a **container image**—an immutable artifact containing the source code, language runtime, and library dependencies—so it executes identically on any machine. Using Google Cloud buildpacks, source deployments automatically inspect `requirements.txt` and `Procfile` to build and deploy the service across four pipeline stages:

1. **Upload**: Source files are uploaded to **Cloud Build**.
2. **Build**: **Cloud Build** installs dependencies and constructs the container image layers.
3. **Store**: The built image is stored in **Artifact Registry**.
4. **Run**: **Cloud Run** launches the container and provisions a public HTTPS `.run.app` endpoint.

Understanding four operational behaviors of Cloud Run is essential for production engineering:

- **Scale to zero and cold starts**: By default (`min-instances=0`), Cloud Run terminates all container instances when no traffic is arriving so idle compute cost is zero. The first request arriving at an idle service experiences a brief startup pause (*cold start*) while a new container instance initializes.
- **Immutable revisions and instant rollbacks**: Every deployment creates an immutable **revision**. Because previous revisions remain stored, rolling back a faulty deployment is an instantaneous routing change rather than a rebuild.
- **Dedicated IAM service accounts**: On Cloud Run, the application no longer executes under a developer's personal identity; it runs as a dedicated **service account** that follows the principle of least privilege and must be explicitly granted the IAM roles it requires (`roles/datastore.user` for Firestore and `roles/aiplatform.user` for Gemini).
- **Externalized runtime configuration**: Local `.env` files are never committed or baked into container images; environment variables (`GOOGLE_GENAI_USE_VERTEXAI`, `GOOGLE_CLOUD_LOCATION`, `DINO_MODEL`) are configured directly on the Cloud Run service definition.

### AI developer tools, billing dimensions, and resource cleanup

Once you understand how projects, IAM service accounts, Firestore, Gemini, and Cloud Run fit together, AI-assisted development tools can automate the scaffolding and deployment of those exact components:

- **Google AI Studio (Build mode)** generates full-stack applications from natural-language prompts and deploys them directly to **Cloud Run** with **Firestore** or **Cloud SQL**, keeping API credentials server-side.
- **Google Antigravity** provides an agentic software engineering platform across desktop, CLI, IDE, and SDK interfaces. By connecting to the **Google Developer Knowledge MCP server** for up-to-date official documentation and reading project-specific **`SKILL.md`** instructions, Antigravity follows your team's architectural standards while you review and govern the infrastructure it produces.

When evaluating the monthly Cloud Billing invoice for a serverless architecture, costs break down into four distinct dimensions:

1. **Compute duration**: CPU and memory time consumed by **Cloud Run** while actively processing requests ($0 when idle).
2. **Persistent storage**: Gigabytes stored in **Firestore** (documents and indexes) and **Artifact Registry** (container images), which accrue storage charges continuously even when request traffic is zero.
3. **Requests and tokens**: Document read/write operations in **Firestore** and input/output tokens processed by **Gemini**.
4. **Network egress**: Data transferred out of Google Cloud's network to clients on the public internet.

Because all compute services, databases, and container registries created during this course reside inside a single Google Cloud project boundary, **shutting down the project** deletes every provisioned resource at once and stops all ongoing storage and compute charges—while leaving your external **Cloud Billing account** intact for future projects.
