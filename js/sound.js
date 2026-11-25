/**
 * YUDU Restaurant Partner Portal - Order Alarm & Notification Sound Controller
 * Synthesizes a crisp metal call-bell "ding" using Web Audio API.
 * Bell rings indefinitely until the Eye (acknowledge) icon is clicked on the Orders page.
 */

(function () {
  const BELL_CHIME_INTERVAL_MS = 2200; // ms between each ding

  let audioCtx = null;
  let alarmIntervalId = null;
  let isBlocked = false;
  let isMuted = false;
  let lastChimeAt = 0;
  let isInitialized = false;
  let lastEmittedStateJson = "";

  const activeAlarmOrderIds = new Set();
  const activeNodes = new Set();

  // ─── Audio Context ───────────────────────────────────────────────────────────

  function getAudioContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtx) {
      audioCtx = new AudioCtx();
      audioCtx.onstatechange = () => {
        if (audioCtx.state === "running" && isBlocked) {
          isBlocked = false;
          emitSoundState();
          if (activeAlarmOrderIds.size > 0 && !isMuted && isAlertsEnabled()) {
            playCallBell();
          }
        }
      };
    }
    return audioCtx;
  }

  // ─── State ───────────────────────────────────────────────────────────────────

  function getState() {
    return {
      isBlocked,
      isMuted,
      alertsEnabled: isAlertsEnabled(),
      isRinging:
        activeAlarmOrderIds.size > 0 && !isMuted && isAlertsEnabled(),
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

  function isAlertsEnabled() {
    try {
      if (window.YUDUStore) {
        const st = YUDUStore.getState();
        if (
          st &&
          st.restaurant &&
          st.restaurant.notifications &&
          st.restaurant.notifications.newOrderAlerts === false
        ) {
          return false;
        }
      }
    } catch (e) {}
    return true;
  }

  // ─── Call Bell Synthesis ─────────────────────────────────────────────────────
  /**
   * Synthesizes a single crisp metal service-bell "ding".
   * Real call bells have:
   *  - Very fast attack (< 5 ms)
   *  - Inharmonic partials (not perfect multiples)
   *  - Long exponential decay (1.5–2 s)
   *  - Fundamental around 2500–3000 Hz
   */
  function playCallBell() {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== "running") return;

    const now = ctx.currentTime + 0.01;

    // Partials of a metal call bell (slightly inharmonic like a real bell)
    const partials = [
      { freq: 2637, vol: 0.55, decay: 1.8 }, // fundamental  (E7)
      { freq: 4186, vol: 0.28, decay: 1.2 }, // 2nd partial  (C8 — slightly sharp)
      { freq: 6272, vol: 0.14, decay: 0.8 }, // 3rd partial  (G8)
      { freq: 7902, vol: 0.07, decay: 0.5 }, // 4th partial  (B8 — inharmonic)
      { freq: 10548, vol: 0.03, decay: 0.3 }, // 5th partial (high shimmer)
    ];

    partials.forEach(({ freq, vol, decay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      // Sharp percussive attack → long exponential ring-out
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.003); // 3 ms attack
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      activeNodes.add(osc);
      activeNodes.add(gain);

      osc.onended = () => {
        activeNodes.delete(osc);
        activeNodes.delete(gain);
        try { osc.disconnect(); gain.disconnect(); } catch (e) {}
      };

      osc.start(now);
      osc.stop(now + decay + 0.05);
    });
  }

  /** Short 2-note notification ping (used for mute toggle feedback) */
  function playNotificationPing(ctx) {
    const now = ctx.currentTime + 0.01;
    const notes = [
      { freq: 1046.5, vol: 0.14, start: 0, decay: 0.3 },
      { freq: 1318.51, vol: 0.16, start: 0.13, decay: 0.4 },
    ];
    notes.forEach(({ freq, vol, start, decay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.linearRampToValueAtTime(vol, now + start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + decay);
      osc.connect(gain);
      gain.connect(ctx.destination);
      activeNodes.add(osc);
      activeNodes.add(gain);
      osc.onended = () => {
        activeNodes.delete(osc);
        activeNodes.delete(gain);
        try { osc.disconnect(); gain.disconnect(); } catch (e) {}
      };
      osc.start(now + start);
      osc.stop(now + start + decay + 0.02);
    });
  }

  function stopActiveNodes() {
    activeNodes.forEach((node) => {
      try {
        if (typeof node.stop === "function") node.stop(0);
        if (typeof node.disconnect === "function") node.disconnect();
      } catch (e) {}
    });
    activeNodes.clear();
  }

  // ─── Chime dispatcher ────────────────────────────────────────────────────────

  function playChime(kind = "alarm", force = false) {
    if (!force && (isMuted || !isAlertsEnabled())) return false;

    const nowMs = Date.now();
    if (!force && nowMs - lastChimeAt < 400) return true;

    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state !== "running") {
      ctx
        .resume()
        .then(() => {
          if (ctx.state === "running") {
            isBlocked = false;
            lastChimeAt = Date.now();
            if (kind === "alarm") playCallBell();
            else playNotificationPing(ctx);
            emitSoundState();
          } else {
            isBlocked = true;
            emitSoundState();
          }
        })
        .catch(() => {
          isBlocked = true;
          emitSoundState();
        });

      if (ctx.state !== "running") {
        isBlocked = true;
        emitSoundState();
        return false;
      }
    }

    isBlocked = false;
    lastChimeAt = nowMs;
    if (kind === "alarm") playCallBell();
    else playNotificationPing(ctx);
    return true;
  }

  // ─── Alarm Loop ──────────────────────────────────────────────────────────────

  function startAlarmLoop() {
    if (alarmIntervalId !== null) return;
    playChime("alarm");
    alarmIntervalId = window.setInterval(() => {
      if (activeAlarmOrderIds.size === 0 || isMuted || !isAlertsEnabled()) {
        stopAlarmLoop();
        return;
      }
      playChime("alarm");
    }, BELL_CHIME_INTERVAL_MS);
  }

  function stopAlarmLoop() {
    if (alarmIntervalId !== null) {
      clearInterval(alarmIntervalId);
      alarmIntervalId = null;
    }
    stopActiveNodes();
  }

  // ─── Order Sync (no auto-expiry — ring until Eye icon clicked) ───────────────

  function syncOrders(orders) {
    const list = Array.isArray(orders) ? orders : [];
    const alertsOn = isAlertsEnabled();

    if (!alertsOn) {
      activeAlarmOrderIds.clear();
      stopAlarmLoop();
      emitSoundState();
      return;
    }

    const prevActiveIds = new Set(activeAlarmOrderIds);
    const nextIds = new Set();

    list.forEach((order) => {
      if (order && order.status === "new" && !order.acknowledged) {
        nextIds.add(order.id);
      }
    });

    let hasNewEntry = false;
    nextIds.forEach((id) => {
      if (!prevActiveIds.has(id)) hasNewEntry = true;
    });

    activeAlarmOrderIds.clear();
    nextIds.forEach((id) => activeAlarmOrderIds.add(id));

    if (activeAlarmOrderIds.size === 0) {
      stopAlarmLoop();
    } else if (alarmIntervalId === null) {
      startAlarmLoop();
    } else if (hasNewEntry) {
      playChime("alarm");
    }

    emitSoundState();
  }

  function notifyNewOrder(order) {
    if (!order || order.status !== "new" || order.acknowledged) return;
    if (!isAlertsEnabled()) return;

    const alreadyActive = activeAlarmOrderIds.has(order.id);
    activeAlarmOrderIds.add(order.id);

    if (alarmIntervalId === null) {
      startAlarmLoop();
    } else if (!alreadyActive) {
      playChime("alarm");
    }

    emitSoundState();
  }

  function stopOrderAlarm(orderId) {
    if (!orderId) return;
    const cleanId = String(orderId).replace(/^#/, "").trim();
    activeAlarmOrderIds.delete(cleanId);
    activeAlarmOrderIds.delete(orderId);

    if (activeAlarmOrderIds.size === 0) {
      stopAlarmLoop();
    }
    emitSoundState();
  }

  function stopAllAlarms() {
    activeAlarmOrderIds.clear();
    stopAlarmLoop();
    emitSoundState();
  }

  // ─── Unlock / Mute ───────────────────────────────────────────────────────────

  function unlockAudio() {
    const ctx = getAudioContext();
    if (!ctx) return Promise.resolve(false);

    if (ctx.state === "running") {
      isBlocked = false;
      emitSoundState();
      return Promise.resolve(true);
    }

    return ctx
      .resume()
      .then(() => {
        const running = ctx.state === "running";
        isBlocked = !running;
        if (running) {
          isMuted = false;
          if (activeAlarmOrderIds.size > 0 && isAlertsEnabled()) {
            if (alarmIntervalId === null) startAlarmLoop();
            else playChime("alarm", true);
          } else {
            playChime("bell", true);
          }
        }
        emitSoundState();
        return running;
      })
      .catch(() => {
        isBlocked = true;
        emitSoundState();
        return false;
      });
  }

  function setMuted(muted) {
    isMuted = Boolean(muted);
    if (isMuted) {
      stopAlarmLoop();
    } else if (activeAlarmOrderIds.size > 0 && isAlertsEnabled()) {
      startAlarmLoop();
    }
    emitSoundState();
  }

  function toggleMute() {
    if (isBlocked) return unlockAudio();
    setMuted(!isMuted);
    if (!isMuted && activeAlarmOrderIds.size === 0) {
      playChime("bell", true);
    }
    return Promise.resolve(!isMuted);
  }

  // ─── Init ────────────────────────────────────────────────────────────────────

  function init() {
    if (isInitialized) return;
    isInitialized = true;

    const handleUserGesture = () => {
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx
          .resume()
          .then(() => {
            if (audioCtx && audioCtx.state === "running") {
              isBlocked = false;
              if (
                activeAlarmOrderIds.size > 0 &&
                !isMuted &&
                isAlertsEnabled() &&
                alarmIntervalId !== null
              ) {
                playChime("alarm");
              }
              emitSoundState();
            }
          })
          .catch(() => {});
      }
    };

    document.addEventListener("pointerdown", handleUserGesture, { passive: true });
    document.addEventListener("keydown", handleUserGesture, { passive: true });
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  window.YUDUSound = {
    init,
    syncOrders,
    notifyNewOrder,
    stopOrderAlarm,
    stopAllAlarms,
    playBellTone: () => playChime("bell"),
    unlockAudio,
    setMuted,
    toggleMute,
    getState,
  };
})();
