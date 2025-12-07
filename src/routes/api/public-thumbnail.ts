import { RecipeManager } from "~/server/recipeManager";

export async function GET({ request }: { request: Request }) {
    const url = new URL(request.url);
    const path = url.searchParams.get("path");

    if (!path) {
        return new Response("Missing path parameter", { status: 400 });
    }

    const rmgr = new RecipeManager();
    const { data } = rmgr.getPublicUrl(path);

    return Response.redirect(data.publicUrl, 302);
}
