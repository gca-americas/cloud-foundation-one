:::section kicker="Overview" headline="DinoQuest"
**DinoQuest** is a web-based runner game with a score leaderboard. Players jump over obstacles to accumulate points, and completed runs are recorded on the leaderboard.

In this exercise, you inspect the application source files, start the local HTTP server from the terminal, and test the application in the embedded preview pane. The application runs as a standalone Python process in Cloud Shell.
:::

:::section kicker="Architecture" headline="How the application works"
:::figure id="app-shape" caption="A single Python process serves static assets and handles score API requests in memory."
:::

The backend server is implemented in `app/main.py` and performs two primary functions:
- Serves static frontend assets (`index.html`, `game.js`, `dino.png`, and audio files) from `app/static/`.
- Exposes REST endpoints (`GET /api/scores` and `POST /api/scores`) to read and update the top ten leaderboard scores.

:::note
`app/static/game.js` contains the client-side game loop and rendering logic. You do not need to modify any frontend files during this course.
:::
:::

:::section kicker="Environment" headline="About Cloud Shell"
Google Cloud Shell provides a browser-accessible Linux environment preconfigured with the Google Cloud CLI (`gcloud`), Python, and standard development tools. You use Cloud Shell to run the local application and execute Google Cloud commands throughout this course.

:::note
Starting the application from the workbench terminal runs `python3 main.py` as an independent operating system process. Stopping the process terminates the local web server.
:::
:::
