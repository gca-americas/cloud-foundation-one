:::section kicker="Defaults" headline="Service API switches"
In a newly created Google Cloud project, almost all service APIs are disabled by default. Calling a service before enabling its API returns a `SERVICE_DISABLED` (`403 PERMISSION_DENIED`) error that identifies the required API endpoint and project ID.

:::figure id="api-switches" caption="Service APIs are enabled per project and remain isolated from other projects."
:::

Requiring explicit API enablement prevents accidental resource creation in unintended projects and gives administrators visibility into which services a project uses.
:::

:::section kicker="Diagnostics" headline="Diagnosing disabled API errors"
:::figure id="error-anatomy" caption="Standard Google Cloud error responses specify the failure reason, service endpoint, and target project."
:::

:::note
After enabling a service API, IAM and service management metadata can take up to two minutes to propagate globally. If a request immediately after enablement returns a permission error, wait briefly and retry.
:::
:::

:::section kicker="Pricing" headline="Cost of enabling APIs"
Enabling a Google Cloud API incurs no charge; you are billed only when you provision resources or make billable API requests. In the exercise below, you enable all APIs required for this course in a single step: **Cloud Run**, **Cloud Build**, **Artifact Registry**, **Firestore**, **Vertex AI / Gemini Enterprise Agent Platform**, **Cloud Logging**, and **Cloud Monitoring**.

:::note
You can enable multiple APIs simultaneously using `gcloud services enable`. If a later step reports that an API is disabled, verify your enabled services with `gcloud services list --enabled`.
:::
:::
