let activeTransition: ViewTransition | null = null;

export async function withViewTransition(updateFn: () => unknown): Promise<void> {
  if (!("startViewTransition" in document)) {
    await updateFn();
    return;
  }

  if (activeTransition) {
    await updateFn();
    return;
  }

  try {
    activeTransition = document.startViewTransition(updateFn);
    await activeTransition.finished;
  } catch (err) {
    if ((err as DOMException).name !== "AbortError") {
      console.error("View transition failed:", err);
    }
  } finally {
    activeTransition = null;
  }
}
