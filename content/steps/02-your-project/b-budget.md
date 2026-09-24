:::section kicker="Behavior" headline="How budget alerts work"
A **Cloud Billing budget alert** defines a monthly spending threshold on a billing account or project and sends email notifications when actual or forecasted costs cross configured percentages (such as 50%, 90%, and 100%).

:::figure id="budget-alert" caption="A budget alert sends notifications when thresholds are exceeded; it does not terminate running resources."
:::

:::warn
A budget alert does not cap spending or automatically shut down running resources. It sends notifications only while services continue to run.
:::
:::

:::section kicker="Timing" headline="Billing reporting delays"
Budget alerts evaluate usage data reported to Cloud Billing. Because Google Cloud services report consumption metrics in asynchronous batches—ranging from an hour to twenty-four hours—the spend total evaluated by a budget alert reflects only usage reported up to that point.

:::warn
Because usage reporting is batched, a budget notification can arrive several hours after the resource consumption that triggered it. High-capacity resources left running unattended can accumulate significant charges before an alert is delivered.
:::

To mitigate reporting latency, follow two operational practices:
- **Configure a low threshold** (such as $5 or $10) on development projects so threshold alerts trigger early.
- **Deprovision unused resources immediately** after testing rather than relying solely on billing alerts.
:::

:::section kicker="Practice" headline="Setting a budget alert"
Configure a budget alert whenever you create a new Google Cloud project and link a billing account. Creating a budget alert is free and provides early visibility into unexpected usage.

:::key
Always configure a budget alert before provisioning billable cloud resources.
:::
:::
