:::section kicker="Infrastructure" headline="Data centers and regions"
Google Cloud resources run in physical facilities distributed around the world:

- **Data center**: A physical facility housing compute servers, storage arrays, power distribution systems, and cooling infrastructure.
- **Region**: A specific geographic location containing multiple data centers connected by high-speed, low-latency fiber networks (for example, `us-central1` in Iowa or `asia-northeast1` in Tokyo).

When you provision regional resources such as a Firestore database or a Cloud Run service, you specify the region where those resources execute and store data.
:::

:::section kicker="Network" headline="Global fiber network"
:::figure id="globe" caption="Google Cloud regions interconnected by Google's private global fiber network."
:::

You can rotate the interactive globe above to inspect Google Cloud's regional footprint.

Traffic between Google Cloud regions travels across Google's private backbone network—including dedicated subsea fiber cables—rather than traversing the public internet. This architecture provides consistent cross-region throughput and lower packet loss.
:::

:::section kicker="Performance" headline="Distance and network latency"
Optical signals travel through fiber at approximately 200,000 kilometers per second. Physical distance therefore sets a hard lower bound on network round-trip time (RTT) regardless of server performance.

| Client Location | Application Region | Approximate Round-Trip Latency |
|---|---|---|
| London | London (`europe-west2`) | ~5 ms |
| London | Northern Virginia (`us-east4`) | ~80 ms |
| London | Sydney (`australia-southeast1`) | ~250 ms |

Application code executes at the same speed in each region; the difference in response time is determined by the physical distance between the client and the target region.
:::

:::section kicker="Selection" headline="Criteria for selecting a region"
:::key
Select the region closest to your primary users to minimize network latency, rather than the region closest to your development machine.
:::

Two architectural constraints can take precedence over user proximity:
- **Data residency and compliance**: Regulatory or legal requirements may mandate that data be stored and processed within a specific country or jurisdiction.
- **Service and product availability**: Certain hardware accelerators, foundation models, or preview services are available only in specific regions.

When an application serves a globally distributed audience, teams deploy across multiple regions behind a global load balancer. Because multi-region architectures increase cost and operational complexity, start with a single primary region near your initial user base.
:::
