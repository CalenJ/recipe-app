// export const config = { runtime: "node" };
import { supabaseServer } from "~/supabase/supabase-server";



export async function POST({ request }: { request: Request }) {
    const form = await request.formData();
    const file = form.get("file") as File;

    if (!file) {
        return new Response(
            JSON.stringify({ error: "File missing" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    console.log("FILE:", file);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = `uploads/${crypto.randomUUID()}-${file.name}`;

    const { error } = await supabaseServer.storage
        .from("recipe_thumbnails")
        .upload(filePath, buffer, { contentType: file.type });

    if (error) {
        console.error("Supabase upload failed:", error);
        return new Response(
            JSON.stringify({ error }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
        JSON.stringify({ path: filePath }),
        { headers: { "Content-Type": "application/json" } }
    );
}
