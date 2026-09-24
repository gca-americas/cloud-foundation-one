import { useMemo, useState } from "react";

import { Globe, type Marker } from "./Globe";

/* Four scenarios, in the order the mistake usually gets made.

   The first is easy and establishes the rule. The rest exist because the rule
   is "close to your users", and people reach for "close to me" instead. The
   last one has no single right answer, which is the honest state of most
   real decisions. */

type Question = {
  scenario: string;
  /** Shown on the globe while the question is open, so "closest" is a thing
      you can look at rather than a thing you have to already know. */
  places: Marker[];
  options: { label: string; region?: string; right?: boolean; why: string }[];
};

const QUESTIONS: Question[] = [
  {
    scenario:
      "A retail application based in Chicago where the entire user base resides in the US Midwest.",
    places: [{ name: "Chicago", lon: -87.6, lat: 41.9, note: "business and users" }],
    options: [
      {
        label: "us-central1 · Iowa",
        region: "us-central1",
        right: true,
        why: "Correct. us-central1 (Iowa) is the closest Google Cloud region to users in the US Midwest, minimizing round-trip network latency.",
      },
      {
        label: "us-east4 · Virginia",
        region: "us-east4",
        why: "While functional, routing Midwest traffic to Northern Virginia adds unnecessary geographic distance and round-trip latency.",
      },
      {
        label: "europe-west1 · Belgium",
        region: "europe-west1",
        why: "Routing US Midwest users across the Atlantic introduces significant transoceanic network latency.",
      },
    ],
  },
  {
    scenario:
      "Your engineering team is based in London, and you are deploying a mobile game whose player base is located in Japan.",
    places: [
      { name: "London", lon: -0.1, lat: 51.5, note: "engineering team" },
      { name: "Tokyo", lon: 139.7, lat: 35.7, note: "player base" },
    ],
    options: [
      {
        label: "asia-northeast1 · Tokyo",
        region: "asia-northeast1",
        right: true,
        why: "Correct. Always select the region closest to your end users (Tokyo) rather than the region closest to the engineering team.",
      },
      {
        label: "europe-west2 · London",
        region: "europe-west2",
        why: "Selecting the region nearest the developer rather than the user base forces every player request from Japan to traverse half the globe.",
      },
      {
        label: "us-west1 · Oregon",
        region: "us-west1",
        why: "Deploying in an intermediate region introduces high latency for both the engineering team and the players in Japan.",
      },
    ],
  },
  {
    scenario:
      "A healthcare application in Germany subject to strict national data residency laws requiring patient records to remain within Germany.",
    places: [{ name: "Germany", lon: 10.4, lat: 51.2, note: "regulated data residency" }],
    options: [
      {
        label: "europe-west3 · Frankfurt",
        region: "europe-west3",
        right: true,
        why: "Correct. Legal and regulatory data residency requirements take precedence over all other factors; europe-west3 (Frankfurt) keeps all data within Germany.",
      },
      {
        label: "europe-west1 · Belgium",
        region: "europe-west1",
        why: "Although Belgium is geographically close, storing regulated records outside Germany violates national data residency requirements.",
      },
      {
        label: "us-central1 · Iowa",
        region: "us-central1",
        why: "Storing German healthcare records in the United States violates both national data residency requirements and adds transatlantic latency.",
      },
    ],
  },
  {
    scenario:
      "A SaaS platform serving large active user populations across both Europe and North America, with smaller user groups in Asia-Pacific.",
    places: [
      { name: "Europe", lon: 9.0, lat: 50.0, note: "primary user base" },
      { name: "North America", lon: -90.0, lat: 40.0, note: "primary user base" },
      { name: "Singapore", lon: 103.8, lat: 1.4, note: "secondary user base" },
    ],
    options: [
      {
        label: "Deploy across multiple regions",
        right: true,
        why: "Correct. When large user populations span multiple continents, deploying in multiple regions behind a global load balancer routes each user to the nearest region.",
      },
      {
        label: "Single region in the middle of the Atlantic",
        why: "No data center region exists in the mid-Atlantic, and a midpoint region would deliver suboptimal latency to both continents.",
      },
      {
        label: "Single region near corporate headquarters",
        why: "Selecting a single region based on headquarters location penalizes users on other continents with high cross-continental latency.",
      },
    ],
  },
];

export function RegionQuiz() {
  const [at, setAt] = useState(0);
  // Wrong answers stay on screen with their reason, and the question stays
  // open. Getting it wrong should cost you another look at the globe, not
  // hand you the answer.
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [firstTime, setFirstTime] = useState(0);
  const [answered, setAnswered] = useState(0);

  const question = QUESTIONS[at];
  const places = useMemo(() => question.places, [at]);
  const offered = useMemo(
    () => question.options.map((o) => o.region).filter(Boolean) as string[],
    [at],
  );
  const done = answered === QUESTIONS.length && !solved;

  function choose(index: number) {
    if (solved || wrong.includes(index)) return;

    if (question.options[index].right) {
      setSolved(true);
      setAnswered((n) => n + 1);
      if (wrong.length === 0) setFirstTime((n) => n + 1);
      return;
    }
    setWrong((list) => [...list, index]);
  }

  function next() {
    setWrong([]);
    setSolved(false);
    setAt((n) => (n + 1) % QUESTIONS.length);
  }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: "var(--hairline)", background: "var(--overlay)" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="kicker" style={{ color: "var(--fg-faint)" }}>
          Scenario {at + 1} of {QUESTIONS.length}
        </span>
        <span className="font-mono text-[0.72rem]" style={{ color: "var(--fg-faint)" }}>
          {firstTime}/{answered} first time
        </span>
      </div>

      <p className="mt-2 text-[0.98rem]">{question.scenario}</p>

      <div className="my-3">
        <Globe markers={places} highlight={offered} spinning={false} expandable />
      </div>

      <p className="mt-1 text-sm"
         style={{ color: wrong.length && !solved ? "var(--bad)" : "var(--fg-faint)" }}>
        {solved
          ? "That's the one."
          : wrong.length
            ? "Not that one. Look at the globe again, and try another."
            : "The pins are the places in the question. The ringed dots are the regions on offer. Which one?"}
      </p>

      <ul className="mt-3 space-y-2">
        {question.options.map((option, index) => {
          const isWrong = wrong.includes(index);
          const isRight = solved && option.right === true;
          const spent = isWrong || isRight;
          const colour = isRight
            ? "var(--ok)"
            : isWrong
              ? "var(--bad)"
              : "var(--hairline)";
          return (
            <li key={option.label}>
              <button
                type="button"
                onClick={() => choose(index)}
                disabled={spent || solved}
                className="w-full rounded-xl border px-4 py-2.5 text-left text-sm"
                style={{
                  borderColor: colour,
                  background: spent ? "var(--card)" : "transparent",
                  color: "var(--fg)",
                  opacity: solved && !isRight && !isWrong ? 0.5 : 1,
                  cursor: spent || solved ? "default" : "pointer",
                }}
              >
                <span className="font-medium">{option.label}</span>
                {spent && (
                  <span
                    className="mt-1 block text-[0.82rem]"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {option.why}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {solved && (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={next}
            className="rounded-lg border px-3 py-1.5 text-sm"
            style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
          >
            {at === QUESTIONS.length - 1 ? "Start again" : "Next scenario"}
          </button>
          {done && (
            <span className="text-sm" style={{ color: "var(--fg-muted)" }}>
              Close to your users, unless the law says otherwise.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
