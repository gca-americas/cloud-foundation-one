:::section kicker="Infrastructure" headline="Data centers and regions"
Cloud resources run in specific physical places.

**A data center is a building.** Thousands of computers in rows, a lot of
electricity arriving, a lot of heat leaving.

**A region is a group of those buildings** in one part of the world, close
enough together to behave as one place. `us-central1` is a region, in Iowa.
`asia-northeast1` is a region, in Tokyo.

When you create something in Google Cloud, you choose its region. That is the
decision this section is about.
:::

:::section kicker="Network" headline="Global fiber network"
:::figure id="globe" caption="Each dot is a region. The lines between them are Google's own network, not the public internet."
:::

Drag the globe. The dots are regions, scattered so that most of the world has
one within a few thousand kilometres.

The lines matter as much as the dots. Traffic between regions travels mostly
over the provider's private network, including its undersea cables. That is why
a request from London to Tokyo behaves better than the distance suggests — it
is not taking the public internet's route.
:::

:::section kicker="Performance" headline="Distance and network latency"
Light travels through fibre at roughly 200,000 kilometres per second. That is a
limit no hardware raises.

London to Sydney is about 17,000 kilometres, so a round trip is about 170
milliseconds before any computer does anything at all. Real paths are not
straight lines, so the real figure is higher.

| User | App | Round trip |
|---|---|---|
| London | London | about 5 ms |
| London | Virginia | about 80 ms |
| London | Sydney | about 250 ms |

Your code runs at the same speed in all three. The only thing that changed is
how far the request had to go.
:::

:::section kicker="Selection" headline="Criteria for selecting a region"
:::key
Choose the region nearest the people who will use the thing — not the region
nearest you.
:::

That sounds obvious and it is the mistake almost everyone makes. You feel your
own latency every time you deploy, and you never feel your users'.

Specific constraints can override it:

- **Data residency.** Some data is legally required to stay in a country. When
  that applies, it decides, and you choose inside that constraint.
- **Service availability.** Not every service exists in every region. If
  something refuses to deploy somewhere, check this before looking for anything
  more complicated.

And when your users are genuinely everywhere, no single region is close to them
all. The answer is more than one region, which costs more and is more to look
after — so it waits until the users are real.
:::
