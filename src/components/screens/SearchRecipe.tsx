import { createEffect, createMemo, createResource, createSignal, For, Show } from "solid-js";
import { Collapsible } from "@kobalte/core/collapsible";
import Arrow from "~/assets/arrow-down.png";
import Hat from "~/assets/chef_hat.png";
import MGlass from "~/assets/dashboard/magnifying-glass.png";
import Plate from "~/assets/food-plate.jpg";
import "~/styling/screens/search-recipe.css";
import RecipeViewer from "../dashboard/recipeViewer";
import { userId } from "~/stores/user";

type SortOption = "title-asc" | "title-desc" | "author-asc" | "author-desc" | "oldest" | "newest";

type SearchableRecipe = {
    recipe_id: number;
    recipe_title: string;
    author_id?: string;
    author_username?: string;
    ingredients?: { ingredientName?: string }[] | string;
    contents?: string;
    image_url?: string;
    is_public?: boolean;
    created_at?: string;
};

export default function SearchRecipe() {
    const [searchText, setSearchText] = createSignal("");
    const [authorFilter, setAuthorFilter] = createSignal("");
    const [includeIngredients, setIncludeIngredients] = createSignal("");
    const [excludeIngredients, setExcludeIngredients] = createSignal("");
    const [tagsFilter, setTagsFilter] = createSignal("");
    const [sortOption, setSortOption] = createSignal<SortOption>("title-asc");
    const [selectedId, setSelectedId] = createSignal<number | null>(null);
    const [savedIds, setSavedIds] = createSignal<number[]>([]);

    const [selectedRecipe] = createResource(
        () => (typeof window !== "undefined" ? selectedId() : null),
        async (id) => {
            if (!id) return null;
            const res = await fetch(`/api/recipes/${id}`);
            return res.json();
        }
    );

    const [recipes] = createResource(
        () => typeof window !== "undefined",
        async () => {
            const res = await fetch("/api/recipes");
            return res.json();
        }
    );

    createEffect(() => {
        const uid = userId();
        if (!uid) return;
        void fetchSaved(uid);
    });

    const clearSearch = () => setSearchText("");

    const filteredRecipes = createMemo(() => {
        const data: SearchableRecipe[] = recipes() || [];

        const searchTerm = searchText().trim().toLowerCase();
        const authorTerm = authorFilter().trim().toLowerCase();
        const includeTerms = splitTerms(includeIngredients());
        const excludeTerms = splitTerms(excludeIngredients());
        const tagTerms = splitTerms(tagsFilter());

        const matches = data.filter((recipe) => {
            const title = (recipe.recipe_title || "").toLowerCase();
            const author = (recipe.author_username || "").toLowerCase();
            const contents = (recipe.contents || "").toLowerCase();
            const ingredientText = normalizeIngredients(recipe.ingredients);
            const tags = normalizeTags((recipe as any).tags);

            const matchesSearch = searchTerm
                ? title.includes(searchTerm) ||
                author.includes(searchTerm) ||
                contents.includes(searchTerm) ||
                ingredientText.includes(searchTerm)
                : true;

            const matchesAuthor = authorTerm ? author.includes(authorTerm) : true;
            const includesAll = includeTerms.every((term) => ingredientText.includes(term));
            const excludesAll = excludeTerms.every((term) => !ingredientText.includes(term));
            const matchesTags = tagTerms.every((term) => tags.some((t) => t.includes(term)));

            return matchesSearch && matchesAuthor && includesAll && excludesAll && matchesTags;
        });

        return sortRecipes(matches, sortOption());
    });

    async function fetchSaved(uid: string) {
        try {
            const res = await fetch(`/api/saved-recipes?user_id=${encodeURIComponent(uid)}`);
            if (!res.ok) {
                console.warn("Failed to load saved recipes", await res.text());
                return;
            }
            const data = await res.json();
            const ids = Array.isArray(data) ? data.map((r: any) => Number(r.recipe_id)).filter(Number.isFinite) : [];
            setSavedIds(ids);
        } catch (err) {
            console.error("Failed to load saved recipes", err);
        }
    }

    async function toggleSave(recipeId: number, save: boolean) {
        if (!userId()) return;
        try {
            await fetch("/api/saved-recipes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId(), recipe_id: recipeId, save })
            });
            await fetchSaved(userId());
        } catch (err) {
            console.error("Failed to toggle save", err);
        }
    }

    const selectedIsSaved = () => {
        const id = selectedId();
        if (!id) return false;
        return savedIds().includes(Number(id));
    };

    const hasQuery = createMemo(
        () =>
            !!(
                searchText().trim() ||
                authorFilter().trim() ||
                includeIngredients().trim() ||
                excludeIngredients().trim() ||
                tagsFilter().trim()
            )
    );

    return (
        <div class="search-page-cont">
            <div class="search-results-section">
                <Show when={!recipes.loading} fallback={
                    <div class="default-search-view">
                        <div class="loading-ring" />
                        <p>Searching recipes...</p>
                    </div>
                }>
                    <Show when={hasQuery()} fallback={
                        <div class="default-search-view">
                            <img src={Hat} />
                            <p>Results Will Display Here</p>
                        </div>
                    }>
                        <Show when={selectedId()}>
                            <div class="search-viewer">
                                <Show when={!selectedRecipe.loading && selectedRecipe()} fallback={<div>Loading recipe...</div>}>
                                    <div class="viewer-actions">
                                        <Show when={userId() && selectedRecipe() && selectedRecipe()!.author_id !== userId()}>
                                            <button
                                                onClick={() => toggleSave(selectedId()!, !selectedIsSaved())}
                                                class="star-btn"
                                                title={selectedIsSaved() ? "Unsave recipe" : "Save recipe"}
                                            >
                                                {selectedIsSaved() ? "★ Saved" : "☆ Save"}
                                            </button>
                                        </Show>
                                    </div>
                                    <RecipeViewer recipe={selectedRecipe()} />
                                </Show>
                            </div>
                        </Show>
                        <Show when={filteredRecipes().length > 0} fallback={
                            <div class="default-search-view">
                                <img src={Hat} />
                                <p>No recipes match your search</p>
                            </div>
                        }>
                            <div class="search-results-header">
                                <p>{filteredRecipes().length} recipe(s) found</p>
                                <span>{sortLabel(sortOption())}</span>
                            </div>
                            <div class="search-results-grid">
                                <For each={filteredRecipes()}>
                                    {(recipe) => (
                                        <div class="search-card" onClick={() => setSelectedId(recipe.recipe_id)}>
                                            <div class="search-card-thumb">
                                                <img src={recipe.image_url ? `/api/public-thumbnail?path=${encodeURIComponent(recipe.image_url)}` : Plate} alt="Recipe preview" />
                                                {(() => {
                                                    const isPublic = recipe.is_public !== false;
                                                    return (
                                                        <span class={`pill ${isPublic ? "public" : "private"}`}>
                                                            {isPublic ? "Public" : "Private"}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            <div class="search-card-body">
                                                <div class="search-card-title">
                                                    <h3>{recipe.recipe_title}</h3>
                                                    {recipe.author_username && <p>by {recipe.author_username}</p>}
                                                </div>
                                                <p class="search-card-ingredients">
                                                    {previewIngredients(recipe.ingredients)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </Show>

                    </Show>
                </Show>
            </div>

            <div class="search-options-pane">
                <div class="search-bar-row">
                    <div class="search-field">
                        <img src={MGlass} />
                        <input
                            type="text"
                            placeholder="Search All Recipes..."
                            value={searchText()}
                            onInput={(query) => setSearchText(query.currentTarget.value)}
                        />
                        <Show when={searchText().trim() !== ""}>
                            <button class="clear-btn" onClick={clearSearch}>clear</button>
                        </Show>
                    </div>
                </div>
                <Collapsible class="collapsible">
                    <Collapsible.Trigger class="sort">
                        <span>Sort By</span>
                        <img class="arrow" src={Arrow} />
                    </Collapsible.Trigger>
                    <Collapsible.Content class="sort-options">
                        <div class="sort-option">
                            <input
                                type="radio"
                                id="recipe-title-asc"
                                name="sort-option"
                                checked={sortOption() === "title-asc"}
                                onChange={() => setSortOption("title-asc")}
                            />
                            <label for="recipe-title-asc">Title A-Z</label>
                        </div>

                        <div class="sort-option">
                            <input
                                type="radio"
                                id="recipe-title-desc"
                                name="sort-option"
                                checked={sortOption() === "title-desc"}
                                onChange={() => setSortOption("title-desc")}
                            />
                            <label for="recipe-title-desc">Title Z-A</label>
                        </div>

                        <div class="sort-option">
                            <input
                                type="radio"
                                id="author-asc"
                                name="sort-option"
                                checked={sortOption() === "author-asc"}
                                onChange={() => setSortOption("author-asc")}
                            />
                            <label for="author-asc">Author A-Z</label>
                        </div>

                        <div class="sort-option">
                            <input
                                type="radio"
                                id="author-desc"
                                name="sort-option"
                                checked={sortOption() === "author-desc"}
                                onChange={() => setSortOption("author-desc")}
                            />
                            <label for="author-desc">Author Z-A</label>
                        </div>

                        <div class="sort-option">
                            <input
                                type="radio"
                                id="oldest"
                                name="sort-option"
                                checked={sortOption() === "oldest"}
                                onChange={() => setSortOption("oldest")}
                            />
                            <label for="oldest">Oldest</label>
                        </div>

                        <div class="sort-option">
                            <input
                                type="radio"
                                id="newest"
                                name="sort-option"
                                checked={sortOption() === "newest"}
                                onChange={() => setSortOption("newest")}
                            />
                            <label for="newest">Newest</label>
                        </div>
                    </Collapsible.Content>
                </Collapsible>

                <Collapsible class="collapsible">
                    <Collapsible.Trigger class="filter">
                        <span>Filters</span>
                        <img class="arrow" src={Arrow} />
                    </Collapsible.Trigger >
                    <Collapsible.Content class="search-filters">
                        <div class="filters">
                            <div class="filter-option">
                                <label>Author</label>
                                <input
                                    type="text"
                                    value={authorFilter()}
                                    onInput={(e) => setAuthorFilter(e.currentTarget.value)}
                                    placeholder="Search by author"
                                />
                            </div>

                            <div class="filter-option">
                                <label>Include ingredients</label>
                                <input
                                    type="text"
                                    value={includeIngredients()}
                                    onInput={(e) => setIncludeIngredients(e.currentTarget.value)}
                                    placeholder="comma separated"
                                />
                            </div>

                            <div class="filter-option">
                                <label>Exclude ingredients</label>
                                <input
                                    type="text"
                                    value={excludeIngredients()}
                                    onInput={(e) => setExcludeIngredients(e.currentTarget.value)}
                                    placeholder="comma separated"
                                />
                            </div>

                            <div class="filter-option">
                                <label>Tags</label>
                                <input
                                    type="text"
                                    value={tagsFilter()}
                                    onInput={(e) => setTagsFilter(e.currentTarget.value)}
                                    placeholder="optional tags"
                                />
                            </div>
                        </div>
                    </Collapsible.Content>
                </Collapsible >
            </div >
        </div >
    );
}

function splitTerms(text: string) {
    return text
        .split(/[,]+|\s+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}

function normalizeIngredients(ingredients?: { ingredientName?: string }[] | string) {
    if (!ingredients) return "";
    if (Array.isArray(ingredients)) {
        return ingredients
            .map((ing) => ing?.ingredientName?.toLowerCase?.() || "")
            .join(" ");
    }
    return ingredients.toLowerCase();
}

function normalizeTags(tags: unknown): string[] {
    if (Array.isArray(tags)) {
        return tags
            .map((t) => (t ?? "").toString().toLowerCase())
            .filter(Boolean);
    }
    if (typeof tags === "string") {
        return tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    }
    return [];
}

function previewIngredients(ingredients?: { ingredientName?: string }[] | string) {
    if (!ingredients) return "No ingredients listed";

    let names: string[] = [];

    if (Array.isArray(ingredients)) {
        names = ingredients
            .map((ing) => ing?.ingredientName)
            .filter(Boolean)
            .map((name) => String(name));
    } else {
        names = ingredients.split(",").map((n) => n.trim()).filter(Boolean);
        if (names.length === 0) {
            names = ingredients.split(" ").map((n) => n.trim()).filter(Boolean);
        }
    }

    if (names.length === 0) {
        return "No ingredients listed";
    }

    const teaser = names.slice(0, 5).join(", ");
    return names.length > 5 ? `${teaser}, ...` : teaser;
}

function sortRecipes(recipes: SearchableRecipe[], option: SortOption) {
    const sorted = [...recipes];

    sorted.sort((a, b) => {
        const titleA = (a.recipe_title || "").toLowerCase();
        const titleB = (b.recipe_title || "").toLowerCase();
        const authorA = (a.author_username || "").toLowerCase();
        const authorB = (b.author_username || "").toLowerCase();
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

        switch (option) {
            case "title-asc": return titleA.localeCompare(titleB);
            case "title-desc": return titleB.localeCompare(titleA);
            case "author-asc": return authorA.localeCompare(authorB);
            case "author-desc": return authorB.localeCompare(authorA);
            case "oldest": return dateA - dateB;
            case "newest": return dateB - dateA;
            default: return 0;
        }
    });

    return sorted;
}

function sortLabel(option: SortOption) {
    switch (option) {
        case "title-asc": return "Sorted by title (A-Z)";
        case "title-desc": return "Sorted by title (Z-A)";
        case "author-asc": return "Sorted by author (A-Z)";
        case "author-desc": return "Sorted by author (Z-A)";
        case "oldest": return "Sorted by oldest first";
        case "newest": return "Sorted by newest first";
        default: return "";
    }
}
