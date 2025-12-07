import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";
import "~/styling/404/404.css";

//Set of random 404 pages to serve
function RecipeLost404() {
  return (
    <>
      <h1 class="text-6xl font-bold mb-4">4🍳4</h1>
      <p>Oops! Looks like this recipe got lost in the oven.</p>
    </>
  );
}

function BurntToast404() {
  return (
    <>
      <h1 class="text-6xl font-bold mb-4">404</h1>
      <p>Uh oh… you've toasted the wrong page! 🍞</p>
    </>
  );
}

function EmptyPlate404() {
  return (
    <>
      <h1 class="text-6xl font-bold mb-4">404</h1>
      <p>Nothing served here. 🍽️</p>
    </>
  );
}

function BrokenEgg404() {
  return (
    <>
      <h1 class="text-6xl font-bold mb-4">4🥚4</h1>
      <p>Yolk's on us - this page doesn't exist!</p>
    </>
  );
}

function SpilledMilk404() {
  return (
    <>
      <h1 class="text-6xl font-bold mb-4">404</h1>
      <p>404 - No use crying over spilled pages. 🥛</p>
    </>
  );
}

function CardLost404() {
  return (
    <>
      <h1 class="text-6xl font-bold mb-4">404</h1>
      <p>This recipe card fell out of the cookbook. 📄</p>
    </>
  );
}

function KitchenClosed404() {
  return (
    <>
      <h1 class="text-6xl font-bold mb-4 text-white">404</h1>
      <p class="text-white">The kitchen is closed for the night. 🌙</p>
    </>
  );
}

//This serves the random 404s
export default function NotFound() {
  const variants = [
    RecipeLost404,
    BurntToast404,
    EmptyPlate404,
    BrokenEgg404,
    SpilledMilk404,
    CardLost404,
    KitchenClosed404,
  ];

  const randomIndex = Math.floor(Math.random() * variants.length);
  const Selected404 = variants[randomIndex];

  return (
    <main>
      <div class="not-found-container">
        <div class="not-found-content">
          <Title>Not Found</Title>
          <HttpStatusCode code={404} />
          <Selected404 />
          </div>
      </div>
    </main>
  );
}
