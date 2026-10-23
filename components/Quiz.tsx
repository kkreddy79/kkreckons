"use client";

import { useState } from "react";
import type { Question } from "@/lib/quiz";

/** The weekly quiz: tap an answer to see if it's right and open the story; a score and share line at the end. */
export default function Quiz({ questions, url }: { questions: Question[]; url: string }) {
  const [picks, setPicks] = useState<(number | null)[]>(() => questions.map(() => null));
  const [copied, setCopied] = useState(false);
  const done = picks.every((p) => p !== null);
  const score = picks.filter((p, i) => p === questions[i].answer).length;
  const share = `I got ${score}/${questions.length} on this week's KKReckons quiz. Can you beat it? ${url}`;

  return (
    <div className="qz">
      <ol className="qz-list">
        {questions.map((q, i) => {
          const picked = picks[i];
          return (
            <li key={q.href} className="qz-q">
              <p className="qz-text">
                {q.before}
                <span className="qz-blank">{picked === null ? "?" : q.options[q.answer]}</span>
                {q.after}
              </p>
              <div className="qz-opts" role="group" aria-label={`Question ${i + 1} answers`}>
                {q.options.map((o, k) => {
                  const state = picked === null ? "" : k === q.answer ? " is-right" : k === picked ? " is-wrong" : "";
                  return (
                    <button
                      key={o}
                      type="button"
                      className={`qz-opt${state}`}
                      disabled={picked !== null}
                      aria-pressed={picked === k}
                      onClick={() => setPicks((p) => p.map((v, j) => (j === i ? k : v)))}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <p className="qz-result" role="status">
                  {picked === q.answer ? "Right." : `Not quite: it was ${q.options[q.answer]}.`}{" "}
                  <a href={q.href}>Read the story →</a>
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {done && (
        <div className="qz-score" role="status">
          <b>
            You scored {score} out of {questions.length}.
          </b>
          <span>{score === questions.length ? "Perfect. You really did read the week." : score >= questions.length / 2 ? "Nicely done." : "The stories are all one tap away."}</span>
          <span className="qz-share">
            <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noreferrer">
              Share on WhatsApp
            </a>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(share).then(
                  () => setCopied(true),
                  () => setCopied(false),
                );
              }}
            >
              {copied ? "Copied" : "Copy your score"}
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
