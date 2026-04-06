export function createRouter(appEl, renderFn) {
  return {
    render(state) {
      appEl.innerHTML = renderFn(state);
    },
  };
}
