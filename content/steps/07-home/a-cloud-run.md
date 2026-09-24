:::section kicker="The problem" headline="What a terminal cannot do"
DinoQuest has run on your machine for seven steps. Close the terminal and it
stops. Nobody else can reach it. Nothing restarts it if it crashes, and if a
hundred people arrived at once there is one process to serve them all.

:::figure id="four-problems" caption="The four things a laptop cannot do for an app."
:::

Cloud Run answers all four, and the answer is the same shape as every other
step: you do not own the machine, and you are not the one keeping it alive.
:::

:::section kicker="Definition" headline="Serverless containers"
Cloud Run runs containers and gives each one a public address. You hand it a
container; it starts copies when requests arrive, stops them when they stop,
and charges for the time they were running.

:::key
There is no machine to choose, no operating system to patch, and nothing
running when nobody is asking.
:::

That last part is worth reading twice. A server you rent bills for every hour
it exists. A Cloud Run service with no traffic bills for nothing.
:::

:::section kicker="The unit" headline="What a container is"
A container is your code, the language runtime it needs, and its dependencies,
sealed together into one image. Everything the app needs to start is inside;
nothing about the machine underneath is.

:::figure id="container-unit" caption="Sealed together, so the machine underneath stops mattering."
:::

That seal is why "it works on my machine" stops being a sentence anyone says.
The image that runs in your region is byte for byte the image that was built,
and it does not care what is installed on the host.

:::note
DinoQuest has no Dockerfile, and you will not write one. The build reads
`app/requirements.txt` to know what to install and `app/Procfile` to know how
to start, and works out the rest.
:::
:::

:::section kicker="The process" headline="Deploying the service"
One request turns source into a running service. Four things happen, in order,
and it is worth knowing which is which when one of them fails.

:::figure id="deploy-pipeline" caption="Source in, address out. The middle two steps are why the first deployment is slow."
:::

1. **Upload.** The contents of `app/` are sent to Cloud Build.
2. **Build.** Cloud Build inspects the source, installs the dependencies and
   produces a container image.
3. **Store.** The image is kept in Artifact Registry, so starting another copy
   later does not mean building again.
4. **Run.** Cloud Run creates a service from that image and returns an HTTPS
   address.

The first deployment takes a few minutes, almost all of it step 2. Later ones
are faster because the build has less to redo.
:::

:::section kicker="Two things to expect" headline="Cold starts and revisions"
**Scaling to zero has a cost, and it is time.** When no copy is running, the
first request has to wait for one to start. That pause is a cold start. It is
the price of not paying for idle capacity, and for most applications it is a
good trade.

:::figure id="cold-start" caption="Only the request that arrives to an idle service waits."
:::

**Every deployment creates a revision.** The old one does not disappear. Traffic
moves to the new revision, and if the new one is wrong, traffic can be moved
back — a rollback is a change of routing, not a rebuild.

:::figure id="revisions" caption="The old revisions are still there, which is what makes going back quick."
:::

:::note
This is why deploying often is safer than deploying rarely. A small change is
easy to undo, and you can see which revision introduced a problem.
:::

:::console url="https://console.cloud.google.com/run" label="Open Cloud Run" note="Your service, then the Revisions tab. Every deployment you make shows up there."
:::
:::

:::section kicker="Two things that change" headline="Service accounts and runtime settings"
Running on your machine, the app called Firestore and Gemini as **you**, and
you already had access to both. Deployed, it runs as a **service account** — an
identity that belongs to the service rather than to a person, and that has been
granted nothing.

:::figure id="what-changes-deployed" caption="The app is the same in both columns."
:::

The settings move too. `app/.env` is a local file and is not inside the
container. The same values have to be set on the service itself.

:::key
A file you deliberately did not commit cannot be the thing that configures
production. Settings for a deployed service live on the service.
:::

The deployment in this step handles both: it grants the service account the two
roles it needs, and carries the settings across. Watch the log if you want to
see it happen.

:::console url="https://console.cloud.google.com/run" label="Open Cloud Run" note="Your service: Variables and Secrets holds the settings, Security names the identity it runs as."
:::
:::
