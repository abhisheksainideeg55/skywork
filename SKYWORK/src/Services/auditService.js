/**
 * Skywork Audit Service
 * All audit logs are stored in MongoDB via backend API.
 * No localStorage usage.
 */

import api from './apiClient.js';

export const getAuditLogs = async () => {
  try {
    const json = await api.get('/audit-logs');
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('getAuditLogs: backend error', err?.message);
  }
  return [];
};

export const logAction = (actorUserId, actorRole, action, targetUserId, previousValue, newValue, reason) => {
  // Fire-and-forget audit log to backend (non-blocking)
  try {
    api.post('/audit-logs', {
      userId: actorUserId,
      userRole: actorRole,
      action,
      targetId: targetUserId,
      targetType: 'user',
      previousValue,
      newValue,
      description: reason,
      module: 'frontend',
    }).catch(err => {
      console.warn('logAction: failed to persist audit log', err?.message);
    });
  } catch {
    // Silently fail — audit logging should never block the user
  }
};
