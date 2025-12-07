import { json } from "@solidjs/router";
import { RecipeManager } from "~/server/recipeManager";

export async function GET({ params }: { params: { id: number } }) {
    const rmgr = new RecipeManager();
    const recipe = await rmgr.getRecipeById(params.id);

    if (!recipe) {
        return json({ error: "Recipe not found" }, { status: 404 });
    }

    return json(recipe);
}
