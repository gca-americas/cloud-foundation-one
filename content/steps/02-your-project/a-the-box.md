:::section kicker="Structure" headline="What a project contains"
Step 1 created a project without explaining what one is. This is that
explanation. Resources need a container, and costs need somewhere to be
reported. In Google Cloud that container is a project, and every resource
belongs to exactly one.

:::
:::

:::section kicker="Boundaries" headline="The five boundaries"
:::figure id="project-box" caption="Five things a project does to whatever is inside it."
:::

Costs report out of it, which is why teams keep development and production in
separate projects. Access granted on it reaches everything inside. Services are
off until switched on here. Quota is counted here. And deleting it takes the
contents and the bill with it — the most reliable cleanup there is.

:::key
When something does not work in Google Cloud, check three things in this order:
the active project, whether the service is enabled, and permissions.
:::
:::
:::section kicker="Identifiers" headline="Name, ID, and number"
A project has three identifiers, and they serve different purposes.

:::figure id="three-names" caption="The project ID is the identifier that commands and URLs use."
:::

The project ID is unique across all of Google Cloud, so the ID you want might
be unavailable. This is why the console suggests an ID with digits appended.

:::warn
A project ID cannot be changed after the project is created. Choose an ID that
can stay, or accept the suggested one.
:::
:::

:::section kicker="Billing" headline="Billing accounts are separate resources"
A billing account is not part of a project. It is a separate resource, and a
project is linked to it.

:::figure id="billing-link" caption="One billing account can pay for many projects."
:::

A project without a linked billing account can exist and hold resources, but
most services do not work until billing is enabled.

:::note
This separation lets an organization allow engineers to create projects while
keeping every project linked to a central billing account.
:::
:::
