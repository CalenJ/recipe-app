import "~/styling/account-delete/account-delete.css";

export default function AccountDelete() {
    return (
        <main>
            <div class="accountdelete-container">
                <div class="accountdelete-content">
                    <h1>CONFIRM</h1>
                    <h3>
                        Are you sure you want to delete your account?<br />
                        (This makes our interns very sad)<br />
                    </h3>
                    <div class="delete-buttons">
                        <button>Delete Account</button>
                        <button>Cancel</button>
                    </div>
                </div>
            </div>
        </main>
    );
}