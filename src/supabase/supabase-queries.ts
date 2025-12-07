import { supabase } from "./supabase-client";
import { generateRandomUsername } from "~/utils/genRandomUN";

//Checks if the user already exists in Supabase (new or returning user)
export async function ensureUserExists() {
    const userID = await getCurrentUserID()

    if (!userID) {
        return null;
    }

    //Retrieve single instance of user in public users table
    const { data: existingUser, error: retrievalErr } = await supabase
        .from("users")
        .select("username")
        .eq("user_id", userID)
        .maybeSingle();

    if (retrievalErr) {
        console.log("There was an error contacting Supabase:", retrievalErr.message);
    }

    //Returns existing user's username
    if (existingUser) {
        return existingUser.username;
    }

    //Generates random username for new user, inserts the username and userID, and returns username.
    const newUserUN = generateRandomUsername();
    const { error: userInsertError } = await supabase
        .from("users")
        .insert({ "username": newUserUN, "user_id": userID });

    if (userInsertError) {
        console.log("The following error occurred:", userInsertError);
    }
    return newUserUN;
}


//Retrieves username for the current user
export async function getUserName() {
    const userID = await getCurrentUserID();
    const { data: userName } = await supabase
        .from("users")
        .select("username")
        .eq("user_id", userID);

    return userName;
}


//Gets the user ID for the current user
export async function getCurrentUserID() {
    const { data: userData, error } = await supabase.auth.getUser()
    if (error) {
        console.log("An error has occurred:", error.message);
        return;
    }

    const userID = userData.user.id;

    if (userData) {
        console.log("User found");
    }
    return userID;
}


//Retrieves the id, image path, title, and author of all public recipes
export async function getPublicRecipes() {
    const { data: recipeInfo, error } = await supabase
        .from("recipes")
        .select("recipe_id, recipe_image_path, recipe_title, author_id")
        .eq("is_public", true);

    if (error) {
        console.log("There was an error retrieving recipe info.");
        return null;
    }

    return recipeInfo;
}

//Retrieves the id, image path, title, and author of all user recipes
export async function getUserRecipes(user_id: string) {
    const { data: recipeInfo, error } = await supabase
        .from("recipes")
        .select("recipe_id, recipe_image_path, recipe_title, author_id")
        .eq("author_id", user_id)

    if (error) {
        console.log("There was an error retrieving recipe info.");
        return null;
    }

    return recipeInfo;
}


/*
UPDATES
*/

//Checks if username is not already existing in the databasse
export async function checkUniqueUsername(username: string) {
    const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("username", username)
        .maybeSingle();

    if (error) {
        console.log("There was an error retrieving information");
    }

    if (data) {
        return false;
    }

    return true;
}

export async function updateUsername(newUsername: string) {
    const userID = await getCurrentUserID();

    if (userID) {

        const uniqueName = await checkUniqueUsername(newUsername);

        if (uniqueName) {
            const { error } = await supabase
                .from("users")
                .update({ "username": newUsername })
                .eq('user_id', userID)

            if (error) {
                console.log("There was an error updating the database");
                return;
            }
        }
    }
}

