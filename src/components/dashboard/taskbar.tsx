import pencil from "~/assets/dashboard/pencil.png";
import globe from "~/assets/dashboard/globe.png";
import search from "~/assets/dashboard/magnifying-glass.png";
import markdown from "~/assets/dashboard/markdown.png";
import output from "~/assets/dashboard/output.png";/*export is a reserved word*/
import bin from "~/assets/dashboard/trash-can.png";
import settings from "~/assets/dashboard/settings.png"
import type { ActiveView } from "~/types";

type TBScreens = {
    changeScreenTo: (screen: ActiveView) => void;
    onNewRecipe: () => void;
    onEditRecipe: () => void;
    onToggleSave: (recipeId: number, save: boolean) => void;
    currentRecipe: any;
    userId: string;
    savedRecipes: any[];
};

export default function TaskBar(props: TBScreens ) {
    const canEdit = props.currentRecipe && props.userId && props.currentRecipe.author_id === props.userId;
    const recipeId = props.currentRecipe?.recipe_id;
    const isSaved = recipeId ? props.savedRecipes.some((r: any) => Number(r.recipe_id) === Number(recipeId)) : false;

    const showStar = props.currentRecipe && !canEdit;

    return (
        <div class="task-bar">
            <div class="task-bar-buttons">
                <button onClick={props.onNewRecipe}>NEW</button>
                {showStar ? (
                    <button
                        onClick={() => recipeId && props.onToggleSave(recipeId, !isSaved)}
                        title={isSaved ? "Unsave recipe" : "Save recipe"}
                    >
                        {isSaved ? "★" : "☆"}
                    </button>
                ) : (
                    <button onClick={props.onEditRecipe}><img src={pencil} /></button>
                )}
                <button onClick={() => props.changeScreenTo("search")}><img src={search} /></button>
                {/* <button onClick={() => props.changeScreenTo("markdown")}><img src={markdown} /></button> */}
                <button onClick={() => props.changeScreenTo("public")}><img src={globe} /></button>
            </div>

            <div class="task-bar-buttons">
                <button onClick={() => props.changeScreenTo("pdf-export")}><img src={output} /></button>
                <button onClick={() => props.changeScreenTo("delete")}><img src={bin} /></button>
                <button onClick={() => props.changeScreenTo("settings")}><img src={settings}/></button>
            </div>
        </div>
    );
}

//TODO on the side-bar where recipes are browsed this needs to be called on the + button at the bottom
//Also there is currently no + button at the bottom
//<button onClick={() => navigate("/add-recipe")}>new recipe</button>
