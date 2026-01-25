import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export class AuthService {
  private supabase: SupabaseClient | null = null;

  private async getClient(): Promise<SupabaseClient> {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  /**
   * Sign up a new user with email and password
   */
  async signUp(email: string, password: string): Promise<AuthResponse> {
    const supabase = await this.getClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email || "",
            user_metadata: data.user.user_metadata,
          }
        : null,
      error: null,
    };
  }

  /**
   * Sign in a user with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const supabase = await this.getClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email || "",
            user_metadata: data.user.user_metadata,
          }
        : null,
      error: null,
    };
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const supabase = await this.getClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || "",
      user_metadata: user.user_metadata,
    };
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    const supabase = await this.getClient();
    await supabase.auth.signOut();
  }

  /**
   * Update user profile with metadata
   */
  async updateProfile(
    data: Record<string, any>,
  ): Promise<{ user: User | null; error: string | null }> {
    const supabase = await this.getClient();
    const { data: updatedData, error } = await supabase.auth.updateUser({
      data,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return {
      user: updatedData.user
        ? {
            id: updatedData.user.id,
            email: updatedData.user.email || "",
            user_metadata: updatedData.user.user_metadata,
          }
        : null,
      error: null,
    };
  }

  /**
   * Reset password by sending a reset link to email
   */
  async resetPassword(email: string): Promise<{ error: string | null }> {
    const supabase = await this.getClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  }

  /**
   * Update password with the new password
   */
  async updatePassword(newPassword: string): Promise<{
    error: string | null;
  }> {
    const supabase = await this.getClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  }
}

// Export a singleton instance
export const authService = new AuthService();
