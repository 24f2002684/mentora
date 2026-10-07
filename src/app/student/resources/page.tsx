"use client";

import React from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { BookOpen, ExternalLink, Lightbulb, Compass, Award, Bookmark } from "lucide-react";

export default function StudentResourcesPage() {
  const resourceCategories = [
    {
      title: "Course & Core Academics",
      description: "Foundational materials in data science, rigorous problem formulation, and discrete logic.",
      icon: BookOpen,
      links: [
        {
          title: "MIT OpenCourseWare: Mathematics for Computer Science",
          description: "Discrete math, proof techniques, graph theory, and probability essentials.",
          url: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/",
          tag: "Academic Knowledge",
        },
        {
          title: "Stanford CS229: Machine Learning Lecture Notes",
          description: "Rigorous mathematical derivations of core ML models and optimization methods.",
          url: "https://cs229.stanford.edu/",
          tag: "Domain Rigor",
        },
      ],
    },
    {
      title: "Focus Area: AI & Public Impact",
      description: "Ethics, algorithmic governance, and technology for social good.",
      icon: Compass,
      links: [
        {
          title: "Partnership on AI: Fairness, Transparency & Accountability",
          description: "Industry and research benchmarks for evaluating demographic bias in ML.",
          url: "https://partnershiponai.org/",
          tag: "Analytical Thinking",
        },
        {
          title: "ACM Conference on Fairness, Accountability, and Transparency (FAccT)",
          description: "Key proceedings on socio-technical impacts and algorithmic auditing.",
          url: "https://facctconference.org/",
          tag: "Innovative Thinking",
        },
      ],
    },
    {
      title: "VRCF Core Learning: Critical Thinking & Socratic Inquiry",
      description: "Cognitive frameworks, fallacies, argument deconstruction, and leadership communication.",
      icon: Lightbulb,
      links: [
        {
          title: "The Socratic Method: A Practitioner's Primer for Problem Solvers",
          description: "Techniques for questioning assumptions and identifying hidden premises in complex claims.",
          url: "https://plato.stanford.edu/entries/socrates/",
          tag: "Critical Thinking",
        },
        {
          title: "Paul-Elder Framework for Critical Thinking",
          description: "Intellectual standards: clarity, accuracy, precision, relevance, depth, and breadth.",
          url: "https://www.criticalthinking.org/",
          tag: "Logical Reasoning",
        },
      ],
    },
    {
      title: "Career Development & Leadership",
      description: "Mentorship preparation, fellowship proposals, and professional communication.",
      icon: Award,
      links: [
        {
          title: "The Effective Engineer: High-Leverage Thinking",
          description: "Frameworks for prioritizing impact, clear technical writing, and leadership.",
          url: "https://www.effectiveengineer.com/",
          tag: "Leadership",
        },
        {
          title: "Harvard Kennedy School: Policy Memo Formulation",
          description: "Structure concise, decision-ready memos that influence stakeholders.",
          url: "https://shorensteincenter.org/policy-memo-primer/",
          tag: "Communication",
        },
      ],
    },
  ];

  return (
    <DashboardShell allowedRole="student">
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-2 border-b border-theme">
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Curated Knowledge Base
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
            Scholar Resources &amp; Readings
          </h1>
          <p className="text-sm text-muted-theme mt-1">
            Hand-selected resources curated by VRCF trustees and mentors to support your academic and leadership journey.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resourceCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.title} className="card-theme p-6 md:p-8 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-primary-theme">{cat.title}</h2>
                      <p className="text-xs text-muted-theme">{cat.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    {cat.links.map((link) => (
                      <a
                        key={link.title}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block p-3.5 rounded-xl border border-theme bg-black/[0.01] dark:bg-white/[0.01] hover:border-teal-500/50 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-xs md:text-sm text-primary-theme group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {link.title}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-theme shrink-0 mt-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                        </div>
                        <p className="text-xs text-muted-theme mt-1 leading-relaxed">
                          {link.description}
                        </p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/5 dark:bg-white/5 text-muted-theme">
                          {link.tag}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
