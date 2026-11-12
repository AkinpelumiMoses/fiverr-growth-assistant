"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const navigation = [
  ["The idea", "#the-idea"],
  ["What MILE does", "#what-mile-does"],
  ["How it works", "#how-it-works"],
  ["Our approach", "#our-approach"],
];

const pillars = [
  {
    number: "01",
    title: "Find your people",
    description:
      "Meet freelancers whose skills complement yours. Build relationships that make good work possible.",
  },
  {
    number: "02",
    title: "Share real opportunities",
    description:
      "Put a project in front of people who can help, or find work shared by someone who needs your skills.",
  },
  {
    number: "03",
    title: "Make room for better work",
    description:
      "Bring in the right support when a project grows beyond your capacity. Good opportunities should not have to be turned away.",
  },
  {
    number: "04",
    title: "Keep moving forward",
    description:
      "Use practical resources and tools to make more informed decisions as you build your independent career.",
  },
];

const steps = [
  ["01", "Set up your profile", "Tell the community what you do, what you are good at and where you can contribute."],
  ["02", "Explore the network", "Find people, skills and opportunities across different areas of independent work."],
  ["03", "Start a conversation", "Reach out, discuss the work and decide together whether it is the right fit."],
  ["04", "Build something together", "Turn a useful introduction into a working relationship and keep growing."],
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="mile-home">
      <header className="mile-header">
        <div className="mile-header-inner">
          <Link href="/" className="mile-brand" aria-label="MILE home">
            <span className="mile-brand-mark">M</span>
            <span className="mile-brand-copy">
              <strong>MILE</strong>
              <small>EVERY STEP HAS A PURPOSE</small>
            </span>
          </Link>

          <nav className="mile-desktop-nav" aria-label="Main navigation">
            {navigation.map(([label, href]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </nav>

          <div className="mile-header-actions">
            <Link href="/login" className="mile-login">Log in</Link>
            <Link href="/signup" className="mile-button mile-button-dark">
              Join MILE <ArrowRight size={15} />
            </Link>
          </div>

          <button
            className="mile-menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {menuOpen && (
          <div className="mile-mobile-menu">
            {navigation.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <Link href="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
            <Link href="/signup" className="mile-mobile-join" onClick={() => setMenuOpen(false)}>
              Join MILE <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </header>

      <section className="mile-hero" aria-labelledby="mile-hero-title">
        <div className="mile-hero-image" role="img" aria-label="A group of independent professionals working together" />
        <div className="mile-hero-shade" />
        <div className="mile-hero-content">
          <div className="mile-hero-copy">
            <p className="mile-eyebrow mile-eyebrow-light">A network for independent work</p>
            <h1 id="mile-hero-title">
              Good work moves<br />
              <em>further together.</em>
            </h1>
            <p className="mile-hero-description">
              MILE brings freelancers into one place to meet the right people, share opportunities and find the support to do their best work.
            </p>
            <div className="mile-hero-actions">
              <Link href="/signup" className="mile-button mile-button-green">
                Become part of MILE <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="mile-text-link-light">See how it works</a>
            </div>
          </div>

          <div className="mile-hero-note">
            <span className="mile-hero-note-number">01 / THE BELIEF</span>
            <p>Independent in your work.<br /><strong>Connected in your journey.</strong></p>
            <span className="mile-hero-note-rule" />
          </div>
        </div>
        <div className="mile-hero-footer">
          <span>PEOPLE · OPPORTUNITY · PROGRESS</span>
          <span>BUILT FOR THE WAY FREELANCERS WORK</span>
        </div>
      </section>

      <section id="the-idea" className="mile-founder-section">
        <div className="mile-founder-layout">
          <div className="mile-founder-image-column">
            <div className="mile-founder-image-frame">
              <img
                src="https://myportfolio.creatiftechnologies.com.ng/images/A2S_5186c.jpg%20(1).jpeg"
                alt="Akinpelumi Moses Temitope, founder of MILE"
                className="mile-founder-image"
              />
            </div>
            <div className="mile-founder-image-caption">
              <span>AKINPELUMI MOSES TEMITOPE</span>
              <span>FOUNDER, MILE</span>
            </div>
          </div>

          <div className="mile-founder-copy">
            <p className="mile-eyebrow"><span /> A NOTE FROM THE FOUNDER</p>
            <h2>
              I believe the people we meet can change the distance we travel.
            </h2>
            <p className="mile-founder-lead">
              The name MILE draws inspiration from the story of Moses — a story associated with leadership, direction and helping people move towards a better place.
            </p>
            <p>
              That idea means something to me because I understand that building a freelance career is not always straightforward. There are seasons when work is uncertain, projects become too demanding, or a new opportunity calls for a skill you do not have on your own.
            </p>
            <p>
              Too often, freelancers are expected to figure everything out alone. Yet some of the best progress happens when someone shares knowledge, makes an introduction, recommends a capable person or chooses to work alongside you.
            </p>
            <p>
              I wanted to create a place where those connections could happen more naturally. A place where freelancers from Fiverr, Upwork, independent practice and direct client work can find one another, exchange opportunities and build together.
            </p>
            <p>
              MILE is being built around that belief. The tools have their place, but the people will always come first. I hope this becomes a space where a small introduction can lead to meaningful work, and where no one has to mistake independence for isolation.
            </p>
            <div className="mile-founder-signature">
              <strong>Akinpelumi Moses Temitope</strong>
              <span>Founder &amp; Builder, MILE</span>
            </div>
          </div>
        </div>
      </section>

      <section id="what-mile-does" className="mile-purpose-section">
        <div className="mile-section-heading">
          <p className="mile-eyebrow">WHY MILE EXISTS</p>
          <h2>What MILE is here<br /><em>to make easier.</em></h2>
          <p>
            Freelance work comes with real challenges. MILE is designed to make the human side of that journey easier to navigate.
          </p>
        </div>

        <div className="mile-purpose-list">
          {pillars.map((pillar) => (
            <article className="mile-purpose-item" key={pillar.number}>
              <span className="mile-purpose-number">{pillar.number}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
              <span className="mile-purpose-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="mile-network-section">
        <div className="mile-network-intro">
          <p className="mile-eyebrow mile-eyebrow-light">MORE THAN A DIRECTORY</p>
          <h2>A network that<br /><em>works around people.</em></h2>
          <p>
            MILE is not built around one marketplace. It is for people building independent careers wherever their work happens.
          </p>
        </div>
        <div className="mile-network-details">
          <article>
            <span>01 — DISCOVER</span>
            <h3>People with skills to share.</h3>
            <p>Explore a growing community of freelancers across creative, technical and professional fields.</p>
          </article>
          <article>
            <span>02 — COLLABORATE</span>
            <h3>More hands for the work.</h3>
            <p>Find collaborators, ask for support and connect with people who can help move a project forward.</p>
          </article>
          <article>
            <span>03 — GROW</span>
            <h3>Useful tools for the journey.</h3>
            <p>Access practical resources for your freelance workflow, including tools that support work on platforms such as Fiverr.</p>
          </article>
        </div>
      </section>

      <section id="how-it-works" className="mile-steps-section">
        <div className="mile-section-heading mile-steps-heading">
          <p className="mile-eyebrow">HOW IT WORKS</p>
          <h2>Make a connection.<br /><em>Make the next move.</em></h2>
          <p>
            Getting started should feel clear. MILE gives you a simple path from being part of the community to finding people and working together.
          </p>
        </div>
        <div className="mile-steps-list">
          {steps.map(([number, title, description]) => (
            <article className="mile-step" key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <ArrowRight size={17} />
            </article>
          ))}
        </div>
      </section>

      <section id="our-approach" className="mile-belief-section">
        <div className="mile-belief-image" role="img" aria-label="A shared creative workspace" />
        <div className="mile-belief-copy">
          <p className="mile-eyebrow">THE MILE APPROACH</p>
          <h2>Independent does not have to mean <em>alone.</em></h2>
          <p>
            We believe a stronger freelance community is one where people can find one another, share what they know and create opportunities together.
          </p>
          <p>
            MILE does not promise clients, rankings or guaranteed income. It is being built to make useful connections, collaboration and practical support easier to find.
          </p>
          <Link href="/signup" className="mile-inline-link">
            Find your place in MILE <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="mile-final-cta">
        <div>
          <p className="mile-eyebrow mile-eyebrow-light">EVERY STEP HAS A PURPOSE</p>
          <h2>Your next step<br /><em>could start with someone.</em></h2>
        </div>
        <Link href="/signup" className="mile-button mile-button-green">
          Join the community <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="mile-footer">
        <Link href="/" className="mile-footer-brand">MILE<span>.</span></Link>
        <p>A place for freelancers to connect, collaborate and move forward.</p>
        <span>© {new Date().getFullYear()} MILE</span>
      </footer>
    </main>
  );
}
