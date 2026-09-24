:::section kicker="Integration" headline="Generating sprites with Gemini"
DinoQuest runs the same character every time, because the character is a file:
`app/static/dino.png`. Replacing that file replaces the dino, and the game
does not need to know how it got there.

So the work is narrow. Ask Gemini to describe a small picture, turn the
description into a PNG, write it over the file. The game is not touched.

:::figure id="grid-to-sprite" caption="The model returns letters and colours. Your code turns them into the file the game already loads."
:::

:::key
A model that returns text can still produce a picture, if the code around it
knows how to read the text. Asking for a grid of letters is more reliable, and
far cheaper, than asking for an image.
:::
:::

:::section kicker="Configuration" headline="Environment configuration"
Key settings must be configured before any call can be made: that the request
goes to Google Cloud rather than to the Gemini Developer API, which project
pays for it, and which endpoint answers.

None of those belong in `main.py`. They change from machine to machine, and one
of them is specific to you.

:::figure id="settings-not-code" caption="The file is read once at startup. The code names neither the project nor the endpoint."
:::

| Setting | What it decides |
|---|---|
| `GOOGLE_GENAI_USE_VERTEXAI` | Use Google Cloud credentials, not an API key |
| `GOOGLE_CLOUD_PROJECT` | Which project is billed, and whose quota is spent |
| `GOOGLE_CLOUD_LOCATION` | Which endpoint answers |
| `DINO_MODEL` | Which model in Model Garden to call |

:::note
There is no API key anywhere in this exercise. The SDK signs each request with
the credentials Cloud Shell already has.
:::
:::

:::section kicker="Routing" headline="The global endpoint"
`GOOGLE_CLOUD_LOCATION` is set to `global` in this course, and that is not what
a production service would do.

:::figure id="global-endpoint" caption="A named region serves the request in one place. The global endpoint serves it wherever there is room."
:::

A named region is the normal choice: it
says where the request is handled, and it is the only way to promise anything
about data locality. The global endpoint gives up that control and gets capacity in
return — the request goes wherever the model has room right now.

:::note
A classroom is the one setting where capacity is the thing most likely to fail:
many people calling the same model in the same region at the same time. That
is why this course uses `global`, and why it is worth knowing it is a trade-off
rather than a default.
:::
:::

:::section kicker="SDK" headline="The Google Gen AI SDK"
`google-genai` is the current client library for Gemini. One SDK reaches both
the Gemini Developer API and the Gemini API on Gemini Enterprise Agent
Platform; the `vertexai=True` flag is what chooses the second.

:::figure id="sdk-call" caption="One call out, one JSON answer back."
:::

A call has the same shape every time:

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

Four things go in — which model, what you are asking, how it should behave, and
how much to vary — and text comes back on `answer.text`. The code this step
adds is that call with one addition: it asks for JSON in a fixed shape instead
of a sentence.

Two parts of the call are worth naming:

- **A system instruction** — standing directions for the model, separate from
  the request. Here it describes the pixel format the code can read.
- **A response schema** — the shape the answer has to take. The model is held
  to it, so the code can read the reply without checking whether the model felt
  like cooperating this time.
:::
