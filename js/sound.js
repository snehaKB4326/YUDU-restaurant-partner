/**
 * YUDU Restaurant Partner Portal - Order Alarm & Notification Sound Controller
 * Uses Web Audio API to synthesize a continuous bell-style alarm for 30 seconds
 * per incoming new order, persisting expiration across refreshes.
 */

(function () {
  const ALARM_DURATION_MS = 30000; // 30 seconds per new order
  const BELL_CHIME_INTERVAL_MS = 1400; // Continuous rhythmic bell-style chime

  let audioCtx = null;
  let alarmIntervalId = null;
  let isBlocked = false;
  let isMuted = false;
  let lastChimeAt = 0;
  let isInitialized = false;
  let lastEmittedStateJson = "";

  const activeAlarmOrderIds = new Set();
  const orderExpirationTimers = new Map(); // orderId -> timeoutId
  const orderExpiryMap = new Map(); // orderId -> epoch ms
  const activeNodes = new Set();

  function getState() {
    return {
      isBlocked,
      isMuted,
      alertsEnabled: isAlertsEnabled(),
      isRinging: activeAlarmOrderIds.size > 0 && !isMuted && isAlertsEnabled(),
      activeAlarmOrderIds: Array.from(activeAlarmOrderIds),
    };
  }

  function emitSoundState() {
    const st = getState();
    const json = JSON.stringify(st);
    if (json === lastEmittedStateJson) return;
    lastEmittedStateJson = json;
    window.dispatchEvent(
      new CustomEvent("yudu-sound-state-changed", {
        detail: st,
      }),
    );
  }

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
            playChime("alarm");
          }
        }
      };
    }
    return audioCtx;
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

  function stopActiveNodes() {
    activeNodes.forEach((node) => {
      try {
        if (typeof node.stop === "function") {
          node.stop(0);
        }
        if (typeof node.disconnect === "function") {
          node.disconnect();
        }
      } catch (e) {}
    });
    activeNodes.clear();
  }

  function playToneNote(ctx, freq, startTime, duration, volume, type = "sine") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    activeNodes.add(osc);
    activeNodes.add(gain);

    osc.onended = () => {
      activeNodes.delete(osc);
      activeNodes.delete(gain);
      try {
        osc.disconnect();
        gain.disconnect();
      } catch (e) {}
    };

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  function scheduleChime(ctx, kind = "alarm") {
    const now = ctx.currentTime + 0.02;

    if (kind === "bell") {
      // Crisp 2-note notification bell chime
      playToneNote(ctx, 1046.5, now, 0.3, 0.16, "sine");
      playToneNote(ctx, 2093.0, now, 0.18, 0.05, "triangle");
      playToneNote(ctx, 1318.51, now + 0.13, 0.4, 0.18, "sine");
      playToneNote(ctx, 2637.02, now + 0.13, 0.22, 0.05, "triangle");
      return;
    }

    // Continuous bell-style kitchen alarm (twin bell ring: C6 -> E6, with bell partials)
    playToneNote(ctx, 1046.5, now, 0.34, 0.22, "sine");
    playToneNote(ctx, 2093.0, now, 0.22, 0.07, "triangle");
    playToneNote(ctx, 3135.96, now, 0.12, 0.03, "sine");

    playToneNote(ctx, 1318.51, now + 0.18, 0.42, 0.24, "sine");
    playToneNote(ctx, 2637.02, now + 0.18, 0.26, 0.08, "triangle");
    playToneNote(ctx, 3951.07, now + 0.18, 0.14, 0.03, "sine");

    // Second bell ring within the cycle for continuous service-bell cadence
    playToneNote(ctx, 1046.5, now + 0.65, 0.3, 0.19, "sine");
    playToneNote(ctx, 2093.0, now + 0.65, 0.18, 0.06, "triangle");
    playToneNote(ctx, 1318.51, now + 0.82, 0.44, 0.21, "sine");
    playToneNote(ctx, 2637.02, now + 0.82, 0.24, 0.07, "triangle");
  }

  function playChime(kind = "alarm", force = false) {
    if (!force && (isMuted || !isAlertsEnabled())) return false;

    const nowMs = Date.now();
    if (!force && nowMs - lastChimeAt < 400) {
      return true;
    }

    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state !== "running") {
      ctx
        .resume()
        .then(() => {
          if (ctx.state === "running") {
            isBlocked = false;
            lastChimeAt = Date.now();
            scheduleChime(ctx, kind);
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
    scheduleChime(ctx, kind);
    return true;
  }

  function clearOrderTimer(orderId) {
    const existingTimer = orderExpirationTimers.get(orderId);
    if (existingTimer !== undefined) {
      clearTimeout(existingTimer);
      orderExpirationTimers.delete(orderId);
    }
    orderExpiryMap.delete(orderId);
  }

  function clearAllOrderTimers() {
    orderExpirationTimers.forEach((timerId) => clearTimeout(timerId));
    orderExpirationTimers.clear();
    orderExpiryMap.clear();
  }

  function handleOrderAlarmExpired(orderId) {
    clearOrderTimer(orderId);
    activeAlarmOrderIds.delete(orderId);

    if (window.YUDUStore && typeof YUDUStore.markOrderAlarmCompleted === "function") {
      YUDUStore.markOrderAlarmCompleted(orderId);
    }

    if (activeAlarmOrderIds.size === 0) {
      stopAlarmLoop();
    }
    emitSoundState();
  }

  function scheduleOrderExpiration(orderId, expiresAt) {
    const remainingMs = expiresAt - Date.now();
    if (remainingMs <= 0) {
      handleOrderAlarmExpired(orderId);
      return false;
    }

    const prevExpiry = orderExpiryMap.get(orderId);
    if (prevExpiry === expiresAt && orderExpirationTimers.has(orderId)) {
      return true;
    }

    clearOrderTimer(orderId);
    orderExpiryMap.set(orderId, expiresAt);
    const timerId = window.setTimeout(() => {
      handleOrderAlarmExpired(orderId);
    }, remainingMs);
    orderExpirationTimers.set(orderId, timerId);
    return true;
  }

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

  function syncOrders(orders) {
    const list = Array.isArray(orders) ? orders : [];
    const alertsOn = isAlertsEnabled();

    if (!alertsOn) {
      activeAlarmOrderIds.clear();
      clearAllOrderTimers();
      stopAlarmLoop();
      emitSoundState();
      return;
    }

    const prevActiveIds = new Set(activeAlarmOrderIds);
    const nextIds = new Set();

    list.forEach((order) => {
      if (
        order &&
        order.status === "new" &&
        !order.acknowledged &&
        !order.alarmCompleted
      ) {
        const expiresAt = Number(order.alarmExpiresAt) || Date.now() + ALARM_DURATION_MS;
        if (scheduleOrderExpiration(order.id, expiresAt)) {
          nextIds.add(order.id);
        }
      } else if (order && order.id) {
        clearOrderTimer(order.id);
      }
    });

    // Clear timers for orders no longer present
    Array.from(orderExpirationTimers.keys()).forEach((id) => {
      if (!nextIds.has(id)) {
        clearOrderTimer(id);
      }
    });

    let hasNewEntry = false;
    nextIds.forEach((id) => {
      if (!prevActiveIds.has(id)) {
        hasNewEntry = true;
      }
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
    if (!order || order.status !== "new" || order.acknowledged || order.alarmCompleted) {
      return;
    }
    if (!isAlertsEnabled()) return;

    const expiresAt = Number(order.alarmExpiresAt) || Date.now() + ALARM_DURATION_MS;
    if (!scheduleOrderExpiration(order.id, expiresAt)) {
      return;
    }

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
    clearOrderTimer(cleanId);
    clearOrderTimer(orderId);
    activeAlarmOrderIds.delete(cleanId);
    activeAlarmOrderIds.delete(orderId);

    if (activeAlarmOrderIds.size === 0) {
      stopAlarmLoop();
    }
    emitSoundState();
  }

  function stopAllAlarms() {
    activeAlarmOrderIds.clear();
    clearAllOrderTimers();
    stopAlarmLoop();
    emitSoundState();
  }

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
            if (alarmIntervalId === null) {
              startAlarmLoop();
            } else {
              playChime("alarm", true);
            }
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
    if (isBlocked) {
      return unlockAudio();
    }
    setMuted(!isMuted);
    if (!isMuted && activeAlarmOrderIds.size === 0) {
      playChime("bell", true);
    }
    return Promise.resolve(!isMuted);
  }

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
