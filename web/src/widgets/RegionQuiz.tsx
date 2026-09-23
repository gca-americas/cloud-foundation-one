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
      "A shop in Chicago. Everyone who uses the site lives in and around Chicago.",
    places: [{ name: "Chicago", lon: -87.6, lat: 41.9, note: "shop and customers" }],
    options: [
      {
        label: "us-central1 · Iowa",
        region: "us-central1",
        right: true,
        why: "The nearest region to both you and your users. When they are in the same place, this is the whole decision.",
      },
      {
        label: "us-east4 · Virginia",
        region: "us-east4",
        why: "It works, and every request crosses most of a continent it did not need to.",
      },
      {
        label: "europe-west1 · Belgium",
        region: "europe-west1",
        why: "An ocean away from everyone who uses it.",
      },
    ],
  },
  {
    scenario:
      "You are in London. You built a game, and almost all the players are in Japan.",
    places: [
      { name: "London", lon: -0.1, lat: 51.5, note: "you" },
      { name: "Tokyo", lon: 139.7, lat: 35.7, note: "the players" },
    ],
    options: [
      {
        label: "asia-northeast1 · Tokyo",
        region: "asia-northeast1",
        right: true,
        why: "Close to the players, not to you. You deploy once and wait a few seconds; they wait on every request, all day.",
      },
      {
        label: "europe-west2 · London",
        region: "europe-west2",
        why: "This is the common mistake: choosing the region nearest the developer. Your latency is not the one that matters.",
      },
      {
        label: "us-west1 · Oregon",
        region: "us-west1",
        why: "A halfway house that is far from both of you.",
      },
    ],
  },
  {
    scenario:
      "A German health service. The law says patient records may not leave Germany.",
    places: [{ name: "Germany", lon: 10.4, lat: 51.2, note: "patients, and the law" }],
    options: [
      {
        label: "europe-west3 · Frankfurt",
        region: "europe-west3",
        right: true,
        why: "Residency is not a preference you trade against latency. When it applies, it decides, and everything else is chosen inside that constraint.",
      },
      {
        label: "europe-west1 · Belgium",
        region: "europe-west1",
        why: "Closer to some users, and in the wrong country. Fast and illegal is not a trade-off.",
      },
      {
        label: "us-central1 · Iowa",
        region: "us-central1",
        why: "Cheaper, and the records are in the wrong continent.",
      },
    ],
  },
  {
    scenario:
      "A company with a lot of users in Europe, a lot in North America, and a few everywhere else.",
    places: [
      { name: "Europe", lon: 9.0, lat: 50.0, note: "a lot of users" },
      { name: "North America", lon: -90.0, lat: 40.0, note: "a lot of users" },
      { name: "Singapore", lon: 103.8, lat: 1.4, note: "a few" },
    ],
    options: [
      {
        label: "Run in more than one region",
        right: true,
        why: "Nobody can be close to everyone from one place. Two regions, users sent to the nearer one. It costs more and it is more to look after — which is why you only do it once the users are real.",
      },
      {
        label: "One region, in the middle of the Atlantic",
        why: "There is no region there, and even if there were it would be mediocre for everyone rather than good for anyone.",
      },
      {
        label: "One region, wherever the head office is",
        why: "The most common way this gets decided, and it optimises for the org chart rather than the users.",
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
