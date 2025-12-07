import { Title } from "@solidjs/meta";
import SignInComp from "~/components/auth/SignInComp";
import MainImg from "~/assets/cropped-main.jpg"
import "../styling/login-page/index.css";

export default function MainPage() {


  return (
    <main class='main-page'>
      <Title>Capstone Cooking</Title>
      <div class='first-section-cont'>
        <div class='main-page-img'>
          <img src={MainImg} />
        </div>
        <div class='page-name-section'>
          <p id='page-name'>capstone cooking</p>
          <div id='signin-with-back-cont'>
            <SignInComp />
          </div>
        </div>
      </div>
    </main>
  );
}
