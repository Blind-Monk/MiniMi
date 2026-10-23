export class ResponsiveUtil {
  /**
   * Toggles fullscreen mode for any container element with cross-browser and iOS Safari fallback support.
   */
  public static toggleFullscreen(container: HTMLElement): Promise<void> {
    if (!document.fullscreenElement && !(document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
      if (container.requestFullscreen) {
        return container.requestFullscreen();
      } else if ((container as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
        return (container as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
      }
      return Promise.resolve();
    } else {
      if (document.exitFullscreen) {
        return document.exitFullscreen();
      } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
        return (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
      }
      return Promise.resolve();
    }
  }

  /**
   * Returns clamped device pixel ratio to maintain crisp 4K/retina rendering while avoiding performance degradation.
   */
  public static getClampedPixelRatio(maxRatio = 2.0): number {
    return Math.min(window.devicePixelRatio || 1, maxRatio);
  }

  /**
   * Listens to element resizing with ResizeObserver for responsive canvas updates.
   */
  public static setupCanvasResizeObserver(
    container: HTMLElement,
    onResize: (width: number, height: number) => void
  ): ResizeObserver | null {
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', () => {
        onResize(container.clientWidth, container.clientHeight);
      });
      return null;
    }

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          onResize(width, height);
        }
      }
    });

    observer.observe(container);
    return observer;
  }

  /**
   * Detects whether the current device supports touch events or is a mobile screen.
   */
  public static isTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(max-width: 768px)').matches
    );
  }
}
