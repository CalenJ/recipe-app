import { supabase } from "~/supabase/supabase-client";
import GoogleBtn from "~/assets/web_dark_sq_ctn@2x.png"


export function GoogleOAuth(){
    
    const continueWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: "http://localhost:3000/dashboard",
                queryParams: {
                access_type: 'offline',
                prompt: 'consent',
                },
            },
        });
    };

    return (
        <img src={GoogleBtn} onClick={continueWithGoogle}/>
    );
}


