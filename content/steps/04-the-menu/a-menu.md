:::section kicker="The problem" headline="Two hundred products, five categories"
Google Cloud has more than two hundred products. The list exists because the
same platform serves banks, hospitals, game studios and you, and most of it is
not addressed to you at all.

:::key
Do not learn products. Learn which category a problem belongs to, and then find
the product in that category. Products get renamed and replaced. The categories
have not moved in twenty years.
:::
:::

:::section kicker="The menu" headline="Five service categories"
:::figure id="categories" caption="Every service belongs to one of these. This course uses three."
:::

**Somewhere to run code.** You have a program; something has to execute it.

**Somewhere to keep files.** Things you hand back whole: photos, uploads,
video. You do not look inside them, you fetch them. DinoQuest never needs this,
for a reason worth knowing — see below.

**Somewhere to keep records.** Things your app reads and writes as it runs:
users, scores, messages. You look these up, filter them, change one field.

**Something to connect it.** Addresses, names, who may reach what. The
defaults are right for an app like this one, so the course never opens it.

**Something to make it smart.** Models you call, rather than machines you
train.
:::

:::section kicker="Files or records" headline="Files versus records"
A **file** is opaque. You put it in, you get it back, and the storage never
looks inside. A **record** is structured: you ask questions of it, and change
one part without rewriting the whole thing.

The leaderboard is a list of records, so DinoQuest needs a database.

The dino sprite is a file — and DinoQuest still does not need a bucket for it,
because that file never changes and travels inside the container. A bucket
earns its place the moment files arrive that you did not ship: things people
upload, or things your app generates and has to keep.

:::note
Beginners force one into the other: photos in a database, user accounts in a
folder of files. Both work briefly, and both hurt later.
:::
:::

:::section kicker="What you are building" headline="DinoQuest, finished"
:::figure id="architecture" caption="Each badge is the step that adds that piece."
:::

Read it as a sentence. A player's browser reaches **Cloud Run**, which is
running your game. Cloud Run reads and writes the leaderboard in
**Firestore**, and asks **Gemini** for a dino. Your code got there because
**Cloud Build** turned it into a container and **Artifact Registry** kept it.

All of it sits inside one project — one bill, one set of permissions. That is
the box from step 2 doing its job.

:::key
Three categories, three services of your own, and two more that exist only to
get your code there. Nothing else in the two hundred is needed to put a real
application on the internet.
:::
:::

:::section kicker="How much to manage" headline="Compute options"
There is more than one way to run the same app, and the difference is how much
of the machine is yours to worry about.

:::figure id="how-much-machine" caption="The coloured parts are yours to look after. The grey parts are somebody else's problem."
:::

**A virtual machine** is one computer, rented. You get total control and you
also get the operating system, the patches, and a pager when a disk fills up at
3am.

**GKE**, Google Kubernetes Engine, runs many containers across many machines.
It is genuinely excellent at that, and it hands you a cluster to run as well as
an app.

**Cloud Run** takes your container and runs it. There is no machine in the
picture for you, and nothing to patch.

This course uses Cloud Run. Step 7 explains why.
:::

:::section kicker="What to ignore" headline="What this course leaves out"
GKE, load balancers, VPC design, data warehouses, message queues,
buckets, and the whole of logging and monitoring. All real, all excellent, none
of them yours yet.

Knowing what you are ignoring is the difference between a beginner and someone
who is lost. Step 9 comes back to this and says why each one was left out.
:::
