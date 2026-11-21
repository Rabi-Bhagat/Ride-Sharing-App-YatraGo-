// Static-asset Worker for the YatraGo frontend.
// All requests are served from the ASSETS binding configured in wrangler.toml.
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  }
};
