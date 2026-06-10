/**
 * Safe helper to interact with Tauri Desktop APIs
 * Fallbacks gracefully in standard web browser contexts
 */

let runningInTauri = false;

try {
  runningInTauri = typeof window !== 'undefined' && ('__TAURI__' in window || 'isTauri' in window);
} catch (e) {
  // Suppress server-side checks
}

export const isTauri = (): boolean => {
  return runningInTauri;
};

/**
 * Fires a native desktop notification if running in Tauri, otherwise alerts/renders web state 
 */
export async function sendDesktopNotification(title: string, body: string) {
  if (isTauri()) {
    try {
      // Dynamic string construction prevents bundlers (like Rollup or Vite) from trying to parse/resolve the import at build-time.
      const modulePath = '@tauri' + '-apps/api/notification';
      // @ts-ignore
      const { isPermissionGranted, requestPermission, sendNotification } = await import(/* @vite-ignore */ modulePath);
      
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }
      
      if (permissionGranted) {
        sendNotification({ title, body });
        return true;
      }
    } catch (err) {
      console.warn('Failed to fire Tauri notification, fallback to console:', err);
    }
  }
  
  console.log(`[Notification Fallback] Title: ${title} - Body: ${body}`);
  return false;
}

/**
 * Native desktop dialog trigger
 */
export async function showTauriDialog(message: string, type: 'info' | 'warning' | 'error' = 'info') {
  if (isTauri()) {
    try {
      const modulePath = '@tauri' + '-apps/api/dialog';
      // @ts-ignore
      const { message: showMsg } = await import(/* @vite-ignore */ modulePath);
      await showMsg(message, { title: 'Studio Scheduler Desk', kind: type });
      return true;
    } catch (err) {
      // Fail silently and fallback
    }
  }
  return false;
}
