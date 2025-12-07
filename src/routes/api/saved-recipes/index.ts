import { json } from "@solidjs/router";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "~/supabase/supabase-client";

function getSupabase() {
    const url =
        process.env.SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL;

    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (url && key) {
        return createClient(url, key);
    }
    console.warn("Using client supabase key for saved-recipes API (service key missing). Ensure RLS policies allow this.");
    return supabase;
}

export async function GET({ request }: { request: Request }) {
    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id");

    if (!userId) {
        return json({ error: "user_id is required" }, { status: 400 });
    }

    const sb = getSupabase();

    const { data: savedRows, error: savedErr } = await sb
        .from("saved_recipes")
        .select("recipe_id")
        .eq("user_id", userId);

    if (savedErr) {
        console.error("Error fetching saved recipes:", savedErr);
        return json({ error: savedErr.message }, { status: 500 });
    }

    const recipeIds = savedRows?.map((r) => r.recipe_id).filter(Boolean) || [];

    if (recipeIds.length === 0) {
        return json([]);
    }

    const { data: recipes, error } = await sb
        .from("recipes_with_username")
        .select("*")
        .in("recipe_id", recipeIds);

    if (error) {
        console.error("Error fetching saved recipe details:", error);
        return json({ error: error.message }, { status: 500 });
    }

    return json(recipes ?? []);
}

export async function POST({ request }: { request: Request }) {
    const body = await request.json();
    const userId = body.user_id;
    const recipeId = body.recipe_id;
    const save = Boolean(body.save);

    if (!userId || !recipeId) {
        return json({ error: "user_id and recipe_id required" }, { status: 400 });
    }

    if (save) {
        const { error } = await sb
            .from("saved_recipes")
            .upsert({ user_id: userId, recipe_id: recipeId }, { onConflict: "user_id,recipe_id" });

        if (error) {
            console.error("Error saving recipe:", error);
            return json({ error: error.message }, { status: 500 });
        }
        return json({ ok: true, saved: true });
    }

    const { error } = await sb
        .from("saved_recipes")
        .delete()
        .eq("user_id", userId)
        .eq("recipe_id", recipeId);

    if (error) {
        console.error("Error removing saved recipe:", error);
        return json({ error: error.message }, { status: 500 });
    }

    return json({ ok: true, saved: false });
}
