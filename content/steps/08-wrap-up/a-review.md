:::section kicker="The thesis" headline="Renting, three times"
Everything in this course was one idea applied repeatedly. You never bought a
machine, a disk or a model. You asked for capacity, used it, and were charged
for what ran.

:::figure id="rent-intelligence" caption="The same arrangement, three times over."
:::

- **A machine** — Cloud Run started containers when requests arrived and
  charged nothing while idle.
- **Storage** — Firestore kept the leaderboard outside the process, with no
  instance to size and no disk to manage.
- **Intelligence** — Gemini answered from Google's hardware, with no model
  downloaded and nothing installed.

:::key
The pattern transfers. When you meet a service this course never taught, the
questions are the same three: which region, which identity, and what does it
cost.
:::
:::

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
