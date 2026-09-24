:::section kicker="Overview" headline="Organizing cloud products"
Google Cloud offers more than two hundred products serving specialized enterprise, analytics, networking, and security workloads. To design an application architecture, evaluate requirements by functional service category rather than memorizing individual product names.

:::key
Identify the foundational service category your workload requires first—such as serverless compute or document storage—and then select the appropriate managed product within that category.
:::
:::

:::section kicker="Categories" headline="Core service categories"
:::figure id="categories" caption="Google Cloud services grouped into five foundational architectural categories."
:::

Most cloud applications rely on five core service categories:
- **Compute**: Environments that execute application code (such as **Cloud Run**, **Google Kubernetes Engine**, and **Compute Engine**).
- **Object Storage**: Durable storage for unstructured binary files such as images, videos, backups, and static archives (**Cloud Storage**).
- **Databases**: Managed systems for storing, indexing, querying, and updating structured application records (**Firestore**, **Cloud SQL**, **Spanner**, **Bigtable**).
- **Networking**: Virtual networks, DNS routing, firewall rules, and load balancers that control traffic flow (**Virtual Private Cloud**, **Cloud Load Balancing**).
- **AI and Machine Learning**: Managed foundation models, training infrastructure, and agent runtimes (**Gemini** on the **Gemini Enterprise Agent Platform**).
:::

:::section kicker="Storage" headline="Object storage versus databases"
Distinguishing between **object storage** and **databases** is a critical design decision:
- **Object storage (files)** treats each item as an opaque binary blob. You upload and retrieve the entire file as a single unit without querying or modifying individual fields inside it.
- **Databases (records)** store structured data with fields that your application can index, filter, sort, and update individually.

Because DinoQuest's leaderboard stores `{name, score}` records that must be sorted in descending order and queried on every game run, it requires a **database** (**Firestore**) rather than an object storage bucket. By contrast, `app/static/dino.png` is a static asset packaged inside the application container and does not require external bucket storage.

:::note
Storing structured application records in flat files or storing large binary media blobs inside database rows degrades performance and increases operational complexity as traffic grows.
:::
:::

:::section kicker="Architecture" headline="Mapping services to DinoQuest"
:::figure id="architecture" caption="End-to-end Google Cloud architecture for DinoQuest."
:::

The production DinoQuest deployment combines three runtime services and two build-pipeline services inside a single Google Cloud project:
- **Cloud Run** serves the HTTP application and frontend game assets over HTTPS.
- **Firestore** persists and orders player leaderboard records.
- **Gemini** generates custom dinosaur sprites via structured JSON output.
- **Cloud Build** packages the application source code into a container image, and **Artifact Registry** stores the image for deployment.

:::key
A complete production web application typically requires only a focused subset of managed compute, database, build, and AI services within a single project boundary.
:::
:::

:::section kicker="Compute" headline="Comparing compute models"
Google Cloud provides three primary compute models that differ in how much underlying infrastructure you manage:

:::figure id="how-much-machine" caption="Division of operational responsibility across virtual machines, Kubernetes clusters, and serverless containers."
:::

- **Compute Engine (Virtual Machines)**: You provision dedicated virtual machines and manage the guest operating system, security patches, disk volumes, and scaling policies.
- **Google Kubernetes Engine (GKE)**: You orchestrate multi-container workloads across a managed cluster of nodes when applications require custom networking or complex microservice topologies.
- **Cloud Run (Serverless Containers)**: You provide a container image or source directory; Google Cloud manages all underlying infrastructure, automatically scales instances from zero to match incoming HTTP traffic, and bills only for active request processing.

This course deploys DinoQuest to **Cloud Run** to eliminate server management and idle compute costs.
:::

:::section kicker="Scope" headline="Additional platform services"
Enterprise workloads often incorporate additional Google Cloud services—including custom VPC topologies, global external load balancers, **BigQuery** analytical warehouses, **Pub/Sub** event streams, and **Terraform** infrastructure-as-code pipelines. For a single-service web application, Cloud Run's default HTTPS routing and managed project defaults provide a complete production foundation.
:::
