import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pdfText, jobTitle, jobDescription } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error("No PDF text content provided");
    }

    const systemPrompt = `You are an expert technical recruiter. You have been given text extracted from a PDF document uploaded by a recruiter. Convert this content into exactly 40 multiple-choice questions (MCQs).

The questions should be based on the PDF content and adapted to be relevant for the job position.

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
Make questions progressively harder.`;

    const userPrompt = `Job Title: ${jobTitle || "Not specified"}
Job Description: ${jobDescription || "Not provided"}

PDF Content:
${pdfText.substring(0, 15000)}

Generate 40 MCQ questions based on this PDF content.`;

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
            description: "Generate 40 MCQ questions from PDF content",
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
    console.error("pdf-to-mcq error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
