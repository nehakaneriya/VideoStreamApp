import type LoginData from '@/models/LoginData';
import type LoginResponseData from '@/models/LoginResponseData';
import type User from '@/models/User';
import { loginUser, logoutUser } from '@/service/Authservice';
import {create} from 'zustand';
import{ persist } from 'zustand/middleware';

const LOCAL_KEY = 'auth_state';

//global auth store
type AuthState = {
    accessToken: string | null;
    user:User | null;
    authStatus: boolean;
    authLoading: boolean;
    
    login: (loginData: LoginData) => Promise<LoginResponseData>;
    logout: () => Promise<void>;
    checkLogin : () => boolean;

    changeLocalLoginData:(
        accessToken: string,
        user: User,authStatus:boolean
    ) => void;
};  


//main logic of auth store
const useAuthStore = create<AuthState>()(
    persist(

        (set,get) => ({
    accessToken: null,
    user: null,
    authStatus: false,
    authLoading: false,

    changeLocalLoginData:(accessToken,user,authStatus) => {
        set({
            accessToken,
            user,
            authStatus,
            
        });
    },

    login: async (loginData) => {
        console.log("started login in store with data:");
        set({authLoading: true})

       try {
        const loginResponseData = await loginUser(loginData);
        console.log("Login response in store:", loginResponseData);
        set({
            accessToken: loginResponseData.accessToken,
            user: loginResponseData.user,
            authStatus: true,
        });
        return loginResponseData;
       }
        catch (error) {

            console.log("Login error in store:", error);
            throw error;
        }
        finally {
            set({authLoading: false})
        }
    },
    logout:async()=> {
        // Pehle state clear karo — navigate immediately hoga
        set({
            accessToken: null,
            user: null,
            authStatus: false,
            authLoading: false,
        });
        // Server ko best-effort notify karo (cookie clear hogi)
        logoutUser().catch(() => {
            // silently ignore — state toh already clear ho gayi
        });
    },

    

   checkLogin: () => {
        return !!(get().accessToken && get().authStatus);
      },
}),
        {
            name: LOCAL_KEY,
            partialize: (state) => ({
                user: state.user,
                authStatus: state.authStatus,
                // accessToken persist nahi hoga (security)
            }),
        }
    )
);

export default useAuthStore;
    