import { RecipeManager } from "~/server/recipeManager";

export async function POST({ request }: { request: Request }) {
    const form = await request.formData();
    const file = form.get("file") as File;

    if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }

    const rmgr = new RecipeManager();
    const path = await rmgr.uploadThumbnail(file);

    return new Response(JSON.stringify({ path }), {
        headers: { "Content-Type": "application/json" },
    });
}