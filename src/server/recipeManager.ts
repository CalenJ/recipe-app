import { supabase } from "~/supabase/supabase-client";

interface RecipeHeader {
    recipe_id: number;
    author_id: string;
    recipe_title: string;
    image_url?: string;
    author_username?: string;
    is_public?: boolean;
    servings?: number;
}

interface FullRecipe extends RecipeHeader {
    prep_time: number;
    cook_time: number;
    servings: number;
    ingredients: { quantity: string, unit: string, ingredientName: string }[];
    contents?: string;
}

export class RecipeManager {

    // -- CACHES -- stores data as it is pulled from database, reduces DB calls
    #headers = new Map<number, RecipeHeader>();
    #recipes = new Map<number, FullRecipe>();

    async create(data: FullRecipe) {
        console.log(`\n\nRMGR: Creating recipe \"${data.recipe_title}\"`);
        const { error } = await supabase.from('recipes').insert({
            author_id: data.author_id,
            recipe_title: data.recipe_title,
            prep_time: data.prep_time,
            cook_time: data.cook_time,
            servings: data.servings,
            ingredients: data.ingredients,
            image_url: data.image_url,
            is_public: Boolean(data.is_public),
            // instructions: data.instructions,
            // notes: data.notes,
        });

        if (error) { throw error; }
        return true;
    };

    async update(id: number, data: FullRecipe) {
        console.log(`\n\nRMGR: updating recipe ${id}`);
        console.log("Incoming update payload:", data);

        const updateData = {
            recipe_title: data.recipe_title,
            prep_time: data.prep_time,
            cook_time: data.cook_time,
            servings: data.servings,
            ingredients: data.ingredients,
            contents: data.contents,
            image_url: data.image_url,
            is_public: Boolean(data.is_public),
        };

        const { data: updated, error } = await supabase
            .from("recipes")
            .update(updateData)
            .eq("recipe_id", Number(id))
            .select();

        // console.log("UPDATED ROW:", updated);
        if (error) throw error;
    }

    // -- HEADER INFO ONLY -- basic data to display within browser
    async getAllLocalRecipeHeaders(force = false): Promise<RecipeHeader[]> {
        if (!force && this.#headers.size > 0) {
            return Array.from(this.#headers.values());
        }

        const { data, error } = await supabase
            .from("recipes_with_username")
            .select("recipe_id, author_id, recipe_title, image_url, author_username, is_public, servings");

        if (error) throw error;
        if (!data) return [];

        data.forEach((r) => this.#headers.set(r.recipe_id, r));
        return data;
    }

    // -- FULL RECIPE -- full recipe for editing/viewing 
    async getRecipeById(id: number, force = false): Promise<FullRecipe | null> {
        if (!force && this.#recipes.has(id)) {
            console.log(`\n\nRMGR: Found cached recipe ${id}`);
            return this.#recipes.get(id)!;
        }
        if (force) {
            console.log(`\n\nRMGR: Forcing reload of recipe ${id}`);
        } else {
            console.log(`\n\nRMGR: Loading recipe ${id} from database`);
        }

        const { data, error } = await supabase
            .from("recipes")
            .select("*")
            .eq("recipe_id", Number(id))
            .single();

        if (error) throw error;
        if (!data) return null;

        this.#recipes.set(id, data);
        return data;
    }

    async getAllRecipes() {
        const { data, error } = await supabase.from('recipes_with_username').select('*');

        if (error) { throw error; }
        return data || [];
    }

    async uploadThumbnail(file: File): Promise<string> {
        const filePath = `${crypto.randomUUID()}-${file.name}`;

        const { error } = await supabase.storage
            .from("recipe_thumbnails")
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            throw error;
        }
        return filePath;
    }

    getPublicUrl(path: string) {
        return supabase.storage.from("recipe_thumbnails").getPublicUrl(path);
    }

}
