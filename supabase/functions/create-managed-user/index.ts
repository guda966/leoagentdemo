import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the caller
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !caller) throw new Error("Unauthorized");

    // Check caller's role
    const { data: callerRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();

    if (!callerRole) throw new Error("No role found for caller");

    const { email, password, full_name, role, phone, company_name, college_name, address, place } = await req.json();

    // Validate permissions
    if (callerRole.role === "owner") {
      if (!["recruiter", "college"].includes(role)) {
        throw new Error("Owner can only create recruiters and colleges");
      }
    } else if (callerRole.role === "college") {
      if (role !== "student") {
        throw new Error("College can only create students");
      }
    } else {
      throw new Error("You don't have permission to create users");
    }

    // Create the user in auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    });

    if (createError) throw createError;

    // Update the profile with additional fields
    const profileUpdate: Record<string, any> = {
      created_by: caller.id,
      phone: phone || null,
    };
    if (company_name) profileUpdate.company_name = company_name;
    if (college_name) profileUpdate.college_name = college_name;
    if (address) profileUpdate.address = address;
    if (place) profileUpdate.place = place;

    await supabaseAdmin
      .from("profiles")
      .update(profileUpdate)
      .eq("user_id", newUser.user!.id);

    return new Response(
      JSON.stringify({ success: true, user_id: newUser.user!.id, email }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
