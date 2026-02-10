export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["128x128.png","32x32.png","favicon.png","logo.png","svelte.svg","tauri.svg","vite.svg"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.DyUAdPAM.js",app:"_app/immutable/entry/app.DtoJtQR-.js",imports:["_app/immutable/entry/start.DyUAdPAM.js","_app/immutable/chunks/Cf7ljEy4.js","_app/immutable/chunks/n8LsG-mC.js","_app/immutable/chunks/Bi3CszwT.js","_app/immutable/entry/app.DtoJtQR-.js","_app/immutable/chunks/n8LsG-mC.js","_app/immutable/chunks/Cybct0lW.js","_app/immutable/chunks/vkeB5jIz.js","_app/immutable/chunks/Bi3CszwT.js","_app/immutable/chunks/KYk8xwrd.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/processes",
				pattern: /^\/api\/processes\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/processes/_server.ts.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
