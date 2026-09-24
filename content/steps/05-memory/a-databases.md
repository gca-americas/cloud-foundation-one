:::section kicker="Persistence" headline="Process memory versus databases"
A **database** is an external storage system designed to persist, index, and retrieve structured records independently of your application process. Because it runs outside the application container on replicated storage, data stored in a database survives process restarts, crashes, and container scale-down events.

In the initial version of DinoQuest, leaderboard scores are stored in a Python list (`SCORES = []`) inside process memory. Whenever the Python server restarts, that memory space is cleared and all recorded scores are lost.

:::figure id="process-boundary" caption="Data stored in process memory is lost on restart; data stored in an external database persists."
:::

:::key
State stored in process memory persists only for the lifetime of that process. Any data that must survive server restarts or be shared across multiple container instances must be stored in an external database.
:::
:::

:::section kicker="Options" headline="Managed databases on Google Cloud"
Google Cloud provides managed database and analytics services optimized for different data models and access patterns:

:::figure id="database-options" caption="Primary Google Cloud database services and their data models."
:::

| Service | Data Model and Capabilities | Primary Use Case |
|---|---|---|
| **Firestore** | Serverless NoSQL document database that scales to zero | Application state and structured records without managing database instances |
| **Cloud SQL** | Fully managed PostgreSQL, MySQL, and SQL Server instances | Relational workloads requiring SQL joins, foreign keys, and ACID transactions |
| **Spanner** | Globally distributed relational database with horizontal scaling | Mission-critical relational workloads requiring multi-region consistency at massive scale |
| **Bigtable** | Wide-column NoSQL database optimized for high-throughput writes | High-volume time-series telemetry, financial market data, and IoT workloads |
| **BigQuery** | Serverless enterprise data warehouse for petabyte-scale SQL queries | Analytical reporting, business intelligence, and historical data analysis |

:::note
**Bigtable** and **BigQuery** are specialized for high-throughput ingestion and analytical queries respectively. For low-latency transactional application state behind a web API, use **Firestore** or **Cloud SQL**.
:::
:::

:::section kicker="Selection" headline="Choosing Firestore"
DinoQuest requires storing player `{name, score}` documents and querying the top ten scores sorted in descending order.

:::figure id="nothing-to-provision" caption="Firestore operates as a serverless document store without dedicated VM instances to manage."
:::

**Firestore** is well suited for this workload for three reasons:
- **Serverless operation**: You do not provision database instances, configure disk volumes, or manage database passwords.
- **Scale-to-zero pricing**: Firestore bills per document read, write, and gigabyte stored, with a generous daily free tier and zero cost when idle.
- **No idle instance overhead**: Unlike instance-based relational databases that charge hourly while running, a Firestore database incurs no hourly compute charge after you close your session.
:::

:::section kicker="Implementation" headline="Provisioning and connecting Firestore"
Integrating Firestore into DinoQuest requires two steps:

:::figure id="two-changes" caption="Provisioning a regional Firestore database and updating the storage module in app/main.py."
:::

1. **Provision the Firestore database**: Create a Firestore Native database in your selected region (`gcloud firestore databases create --location=$REGION`).
2. **Update the application storage layer**: Replace the in-memory `SCORES` list in `app/main.py` (`begin store` to `end store`) with the `google-cloud-firestore` client library (`firestore.Client()`). The HTTP routes and frontend game logic remain unchanged.

:::key
Decoupling storage access into a dedicated module allows you to migrate from an in-memory list to a managed cloud database without modifying application routes or frontend code.
:::
:::
