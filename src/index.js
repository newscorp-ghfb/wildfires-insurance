/* eslint no-undef: "off" */

import App from './App.svelte';

const app = new App({
  target: document.getElementById(`inset-${__UUID__}`),
});

export default app;
