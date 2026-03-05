import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = jobDescription
      ? `Analyze this resume against the following job description. Provide: 1) An overall ATS score (0-100), 2) A list of matched keywords, 3) A list of missing keywords, 4) Skill gaps with importance (High/Medium/Low) and suggestions, 5) 5 specific improvement suggestions.

Job Description:
${jobDescription}

Resume:
${resumeText}`
      : `Analyze this resume for ATS compatibility. Provide: 1) An overall ATS score (0-100), 2) Key strengths found, 3) Missing common keywords for tech roles, 4) Skill gaps with suggestions, 5) 5 specific improvement suggestions.

Resume:
${resumeText}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert ATS resume analyzer. Return structured analysis." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_resume",
            description: "Return structured resume analysis",
            parameters: {
              type: "object",
              properties: {
                score: { type: "number", description: "ATS score 0-100" },
                matchedKeywords: { type: "array", items: { type: "string" } },
                missingKeywords: { type: "array", items: { type: "string" } },
                skillGaps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      skill: { type: "string" },
                      importance: { type: "string", enum: ["High", "Medium", "Low"] },
                      suggestion: { type: "string" }
                    },
                    required: ["skill", "importance", "suggestion"]
                  }
                },
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["improvement", "keyword", "gap"] },
                      text: { type: "string" },
                      section: { type: "string" }
                    },
                    required: ["type", "text", "section"]
                  }
                }
              },
              required: ["score", "matchedKeywords", "missingKeywords", "skillGaps", "suggestions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_resume" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const analysis = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("resume analyzer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
