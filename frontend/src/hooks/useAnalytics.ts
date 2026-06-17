import { useMemo } from 'react';
import { Conversation } from '../types';

export interface PersonaStat {
  name: string;
  value: number;
}

export interface DailyActivityStat {
  date: string;
  count: number;
}

export interface TopConversationStat {
  name: string;
  count: number;
}

export interface WordCloudItem {
  text: string;
  value: number;
}

/**
 * Custom React hook to calculate statistics from local conversations
 */
export const useAnalytics = (conversations: Conversation[]) => {
  const stats = useMemo(() => {
    const totalConversations = conversations.length;
    let totalUserMessages = 0;
    let totalAIResponses = 0;
    
    const personaCounts: Record<string, number> = {
      default: 0,
      code: 0,
      creative: 0,
      analyst: 0
    };

    const hourlyCounts = Array(24).fill(0);
    const wordCounts: Record<string, number> = {};

    // Stop words to exclude from simple word cloud
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'for', 'in', 'on', 'at', 
      'by', 'of', 'with', 'from', 'about', 'as', 'that', 'this', 'these', 'those', 'it', 'its', 'they', 
      'them', 'their', 'my', 'your', 'his', 'her', 'we', 'us', 'our', 'i', 'you', 'he', 'she', 'how', 
      'what', 'why', 'where', 'when', 'which', 'who', 'can', 'will', 'do', 'does', 'did', 'have', 'has', 
      'had', 'not', 'no', 'yes', 'me', 'be', 'so', 'if', 'then', 'else', 'please', 'just', 'like', 'get'
    ]);

    // Track messages length for top conversations
    const conversationLengths: TopConversationStat[] = [];

    // Traverse all message history
    conversations.forEach((chat) => {
      // 1. Persona counts
      if (personaCounts[chat.persona] !== undefined) {
        personaCounts[chat.persona]++;
      }

      // 2. Length stats
      conversationLengths.push({
        name: chat.title,
        count: chat.messages.length
      });

      chat.messages.forEach((msg) => {
        if (msg.role === 'user') {
          totalUserMessages++;
          
          // Simple word extraction for cloud
          const words = msg.content
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/);
            
          words.forEach((word) => {
            if (word.length > 2 && !stopWords.has(word)) {
              wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
          });
        } else {
          totalAIResponses++;
        }

        // 3. Time stats
        const date = new Date(msg.timestamp);
        hourlyCounts[date.getHours()]++;
      });
    });

    const totalMessages = totalUserMessages + totalAIResponses;
    const averageConversationLength = totalConversations > 0 
      ? Math.round((totalMessages / totalConversations) * 10) / 10 
      : 0;

    // Format Persona Data for Pie Chart
    const personaMap: Record<string, string> = {
      default: 'General',
      code: 'Coder',
      creative: 'Writer',
      analyst: 'Analyst'
    };

    const personaData: PersonaStat[] = Object.keys(personaCounts).map((key) => ({
      name: personaMap[key] || key,
      value: personaCounts[key]
    })).filter(item => item.value > 0);

    // Find the most used persona
    let mostUsedPersona = 'None';
    let maxPersonaCount = 0;
    Object.keys(personaCounts).forEach((key) => {
      if (personaCounts[key] > maxPersonaCount) {
        maxPersonaCount = personaCounts[key];
        mostUsedPersona = personaMap[key];
      }
    });

    // Format Top 5 Longest Conversations
    const topConversations = conversationLengths
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .filter(item => item.count > 0);

    // Format Daily Activity (last 7 days)
    const dailyActivity: DailyActivityStat[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const dateLabel = day.toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      let dailyCount = 0;
      
      conversations.forEach((chat) => {
        chat.messages.forEach((msg) => {
          const msgDate = new Date(msg.timestamp);
          if (
            msgDate.getDate() === day.getDate() &&
            msgDate.getMonth() === day.getMonth() &&
            msgDate.getFullYear() === day.getFullYear()
          ) {
            dailyCount++;
          }
        });
      });

      dailyActivity.push({
        date: dateLabel,
        count: dailyCount
      });
    }

    // Determine most active time of day
    let morningCount = 0;   // 5 AM - 12 PM
    let afternoonCount = 0; // 12 PM - 5 PM
    let eveningCount = 0;   // 5 PM - 10 PM
    let nightCount = 0;     // 10 PM - 5 AM

    hourlyCounts.forEach((count, hour) => {
      if (hour >= 5 && hour < 12) morningCount += count;
      else if (hour >= 12 && hour < 17) afternoonCount += count;
      else if (hour >= 17 && hour < 22) eveningCount += count;
      else nightCount += count;
    });

    const activePeriods = [
      { name: 'Morning (5am-12pm)', count: morningCount },
      { name: 'Afternoon (12pm-5pm)', count: afternoonCount },
      { name: 'Evening (5pm-10pm)', count: eveningCount },
      { name: 'Night (10pm-5am)', count: nightCount }
    ];

    const sortedPeriods = activePeriods.sort((a, b) => b.count - a.count);
    const mostActiveTimeOfDay = totalMessages > 0 ? sortedPeriods[0].name : 'None';

    // Format Word Cloud (Top 10 words)
    const wordCloud: WordCloudItem[] = Object.keys(wordCounts)
      .map((word) => ({ text: word, value: wordCounts[word] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      totalConversations,
      totalMessages,
      totalUserMessages,
      totalAIResponses,
      averageConversationLength,
      mostUsedPersona,
      personaData,
      dailyActivity,
      mostActiveTimeOfDay,
      topConversations,
      wordCloud
    };
  }, [conversations]);

  return stats;
};
export default useAnalytics;
