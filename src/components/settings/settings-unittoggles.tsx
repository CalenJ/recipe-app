import "../../styling/settings-page/settings.css";

export default function UnitToggles() {
    return (
        <div class="unit-toggles">
            <div class="toggle-row">
                <p>Toggle All:</p>
                <label class="toggle">
                    <input type="checkbox" />
                    <span class="slider"></span>
                </label>
            </div>

            <div class="toggle-row">
                <p>Toggle Volume:</p>
                <label class="toggle">
                    <input type="checkbox" />
                    <span class="slider"></span>
                </label>
            </div>

            <div class="toggle-row">
                <p>Toggle Weight:</p>
                <label class="toggle">
                    <input type="checkbox" />
                    <span class="slider"></span>
                </label>
            </div>

            <div class="toggle-row">
                <p>Toggle Temperature:</p>
                <label class="toggle">
                    <input type="checkbox" />
                    <span class="slider"></span>
                </label>
            </div>
        </div>
    );
}
