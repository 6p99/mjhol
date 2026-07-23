'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionProvider, useSession } from 'next-auth/react';
import {
  Github, ExternalLink, MessageSquare, Send, LogOut, Clock, Star, GitFork, BookOpen, Code2,
  Terminal, ChevronDown, ChevronUp, ChevronRight, Loader2, AlertCircle, User, Trash2, Plus,
  Server, Users, UserCheck, Link2, RefreshCw, BarChart3, Settings, ArrowLeft, Volume2, VolumeX,
  Eye, ThumbsUp, ThumbsDown, Lightbulb, Activity, CheckCircle2, AlertTriangle, XCircle, Wrench,
  Layers, Filter, Search, Zap, Cpu, Database, Music, Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ADMIN_DISCORD_ID = '803662340465229855';

// ==================== Fingerprint ====================
/** Generate a stable fingerprint for this browser (SHA-256 via Web Crypto) */
function generateFingerprint(): Promise<string> {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'na',
    navigator.platform || 'na',
  ].join('|');
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(data)).then(buf =>
    Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  );
}

// ==================== Types ====================
interface GithubProfile { login:string; name:string; bio:string; avatarUrl:string; githubUrl:string; publicRepos:number; followers:number; following:number; createdAt:string; }
interface GithubRepo { name:string; language:string|null; stars:number; forks:number; url:string; description:string|null; color:string|null; }
interface Comment { id:string; content:string; username:string; discriminator:string|null; avatar:string|null; createdAt:string; }
interface DiscordServerData { id:string; inviteCode:string; serverId:string; name:string; icon:string|null; splash:string|null; banner:string|null; description:string|null; memberCount:number; onlineCount:number; channelId:string|null; channelName:string|null; createdAt:string; }
interface AdminStats { totalUsers:number; totalComments:number; totalServers:number; totalRateLimits:number; }
interface ServiceStatusData { id:string; name:string; description:string|null; status:string; uptime:number; }
interface SkillData { id:string; name:string; level:number; icon:string|null; category:string|null; sortOrder:number; }
interface IdeaData { id:string; title:string; content:string; votes:number; createdAt:string; }

// ==================== Hooks ====================
function useGithubData() {
  const [profile, setProfile] = useState<GithubProfile|null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/github').then(r=>r.json()).then(d=>{setProfile(d.profile);setRepos(d.repos);}).catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  return {profile,repos,loading};
}

function useVisitorCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    generateFingerprint().then(fp => {
      fetch(`/api/visitors?fp=${encodeURIComponent(fp)}`).then(r=>r.json()).then(d=>setCount(d.count||0)).catch(()=>{});
    });
  },[]);
  return count;
}

function useParallax() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const handler = () => setOffset(window.scrollY * 0.3);
    window.addEventListener('scroll', handler, {passive:true});
    return () => window.removeEventListener('scroll', handler);
  },[]);
  return offset;
}

function useTyping(text: string, speed = 50, startDelay = 500) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) { setDisplayed(text.slice(0, i+1)); i++; }
        else { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return {displayed, done};
}

// ==================== Discord Icon ====================
const DiscordIcon = ({className}: {className?:string}) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/>
  </svg>
);

// ==================== Main App ====================
function AppContent() {
  return <SessionProvider><MainApp /></SessionProvider>;
}

function MainApp() {
  const [view, setView] = useState<'profile'|'servers'|'admin'|'status'|'projects'|'ideas'>('profile');
  const {data:session,status} = useSession();
  const isAdmin = status==='authenticated' && session?.user?.id===ADMIN_DISCORD_ID;
  const visitorCount = useVisitorCount();
  const [musicOn, setMusicOn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('music') === 'true';
    }
    return false;
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) { audioRef.current.volume = 0.15; audioRef.current.play().catch(()=>{}); }
    else if (!musicOn && audioRef.current) { audioRef.current.pause(); }
  },[musicOn]);

  const toggleMusic = () => {
    setMusicOn(!musicOn);
    localStorage.setItem('music', String(!musicOn));
  };

  const navItems = [
    {id:'profile',label:'الرئيسية',icon:<Terminal className="w-4 h-4"/>},
    {id:'projects',label:'المشاريع',icon:<Code2 className="w-4 h-4"/>},
    {id:'status',label:'الخدمات',icon:<Activity className="w-4 h-4"/>},
    {id:'ideas',label:'الأفكار',icon:<Lightbulb className="w-4 h-4"/>},
    ...(isAdmin ? [
      {id:'servers' as const,label:'سيرفرات',icon:<Server className="w-4 h-4"/>},
      {id:'admin' as const,label:'الإدارة',icon:<Settings className="w-4 h-4"/>},
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <MatrixRain />
      <div className="fixed inset-0 -z-[9] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(255,255,255,0.05)_0%,_transparent_60%)] blur-3xl animate-pulse" />
      </div>

      <audio ref={audioRef} src="https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3" loop preload="none" />

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view!=='profile'&&<Button variant="ghost" size="sm" onClick={()=>setView('profile')} className="text-white/50 hover:text-white hover:bg-white/5"><ArrowLeft className="w-4 h-4 mr-1"/></Button>}
            <Terminal className="w-4 h-4 text-white/60" />
            <span className="font-mono text-sm text-white/60">6p99</span>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-white/30"><Eye className="w-3 h-3"/>{visitorCount.toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {navItems.map(n=>(
              <Button key={n.id} variant="ghost" size="sm" onClick={()=>setView(n.id as any)}
                className={`text-white/50 hover:text-white hover:bg-white/5 text-xs ${view===n.id?'text-white bg-white/10':''}`}>
                {n.icon}<span className="hidden md:inline mr-1">{n.label}</span>
              </Button>
            ))}
            <div className="w-px h-5 bg-white/10 mx-1"/>
            <Button variant="ghost" size="sm" onClick={toggleMusic} className="text-white/40 hover:text-white hover:bg-white/5">
              {musicOn ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}
            </Button>
            {status==='authenticated'&&session?.user ? (
              <div className="flex items-center gap-1.5">
                <Avatar className="w-7 h-7 border border-white/20"><AvatarImage src={session.user.image||undefined}/><AvatarFallback className="bg-white/10 text-white text-xs"><User className="w-3 h-3"/></AvatarFallback></Avatar>
                <Button variant="ghost" size="sm" onClick={()=>window.location.href='/api/auth/signout?callbackUrl=/'} className="text-white/40 hover:text-white hover:bg-white/5"><LogOut className="w-4 h-4"/></Button>
              </div>
            ) : (
              <Button onClick={()=>window.location.href=`/api/auth/signin/discord?callbackUrl=${encodeURIComponent('/')}`} size="sm" className="bg-white text-black hover:bg-white/90 font-medium text-xs">
                <DiscordIcon className="w-3.5 h-3.5 mr-1.5"/><span className="hidden sm:inline">دخول</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {view==='profile'&&<ProfileView/>}
        {view==='projects'&&<ProjectsView/>}
        {view==='status'&&<StatusView/>}
        {view==='ideas'&&<IdeasView/>}
        {view==='servers'&&isAdmin&&<ServersView/>}
        {view==='admin'&&isAdmin&&<AdminView/>}
      </main>

      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-md mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/25 text-sm"><Terminal className="w-3.5 h-3.5"/>© {new Date().getFullYear()} MJHOL</div>
          <div className="sm:hidden flex items-center gap-1 text-[11px] text-white/25"><Eye className="w-3 h-3"/>{visitorCount.toLocaleString()}</div>
        </div>
      </footer>
    </div>
  );
}

// ==================== Matrix Rain ====================
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?ｱｲｳｴｵｶｷｸｹｺ';
    const fontSize = 14;
    const cols = Math.floor(canvas.width/fontSize);
    const drops = Array(cols).fill(1);
    const draw = () => {
      ctx.fillStyle='rgba(0,0,0,0.05)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='rgba(255,255,255,0.04)';
      ctx.font=fontSize+'px monospace';
      for (let i=0;i<drops.length;i++) {
        const t = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillText(t,i*fontSize,drops[i]*fontSize);
        if (drops[i]*fontSize>canvas.height&&Math.random()>0.975) drops[i]=0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw,50);
    return () => { clearInterval(interval); window.removeEventListener('resize',resize); };
  },[]);
  return <canvas ref={canvasRef} className="fixed inset-0 -z-[8] pointer-events-none hidden sm:block" />;
}

// ==================== Profile View ====================
function ProfileView() {
  const {data:session,status}=useSession();
  const {profile,repos,loading}=useGithubData();
  const parallaxOffset = useParallax();
  const nameTyped = useTyping(profile?.name||'MJHOL', 80, 800);
  const bioTyped = useTyping(profile?.bio||'I am curious about everything; I try to understand and program everything—the possible and the impossible.', 25, 2200);
  const [comments,setComments]=useState<Comment[]>([]);
  const [newComment,setNewComment]=useState('');
  const [sending,setSending]=useState(false);
  const [error,setError]=useState('');
  const [cooldownInfo,setCooldownInfo]=useState<{active:boolean;remaining:string}|null>(null);
  const [reposExpanded,setReposExpanded]=useState(false);
  const [skills,setSkills]=useState<SkillData[]>([]);
  const [skillVisible,setSkillVisible]=useState(false);
  const skillRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(()=>{
    fetch('/api/comments').then(r=>r.json()).then(d=>setComments(d.comments||[])).catch(()=>{});
  },[]);
  useEffect(()=>{fetchComments();const i=setInterval(fetchComments,30000);return ()=>clearInterval(i);},[fetchComments]);

  useEffect(()=>{
    fetch('/api/skills').then(r=>r.json()).then(d=>setSkills(d.skills||[])).catch(()=>{});
  },[]);

  useEffect(()=>{
    const obs = new IntersectionObserver(([e])=>{if(e.isIntersecting)setSkillVisible(true);},{threshold:0.2});
    if(skillRef.current) obs.observe(skillRef.current);
    return ()=>obs.disconnect();
  },[]);

  const handleSubmitComment = async()=>{
    if(!newComment.trim())return;
    setSending(true);setError('');
    try{
      const res=await fetch('/api/comments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:newComment})});
      const data=await res.json();
      if(!res.ok){
        if(res.status===401)setError('يجب تسجيل الدخول عبر ديسكورد أولاً');
        else if(res.status===429){if(data.cooldownRemaining){const h=Math.floor(data.cooldownRemaining/3600000);const m=Math.floor((data.cooldownRemaining%3600000)/60000);setCooldownInfo({active:true,remaining:`${h}س ${m}د`});}setError(data.error||'تقييد الطلبات');}
        else setError(data.error||'حدث خطأ');return;
      }
      setNewComment('');setError('');setCooldownInfo(null);fetchComments();
    }catch{setError('فشل إرسال التعليق');}finally{setSending(false);}
  };

  const timeAgo=(d:string)=>{const diff=Date.now()-new Date(d).getTime();const m=Math.floor(diff/60000);const h=Math.floor(diff/3600000);const days=Math.floor(diff/86400000);if(m<1)return'الآن';if(m<60)return`${m}د`;if(h<24)return`${h}س`;return`${days}ي`;};
  const displayRepos = reposExpanded?repos:repos.slice(0,6);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Hero with Parallax */}
      <section className="flex flex-col items-center text-center mb-20" style={{transform:`translateY(${parallaxOffset}px)`}}>
        <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{duration:0.6}} className="relative mb-8">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl shadow-white/5">
            {loading?<Skeleton className="w-full h-full bg-white/10"/>:<img src={profile?.avatarUrl||'/placeholder.png'} alt="" className="w-full h-full object-cover"/>}
          </div>
          <motion.div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-black" initial={{scale:0}} animate={{scale:1}} transition={{delay:0.5,type:'spring'}}/>
        </motion.div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-3 h-16 sm:h-20">
          {nameTyped.displayed}<span className="animate-pulse text-white/60">{nameTyped.done?'':'│'}</span>
        </h1>
        <p className="text-base sm:text-lg text-white/50 font-mono mb-2">@6p99</p>
        <p className="text-white/40 max-w-xl mb-8 text-sm sm:text-base leading-relaxed h-12">
          {nameTyped.done ? (bioTyped.displayed + (bioTyped.done?'':'<span className="animate-pulse text-white/40">│</span>')) : ''}
        </p>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5}} className="flex items-center gap-6 sm:gap-8 mb-8">
          <StatBadge icon={<BookOpen className="w-4 h-4"/>} value={profile?.publicRepos||10} label="مستودعات"/>
          <StatBadge icon={<Star className="w-4 h-4"/>} value={profile?.followers||0} label="متابعين"/>
          <StatBadge icon={<Github className="w-4 h-4"/>} value={profile?.following||4} label="يتابع"/>
        </motion.div>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.6}}>
          <a href="https://github.com/6p99" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all"><Github className="w-5 h-5"/>GitHub</a>
        </motion.div>
      </section>

      {/* Repos */}
      <section className="mb-20">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <div className="flex items-center justify-between mb-8">
            <div><h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3"><Code2 className="w-7 h-7 text-white/40"/>المستودعات</h2><p className="text-white/40 text-sm mt-1">أحدث المشاريع والمستودعات</p></div>
            {repos.length>6&&<Button variant="ghost" size="sm" onClick={()=>setReposExpanded(!reposExpanded)} className="text-white/60 hover:text-white hover:bg-white/5">{reposExpanded?<><ChevronUp className="w-4 h-4 mr-1"/>عرض أقل</>:<><ChevronDown className="w-4 h-4 mr-1"/>عرض الكل ({repos.length})</>}</Button>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading?Array.from({length:6}).map((_,i)=><Card key={i} className="bg-white/[0.03] border-white/10"><CardContent className="p-5"><Skeleton className="h-5 w-32 bg-white/10 mb-3"/><Skeleton className="h-4 w-full bg-white/10"/></CardContent></Card>)
            :displayRepos.map((r,i)=><motion.div key={r.name} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.05}}>
              <Card className="bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all group h-full"><CardContent className="p-5">
                <div className="flex items-start justify-between mb-3"><div className="flex items-center gap-2 min-w-0"><BookOpen className="w-4 h-4 text-white/30 flex-shrink-0"/><h3 className="font-semibold text-sm truncate">{r.name}</h3></div><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/80 flex-shrink-0 ml-2"><ExternalLink className="w-3.5 h-3.5"/></a></div>
                {r.description&&<p className="text-xs text-white/40 mb-3 line-clamp-2">{r.description}</p>}
                <div className="flex items-center gap-3">{r.language&&<div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:r.color||'#888'}}/><span className="text-xs text-white/50">{r.language}</span></div>}{r.stars>0&&<div className="flex items-center gap-1 text-white/40"><Star className="w-3 h-3"/><span className="text-xs">{r.stars}</span></div>}{r.forks>0&&<div className="flex items-center gap-1 text-white/40"><GitFork className="w-3 h-3"/><span className="text-xs">{r.forks}</span></div>}</div>
              </CardContent></Card>
            </motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* Skills */}
      <section className="mb-20" ref={skillRef}>
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <div className="mb-8"><h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3"><Zap className="w-7 h-7 text-white/40"/>المهارات</h2><p className="text-white/40 text-sm mt-1">اللغات والأدوات المستخدمة</p></div>
          {['Languages','Frameworks','Tools'].map(cat=>{
            const catSkills = skills.filter(s=>s.category===cat);
            if(!catSkills.length)return null;
            const catLabel = cat==='Languages'?'اللغات':cat==='Frameworks'?'الأطر':'الأدوات';
            return (
              <div key={cat} className="mb-8">
                <h3 className="text-sm font-semibold text-white/50 mb-4 flex items-center gap-2"><Layers className="w-4 h-4"/>{catLabel}</h3>
                <div className="space-y-3">
                  {catSkills.map((s,i)=><motion.div key={s.id} initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.08}}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg w-7 text-center">{s.icon||'•'}</span>
                      <span className="text-sm text-white/70 w-28">{s.name}</span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden"><motion.div className="h-full bg-white/30 rounded-full" initial={{width:0}} animate={skillVisible?{width:`${s.level}%`}:{width:0}} transition={{duration:1,ease:'easeOut',delay:i*0.1}}/></div>
                      <span className="text-xs text-white/40 w-8 text-right">{s.level}%</span>
                    </div>
                  </motion.div>)}
                </div>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* Comments */}
      <section className="mb-20">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <div className="flex items-center justify-between mb-8"><div><h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3"><MessageSquare className="w-7 h-7 text-white/40"/>التعليقات</h2><p className="text-white/40 text-sm mt-1">شاركنا رأيك • يمكنك التعليق كل 6 ساعات</p></div><Badge variant="secondary" className="bg-white/10 text-white/60 border-white/10">{comments.length} تعليق</Badge></div>
          <Card className="bg-white/[0.03] border-white/10 mb-6"><CardContent className="p-5">
            {status==='authenticated'?(
              <div className="space-y-3">
                <div className="flex items-center gap-2"><Avatar className="w-6 h-6 border border-white/20"><AvatarImage src={session?.user?.image||undefined}/><AvatarFallback className="bg-white/10 text-white text-[10px]"><User className="w-3 h-3"/></AvatarFallback></Avatar><span className="text-xs text-white/50">معلّق كـ {session?.user?.name||'User'}</span></div>
                <Textarea value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="اكتب تعليقك هنا..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none min-h-[80px]" maxLength={500}/>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2">{cooldownInfo?.active&&<div className="flex items-center gap-1 text-xs text-yellow-500/80"><Clock className="w-3 h-3"/>يمكنك التعليق بعد {cooldownInfo.remaining}</div>}<span className="text-xs text-white/30">{newComment.length}/500</span></div><Button onClick={handleSubmitComment} disabled={sending||!newComment.trim()} size="sm" className="bg-white text-black hover:bg-white/90 font-medium">{sending?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4 mr-2"/>}إرسال</Button></div>
                {error&&<div className="flex items-center gap-2 text-xs text-red-400"><AlertCircle className="w-3 h-3"/><span>{error}</span></div>}
              </div>
            ):(
              <div className="text-center py-6"><p className="text-white/40 text-sm mb-4">سجّل دخولك عبر ديسكورد لتتمكن من التعليق</p><Button onClick={()=>window.location.href=`/api/auth/signin/discord?callbackUrl=${encodeURIComponent('/')}`} className="bg-white text-black hover:bg-white/90 font-medium"><DiscordIcon className="w-4 h-4 mr-2"/>تسجيل الدخول عبر ديسكورد</Button></div>
            )}
          </CardContent></Card>
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {comments.length===0?<motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-12"><MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-3"/><p className="text-white/30 text-sm">لا توجد تعليقات بعد</p></motion.div>
              :comments.map((c,i)=><motion.div key={c.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{delay:i*0.03}}>
                <Card className="bg-white/[0.02] border-white/[0.06]"><CardContent className="p-4"><div className="flex items-start gap-3"><Avatar className="w-8 h-8 border border-white/10 flex-shrink-0"><AvatarImage src={c.avatar||undefined}/><AvatarFallback className="bg-white/10 text-white text-xs">{c.username[0].toUpperCase()}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><span className="text-sm font-medium text-white/80">{c.username}{c.discriminator&&c.discriminator!=='0'&&<span className="text-white/30">#{c.discriminator}</span>}</span><span className="text-[11px] text-white/25">{timeAgo(c.createdAt)}</span></div><p className="text-sm text-white/60 leading-relaxed break-words">{c.content}</p></div></div></CardContent></Card>
              </motion.div>)}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

// ==================== Projects View ====================
function ProjectsView() {
  const {repos,loading} = useGithubData();
  const [expanded,setExpanded] = useState<string|null>(null);
  const [filterLang, setFilterLang] = useState<string|null>(null);

  const languages = Array.from(new Set(repos.map(r=>r.language).filter(Boolean) as string[]));
  const filtered = filterLang ? repos.filter(r=>r.language===filterLang) : repos;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3 mb-4"><Code2 className="w-8 h-8 text-white/40"/>المشاريع</h1>
        <p className="text-white/40 text-sm mb-8">كل المستودعات من GitHub بالتفصيل</p>
        <div className="flex flex-wrap gap-2 mb-8">
          <Button variant="ghost" size="sm" onClick={()=>setFilterLang(null)} className={`text-xs ${!filterLang?'bg-white/10 text-white':'text-white/40'}`}>الكل</Button>
          {languages.map(l=><Button key={l} variant="ghost" size="sm" onClick={()=>setFilterLang(l)} className={`text-xs ${filterLang===l?'bg-white/10 text-white':'text-white/40'}`}>{l}</Button>)}
        </div>
        {loading?<div className="space-y-4">{Array.from({length:5}).map((_,i)=><Card key={i} className="bg-white/[0.03] border-white/10"><CardContent className="p-5"><Skeleton className="h-6 w-40 bg-white/10 mb-3"/><Skeleton className="h-4 w-full bg-white/10 mb-2"/><Skeleton className="h-4 w-2/3 bg-white/10"/></CardContent></Card>)}</div>
        :filtered.length===0?<p className="text-white/30 text-center py-20">لا توجد مشاريع</p>
        :<div className="space-y-4">{filtered.map((r,i)=><motion.div key={r.name} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
          <Card className="bg-white/[0.03] border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer" onClick={()=>setExpanded(expanded===r.name?null:r.name)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-white/30"/></div>
                  <div><h3 className="font-semibold text-sm">{r.name}</h3><div className="flex items-center gap-3 mt-1">{r.language&&<div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:r.color||'#888'}}/><span className="text-xs text-white/50">{r.language}</span></div>}{r.stars>0&&<span className="text-xs text-white/40">★ {r.stars}</span>}{r.forks>0&&<span className="text-xs text-white/40">⑂ {r.forks}</span>}</div></div>
                </div>
                <div className="flex items-center gap-2"><a href={r.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="text-white/30 hover:text-white/80"><ExternalLink className="w-4 h-4"/></a><ChevronRight className={`w-4 h-4 text-white/30 transition-transform ${expanded===r.name?'rotate-90':''}`}/></div>
              </div>
              <AnimatePresence>{expanded===r.name&&<motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden"><div className="pt-4 mt-4 border-t border-white/5"><p className="text-sm text-white/50 mb-3">{r.description||'لا يوجد وصف'}</p><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1"><Github className="w-3 h-3"/>github.com/6p99/{r.name}</a></div></motion.div>}</AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>)}</div>}
      </motion.div>
    </div>
  );
}

// ==================== Status View ====================
function StatusView() {
  const [services,setServices] = useState<ServiceStatusData[]>([]);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{fetch('/api/services').then(r=>r.json()).then(d=>setServices(d.services||[])).catch(()=>{}).finally(()=>setLoading(false));},[]);

  const allUp = services.length>0 && services.every(s=>s.status==='operational');
  const statusLabel:{[key:string]:{label:string;icon:React.ReactNode;color:string}} = {
    operational:{label:'يعمل',icon:<CheckCircle2 className="w-4 h-4"/>,color:'text-green-400 bg-green-400/10 border-green-400/20'},
    degraded:{label:'مشاكل',icon:<AlertTriangle className="w-4 h-4"/>,color:'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'},
    down:{label:'متوقف',icon:<XCircle className="w-4 h-4"/>,color:'text-red-400 bg-red-400/10 border-red-400/20'},
    maintenance:{label:'صيانة',icon:<Wrench className="w-4 h-4"/>,color:'text-blue-400 bg-blue-400/10 border-blue-400/20'},
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3 mb-4"><Activity className="w-8 h-8 text-white/40"/>حالة الخدمات</h1>
        <p className="text-white/40 text-sm mb-8">حالة جميع خدمات الموقع</p>
        {loading?<div className="space-y-3">{Array.from({length:3}).map((_,i)=><Card key={i} className="bg-white/[0.03] border-white/10"><CardContent className="p-5"><Skeleton className="h-12 bg-white/10"/></CardContent></Card>)}</div>
        :<>
          <Card className={`mb-8 border ${allUp?'border-green-400/20 bg-green-400/5':'border-yellow-400/20 bg-yellow-400/5'}`}>
            <CardContent className="p-6 text-center"><div className={`text-4xl mb-2 ${allUp?'text-green-400':'text-yellow-400'}`}>{allUp?'✓':'!'}</div><h2 className={`text-lg font-bold ${allUp?'text-green-400':'text-yellow-400'}`}>{allUp?'جميع الخدمات تعمل بشكل طبيعي':'هناك مشاكل في بعض الخدمات'}</h2></CardContent>
          </Card>
          <div className="space-y-3">{services.map((s,i)=>{
            const st = statusLabel[s.status]||statusLabel.operational;
            return <motion.div key={s.id} initial={{opacity:0,x:-15}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}}>
              <Card className="bg-white/[0.03] border-white/10"><CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${st.color}`}>{st.icon}</div><div><h3 className="text-sm font-medium">{s.name}</h3>{s.description&&<p className="text-[11px] text-white/30">{s.description}</p>}</div></div>
                <div className="text-right"><Badge className={`${st.color} text-[11px] border`}>{st.label}</Badge><div className="text-[10px] text-white/20 mt-1">{s.uptime}% uptime</div></div>
              </CardContent></Card>
            </motion.div>;
          })}</div>
        </>}
      </motion.div>
    </div>
  );
}

// ==================== Ideas View ====================
function IdeasView() {
  const [ideas,setIdeas] = useState<IdeaData[]>([]);
  const [title,setTitle] = useState('');
  const [content,setContent] = useState('');
  const [sending,setSending] = useState(false);
  const [msg,setMsg] = useState('');
  const [loading,setLoading] = useState(true);

  const fetchIdeas = useCallback(()=>{
    fetch('/api/ideas').then(r=>r.json()).then(d=>setIdeas(d.ideas||[])).catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  useEffect(()=>{fetchIdeas();},[fetchIdeas]);

  const handleSubmit = async()=>{
    if(!title.trim()||!content.trim())return;
    setSending(true);setMsg('');
    try{
      const fp = await generateFingerprint();
      const res=await fetch('/api/ideas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,content,fingerprint:fp})});
      const d=await res.json();
      if(!res.ok){
        if(res.status===429 && d.retryAfter){
          setMsg(`${d.error || 'يمكنك إرسال فكرة كل 6 ساعات'} • حاول بعد ${d.retryAfter}`);
        } else {
          setMsg(d.error||'حدث خطأ');
        }
        return;
      }
      setTitle('');setContent('');setMsg('تم إرسال الفكرة بنجاح! بانتظار الموافقة.');fetchIdeas();
    }catch{setMsg('فشل الإرسال');}finally{setSending(false);}
  };

  const handleVote = async(id:string)=>{
    try{await fetch('/api/ideas',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({ideaId:id,type:'upvote'})});fetchIdeas();}catch{};
  };

  const timeAgo=(d:string)=>{const diff=Date.now()-new Date(d).getTime();const m=Math.floor(diff/60000);const h=Math.floor(diff/3600000);const days=Math.floor(diff/86400000);if(m<1)return'الآن';if(m<60)return`${m}د`;if(h<24)return`${h}س`;return`${days}ي`;};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3 mb-4"><Lightbulb className="w-8 h-8 text-white/40"/>لوحة الأفكار</h1>
        <p className="text-white/40 text-sm mb-8">اقترح أفكاراً للموقع • الأفكار الأعلى تصويتاً تُنفّذ أولاً</p>
        <Card className="bg-white/[0.03] border-white/10 mb-8"><CardContent className="p-5 space-y-3">
          <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="عنوان الفكرة" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" maxLength={100}/>
          <Textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="وصف الفكرة بالتفصيل..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none min-h-[80px]" maxLength={1000}/>
          <div className="flex items-center justify-between"><span className="text-xs text-white/30">{title.length}/100</span><Button onClick={handleSubmit} disabled={sending||!title.trim()||!content.trim()} size="sm" className="bg-white text-black hover:bg-white/90 font-medium">{sending?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4 mr-2"/>}إرسال فكرة</Button></div>
          {msg&&<div className={`flex items-center gap-2 text-xs ${msg.includes('نجاح')?'text-green-400':'text-red-400'}`}><AlertCircle className="w-3 h-3"/><span>{msg}</span></div>}
        </CardContent></Card>
        {loading?<div className="space-y-3">{Array.from({length:3}).map((_,i)=><Card key={i} className="bg-white/[0.03] border-white/10"><CardContent className="p-5"><Skeleton className="h-16 bg-white/10"/></CardContent></Card>)}</div>
        :ideas.length===0?<div className="text-center py-16"><Lightbulb className="w-12 h-12 text-white/10 mx-auto mb-3"/><p className="text-white/30">لا توجد أفكار بعد. كن أول من يقترح!</p></div>
        :<div className="space-y-3">{ideas.map((idea,i)=><motion.div key={idea.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
          <Card className="bg-white/[0.03] border-white/10 hover:bg-white/[0.05] transition-colors"><CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Button variant="ghost" size="sm" onClick={()=>handleVote(idea.id)} className="flex flex-col items-center gap-0.5 text-white/40 hover:text-white bg-white/5 px-3 min-w-[48px]"><ThumbsUp className="w-4 h-4"/><span className="text-xs font-bold">{idea.votes}</span></Button>
              <div className="flex-1 min-w-0"><h3 className="text-sm font-semibold text-white/80 mb-1">{idea.title}</h3><p className="text-xs text-white/50 leading-relaxed line-clamp-3">{idea.content}</p><span className="text-[10px] text-white/25 mt-2">{timeAgo(idea.createdAt)}</span></div>
            </div>
          </CardContent></Card>
        </motion.div>)}</div>}
      </motion.div>
    </div>
  );
}

// ==================== Servers View (unchanged) ====================
function ServersView() {
  const [servers,setServers]=useState<DiscordServerData[]>([]);
  const [inviteUrl,setInviteUrl]=useState('');
  const [adding,setAdding]=useState(false);
  const [addError,setAddError]=useState('');
  const [loading,setLoading]=useState(true);
  const fetchServers=useCallback(()=>{fetch('/api/servers').then(r=>r.json()).then(d=>setServers(d.servers||[])).catch(()=>{}).finally(()=>setLoading(false));},[]);
  useEffect(()=>{fetchServers();},[fetchServers]);
  const handleAdd=async()=>{if(!inviteUrl.trim())return;setAdding(true);setAddError('');try{const res=await fetch('/api/servers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({inviteUrl:inviteUrl.trim()})});const d=await res.json();if(!res.ok){setAddError(d.error||'فشل');return;}setInviteUrl('');fetchServers();}catch{setAddError('فشل');}finally{setAdding(false);}};
  const handleDelete=async(id:string)=>{await fetch('/api/servers',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({serverId:id})});fetchServers();};
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <div className="flex items-center justify-between mb-10"><div><h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3"><Server className="w-8 h-8 text-white/40"/>سيرفرات ديسكورد</h1><p className="text-white/40 text-sm mt-2">إدارة السيرفرات</p></div><Badge variant="secondary" className="bg-white/10 text-white/60 border-white/10">{servers.length} سيرفر</Badge></div>
        <Card className="bg-white/[0.03] border-white/10 mb-8"><CardContent className="p-5"><div className="flex flex-col sm:flex-row gap-3"><div className="flex-1 relative"><Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"/><Input value={inviteUrl} onChange={e=>setInviteUrl(e.target.value)} placeholder="discord.gg/..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-9" onKeyDown={e=>e.key==='Enter'&&handleAdd()}/></div><Button onClick={handleAdd} disabled={adding||!inviteUrl.trim()} size="default" className="bg-white text-black hover:bg-white/90 font-medium w-full sm:w-auto">{adding?<Loader2 className="w-4 h-4 animate-spin"/>:<Plus className="w-4 h-4 mr-2"/>}إضافة</Button></div>{addError&&<div className="flex items-center gap-2 text-xs text-red-400 mt-2"><AlertCircle className="w-3 h-3"/><span>{addError}</span></div>}</CardContent></Card>
        {loading?<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:3}).map((_,i)=><Card key={i} className="bg-white/[0.03] border-white/10"><CardContent className="p-5"><Skeleton className="h-20 w-20 mx-auto rounded-xl bg-white/10 mb-4"/></CardContent></Card>)}</div>
        :servers.length===0?<div className="text-center py-20"><Server className="w-16 h-16 text-white/10 mx-auto mb-4"/><p className="text-white/30">لا توجد سيرفرات بعد</p></div>
        :<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><AnimatePresence>{servers.map((s,i)=><motion.div key={s.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{delay:i*0.05}} layout><Card className="bg-white/[0.03] border-white/10 hover:bg-white/[0.06] transition-all overflow-hidden group relative">{s.banner&&<div className="w-full h-24 relative overflow-hidden"><img src={`https://cdn.discordapp.com/banners/${s.serverId}/${s.banner}.png`} alt="" className="w-full h-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"/></div>}<CardContent className="p-5 relative"><Button variant="ghost" size="sm" onClick={()=>handleDelete(s.id)} className="absolute top-3 right-3 text-white/20 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 w-8 h-8 p-0"><Trash2 className="w-3.5 h-3.5"/></Button><div className="flex flex-col items-center text-center"><div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 mb-3 bg-white/5 -mt-6 relative z-10 shadow-lg">{s.icon?<img src={`https://cdn.discordapp.com/icons/${s.serverId}/${s.icon}.png`} alt="" className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center"><Server className="w-8 h-8 text-white/30"/></div>}</div><h3 className="font-bold text-sm text-white/90 mb-2">{s.name}</h3>{s.description&&<p className="text-[11px] text-white/40 mb-3 line-clamp-2">{s.description}</p>}<div className="w-full grid grid-cols-2 gap-2"><div className="flex items-center gap-1.5 justify-center p-2 rounded-lg bg-white/[0.03]"><Users className="w-3.5 h-3.5 text-white/40"/><span className="text-xs text-white/60">{s.memberCount.toLocaleString()}</span></div><div className="flex items-center gap-1.5 justify-center p-2 rounded-lg bg-white/[0.03]"><UserCheck className="w-3.5 h-3.5 text-green-400/60"/><span className="text-xs text-white/60">{s.onlineCount.toLocaleString()}</span></div></div>{s.channelName&&<div className="flex items-center gap-1.5 mt-2 text-white/30"><Hash className="w-3 h-3"/><span className="text-[11px]">#{s.channelName}</span></div>}</div></CardContent></Card></motion.div>)}</AnimatePresence></div>}
      </motion.div>
    </div>
  );
}

// ==================== Admin View (unchanged) ====================
function AdminView() {
  const [stats,setStats]=useState<AdminStats|null>(null);
  const [users,setUsers]=useState<any[]>([]);
  const [comments,setComments]=useState<any[]>([]);
  const [servers,setServers]=useState<DiscordServerData[]>([]);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState('overview');
  const fetchData=useCallback(()=>{setLoading(true);fetch('/api/admin').then(r=>r.json()).then(d=>{setStats(d.stats);setUsers(d.users||[]);setComments(d.comments||[]);setServers(d.servers||[]);}).catch(()=>{}).finally(()=>setLoading(false));},[]);
  useEffect(()=>{fetchData();},[fetchData]);
  const handleDelete=async(type:string,id:string)=>{await fetch('/api/admin',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,id})});fetchData();};
  const timeAgo=(d:string)=>{const diff=Date.now()-new Date(d).getTime();const m=Math.floor(diff/60000);const h=Math.floor(diff/3600000);if(m<60)return`${m}د`;if(h<24)return`${h}س`;return`${Math.floor(diff/86400000)}ي`;};
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <div className="flex items-center justify-between mb-10"><div><h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3"><Settings className="w-8 h-8 text-white/40"/>لوحة الإدارة</h1><p className="text-white/40 text-sm mt-2">إدارة كاملة</p></div><Button variant="ghost" size="sm" onClick={fetchData} className="text-white/50 hover:text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></Button></div>
        {loading?<div className="space-y-4">{Array.from({length:4}).map((_,i)=><Card key={i} className="bg-white/[0.03] border-white/10"><CardContent className="p-5"><Skeleton className="h-20 bg-white/10"/></CardContent></Card>)}</div>
        :<><div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">{[{icon:<Users className="w-5 h-5"/>,label:'المستخدمين',value:stats?.totalUsers||0},{icon:<MessageSquare className="w-5 h-5"/>,label:'التعليقات',value:stats?.totalComments||0},{icon:<Server className="w-5 h-5"/>,label:'السيرفرات',value:stats?.totalServers||0},{icon:<BarChart3 className="w-5 h-5"/>,label:'تقييدات',value:stats?.totalRateLimits||0}].map((s,i)=><motion.div key={i} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}><Card className="bg-white/[0.03] border-white/10"><CardContent className="p-5 text-center"><div className="text-white/40 mb-2 flex justify-center">{s.icon}</div><div className="text-2xl font-bold text-white/90 mb-1">{s.value.toLocaleString()}</div><div className="text-xs text-white/40">{s.label}</div></CardContent></Card></motion.div>)}</div>
        <Tabs value={tab} onValueChange={setTab}><TabsList className="bg-white/5 border border-white/10 mb-6">{['overview','users','comments','servers'].map(t=><TabsTrigger key={t} value={t} className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 text-xs">{{overview:'نظرة عامة',users:'المستخدمين',comments:'التعليقات',servers:'السيرفرات'}[t]}</TabsTrigger>)}</TabsList>
          <TabsContent value="overview"><div className="space-y-4"><Card className="bg-white/[0.03] border-white/10"><CardHeader className="pb-2"><h3 className="text-sm font-semibold text-white/70">آخر المستخدمين</h3></CardHeader><CardContent>{users.slice(0,5).map(u=><div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] mb-1"><div className="flex items-center gap-2"><Avatar className="w-7 h-7"><AvatarImage src={u.avatar?`https://cdn.discordapp.com/avatars/${u.discordId}/${u.avatar}.png`:undefined}/><AvatarFallback className="bg-white/10 text-white text-[10px]"><User className="w-3 h-3"/></AvatarFallback></Avatar><div><span className="text-sm text-white/80">{u.username}</span><span className="text-[10px] text-white/30 ml-1">{timeAgo(u.createdAt)}</span></div></div><span className="text-[10px] text-white/30">{u._count?.comments||0} تعليق</span></div>)}</CardContent></Card><Card className="bg-white/[0.03] border-white/10"><CardHeader className="pb-2"><h3 className="text-sm font-semibold text-white/70">آخر التعليقات</h3></CardHeader><CardContent>{comments.slice(0,5).map(c=><div key={c.id} className="flex items-start justify-between gap-3 p-2 rounded-lg bg-white/[0.02] mb-1"><div className="min-w-0 flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-xs font-medium text-white/70">{c.user?.username}</span><span className="text-[10px] text-white/30">{timeAgo(c.createdAt)}</span></div><p className="text-xs text-white/50 truncate">{c.content}</p></div><Button variant="ghost" size="sm" onClick={()=>handleDelete('comment',c.id)} className="text-white/20 hover:text-red-400 hover:bg-red-400/10 w-7 h-7 p-0"><Trash2 className="w-3 h-3"/></Button></div>)}</CardContent></Card></div></TabsContent>
          <TabsContent value="users"><div className="space-y-2">{users.map(u=><Card key={u.id} className="bg-white/[0.03] border-white/10"><CardContent className="p-4 flex items-center justify-between"><div className="flex items-center gap-3"><Avatar className="w-8 h-8"><AvatarImage src={u.avatar?`https://cdn.discordapp.com/avatars/${u.discordId}/${u.avatar}.png`:undefined}/><AvatarFallback className="bg-white/10 text-white text-xs"><User className="w-3 h-3"/></AvatarFallback></Avatar><div><div className="text-sm text-white/80">{u.username}</div><div className="text-[10px] text-white/30">ID: {u.discordId}</div></div></div><div className="flex items-center gap-2"><Badge variant="secondary" className="bg-white/5 text-white/40 border-white/10">{u._count?.comments||0}</Badge><Button variant="ghost" size="sm" onClick={()=>handleDelete('user',u.id)} className="text-white/20 hover:text-red-400 hover:bg-red-400/10 w-8 h-8 p-0"><Trash2 className="w-3.5 h-3.5"/></Button></div></CardContent></Card>)}</div></TabsContent>
          <TabsContent value="comments"><div className="space-y-2">{comments.map(c=><Card key={c.id} className="bg-white/[0.03] border-white/10"><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-xs font-medium text-white/70">{c.user?.username}</span><span className="text-[10px] text-white/30">{timeAgo(c.createdAt)}</span></div><p className="text-sm text-white/50">{c.content}</p></div><Button variant="ghost" size="sm" onClick={()=>handleDelete('comment',c.id)} className="text-white/20 hover:text-red-400 hover:bg-red-400/10 w-8 h-8 p-0"><Trash2 className="w-3.5 h-3.5"/></Button></div></CardContent></Card>)}</div></TabsContent>
          <TabsContent value="servers"><div className="space-y-2">{servers.map(s=><Card key={s.id} className="bg-white/[0.03] border-white/10"><CardContent className="p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">{s.icon?<img src={`https://cdn.discordapp.com/icons/${s.serverId}/${s.icon}.png`} alt="" className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center"><Server className="w-5 h-5 text-white/30"/></div>}</div><div><div className="text-sm text-white/80">{s.name}</div><div className="text-[10px] text-white/30">{s.memberCount.toLocaleString()} عضو • {s.onlineCount.toLocaleString()} أونلاين</div></div></div><Button variant="ghost" size="sm" onClick={()=>handleDelete('server',s.id)} className="text-white/20 hover:text-red-400 hover:bg-red-400/10 w-8 h-8 p-0"><Trash2 className="w-3.5 h-3.5"/></Button></CardContent></Card>)}</div></TabsContent>
        </Tabs></>}
      </motion.div>
    </div>
  );
}

// ==================== Sub Components ====================
function StatBadge({icon,value,label}:{icon:React.ReactNode;value:number;label:string}) {
  return <div className="flex flex-col items-center gap-1"><div className="flex items-center gap-1.5 text-white/40">{icon}<span className="text-xl sm:text-2xl font-bold text-white/80">{value}</span></div><span className="text-[11px] text-white/30">{label}</span></div>;
}

export default AppContent;
