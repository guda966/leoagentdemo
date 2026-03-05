import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { roleType, question, answer } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let messages: any[];

    if (answer) {
      // Provide feedback on an answer
      messages = [
        { role: "system", content: `You are an expert technical interviewer for ${roleType} roles. Evaluate the candidate's answer and provide detailed, constructive feedback.` },
        { role: "user", content: `Question: ${question}\n\nCandidate's Answer: ${answer}\n\nProvide feedback with strengths, areas to improve, and a tip.` },
      ];
    } else {
      // Generate questions
      messages = [
        { role: "system", content: `You are an expert technical interviewer. Generate 5 interview questions for a ${roleType} role. Mix easy, medium, and hard difficulty.` },
        { role: "user", content: `Generate 5 interview questions for a ${roleType} position.` },
      ];
    }

    const tools = answer ? [{
      type: "function",
      function: {
        name: "provide_feedback",
        description: "Provide structured interview feedback",
        parameters: {
          type: "object",
          properties: {
            score: { type: "number", description: "Score 0-100" },
            strengths: { type: "string" },
            improvements: { type: "string" },
            tip: { type: "string" },
            sampleAnswer: { type: "string", description: "A model answer for reference" }
          },
          required: ["score", "strengths", "improvements", "tip"],
          additionalProperties: false
        }
      }
    }] : [{
      type: "function",
      function: {
        name: "generate_questions",
        description: "Generate interview questions",
        parameters: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] }
                },
                required: ["question", "difficulty"],
                additionalProperties: false
              }
            }
          },
          required: ["questions"],
          additionalProperties: false
        }
      }
    }];

    const toolChoice = answer
      ? { type: "function", function: { name: "provide_feedback" } }
      : { type: "function", function: { name: "generate_questions" } };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        tools,
        tool_choice: toolChoice,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const result = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mock interview error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
