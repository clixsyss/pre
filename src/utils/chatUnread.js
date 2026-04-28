const ADMIN_SENDER_TYPES = new Set(['admin', 'system']);

const normalizeSenderType = (senderType) => String(senderType || '').trim().toLowerCase();

const getMessageId = (message) =>
  message?.id ?? message?.messageId ?? message?._id ?? null;

export const getLastIncomingAdminMessageId = (messages = []) => {
  if (!Array.isArray(messages) || messages.length === 0) return null;

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    const senderType = normalizeSenderType(message?.senderType || message?.sender);
    if (!ADMIN_SENDER_TYPES.has(senderType)) continue;

    const messageId = getMessageId(message);
    if (messageId) return messageId;
  }

  return null;
};

export const getUnreadIncomingAdminCount = (messages = [], lastReadMessageId = null) => {
  if (!Array.isArray(messages) || messages.length === 0) return 0;

  if (!lastReadMessageId) {
    return messages.filter((message) => {
      const senderType = normalizeSenderType(message?.senderType || message?.sender);
      return ADMIN_SENDER_TYPES.has(senderType);
    }).length;
  }

  const lastReadIndex = messages.findIndex((message) => getMessageId(message) === lastReadMessageId);
  const unreadSlice = lastReadIndex >= 0 ? messages.slice(lastReadIndex + 1) : messages;

  return unreadSlice.filter((message) => {
    const senderType = normalizeSenderType(message?.senderType || message?.sender);
    return ADMIN_SENDER_TYPES.has(senderType);
  }).length;
};
