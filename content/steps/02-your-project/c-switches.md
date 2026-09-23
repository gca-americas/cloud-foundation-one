:::section kicker="Defaults" headline="Services are disabled by default"
In a new project, each service is disabled. The first attempt to use one fails
with an error naming the API and explaining how to enable it.

:::figure id="api-switches" caption="Services are enabled per project, one at a time."
:::

The exercise triggers that error deliberately, because reading the error is
more useful than avoiding it.
:::

:::section kicker="Errors" headline="Reading a permission error"
:::figure id="error-anatomy" caption="The error names the problem, the service, and the project."
:::

:::note
A new project can also return permission errors for a minute or two after
creation, while the change propagates. Wait and try again before investigating
further.
:::
:::

:::section kicker="Cost" headline="Enabling a service is free"
You are charged for what you use, not for what is switched on. So rather than
coming back here every time a later step needs something, the exercise turns on
the whole set at once: somewhere to run code, the build service and registry
behind it, a database, a model, and the logs and metrics to watch it all.

:::note
Five services, one command. If a later step ever fails with "API not enabled",
this is the page to come back to.
:::
:::
