:::section kicker="Integration" headline="Generating sprites with Gemini"
DinoQuest renders its player character from a static sprite sheet at `app/static/dino.png`. Replacing that PNG file updates the character in the game without requiring any changes to the client-side game loop.

To generate custom characters rapidly and deterministically, the backend prompts **Gemini** (`gemini-3.5-flash`) to return a structured JSON object containing a 6-color hex palette and a 24×24 character grid, and then encodes that grid directly into `app/static/dino.png`.

:::figure id="grid-to-sprite" caption="Gemini returns a structured character grid and color palette that the backend converts into dino.png."
:::

:::key
Enforcing a structured JSON response schema (`response_schema`) allows a language model to return deterministic, machine-readable data structures—such as pixel grids and hex color palettes—that application code can parse reliably.
:::
:::

:::section kicker="Configuration" headline="Environment configuration"
Before calling the Gemini API on Google Cloud, the application requires four environment settings specifying the authentication mode, project ID, endpoint location, and model name. These settings are stored in `app/.env` rather than hardcoded in `app/main.py`.

:::figure id="settings-not-code" caption="Runtime environment variables loaded at startup from app/.env."
:::

| Environment Variable | Purpose |
|---|---|
| `GOOGLE_GENAI_USE_VERTEXAI` | Directs the SDK to authenticate using Google Cloud IAM credentials rather than an API key |
| `GOOGLE_CLOUD_PROJECT` | Specifies the Google Cloud project ID used for billing and quota enforcement |
| `GOOGLE_CLOUD_LOCATION` | Specifies the regional or `global` endpoint that serves the model request |
| `DINO_MODEL` | Specifies the Model Garden model identifier (`gemini-3.5-flash`) |

:::note
When `GOOGLE_GENAI_USE_VERTEXAI=True`, no static API keys are required. The Google Gen AI SDK automatically signs requests using Application Default Credentials (ADC) provided by Cloud Shell or Cloud Run.
:::
:::

:::section kicker="Routing" headline="The global endpoint"
In this course, `GOOGLE_CLOUD_LOCATION` is configured to use the `global` endpoint rather than a single regional endpoint.

:::figure id="global-endpoint" caption="A regional endpoint pins processing to one location; the global endpoint routes requests dynamically to available capacity."
:::

In production workloads with data residency requirements, you specify a regional endpoint (such as `us-central1`) to guarantee that prompts and responses remain within that geographic region. The `global` endpoint trades geographic pinning for higher availability and quota capacity by dynamically routing requests to whichever region has immediate accelerator capacity.

:::note
In workshop and classroom environments where many developers call the same model concurrently, using the `global` endpoint prevents single-region rate-limit contention.
:::
:::

:::section kicker="SDK" headline="The Google Gen AI SDK"
The **Google Gen AI SDK** (`google-genai`) provides a unified client library for calling Gemini models across both the Gemini Developer API and the Gemini Enterprise Agent Platform (`vertexai=True`).

:::figure id="sdk-call" caption="Calling client.models.generate_content() with a structured response schema."
:::

A standard inference call using `google-genai` follows this structure:

```python
from google import genai
from google.genai import types

client = genai.Client(vertexai=True, project="my-dinoquest", location="global")

answer = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Describe a dinosaur in one sentence.",
    config=types.GenerateContentConfig(
        system_instruction="You write for a children's game.",
        temperature=0.9,
    ),
)

print(answer.text)
```

To generate sprite data, `app/main.py` passes two additional parameters in `GenerateContentConfig`:
- **`system_instruction`**: Defines the model's role and specifies the exact character-to-pixel mapping rules (`a`–`f` for palette indices and `.` for transparent pixels).
- **`response_mime_type="application/json"` and `response_schema=SHAPE`**: Constrains the model's output decoder so the response is guaranteed to match the required JSON schema (`palette` array of 6 hex colors and `rows` array of 24 strings).
:::
