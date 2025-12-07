import { createStore } from "solid-js/store";
import { createEffect, createMemo, createSignal, Show } from "solid-js";
import { supabase } from "~/supabase/supabase-client";
import MarkdownIt from "markdown-it";
import "~/styling/recipe-editor.css";

const [unitsList, setUnitsList] = createSignal<"us" | "metric">("us");
const md = new MarkdownIt({
    html: false,
    breaks: true,
    linkify: true
});

const usUnitsList = [
    { value: "pounds", label: "lb(s)" },
    { value: "ounces", label: "oz" },
    { value: "gallons", label: "gal(s)" },
    { value: "quarts", label: "qt(s)" },
    { value: "pints", label: "pt(s)" },
    { value: "cups", label: "cup(s)" },
    { value: "fluid-ounces", label: "fl. oz" },
    { value: "tablespoons", label: "tbsp(s)" },
    { value: "teaspoons", label: "tsp(s)" },
    { value: "pinch", label: "pinch" },
    { value: "box", label: "box" },
    { value: "can", label: "can" },
    { value: "packet", label: "packet" }
];

const metricUnitsList = [
    { value: "grams", label: "g" },
    { value: "kilograms", label: "kg" },
    { value: "milliliters", label: "ml" },
    { value: "liters", label: "L" },
    { value: "pinch", label: "pinch" },
    { value: "box", label: "box" },
    { value: "can", label: "can" },
    { value: "packet", label: "packet" }
];


function selectUnits() {
    switch (unitsList()) {
        case "us":
            return usUnitsList;
        case "metric":
            return metricUnitsList;
        default:
            return usUnitsList;
    }
}

export default function RecipeEditor(props: { recipe?: any, onSaveSuccess?: () => void }) {
    const emptyForm = {
        recipe_id: NaN,
        author_id: "",
        recipe_title: "",
        prep_time: 0,
        cook_time: 0,
        servings: 0,
        ingredients: [{ quantity: "", unit: "", ingredientName: "" }],
        contents: "",
        image_url: "",
        is_public: false
    };

    const [form, setForm] = createStore(structuredClone(emptyForm));
    const [initialForm, setInitialForm] = createStore(structuredClone(emptyForm));

    const [pendingImage, setPendingImage] = createSignal<File | null>(null);
    const [previewUrl, setPreviewUrl] = createSignal<string | null>(null);
    const [editorExpanded, setEditorExpanded] = createSignal(false);
    const [viewMode, setViewMode] = createSignal<"plain" | "preview" | "split">("split");

    let fileInputRef: HTMLInputElement | undefined;

    function cloneRecipeState(recipe?: any) {
        const normalized = recipe
            ? {
                recipe_id: Number.isFinite(recipe.recipe_id) ? recipe.recipe_id : -1,
                author_id: recipe.author_id ?? "",
                recipe_title: recipe.recipe_title ?? "",
                prep_time: Number.isFinite(recipe.prep_time) ? recipe.prep_time : 0,
                cook_time: Number.isFinite(recipe.cook_time) ? recipe.cook_time : 0,
                servings: Number.isFinite(recipe.servings) ? recipe.servings : 0,
                ingredients:
                    recipe.ingredients?.length > 0
                        ? recipe.ingredients.map((ing: any) => ({
                            quantity: ing.quantity ?? "",
                            unit: ing.unit ?? "",
                            ingredientName: ing.ingredientName ?? ""
                        }))
                        : structuredClone(emptyForm.ingredients),
                contents: recipe.contents ?? "",
                image_url: recipe.image_url ?? "",
                is_public: Boolean(recipe.is_public)
            }
            : structuredClone(emptyForm);

        return structuredClone(normalized);
    }

    function markSavedState(snapshot: typeof form) {
        setInitialForm(snapshot);
    }

    function isDirty(path: (string | number)[]) {
        const getValue = (obj: any, p: (string | number)[]) =>
            p.reduce((acc, key) => (acc === undefined ? acc : acc[key]), obj);

        const current = getValue(form, path);
        const initial = getValue(initialForm, path);
        return current !== initial;
    }

    createEffect(() => {
        const next = cloneRecipeState(props.recipe);
        setForm(next);
        markSavedState(next);
        if (fileInputRef) fileInputRef.value = "";
        setPendingImage(null);
        setPreviewUrl(null);
    });

    function addNewIngredient() {
        setForm("ingredients", [...form.ingredients, { quantity: "", unit: "", ingredientName: "" }]);
    }

    function updateIngredient(index: number, field: "quantity" | "unit" | "ingredientName", value: string) {
        setForm("ingredients", index, field, value);
    }

    function deleteIngredient(index: number) {
        if (form.ingredients.length > 1) {
            setForm("ingredients", form.ingredients.filter((_, i) => i !== index));
        }
    }

    const previewHtml = createMemo(() => md.render(form.contents || ""));

    async function submitRecipe(e: Event) {
        e.preventDefault();

        let finalImagePath = form.image_url;

        if (pendingImage()) {
            const file = pendingImage()!;
            const filePath = `uploads/${crypto.randomUUID()}-${file.name}`;

            const { error } = await supabase.storage
                .from("recipe_thumbnails")
                .upload(filePath, file, { upsert: false });

            if (!error) {
                finalImagePath = filePath;
            }
        }

        const send = {
            recipe_id: form.recipe_id,
            recipe_title: form.recipe_title,
            prep_time: Number.isFinite(form.prep_time) ? form.prep_time : 0,
            cook_time: Number.isFinite(form.cook_time) ? form.cook_time : 0,
            servings: Number.isFinite(form.servings) ? form.servings : 0,
            ingredients: form.ingredients,
            contents: form.contents,
            image_url: finalImagePath,
            is_public: Boolean(form.is_public)
        };

        await fetch("/api/recipes", {
            method: "POST",
            body: JSON.stringify(send),
            headers: { "Content-Type": "application/json" }
        });

        setPendingImage(null);
        setPreviewUrl(null);
        markSavedState(cloneRecipeState({ ...form, image_url: finalImagePath }));
        props.onSaveSuccess?.();
    }



    return (
        <div class="recipe-viewer" classList={{ expanded: editorExpanded() }}>
            <div class="recipe-content">
                <TitleSection />
                <ThumbnailSection />
                <RecipeCardSection />
                <MarkdownEditorSection />
                <button onClick={submitRecipe}>Save Recipe</button>
            </div>
        </div>
    );

    function TitleSection() {
        return (
            <input
                id="form-title"
                name="recipe_title"
                type="text"
                value={form.recipe_title}
                classList={{ "dirty-input": isDirty(["recipe_title"]) }}
                onInput={(e) => setForm("recipe_title", e.currentTarget.value)}
                placeholder="Recipe Title"
            />
        );
    }

    function ThumbnailSection() {

        function publicUrl(path: string | null) {
            if (!path) return null;
            return supabase.storage.from("recipe_thumbnails").getPublicUrl(path).data.publicUrl;
        }

        function handleFileSelect(e: Event) {
            const input = e.target as HTMLInputElement;
            const f = input.files?.[0];
            if (!f) return;

            setPendingImage(f);
            setPreviewUrl(URL.createObjectURL(f));
        }

        return (
            <div>
                {previewUrl() ? (
                    <img
                        src={previewUrl()!}
                        class="recipe-thumbnail"
                        style="margin-top: 1rem;"
                    />
                ) : form.image_url ? (
                    <img
                        src={publicUrl(form.image_url) || ""}
                        class="recipe-thumbnail"
                        style="margin-top: 1rem;"
                    />
                ) : null}

                <div class="image-upload">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                </div>
            </div>
        );
    }

    function RecipeCardSection() {
        return (
            <div class="recipe-card">
                <div class="recipe-card-contents">

                    {/*Publicity Toggle*/}
                    <label class="toggle-cont">
                        <input
                            type="checkbox"
                            checked={form.is_public}
                            classList={{ "dirty-input": isDirty(["is_public"]) }}
                            onChange={(e) => setForm("is_public", e.currentTarget.checked)}
                        />
                        <span class="toggle">
                            <span class="toggle-text private">Private</span>
                            <span class="toggle-text public">Public</span>
                        </span>
                    </label>

                    <div class="serving-size">
                        <label>Servings: </label>
                        <input
                            id="serving-size"
                            type='text'
                            value={form.servings}
                            classList={{ "dirty-input": isDirty(["servings"]) }}
                            onInput={(e) =>
                                setForm(
                                    "servings",
                                    Number.isNaN(parseInt(e.currentTarget.value))
                                        ? 0
                                        : parseInt(e.currentTarget.value)
                                )
                            }
                        />
                    </div>

                    <div class="time-fields">
                        <div class="prep-time">
                            <label for="prep_time">
                                {"Prep Time: "}
                                <input
                                    id="prep_time"
                                    name="prep_time"
                                    type="text"
                                    value={form.prep_time}
                                    classList={{ "dirty-input": isDirty(["prep_time"]) }}
                                    onInput={(e) =>
                                        setForm(
                                            "prep_time",
                                            Number.isNaN(parseInt(e.currentTarget.value))
                                                ? 0
                                                : parseInt(e.currentTarget.value)
                                        )
                                    }
                                />
                                {" mins"}
                            </label>
                        </div>

                        <div class="cook-time">
                            <label for="cook_time">
                                {"Cook Time: "}
                                <input
                                    id="cook_time"
                                    name="cook_time"
                                    type="text"
                                    value={form.cook_time}
                                    classList={{ "dirty-input": isDirty(["cook_time"]) }}
                                    onInput={(e) =>
                                        setForm(
                                            "cook_time",
                                            Number.isNaN(parseInt(e.currentTarget.value))
                                                ? 0
                                                : parseInt(e.currentTarget.value)
                                        )
                                    }
                                />
                                {" mins"}
                            </label>
                        </div>
                    </div>

                    <div class="unit-sys-toggle">
                        <label><input type="radio" checked={unitsList() == "us"} onChange={() => setUnitsList("us")} />US Customary</label>
                        <label><input type="radio" checked={unitsList() == "metric"} onChange={() => setUnitsList("metric")} />Metric</label>
                    </div>

                    <div class="ingredients-section">
                        <div class="ing-lbl-cont">
                            <label>Recipe Ingredients</label>
                            {form.ingredients.map((ing, index) => (
                                <div class="ingredient-row">
                                    <input
                                        id={`qty_${index}`}
                                        name={`qty_${index}`}
                                        type="text"
                                        value={ing.quantity}
                                        placeholder="Qty"
                                        classList={{ "dirty-input": isDirty(["ingredients", index, "quantity"]) }}
                                        onInput={(e) => updateIngredient(index, "quantity", e.target.value)}
                                    />
                                    <select
                                        id={`unit_${index}`}
                                        name={`unit_${index}`}
                                        value={ing.unit}
                                        classList={{ "dirty-input": isDirty(["ingredients", index, "unit"]) }}
                                        onInput={(e) => updateIngredient(index, "unit", e.currentTarget.value)}
                                    >
                                        <option value="">Unit</option>
                                        {selectUnits().map((unit) => (
                                            <option value={unit.value}>{unit.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        id={`name_${index}`}
                                        name={`name_${index}`}
                                        type="text"
                                        value={ing.ingredientName}
                                        placeholder="Ingredient Name"
                                        classList={{ "dirty-input": isDirty(["ingredients", index, "ingredientName"]) }}
                                        onInput={(e) => updateIngredient(index, "ingredientName", e.target.value)}
                                    />
                                    <button class="delete-btn" onClick={() => deleteIngredient(index)}>
                                        -
                                    </button>
                                </div>
                            ))}
                            <button onClick={addNewIngredient}>+</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    function MarkdownEditorSection() {
        return (
            <div class="recipe-text">
                <div class="md-header-row">
                    <p>Markdown Editor</p>
                    <div class="md-controls">
                        <div class="md-mode-toggle">
                            <button
                                type="button"
                                classList={{ active: viewMode() === "plain" }}
                                onClick={() => setViewMode("plain")}
                            >
                                Plain
                            </button>
                            <button
                                type="button"
                                classList={{ active: viewMode() === "preview" }}
                                onClick={() => setViewMode("preview")}
                            >
                                Preview
                            </button>
                            <button
                                type="button"
                                classList={{ active: viewMode() === "split" }}
                                onClick={() => setViewMode("split")}
                            >
                                Both
                            </button>
                        </div>
                        <button
                            type="button"
                            class="md-toggle-btn"
                            onClick={() => setEditorExpanded((v) => !v)}
                        >
                            {editorExpanded() ? "Normal width" : "Full width"}
                        </button>
                    </div>
                </div>
                <div
                    class="md-editor"
                    classList={{
                        expanded: editorExpanded(),
                        "mode-plain": viewMode() === "plain",
                        "mode-preview": viewMode() === "preview"
                    }}
                >
                    <Show when={viewMode() !== "preview"}>
                        <div class="md-input">
                            <textarea
                                id="contents"
                                name="contents"
                                class="recipe-text-textarea"
                                classList={{ "dirty-input": isDirty(["contents"]) }}
                                value={form.contents}
                                onInput={(e) => setForm("contents", e.currentTarget.value)}
                                placeholder="Write your recipe here using markdown..."
                            />
                        </div>
                    </Show>
                    <Show when={viewMode() !== "plain"}>
                        <div class="md-preview" innerHTML={previewHtml()} />
                    </Show>
                </div>
            </div>
        );
    }
}
