import type { Database as DB } from '../lib/database.types';

declare global {
	type Database = DB;
	type Post = DB['public']['Tables']['posts']['Row'];
}
