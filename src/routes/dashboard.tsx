// src/routes/dashboard.tsx

import { onMount, createSignal, Switch, Match, Show, createResource, createEffect } from "solid-js";
import { supabase } from "~/supabase/supabase-client";
import * as supabaseFn from "~/supabase/supabase-queries";
import type { ActiveView } from "~/types";
import "~/styling/dashboard.css";
import "~/styling/recipe-browser.css"
import "~/styling/recipe-editor.css";
import "~/styling/taskbar.css"

import { useNavigate } from "@solidjs/router"; // <-- For redirects
import { useAuth } from "~/components/auth/AuthProvider"; // <-- Global auth

import DeleteRecipe from "~/components/screens/DeleteRecipe";
import TaskBar from "~/components/dashboard/taskbar";
import RecipeEditor from "~/components/dashboard/recipeEditor";
import RecipeViewer from "~/components/dashboard/recipeViewer";
import RecipeSearchbar from "~/components/dashboard/searchbar";
import RecipeBrowser from "~/components/dashboard/recipebrowser";
import { setUserId, userId } from "~/stores/user";
import SearchRecipe from "~/components/screens/SearchRecipe";

function displayDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Dashboard() {
    // --- AUTH STATE & NAVIGATION ---
    const { session, loading } = useAuth(); 
    const navigate = useNavigate();

    // --- CLEAN OAUTH HASH TOKENS AFTER REDIRECT ---
    onMount(() => {
      // Only run if user is logged in
      if (session()) {
        const hash = window.location.hash;
        if (hash.includes("access_token")) {
          window.history.replaceState({}, document.title, "/dashboard");
        }
      }
    });

    const [selectedRecipeId, setSelectedRecipeId] = createSignal<number | null>(null);
    const [currentRecipe, setCurrentRecipe] = createSignal<any>(null);
    const [savedRecipes, setSavedRecipes] = createSignal<any[]>([]);
    const [activeView, setActiveView] = createSignal<ActiveView>("add");
    const [username, setUsername] = createSignal("");

    // --- ROUTE GUARD ---
    createEffect(() => {
        if (!loading() && !session()) {
            navigate('/login', { replace: true });
        }
    });

    onMount(async () => {
        const user = session()?.user; 
        if (user) {
            const currUN = await supabaseFn.ensureUserExists();
            setUsername(currUN);
            setUserId(user.id);
            await loadSavedRecipes(user.id);
        }
    });

    const handleSelectRecipe = (id: number | null) => {
        setSelectedRecipeId(id);
        setCurrentRecipe(null);
        if (id !== null) {
            setActiveView("view");
        }
    }

    const handleNewRecipe = () => {
        setSelectedRecipeId(null);
        setCurrentRecipe(null);
        setActiveView("add");
    }

    const handleEditRecipe = () => {
        if (selectedRecipeId()) {
            setActiveView("edit");
        }
    }

    const loadSavedRecipes = async (uid: string) => {
        const res = await fetch(`/api/saved-recipes?user_id=${encodeURIComponent(uid)}`);
        const data = await res.json();
        setSavedRecipes(data || []);
    }

    const toggleSaveRecipe = async (recipeId: number, save: boolean) => {
        if (!userId()) return;
        await fetch("/api/saved-recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId(), recipe_id: recipeId, save })
        });
        await loadSavedRecipes(userId());
    }

    // --- CONDITIONAL RENDERING ---
    return (
        <Show 
            when={!loading() && !!session()}
            fallback={<div class="full-screen-loader" style="display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 1.5em;">Verifying Access...</div>}
        >
            <main class="dashboard">
                <div class="dashboard-main-region">
                    <TaskBar
                        changeScreenTo={setActiveView}
                        onNewRecipe={handleNewRecipe}
                        onEditRecipe={handleEditRecipe}
                        currentRecipe={currentRecipe()}
                        userId={userId()}
                        onToggleSave={toggleSaveRecipe}
                        savedRecipes={savedRecipes()}
                    />
                    <MainArea
                        selectedRecipeId={selectedRecipeId}
                        setSelectedRecipeId={setSelectedRecipeId}
                        setActiveView={setActiveView}
                        activeView={activeView}
                        userId={userId()}
                        onRecipeLoaded={setCurrentRecipe}
                    />
                </div>

                <div class="dashboard-side-region">
                    <RecipeBrowser
                        onSelect={handleSelectRecipe}
                        selected={selectedRecipeId()}
                        userId={userId()}
                        savedRecipes={savedRecipes()}
                    />
                </div>
            </main>
        </Show>
    );
}

// ------------------ MainArea Component ------------------
function MainArea(props: {
    selectedRecipeId: () => number | null,
    setSelectedRecipeId: (v: number | null) => void,
    setActiveView: (v: ActiveView) => void,
    activeView: () => ActiveView,
    userId: string,
    onRecipeLoaded: (r: any) => void
}) {

    const [fullRecipe, { refetch }] = createResource(props.selectedRecipeId, async (id) => {
        if (!id) return null;
        const data = await fetch(`/api/recipes/${id}`).then(r => r.json());
        await displayDelay(400);
        return data;
    });

    createEffect(() => {
        if (!fullRecipe.loading) {
            props.onRecipeLoaded(fullRecipe() || null);
        }
    });

    return (
        <div class="main-area">
            <Switch>
                <Match when={props.activeView() === "add"}>
                    <RecipeEditor />
                </Match>

                <Match when={props.activeView() === "view"}>
                    <Show when={!fullRecipe.loading && fullRecipe()} fallback={
                        <div class="load-recipe-screen">
                            <p>Loading Recipe...</p>
                            <div class='loading-circle' />
                        </div>
                    }>
                        {(recipe) => <RecipeViewer recipe={recipe()} />}
                    </Show>
                </Match>

                <Match when={props.activeView() === "edit"}>
                    <Show when={props.selectedRecipeId()} fallback={
                        <div class="load-recipe-screen">
                            <p>Select a recipe to edit</p>
                        </div>
                    }>
                        <Show when={!fullRecipe.loading && fullRecipe()} fallback={
                            <div class="load-recipe-screen">
                                <p>Loading Recipe...</p>
                                <div class='loading-circle' />
                            </div>
                        }>
                            {(recipe) => (
                                <RecipeEditor
                                    recipe={recipe()}
                                    onSaveSuccess={() => {
                                        refetch();
                                        props.setActiveView("view");
                                    }}
                                />
                            )}
                        </Show>
                    </Show>
                </Match>

                <Match when={props.activeView() === "delete"}>
                    <DeleteRecipe />
                </Match>

                <Match when={props.activeView() === "search"}>
                    <SearchRecipe />
                </Match>
            </Switch>
        </div>
    );
}
