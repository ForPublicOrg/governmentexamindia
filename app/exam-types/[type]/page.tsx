import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExamCollection } from "@/components/ExamCollection";
import { examTypeOptions, getExamType } from "@/lib/discovery";
import { exams } from "@/lib/exams";

export function generateStaticParams() {
  return examTypeOptions.map((type) => ({ type: type.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const type = getExamType((await params).type);
  if (!type) return {};
  return {
    title: `${type.value} exams`,
    description: type.description,
    alternates: { canonical: `/exam-types/${type.slug}` },
  };
}

export default async function ExamTypePage({ params }: { params: Promise<{ type: string }> }) {
  const type = getExamType((await params).type);
  if (!type) notFound();
  const matching = exams.filter((item) => item.examTypes.includes(type.value));

  return (
    <div className="page-shell collection-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/exam-types">Exam types</Link><span>›</span><span>{type.value}</span></nav>
      <div className="collection-hero">
        <div><span className="eyebrow">Exam type</span><h1>{type.value}</h1><p>{type.description}</p></div>
        <dl><div><dt>Cycles</dt><dd>{matching.length}</dd></div></dl>
      </div>
      <section className="collection-section" aria-label={`${type.value} recruitment cycles`}><ExamCollection items={matching} /></section>
    </div>
  );
}
