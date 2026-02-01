# Healthspector

![Cursor 2-Day AI Hackathon](https://ai-beavers.com/_next/image?url=%2Fimages%2Fhackathon-hero-20012026.png&w=1920&q=75)

> AI-powered pain mapping tool that helps patients communicate symptoms to doctors through interactive 3D body visualization

**Context**: This project was born from a pivot. After spending 10 hours on a failed project ([read the post-mortem](./docs/THE_FAIL.md)), we had 14 hours left to ship something. Healthspector is what happens when you learn fast and execute faster.

---

## The Problem

Patients struggle to accurately describe pain locations and characteristics to doctors. Medical professionals need precise, contextual information but often receive vague descriptions like "my back hurts."
We've all been there: we prepare what we want to say in our heads, but in the rush of the moment, we forget 90% of what we wanted to say.

## Our Solution

An interactive 3D body model where users can:
- **Click** directly on pain locations
- **Speak** their symptoms to an AI agent that automatically maps pain points
- **Improve** with AI agent suggestion, which leads you to describe your pain and feelings in detail
- **Describe** pain type, intensity, and context
- **Export** a structured pain report as a link, doctor can just consult it

## Resources

#### [See the app in production!](https://hamburg-hackathon.tanguypauvret.me/)

#### [See the live demo!](https://youtu.be/H1YTpQZZQ8E)

#### Quick overview
![Session Screenshot](docs/session_screenshot.png)

---

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **3D Rendering**: Three.js, React Three Fiber, Drei
- **Backend**: tRPC v11, Next.js API Routes
- **Database**: PostgreSQL, Drizzle ORM
- **AI/LLM**: Google Gemini Flash 3 (via OpenRouter)
- **State Management**: Zustand
- **Validation**: Zod
- **UI Components**: Radix UI, shadcn/ui, Lucide icons
- **Forms**: React Hook Form
- **Animations**: Framer Motion

---

## How to Run

```bash
# Clone the repository
git clone https://github.com/your-team/healthspector.git
cd healthspector

# Install dependencies
cd app
npm install

# Set up environment variables
cd ..
cp .env.example .env.local
# Add your DATABASE_URL, OpenRouter API key, etc.

# Run docker
docker compose up --build
```

---

## How It Works

### 1. **Manual Pain Mapping**
Users click on the 3D body model to place pain markers. Each marker captures:
- Exact 3D coordinates
- Body zone (head, shoulder, back, etc.)
- Pain type (sharp, dull, burning, tingling, throbbing, cramping, shooting)
- Intensity rating (0-10)
- Additional notes

### 2. **AI-Assisted Mapping**
Users describe pain in natural language:

> "I have a sharp pain in my lower back that gets worse when I bend forward, started 3 days ago, intensity around 7/10"

The AI agent:
- Interprets the description
- Identifies body zones from the 3D model's mesh names
- Creates/updates pain points automatically
- Maintains conversation context across the session

### 3. **Session History**
Every interaction is logged:
- Manual pin additions/edits/deletions
- AI conversation turns
- Pain point snapshots at each step

This history provides context for the AI and creates an audit trail for medical records.

### 4. **Export & Share**
Generate a shareable link with a read-only view of the pain map for doctors.

---

## Architecture Decisions

### Why Gemini Flash 3?
- **Speed**: We needed fast responses for real-time interaction
- **Cost**: Basic model sufficient for structured output with good prompting
- **Reliability**: Zod validation ensures consistent output schema

### Why Mesh Names Over Coordinates?
- LLMs understand semantic labels ("left-shoulder") better than 3D vectors
- React Three Fiber's mesh targeting made this trivial to implement
- Reduces prompt complexity and improves accuracy


### Why Session History?
- Provides conversation context for multi-turn AI interactions
- Allows users to review their symptoms
- Creates a natural export format for doctors

---

## Technical Challenges

### 1. **3D Model Labeling**
Finding a pre-labeled 3D body model was impossible in our timeframe.

**Solution**: Manual mesh labeling in Blender for POC, built a utility to extract mesh names from GLB files.

**Current limitation**: Only 7 body zones labeled (head, torso, back, left/right hand, left/right foot).

We decided to keep our 3D model very simple, but we can imagine a model with much more mesh and excellent precision. We didn't want to waste time on that.

### 2. **AI-3D Integration**
Making an LLM interact with a 3D model could have been a project killer.

**Validation approach**: Tested React Three Fiber's mesh targeting before committing to the full build.

**Result**: Mesh names made this surprisingly straightforward.

### 3. **State Synchronization**
3D canvas state + form state + database state needed to stay in sync.

**Solution**: Zustand store as single source of truth, tRPC mutations update DB + store atomically.

---

## What We Shipped

✅ **Core functionality:**
- Interactive 3D body model with click-to-pin
- AI agent that interprets pain descriptions
- Pain point CRUD with type/intensity/notes
- Session history with context preservation
- Shareable read-only session links
- Voice input

✅ **Technical foundation:**
- Full-stack type safety (tRPC + Zod)
- Database schema with migrations
- LLM prompt engineering with structured output
- 3D mesh extraction utilities

❌ **What we cut:**
- Enhanced mesh precision (only 7 zones)
- Pain zone selection (point-only for now)
- Not pinned pain point allowing to describe non-precise pain
- Multi-session management

---

## Future Improvements

### Short-term
- Add remaining body zones (arms, legs, joints, etc.)
- Add pain zone selection (area vs. point)

### Long-term
- Historical pain tracking (past injuries, chronic conditions)
- Doctor dashboard for reviewing multiple patients
- Medication/treatment correlation tracking
- Export to PDF/FHIR format
- Integration with EHR systems


---

## Try It

[Click the link!](https://hamburg-hackathon.tanguypauvret.me/)

**Note**: This is a hackathon POC. The 3D model has limited body zones, the AI occasionally hallucinates pain points, and the UI is rough. But it works, and it demonstrates the core concept.
