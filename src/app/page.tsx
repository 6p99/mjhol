'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { SessionProvider, useSession } from 'next-auth/react';
import {
  Github, ExternalLink, MessageSquare, Send, LogOut, Clock, Star, GitFork, BookOpen, Code2,
  Terminal, ChevronRight, Loader2, User, Trash2, Plus,
  Server, Users, Settings, Volume2, VolumeX,
  Eye, ThumbsUp, ThumbsDown, Lightbulb, Activity, CheckCircle2, AlertTriangle, XCircle,
  Zap, Sun, Moon, Globe, Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Toaster, toast } from 'sonner';

const ADMIN_DISCORD_ID = '803662340465229855';
const DISCORD_AVATAR = 'https://cdn.discordapp.com/avatars/803662340465229855/a_1c9e97d2f9ff510fc8181566bd3868d9.gif?size=128';

// ==================== Types ====================
interface GithubProfile { login:string; name:string; bio:string; avatarUrl:string; githubUrl:string; publicRepos:number; followers:number; following:number; createdAt:string; }
interface GithubRepo { name:string; language:string|null; stars:number; forks:number; url:string; description:string|null; color:string|null; }
interface Comment { id:string; content:string; username:string; discriminator:string|null; avatar:string|null; createdAt:string; }
interface DiscordServerData { id:string; inviteCode:string; serverId:string; name:string; icon:string|null; splash:string|null; banner:string|null; description:string|null; memberCount:number; onlineCount:number; channelId:string|null; channelName:string|null; createdAt:string; }
interface ServiceStatusData { id:string; name:string; description:string|null; status:string; uptime:number; }
interface SkillData { id:string; name:string; level:number; icon:string|null; category:string|null; sortOrder:number; }
interface IdeaData { id:string; title:string; content:string; votes:number; createdAt:string; }
interface AdminStats { totalUsers:number; totalComments:number; totalServers:number; totalRateLimits:number; }

// ==================== Hooks ====================
function useGithubData() {
  const [profile, setProfile] = useState<GithubProfile|null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/github').then(r=>r.json()).then(d=>{setProfile(d.profile);setRepos(d.repos||[]);}).catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  return {profile,repos,loading};
}

function useVisitorCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    fetch('/api/visitors').then(r=>r.json()).then(d=>setCount(d.count||0)).catch(()=>{});
  },[]);
  return count;
}

function useClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const ammanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Amman' }));
      const h = ammanTime.getHours();
      const m = ammanTime.getMinutes().toString().padStart(2, '0');
      setTime(`${h.toString().padStart(2, '0')}:${m} AMM`);
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  },[]);
  return time;
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return { ref, isInView };
}

// ==================== Discord Icon ====================
const DiscordIcon = ({className}: {className?:string}) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/>
  </svg>
);

// ==================== Reveal Wrapper ====================
function Reveal({children, delay=0}: {children: React.ReactNode; delay?:number}) {
  const { ref, isInView } = useReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// ==================== Main App ====================
function AppContent() {
  return <><SessionProvider><MainApp /></SessionProvider><Toaster position="bottom-center" richColors theme="dark" /></>;
}

function MainApp() {
  const [view, setView] = useState<string>('home');
  const [theme, setTheme] = useState<'dark'|'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });
  const [lang, setLang] = useState<'en'|'ar'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lang');
      if (saved === 'en' || saved === 'ar') return saved;
    }
    return 'ar';
  });
  const {data:session,status} = useSession();
  const isAdmin = status==='authenticated' && session?.user?.id===ADMIN_DISCORD_ID;
  const visitorCount = useVisitorCount();
  const clock = useClock();
  const [musicOn, setMusicOn] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('music') === 'true';
    return false;
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.12;
      if (musicOn) audioRef.current.play().catch(()=>{});
      else audioRef.current.pause();
    }
  }, [musicOn]);

  const toggleMusic = () => {
    setMusicOn(!musicOn);
    localStorage.setItem('music', String(!musicOn));
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

  const toggleLang = () => {
    const next = lang === 'ar' ? 'en' : 'ar';
    setLang(next);
    localStorage.setItem('lang', next);
  };

  const isEn = lang === 'en';
  const t = (en: string, ar: string) => isEn ? en : ar;

  const navItems = [
    {id:'home', label: t('home','الرئيسية')},
    {id:'projects', label: t('projects','المشاريع')},
    {id:'servers', label: t('servers','سيرفرات'), admin: true},
    {id:'blog', label: t('blog','المدونة')},
    {id:'guestbook', label: t('guestbook','سجل الزوار')},
    {id:'status', label: t('status','حالة الخدمات')},
    {id:'ideas', label: t('ideas','الأفكار')},
    {id:'admin', label: t('admin','الإدارة'), admin: true},
  ].filter(n => !n.admin || isAdmin);

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-[#000] text-[#f2f3f5]' : 'bg-[#fff] text-[#0d0d0f]'}`} data-theme={theme}>
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      <audio ref={audioRef} src="https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3" loop preload="none" />

      {/* Status Bar */}
      <header className={`sticky top-0 z-50 ${theme === 'dark' ? 'bg-black/85 border-[#1e1f22]' : 'bg-white/85 border-[#e6e6e8]'} border-b backdrop-blur-[10px]`}>
        <div className="max-w-[720px] mx-auto px-5 flex items-center gap-1.5 h-14">
          {/* Session Logo */}
          <a onClick={() => setView('home')} className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-extrabold text-[13px] flex-shrink-0 cursor-pointer ${theme==='dark' ? 'bg-[#f2f3f5] text-black' : 'bg-[#0d0d0f] text-white'}`}>
            6p
          </a>

          {/* Tabs */}
          <nav className="flex items-center gap-0.5 overflow-x-auto flex-1 min-w-0 ml-3.5 nav-tabs-mask">
            {navItems.map(n => (
              <button key={n.id} onClick={() => setView(n.id)}
                className={`px-3 py-2.5 rounded-[20px] text-[13px] whitespace-nowrap transition-colors duration-150 ${
                  view === n.id
                    ? (theme==='dark' ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold')
                    : (theme==='dark' ? 'text-[#96989d] hover:text-white hover:bg-[#1a1b1e]' : 'text-[#5b5c60] hover:text-black hover:bg-[#e8e8ea]')
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[12px] font-mono hidden sm:block ${theme==='dark' ? 'text-[#6a6c72]' : 'text-[#88898d]'}`}>{clock}</span>
            <button onClick={toggleTheme} className={`h-[34px] px-3 rounded-[20px] border font-mono text-[12px] font-bold cursor-pointer transition-colors ${theme==='dark' ? 'border-[#2b2c30] text-white hover:bg-[#1a1b1e]' : 'border-[#d6d6d8] text-black hover:bg-[#e8e8ea]'}`}>
              {theme === 'dark' ? 'light' : 'dark'}
            </button>
            <button onClick={toggleLang} className={`h-[34px] px-3 rounded-[20px] border font-mono text-[12px] font-bold cursor-pointer transition-colors ${theme==='dark' ? 'border-[#2b2c30] text-white hover:bg-[#1a1b1e]' : 'border-[#d6d6d8] text-black hover:bg-[#e8e8ea]'}`}>
              {isEn ? 'AR' : 'EN'}
            </button>
            <button onClick={toggleMusic} className={`h-[34px] w-[34px] rounded-[20px] border flex items-center justify-center cursor-pointer transition-colors ${theme==='dark' ? 'border-[#2b2c30] text-white hover:bg-[#1a1b1e]' : 'border-[#d6d6d8] text-black hover:bg-[#e8e8ea]'}`}>
              {musicOn ? <Volume2 className="w-3.5 h-3.5"/> : <VolumeX className="w-3.5 h-3.5"/>}
            </button>
          </div>
        </div>
      </header>

      {/* Auth Corner */}
      <div className="fixed top-[66px] left-3 z-[150]">
        {status === 'authenticated' && session?.user ? (
          <div className="flex items-center gap-1.5 bg-[#5865F2] text-white px-3 py-1.5 rounded-[20px] shadow-lg text-[12px] font-bold">
            <Avatar className="w-5 h-5"><AvatarImage src={session.user.image||undefined}/><AvatarFallback className="bg-white/20 text-[8px]">{session.user.name?.[0]||'U'}</AvatarFallback></Avatar>
            {session.user.name}
            <button onClick={() => window.location.href='/api/auth/signout?callbackUrl=/'} className="ml-1 hover:text-white/80">×</button>
          </div>
        ) : (
          <a href={`/api/auth/signin/discord?callbackUrl=${encodeURIComponent('/')}`} className="flex items-center gap-1.5 bg-[#5865F2] text-white px-3 py-1.5 rounded-[20px] shadow-lg text-[12px] font-bold hover:bg-[#4752c4] transition-colors">
            <DiscordIcon className="w-3.5 h-3.5"/>
            login
          </a>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}>
            {view === 'home' && <HomeView lang={lang} setView={setView} />}
            {view === 'projects' && <ProjectsView lang={lang} />}
            {view === 'servers' && isAdmin && <ServersView lang={lang} />}
            {view === 'blog' && <BlogView lang={lang} />}
            {view === 'guestbook' && <GuestbookView lang={lang} />}
            {view === 'status' && <StatusView lang={lang} />}
            {view === 'ideas' && <IdeasView lang={lang} />}
            {view === 'admin' && isAdmin && <AdminView lang={lang} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className={`border-t py-5 px-5 ${theme==='dark' ? 'border-[#1e1f22]' : 'border-[#e6e6e8]'}`}>
        <div className="max-w-[720px] mx-auto">
          <div className="flex items-center justify-center gap-4 text-[12px] font-mono" style={{direction:'ltr'}}>
            <a href="https://github.com/6p99" target="_blank" rel="noopener" className={theme==='dark'?'text-[#96989d] hover:text-white':'text-[#5b5c60] hover:text-black'}>GitHub</a>
            <a href="https://discord.com/users/803662340465229855" target="_blank" rel="noopener" className={theme==='dark'?'text-[#96989d] hover:text-white':'text-[#5b5c60] hover:text-black'}>Discord</a>
          </div>
          <div className="mt-2.5 text-center text-[11px] font-mono" style={{direction:'ltr'}}>
            <span className={theme==='dark'?'text-[#6a6c72]':'text-[#88898d]'}>
              <span id="visitCount">{visitorCount.toLocaleString()}</span> visits
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==================== Home View ====================
function HomeView({lang, setView}: {lang:string; setView:(v:string)=>void}) {
  const {data:session,status}=useSession();
  const {profile,repos,loading}=useGithubData();
  const isEn = lang === 'en';
  const t = (en:string, ar:string) => isEn ? en : ar;
  const theme = typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') || 'dark') : 'dark';
  const isDark = theme === 'dark';

  return (
    <div className="max-w-[720px] mx-auto px-5 py-7">
      {/* Profile Card */}
      <Reveal>
        <div className={`rounded-[16px] overflow-hidden border ${isDark ? 'bg-[#111214] border-[#1e1f22]' : 'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
          {/* Banner */}
          <div className="h-[100px] w-full" style={{
            background: isDark
              ? 'repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 10px), linear-gradient(180deg,#1c1d20,#0a0a0b)'
              : 'repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 10px), linear-gradient(180deg,#e8e8ea,#f4f4f5)'
          }} />

          {/* Avatar Row */}
          <div className="px-5 -mt-[38px] flex items-end justify-between">
            <div className="relative w-[84px] h-[84px]">
              {loading ? (
                <Skeleton className="w-[84px] h-[84px] rounded-full" />
              ) : (
                <img
                  src={profile?.avatarUrl || DISCORD_AVATAR}
                  alt="avatar"
                  className={`w-[84px] h-[84px] rounded-full object-cover border-[6px] ${isDark?'border-[#111214]':'border-[#f2f2f3]'} ${isDark?'bg-[#1a1b1e]':'bg-[#e8e8ea]'}`}
                  style={{filter: 'grayscale(1) contrast(1.05)'}}
                />
              )}
              {/* Status Dot */}
              <div className={`absolute bottom-[2px] right-[2px] w-[22px] h-[22px] rounded-full ${isDark?'bg-[#111214]':'bg-[#f2f2f3]'} border-[5px] ${isDark?'border-[#111214]':'border-[#f2f2f3]'} flex items-center justify-center`}>
                <div className={`w-[10px] h-[10px] rounded-full ${isDark?'bg-white':'bg-black'}`} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pb-1.5" style={{direction:'ltr'}}>
              <a href="https://github.com/6p99" target="_blank" rel="noopener"
                className={`h-[34px] px-3.5 rounded-[20px] text-[12px] font-bold flex items-center border transition-colors ${isDark?'border-[#2b2c30] text-[#96989d] hover:bg-[#1a1b1e]':'border-[#d6d6d8] text-[#5b5c60] hover:bg-[#e8e8ea]'}`}>
                {t('GitHub','GitHub')}
              </a>
              <a href="https://discord.com/users/803662340465229855" target="_blank" rel="noopener"
                className={`h-[34px] px-3.5 rounded-[20px] text-[12px] font-bold flex items-center transition-colors ${isDark?'bg-white text-black hover:bg-[#d9dade]':'bg-black text-white hover:bg-[#222]'}`}>
                {t('Message','رسالة')}
              </a>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 pt-3.5 pb-5">
            <div style={{direction:'ltr',textAlign:'left'}}>
              {loading ? (
                <Skeleton className="h-6 w-40 mb-1" />
              ) : (
                <>
                  <div className="text-[20px] font-extrabold tracking-tight">! 𝘽𝙆 𝘔𝘑𝘏𝘖𝘓</div>
                  <div className={`text-[13px] mt-0.5 ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>@6p_9</div>
                  <div className={`text-[13px] mt-1 ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>Dev</div>
                </>
              )}
            </div>

            {/* Badges */}
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {['M','J','H','O','L'].map(letter => (
                <div key={letter} className={`w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[12px] border ${isDark?'bg-[#202124] text-white border-[#1e1f22]':'bg-[#e4e4e6] text-black border-[#e6e6e8]'}`}>
                  {letter}
                </div>
              ))}
            </div>

            <div className={`h-px my-4 ${isDark?'bg-[#1e1f22]':'bg-[#e6e6e8]'}`} />

            {/* About */}
            <div className={`text-[11px] font-bold uppercase tracking-[0.06em] mb-2 ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>
              {t('about me','نبذة عني')}
            </div>
            <p className={`text-[14px] leading-relaxed ${isDark?'text-[#c9cacd]':'text-[#2b2c30]'}`} style={{fontFamily: isEn ? undefined : 'IBM Plex Sans Arabic, sans-serif'}}>
              {t('Discord bot developer.','مطور بوتات ديسكورد.')}
            </p>

            <div className={`h-px my-4 ${isDark?'bg-[#1e1f22]':'bg-[#e6e6e8]'}`} />

            {/* Connections */}
            <div className={`text-[11px] font-bold uppercase tracking-[0.06em] mb-2 ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>
              {t('connections','التوصيلات')}
            </div>
            <div className="flex flex-col gap-2" style={{direction:'ltr'}}>
              <a href="https://github.com/6p99" target="_blank" rel="noopener" className={`flex items-center gap-3 p-2.5 rounded-[10px] transition-colors ${isDark?'hover:bg-[#1a1b1e]':'hover:bg-[#e8e8ea]'}`}>
                <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center text-[11px] font-bold ${isDark?'bg-[#202124] text-white':'bg-[#e4e4e6] text-black'}`}>GH</div>
                <div>
                  <div className="text-[13px] font-medium">GitHub</div>
                  <div className={`text-[12px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>6p99</div>
                </div>
              </a>
              <a href="https://discord.com/users/803662340465229855" target="_blank" rel="noopener" className={`flex items-center gap-3 p-2.5 rounded-[10px] transition-colors ${isDark?'hover:bg-[#1a1b1e]':'hover:bg-[#e8e8ea]'}`}>
                <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center text-[11px] font-bold ${isDark?'bg-[#202124] text-white':'bg-[#e4e4e6] text-black'}`}>DC</div>
                <div>
                  <div className="text-[13px] font-medium">Discord</div>
                  <div className={`text-[12px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>6p_9</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Navigation Teasers */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Reveal delay={0.1}>
          <button onClick={() => setView('projects')} className={`text-left p-5 rounded-[16px] border transition-colors ${isDark?'bg-[#111214] border-[#1e1f22] hover:border-[#2b2c30]':'bg-[#f2f2f3] border-[#e6e6e8] hover:border-[#d6d6d8]'}`}>
            <div className={`text-[11px] font-mono mb-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>01</div>
            <div className="text-[14px] font-bold">{t('projects','المشاريع')}</div>
            <div className={`text-[12px] mt-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{t('repos, pulled live from GitHub','مشاريع، من GitHub مباشرة')}</div>
          </button>
        </Reveal>
        <Reveal delay={0.15}>
          <button onClick={() => setView('servers')} className={`text-left p-5 rounded-[16px] border transition-colors ${isDark?'bg-[#111214] border-[#1e1f22] hover:border-[#2b2c30]':'bg-[#f2f2f3] border-[#e6e6e8] hover:border-[#d6d6d8]'}`}>
            <div className={`text-[11px] font-mono mb-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>02</div>
            <div className="text-[14px] font-bold">{t('servers','سيرفرات')}</div>
            <div className={`text-[12px] mt-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{t('my Discord communities','مجتمعات الدسكورد')}</div>
          </button>
        </Reveal>
        <Reveal delay={0.2}>
          <button onClick={() => setView('blog')} className={`text-left p-5 rounded-[16px] border transition-colors ${isDark?'bg-[#111214] border-[#1e1f22] hover:border-[#2b2c30]':'bg-[#f2f2f3] border-[#e6e6e8] hover:border-[#d6d6d8]'}`}>
            <div className={`text-[11px] font-mono mb-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>03</div>
            <div className="text-[14px] font-bold">{t('blog','المدونة')}</div>
            <div className={`text-[12px] mt-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{t('notes and devlogs','ملاحظات وسجل التطوير')}</div>
          </button>
        </Reveal>
        <Reveal delay={0.25}>
          <button onClick={() => setView('guestbook')} className={`text-left p-5 rounded-[16px] border transition-colors ${isDark?'bg-[#111214] border-[#1e1f22] hover:border-[#2b2c30]':'bg-[#f2f2f3] border-[#e6e6e8] hover:border-[#d6d6d8]'}`}>
            <div className={`text-[11px] font-mono mb-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>04</div>
            <div className="text-[14px] font-bold">{t('guestbook','سجل الزوار')}</div>
            <div className={`text-[12px] mt-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{t('leave a message','اترك رسالة')}</div>
          </button>
        </Reveal>
        <Reveal delay={0.3}>
          <button onClick={() => setView('status')} className={`text-left p-5 rounded-[16px] border transition-colors ${isDark?'bg-[#111214] border-[#1e1f22] hover:border-[#2b2c30]':'bg-[#f2f2f3] border-[#e6e6e8] hover:border-[#d6d6d8]'}`}>
            <div className={`text-[11px] font-mono mb-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>05</div>
            <div className="text-[14px] font-bold">{t('status','حالة الخدمات')}</div>
            <div className={`text-[12px] mt-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{t('service monitoring','مراقبة الخدمات')}</div>
          </button>
        </Reveal>
        <Reveal delay={0.35}>
          <button onClick={() => setView('ideas')} className={`text-left p-5 rounded-[16px] border transition-colors ${isDark?'bg-[#111214] border-[#1e1f22] hover:border-[#2b2c30]':'bg-[#f2f2f3] border-[#e6e6e8] hover:border-[#d6d6d8]'}`}>
            <div className={`text-[11px] font-mono mb-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>06</div>
            <div className="text-[14px] font-bold">{t('ideas','الأفكار')}</div>
            <div className={`text-[12px] mt-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{t('suggest features','اقترح ميزات')}</div>
          </button>
        </Reveal>
      </div>
    </div>
  );
}

// ==================== Projects View ====================
function ProjectsView({lang}:{lang:string}) {
  const {profile,repos,loading}=useGithubData();
  const {data:session,status}=useSession();
  const isAdmin = status==='authenticated' && session?.user?.id===ADMIN_DISCORD_ID;
  const isEn = lang === 'en';
  const t = (en:string, ar:string) => isEn ? en : ar;
  const isDark = typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' : true;

  return (
    <div className="max-w-[720px] mx-auto px-5 py-7">
      <Reveal>
        <h1 className={`text-[28px] font-extrabold tracking-tight mb-2`}>{t('projects','المشاريع')}</h1>
        <p className={`text-[14px] mb-6 ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>
          {t('repos, pulled live from GitHub','مشاريع، من GitHub مباشرة')}
        </p>
      </Reveal>

      {/* GitHub Repos */}
      <div className="space-y-3">
        {loading ? (
          Array.from({length:5}).map((_,i) => (
            <Skeleton key={i} className="h-20 rounded-[16px]" />
          ))
        ) : repos.map((repo, i) => (
          <Reveal key={repo.name} delay={i*0.05}>
            <a href={repo.url} target="_blank" rel="noopener"
              className={`block p-5 rounded-[16px] border transition-colors ${isDark?'bg-[#111214] border-[#1e1f22] hover:border-[#2b2c30]':'bg-[#f2f2f3] border-[#e6e6e8] hover:border-[#d6d6d8]'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1" style={{direction:'ltr'}}>
                    <span className="text-[14px] font-bold truncate">{repo.name}</span>
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: repo.color||'#8b8b8b'}} />
                        <span className={`text-[11px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{repo.language}</span>
                      </div>
                    )}
                  </div>
                  <p className={`text-[13px] line-clamp-2 ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>{repo.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1 text-[12px]">
                    <Star className="w-3.5 h-3.5"/>
                    <span>{repo.stars}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[12px]">
                    <GitFork className="w-3.5 h-3.5"/>
                    <span>{repo.forks}</span>
                  </div>
                </div>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ==================== Servers View ====================
function ServersView({lang}:{lang:string}) {
  const isEn = lang === 'en';
  const t = (en:string, ar:string) => isEn ? en : ar;
  const isDark = typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' : true;
  const [servers, setServers] = useState<DiscordServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const {data:session} = useSession();
  const isAdmin = session?.user?.id===ADMIN_DISCORD_ID;

  const fetchServers = useCallback(() => {
    fetch('/api/servers').then(r=>r.json()).then(d=>{setServers(d.servers||[]);}).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  useEffect(() => { fetchServers(); }, [fetchServers]);

  const addServer = async () => {
    if (!inviteUrl.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/servers', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({inviteUrl})});
      const data = await res.json();
      if (res.ok) { setInviteUrl(''); fetchServers(); toast.success(isEn?'Server added!':'تم إضافة السيرفر!'); }
      else { toast.error(data.error || (isEn?'Failed to add server':'فشل إضافة السيرفر')); }
    } catch { toast.error(isEn?'Error':'خطأ'); }
    setAdding(false);
  };

  const deleteServer = async (id:string) => {
    try {
      await fetch('/api/servers', {method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id})});
      fetchServers();
      toast.success(isEn?'Server removed':'تم حذف السيرفر');
    } catch { toast.error(isEn?'Error':'خطأ'); }
  };

  return (
    <div className="max-w-[720px] mx-auto px-5 py-7">
      <Reveal>
        <h1 className="text-[28px] font-extrabold tracking-tight mb-2">{t('servers','سيرفرات')}</h1>
        <p className={`text-[14px] mb-6 ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>{t('add servers via invite links','أضف سيرفرات عبر رابط الدعوة')}</p>
      </Reveal>

      {/* Add Server */}
      <Reveal delay={0.1}>
        <div className={`p-5 rounded-[16px] border mb-5 ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
          <div className={`text-[11px] font-bold uppercase tracking-[0.06em] mb-3 ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>{t('add server','إضافة سيرفر')}</div>
          <div className="flex gap-2">
            <Input value={inviteUrl} onChange={e=>setInviteUrl(e.target.value)} placeholder="discord.gg/..." className={`flex-1 h-10 rounded-[20px] border text-[13px] ${isDark?'bg-[#0c0d0e] border-[#2b2c30] text-white placeholder:text-[#6a6c72]':'bg-white border-[#d6d6d8] text-black placeholder:text-[#88898d]'}`} />
            <Button onClick={addServer} disabled={adding||!inviteUrl.trim()} size="sm" className="h-10 px-5 rounded-[20px] bg-white text-black hover:bg-[#d9dade] font-bold text-[12px]">
              {adding ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4 mr-1"/>}
              {t('Add','إضافة')}
            </Button>
          </div>
        </div>
      </Reveal>

      {/* Servers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading ? (
          Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-32 rounded-[16px]" />)
        ) : servers.length === 0 ? (
          <div className={`col-span-full text-center py-12 text-[14px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>
            {t('No servers added yet','لم تتم إضافة سيرفرات بعد')}
          </div>
        ) : servers.map((s,i) => (
          <Reveal key={s.id} delay={i*0.05}>
            <div className={`rounded-[16px] border overflow-hidden ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
              {s.banner && <img src={s.banner} alt="" className="w-full h-16 object-cover" />}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {s.icon ? <img src={s.icon} alt="" className="w-10 h-10 rounded-full" /> : <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold ${isDark?'bg-[#202124]':'bg-[#e4e4e6]'}`}>{s.name[0]}</div>}
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold truncate">{s.name}</div>
                    <div className={`text-[11px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>
                      {s.onlineCount} {t('online','متصل')} · {s.memberCount} {t('members','أعضاء')}
                    </div>
                  </div>
                </div>
                <a href={`https://discord.gg/${s.inviteCode}`} target="_blank" rel="noopener" className={`block w-full text-center h-[34px] leading-[34px] rounded-[20px] text-[12px] font-bold transition-colors ${isDark?'bg-white text-black hover:bg-[#d9dade]':'bg-black text-white hover:bg-[#222]'}`}>
                  {t('Join','انضمام')}
                </a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ==================== Blog View ====================
function BlogView({lang}:{lang:string}) {
  const isEn = lang === 'en';
  const t = (en:string, ar:string) => isEn ? en : ar;
  const isDark = typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' : true;

  return (
    <div className="max-w-[720px] mx-auto px-5 py-7">
      <Reveal>
        <h1 className="text-[28px] font-extrabold tracking-tight mb-2">{t('blog','المدونة')}</h1>
        <p className={`text-[14px] mb-6 ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>{t('Devlogs and notes','ملاحظات وسجل التطوير')}</p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className={`p-8 rounded-[16px] border text-center ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
          <BookOpen className={`w-10 h-10 mx-auto mb-3 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`} />
          <p className={`text-[14px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>
            {t('nothing published yet','لا يوجد شيء منشور بعد')}
          </p>
          <p className={`text-[12px] mt-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>
            {t('check back later, or follow the GitHub activity in the meantime','راجع لاحقاً، أو تابع النشاط على GitHub')}
          </p>
        </div>
      </Reveal>
    </div>
  );
}

// ==================== Guestbook View ====================
function GuestbookView({lang}:{lang:string}) {
  const isEn = lang === 'en';
  const t = (en:string, ar:string) => isEn ? en : ar;
  const isDark = typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' : true;
  const {data:session,status}=useSession();
  const [comments,setComments]=useState<Comment[]>([]);
  const [newComment,setNewComment]=useState('');
  const [sending,setSending]=useState(false);
  const [cooldownInfo,setCooldownInfo]=useState<{active:boolean;remaining:string}|null>(null);

  const fetchComments = useCallback(() => {
    fetch('/api/comments').then(r=>r.json()).then(d=>{setComments(d.comments||[]);if(d.cooldown)setCooldownInfo(d.cooldown);}).catch(()=>{});
  },[]);

  useEffect(()=>{fetchComments();const iv=setInterval(fetchComments,30000);return ()=>clearInterval(iv);},[fetchComments]);

  const submitComment = async () => {
    if (!newComment.trim() || !session) return;
    setSending(true);
    try {
      const res = await fetch('/api/comments', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({content:newComment.trim()})});
      const data = await res.json();
      if (res.ok) { setNewComment(''); fetchComments(); toast.success(isEn?'Message sent!':'تم إرسال الرسالة!'); }
      else { if (data.cooldown) setCooldownInfo(data.cooldown); toast.error(data.error || (isEn?'Failed':'فشل')); }
    } catch { toast.error(isEn?'Error':'خطأ'); }
    setSending(false);
  };

  return (
    <div className="max-w-[720px] mx-auto px-5 py-7">
      <Reveal>
        <h1 className="text-[28px] font-extrabold tracking-tight mb-2">{t('guestbook','سجل الزوار')}</h1>
        <p className={`text-[14px] mb-6 ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>{t('sign the guestbook','سجل في دفتر الزوار')}</p>
      </Reveal>

      {/* Comment Form */}
      <Reveal delay={0.1}>
        <div className={`p-5 rounded-[16px] border mb-5 ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
          {status === 'authenticated' && session ? (
            <>
              <div className="flex items-center gap-2 mb-3" style={{direction:'ltr'}}>
                <Avatar className="w-6 h-6"><AvatarImage src={session.user.image||undefined}/><AvatarFallback className="bg-white/10 text-[10px]">{session.user.name?.[0]||'U'}</AvatarFallback></Avatar>
                <span className="text-[13px] font-medium">{session.user.name}</span>
              </div>
              <Textarea value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder={isEn?'Write a message...':'اكتب رسالة...'} maxLength={500} className={`min-h-[80px] rounded-[10px] border text-[13px] resize-none ${isDark?'bg-[#0c0d0e] border-[#2b2c30] text-white placeholder:text-[#6a6c72]':'bg-white border-[#d6d6d8] text-black placeholder:text-[#88898d]'}`} />
              <div className="flex items-center justify-between mt-3">
                <span className={`text-[11px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{newComment.length}/500</span>
                {cooldownInfo?.active ? (
                  <span className={`text-[12px] flex items-center gap-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>
                    <Clock className="w-3.5 h-3.5"/>{cooldownInfo.remaining}
                  </span>
                ) : (
                  <Button onClick={submitComment} disabled={sending||!newComment.trim()} size="sm" className="h-[34px] px-4 rounded-[20px] bg-white text-black hover:bg-[#d9dade] font-bold text-[12px]">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-3.5 h-3.5 mr-1"/>}
                    {t('Send','إرسال')}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className={`text-center py-6 text-[13px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>
              <DiscordIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <a href={`/api/auth/signin/discord?callbackUrl=${encodeURIComponent('/')}`} className="text-[#5865F2] hover:underline font-bold">
                {t('Login with Discord to leave a message','سجل دخول بالدسكورد لتترك رسالة')}
              </a>
            </div>
          )}
        </div>
      </Reveal>

      {/* Comments List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
        {comments.length === 0 ? (
          <div className={`text-center py-8 text-[13px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{t('No messages yet','لا توجد رسائل بعد')}</div>
        ) : comments.map((c,i) => (
          <Reveal key={c.id} delay={i*0.03}>
            <div className={`p-4 rounded-[16px] border ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
              <div className="flex items-center gap-2 mb-2" style={{direction:'ltr'}}>
                <Avatar className="w-6 h-6"><AvatarImage src={c.avatar||undefined}/><AvatarFallback className="bg-white/10 text-[10px]">{c.username?.[0]||'U'}</AvatarFallback></Avatar>
                <span className="text-[13px] font-medium">{c.username}</span>
                <span className={`text-[11px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className={`text-[13px] leading-relaxed ${isDark?'text-[#c9cacd]':'text-[#2b2c30]'}`}>{c.content}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ==================== Status View ====================
function StatusView({lang}:{lang:string}) {
  const isEn = lang === 'en';
  const t = (en:string, ar:string) => isEn ? en : ar;
  const isDark = typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' : true;
  const [services, setServices] = useState<ServiceStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services').then(r=>r.json()).then(d=>{setServices(d.services||[]);}).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const statusColors: Record<string,string> = {
    operational: 'bg-[#2ea043]',
    degraded: 'bg-[#d29922]',
    down: 'bg-[#f85149]',
    maintenance: 'bg-[#6e7681]',
  };

  const statusLabels: Record<string, {en:string;ar:string}> = {
    operational: {en:'Operational',ar:'يعمل'},
    degraded: {en:'Degraded',ar:'متدهور'},
    down: {en:'Down',ar:'متوقف'},
    maintenance: {en:'Maintenance',ar:'صيانة'},
  };

  return (
    <div className="max-w-[720px] mx-auto px-5 py-7">
      <Reveal>
        <h1 className="text-[28px] font-extrabold tracking-tight mb-2">{t('service status','حالة الخدمات')}</h1>
        <p className={`text-[14px] mb-6 ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>{t('current status of all services','حالة جميع الخدمات الحالية')}</p>
      </Reveal>

      {/* Overall Status */}
      <Reveal delay={0.1}>
        <div className={`p-5 rounded-[16px] border mb-5 flex items-center gap-3 ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
          <div className={`w-3 h-3 rounded-full ${services.every(s=>s.status==='operational') ? statusColors.operational : statusColors.degraded}`} />
          <span className="text-[14px] font-bold">
            {services.every(s=>s.status==='operational') ? t('All systems operational','جميع الأنظمة تعمل') : t('Some issues detected','تم اكتشاف مشاكل')}
          </span>
        </div>
      </Reveal>

      {/* Services List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-16 rounded-[16px]" />)
        ) : services.length === 0 ? (
          <div className={`text-center py-8 text-[13px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{t('No services configured','لم يتم تكوين خدمات')}</div>
        ) : services.map((s,i) => (
          <Reveal key={s.id} delay={i*0.05}>
            <div className={`p-4 rounded-[16px] border flex items-center justify-between ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${statusColors[s.status]||statusColors.maintenance}`} />
                <div>
                  <div className="text-[14px] font-medium">{s.name}</div>
                  {s.description && <div className={`text-[11px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{s.description}</div>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-mono ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{s.uptime}%</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-[20px] ${isDark?'bg-[#202124] text-[#96989d]':'bg-[#e4e4e6] text-[#5b5c60]'}`}>
                  {t(statusLabels[s.status]?.en||s.status, statusLabels[s.status]?.ar||s.status)}
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ==================== Ideas View ====================
function IdeasView({lang}:{lang:string}) {
  const isEn = lang === 'en';
  const t = (en:string, ar:string) => isEn ? en : ar;
  const isDark = typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' : true;
  const [ideas, setIdeas] = useState<IdeaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchIdeas = useCallback(() => {
    fetch('/api/ideas').then(r=>r.json()).then(d=>{setIdeas(d.ideas||[]);}).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  useEffect(()=>{fetchIdeas();},[fetchIdeas]);

  const submitIdea = async () => {
    if (!title.trim()||!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/ideas', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title:title.trim(), content:content.trim()})});
      if (res.ok) { setTitle(''); setContent(''); setShowForm(false); fetchIdeas(); toast.success(isEn?'Idea submitted!':'تم إرسال الفكرة!'); }
      else toast.error(isEn?'Failed':'فشل');
    } catch { toast.error(isEn?'Error':'خطأ'); }
    setSubmitting(false);
  };

  const voteIdea = async (id:string, dir:'up'|'down') => {
    try {
      await fetch('/api/ideas', {method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id, dir})});
      fetchIdeas();
    } catch {}
  };

  return (
    <div className="max-w-[720px] mx-auto px-5 py-7">
      <Reveal>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[28px] font-extrabold tracking-tight">{t('ideas','الأفكار')}</h1>
          <Button onClick={()=>setShowForm(!showForm)} size="sm" className={`h-[34px] px-4 rounded-[20px] text-[12px] font-bold ${isDark?'bg-white text-black hover:bg-[#d9dade]':'bg-black text-white hover:bg-[#222]'}`}>
            {showForm ? <XCircle className="w-3.5 h-3.5"/> : <Plus className="w-3.5 h-3.5 mr-1"/>}
            {t(showForm?'Cancel':'New Idea', showForm?'إلغاء':'فكرة جديدة')}
          </Button>
        </div>
        <p className={`text-[14px] mb-6 ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>{t('suggest features and improvements','اقترح ميزات وتحسينات')}</p>
      </Reveal>

      {/* Submit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="overflow-hidden">
            <div className={`p-5 rounded-[16px] border mb-5 ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
              <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder={isEn?'Title':'العنوان'} className={`mb-3 h-10 rounded-[10px] border text-[13px] ${isDark?'bg-[#0c0d0e] border-[#2b2c30] text-white placeholder:text-[#6a6c72]':'bg-white border-[#d6d6d8] text-black placeholder:text-[#88898d]'}`} />
              <Textarea value={content} onChange={e=>setContent(e.target.value)} placeholder={isEn?'Describe your idea...':'صِف فكرتك...'} maxLength={500} className={`min-h-[80px] rounded-[10px] border text-[13px] resize-none mb-3 ${isDark?'bg-[#0c0d0e] border-[#2b2c30] text-white placeholder:text-[#6a6c72]':'bg-white border-[#d6d6d8] text-black placeholder:text-[#88898d]'}`} />
              <Button onClick={submitIdea} disabled={submitting||!title.trim()||!content.trim()} size="sm" className="h-[34px] px-4 rounded-[20px] bg-white text-black hover:bg-[#d9dade] font-bold text-[12px]">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-3.5 h-3.5 mr-1"/>}
                {t('Submit','إرسال')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ideas List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-20 rounded-[16px]" />)
        ) : ideas.length === 0 ? (
          <div className={`text-center py-8 text-[13px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{t('No ideas yet','لا توجد أفكار بعد')}</div>
        ) : ideas.map((idea,i) => (
          <Reveal key={idea.id} delay={i*0.03}>
            <div className={`p-4 rounded-[16px] border ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-0.5 pt-1">
                  <button onClick={()=>voteIdea(idea.id,'up')} className={`p-1 rounded-md transition-colors ${isDark?'hover:bg-[#1a1b1e] text-[#6a6c72] hover:text-white':'hover:bg-[#e8e8ea] text-[#88898d] hover:text-black'}`}><ThumbsUp className="w-3.5 h-3.5"/></button>
                  <span className="text-[12px] font-bold">{idea.votes}</span>
                  <button onClick={()=>voteIdea(idea.id,'down')} className={`p-1 rounded-md transition-colors ${isDark?'hover:bg-[#1a1b1e] text-[#6a6c72] hover:text-white':'hover:bg-[#e8e8ea] text-[#88898d] hover:text-black'}`}><ThumbsDown className="w-3.5 h-3.5"/></button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold mb-1">{idea.title}</div>
                  <p className={`text-[13px] ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>{idea.content}</p>
                  <div className={`text-[11px] mt-2 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{new Date(idea.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ==================== Admin View ====================
function AdminView({lang}:{lang:string}) {
  const isEn = lang === 'en';
  const t = (en:string, ar:string) => isEn ? en : ar;
  const isDark = typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' : true;
  const [stats, setStats] = useState<AdminStats|null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [servers, setServers] = useState<DiscordServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetch('/api/admin').then(r=>r.json()).then(d=>{
      setStats(d.stats); setUsers(d.users||[]); setComments(d.comments||[]); setServers(d.servers||[]);
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const deleteItem = async (type:string, id:string) => {
    try {
      await fetch('/api/admin', {method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type,id})});
      const d = await fetch('/api/admin').then(r=>r.json());
      setStats(d.stats); setUsers(d.users||[]); setComments(d.comments||[]); setServers(d.servers||[]);
      toast.success(isEn?'Deleted':'تم الحذف');
    } catch { toast.error(isEn?'Error':'خطأ'); }
  };

  if (loading) return <div className="max-w-[720px] mx-auto px-5 py-7"><Skeleton className="h-96 rounded-[16px]" /></div>;

  return (
    <div className="max-w-[720px] mx-auto px-5 py-7">
      <Reveal>
        <h1 className="text-[28px] font-extrabold tracking-tight mb-2">{t('admin','الإدارة')}</h1>
        <p className={`text-[14px] mb-6 ${isDark?'text-[#96989d]':'text-[#5b5c60]'}`}>{t('manage everything','إدارة كل شيء')}</p>
      </Reveal>

      {/* Stats Cards */}
      <Reveal delay={0.1}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {label:t('Users','مستخدمين'), value:stats?.totalUsers||0, icon:<Users className="w-4 h-4"/>},
            {label:t('Comments','تعليقات'), value:stats?.totalComments||0, icon:<MessageSquare className="w-4 h-4"/>},
            {label:t('Servers','سيرفرات'), value:stats?.totalServers||0, icon:<Server className="w-4 h-4"/>},
            {label:t('Rate Limits','حدود'), value:stats?.totalRateLimits||0, icon:<Zap className="w-4 h-4"/>},
          ].map((s,i) => (
            <div key={i} className={`p-4 rounded-[16px] border ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
              <div className={`mb-1 ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{s.icon}</div>
              <div className="text-[20px] font-bold">{s.value}</div>
              <div className={`text-[11px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-[20px] mb-5 ${isDark?'bg-[#0c0d0e]':'bg-[#f4f4f5]'}`}>
        {['overview','users','comments','servers'].map(tabId => (
          <button key={tabId} onClick={() => setTab(tabId)}
            className={`flex-1 h-[34px] rounded-[20px] text-[12px] font-bold transition-colors ${
              tab === tabId
                ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                : (isDark ? 'text-[#96989d] hover:text-white' : 'text-[#5b5c60] hover:text-black')
            }`}>
            {t(tabId.charAt(0).toUpperCase()+tabId.slice(1), tabId==='overview'?'نظرة عامة':tabId==='users'?'مستخدمين':tabId==='comments'?'تعليقات':'سيرفرات')}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
        {tab === 'overview' && (
          <div className={`p-5 rounded-[16px] border ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
            <pre className={`text-[12px] font-mono whitespace-pre-wrap leading-relaxed ${isDark?'text-[#c9cacd]':'text-[#2b2c30]'}`}>
{JSON.stringify({stats, usersCount: users.length, commentsCount: comments.length, serversCount: servers.length}, null, 2)}
            </pre>
          </div>
        )}
        {tab === 'users' && users.map((u,i) => (
          <div key={u.id} className={`p-4 rounded-[16px] border flex items-center justify-between ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
            <div className="flex items-center gap-2" style={{direction:'ltr'}}>
              <Avatar className="w-7 h-7"><AvatarImage src={u.avatar||undefined}/><AvatarFallback className="bg-white/10 text-[10px]">{u.username?.[0]||'U'}</AvatarFallback></Avatar>
              <div>
                <div className="text-[13px] font-medium">{u.username}</div>
                <div className={`text-[11px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{u._count?.comments||0} {t('comments','تعليقات')}</div>
              </div>
            </div>
            <Button onClick={()=>deleteItem('user',u.id)} size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"><Trash2 className="w-3.5 h-3.5"/></Button>
          </div>
        ))}
        {tab === 'comments' && comments.map((c,i) => (
          <div key={c.id} className={`p-4 rounded-[16px] border ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2" style={{direction:'ltr'}}>
                <Avatar className="w-6 h-6"><AvatarImage src={c.avatar||undefined}/><AvatarFallback className="bg-white/10 text-[10px]">{c.username?.[0]||'U'}</AvatarFallback></Avatar>
                <span className="text-[13px] font-medium">{c.username}</span>
              </div>
              <Button onClick={()=>deleteItem('comment',c.id)} size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"><Trash2 className="w-3.5 h-3.5"/></Button>
            </div>
            <p className={`text-[13px] ${isDark?'text-[#c9cacd]':'text-[#2b2c30]'}`}>{c.content}</p>
          </div>
        ))}
        {tab === 'servers' && servers.map((s,i) => (
          <div key={s.id} className={`p-4 rounded-[16px] border flex items-center justify-between ${isDark?'bg-[#111214] border-[#1e1f22]':'bg-[#f2f2f3] border-[#e6e6e8]'}`}>
            <div className="flex items-center gap-2">
              {s.icon ? <img src={s.icon} alt="" className="w-8 h-8 rounded-full" /> : <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold ${isDark?'bg-[#202124]':'bg-[#e4e4e6]'}`}>{s.name[0]}</div>}
              <div>
                <div className="text-[13px] font-medium">{s.name}</div>
                <div className={`text-[11px] ${isDark?'text-[#6a6c72]':'text-[#88898d]'}`}>{s.memberCount} {t('members','أعضاء')}</div>
              </div>
            </div>
            <Button onClick={()=>deleteItem('server',s.id)} size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"><Trash2 className="w-3.5 h-3.5"/></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== Export ====================
export default function Page() {
  return <AppContent />;
}
