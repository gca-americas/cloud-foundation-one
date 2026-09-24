:::section kicker="Structure" headline="What a project contains"
Every Google Cloud resource must belong to a **project**. A project serves as the foundational organizational entity for provisioning, configuring, and governing cloud resources.
:::

:::section kicker="Boundaries" headline="Project boundaries"
:::figure id="project-box" caption="Administrative and operational boundaries defined by a Google Cloud project."
:::

A Google Cloud project defines five primary boundaries:
- **Billing aggregation**: Resource usage is metered and reported per project, enabling teams to isolate development, staging, and production costs.
- **Identity and Access Management (IAM)**: Permissions granted at the project level apply to all resources contained within the project.
- **Service API enablement**: Google Cloud APIs are disabled by default and must be explicitly enabled per project.
- **Quotas and rate limits**: Resource allocations and API request quotas are enforced at the project boundary.
- **Lifecycle management**: Deleting a project permanently deletes all compute services, container images, and databases inside it.

:::key
When troubleshooting an issue in Google Cloud, verify three settings in order: the active project ID, whether the target service API is enabled, and the caller's IAM permissions.
:::
:::

:::section kicker="Identifiers" headline="Project identifiers"
Each Google Cloud project is identified by three attributes:

:::figure id="three-names" caption="The project ID is the globally unique identifier used in CLI commands and SDK configurations."
:::

- **Project Name**: A human-readable display label that can be modified at any time.
- **Project ID**: A globally unique string identifier (for example, `my-dinoquest-4821`) used in `gcloud` commands, client libraries, and resource URLs.
- **Project Number**: A system-generated numeric identifier used internally by IAM policies and Google-managed service accounts.

:::warn
A project ID is permanent and cannot be modified after creation. If a requested project ID is already taken globally, the Google Cloud console appends a numeric suffix automatically.
:::
:::

:::section kicker="Billing" headline="Billing accounts"
A **Cloud Billing account** is an organization-level or user-level financial resource that exists outside individual projects. You link one or more projects to a billing account to pay for resource consumption.

:::figure id="billing-link" caption="A single Cloud Billing account can be linked to multiple Google Cloud projects."
:::

While a project can be created without a billing account, most Google Cloud services require an active linked billing account before resources can be provisioned.

:::console url="https://console.cloud.google.com/billing?cloudshell=true" label="Open Cloud Billing in the console" note="View your billing accounts and linked projects."
:::

:::note
Separating billing accounts from projects allows organizations to let engineering teams create isolated projects while consolidating invoices under a central billing account.
:::
:::
