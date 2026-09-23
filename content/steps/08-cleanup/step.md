> **Draft.** Outline only — at the same stage as steps 7 and 9.

- **What you are actually billed for.** Four things, and everyone is surprised
  by exactly one of them:
  - compute time — the container, while it is running
  - storage — the database and the container image, whether or not anyone asks
  - requests — per call, including the model
  - egress — data leaving Google's network, which is the one nobody expects
- Read the real number: open the billing report for this project and find the
  line items above in it. This is the first time the course shows a bill rather
  than talking about one.
- Scale to zero is not the same as costing zero. The container is free when
  idle; the image in Artifact Registry and the rows in Firestore are not.
- **Deleting is a habit, not an afterthought.** The budget alert from step 2
  tells you afterwards. Deleting what you stopped using is what makes the alert
  never fire.
- Delete in the reverse order you built: the service, then the image, then the
  database. Say why that order — nothing should be deleted while something
  still points at it.
- What survives on purpose: the project itself, the billing account, and the
  budget. Those are the only things the workbench will not delete for you.
- **Close the loop with step 1.** Owning meant the machine was there whether or
  not you used it. Renting means this step exists — and takes two minutes.
