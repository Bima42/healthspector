# The Local — Post-Mortem

> A review aggregation platform that never aggregated reviews

## What We Tried to Build

**The Local** was conceived as a local business discovery tool powered by AI-driven review analysis. The core value proposition was simple: aggregate Google reviews from nearby businesses, analyze sentiment and patterns using LLMs, and present users with token-optimized, contextually rich recommendations through a conversational map interface.

### Core Technical Vision

1. **Token-Optimized Data Layer**: Compress Google Places API responses into LLM-friendly formats
2. **Review Analysis Pipeline**: Aggregate large volumes of reviews for sentiment analysis
3. **Conversational Map Interface**: Natural language queries that return geolocated business recommendations
4. **Session History**: Persistent conversations with location context

## Tech Stack

- **Backend**: Next.js API routes, tRPC
- **External APIs**: Google Places API, Google Maps
- **AI/ML**: OpenRouter
- **Frontend**: React, Tailwind CSS, Google Maps integration

## What Actually Happened

### Hour 0-4: Promising Start

**Initial research phase went smoothly:**

- Successfully integrated Google Places API client
- Built comprehensive analysis tooling to examine API responses
  - Token usage per field (discovered photos consumed 45.6% of response tokens)
  - Nested data structure mapping
  - Response composition analysis
- Created response masking utilities to strip heavy fields like photos
- Documented findings in structured markdown for future reference
- Maps is integrated with custom markers

**Early wins created false confidence** — the data *seemed* accessible and malleable.

### Hour 4-8: The Pagination Problem

First major blocker emerged: **critical data hidden behind pagination**.

Google Places API paginated two key data types:
1. Search results (list of places)
2. Reviews (within each place detail)

**Our approach:**
- Built custom pagination handlers for both levels
- Implemented async batch processing to speed up data collection
- Successfully retrieved complete place listings

**Status**: Solvable technical challenge, team morale still high.

### Hour 8-10: The Insurmountable Wall

While testing the review pagination handler, we discovered **Google Places API hard-limits reviews to 5 per business** unless you own the establishment.

This wasn't a pagination issue. This was a fundamental API constraint.

**For a review aggregation platform, this was catastrophic.**

We explored every possible workaround:

#### Attempt 1: SERP API
- Hypothesis: Use search engine results to scrape review data
- Reality: 
  - Max 10 results per request
  - 250 total request limit
  - Even with perfect pagination, couldn't gather meaningful review datasets
  - Cost would scale prohibitively

#### Attempt 2: Alternative Data Sources
- Researched web scraping solutions
- All violated Google's ToS
- Any production deployment would face legal issues + IP bans

#### Attempt 3: Pivot to 5-Review Model
- Brainstormed whether 5 reviews could provide value
- Conclusion: No. Core premise required review *volume* for pattern analysis
- 5 reviews = insufficient data for LLM sentiment analysis
- Competitors using full review datasets would always have better insights

## Why We Failed

### 1. **Insufficient API Research**
We assumed Google Places API provided review access similar to public-facing Google Maps. We were wrong.

**What we should have done:** Read API documentation thoroughly before writing a single line of code.

### 2. **Late Validation of Core Assumptions**
The entire product depended on review aggregation. You miss so much values without them.

**What we should have done:** Build a data validation spike on hour 0.

### 3. **Sunk Cost Attachment**
We spent many hours trying to work around an unsolvable problem instead of pivoting.

**What we should have done:** Set a hard time limit on workaround attempts (2 hours max).

### 4. **No Plan B**
We had one product idea with no fallback.

**What we should have done:** Ideate 2-3 concepts before committing, rank them by technical risk.

## Key Learnings

### ✅ What Worked

- **Systematic analysis tooling** — our API response analysis scripts were genuinely useful
- **Async optimization** — batch request handling was performant and well-architected  
- **Documentation discipline** — keeping structured notes helped during the pivot
- **Team communication** — we recognized failure quickly and pivoted decisively

### ❌ What Didn't Work

- **API research methodology** — we coded first, validated later
- **Risk assessment** — didn't identify the core dependency until too late

## Technical Artifacts

Despite the failure, we produced reusable code:

- **Google Places API client** with TypeScript types
- **Response analysis utilities** for token optimization
- **Async pagination handlers** (generic, reusable pattern)
- **Response masking system** for selective field filtering

## The Pivot Decision

At hour 10, we held a hard conversation:

> "We have 14 hours left. We've invested 10 hours into The Local. We cannot ship this product. Do we pivot?"

**Decision: Pivot to a completely different concept.**

This decision felt like failure. But it was also the only rational choice.

The team that shipped **Healthspector** 14 hours later learned more from this failure than from any success.

---

## Retrospective Questions

**Q: Could you have saved The Local with more time?**  
A: No. The API limitation is permanent. More time would have just meant more wasted effort.

**Q: Was the idea bad?**  
A: The *idea* was fine. The *execution strategy* was flawed. We should have validated data access before building.

**Q: What would you do differently?**  
A: Better understand the key points of the product's success. Spend hour 0-2 on a data validation spike.

If that script fails, the product idea fails. Kill it immediately.

---

## Final Thoughts

The Local died so Healthspector could live.

In hackathons, **the willingness to pivot is more valuable than the ability to execute**. We shipped a working product in 14 hours because we recognized failure at hour 10.
