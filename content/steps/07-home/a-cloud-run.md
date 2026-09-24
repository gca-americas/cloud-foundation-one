:::section kicker="Limitations" headline="Why a local terminal is not production"
Running DinoQuest in a local Cloud Shell process has four operational limitations: the process terminates when the session closes, the local loopback port is unreachable by external users, no supervisor restarts the server if it crashes, and a single process cannot scale horizontally under concurrent load.

:::figure id="four-problems" caption="Operational limitations of running a web service in a local terminal session."
:::

**Cloud Run** resolves these limitations by executing your application in managed, auto-scaling containers on Google Cloud infrastructure.
:::

:::section kicker="Runtime" headline="Serverless containers"
**Cloud Run** is a fully managed serverless platform for containerized applications. You deploy a container image or source directory, and Cloud Run provisions an HTTPS endpoint, scales container instances up to handle incoming requests, and scales down to zero instances when traffic stops.

:::key
With Cloud Run, you do not provision virtual machines or patch host operating systems, and you incur zero compute charges when your service is idle.
:::

Unlike virtual machines that bill hourly while running, a Cloud Run service with `min-instances=0` bills only for the CPU and memory consumed while processing requests.
:::

:::section kicker="Packaging" headline="Container images"
A **container image** packages your application source code, language runtime, and library dependencies into an immutable, self-contained artifact. Because the image includes every dependency required to start the server, the container runs identically across local development and cloud regions.

:::figure id="container-unit" caption="A container image bundles application code, runtime, and dependencies into a portable unit."
:::

:::note
You do not need to write a `Dockerfile` for DinoQuest. Google Cloud buildpacks automatically inspect `app/requirements.txt` to install Python dependencies and read `app/Procfile` (`web: python3 main.py`) to configure the container entrypoint.
:::
:::

:::section kicker="Deployment" headline="Deploying the service"
Deploying from source (`gcloud run deploy --source app/`) executes four automated stages:

:::figure id="deploy-pipeline" caption="Source-based deployment pipeline using Cloud Build, Artifact Registry, and Cloud Run."
:::

1. **Upload**: The contents of the `app/` directory are uploaded to **Cloud Build**.
2. **Build**: **Cloud Build** runs Google Cloud buildpacks to install dependencies from `app/requirements.txt` and assemble a container image.
3. **Store**: The resulting container image is pushed to **Artifact Registry** in your project.
4. **Run**: **Cloud Run** creates a new service revision from that image and assigns a public HTTPS `.run.app` URL.

The initial deployment takes two to three minutes while Cloud Build constructs the base image layers; subsequent deployments reuse cached layers and complete faster.
:::

:::section kicker="Scaling" headline="Cold starts and revisions"
**Cold starts.** When a service has scaled down to zero instances, the first incoming request waits briefly while Cloud Run starts a new container instance. This initial startup latency—called a *cold start*—is the trade-off for paying zero compute cost while idle.

:::figure id="cold-start" caption="A request arriving at an idle service triggers a container cold start."
:::

**Immutable revisions.** Every deployment to Cloud Run creates a new, immutable **revision**. Traffic shifts atomically to the new revision once health checks pass, while previous revisions remain available. Rolling back a deployment simply redirects traffic to an earlier revision without rebuilding the container image.

:::figure id="revisions" caption="Cloud Run retains immutable revisions, enabling instant traffic rollbacks."
:::

:::note
Because each deployment creates an isolated revision, deploying small, frequent updates simplifies troubleshooting and makes rollbacks immediate.
:::

:::console url="https://console.cloud.google.com/run" label="Open Cloud Run" note="Inspect your deployed service and view the Revisions tab to see each immutable deployment."
:::
:::

:::section kicker="Security" headline="Service accounts and runtime configuration"
Moving an application from Cloud Shell to Cloud Run changes two operational contexts:

:::figure id="what-changes-deployed" caption="Comparison of runtime identity and environment configuration between Cloud Shell and Cloud Run."
:::

1. **Runtime identity**: In Cloud Shell, the application executes under your personal Google user credentials. On Cloud Run, the container executes as a dedicated **IAM service account** (`PROJECT_NUMBER-compute@developer.gserviceaccount.com`), which requires explicit IAM roles (`roles/datastore.user` for Firestore and `roles/aiplatform.user` for Gemini).
2. **Environment variables**: Because local configuration files such as `app/.env` are excluded from the container build, runtime settings (`GOOGLE_GENAI_USE_VERTEXAI`, `GOOGLE_CLOUD_LOCATION`, and `DINO_MODEL`) must be configured directly on the Cloud Run service using `--set-env-vars`.

:::key
Never bundle local `.env` files into container images. Configure environment variables and secrets directly on the Cloud Run service definition.
:::

The deployment script (`scripts/deploy_app.py`) grants the required IAM roles to the runtime service account and passes the environment variables to `gcloud run deploy`.

:::console url="https://console.cloud.google.com/run" label="Open Cloud Run" note="Inspect the Variables & Secrets tab for environment variables and the Security tab for the runtime service account."
:::
:::
