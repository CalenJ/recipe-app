import { For, Show, createMemo } from "solid-js";
import MarkdownIt from "markdown-it";
import { supabase } from "~/supabase/supabase-client";
import Plate from "~/assets/food-plate.jpg";
import "~/styling/recipe-editor.css";

type RecipeData = {
    recipe_id?: number;
    author_id?: string;
    recipe_title?: string;
    prep_time?: number;
    cook_time?: number;
    servings?: number;
    ingredients?: { quantity?: string; unit?: string; ingredientName?: string }[];
    contents?: string;
    image_url?: string | null;
    is_public?: boolean;
};

const md = new MarkdownIt({
    html: false,
    breaks: true,
    linkify: true
});

export default function RecipeViewer(props: { recipe: RecipeData | null }) {
    const previewHtml = createMemo(() => md.render(props.recipe?.contents || ""));
    const ingredients = createMemo(() => {
        const ing = props.recipe?.ingredients;
        if (!ing) return [];

        if (Array.isArray(ing)) {
            return ing;
        }

        // if (typeof ing === "string") {
        //     return ing
        //         .split(/[\n,]/)
        //         .map((chunk) => chunk.trim())
        //         .filter(Boolean)
        //         .map((name) => ({ ingredientName: name, quantity: "", unit: "" }));
        // }

        return [];
    });
    const isPublic = createMemo(() => props.recipe?.is_public !== false);

    const publicUrl = (path: string | null | undefined) => {
        if (!path) return null;
        return supabase.storage.from("recipe_thumbnails").getPublicUrl(path).data.publicUrl;
    };

    return (
        <div class="recipe-viewer">
            <div class="recipe-content">
                <div id="form-title">{props.recipe?.recipe_title || "Untitled Recipe"}</div>

                <div class="recipe-image">
                    <img
                        src={props.recipe?.image_url ? (publicUrl(props.recipe.image_url) || "") : Plate}
                        alt="Recipe thumbnail"
                        class="recipe-thumbnail"
                    />
                </div>

                <div class="recipe-card">
                    <div class="recipe-card-contents">
                        {/* <label class="toggle-cont" aria-label="Public or private" title={isPublic() ? "Public" : "Private"}>
                            <input type="checkbox" checked={isPublic()} disabled />
                            <span class="toggle">
                                <span class="toggle-text private">Private</span>
                                <span class="toggle-text public">Public</span>
                            </span>
                        </label> */}

                        <div class="serving-size">
                            <label>Servings:</label>
                            <span class="viewer-pill">{props.recipe?.servings ?? "N/A"}</span>
                        </div>

                        <div class="time-fields">
                            <div class="prep-time">
                                <label>
                                    {"Prep Time: "}
                                    <span class="viewer-pill">{props.recipe?.prep_time ?? 0} mins</span>
                                </label>
                            </div>

                            <div class="cook-time">
                                <label>
                                    {"Cook Time: "}
                                    <span class="viewer-pill">{props.recipe?.cook_time ?? 0} mins</span>
                                </label>
                            </div>
                        </div>

                        <div class="ingredients-section">
                            <div class="ing-lbl-cont">
                                <label>Recipe Ingredients</label>
                                <Show when={ingredients().length > 0} fallback={<p class="muted">No ingredients listed</p>}>
                                    <ul class="viewer-ingredient-list">
                                        <For each={ingredients()}>
                                            {(ing) => (
                                                <li>
                                                    <span class="ing-qty">{ing.quantity}</span>
                                                    {ing.unit && <span class="ing-unit">{` ${ing.unit}`}</span>}
                                                    {ing.ingredientName && <span class="ing-name">{` ${ing.ingredientName}`}</span>}
                                                </li>
                                            )}
                                        </For>
                                    </ul>
                                </Show>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="recipe-text">
                    <div class="md-header-row">
                        <p>Recipe</p>
                    </div>
                    <div class="md-editor mode-preview">
                        <div class="md-preview" innerHTML={previewHtml()} />
                    </div>
                </div>
            </div>
        </div>
    );
}
