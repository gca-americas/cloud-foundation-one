:::section kicker="Persistence" headline="Process memory versus databases"
A database is a program whose whole job is to keep records safe and hand them
back when asked. It runs somewhere other than your app, on its own storage,
and it survives everything your app does — including stopping.

That last part is the one that matters here. Your leaderboard is a Python list
inside DinoQuest. When the process ends, so does the list.

:::figure id="process-boundary" caption="The dashed line is the process. A database is simply a place outside it."
:::

:::key
Anything an app keeps in memory lasts exactly as long as the process. If it has
to outlive a restart, it has to live outside the app.
:::
:::

:::section kicker="Options" headline="Managed databases on Google Cloud"
There are several, and they are not competing so much as holding different
shapes of data.

:::figure id="database-options" caption="What a record looks like in each one."
:::

| | Good at | Reach for it when |
|---|---|---|
| **Firestore** | Documents, no schema, scales to zero | You want records and no server to run |
| **Cloud SQL** | PostgreSQL or MySQL, joins, transactions | Your data is relational and your queries are real |
| **Spanner** | Enormous scale, relational, global | You are a bank |
| **Bigtable** | Huge volumes of simple rows, fast writes | You have telemetry, not records |
| **BigQuery** | Asking questions of everything that ever happened | You are analysing, not serving |

:::note
The last two are not for an app's live data, despite both having "table" in the
description. BigQuery in particular is for analysis: it will answer a question
about a billion rows, and it is the wrong thing to put behind a web request.
:::
:::

:::section kicker="Selection" headline="Choosing Firestore"
DinoQuest needs to store a name and a number, and read back the top ten. That
is it.

:::figure id="nothing-to-provision" caption="Both keep records safely. Only one hands you a machine."
:::

- **Nothing to provision.** No instance, no machine size, no disk, no password.
- **It scales to zero.** Nobody playing costs nothing.
- **Nothing left running.** Close the tab, walk away, and there is no instance
  quietly charging you. That matters more in a course than it sounds.

Cloud SQL would work too, and it would also hand you an instance to size, patch
and remember to delete. For a leaderboard, that is a machine you did not need.
:::

:::section kicker="Implementation" headline="Provisioning and connecting Firestore"
Connecting the application to Firestore requires provisioning the database and updating the storage code.

:::figure id="two-changes" caption="One database gets created, and one section of one file gets rewritten."
:::

1. **A database has to exist.** Firestore is not on until you create it, and it
   lives in a region.
2. **The app has to write there instead of to a list.** One section of
   `app/main.py` changes. The game, the page, and the API calls remain untouched.

:::key
Moving where the data lives should not mean rewriting the application. If it
does, the data was tangled through the code.
:::

Below, you observe the in-memory leaderboard reset on restart, and then connect Firestore.
:::
