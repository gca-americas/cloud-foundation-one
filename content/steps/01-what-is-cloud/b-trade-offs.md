:::section kicker="Economics" headline="When renting costs less"
Whether cloud infrastructure reduces total cost of ownership depends on the shape and predictability of your workload demand.

:::columns
**Cloud infrastructure is more cost-effective when**

Workload demand is variable, spiky, uncertain, or starting at a small scale. Dynamic scaling avoids paying for idle hardware during low-traffic periods.
---
**Owned hardware can be more cost-effective when**

Workload demand is large, continuous, and highly predictable over multi-year horizons where hardware utilization remains consistently high.
:::
:::

:::section kicker="Trade-offs" headline="Provider dependency"
Adopting higher-level managed services reduces operational overhead, allowing engineering teams to focus on application logic. However, deeper integration with provider-specific APIs increases architectural coupling to that cloud platform.

:::key
Select managed cloud services when elastic scaling and reduced operational toil outweigh the cost of managing infrastructure yourself.
:::
:::

:::section kicker="Scope" headline="Resources used in this course"
:::figure id="rent-three" caption="On-demand provisioning applied across compute, database storage, and foundation models."
:::

Throughout this course, you apply the cloud consumption model across three layers of the stack:
- **Compute**: Serverless container execution on **Cloud Run**.
- **Database storage**: Managed document persistence in **Firestore**.
- **Foundation models**: Managed generative AI inference with **Gemini**.

Before provisioning these resources, you must authenticate with Google Cloud and create a project container.
:::
