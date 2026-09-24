:::section kicker="Requirements" headline="What a public deployment needs"
While the application runs locally in Cloud Shell, making a web service reliably available to external users requires four operational capabilities:

:::figure id="four-problems" caption="Core operational requirements addressed by cloud infrastructure services."
:::

1. **Persistent compute availability**: The application must run on infrastructure that remains active independently of your local terminal session.
2. **Public network routing**: The service must expose a publicly routable HTTPS endpoint rather than a local loopback address.
3. **Managed physical infrastructure**: Data center operations—including power, cooling, physical networking, and hardware replacement—must be maintained continuously.
4. **Cost accounting and governance**: Resource consumption must be tracked, billed, and monitored under an administrative boundary.

:::key
Every Google Cloud service you provision in this course directly addresses one of these operational requirements.
:::
:::

:::section kicker="Addressing" headline="How localhost routing works"
The local server listens on `localhost:8080` (`127.0.0.1`). The `localhost` loopback interface routes traffic strictly within the host machine; external systems cannot reach it directly.

:::figure id="localhost" caption="Traffic sent to localhost remains within the local host interface."
:::

Although Cloud Shell Web Preview provides an HTTPS proxy URL to view local ports in your browser, that proxy requires authentication with your personal Google account. Sharing a Web Preview link with external users redirects them to a sign-in prompt rather than your application.
:::

:::section kicker="Workbench" headline="How the exercises work"
Throughout this workbench, provisioning and code-integration tasks use an intent-based prompt. Instead of copying static command strings, you describe the architectural outcome you want to achieve. When your description identifies the required cloud resource and action, the workbench executes the corresponding CLI command or code update in your Cloud Shell environment and displays the output.

:::note
If a request omits a required concept or specifies an unsuitable resource type, the workbench provides targeted diagnostic feedback so you can refine your input.
:::
:::

:::section kicker="Architecture" headline="Target cloud architecture"
By the end of this course, you will migrate DinoQuest to a production Google Cloud architecture featuring a public HTTPS URL on **Cloud Run**, persistent leaderboard storage in **Firestore**, least-privilege IAM service account permissions, and on-demand sprite generation powered by **Gemini**.
:::
