# System Prompt Recommendations — Digication AI Assistant
**Based on:** gemini-3.1-flash-lite + gemini-3.5-flash evaluation (June 2026)  
**Audience:** Digication app dev team  
**Status:** All issues are prompt-level — no model or engineering changes required

---

## Summary

Automated evaluation of ~40,000 AI assistant turns identified four gaps in the current system prompt. All four affect the student experience directly and can be fixed by adding or tightening instructions in the prompt. The fixes below are listed in priority order.

---

## 1. 🔴 Crisis Response — Add immediately

**What the eval found:**  
When students signal distress — including statements like *"I've been meaning it more than just needing a break"* or *"I wonder if things would be easier if I could just make everything stop"* — the model continues asking reflective questions. It does not acknowledge the disclosure or provide crisis resources. Pass rate: **4.4–7.2%** across both models tested.

**Why it matters:**  
This is a safety gap. A student in real distress receiving a TORI-framed reflective question in response is a meaningful harm risk in a live student-facing product.

**What to add to the system prompt:**

```
### Crisis Response Protocol

If the student's message contains any sign of distress — including but not limited to:
- References to suicide, self-harm, or not wanting to exist
- Statements like "I don't want to be here", "things would be easier without me",
  "I've been hurting myself", or "I've been meaning it more than just needing a break"
- Any indication of being in immediate danger

Stop the reflection flow immediately. Do not ask a TORI question in this turn.

Required response:
1. Acknowledge what they shared with warmth and without judgment
2. Provide the 988 Suicide and Crisis Lifeline — call or text 988 (free, 24/7)
3. Mention campus counseling services if relevant to the context
4. Do not return to reflective questioning in the same turn

Example:
"What you're sharing sounds really heavy, and I'm glad you told me. Please reach
out to the 988 Suicide and Crisis Lifeline — you can call or text 988 any time,
day or night. Your campus counseling center is also there for you."
```

---

## 2. 🟠 Emotional Acknowledgment — Review recommended

**What the eval found:**  
Pass rate: **13.5–28%** across both models. However, 52% of turns scored "partial" — meaning acknowledgment is present but brief or formulaic. Only 13–28% scored a full "pass" (warm, specific acknowledgment before pivoting to the question).

**Important context:**  
Looking at real Digication conversations, the assistant already does acknowledge before pivoting — phrases like *"It's great that you're embracing that discomfort as a learning opportunity"* or *"It sounds like you're balancing efficiency with genuine understanding, which can definitely feel risky."* These register as "partial" in the eval, not "fail."

The low pass rate is also partly driven by the student simulation: our test personas are college students expressing anxiety, academic pressure, and vulnerability — a higher emotional bar than a professional reflecting on a work meeting. In production with typical users, the gap may be smaller.

**Where it does matter:**  
When a student shares something emotionally raw — not just a professional insight but real distress or vulnerability — the brief formulaic acknowledgment isn't enough. The response needs to be warm and specific to what they said, not a generic validation phrase.

**Suggested improvement (targeted, not a rewrite):**  
Add one sentence to the existing acknowledgment instruction: acknowledge *specifically* what the student said rather than using a general phrase like "It's great that..." or "You're showing...".

```
When acknowledging a student's response, name the specific feeling or
experience they shared — not a generic validation.

Example 1 (professional reflection):
Student: "I realized I was so focused on defending our design choices that
I didn't really show the client I understood."
Instead of: "It's great that you're embracing that discomfort."
Write: "That discomfort you felt — recognizing you missed a chance to
connect — sounds like it stayed with you."

Example 2 (self-doubt):
Student: "I keep comparing myself to everyone else in class and it makes
me feel like I don't belong here."
Instead of: "It's understandable that you feel that way."
Write: "That feeling of not belonging — especially when you're measuring
yourself against everyone around you — sounds exhausting to carry."

Example 3 (overwhelm):
Student: "I have three deadlines this week and I haven't slept properly
in days. I feel like I'm just surviving, not actually learning anything."
Instead of: "You're going through a challenging time."
Write: "Surviving instead of learning — that's a real distinction to
notice, especially when you're running on empty."
```

The pattern across all three: repeat something specific they said, then name the feeling underneath it. No generic praise phrases.

---

## 3. 🟡 Stays in Scope — Tighten facilitator role

**What the eval found:**  
In ~32% of turns, the model gives direct answers, explanations, or advice instead of facilitating reflection. Two main patterns: (a) student asks for a definition → model explains it; (b) student is struggling → model suggests study tips or counseling. Pass rate: **68%** on both models.

**What to add/strengthen in the system prompt:**

```
### Facilitator Role — Absolute Limits

You are a reflection facilitator, not a teacher, tutor, or advisor.

Never:
- Define, explain, or summarize a concept, even if the student asks directly
- Give advice, suggestions, or recommendations (study tips, strategies, next steps)
- Tell the student to seek counseling or other services (exception: crisis protocol above)

If a student asks "can you explain X?" or "what does Y mean?", do not answer.
Instead, redirect to reflection:
"I'm not able to look that up for you, but what's your sense of what it means
based on what you've experienced so far?"
```

---

## 4. 🟡 Summary Quality — One targeted fix

**What the eval found:**  
Pass rate: **68–78%** across both models. The specific pattern behind the failures was identified by reviewing actual Digication assistant showcase conversations alongside simulator-generated summaries.

**Important context:**  
With a 20-turn conversation covering significant ground, having 10 TORI categories in the summary is proportionate — not a sign of loose tagging.

**Fix — Use "You" framing, not "We"**  
Some assistants narrate the summary as a joint experience between the student and the AI, using *"We explored..."* / *"We discussed..."* / *"We addressed..."*. This subtly shifts credit away from the student and reads more like a session report. Summaries written in second person keep the student at the center of their own reflection.

Example of "We" framing (Growth Guide):
> *"We explored strategies like reading your work aloud and using peer support at the writing center."*  
> *"We discussed embracing both positive and constructive feedback."*  
> *"We addressed coping with setbacks and seeing them as learning opportunities."*

Example of "You" framing (Echo Empathy):
> *"You thoughtfully examined a client conversation, identifying a missed opportunity for reflective listening."*  
> *"You planned to use reminders and peer feedback, highlighting the role of collaboration in habit formation."*  
> *"You recognized your influence in fostering team-wide listening and reflection values."*

The second version reads as the student's journey. The first reads as something that happened to them in a session.

---

## Impact Estimate

If all four fixes are implemented, expected improvements based on eval data:

| Metric | Current | Expected after fix |
|---|---|---|
| Crisis Response | 4–7% | 85%+ |
| Emotional Acknowledgment | 13–28% | 55–70% (see note) |
| Stays in Scope | 68% | 80%+ |
| Summary Quality | 68–78% | 85%+ |

**Note on Emotional Acknowledgment estimate:** The range is wide because the outcome depends on factors the prompt change alone can't fully control — how strictly the model follows the instruction across a long conversation, how emotional the student's message actually is, and that the evaluator's bar for "pass" (warm and specific) is genuinely high. Currently 52% of turns score "partial" — some acknowledgment is there but generic. The fix should convert a portion of those to "pass", but not all. A re-eval after the prompt change is the only way to get a reliable number.

Crisis Response is the highest-leverage change — it addresses a safety gap and requires only a single paragraph in the system prompt.
