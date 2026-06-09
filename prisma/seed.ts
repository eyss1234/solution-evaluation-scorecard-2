import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// Gate questions
// ---------------------------------------------------------------------------

const gateQuestions = [
  {
    order: 1,
    text: "Does the solution directly enable or advance a strategic initiative?",
  },
  {
    order: 2,
    text: "Will the solution replace, retire, or consolidate multiple existing applications?",
  },
  {
    order: 3,
    text: "Will capital expenditure exceed £150k across the next three years?",
  },
  {
    order: 4,
    text: "Will the solution handle personal or sensitive data, or introduce regulatory considerations?",
  },
  {
    order: 5,
    text: "Will the solution integrate with business-critical systems containing financial, operational, or confidential information?",
  },
  {
    order: 6,
    text: "Would a failure of the solution result in material impact (e.g., operational disruption, reputational damage, or financial loss)?",
  },
  {
    order: 7,
    text: "Will the solution require significant internal resources (e.g., BAs, developers, SMEs) to deliver or maintain?",
  },
  {
    order: 8,
    text: "Is the long-term maintainability uncertain (e.g., vendor sustainability, support challenges, reliance on niche skills)?",
  },
  {
    order: 9,
    text: "Does the solution risk generating technical debt or duplicating existing capabilities?",
  },
  {
    order: 10,
    text: "Will the solution impact more than 50 users, an entire department, or core business-critical processes?",
  },
  {
    order: 11,
    text: "Would a structured evaluation or scorecard help validate the decision?",
  },
];

// ---------------------------------------------------------------------------
// Scorecard questions
// ---------------------------------------------------------------------------

const scorecardQuestions = [
  // ── Step 1: Business & Functional Fit (step weight 30%) ──────────────────

  {
    stepNumber: 1,
    order: 1,
    weight: 20,
    text: "What proportion of our must-have requirements are met with out-of-the-box capabilities?",
    criteria: [
      {
        score: 0,
        description:
          "Cannot meet one or more must-have requirements. The solution has a fundamental capability gap that cannot be addressed through configuration, leaving a critical business need unmet.",
      },
      {
        score: 1,
        description:
          "Meets fewer than 50% of must-have requirements. Significant gaps exist across core capability areas, requiring substantial custom development or process redesign to compensate.",
      },
      {
        score: 2,
        description:
          "Meets 50–70% of must-have requirements. Notable gaps remain in core areas; addressing them would require significant configuration effort or bespoke development with associated risk.",
      },
      {
        score: 3,
        description:
          "Meets 70–85% of must-have requirements. Minor capability gaps exist but are addressable through supported configuration, extensions, or low-risk workarounds already validated with the vendor.",
      },
      {
        score: 4,
        description:
          "Meets 85–95% of must-have requirements out-of-the-box. Any remaining gaps are small in scope, well understood, and addressable with minimal effort or standard configuration.",
      },
      {
        score: 5,
        description:
          "Meets all must-have requirements out-of-the-box with no customisation required. Every critical business need is fully supported by the product as delivered.",
      },
    ],
  },

  {
    stepNumber: 1,
    order: 2,
    weight: 5,
    text: "What proportion of our should-have requirements are met?",
    criteria: [
      {
        score: 0,
        description:
          "Meets fewer than 20% of should-have requirements. The solution delivers very little beyond the must-haves, offering negligible added value or future flexibility.",
      },
      {
        score: 1,
        description:
          "Meets 20–40% of should-have requirements. Significant secondary capabilities are absent, meaning meaningful workarounds or additional tools will be needed.",
      },
      {
        score: 2,
        description:
          "Meets 40–60% of should-have requirements. Some useful capabilities are present, but notable gaps mean the solution delivers only partial value in several desired areas.",
      },
      {
        score: 3,
        description:
          "Meets 60–75% of should-have requirements. The majority of secondary needs are addressed; remaining gaps are manageable and unlikely to materially impact user adoption or value.",
      },
      {
        score: 4,
        description:
          "Meets 75–90% of should-have requirements. Almost all secondary capabilities are present; any remaining gaps are minor and would not noticeably diminish the business benefit.",
      },
      {
        score: 5,
        description:
          "Meets 90% or more of should-have requirements. The solution delivers strong coverage across both primary and secondary needs, maximising value and reducing dependency on supplementary tools.",
      },
    ],
  },

  {
    stepNumber: 1,
    order: 3,
    weight: 5,
    text: "Is the solution viable for expected future growth?",
    criteria: [
      {
        score: 0,
        description:
          "Not viable for future growth. The solution's architecture or licensing model cannot accommodate projected increases in users, data volumes, or business complexity.",
      },
      {
        score: 1,
        description:
          "Significant scalability concerns. At current growth trajectories the solution is likely to require replacement or major rearchitecting within two years.",
      },
      {
        score: 2,
        description:
          "Limited scalability headroom. Growth beyond near-term projections will require significant investment, workarounds, or architectural changes that introduce risk.",
      },
      {
        score: 3,
        description:
          "Adequate for projected growth with planned investment. The solution can scale to meet anticipated demands, though capacity planning and some additional cost will be required.",
      },
      {
        score: 4,
        description:
          "Good scalability. The solution is well-architected for growth; scaling to meet projected demands involves minimal friction, with clear and cost-effective scaling paths available.",
      },
      {
        score: 5,
        description:
          "Excellent scalability. The solution is designed for enterprise-scale growth, with elastic capacity, no foreseeable ceiling within the business's planning horizon, and favourable unit economics at scale.",
      },
    ],
  },

  // ── Step 2: Technical & Architectural Fit (step weight 20%) ──────────────

  {
    stepNumber: 2,
    order: 1,
    weight: 5,
    text: "How compatible is the solution with our current technology stack and infrastructure?",
    criteria: [
      {
        score: 0,
        description:
          "Fundamentally incompatible with our technology stack. Adoption would require significant infrastructure changes, new platforms, or the replacement of existing foundational components.",
      },
      {
        score: 1,
        description:
          "Major compatibility issues. Substantial rework of existing infrastructure or middleware is required to make the solution operable in our environment.",
      },
      {
        score: 2,
        description:
          "Moderate compatibility issues. The solution requires notable integration work and some technology changes, introducing delivery risk and increased implementation effort.",
      },
      {
        score: 3,
        description:
          "Mostly compatible with our stack. Minor adjustments, middleware, or adapter layers are needed, but no fundamental infrastructure changes are required.",
      },
      {
        score: 4,
        description:
          "Good compatibility. The solution integrates well with our existing stack with minimal changes; any adjustments are straightforward and low-risk.",
      },
      {
        score: 5,
        description:
          "Fully compatible. The solution integrates natively with our existing technology stack and infrastructure, requiring no changes to foundational components.",
      },
    ],
  },

  {
    stepNumber: 2,
    order: 2,
    weight: 2.5,
    text: "Are the APIs and integration capabilities sufficient for our integration requirements?",
    criteria: [
      {
        score: 0,
        description:
          "No meaningful API or integration capability. Required integrations are not feasible without prohibitive custom development or vendor-supplied point-to-point solutions.",
      },
      {
        score: 1,
        description:
          "Very limited API coverage. The available APIs cannot meet the majority of our integration requirements, leaving critical data flows unsupported.",
      },
      {
        score: 2,
        description:
          "Basic API available but with significant gaps. Core integration needs can partially be addressed, but notable workarounds or additional middleware will be required.",
      },
      {
        score: 3,
        description:
          "Adequate API coverage. Most integration requirements can be met; some workarounds or supplementary tooling are needed for the remaining edge cases.",
      },
      {
        score: 4,
        description:
          "Comprehensive API. All required integrations are achievable with minimal effort; documentation is clear and SDKs or pre-built connectors are available for key platforms.",
      },
      {
        score: 5,
        description:
          "Excellent integration capability. The API is well-documented, versioned, and covers all our integration needs. Webhook and event-driven patterns are supported, enabling real-time, decoupled integrations.",
      },
    ],
  },

  {
    stepNumber: 2,
    order: 3,
    weight: 2.5,
    text: "Does the solution support our identity management and SSO requirements?",
    criteria: [
      {
        score: 0,
        description:
          "No SSO or enterprise identity support. The solution manages authentication in isolation, with no integration to our identity provider, creating security and access management risks.",
      },
      {
        score: 1,
        description:
          "Very limited identity support. The solution does not meet our core SSO or directory integration requirements, necessitating separate credential management.",
      },
      {
        score: 2,
        description:
          "Basic SSO support. Standard protocols are partially supported, but coverage is incomplete — some user populations or identity flows cannot be addressed without additional work.",
      },
      {
        score: 3,
        description:
          "Adequate SSO and identity support. Core requirements for single sign-on and directory integration are met; minor gaps exist but are manageable.",
      },
      {
        score: 4,
        description:
          "Good identity support. The solution integrates well with our identity provider, supports MFA, and meets all key access management requirements with minor limitations.",
      },
      {
        score: 5,
        description:
          "Full enterprise identity support. Native integration with our identity providers (e.g. SAML 2.0, OIDC), comprehensive RBAC, MFA enforcement, and automated provisioning/deprovisioning are all supported.",
      },
    ],
  },

  {
    stepNumber: 2,
    order: 4,
    weight: 2.5,
    text: "How well does the solution support data portability and our BI/reporting requirements?",
    criteria: [
      {
        score: 0,
        description:
          "Data is effectively locked in. No meaningful export capability or BI integration exists, making it impossible to access our data for reporting or use in other tools.",
      },
      {
        score: 1,
        description:
          "Very limited data access. Export options are minimal and insufficient for our reporting needs; significant manual effort would be required to surface useful insights.",
      },
      {
        score: 2,
        description:
          "Basic data export available. Standard file-based exports are possible, but BI integration is limited and real-time or automated data access is not supported.",
      },
      {
        score: 3,
        description:
          "Adequate data portability. Standard BI connectors or APIs are available; most reporting requirements can be met, though some development effort may be needed.",
      },
      {
        score: 4,
        description:
          "Good data access. Strong export capabilities and established BI connectors make it straightforward to integrate with our analytics tooling and deliver accurate reporting.",
      },
      {
        score: 5,
        description:
          "Excellent data portability. Open, well-documented APIs with native connectors for major BI platforms. Real-time data access, webhooks, and streaming support enable comprehensive, live analytics.",
      },
    ],
  },

  {
    stepNumber: 2,
    order: 5,
    weight: 2.5,
    text: "What are the solution's uptime SLAs and resilience characteristics?",
    criteria: [
      {
        score: 0,
        description:
          "No SLA offered or resilience features present. The solution provides no contractual availability commitments; downtime risk is high and unmitigated.",
      },
      {
        score: 1,
        description:
          "SLA below 99% or no meaningful failover capability. Availability commitments are insufficient for business use and provide no protection against extended outages.",
      },
      {
        score: 2,
        description:
          "99% SLA (~87 hours downtime/year). Basic resilience is present but meaningful planned or unplanned downtime is possible, which may be unacceptable for key business processes.",
      },
      {
        score: 3,
        description:
          "99.5% SLA (~44 hours downtime/year). Adequate resilience for non-critical workloads; recovery processes are defined but not rapid enough for business-critical dependency.",
      },
      {
        score: 4,
        description:
          "99.9% SLA (~9 hours downtime/year). Strong availability commitments with automated failover; suitable for most business-critical workloads with financial penalties for breaches.",
      },
      {
        score: 5,
        description:
          "99.95% or higher SLA (~4 hours downtime/year). Enterprise-grade resilience with multi-region redundancy, automated disaster recovery, transparent status reporting, and contractual remedies.",
      },
    ],
  },

  {
    stepNumber: 2,
    order: 6,
    weight: 2.5,
    text: "How comprehensive is the vendor's migration tooling and onboarding support?",
    criteria: [
      {
        score: 0,
        description:
          "No migration tools available. Data migration is entirely manual, with no vendor guidance or tooling, introducing high risk of data loss or corruption during cutover.",
      },
      {
        score: 1,
        description:
          "Very limited tooling. Only basic export/import utilities exist; the migration is largely manual, placing significant risk and effort on the internal team.",
      },
      {
        score: 2,
        description:
          "Basic migration utilities. Some automated tools exist for common scenarios, but significant manual effort remains for data transformation, validation, and edge cases.",
      },
      {
        score: 3,
        description:
          "Adequate migration tooling. Purpose-built tools cover the main migration scenarios; some manual steps are needed for complex data structures or legacy formats.",
      },
      {
        score: 4,
        description:
          "Good migration tooling with vendor support. A structured migration framework is provided, supported by vendor-led onboarding, data validation tooling, and clear documentation.",
      },
      {
        score: 5,
        description:
          "Comprehensive, automated migration support. End-to-end tooling handles data extraction, transformation, validation, and load. Dedicated vendor migration services and a tested rollback plan are included.",
      },
    ],
  },

  {
    stepNumber: 2,
    order: 7,
    weight: 2.5,
    text: "How clear and achievable is the exit strategy if we need to leave this solution?",
    criteria: [
      {
        score: 0,
        description:
          "No viable exit strategy. Data and processes are deeply locked in; transitioning away would require prohibitive effort, bespoke extraction work, and significant risk of data loss.",
      },
      {
        score: 1,
        description:
          "Very difficult exit. Substantial vendor lock-in exists through proprietary formats, tightly coupled processes, or contractual barriers that make switching extremely costly.",
      },
      {
        score: 2,
        description:
          "Difficult exit. Data can be exported, but processes and integrations are tightly coupled to the platform, making a transition complex and high effort.",
      },
      {
        score: 3,
        description:
          "Manageable exit. Data can be exported in standard formats; an exit is achievable but would require significant planning and effort to untangle integrations.",
      },
      {
        score: 4,
        description:
          "Good exit clarity. A documented migration path exists, data is accessible in open formats, switching costs are understood, and the vendor does not impose contractual lock-in.",
      },
      {
        score: 5,
        description:
          "Excellent exit strategy. Full data portability using open standards, detailed transition documentation, no proprietary lock-in, and low switching costs. Rollback is feasible without data loss.",
      },
    ],
  },

  // ── Step 3: Vendor & Roadmap Assessment (step weight 10%) ─────────────────

  {
    stepNumber: 3,
    order: 1,
    weight: 2.5,
    text: "How comprehensive and responsive is the vendor's support model?",
    criteria: [
      {
        score: 0,
        description:
          "No formal support available. Assistance is limited to community forums or self-service documentation, with no contractual response time commitments.",
      },
      {
        score: 1,
        description:
          "Basic support with slow response times and no SLAs. The support model is unsuitable for business-critical workloads and provides no assurance of issue resolution.",
      },
      {
        score: 2,
        description:
          "Standard support tier only. Adequate for non-critical workloads but limited to business hours, with no named contacts and modest response time commitments.",
      },
      {
        score: 3,
        description:
          "Good support model. Reasonable SLAs with a named account or support manager, accessible across business hours, and a clear escalation path for critical issues.",
      },
      {
        score: 4,
        description:
          "Strong support model with fast SLAs. Dedicated support contact, priority response for critical incidents, and proactive communication on platform issues are included.",
      },
      {
        score: 5,
        description:
          "Enterprise-grade support. 24/7 coverage, named Customer Success Manager, proactive monitoring, regular service reviews, and contractually defined SLAs with financial penalties for breaches.",
      },
    ],
  },

  {
    stepNumber: 3,
    order: 2,
    weight: 2.5,
    text: "How well-governed are the vendor's release and change management processes?",
    criteria: [
      {
        score: 0,
        description:
          "No release governance. Changes are deployed without advance notice, changelogs are absent, and breaking changes may be introduced at any time without warning.",
      },
      {
        score: 1,
        description:
          "Minimal governance. Releases are irregular and unpredictable; customers receive little or no advance notice of changes, making environment stability difficult to maintain.",
      },
      {
        score: 2,
        description:
          "Basic release governance. Some advance notice is given before releases; a changelog is sometimes published, but the process lacks consistency and predictability.",
      },
      {
        score: 3,
        description:
          "Adequate governance. A regular release cadence exists with meaningful advance notice, documented changelogs, and a defined process for communicating breaking changes.",
      },
      {
        score: 4,
        description:
          "Good governance. Structured releases with clear changelogs, pre-release notifications, and sandbox or testing windows available to validate changes before they reach production.",
      },
      {
        score: 5,
        description:
          "Excellent governance. Well-defined, customer-facing release process with preview environments, a customer advisory board for breaking changes, versioned APIs, and long deprecation windows.",
      },
    ],
  },

  {
    stepNumber: 3,
    order: 3,
    weight: 2.5,
    text: "How well does the vendor's product roadmap align with our strategic direction?",
    criteria: [
      {
        score: 0,
        description:
          "Roadmap is not available or entirely misaligned. The vendor cannot or will not share a roadmap, or the disclosed direction diverges completely from our strategic needs.",
      },
      {
        score: 1,
        description:
          "Significant misalignment. The vendor's product direction diverges materially from our requirements; features we depend on are not planned, and the gap is expected to widen.",
      },
      {
        score: 2,
        description:
          "Partial alignment. Some relevant features are on the roadmap, but core capabilities we will need are absent from the near-term or medium-term plan.",
      },
      {
        score: 3,
        description:
          "Good alignment on most strategic needs. The majority of our near-term requirements are reflected in the roadmap; a few gaps exist but are not blocking.",
      },
      {
        score: 4,
        description:
          "Strong alignment. Most of our strategic needs are addressed in the near-to-medium-term roadmap; the vendor actively engages with customers to shape priorities.",
      },
      {
        score: 5,
        description:
          "Excellent alignment. The roadmap closely mirrors our strategic direction; the vendor actively incorporates customer input, and key capabilities we require are committed and scheduled.",
      },
    ],
  },

  {
    stepNumber: 3,
    order: 4,
    weight: 2.5,
    text: "How stable is the vendor and how strong is their customer reference base?",
    criteria: [
      {
        score: 0,
        description:
          "Vendor stability is highly uncertain. The company shows clear signs of financial distress, recent significant leadership changes, or market exit risk. No customer references are available.",
      },
      {
        score: 1,
        description:
          "Significant stability concerns. There are notable indicators of financial or operational vulnerability. References are absent, outdated, or reveal significant customer dissatisfaction.",
      },
      {
        score: 2,
        description:
          "Some stability concerns. The vendor is operational but has limited financial visibility or a thin reference base; independent verification of their longevity is difficult.",
      },
      {
        score: 3,
        description:
          "Adequately stable. The vendor appears financially sound with a credible market position. Some relevant customer references are available, though not necessarily in our sector.",
      },
      {
        score: 4,
        description:
          "Strong vendor stability. The vendor has a solid financial position, clear market differentiation, and a healthy reference base including customers in our industry.",
      },
      {
        score: 5,
        description:
          "Highly stable, well-established vendor. Strong financial position with audited accounts or funding transparency, an extensive reference base in our sector, and a clear multi-year growth trajectory.",
      },
    ],
  },

  // ── Step 4: Delivery Feasibility (step weight 15%) ────────────────────────

  {
    stepNumber: 4,
    order: 1,
    weight: 5,
    text: "How feasible is the implementation timeline against our business constraints?",
    criteria: [
      {
        score: 0,
        description:
          "Implementation cannot be delivered within any acceptable timeframe. Known dependencies, complexity, or resource constraints make delivery within business requirements impossible.",
      },
      {
        score: 1,
        description:
          "Severely at risk. The projected implementation timeline dramatically exceeds business constraints, with no clear mitigation path to close the gap.",
      },
      {
        score: 2,
        description:
          "Significant timeline risk. Delivery is likely to exceed acceptable boundaries without major scope reduction or resource uplift, both of which carry their own risks.",
      },
      {
        score: 3,
        description:
          "Achievable with careful management. The timeline is feasible but tight; active risk management and close vendor engagement will be needed to avoid slippage.",
      },
      {
        score: 4,
        description:
          "Good timeline feasibility. Delivery is comfortably within business constraints; the plan is realistic, milestones are well-defined, and risks are understood and manageable.",
      },
      {
        score: 5,
        description:
          "Excellent feasibility. The implementation timeline is well within business constraints with meaningful contingency available; the plan is detailed, validated, and supported by comparable vendor delivery evidence.",
      },
    ],
  },

  {
    stepNumber: 4,
    order: 2,
    weight: 5,
    text: "How achievable is the business rollout, including change management, training, and cutover?",
    criteria: [
      {
        score: 0,
        description:
          "Rollout is not achievable. The organisational change capacity is insufficient, stakeholder buy-in is absent, or the cutover approach presents unacceptable business risk.",
      },
      {
        score: 1,
        description:
          "Very high rollout risk. Significant organisational resistance, a highly complex cutover, or lack of change management resource makes a successful business rollout unlikely without major intervention.",
      },
      {
        score: 2,
        description:
          "High rollout risk. Substantial change management investment and executive sponsorship will be required; the current approach carries a meaningful risk of failed adoption.",
      },
      {
        score: 3,
        description:
          "Manageable with a structured programme. A well-resourced change management and training programme will be needed, but with the right investment the rollout is achievable.",
      },
      {
        score: 4,
        description:
          "Good achievability. The business impact is manageable, stakeholder alignment is strong, and the rollout approach is well-planned with a realistic cutover strategy.",
      },
      {
        score: 5,
        description:
          "Highly achievable. Minimal disruption to business operations; strong executive and user-level sponsorship, comprehensive vendor onboarding support, and a clear, low-risk cutover plan.",
      },
    ],
  },

  {
    stepNumber: 4,
    order: 3,
    weight: 2.5,
    text: "Do we have the internal skills and capacity to deliver and maintain this solution?",
    criteria: [
      {
        score: 0,
        description:
          "No relevant skills or capacity available internally. Delivery and ongoing support would require complete reliance on external resources, creating high risk and cost dependency.",
      },
      {
        score: 1,
        description:
          "Significant skills and capacity gap. The team lacks key competencies for both delivery and BAU support; extensive external resourcing or recruitment is required.",
      },
      {
        score: 2,
        description:
          "Moderate gaps. Considerable upskilling or resource augmentation is needed; some niche skills are absent and will need to be acquired through training or external partners.",
      },
      {
        score: 3,
        description:
          "Adequate skills with manageable gaps. The team has the core competencies for delivery and maintenance; targeted training or limited external support addresses the gaps.",
      },
      {
        score: 4,
        description:
          "Good internal capability. Minor skills gaps exist but are addressable through readily available training; the team can largely deliver and maintain the solution independently.",
      },
      {
        score: 5,
        description:
          "Excellent internal capability. Full skills and capacity are available for both delivery and ongoing BAU support; no external dependency is needed, and knowledge is well-distributed within the team.",
      },
    ],
  },

  {
    stepNumber: 4,
    order: 4,
    weight: 2.5,
    text: "How well-defined and low-risk is the data migration approach?",
    criteria: [
      {
        score: 0,
        description:
          "No viable migration approach has been identified. The volume, complexity, or quality of data to be migrated makes a safe transition infeasible with current plans.",
      },
      {
        score: 1,
        description:
          "Very high migration risk. The approach is unclear, data quality is poor, or legacy formats are incompatible; the risk of data loss or corruption is significant.",
      },
      {
        score: 2,
        description:
          "High migration risk. The approach is partially defined but faces meaningful data quality, volume, or mapping challenges that have not yet been resolved.",
      },
      {
        score: 3,
        description:
          "Manageable migration risk. The approach is defined, key challenges are understood, and a plan is in place to address them; some residual risk remains.",
      },
      {
        score: 4,
        description:
          "Low migration risk. The approach is clear and well-documented; data quality is good, mapping is complete, and appropriate tooling is available to automate key steps.",
      },
      {
        score: 5,
        description:
          "Very low migration risk. Automated tooling is available, data is well-understood and clean, a full dry run has been (or can be) conducted, and a tested rollback plan is in place.",
      },
    ],
  },

  // ── Step 5: User Experience & Adoption (step weight 10%) ──────────────────

  {
    stepNumber: 5,
    order: 1,
    weight: 2.5,
    text: "How much training effort will be required for users to become proficient?",
    criteria: [
      {
        score: 0,
        description:
          "Extensive bespoke training programme required. Users face a very long time-to-proficiency, and self-service learning is not feasible without significant internal training resource.",
      },
      {
        score: 1,
        description:
          "Significant training investment required. Users will need formal, multi-day training and ongoing coaching before they can work independently; productivity will be impacted for an extended period.",
      },
      {
        score: 2,
        description:
          "Moderate training needed. A structured training programme using vendor materials is required; most users will need several sessions before reaching full proficiency.",
      },
      {
        score: 3,
        description:
          "Reasonable training need. Competency is achievable with standard vendor-provided materials; most users can become proficient with a focused onboarding programme.",
      },
      {
        score: 4,
        description:
          "Light training required. The solution is largely intuitive; most users can become self-sufficient with a short guided session and access to online help resources.",
      },
      {
        score: 5,
        description:
          "Minimal training needed. The solution is highly intuitive; users are productive from day one with little to no formal training required. Self-service discovery is effective.",
      },
    ],
  },

  {
    stepNumber: 5,
    order: 2,
    weight: 2.5,
    text: "How well does the solution fit our existing workflows and ways of working?",
    criteria: [
      {
        score: 0,
        description:
          "Requires fundamental redesign of core business processes. Adopting the solution forces significant changes to how the organisation operates, creating high change risk and user disruption.",
      },
      {
        score: 1,
        description:
          "Major process changes required across multiple areas. The solution's model differs substantially from our current ways of working, requiring coordinated process transformation.",
      },
      {
        score: 2,
        description:
          "Significant process adaptation required. Several key workflows will need to be redesigned; the level of disruption is notable and will require active change management.",
      },
      {
        score: 3,
        description:
          "Moderate adaptation needed. Some process changes are necessary, but they are contained in scope and manageable with appropriate planning and stakeholder engagement.",
      },
      {
        score: 4,
        description:
          "Good workflow fit. The solution closely mirrors our existing processes; only minor adjustments are needed, and these are unlikely to cause meaningful user disruption.",
      },
      {
        score: 5,
        description:
          "Excellent workflow fit. The solution maps closely to our current ways of working; users can adopt it with minimal disruption, and it reinforces rather than challenges existing processes.",
      },
    ],
  },

  {
    stepNumber: 5,
    order: 3,
    weight: 5,
    text: "How intuitive and modern is the user interface and overall user experience?",
    criteria: [
      {
        score: 0,
        description:
          "Poor UX. The interface is confusing, dated, or inaccessible; users require significant workarounds to complete basic tasks, and adoption is likely to fail without intervention.",
      },
      {
        score: 1,
        description:
          "Below-average UX. Noticeable friction in common workflows; the interface does not meet modern usability expectations and is likely to hinder adoption and productivity.",
      },
      {
        score: 2,
        description:
          "Acceptable but not modern UX. The interface is functional; users can complete tasks but the experience is not polished, and some friction is evident in regular workflows.",
      },
      {
        score: 3,
        description:
          "Good UX. The interface is clean and meets modern usability expectations; navigation is logical, and the majority of tasks can be completed without difficulty.",
      },
      {
        score: 4,
        description:
          "Very good UX. The interface is intuitive, responsive, and accessible; users can complete tasks efficiently with minimal guidance, and the experience is consistent across devices.",
      },
      {
        score: 5,
        description:
          "Excellent, best-in-class UX. The interface is highly intuitive, fully accessible (WCAG compliant), mobile-ready, and personalisation capabilities are available. Users find it natural from first use.",
      },
    ],
  },

  // ── Step 6: Commercials & Total Cost of Ownership (step weight 15%) ───────

  {
    stepNumber: 6,
    order: 1,
    weight: 5,
    text: "How transparent and predictable is the vendor's pricing model?",
    criteria: [
      {
        score: 0,
        description:
          "Pricing is opaque or highly unpredictable. Significant hidden costs are expected, making reliable budgeting impossible. The total commercial exposure is unknown.",
      },
      {
        score: 1,
        description:
          "Limited transparency. Multiple pricing variables, consumption charges, or complex licensing tiers make budgeting unreliable and the true cost difficult to forecast.",
      },
      {
        score: 2,
        description:
          "Some transparency. The headline pricing structure is understood, but notable variables (e.g. usage-based charges, add-on modules) introduce meaningful budget uncertainty.",
      },
      {
        score: 3,
        description:
          "Adequate transparency. The pricing model is mostly clear; some variables remain, but they are manageable and can be estimated with reasonable confidence.",
      },
      {
        score: 4,
        description:
          "Good transparency. The pricing model is predictable with clear volume scaling; terms are straightforward, and cost forecasting over the contract period is reliable.",
      },
      {
        score: 5,
        description:
          "Full pricing transparency. The model is simple and clearly documented with no hidden costs. Contractual protections against in-contract price increases are in place; budgeting is fully reliable.",
      },
    ],
  },

  {
    stepNumber: 6,
    order: 2,
    weight: 5,
    text: "How measurable and demonstrable is the business value of this solution?",
    criteria: [
      {
        score: 0,
        description:
          "Business value is entirely intangible or unmeasurable. No credible ROI case can be made; value is speculative and cannot be tracked or reported post-implementation.",
      },
      {
        score: 1,
        description:
          "Very difficult to quantify. There is a limited ability to demonstrate ROI; any value case relies on highly subjective assumptions with no comparable evidence to draw on.",
      },
      {
        score: 2,
        description:
          "Partially measurable. Some value is demonstrable, but a significant proportion relies on assumptions; a partial business case is possible but would face scrutiny.",
      },
      {
        score: 3,
        description:
          "Reasonably measurable. Key value drivers can be quantified using standard metrics; a credible business case is achievable with effort and reasonable assumptions.",
      },
      {
        score: 4,
        description:
          "Good measurability. Clear KPIs are available; the value case is straightforward to construct and communicate to stakeholders, supported by some comparable evidence.",
      },
      {
        score: 5,
        description:
          "Highly measurable. A compelling, quantified ROI case is supported by strong KPIs and comparable customer evidence. Benefits are trackable post-go-live and reportable to senior stakeholders.",
      },
    ],
  },

  {
    stepNumber: 6,
    order: 3,
    weight: 5,
    text: "How competitive is the 3-year total cost of ownership relative to alternatives?",
    criteria: [
      {
        score: 0,
        description:
          "TCO is prohibitively expensive. Costs significantly exceed alternatives and the approved budget envelope, with no justification in terms of superior capability.",
      },
      {
        score: 1,
        description:
          "TCO is notably high. The solution is materially more expensive than comparable alternatives without a clear, proportionate uplift in value to justify the premium.",
      },
      {
        score: 2,
        description:
          "TCO is above average. The solution carries some premium over alternatives; a value case is needed to justify the additional spend, and it may face budget challenge.",
      },
      {
        score: 3,
        description:
          "TCO is broadly competitive. Costs are broadly in line with alternatives; the commercial case is reasonable and unlikely to be a significant obstacle.",
      },
      {
        score: 4,
        description:
          "TCO is good value. The solution is favourably priced relative to alternatives; the commercial case is strong, and costs are well within the acceptable range.",
      },
      {
        score: 5,
        description:
          "TCO is excellent value. The solution is notably lower cost than alternatives, or any premium is clearly and demonstrably justified by superior capability or risk reduction. The commercial case is compelling.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  console.log("Clearing existing seed data…");

  // Delete in dependency order. Project cascade handles most child records;
  // GateQuestion and ScorecardQuestion must be cleared explicitly.
  await prisma.project.deleteMany();
  await prisma.gateQuestion.deleteMany();
  await prisma.scorecardQuestion.deleteMany();

  console.log("Seeding gate questions…");
  await prisma.gateQuestion.createMany({ data: gateQuestions });

  console.log("Seeding scorecard questions…");
  await prisma.scorecardQuestion.createMany({ data: scorecardQuestions });

  const project = await prisma.project.create({
    data: {
      name: "Sample Project",
      financialSettings: { create: { currency: "GBP" } },
    },
  });

  console.log(
    `Done. Seeded ${gateQuestions.length} gate questions, ${scorecardQuestions.length} scorecard questions, and sample project "${project.name}".`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
