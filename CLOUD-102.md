# Cloud 102

What Cloud 101 deliberately leaves out. Each of these was either cut from the
course or never written, and each is a step that could stand on its own.

## Cut from Cloud 101

**Identity and access.** Who is allowed to do what: user accounts and service
accounts, roles, least privilege, and reading a `PERMISSION_DENIED` error for
the three facts it contains. Cloud 101 had this as a step built around a real
failure — a deployed app that cannot reach its own database, because nothing
granted its service account anything.

It splits cleanly into two halves, and conflating them is the usual source of
confusion:

- **Authentication — how a process proves who it is.** Application Default
  Credentials, and why `firestore.Client()` takes no arguments and still works
  in two places. On a laptop or in Cloud Shell, ADC resolves to the person
  signed in. On Cloud Run there is no key file and no secret in the image: ADC
  reaches the metadata server, which issues a short-lived token for the service
  account attached to the service. The teaching point is that the credential is
  never stored anywhere — not in the code, the image, or the settings file.
- **Authorization — what that identity may then do.** An IAM role binding on
  the project, which lives nowhere near the application. `roles/datastore.user`
  is what turns "I am this service" into "I may write these documents".

Two things worth covering once the split is clear:

- **A dedicated service account per service**, rather than the Compute Engine
  default that Cloud Run uses unless told otherwise. One account per workload
  means a compromised app cannot act as every other app in the project.
- **Default grants are not guaranteed.** Older projects often have the default
  service account holding `roles/editor`, so everything works by accident.
  Projects created under current org policy typically grant it nothing, so the
  same deployment succeeds and then fails on the first write. Both states occur
  in the wild, which is exactly why the roles should be granted explicitly.

> **This one has a loose end.** Removing the step did not remove the
> requirement. When DinoQuest is deployed in step 7 it runs as a service
> account, not as you, and that account needs `roles/datastore.user` and
> `roles/aiplatform.user` or the app will not work. `scripts/deploy_app.py`
> grants both as part of the deployment, so the step works without teaching the
> subject — it states that the identity changes, and leaves the mechanism here.

**Failure and resilience.** Zonal, regional and multi-regional as a property
of every resource; what survives a zone losing power and what does not;
redundancy as something bought deliberately rather than a default, priced in
latency and money. Cloud 101 had this as a prediction exercise and no building.
Most projects should not buy multi-region, and knowing why is the lesson.

## Never in Cloud 101

- **Containers, properly.** What an image is, layers, why "works on my machine"
  stops being a sentence people say.
- **Infrastructure as code.** Terraform. The genuine next thing after this
  course.
- **Networking.** VPCs, subnets, load balancers, private connectivity.
- **GKE.** When one container is not enough, and what a cluster costs you.
- **The data platform.** BigQuery, pipelines, and asking questions of
  everything that ever happened.
- **CI/CD.** Deploying from a repository rather than from a laptop.
