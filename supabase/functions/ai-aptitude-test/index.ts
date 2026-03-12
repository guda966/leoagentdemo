import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jobTitle, jobDescription, skillsRequired, studentSkills, studentResume } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert technical recruiter creating aptitude test questions. Generate exactly 40 multiple-choice questions (MCQs) for a candidate applying to a job. 

The questions should be a mix of:
- Technical skills based on the job requirements and candidate's resume (60%)
- Logical reasoning and problem solving (20%)  
- Domain knowledge and situational judgment (20%)

Each question must have exactly 4 options (A, B, C, D) with only one correct answer.

Return a JSON array of exactly 40 objects with this structure:
[{
  "id": 1,
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 0,
  "category": "technical" | "logical" | "domain",
  "difficulty": "easy" | "medium" | "hard"
}]

The "correct" field is the 0-based index of the correct option.
Make questions progressively harder. Ensure questions are relevant, professional, and test real competency.`;

    const userPrompt = `Job Title: ${jobTitle}
Job Description: ${jobDescription || "Not provided"}
Required Skills: ${(skillsRequired || []).join(", ")}
Candidate Skills: ${(studentSkills || []).join(", ")}
${studentResume ? `Candidate Resume Summary: Available` : "No resume provided"}

Generate 40 MCQ questions for this candidate's aptitude test.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_mcqs",
            description: "Generate 40 MCQ questions for aptitude test",
            parameters: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      question: { type: "string" },
                      options: { type: "array", items: { type: "string" } },
                      correct: { type: "number" },
                      category: { type: "string", enum: ["technical", "logical", "domain"] },
                      difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
                    },
                    required: ["id", "question", "options", "correct", "category", "difficulty"],
                    additionalProperties: false
                  }
                }
              },
              required: ["questions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_mcqs" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let questions;
    if (toolCall) {
      const parsed = JSON.parse(toolCall.function.arguments);
      questions = parsed.questions;
    } else {
      // Fallback: try parsing from content
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse questions from AI response");
      }
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("aptitude-test error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
