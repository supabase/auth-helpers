import type { UserConfig } from 'vite';
import pkg from './package.json';

// https://vitejs.dev/config/
const config: UserConfig = {
	define: {
		PACKAGE_NAME: JSON.stringify(pkg.name.replace('@', '').replace('/', '-')),
		PACKAGE_VERSION: JSON.stringify(pkg.version)
	}
};

export default config;
