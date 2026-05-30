# Ocean Real Estate App - Codex Instructions

## Required Project Memory
Before making changes, read:

* docs/OCEANOS_APPLICATION_MAP.md
* docs/OCEANOS_SYSTEM_BLUEPRINT.md
* docs/OOS_KULLANIM_KITAPCIGI.md
* docs/FOOTER_PUBLIC_PAGES_CONTENT.md

Use these documents as the source of truth for:

* app structure
* route logic
* product behavior
* public/protected page rules
* visibility model
* legal flows
* media/photo rules
* footer public page content
* OceanOS operating principles

## Product Context
This is a mobile-first real estate operating system for Ocean Real Estate. The platform is designed for real estate advisors, portfolio owners, admins, buyers, investors, and client request management.

## Strategic Objective
Build a scalable real estate operating system that converts advisor networks, portfolios, client requests, and deal flow into a structured digital platform.

The product must prioritize speed, usability, advisor productivity, portfolio visibility, deal matching, and mobile-first execution.

## Core Modules
1. Portfolio management
2. My portfolios page
3. Client requests / advisor search requests
4. Portfolio-request matching system
5. Advisor dashboard
6. Admin dashboard
7. CRM and client follow-up
8. Notifications
9. Mobile bottom navigation
10. Deal and transaction tracking

## Product Priorities
1. Mobile-first UX
2. Fast portfolio access
3. Clean and professional interface
4. Simple advisor workflow
5. Scalable data structure
6. Reusable components
7. Strong filtering and search
8. Midas-like mobile bottom navigation
9. No unnecessary complexity
10. Desktop compatibility must not be broken

## UI / UX Rules
- The product should feel modern, premium, clean, and fast.
- Mobile experience is the priority.
- Use clear cards, simple filters, strong visual hierarchy, and fixed bottom navigation on mobile.
- Bottom navigation should have 4 main tabs:
  - Home
  - Portfolios
  - Requests
  - Profile
- Active tab should be visually highlighted.
- Avoid cluttered screens.
- Every screen should be usable by a real estate advisor with minimal technical knowledge.

## Business Logic
Portfolios are the core assets of the platform.

Each portfolio should support:
- Portfolio number
- Property type
- Location
- Price
- Currency
- Gross m2
- Net m2
- Room count
- Advisor / owner
- Status
- Photos
- Description
- Notes
- Created date
- Updated date

Client/advisor requests should support:
- Request owner
- Location
- Property type
- Budget range
- Currency
- Minimum m2
- Maximum m2
- Room count
- Urgency level
- Notes
- Status

## Matching Logic
The system should match advisor requests with existing portfolios.

Matching should consider:
- Location
- Property type
- Budget range
- Size
- Room count
- Status
- Custom requirements

The result should show a matching percentage.

Example notification:
"Mert adlı danışmanın arayışı sizin OCN-1024 numaralı portföyünüzle %90 eşleşiyor."

## Development Rules
- Never commit directly to main.
- Always create a feature branch.
- Do not break existing desktop layout.
- Do not modify production secrets.
- Do not touch .env files unless explicitly instructed.
- Prefer reusable components.
- Keep code clean and scalable.
- Run lint, build, and tests before finishing when available.
- Summarize changed files after every task.
- Explain risks and follow-up recommendations.
- Keep Turkish UI text professional, concise, and real-estate focused.

## Output Expectations
For every completed task, provide:
1. What was changed
2. Which files were changed
3. How it was tested
4. Any known risks
5. Recommended next step
