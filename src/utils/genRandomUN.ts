import adjectives from "~/assets/names/cooking-adj.txt?raw"
import nouns from "~/assets/names/cooking-noun.txt?raw"

//Function generates a random username from two text files, UN format: "AdjectiveNounNumber"
export function generateRandomUsername(): string {

    const cookingAdjs: string[] = adjectives.replace(/\r/g, "").split('\n');
    const cookingNouns: string[] = nouns.replace(/\r/g, "").split('\n');

    const adj: string = cookingAdjs[Math.floor(Math.random() * cookingAdjs.length)];
    const noun: string = cookingNouns[Math.floor(Math.random() * cookingNouns.length)];
    const unNum: number = Math.floor(Math.random() * 1000);

    const username = `${adj}${noun}${unNum}`;

    return username;
}