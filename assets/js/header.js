document.addEventListener("DOMContentLoaded", async () => {
  /** * 1. THE COMPONENT LIST
   * Add any new files here. Format: "data-id": "filename"
   */
  const componentList = {
    "header": "header.html",
    "footer": "footer.html",
    "case-studies": "case-studies.html",
    "case-studies-results": "case-studies-results.html",
    "happy-clients": "happy-clients.html",
    "official-partner": "official-partner.html",
  };

  /** * 2. THE LOADING LOGIC
   */
  const loadComponent = async (id) => {
    const element = document.querySelector(`[data-id="${id}"]`);
    if (!element) return; // Skip if the ID isn't on the current page

    try {
      const fileName = componentList[id];
      const response = await fetch(`htm/${fileName}`);

      if (!response.ok) throw new Error(`Status: ${response.status}`);  

      const html = await response.text();
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