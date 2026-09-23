:::section kicker="What you built" headline="The shape of the system"
Five things, each added for a reason you can now give.

:::figure id="architecture" caption="Each badge is the step that added that piece."
:::

Read it as a sentence: a player's browser reaches **Cloud Run**, which is
running your game. Cloud Run reads and writes the leaderboard in **Firestore**,
and asks **Gemini** for a dino. Your code got there because **Cloud Build**
turned it into a container and **Artifact Registry** kept it. All of it sits
inside one project — one bill, one set of permissions.
:::

:::section kicker="The bill" headline="What you are charged for"
Four things, and everyone is surprised by exactly one of them.

- **Compute time** — the container, while it is running. Nothing while idle.
- **Storage** — the database and the stored container image, whether or not
  anyone asks for them.
- **Requests** — per call, including every call to the model.
- **Egress** — data leaving Google's network. This is the one nobody expects.

:::note
Scaling to zero is not the same as costing zero. The Cloud Run service is free
when nobody is playing; the image in Artifact Registry and the rows in
Firestore are not.
:::

:::console url="https://console.cloud.google.com/billing" label="Open billing" note="Find your own numbers. A line for Cloud Run, a line for Firestore, and which one would grow if the game became popular."
:::
:::

:::section kicker="Cleanup" headline="Deleting the box, not the contents"
Step 2 said a project is the box everything goes in: one bill, one set of
permissions, one namespace. That is what makes cleanup simple.

Deleting the project deletes the Cloud Run service, the container image, the
Firestore database and everything else inside it, in one action. There is no
list to work through and nothing to forget.

:::warn
This is the one thing in the course that cannot be undone from the workbench.
A service, a database or an image can be made again; a project id cannot be
reused, and after 30 days the contents are gone for good. Do this when you have
finished — not before.
:::

The 30 days are a grace period, not a backup. A deleted project is marked for
deletion and can be restored during that window, and then it is gone.

What is not deleted: your **billing account**, which belongs to you rather than
to the project, and any other project you own.
:::
