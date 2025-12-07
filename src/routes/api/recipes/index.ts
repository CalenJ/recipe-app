// src/routes/api/recipes/index.ts
import { json } from "@solidjs/router";
import { RecipeManager } from "~/server/recipeManager";

export async function GET() {
    const rmgr = new RecipeManager();

    try {
        const recipes = await rmgr.getAllRecipes();
        return json(recipes ?? []);
    } catch (err: any) {
        console.error("\n\nAPI: Error fetching recipes:", err);
        return json({ error: err.message }, { status: 500 });
    }
}

export async function POST({ request }: { request: Request }) {
    const rmgr = new RecipeManager();

    try {
        const body = await request.json();
        if (body.recipe_id) {
            console.log(`\n\nAPI: Updating recipe ${body.recipe_title} {${body.recipe_id}}`);

            console.log("API BODY:", body);
            console.log("API typeof recipe_id:", typeof body.recipe_id);
            console.log("API recipe_id (as number):", Number(body.recipe_id));


            await rmgr.update(body.recipe_id, body);
        } else {
            console.log(`\n\nAPI: Adding recipe ${body.recipe_title} {${body.recipe_id}}`);
            await rmgr.create(body);
        }
        return json({ ok: true });
    } catch (err: any) {
        console.error("\n\nAPI: Error creating recipe:", err);
        return json({ error: err.message }, { status: 500 });
    }
}
