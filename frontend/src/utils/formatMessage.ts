import { Message } from '../types';

/**
 * Format timestamp to a short time string (e.g. "10:45 AM")
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format timestamp to a full readable date string (e.g. "Jun 17, 2026")
 */
export const formatFullDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Auto-generate a conversation title from the first message
 */
export const getAutoTitle = (text: string): string => {
  const cleaned = text
    .replace(/[#*`\n\r]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleaned.length <= 30) return cleaned || 'New Conversation';
  return cleaned.substring(0, 28) + '...';
};

/**
 * Compile conversation history into standard text/markdown layout for export
 */
export const generateConversationExport = (messages: Message[], title: string): string => {
  let output = `# ${title}\n`;
  output += `Exported from NexusAI on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
  output += `========================================================================\n\n`;

  messages.forEach((msg) => {
    const roleLabel = msg.role === 'user' ? 'USER' : 'NEXUS_AI';
    const timeLabel = new Date(msg.timestamp).toLocaleString();
    output += `## [${timeLabel}] ${roleLabel}\n`;
    output += `${msg.content}\n\n`;
    output += `------------------------------------------------------------------------\n\n`;
  });

  return output;
};
