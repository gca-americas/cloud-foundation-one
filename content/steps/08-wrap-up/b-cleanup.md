:::section kicker="Architecture" headline="Completed system architecture"
Your deployed application integrates five managed Google Cloud services within a single project boundary:

:::figure id="architecture" caption="Complete production architecture of DinoQuest on Google Cloud."
:::

Player browsers connect over HTTPS to **Cloud Run**, which executes the containerized Python application. Cloud Run reads and writes leaderboard documents in **Firestore** and calls **Gemini** on the **Gemini Enterprise Agent Platform** to generate custom character sprites. **Cloud Build** packages the source directory into a container image, and **Artifact Registry** stores the image for deployment. All resources share a single Google Cloud project, billing account link, and IAM policy boundary.
:::

:::section kicker="Billing" headline="Understanding the bill"
Cloud Billing meters your deployed architecture across four primary dimensions:
- **Compute duration**: CPU and memory seconds consumed by **Cloud Run** while actively processing HTTP requests ($0 while scaled to zero).
- **Persistent storage**: Gigabytes stored in **Firestore** (documents and indexes) and **Artifact Registry** (container image layers), which are billed continuously regardless of request traffic.
- **API requests and tokens**: Document reads and writes in **Firestore**, plus input and output tokens processed by **Gemini**.
- **Network egress**: Data transferred out of Google Cloud's network to external internet clients.

:::note
Scaling compute to zero (`min-instances=0`) eliminates idle CPU charges on Cloud Run, but persistent storage in Artifact Registry and Firestore continues to accrue storage usage until deleted.
:::

:::console url="https://console.cloud.google.com/billing" label="Open Cloud Billing" note="Inspect your cost breakdown by service (Cloud Run, Firestore, Artifact Registry, and Vertex AI)."
:::
:::

:::section kicker="Cleanup" headline="Shutting down the project"
Because every resource you created—the Cloud Run service, the Artifact Registry container image, and the Firestore database—resides inside your Google Cloud project, **deleting the project** deprovisions all resources and stops all future billing in a single operation.

:::warn
Deleting a Google Cloud project permanently deprovisions all resources inside it after a 30-day recovery window, and its Project ID can never be reused. Only delete the project after you have finished testing your deployed application.
:::

When you shut down a project, Google Cloud immediately suspends serving and marks the project for deletion. During the 30-day grace period, an administrator can restore the project if needed; after 30 days, all data and resources are permanently erased.

Deleting a project does **not** delete your **Cloud Billing account** or any other projects linked to that billing account, because the billing account is an independent resource outside the project boundary.
:::
