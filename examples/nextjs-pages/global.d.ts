import type { Database as DB } from './lib/database.types';

declare global {
	type Database = DB;
	type Test = DB['public']['Tables']['test']['Row'];
	type User = DB['public']['Tables']['users']['Row'];
}
