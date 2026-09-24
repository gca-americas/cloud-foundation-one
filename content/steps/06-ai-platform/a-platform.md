:::section kicker="Overview" headline="The Gemini Enterprise Agent Platform"
Google Cloud hosts foundation models on managed accelerator infrastructure and exposes them through standard network APIs. Your application sends a prompt request over HTTPS and receives a model response without downloading model weights, provisioning GPUs, or managing inference servers.

:::figure id="rent-intelligence" caption="On-demand consumption applied across compute, database storage, and foundation models."
:::

:::key
Calling a hosted foundation model follows the same serverless consumption pattern as managed compute and storage: requests are authenticated via IAM, metered per token, and governed by your project boundary.
:::
:::

:::section kicker="Economics" headline="Training versus calling a model"
Training a frontier foundation model requires thousands of specialized accelerators operating for weeks, petabyte-scale curated datasets, and dedicated machine learning infrastructure teams.

:::figure id="own-a-model" caption="Comparison between training custom foundation models and calling managed APIs."
:::

By consuming hosted foundation models over an API, engineering teams access state-of-the-art multimodal reasoning immediately while paying only for the input and output tokens processed by their application.
:::

:::section kicker="Inference" headline="Calling hosted models"
A hosted model on Google Cloud processes stateless inference requests over the network and bills solely for the volume of input and output tokens consumed. When your application makes no requests, inference costs are zero.

:::figure id="model-modalities" caption="Supported input and output modalities across Google Cloud foundation model families."
:::

**Gemini** models natively process multimodal inputs—including text, images, audio, video, and PDF documents—and generate text, structured JSON, images, or audio. Specialized foundation model families in the platform target dedicated modalities: **Imagen** for image generation and editing, **Veo** for video generation, and **Lyria** for music generation.

:::key
Integrating a hosted model requires selecting the appropriate model identifier, sending a structured request via the SDK, and parsing the response.
:::
:::

:::section kicker="Catalog" headline="Model Garden"
**Model Garden** is the centralized repository of more than 200 foundation models available on Google Cloud, providing model cards, benchmark documentation, context window specifications, and per-token pricing.

:::figure id="model-garden" caption="First-party Google models, open-weight models, and partner models in Model Garden."
:::

Model Garden organizes models into three categories:
- **Google models**: First-party foundation models including **Gemini**, **Imagen**, **Veo**, and **Lyria**, available immediately through serverless API endpoints.
- **Open models**: Open-weight models such as **Gemma**, Llama, and Mistral, which can be called via managed endpoints or deployed onto dedicated endpoints.
- **Partner models**: Third-party foundation models accessible through unified Google Cloud endpoints and consolidated under your Cloud Billing account.

:::note
Always review a model's documentation card in Model Garden before production deployment to verify its context window limits, supported modalities, token pricing, and release lifecycle stage (Generally Available vs. Preview).
:::

In this course, DinoQuest calls **Gemini** (`gemini-3.5-flash`) to generate structured JSON representing custom character sprites.
:::

:::section kicker="Lifecycle" headline="Evaluation, grounding, and tuning"
Beyond single API calls, the **Gemini Enterprise Agent Platform** provides managed tooling across the full generative AI lifecycle:

:::figure id="model-cycle" caption="Platform capabilities supporting prompt design, grounding, evaluation, and monitoring."
:::

- **Model discovery (Model Garden)**: Browse and compare available foundation models.
- **Interactive prototyping (Agent Studio)**: Design system instructions and compare prompt variations in the console before writing application code.
- **Application integration (Google Gen AI SDK)**: Call Gemini models programmatically from Python, Go, Node.js, or Java.
- **Grounding and adaptation**: Connect model responses to authoritative external data using **Grounding with Google Search** or **RAG Engine** over private enterprise documents, or customize model behavior via supervised **fine-tuning**.
- **Quality evaluation (Gen AI Evaluation Service)**: Benchmark model outputs quantitatively against reference datasets and rubric metrics whenever prompts or models change.
- **Production inference and safety**: Serve real-time online requests or high-volume **batch inference**, monitor output drift, and enforce prompt injection and content safety filters with **Model Armor**.

:::note
When a model lacks domain-specific or up-to-date facts, use **grounding** (retrieval-augmented generation) before considering model fine-tuning. Grounding injects authoritative context at request time without retraining weights.
:::
:::

:::section kicker="Architecture" headline="Models and agents"
While a foundation model responds to a single request, an **agent** combines a reasoning model with external tools, multi-turn memory, and orchestration logic to pursue multi-step goals autonomously.

:::figure id="agent-pillars" caption="Core architectural pillars of the Gemini Enterprise Agent Platform."
:::

The platform organizes agent infrastructure into four pillars:
- **Build**: Develop multi-agent systems in code using the open-source **Agent Development Kit (ADK)**, prototype visually in **Agent Studio**, or start from prebuilt templates in **Agent Garden**.
- **Scale**: Execute agents in production on **Agent Runtime**, managing conversation state with **Sessions** and cross-session recall with **Memory Bank**.
- **Govern**: Catalog organizational agents and tools in **Agent Registry**, assign least-privilege credentials via **Agent Identity**, control traffic through **Agent Gateway**, and inspect inputs and outputs with **Model Armor**.
- **Optimize**: Evaluate multi-turn task completion with **Agent Evaluation** and inspect execution traces and tool latency using **Agent Observability**.

Agents connect to external data sources and tools using the open **Model Context Protocol (MCP)** and collaborate with other agents across runtimes using the **Agent2Agent (A2A)** protocol.

:::note
**Gemini Enterprise** is Google's turnkey workplace assistant and enterprise search product for end users, whereas the **Gemini Enterprise Agent Platform** (formerly **Vertex AI**) is the developer platform where engineering teams build, deploy, and govern custom AI applications and agents.
:::
:::

:::section kicker="Operations" headline="Region, permissions, and pricing"
Calling a hosted foundation model is governed by the same operational controls as every other Google Cloud service:
- **Endpoint location**: Requests are routed to a regional endpoint (such as `us-central1`) for strict data locality or to the `global` endpoint for dynamic multi-region capacity routing.
- **Identity and Access Management**: API calls are authenticated using Application Default Credentials (your user identity in Cloud Shell, or the attached service account identity on Cloud Run with `roles/aiplatform.user`).
- **Consumption billing**: Usage is metered per input and output token, billed to the project's linked Cloud Billing account, and monitored by your project budget alerts.
:::
