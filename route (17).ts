// The bare "/" route redirects to God Mode, which leaves the projects manager
// without an entry point. Re-expose it here at /workspace so God Mode's Command
// Center can open the built Projects → Apps → Graphs surface.
export { default } from "../page";
