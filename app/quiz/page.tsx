import type { Metadata } from "next";
import Link from "next/link";
import Banner from "@/components/Banner";
import Quiz from "@/components/Quiz";
import SubscribeBox from "@/components/SubscribeBox";
import { shortDate } from "@/lib/editions";
import { weeklyQuiz } from "@/lib/quiz";
import { SITE_URL } from "@/lib/site";

const quiz = weeklyQuiz();
const range = `${shortDate(quiz.start)}–${shortDate(quiz.end)}`;

export const metadata: Metadata = {
  title: `The weekly quiz, ${range}: ${quiz.questions.length} questions on the week's numbers`,
  description: `How closely did you follow the news? ${quiz.questions.length} quick questions on the week's key figures, from KKReckons' daily briefings.`,
  alternates: { canonical: "/quiz" },
};

export default function QuizPage() {
  return (
    <main className="cu">
      <Banner />
      <div className="cu-wrap">
        <section className="cu-hero" aria-labelledby="qz-title">
          <p className="ab-kicker">Weekly quiz · {range}</p>
          <h1 id="qz-title">How closely did you follow the week?</h1>
          <p className="cu-lede">
            {quiz.questions.length >= 3
              ? `${quiz.questions.length} questions on the week's key numbers. Tap an answer; every question links to its story.`
              : "This week's quiz isn't ready yet. It's built from the figures in each day's stories, so check back after a few more editions."}
          </p>
        </section>
        {quiz.questions.length >= 3 && <Quiz questions={quiz.questions} url={`${SITE_URL}/quiz`} />}
        <p className="tp-more">
          Missed some? <Link href="/week">Read the week in 8 stories →</Link>
        </p>
        <SubscribeBox />
      </div>
    </main>
  );
}
