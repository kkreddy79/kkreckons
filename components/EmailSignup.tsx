"use client";

import { useState } from "react";
import { track } from "@/components/Umami";
import { SUBSCRIBE_URL } from "@/lib/links";

/**
 * Email box that signs readers up without leaving the page (through /api/subscribe). If that fails,
 * readers are offered beehiiv's own sign-up page instead, so no one is left stuck.
 */
export default function EmailSignup({ placement, tone = "light" }: { placement: string; tone?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "invalid" | "failed">("idle");

  const submit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const website = (ev.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value;
    setState("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, placement, page: window.location.pathname }),
      });
      if (res.ok) {
        setState("done");
        track("Subscribe", { placement, from: window.location.pathname });
      } else setState(res.status === 400 ? "invalid" : "failed");
    } catch {
      setState("failed");
    }
  };

  if (state === "done") {
    return (
      <p className={`es es-${tone} es-done`} role="status">
        <b>You’re in.</b> Check your inbox to confirm, and tomorrow’s briefing will be there.
      </p>
    );
  }
  const id = `es-${placement}`;
  return (
    <form className={`es es-${tone}`} onSubmit={submit}>
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div className="es-row">
        <input
          id={id}
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="Your email address"
          value={email}
          onChange={(ev) => {
            setEmail(ev.target.value);
            if (state !== "sending") setState("idle");
          }}
          aria-invalid={state === "invalid" || undefined}
          aria-describedby={state === "invalid" || state === "failed" ? `${id}-msg` : undefined}
        />
        <button type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Subscribing…" : "Subscribe free"}
        </button>
      </div>
      {/* Hidden from people; bots tend to fill it in. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="es-hp" aria-hidden />
      {state === "invalid" && (
        <p id={`${id}-msg`} className="es-msg" role="alert">
          That email address doesn’t look right. Please check it and try again.
        </p>
      )}
      {state === "failed" && (
        <p id={`${id}-msg`} className="es-msg" role="alert">
          Something went wrong on our side.{" "}
          <a href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
            Subscribe on beehiiv instead ↗
          </a>
        </p>
      )}
    </form>
  );
}
