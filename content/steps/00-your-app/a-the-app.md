:::section kicker="Overview" headline="DinoQuest"
A dinosaur runs, cactuses come at it, and pressing space or clicking jumps.
When the dino hits one, the run ends and the score goes on a leaderboard.

In the exercise you look through the project files, start the app by typing the
command, and play a round. All of it happens on this page: the app runs in
Cloud Shell as its own process, and the workbench shows it here.
:::

:::section kicker="Architecture" headline="How the application works"
:::figure id="app-shape" caption="One Python file serves the page and keeps the scores."
:::

The whole app is `app/main.py`, and it does two things: it hands the browser
the files that make up the game, and it answers two requests about scores —
one to read the leaderboard, one to add to it.

Everything it serves lives in `app/static/`: the page, the game, the dino
sprite, and the audio. Open them in the file browser below.

:::note
`app/static/game.js` is the game itself. You never have to read it — it is not
what this course is about — but it is there if you are curious.
:::
:::

:::section kicker="Environment" headline="About Cloud Shell"
Cloud Shell is a Linux machine that Google Cloud gives you in the browser, with
the command-line tools already installed. It is where the app runs and where
every command in this course runs.

:::note
Starting the app from the workbench is the same as typing
`python3 app/main.py` in a terminal. It is a separate process either way, and
stopping it stops the app.
:::
:::
