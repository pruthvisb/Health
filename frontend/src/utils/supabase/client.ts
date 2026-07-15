import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    if (typeof window !== 'undefined') {
      console.warn("Supabase keys are missing. Initializing mock client for local guest mode.");
    }
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: (callback: any) => {
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        signInWithPassword: async ({ email }: any) => {
          return { data: { user: { id: `mock-user-${Date.now()}`, email, user_metadata: { display_name: 'Explorer User' } } }, error: null };
        },
        signUp: async ({ email, options }: any) => {
          return { data: { user: { id: `mock-user-${Date.now()}`, email, user_metadata: { display_name: options?.data?.display_name || 'Explorer User' } } }, error: null };
        },
        signOut: async () => ({ error: null })
      }
    } as any;
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
};
