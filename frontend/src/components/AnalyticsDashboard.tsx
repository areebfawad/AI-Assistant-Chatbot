import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, BarChart3, PieChart as PieIcon, MessageSquare, 
  Calendar, Award, Clock, Sparkles, AlertCircle 
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Conversation } from '../types';
import { useAnalytics } from '../hooks/useAnalytics';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
}

// Custom requestAnimationFrame-based count up animation
const AnimatedCount: React.FC<{ value: number; duration?: number; decimals?: number }> = ({ 
  value, 
  duration = 0.8, 
  decimals = 0 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const currentValue = progress * (endValue - startValue) + startValue;
      setCount(currentValue);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{count.toFixed(decimals)}</>;
};

// Colors for Pie Chart segments
const COLORS = [
  '#6C63FF', // Primary purple
  '#00D4FF', // Secondary cyan
  '#10B981', // Success green
  '#EC4899', // Pink
  '#F59E0B'  // Amber/Orange
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isOpen,
  onClose,
  conversations
}) => {
  const stats = useAnalytics(conversations);

  // Close on Escape press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Calculate highest word count to scale word cloud sizes
  const maxWordFreq = stats.wordCloud.length > 0 
    ? Math.max(...stats.wordCloud.map(w => w.value)) 
    : 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="relative w-full max-w-6xl h-[90vh] md:h-[85vh] overflow-hidden rounded-2xl border border-brand-border bg-brand-card/90 shadow-glow flex flex-col z-10 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border/60 shrink-0">
              <div className="flex items-center space-x-2.5 text-brand-primary">
                <BarChart3 className="h-6 w-6" />
                <h3 className="text-xl font-bold text-brand-text">NexusAI Analytics Dashboard</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-border/40 transition-colors"
                title="Close Dashboard"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Dashboard Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <AlertCircle className="h-16 w-16 text-brand-muted mb-4 animate-pulse" />
                  <h4 className="text-lg font-bold text-brand-text mb-2">No Data Available Yet</h4>
                  <p className="text-sm text-brand-muted max-w-sm">
                    Start chatting with NexusAI to generate insights and view usage statistics in real-time.
                  </p>
                </div>
              ) : (
                <>
                  {/* Top Stats Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Chats */}
                    <div className="p-4 rounded-xl border border-brand-border/50 bg-[#0A0A0F]/50 flex flex-col justify-between hover:border-brand-primary/45 transition-colors">
                      <div className="flex items-center justify-between text-brand-muted mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Total Chats</span>
                        <MessageSquare className="h-4 w-4 text-brand-primary" />
                      </div>
                      <div>
                        <div className="text-2xl md:text-3xl font-extrabold text-brand-text">
                          <AnimatedCount value={stats.totalConversations} />
                        </div>
                        <p className="text-[10px] text-brand-muted mt-1">Conversations started</p>
                      </div>
                    </div>

                    {/* Total Messages */}
                    <div className="p-4 rounded-xl border border-brand-border/50 bg-[#0A0A0F]/50 flex flex-col justify-between hover:border-brand-primary/45 transition-colors">
                      <div className="flex items-center justify-between text-brand-muted mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Total Messages</span>
                        <Sparkles className="h-4 w-4 text-brand-secondary" />
                      </div>
                      <div>
                        <div className="text-2xl md:text-3xl font-extrabold text-brand-text">
                          <AnimatedCount value={stats.totalMessages} />
                        </div>
                        <p className="text-[10px] text-brand-muted mt-1">
                          {stats.totalUserMessages} sent • {stats.totalAIResponses} received
                        </p>
                      </div>
                    </div>

                    {/* Avg Length */}
                    <div className="p-4 rounded-xl border border-brand-border/50 bg-[#0A0A0F]/50 flex flex-col justify-between hover:border-brand-primary/45 transition-colors">
                      <div className="flex items-center justify-between text-brand-muted mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Avg Chat Length</span>
                        <Award className="h-4 w-4 text-brand-success" />
                      </div>
                      <div>
                        <div className="text-2xl md:text-3xl font-extrabold text-brand-text">
                          <AnimatedCount value={stats.averageConversationLength} decimals={1} />
                        </div>
                        <p className="text-[10px] text-brand-muted mt-1">Average messages per chat</p>
                      </div>
                    </div>

                    {/* Top Persona & Time */}
                    <div className="p-4 rounded-xl border border-brand-border/50 bg-[#0A0A0F]/50 flex flex-col justify-between hover:border-brand-primary/45 transition-colors">
                      <div className="flex items-center justify-between text-brand-muted mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Active Period</span>
                        <Clock className="h-4 w-4 text-brand-error" />
                      </div>
                      <div>
                        <div className="text-base md:text-lg font-bold text-brand-text truncate">
                          {stats.mostActiveTimeOfDay !== 'None' ? stats.mostActiveTimeOfDay.split(' ')[0] : 'No activity'}
                        </div>
                        <p className="text-[10px] text-brand-muted mt-1">
                          Fav Persona: <span className="text-brand-secondary font-medium">{stats.mostUsedPersona}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Charts Row 1 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Activity Chart */}
                    <div className="p-5 rounded-xl border border-brand-border/50 bg-[#0A0A0F]/40 flex flex-col">
                      <div className="flex items-center space-x-2 text-brand-text mb-4 shrink-0">
                        <Calendar className="h-4 w-4 text-brand-primary" />
                        <h4 className="text-sm font-bold">Daily Activity (Last 7 Days)</h4>
                      </div>
                      <div className="h-[250px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.dailyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#6B6B80" 
                              fontSize={11} 
                              tickLine={false} 
                            />
                            <YAxis 
                              stroke="#6B6B80" 
                              fontSize={11} 
                              tickLine={false} 
                              allowDecimals={false} 
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(18, 18, 26, 0.95)', 
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#E8E8F0',
                                fontSize: '12px'
                              }} 
                            />
                            <Bar dataKey="count" name="Messages" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Persona Distribution Chart */}
                    <div className="p-5 rounded-xl border border-brand-border/50 bg-[#0A0A0F]/40 flex flex-col">
                      <div className="flex items-center space-x-2 text-brand-text mb-4 shrink-0">
                        <PieIcon className="h-4 w-4 text-brand-secondary" />
                        <h4 className="text-sm font-bold">Persona Distribution</h4>
                      </div>
                      <div className="h-[250px] w-full flex items-center justify-center">
                        {stats.personaData.length === 0 ? (
                          <p className="text-sm text-brand-muted">No persona data found.</p>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats.personaData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {stats.personaData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(18, 18, 26, 0.95)', 
                                  borderColor: 'rgba(255, 255, 255, 0.1)',
                                  borderRadius: '8px',
                                  color: '#E8E8F0',
                                  fontSize: '12px'
                                }} 
                              />
                              <Legend 
                                verticalAlign="bottom" 
                                height={36} 
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '11px', color: '#E8E8F0' }} 
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2 - Top Conversations & Word Cloud */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Chats by Length */}
                    <div className="p-5 rounded-xl border border-brand-border/50 bg-[#0A0A0F]/40 flex flex-col">
                      <div className="flex items-center space-x-2 text-brand-text mb-4 shrink-0">
                        <BarChart3 className="h-4 w-4 text-brand-success" rotate={90} />
                        <h4 className="text-sm font-bold">Top Chats by Message Count</h4>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        {stats.topConversations.length === 0 ? (
                          <p className="text-sm text-brand-muted text-center py-8">No messages recorded.</p>
                        ) : (
                          <div className="space-y-4">
                            {stats.topConversations.map((chat, idx) => (
                              <div key={idx} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-brand-text font-medium truncate max-w-[80%]">
                                    {chat.name}
                                  </span>
                                  <span className="text-brand-muted font-mono">{chat.count} msgs</span>
                                </div>
                                <div className="h-2 w-full bg-[#1a1a26] rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(chat.count / stats.topConversations[0].count) * 100}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                                    className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Word Cloud Tag Cloud */}
                    <div className="p-5 rounded-xl border border-brand-border/50 bg-[#0A0A0F]/40 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-2 text-brand-text mb-4">
                          <Sparkles className="h-4 w-4 text-brand-secondary animate-pulse" />
                          <h4 className="text-sm font-bold">Top User Keywords</h4>
                        </div>
                        {stats.wordCloud.length === 0 ? (
                          <p className="text-sm text-brand-muted text-center py-8">
                            No keyword insights yet. Write longer chat queries!
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2.5 items-center justify-center p-3">
                            {stats.wordCloud.map((word, index) => {
                              // Dynamically scale font sizes between 11px and 20px
                              const fontSize = 11 + (word.value / maxWordFreq) * 9;
                              // Cycle through different styles
                              const colorIndex = index % COLORS.length;
                              return (
                                <motion.span
                                  key={word.text}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.4, delay: index * 0.05 }}
                                  style={{ 
                                    fontSize: `${fontSize}px`,
                                    color: COLORS[colorIndex]
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#12121a] hover:bg-[#181824] hover:shadow-sm border border-brand-border/40 hover:border-brand-primary/30 transition-all font-medium cursor-default whitespace-nowrap"
                                  title={`${word.value} occurrences`}
                                >
                                  {word.text}
                                </motion.span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-[10px] text-brand-muted text-center mt-4 border-t border-brand-border/30 pt-3">
                        Analyzing actual keywords sent in prompts, ignoring common stop words.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AnalyticsDashboard;
