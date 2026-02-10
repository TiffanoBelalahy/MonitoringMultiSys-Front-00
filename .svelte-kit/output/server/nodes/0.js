

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.D6y95Y5s.js","_app/immutable/chunks/vkeB5jIz.js","_app/immutable/chunks/n8LsG-mC.js","_app/immutable/chunks/Dv5af70T.js","_app/immutable/chunks/jLOCMUND.js"];
export const stylesheets = ["_app/immutable/assets/0.C6iJBuhP.css"];
export const fonts = [];
