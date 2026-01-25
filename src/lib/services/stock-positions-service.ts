import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  shares_qty: number;
  avg_cost_basis: number;
  current_price: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export class StockPositionsService {
  private supabase: SupabaseClient | null = null;

  private async getClient(): Promise<SupabaseClient> {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  /**
   * Get all stock positions for the current user
   */
  async getAllPositions(): Promise<Position[]> {
    const supabase = await this.getClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("stock_positions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch positions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single position by ID
   */
  async getPositionById(id: string): Promise<Position | null> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from("stock_positions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch position: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Create a new position
   */
  async createPosition(
    position: Omit<Position, "id" | "user_id" | "created_at" | "updated_at">,
  ): Promise<Position> {
    const supabase = await this.getClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("stock_positions")
      .insert([{ ...position, user_id: user.id }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create position: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing position
   */
  async updatePosition(
    id: string,
    updates: Partial<Position>,
  ): Promise<Position> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from("stock_positions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update position: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a position
   */
  async deletePosition(id: string): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from("stock_positions")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete position: ${error.message}`);
    }
  }
}

// Export a singleton instance
export const stockPositionsService = new StockPositionsService();
