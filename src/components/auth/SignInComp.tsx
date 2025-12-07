import { GoogleOAuth } from "~/components/auth/GoogleOAuth"
import "../../styling/login-page/signincomp.css"

export default function SignInComp() {
  return (
    <main class="signin-pane">
        <p id="welcome">Welcome!</p>
        <div id="simp-cont">
          <p id="simp-lbl">We've simplified the sign up and login experience for you!</p>
        </div>
        <div class="google-cont">
          <div id='google-btn'>
          <GoogleOAuth/>
          </div>
          <p id="google-lbl">Just click the button above to sign up/in using your Google account!</p>
        </div>
        

    </main>
  );
}