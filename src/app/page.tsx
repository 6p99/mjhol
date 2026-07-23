'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionProvider, useSession } from 'next-auth/react';
import {
  Github,
  ExternalLink,
  MessageSquare,
  Send,
  LogOut,
  Clock,
  Star,
  GitFork,
  BookOpen,
  Code2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  User,
  Trash2,
  Plus,
  Server,
  Users,
  UserCheck,
  Link2,
  X,
  RefreshCw,
  ImageIcon,
  Globe,
  Hash,
  BarChart3,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const ADMIN_DISCORD_ID = '803662340465229855';

// ==================== Types ====================
interface GithubProfile {
  login: string;
  name: string;
  bio: string;
  avatarUrl: string;
  githubUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
}

interface GithubRepo {
  name: string;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  description: string | null;
  color: string | null;
}

interface Comment {
  id: string;
  content: string;
  username: string;
  discriminator: string | null;
  avatar: string | null;
  createdAt: string;
}

interface DiscordServerData {
  id: string;
  inviteCode: string;
  serverId: string;
  name: string;
  icon: string | null;
  splash: string | null;
  banner: string | null;
  description: string | null;
  memberCount: number;
  onlineCount: number;
  channelId: string | null;
  channelName: string | null;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalComments: number;
  totalServers: number;
  totalRateLimits: number;
}

// ==================== Hooks ====================
function useGithubData() {
  const [profile, setProfile] = useState<GithubProfile | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/github')
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.profile);
        setRepos(data.repos);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { profile, repos, loading };
}

// ==================== Discord SVG Icon ====================
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
  </svg>
);

// ==================== Main App ====================
function AppContent() {
  return (
    <SessionProvider>
      <MainApp />
    </SessionProvider>
  );
}

function MainApp() {
  const [currentView, setCurrentView] = useState<'profile' | 'servers' | 'admin'>('profile');
  const { data: session, status } = useSession();
  const isAdmin = status === 'authenticated' && session?.user?.id === ADMIN_DISCORD_ID;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_transparent_60%)] blur-3xl animate-pulse" />
        <GridOverlay />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-white/60" />
            <span className="font-mono text-sm text-white/60">6p99.dev</span>
            {currentView !== 'profile' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('profile')}
                className="text-white/50 hover:text-white hover:bg-white/5 ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                الرئيسية
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Admin nav - only visible to admin */}
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView('servers')}
                  className={`text-white/60 hover:text-white hover:bg-white/5 ${currentView === 'servers' ? 'text-white bg-white/10' : ''}`}
                >
                  <Server className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">سيرفرات</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView('admin')}
                  className={`text-white/60 hover:text-white hover:bg-white/5 ${currentView === 'admin' ? 'text-white bg-white/10' : ''}`}
                >
                  <Settings className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">الإدارة</span>
                </Button>
              </>
            )}

            {status === 'authenticated' && session?.user ? (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 border border-white/20">
                  <AvatarImage src={session.user.image || undefined} />
                  <AvatarFallback className="bg-white/10 text-white text-xs">
                    <User className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-white/80 hidden sm:inline">
                  {session.user.name || 'User'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    window.location.href = '/api/auth/signout?callbackUrl=/';
                  }}
                  className="text-white/60 hover:text-white hover:bg-white/5"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  window.location.href = `/api/auth/signin/discord?callbackUrl=${encodeURIComponent('/')}`;
                }}
                size="sm"
                className="bg-white text-black hover:bg-white/90 font-medium"
              >
                <DiscordIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">دخول ديسكورد</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {currentView === 'profile' && <ProfileView />}
        {currentView === 'servers' && isAdmin && <ServersView />}
        {currentView === 'admin' && isAdmin && <AdminView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-md mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/30 text-sm">
              <Terminal className="w-4 h-4" />
              <span>© {new Date().getFullYear()} MJHOL — 6p99</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==================== Profile View ====================
function ProfileView() {
  const { data: session, status } = useSession();
  const { profile, repos, loading } = useGithubData();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [cooldownInfo, setCooldownInfo] = useState<{ active: boolean; remaining: string } | null>(null);
  const [reposExpanded, setReposExpanded] = useState(false);

  const fetchComments = useCallback(() => {
    fetch('/api/comments')
      .then((res) => res.json())
      .then((data) => setComments(data.comments || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 30000);
    return () => clearInterval(interval);
  }, [fetchComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) setError('يجب تسجيل الدخول عبر ديسكورد أولاً للتعليق');
        else if (res.status === 429) {
          if (data.cooldownRemaining) {
            const hours = Math.floor(data.cooldownRemaining / 3600000);
            const minutes = Math.floor((data.cooldownRemaining % 3600000) / 60000);
            setCooldownInfo({ active: true, remaining: `${hours}س ${minutes}د` });
          }
          setError(data.error || 'تم تقييد الطلبات، حاول لاحقاً');
        } else setError(data.error || 'حدث خطأ');
        return;
      }
      setNewComment('');
      setError('');
      setCooldownInfo(null);
      fetchComments();
    } catch {
      setError('فشل إرسال التعليق');
    } finally {
      setSending(false);
    }
  };

  const signInDiscord = () => {
    window.location.href = `/api/auth/signin/discord?callbackUrl=${encodeURIComponent('/')}`;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  const displayRepos = reposExpanded ? repos : repos.slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Hero */}
      <section className="flex flex-col items-center text-center mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl shadow-white/5">
            {loading ? (
              <Skeleton className="w-full h-full bg-white/10" />
            ) : (
              <img
                src={profile?.avatarUrl || '/placeholder.png'}
                alt={profile?.name || '6p99'}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <motion.div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-black flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
          >
            <span className="text-[10px]">●</span>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl sm:text-6xl font-bold tracking-tight mb-3"
        >
          {loading ? <Skeleton className="h-12 w-48 mx-auto bg-white/10" /> : profile?.name || 'MJHOL'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base sm:text-lg text-white/50 max-w-2xl mb-2 font-mono"
        >
          @6p99
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-white/40 max-w-xl mb-8 text-sm sm:text-base leading-relaxed"
        >
          {loading
            ? 'Loading...'
            : profile?.bio || 'I am curious about everything; I try to understand and program everything—the possible and the impossible.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex items-center gap-6 sm:gap-8 mb-8"
        >
          <StatBadge icon={<BookOpen className="w-4 h-4" />} value={profile?.publicRepos || 10} label="مستودعات" />
          <StatBadge icon={<Star className="w-4 h-4" />} value={profile?.followers || 0} label="متابعين" />
          <StatBadge icon={<Github className="w-4 h-4" />} value={profile?.following || 4} label="يتابع" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <a
            href="https://github.com/6p99"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all"
          >
            <Github className="w-5 h-5" />
            GitHub
          </a>
        </motion.div>
      </section>

      {/* Repositories */}
      <section className="mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Code2 className="w-7 h-7 text-white/40" />
                المستودعات
              </h2>
              <p className="text-white/40 text-sm mt-1">أحدث المشاريع والمستودعات</p>
            </div>
            {repos.length > 6 && (
              <Button variant="ghost" size="sm" onClick={() => setReposExpanded(!reposExpanded)} className="text-white/60 hover:text-white hover:bg-white/5">
                {reposExpanded ? (<><ChevronUp className="w-4 h-4 mr-1" />عرض أقل</>) : (<><ChevronDown className="w-4 h-4 mr-1" />عرض الكل ({repos.length})</>)}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-white/[0.03] border-white/10"><CardContent className="p-5"><Skeleton className="h-5 w-32 bg-white/10 mb-3" /><Skeleton className="h-4 w-full bg-white/10 mb-2" /><Skeleton className="h-4 w-24 bg-white/10" /></CardContent></Card>
                ))
              : displayRepos.map((repo, i) => (
                  <motion.div key={repo.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }}>
                    <Card className="bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 group cursor-pointer h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <BookOpen className="w-4 h-4 text-white/30 flex-shrink-0" />
                            <h3 className="font-semibold text-sm truncate group-hover:text-white/90">{repo.name}</h3>
                          </div>
                          <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/80 transition-colors flex-shrink-0 ml-2">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        {repo.description && <p className="text-xs text-white/40 mb-3 line-clamp-2 leading-relaxed">{repo.description}</p>}
                        <div className="flex items-center gap-3 mt-auto">
                          {repo.language && <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: repo.color || '#8b8b8b' }} /><span className="text-xs text-white/50">{repo.language}</span></div>}
                          {repo.stars > 0 && <div className="flex items-center gap-1 text-white/40"><Star className="w-3 h-3" /><span className="text-xs">{repo.stars}</span></div>}
                          {repo.forks > 0 && <div className="flex items-center gap-1 text-white/40"><GitFork className="w-3 h-3" /><span className="text-xs">{repo.forks}</span></div>}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
          </div>
        </motion.div>
      </section>

      {/* Comments */}
      <section className="mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <MessageSquare className="w-7 h-7 text-white/40" />
                التعليقات
              </h2>
              <p className="text-white/40 text-sm mt-1">شاركنا رأيك • يمكنك التعليق كل 6 ساعات</p>
            </div>
            <Badge variant="secondary" className="bg-white/10 text-white/60 border-white/10">{comments.length} تعليق</Badge>
          </div>

          <Card className="bg-white/[0.03] border-white/10 mb-6">
            <CardContent className="p-5">
              {status === 'authenticated' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6 border border-white/20">
                      <AvatarImage src={session?.user?.image || undefined} />
                      <AvatarFallback className="bg-white/10 text-white text-[10px]"><User className="w-3 h-3" /></AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-white/50">معلّق كـ {session?.user?.name || 'User'}</span>
                  </div>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="اكتب تعليقك هنا..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none min-h-[80px] focus:border-white/30 focus:ring-white/20"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {cooldownInfo?.active && (
                        <div className="flex items-center gap-1 text-xs text-yellow-500/80"><Clock className="w-3 h-3" /><span>يمكنك التعليق بعد {cooldownInfo.remaining}</span></div>
                      )}
                      <span className="text-xs text-white/30">{newComment.length}/500</span>
                    </div>
                    <Button onClick={handleSubmitComment} disabled={sending || !newComment.trim()} size="sm" className="bg-white text-black hover:bg-white/90 font-medium">
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      إرسال
                    </Button>
                  </div>
                  {error && <div className="flex items-center gap-2 text-xs text-red-400"><AlertCircle className="w-3 h-3" /><span>{error}</span></div>}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-white/40 text-sm mb-4">سجّل دخولك عبر ديسكورد لتتمكن من التعليق</p>
                  <Button onClick={signInDiscord} className="bg-white text-black hover:bg-white/90 font-medium">
                    <DiscordIcon className="w-4 h-4 mr-2" />
                    تسجيل الدخول عبر ديسكورد
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {comments.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">لا توجد تعليقات بعد. كن أول من يعلّق!</p>
                </motion.div>
              ) : (
                comments.map((comment, i) => (
                  <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: i * 0.03, duration: 0.3 }}>
                    <Card className="bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8 border border-white/10 flex-shrink-0">
                            <AvatarImage src={comment.avatar || undefined} />
                            <AvatarFallback className="bg-white/10 text-white text-xs">{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white/80">{comment.username}{comment.discriminator && comment.discriminator !== '0' && <span className="text-white/30">#{comment.discriminator}</span>}</span>
                              <span className="text-[11px] text-white/25">{timeAgo(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed break-words">{comment.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

// ==================== Servers View (Admin Only) ====================
function ServersView() {
  const [servers, setServers] = useState<DiscordServerData[]>([]);
  const [inviteUrl, setInviteUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchServers = useCallback(() => {
    fetch('/api/servers')
      .then((res) => res.json())
      .then((data) => setServers(data.servers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const handleAddServer = async () => {
    if (!inviteUrl.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteUrl: inviteUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || 'فشل إضافة السيرفر');
        return;
      }
      setInviteUrl('');
      fetchServers();
    } catch {
      setAddError('فشل الاتصال بالخادم');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    try {
      await fetch('/api/servers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId }),
      });
      fetchServers();
    } catch {
      // silent
    }
  };

  const getServerIcon = (server: DiscordServerData) => {
    if (server.icon) {
      return `https://cdn.discordapp.com/icons/${server.serverId}/${server.icon}.png`;
    }
    return null;
  };

  const getServerBanner = (server: DiscordServerData) => {
    if (server.banner) {
      return `https://cdn.discordapp.com/banners/${server.serverId}/${server.banner}.png`;
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <Server className="w-8 h-8 text-white/40" />
              سيرفرات ديسكورد
            </h1>
            <p className="text-white/40 text-sm mt-2">إدارة السيرفرات عبر روابط الدعوة</p>
          </div>
          <Badge variant="secondary" className="bg-white/10 text-white/60 border-white/10">{servers.length} سيرفر</Badge>
        </div>

        {/* Add Server */}
        <Card className="bg-white/[0.03] border-white/10 mb-8">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={inviteUrl}
                  onChange={(e) => setInviteUrl(e.target.value)}
                  placeholder="discord.gg/..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddServer()}
                />
              </div>
              <Button onClick={handleAddServer} disabled={adding || !inviteUrl.trim()} size="default" className="bg-white text-black hover:bg-white/90 font-medium w-full sm:w-auto">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                إضافة سيرفر
              </Button>
            </div>
            {addError && <div className="flex items-center gap-2 text-xs text-red-400 mt-2"><AlertCircle className="w-3 h-3" /><span>{addError}</span></div>}
          </CardContent>
        </Card>

        {/* Servers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white/[0.03] border-white/10"><CardContent className="p-5"><Skeleton className="h-20 w-20 mx-auto rounded-xl bg-white/10 mb-4" /><Skeleton className="h-5 w-32 mx-auto bg-white/10 mb-2" /><Skeleton className="h-4 w-24 mx-auto bg-white/10" /></CardContent></Card>
            ))}
          </div>
        ) : servers.length === 0 ? (
          <div className="text-center py-20">
            <Server className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/30">لا توجد سيرفرات بعد. أضف سيرفر باستخدام رابط الدعوة!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {servers.map((server, i) => {
                const iconUrl = getServerIcon(server);
                const bannerUrl = getServerBanner(server);
                return (
                  <motion.div
                    key={server.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    layout
                  >
                    <Card className="bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 overflow-hidden group relative">
                      {/* Banner */}
                      {bannerUrl && (
                        <div className="w-full h-24 relative overflow-hidden">
                          <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                        </div>
                      )}
                      <CardContent className="p-5 relative">
                        {/* Delete button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteServer(server.id)}
                          className="absolute top-3 right-3 text-white/20 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>

                        {/* Icon */}
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 mb-3 bg-white/5 -mt-6 relative z-10 shadow-lg">
                            {iconUrl ? (
                              <img src={iconUrl} alt={server.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Server className="w-8 h-8 text-white/30" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold text-sm text-white/90 mb-2">{server.name}</h3>

                          {server.description && (
                            <p className="text-[11px] text-white/40 mb-3 line-clamp-2 leading-relaxed">{server.description}</p>
                          )}

                          {/* Stats */}
                          <div className="w-full grid grid-cols-2 gap-2 mt-auto">
                            <div className="flex items-center gap-1.5 justify-center p-2 rounded-lg bg-white/[0.03]">
                              <Users className="w-3.5 h-3.5 text-white/40" />
                              <span className="text-xs text-white/60">{server.memberCount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 justify-center p-2 rounded-lg bg-white/[0.03]">
                              <UserCheck className="w-3.5 h-3.5 text-green-400/60" />
                              <span className="text-xs text-white/60">{server.onlineCount.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Channel info */}
                          {server.channelName && (
                            <div className="flex items-center gap-1.5 mt-2 text-white/30">
                              <Hash className="w-3 h-3" />
                              <span className="text-[11px]">#{server.channelName}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ==================== Admin View (Admin Only) ====================
function AdminView() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [servers, setServers] = useState<DiscordServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAdminData = useCallback(() => {
    setLoading(true);
    fetch('/api/admin')
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
        setUsers(data.users || []);
        setComments(data.comments || []);
        setServers(data.servers || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleDelete = async (type: string, id: string) => {
    await fetch('/api/admin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id }),
    });
    fetchAdminData();
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `${minutes}د`;
    if (hours < 24) return `${hours}س`;
    return `${days}ي`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <Settings className="w-8 h-8 text-white/40" />
              لوحة الإدارة
            </h1>
            <p className="text-white/40 text-sm mt-2">إدارة كاملة للموقع</p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchAdminData} className="text-white/50 hover:text-white hover:bg-white/5">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-white/[0.03] border-white/10"><CardContent className="p-5"><Skeleton className="h-20 bg-white/10" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Users className="w-5 h-5" />} label="المستخدمين" value={stats?.totalUsers || 0} />
              <StatCard icon={<MessageSquare className="w-5 h-5" />} label="التعليقات" value={stats?.totalComments || 0} />
              <StatCard icon={<Server className="w-5 h-5" />} label="السيرفرات" value={stats?.totalServers || 0} />
              <StatCard icon={<BarChart3 className="w-5 h-5" />} label="تقييدات" value={stats?.totalRateLimits || 0} />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/5 border border-white/10 mb-6">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
                  نظرة عامة
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
                  المستخدمين
                </TabsTrigger>
                <TabsTrigger value="comments" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
                  التعليقات
                </TabsTrigger>
                <TabsTrigger value="servers" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
                  السيرفرات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-4">
                  {/* Recent Users */}
                  <Card className="bg-white/[0.03] border-white/10">
                    <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-white/70">آخر المستخدمين</h3></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {users.slice(0, 5).map((u) => (
                          <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7"><AvatarImage src={u.avatar ? `https://cdn.discordapp.com/avatars/${u.discordId}/${u.avatar}.png` : undefined} /><AvatarFallback className="bg-white/10 text-white text-[10px]"><User className="w-3 h-3" /></AvatarFallback></Avatar>
                              <div>
                                <span className="text-sm text-white/80">{u.username}</span>
                                <span className="text-[10px] text-white/30 ml-1">{timeAgo(u.createdAt)}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-white/30">{u._count?.comments || 0} تعليق</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Comments */}
                  <Card className="bg-white/[0.03] border-white/10">
                    <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-white/70">آخر التعليقات</h3></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {comments.slice(0, 5).map((c) => (
                          <div key={c.id} className="flex items-start justify-between gap-3 p-2 rounded-lg bg-white/[0.02]">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-white/70">{c.user?.username}</span>
                                <span className="text-[10px] text-white/30">{timeAgo(c.createdAt)}</span>
                              </div>
                              <p className="text-xs text-white/50 truncate">{c.content}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete('comment', c.id)} className="text-white/20 hover:text-red-400 hover:bg-red-400/10 flex-shrink-0 w-7 h-7 p-0">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users">
                <div className="space-y-2">
                  {users.map((u) => (
                    <Card key={u.id} className="bg-white/[0.03] border-white/10">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8"><AvatarImage src={u.avatar ? `https://cdn.discordapp.com/avatars/${u.discordId}/${u.avatar}.png` : undefined} /><AvatarFallback className="bg-white/10 text-white text-xs"><User className="w-3 h-3" /></AvatarFallback></Avatar>
                          <div>
                            <div className="text-sm text-white/80">{u.username}</div>
                            <div className="text-[10px] text-white/30">ID: {u.discordId} • {timeAgo(u.createdAt)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-white/5 text-white/40 border-white/10">{u._count?.comments || 0} تعليق</Badge>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete('user', u.id)} className="text-white/20 hover:text-red-400 hover:bg-red-400/10 w-8 h-8 p-0"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {users.length === 0 && <p className="text-white/30 text-center py-12">لا يوجد مستخدمين بعد</p>}
                </div>
              </TabsContent>

              <TabsContent value="comments">
                <div className="space-y-2">
                  {comments.map((c) => (
                    <Card key={c.id} className="bg-white/[0.03] border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="w-6 h-6"><AvatarImage src={c.user?.avatar ? `https://cdn.discordapp.com/avatars/${c.user?.discordId}/${c.user.avatar}.png` : undefined} /><AvatarFallback className="bg-white/10 text-white text-[10px]"><User className="w-2.5 h-2.5" /></AvatarFallback></Avatar>
                              <span className="text-xs font-medium text-white/70">{c.user?.username}</span>
                              <span className="text-[10px] text-white/30">{timeAgo(c.createdAt)}</span>
                            </div>
                            <p className="text-sm text-white/50 leading-relaxed">{c.content}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete('comment', c.id)} className="text-white/20 hover:text-red-400 hover:bg-red-400/10 flex-shrink-0 w-8 h-8 p-0"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {comments.length === 0 && <p className="text-white/30 text-center py-12">لا يوجد تعليقات بعد</p>}
                </div>
              </TabsContent>

              <TabsContent value="servers">
                <div className="space-y-2">
                  {servers.map((s) => {
                    const iconUrl = s.icon ? `https://cdn.discordapp.com/icons/${s.serverId}/${s.icon}.png` : null;
                    return (
                      <Card key={s.id} className="bg-white/[0.03] border-white/10">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
                              {iconUrl ? <img src={iconUrl} alt={s.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Server className="w-5 h-5 text-white/30" /></div>}
                            </div>
                            <div>
                              <div className="text-sm text-white/80">{s.name}</div>
                              <div className="text-[10px] text-white/30">{s.memberCount.toLocaleString()} عضو • {s.onlineCount.toLocaleString()} أونلاين • {timeAgo(s.createdAt)}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete('server', s.id)} className="text-white/20 hover:text-red-400 hover:bg-red-400/10 w-8 h-8 p-0"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {servers.length === 0 && <p className="text-white/30 text-center py-12">لا يوجد سيرفرات بعد</p>}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ==================== Sub-Components ====================
function StatBadge({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5 text-white/40">
        {icon}
        <span className="text-xl sm:text-2xl font-bold text-white/80">{value}</span>
      </div>
      <span className="text-[11px] text-white/30">{label}</span>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="bg-white/[0.03] border-white/10">
      <CardContent className="p-5 text-center">
        <div className="text-white/40 mb-2 flex justify-center">{icon}</div>
        <div className="text-2xl font-bold text-white/90 mb-1">{value.toLocaleString()}</div>
        <div className="text-xs text-white/40">{label}</div>
      </CardContent>
    </Card>
  );
}

function GridOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

export default AppContent;
