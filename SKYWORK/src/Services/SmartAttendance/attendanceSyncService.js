// ============================================================
// SKYWORK HRMS - ATTENDANCE SYNC SERVICE (IN-MEMORY QUEUE)
// ============================================================

let _pendingEventsQueue = [];

export const getPendingEvents = () => {
  return [..._pendingEventsQueue];
};

export const queuePendingEvent = (event) => {
  try {
    const eventWithId = {
      ...event,
      id: event.id || `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
      status: 'pending',
    };
    _pendingEventsQueue.push(eventWithId);
    return eventWithId;
  } catch (err) {
    console.error('Failed to queue pending attendance event:', err);
    return null;
  }
};

export const removePendingEvent = (eventId) => {
  _pendingEventsQueue = _pendingEventsQueue.filter((e) => e.id !== eventId);
};

export const clearPendingEvents = () => {
  _pendingEventsQueue = [];
};

export const syncPendingEvents = async (handleCheckIn, handleCheckOut) => {
  const events = getPendingEvents();
  if (events.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining = [];

  for (const evt of events) {
    try {
      if (evt.type === 'check_in' && handleCheckIn) {
        await handleCheckIn(evt.employeeId, evt.metadata);
        synced++;
      } else if (evt.type === 'check_out' && handleCheckOut) {
        await handleCheckOut(evt.employeeId, evt.metadata);
        synced++;
      } else {
        remaining.push(evt);
      }
    } catch (err) {
      console.error('Error syncing event:', evt.id, err);
      failed++;
      evt.retryCount = (evt.retryCount || 0) + 1;
      remaining.push(evt);
    }
  }

  _pendingEventsQueue = remaining;
  return { synced, failed, remainingCount: remaining.length };
};
