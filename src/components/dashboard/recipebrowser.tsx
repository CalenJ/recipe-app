import { createMemo, createResource, For, Show } from "solid-js";
import Plate from "~/assets/food-plate.jpg";

export default function RecipeBrowser(props: { onSelect: (id: number | null) => void, selected: number | null, userId?: string, savedRecipes?: any[] }) {

    const [headers] = createResource(
        () => typeof window !== "undefined",
        async () => {
            const res = await fetch("/api/recipes");
            return res.json();
        }
    );

    const filteredHeaders = createMemo(() => {
        const data = headers() || [];
        if (!props.userId) return data;
        return data.filter((r: any) => String(r.author_id) === String(props.userId));
    });

    const savedHeaders = createMemo(() => props.savedRecipes || []);

    const selectedId = () =>
        props.selected !== null ? Number(props.selected) : null;

    return (
        <div class="browsing-container">
            <div class="browsing-container-content">
                <Show when={headers()} fallback={<div>Loading Recipes...</div>}>
                    <div class="browse-section">
                        <h4>My Recipes</h4>
                        <Show when={filteredHeaders().length > 0} fallback={<div>No recipes yet.</div>}>
                            <For each={filteredHeaders()}>
                                {(r) => (
                                    <div
                                        class="browsing-item-content"
                                        style={{
                                            border:
                                                selectedId() === Number(r.recipe_id)
                                                    ? "2px solid #FF6F61"
                                                    : "2px solid transparent",
                                        }}
                                        onClick={() =>
                                            props.onSelect(
                                                selectedId() === Number(r.recipe_id)
                                                    ? null
                                                    : Number(r.recipe_id)
                                            )
                                        }
                                    >
                                        <img src={r.image_url ? `/api/public-thumbnail?path=${encodeURIComponent(r.image_url)}` : Plate} alt="Recipe preview" />
                                        <div class="browsing-item-text">
                                            <h3>{r.recipe_title}</h3>
                                            {r.author_username && <p>{`Author: ${r.author_username}`}</p>}
                                        </div>
                                    </div>
                                )}
                            </For>
                        </Show>
                    </div>

                    <div class="browse-section">
                        <h4>Saved Recipes</h4>
                        <Show when={savedHeaders().length > 0} fallback={<div>No saved recipes yet.</div>}>
                            <For each={savedHeaders()}>
                                {(r) => (
                                    <div
                                        class="browsing-item-content"
                                        style={{
                                            border:
                                                selectedId() === Number(r.recipe_id)
                                                    ? "2px solid #FF6F61"
                                                    : "2px solid transparent",
                                        }}
                                        onClick={() =>
                                            props.onSelect(
                                                selectedId() === Number(r.recipe_id)
                                                    ? null
                                                    : Number(r.recipe_id)
                                            )
                                        }
                                    >
                                        <img src={r.image_url ? `/api/public-thumbnail?path=${encodeURIComponent(r.image_url)}` : Plate} alt="Recipe preview" />
                                        <div class="browsing-item-text">
                                            <h3>{r.recipe_title}</h3>
                                            {r.author_username && <p>{`Author: ${r.author_username}`}</p>}
                                        </div>
                                    </div>
                                )}
                            </For>
                        </Show>
                    </div>
                </Show>
            </div>
        </div>
    );
}
