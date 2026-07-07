document.addEventListener("DOMContentLoaded", async () => {
  /** * 1. THE COMPONENT LIST
   * Add any new files here. Format: "data-id": "filename"
   */
  const componentList = {
    "footer": "footer.html",
    "header": "header.html",
  };

  /** * 2. THE LOADING LOGIC
   */
  const loadComponent = async (id) => {
    const element = document.querySelector(`[data-id="${id}"]`);
    if (!element) return; // Skip if the ID isn't on the current page

    try {
      const src = element.getAttribute("data-src") || `htm/${componentList[id]}`;
      const response = await fetch(src);

      if (!response.ok) throw new Error(`Status: ${response.status}`);  

      let html = await response.text();

      // If we are in a subdirectory (data-src starts with '../'), fix relative paths
      if (element.getAttribute("data-src") && element.getAttribute("data-src").startsWith("../")) {
        html = html.replace(/(src|href)="(?!(https?:|#|javascript:|\.\.\/))([^"]+)"/g, '$1="../$3"');
      }

      element.innerHTML = html;

      console.log(`✅ Loaded: ${id}`);
    } catch (err) {
      console.error(`❌ Failed to load [${id}]:`, err);
      element.innerHTML = `<div style="color:red;">Error loading ${id}</div>`;
    }
  };

  /** * 3. EXECUTION
   * This runs all loads at once for maximum speed.
   */
  const activeIds = Object.keys(componentList);
  await Promise.all(activeIds.map(id => loadComponent(id)));

  // Dispatch event so other scripts know components are ready
  document.dispatchEvent(new CustomEvent('componentsLoaded'));
});