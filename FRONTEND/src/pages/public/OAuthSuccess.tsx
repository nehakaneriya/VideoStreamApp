import useAuthStore from "@/auth/store";
import { refreshToken  } from "@/service/Authservice";
import { toast } from "react-toastify";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";

function OAuthSuccess() {

    const hasFetched = useRef(false);

    const changeLocalLoginData = useAuthStore(
        (state) => state.changeLocalLoginData
    );

    const navigate = useNavigate();

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        async function getAccessToken() {
            try {
                const responseLoginData = await refreshToken();
                changeLocalLoginData(
                    responseLoginData.accessToken,
                    responseLoginData.user,
                    true
                );
                toast.success("Login successful!");
                navigate("/UserHome");

            } catch (error) {
                toast.error("Failed to refresh access token. Please login again.");
                console.log("Error refreshing access token:", error);
                navigate("/login");
            }
        }
        getAccessToken();

    }, [changeLocalLoginData, navigate]);

    return <div className="p-10 flex-col gap-3 justify-center items-center">
        <Spinner/>
        <h1 className="text-2xl font-semibold">
            Please Wait...
        </h1>
    </div>
    
}

export default OAuthSuccess;