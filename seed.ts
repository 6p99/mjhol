import { db } from './src/lib/db';
async function seed() {
  const skills = [
    { name: 'Python', level: 85, icon: '🐍', category: 'Languages', sortOrder: 0 },
    { name: 'JavaScript', level: 90, icon: '⚡', category: 'Languages', sortOrder: 1 },
    { name: 'TypeScript', level: 80, icon: '📘', category: 'Languages', sortOrder: 2 },
    { name: 'HTML/CSS', level: 88, icon: '🎨', category: 'Languages', sortOrder: 3 },
    { name: 'Node.js', level: 82, icon: '🟢', category: 'Frameworks', sortOrder: 4 },
    { name: 'Next.js', level: 85, icon: '▲', category: 'Frameworks', sortOrder: 5 },
    { name: 'React', level: 83, icon: '⚛️', category: 'Frameworks', sortOrder: 6 },
    { name: 'Discord.js', level: 78, icon: '🤖', category: 'Frameworks', sortOrder: 7 },
    { name: 'Git', level: 75, icon: '📦', category: 'Tools', sortOrder: 8 },
    { name: 'SQLite', level: 70, icon: '🗃️', category: 'Tools', sortOrder: 9 },
  ];
  for (const s of skills) {
    await db.skill.upsert({ where: { id: `skill-${s.name.toLowerCase().replace(/\//g,'')}` }, create: { ...s }, update: s });
  }
  const services = [
    { name: 'الرئيسية', description: 'موقع البروفايل', status: 'operational', uptime: 99.9 },
    { name: 'API', description: 'واجهة البرمجة', status: 'operational', uptime: 99.8 },
    { name: 'قاعدة البيانات', description: 'SQLite Storage', status: 'operational', uptime: 99.9 },
    { name: 'Discord OAuth', description: 'تسجيل الدخول', status: 'operational', uptime: 99.5 },
  ];
  for (let i = 0; i < services.length; i++) {
    await db.serviceStatus.upsert({ where: { id: `service-${i}` }, create: { ...services[i] }, update: services[i] });
  }
  await db.visitorCount.upsert({ where: { id: 'main' }, create: { id: 'main', count: 0 }, update: {} });
  console.log('Seed complete!');
}
seed();
