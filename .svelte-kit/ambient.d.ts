
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const VITE_API_URL: string;
	export const USER: string;
	export const SSH_CLIENT: string;
	export const LC_TIME: string;
	export const XDG_SESSION_TYPE: string;
	export const SHLVL: string;
	export const MOTD_SHOWN: string;
	export const HOME: string;
	export const OLDPWD: string;
	export const LC_MONETARY: string;
	export const SSL_CERT_FILE: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const LOGNAME: string;
	export const _: string;
	export const XDG_SESSION_CLASS: string;
	export const XDG_SESSION_ID: string;
	export const VSCODE_CLI_REQUIRE_TOKEN: string;
	export const PATH: string;
	export const VSCODE_AGENT_FOLDER: string;
	export const LC_ADDRESS: string;
	export const XDG_RUNTIME_DIR: string;
	export const SSL_CERT_DIR: string;
	export const LANG: string;
	export const LC_TELEPHONE: string;
	export const SHELL: string;
	export const LC_NAME: string;
	export const LC_MEASUREMENT: string;
	export const LC_IDENTIFICATION: string;
	export const PWD: string;
	export const SSH_CONNECTION: string;
	export const LC_NUMERIC: string;
	export const LC_PAPER: string;
	export const VSCODE_CWD: string;
	export const VSCODE_NLS_CONFIG: string;
	export const VSCODE_HANDLES_SIGPIPE: string;
	export const LS_COLORS: string;
	export const LESSCLOSE: string;
	export const ASDF_DIR: string;
	export const LESSOPEN: string;
	export const XDG_DATA_DIRS: string;
	export const VSCODE_ESM_ENTRYPOINT: string;
	export const VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
	export const BROWSER: string;
	export const VSCODE_RECONNECTION_GRACE_TIME: string;
	export const ELECTRON_RUN_AS_NODE: string;
	export const VSCODE_IPC_HOOK_CLI: string;
	export const APPLICATION_INSIGHTS_NO_STATSBEAT: string;
	export const VSCODE_L10N_BUNDLE_LOCATION: string;
	export const ELECTRON_NO_ASAR: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		VITE_API_URL: string;
		USER: string;
		SSH_CLIENT: string;
		LC_TIME: string;
		XDG_SESSION_TYPE: string;
		SHLVL: string;
		MOTD_SHOWN: string;
		HOME: string;
		OLDPWD: string;
		LC_MONETARY: string;
		SSL_CERT_FILE: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		LOGNAME: string;
		_: string;
		XDG_SESSION_CLASS: string;
		XDG_SESSION_ID: string;
		VSCODE_CLI_REQUIRE_TOKEN: string;
		PATH: string;
		VSCODE_AGENT_FOLDER: string;
		LC_ADDRESS: string;
		XDG_RUNTIME_DIR: string;
		SSL_CERT_DIR: string;
		LANG: string;
		LC_TELEPHONE: string;
		SHELL: string;
		LC_NAME: string;
		LC_MEASUREMENT: string;
		LC_IDENTIFICATION: string;
		PWD: string;
		SSH_CONNECTION: string;
		LC_NUMERIC: string;
		LC_PAPER: string;
		VSCODE_CWD: string;
		VSCODE_NLS_CONFIG: string;
		VSCODE_HANDLES_SIGPIPE: string;
		LS_COLORS: string;
		LESSCLOSE: string;
		ASDF_DIR: string;
		LESSOPEN: string;
		XDG_DATA_DIRS: string;
		VSCODE_ESM_ENTRYPOINT: string;
		VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
		BROWSER: string;
		VSCODE_RECONNECTION_GRACE_TIME: string;
		ELECTRON_RUN_AS_NODE: string;
		VSCODE_IPC_HOOK_CLI: string;
		APPLICATION_INSIGHTS_NO_STATSBEAT: string;
		VSCODE_L10N_BUNDLE_LOCATION: string;
		ELECTRON_NO_ASAR: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
