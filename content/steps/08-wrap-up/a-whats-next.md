:::section kicker="Overview" headline="AI developer tools"
In this course, you provisioned and connected each cloud component—project, billing, region, Firestore, Gemini, and Cloud Run—step by step to understand how the underlying architecture operates. In day-to-day development, AI-assisted developer platforms can scaffold and deploy these same Google Cloud resources automatically. Because you understand the role of each component, you can review, audit, and govern what automated tools provision.
:::

:::section kicker="Prototyping" headline="Google AI Studio"
**Google AI Studio** provides an interactive environment for prototyping with Gemini models. Its **Build mode** generates full-stack web applications from natural-language specifications and deploys them directly to Google Cloud.

:::figure id="ai-studio-to-cloud" caption="Google AI Studio Build mode provisions Cloud Run and managed databases using the same architecture built in this course."
:::

When you deploy an application from Google AI Studio, it provisions the exact architectural components you configured manually:
- **Cloud Run service**: Packages the generated application into a container and deploys it as an auto-scaling Cloud Run service.
- **Managed database**: Provisions **Firestore** (with Firebase Authentication) or **Cloud SQL for PostgreSQL** when the application requires persistent data storage.
- **Project and billing boundary**: Runs initial prototypes in a Google-managed Starter Tier environment, and lets you attach your own Google Cloud project and billing account when moving to production.

:::note
When deploying generated applications, always verify that API credentials and model calls execute server-side on Cloud Run rather than exposing keys in client-side browser code.
:::
:::

:::section kicker="Development" headline="Google Antigravity"
**Google Antigravity** is an agentic software development platform that operates across a desktop application, CLI, IDE integration, and SDK using a unified reasoning agent.

:::figure id="antigravity-stack" caption="Google Antigravity interfaces connected to documentation and project skills via MCP."
:::

Two extensibility mechanisms make agentic coding reliable for Google Cloud engineering:
- **Authoritative documentation via MCP**: Using the open **Model Context Protocol (MCP)**, Antigravity connects to the **Google Developer Knowledge MCP server**, giving the agent real-time access to current Google Cloud, Firebase, and Android documentation rather than relying on static training cutoffs.
- **Reusable engineering standards (`SKILL.md`)**: Teams codify architectural patterns, security rules, and deployment scripts inside an agent skill directory (`SKILL.md` plus supporting scripts). Any agent working in the repository automatically follows those instructions.

:::key
AI development tools accelerate provisioning and code generation, while your understanding of projects, IAM service accounts, Firestore, and Cloud Run enables you to verify and operate the resulting system safely.
:::
:::

:::section kicker="Next steps" headline="Further Google Cloud topics"
To build on the foundations covered in this course, explore the following Google Cloud topics next:

| Topic | Architectural Role and When to Adopt |
|---|---|
| **Identity and Access Management (IAM)** | Deepen least-privilege access control using custom service accounts, IAM conditions, and Workload Identity Federation. |
| **High availability and multi-region resilience** | Architect zonal, regional, and multi-regional deployments when uptime SLAs justify the additional cost. |
| **Custom container images (`Dockerfile`)** | Write explicit multi-stage Dockerfiles when applications require OS-level packages or custom build steps beyond buildpacks. |
| **Infrastructure as Code (Terraform)** | Define projects, APIs, IAM bindings, databases, and Cloud Run services declaratively in version-controlled Terraform configurations. |
| **Virtual Private Cloud (VPC) and Cloud Load Balancing** | Configure private networking, Cloud Armor WAF policies, custom domains, and global load balancers. |
| **Google Kubernetes Engine (GKE)** | Orchestrate multi-container microservice architectures when workloads outgrow single-service containers. |
| **Data analytics with BigQuery** | Stream operational events into BigQuery for petabyte-scale SQL analytics and reporting. |
| **Continuous Integration and Delivery (CI/CD)** | Trigger automated Cloud Build testing and Cloud Run deployments directly from Git commits. |
:::
