/**
 * YUDU Restaurant Partner Portal - Sound Controller (bell sound disabled)
 * All audio playback has been removed. The YUDUSound API is kept intact
 * so the rest of the app continues to work without errors.
 */

(function () {
  let isInitialized = false;
  let isMuted = false;
  let lastEmittedStateJson = "";

  const activeAlarmOrderIds = new Set();

  // ─── State ───────────────────────────────────────────────────────────────────

  function getState() {
    return {
      isBlocked: false,
      isMuted,
      alertsEnabled: true,
      isRinging: false,
      activeAlarmOrderIds: Array.from(activeAlarmOrderIds),
    };
  }

  function emitSoundState() {
    const st = getState();
    const json = JSON.stringify(st);
    if (json === lastEmittedStateJson) return;
    lastEmittedStateJson = json;
    window.dispatchEvent(
      new CustomEvent("yudu-sound-state-changed", { detail: st })
    );
  }

  // ─── Order tracking (no sound) ───────────────────────────────────────────────

  function syncOrders(orders) {
    const list = Array.isArray(orders) ? orders : [];
    activeAlarmOrderIds.clear();
    list.forEach((order) => {
      if (order && order.status === "new" && !order.acknowledged) {
        activeAlarmOrderIds.add(order.id);
      }
    });
    emitSoundState();
  }

  function notifyNewOrder(order) {
    if (!order || order.status !== "new" || order.acknowledged) return;
    activeAlarmOrderIds.add(order.id);
    emitSoundState();
  }

  function stopOrderAlarm(orderId) {
    if (!orderId) return;
    const cleanId = String(orderId).replace(/^#/, "").trim();
    activeAlarmOrderIds.delete(cleanId);
    activeAlarmOrderIds.delete(orderId);
    emitSoundState();
  }

  function stopAllAlarms() {
    activeAlarmOrderIds.clear();
    emitSoundState();
  }

  // ─── Mute / unlock stubs (no-ops, kept for API compatibility) ────────────────

  function unlockAudio() { return Promise.resolve(true); }
  function setMuted(muted) { isMuted = Boolean(muted); emitSoundState(); }
  function toggleMute() { setMuted(!isMuted); return Promise.resolve(!isMuted); }

  // ─── Init ────────────────────────────────────────────────────────────────────

  function init() {
    if (isInitialized) return;
    isInitialized = true;
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  window.YUDUSound = {
    init,
    syncOrders,
    notifyNewOrder,
    stopOrderAlarm,
    stopAllAlarms,
    playBellTone: () => {},
    unlockAudio,
    setMuted,
    toggleMute,
    getState,
  };
})();
