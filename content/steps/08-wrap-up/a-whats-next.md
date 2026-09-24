:::section kicker="Overview" headline="AI developer tools"
You built each piece deliberately, one at a time. Most of it can now be done
for you — and the reason to have built it by hand is that when a tool does it,
you can tell what it made and whether it is right.
:::

:::section kicker="Prototyping" headline="Google AI Studio"
AI Studio is where you try a model without writing anything. Its **Build mode**
goes further: describe an application and it writes one, then deploys it.

:::figure id="ai-studio-to-cloud" caption="The same pieces this course built, provisioned for you."
:::

What happens when you press deploy is the thing to notice:

- **A Cloud Run service.** Each deployment creates one. The same serverless
  hosting you used earlier, with the same scaling to zero.
- **A database, if the app needs one.** The agent works out that it needs to
  store something and offers to set it up — **Firestore** with Firebase
  Authentication, or **Cloud SQL for PostgreSQL**, provisioned and wired in.
- **Somewhere to put it.** On the free Starter Tier, Google creates and runs
  the project for you — you never see it, and there is no billing account. To
  go further you point it at **your own project**, with billing enabled, and it
  deploys there instead.

:::note
Your API key stays server-side on Cloud Run rather than being shipped to the
browser. That is worth checking in anything that generates code for you, not
assuming.
:::

The Starter Tier has limits worth knowing before a workshop: a couple of
services, a single region, and accounts that already have Google Cloud billing
are not eligible for it.
:::

:::section kicker="Development" headline="Google Antigravity"
Antigravity is an agent platform for writing software, offering a desktop app, CLI, IDE, and SDK over a single agent.

:::figure id="antigravity-stack" caption="A desktop app, a CLI, an IDE and an SDK, over one agent."
:::

Key capabilities matter for cloud engineering work:

**It can read the documentation properly.** Through **MCP**, an open protocol
for connecting agents to tools and data, it can use the **Google Developer
Knowledge MCP server** — the official documentation for Google Cloud, Android
and Firebase, re-indexed within a day of any change. That is the difference
between an agent recalling what a flag did last year and one reading what it
does now. You add it from the MCP store, or by naming it in the agent's
configuration.

**It can be taught your way of working.** An **agent skill** is a folder with a
`SKILL.md` describing when to use it, plus any scripts and examples it needs.
Drop one into a project and every agent working there follows it.

:::key
Both of these do what you just did by hand. Knowing what a Cloud Run service,
a Firestore database and a service account are is what makes their output
reviewable rather than magic.
:::
:::

:::section kicker="Next steps" headline="Further Google Cloud topics"
Each of these topics builds on the foundation from this course.

| Topic | Why, and when you will need it |
|---|---|
| **Identity and access** | Service accounts, roles and least privilege. The deploy granted the roles for you. The first thing to learn next. |
| **Failure and resilience** | Zonal, regional and multi-regional. Redundancy is bought deliberately; most projects should not buy it. |
| **Containers in depth** | Images, layers and writing a Dockerfile. The buildpack did it for you. |
| **Infrastructure as code** | Terraform. Genuinely the next thing after this course. |
| **Networking** | VPCs, load balancers, private connectivity. The defaults were right for you. |
| **GKE** | When one container is not enough, and what a cluster costs. |
| **The data platform** | BigQuery and pipelines — a different course and a whole career. |
| **CI/CD** | Deploying from a repository rather than from a terminal. |
:::
