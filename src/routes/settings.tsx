import UnitToggles from "~/components/settings/settings-unittoggles";

export default function Settings() {
    return (
        <main>
            <div class="settings-container">
                <div class="settings-content">
                    <h1>SETTINGS</h1>
                    <UnitToggles />
                    <button>Delete Account</button>
                </div>
            </div>
        </main>
    );
}
