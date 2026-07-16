import type User from '@/models/User';
import { adminLoginApi, adminLogoutApi } from '@/service/Authservice';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ADMIN_KEY = 'admin_auth_state';

type AdminAuthState = {
    adminToken: string | null;
    adminUser: User | null;
    adminStatus: boolean;
    adminLoading: boolean;

    adminLogin: (email: string, password: string) => Promise<void>;
    adminLogout: () => Promise<void>;
};

const useAdminStore = create<AdminAuthState>()(
    persist(
        (set) => ({
            adminToken: null,
            adminUser: null,
            adminStatus: false,
            adminLoading: false,

            adminLogin: async (email, password) => {
                set({ adminLoading: true });
                try {
                    // Naya admin-specific endpoint use karo
                    const res = await adminLoginApi({ email, password });
                    set({
                        adminToken: res.accessToken,
                        adminUser: res.user,
                        adminStatus: true,
                    });
                } finally {
                    set({ adminLoading: false });
                }
            },

            adminLogout: async () => {
                try {
                    // Naya admin-specific logout endpoint use karo
                    await adminLogoutApi();
                } catch (error) {
                    console.error('Admin logout error:', error);
                } finally {
                    set({
                        adminToken: null,
                        adminUser: null,
                        adminStatus: false,
                        adminLoading: false,
                    });
                }
            },
        }),
        {
            name: ADMIN_KEY,
            partialize: (state) => ({
                adminUser: state.adminUser,
                adminStatus: state.adminStatus,
                // adminToken persist nahi hoga (security)
            }),
        }
    )
);

export default useAdminStore;
