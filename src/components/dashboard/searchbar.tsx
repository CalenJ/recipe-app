import "../../styling/dashboard/dashboard-searchbar.css";
import magnifier from "~/assets/dashboard/magnifying-glass.png"

export default function RecipeSearchbar() {
    return (
        <div class="search-bar">
            <div class="search-container">
                <div class="search-bar-main">
                    <input
                        class="search-bar-input"
                        placeholder="Search recipes..."
                        type="text"
                    />
                    <button class="search-bar-button"><img src={magnifier}/></button>
                </div>
                <div class="tag-panel">
                    <button>tag</button>
                    <button>Taaagggg</button>
                    <button>THIS IS TAG</button>
                    <button>GIve_mE_yOUr_sPiCE</button>
                    <button>tag</button>
                    <button>tag</button>
                    <button>tag</button>
                    <button>Taaagggg</button>
                    <button>THIS IS TAG</button>
                    <button>GIve_mE_yOUr_sPiCE</button>
                    <button>tag</button>
                    <button>tag</button>
                    <button>tag</button>
                    <button>Taaagggg</button>
                    <button>THIS IS TAG</button>
                    <button>GIve_mE_yOUr_sPiCE</button>
                    <button>tag</button>
                    <button>tag</button>
                    <button>tag</button>
                    <button>Taaagggg</button>
                    <button>THIS IS TAG</button>
                    <button>GIve_mE_yOUr_sPiCE</button>
                    <button>tag</button>
                    <button>tag</button>
                </div>
            </div>
        </div>
    );
}
