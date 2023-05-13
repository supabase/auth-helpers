export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
	public: {
		Tables: {
			test: {
				Row: {
					created_at: string | null;
					id: number;
				};
				Insert: {
					created_at?: string | null;
					id?: number;
				};
				Update: {
					created_at?: string | null;
					id?: number;
				};
			};
			users: {
				Row: {
					city: string | null;
					country: string | null;
					created_at: string;
					full_name: string | null;
					id: string;
					username: string | null;
				};
				Insert: {
					city?: string | null;
					country?: string | null;
					created_at?: string;
					full_name?: string | null;
					id: string;
					username?: string | null;
				};
				Update: {
					city?: string | null;
					country?: string | null;
					created_at?: string;
					full_name?: string | null;
					id?: string;
					username?: string | null;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}
