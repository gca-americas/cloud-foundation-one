:::section kicker="Overview" headline="The Gemini Enterprise Agent Platform"
Google Cloud runs large models on its own hardware and answers requests to
them over the network. Sending a request and getting an answer back is the
whole arrangement. No model is downloaded, no accelerator is reserved, and
nothing is installed.

:::figure id="rent-intelligence" caption="Renting compute, storage, and intelligence on demand."
:::

:::key
Calling a hosted model is renting, not owning. It has the same billing shape
and the same permission shape as every other service in this course.
:::
:::

:::section kicker="Economics" headline="Training versus calling a model"
A model of this size is not something a team decides to build on a Tuesday.
Training one means thousands of accelerators running for weeks, a dataset
assembled over years, and people who have done it before.

:::figure id="own-a-model" caption="Both columns get you a model. Only one of them is a project."
:::

The comparison is the same one made earlier about servers, only further along
the scale. Renting is not the cheap option here; it is the only option most
teams have.
:::

:::section kicker="Inference" headline="Calling hosted models"
A hosted model is one Google runs. You send a request, you get an answer, and
you are charged for the size of both. There is nothing to install and nothing
left running when you stop asking.

:::figure id="model-modalities" caption="Models differ in what they accept and what they return."
:::

Gemini takes text, images, audio, video and PDFs, and returns text, images or
audio depending on which one you call. Other model families are narrower and
better at the one thing they do: Imagen for images, Veo for video, Lyria for
music.

:::key
Pick the model, send the request, read the answer. That is the entire
interface, and it is the part this course uses.
:::
:::

:::section kicker="Catalog" headline="Model Garden"
Model Garden is the list of every model the platform can serve: more than 200
of them, in one place, with the documentation and the price next to each one.

:::figure id="model-garden" caption="First-party, open, and partner models in one catalog."
:::

It holds three kinds of models:

- **Google models.** Gemini for text, images and audio in and out; Imagen for
  images; Veo for video; Lyria for music. These are the ones that need no setup
  — pick one and call it.
- **Open models.** Gemma and others, where the weights are published. Call the
  hosted copy, or take the weights and run them on your own machines.
- **Partner models.** Models from other companies, served through the same
  endpoint, billed to the same account.

:::note
Reading a model card before choosing is the habit worth forming. It states the
context window, what the model accepts and returns, the price per million
tokens, and whether the model is generally available or still in preview.
Preview models change without warning.
:::

This course calls **Gemini**, from the first group. DinoQuest needs a small
amount of text back in a fixed shape, which is the most ordinary thing a
language model does.
:::

:::section kicker="Lifecycle" headline="Evaluation, grounding, and tuning"
One request is the smallest piece of the platform. Everything else exists
because a working demo and a service people depend on are not the same thing.

:::figure id="model-cycle" caption="Each stage has a feature behind it. The names matter less than knowing the stage exists."
:::

- **Find one — Model Garden.** The catalogue just described.
- **Try a prompt — Agent Studio.** A console workspace for writing system
  instructions and comparing prompts side by side before any code exists.
- **Call it — the Gemini API, through the Google Gen AI SDK.** The integration you are
  about to implement.
- **Improve it — grounding and tuning.** Grounding gives the model facts it was
  not trained on: Google Search for the public web, Agent Search or RAG Engine
  for your own documents. Tuning changes the model itself using your examples,
  and is the heavier option of the two.
- **Check it — the Gen AI evaluation service.** Scoring answers against
  criteria you set, so "it seems better" becomes a number. Without this there
  is no way to tell whether a prompt change helped.
- **Serve and watch — Inference, and Model Monitoring.** Online inference for
  one request at a time, batch inference for millions. Monitoring tells you
  when answers start drifting, and Model Armor screens what goes in and comes
  out.

:::note
Reach for grounding before tuning. Most "the model does not know our products"
problems are missing facts, not a model that needs retraining, and grounding
solves those in an afternoon.
:::
:::

:::section kicker="Architecture" headline="Models and agents"
A model answers one question. An agent is given a goal, decides which steps to
take, calls tools to take them, and keeps going until it is done. That
difference is small to describe and large to run: something has to host the
agent between turns, remember what happened, and stop it doing anything you
did not intend.

:::figure id="agent-pillars" caption="The platform organizes agent capabilities into core pillars."
:::

- **Build.** The Agent Development Kit — ADK — is the open-source framework
  you write an agent in. Agent Studio is the low-code version, and Agent Garden has
  working samples to start from.
- **Scale.** Agent Runtime hosts the agent. Sessions keep one conversation's
  history; Memory Bank keeps what should be remembered across conversations.
- **Govern.** Agent Registry is the catalogue of agents and tools in your
  organization. Agent Identity gives each agent its own identity rather than a
  shared account, Agent Gateway is where traffic is checked, and Model Armor
  screens for prompt injection and data leaks.
- **Optimize.** Agent evaluation scores an agent across whole conversations,
  not single answers, and Agent Observability traces what it actually did.

Agents reach tools over **MCP**, and reach other agents over **A2A**. Both are
open protocols, so an agent is not confined to tools from one vendor.

:::note
**Gemini Enterprise** is the finished product people use at work — search and an assistant over company
data. **Gemini Enterprise Agent Platform** is where developers build, and
agents built there are delivered to people through Gemini Enterprise.
:::

This course does not build an agent. It calls a model once, which is the
foundation everything above is built on.
:::
:::section kicker="Operations" headline="Region, permissions, and pricing"
Calling a model involves the same operational considerations as every other cloud service.

- **Which region.** A model request is served somewhere, and regional routing considerations
  still apply. This section uses a deliberate exception, covered next.
- **Which identity.** The call is signed by whoever is making it. At the
  command line that is your account; once the app is deployed it is the
  service account the app runs as, which will need its own permission.
- **What it costs.** Charged per token, visible in the same billing report as
  everything else, and covered by the budget alert set earlier.
:::
