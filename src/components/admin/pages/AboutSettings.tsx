import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "../../../lib/supabase";
import { toast } from 'react-hot-toast';
import { Award, Camera, Heart, Star } from 'lucide-react';

const availableIcons = [
    { name: 'Camera', icon: Camera },
    { name: 'Award', icon: Award },
    { name: 'Heart', icon: Heart },
    { name: 'Star', icon: Star },
];

const AboutSettings: React.FC = () => {
    // Textes
    const [aboutText, setAboutText] = useState('');
    const [journey, setJourney] = useState('');
    // Achievements
    const [achievements, setAchievements] = useState([{ id: uuidv4(), image: '', title: '', desc: '' }]);
    const [achForm, setAchForm] = useState({ image: '', title: '', desc: '' });
    const [editingAchIndex, setEditingAchIndex] = useState<number | null>(null);
    // Specialties
    const [specialties, setSpecialties] = useState([{ id: uuidv4(), image: '', title: '', desc: '' }]);
    const [specForm, setSpecForm] = useState({ image: '', title: '', desc: '' });
    const [editingSpecIndex, setEditingSpecIndex] = useState<number | null>(null);
    // Stats
    const [aboutStats, setAboutStats] = useState([{ id: uuidv4(), icon: 'Camera', number: '', label: '', color: '#fff', size: '2rem' }]);
    const [statForm, setStatForm] = useState({ icon: 'Camera', number: '', label: '', color: '#fff', size: '2rem' });
    const [editingStatIndex, setEditingStatIndex] = useState<number | null>(null);
    // CTA
    const [cta, setCta] = useState({ title: '', desc: '', btn: '', btnLink: '', btnColor: '#d4af37', titleSize: '2rem' });

    useEffect(() => {
        fetchAboutSettings();
    }, []);

    const fetchAboutSettings = async () => {
        try {
            const { data } = await supabase
                .from('settings')
                .select('key, value')
                .in('key', [
                    'about_text', 'about_journey', 'about_achievements', 'about_specialties',
                    'about_stats', 'about_cta_title', 'about_cta_desc', 'about_cta_btn', 'about_cta_btn_link', 'about_cta_btn_color', 'about_cta_title_size'
                ]);
            setAboutText(data?.find((row) => row.key === 'about_text')?.value || '');
            setJourney(data?.find((row) => row.key === 'about_journey')?.value || '');
            // Achievements
            let achievementsArr = [];
            try { achievementsArr = JSON.parse(data?.find((row) => row.key === 'about_achievements')?.value || '[]'); } catch { achievementsArr = []; }
            setAchievements(Array.isArray(achievementsArr) && achievementsArr.length ? achievementsArr : [{ id: uuidv4(), image: '', title: '', desc: '' }]);
            // Specialties
            let specialtiesArr = [];
            try { specialtiesArr = JSON.parse(data?.find((row) => row.key === 'about_specialties')?.value || '[]'); } catch { specialtiesArr = []; }
            setSpecialties(Array.isArray(specialtiesArr) && specialtiesArr.length ? specialtiesArr : [{ id: uuidv4(), image: '', title: '', desc: '' }]);
            // Stats
            let statsArr = [];
            try { statsArr = JSON.parse(data?.find((row) => row.key === 'about_stats')?.value || '[]'); } catch { statsArr = []; }
            setAboutStats(Array.isArray(statsArr) && statsArr.length ? statsArr : [{ id: uuidv4(), icon: 'Camera', number: '', label: '', color: '#fff', size: '2rem' }]);
            // CTA
            setCta({
                title: data?.find((row) => row.key === 'about_cta_title')?.value || '',
                desc: data?.find((row) => row.key === 'about_cta_desc')?.value || '',
                btn: data?.find((row) => row.key === 'about_cta_btn')?.value || '',
                btnLink: data?.find((row) => row.key === 'about_cta_btn_link')?.value || '',
                btnColor: data?.find((row) => row.key === 'about_cta_btn_color')?.value || '#d4af37',
                titleSize: data?.find((row) => row.key === 'about_cta_title_size')?.value || '2rem',
            });
        } catch { }
    };

    // Handlers et save pour chaque bloc (texte, achievements, specialties, stats, CTA)
    // ...

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">About Page Settings</h2>
            {/* Texte principal */}
            <form onSubmit={async e => { e.preventDefault(); await supabase.from('settings').upsert({ key: 'about_text', value: aboutText }); toast.success('Text saved!'); }} className="mb-8">
                <label className="block text-lg font-semibold mb-2">Main text</label>
                <textarea value={aboutText} onChange={e => setAboutText(e.target.value)} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-3 mb-2" placeholder="Your text..." />
                <button type="submit" className="px-4 py-2 bg-gold text-black rounded-lg font-semibold">Save</button>
            </form>
            {/* My Journey */}
            <form onSubmit={async e => { e.preventDefault(); await supabase.from('settings').upsert({ key: 'about_journey', value: journey }); toast.success('Journey saved!'); }} className="mb-8">
                <label className="block text-lg font-semibold mb-2">My Journey Section</label>
                <textarea value={journey} onChange={e => setJourney(e.target.value)} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-3 mb-2" placeholder="Tell your story..." />
                <button type="submit" className="px-4 py-2 bg-gold text-black rounded-lg font-semibold">Save</button>
            </form>
            {/* Achievements */}
            <div className="mb-10">
                <h3 className="text-xl font-bold text-gold mb-4">Achievements</h3>
                <form onSubmit={e => {
                    e.preventDefault();
                    const list = [...achievements];
                    if (editingAchIndex !== null) {
                        list[editingAchIndex] = { ...achForm, id: list[editingAchIndex].id };
                    } else {
                        list.push({ ...achForm, id: uuidv4() });
                    }
                    setAchievements(list);
                    setAchForm({ image: '', title: '', desc: '' });
                    setEditingAchIndex(null);
                }} className="space-y-4 mb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input type="url" name="image" value={achForm.image} onChange={e => setAchForm(f => ({ ...f, image: e.target.value }))} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="Image (URL)" />
                        <input type="text" name="title" value={achForm.title} onChange={e => setAchForm(f => ({ ...f, title: e.target.value }))} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="Title" />
                        <input type="text" name="desc" value={achForm.desc} onChange={e => setAchForm(f => ({ ...f, desc: e.target.value }))} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="Description" />
                        <button type="submit" className="px-4 py-2 bg-gold text-black rounded-lg font-semibold">{editingAchIndex !== null ? 'Modify' : 'Add'}</button>
                        {editingAchIndex !== null && <button type="button" onClick={() => { setEditingAchIndex(null); setAchForm({ image: '', title: '', desc: '' }); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg">Cancel</button>}
                    </div>
                </form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {achievements.map((ach, idx) => (
                        <div key={ach.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-3">
                                <img src={ach.image || 'https://via.placeholder.com/80x80?text=Image'} alt={ach.title} className="w-14 h-14 object-cover rounded mr-2" />
                                <div>
                                    <div className="font-semibold text-gold">{ach.title}</div>
                                    <div className="text-gray-300 text-sm">{ach.desc}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setAchForm(ach); setEditingAchIndex(idx); }} className="px-2 py-1 bg-gold text-black rounded">Modify</button>
                                <button onClick={() => { setAchievements(achievements.filter((_, i) => i !== idx)); setEditingAchIndex(null); setAchForm({ image: '', title: '', desc: '' }); }} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                                <button onClick={() => { if (idx > 0) { const list = [...achievements];[list[idx], list[idx - 1]] = [list[idx - 1], list[idx]]; setAchievements(list); } }} disabled={idx === 0} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↑</button>
                                <button onClick={() => { if (idx < achievements.length - 1) { const list = [...achievements];[list[idx], list[idx + 1]] = [list[idx + 1], list[idx]]; setAchievements(list); } }} disabled={idx === achievements.length - 1} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↓</button>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={async () => { await supabase.from('settings').upsert({ key: 'about_achievements', value: JSON.stringify(achievements) }); toast.success('Achievements saved!'); }} className="px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200">Save achievements</button>
            </div>
            {/* Specialties */}
            <div className="mb-10">
                <h3 className="text-xl font-bold text-gold mb-4">Specialties</h3>
                <form onSubmit={e => {
                    e.preventDefault();
                    const list = [...specialties];
                    if (editingSpecIndex !== null) {
                        list[editingSpecIndex] = { ...specForm, id: list[editingSpecIndex].id };
                    } else {
                        list.push({ ...specForm, id: uuidv4() });
                    }
                    setSpecialties(list);
                    setSpecForm({ image: '', title: '', desc: '' });
                    setEditingSpecIndex(null);
                }} className="space-y-4 mb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input type="url" name="image" value={specForm.image} onChange={e => setSpecForm(f => ({ ...f, image: e.target.value }))} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="Image (URL)" />
                        <input type="text" name="title" value={specForm.title} onChange={e => setSpecForm(f => ({ ...f, title: e.target.value }))} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="Title" />
                        <input type="text" name="desc" value={specForm.desc} onChange={e => setSpecForm(f => ({ ...f, desc: e.target.value }))} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="Description" />
                        <button type="submit" className="px-4 py-2 bg-gold text-black rounded-lg font-semibold">{editingSpecIndex !== null ? 'Modify' : 'Add'}</button>
                        {editingSpecIndex !== null && <button type="button" onClick={() => { setEditingSpecIndex(null); setSpecForm({ image: '', title: '', desc: '' }); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg">Cancel</button>}
                    </div>
                </form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {specialties.map((spec, idx) => (
                        <div key={spec.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-3">
                                <img src={spec.image || 'https://via.placeholder.com/80x80?text=Image'} alt={spec.title} className="w-14 h-14 object-cover rounded mr-2" />
                                <div>
                                    <div className="font-semibold text-gold">{spec.title}</div>
                                    <div className="text-gray-300 text-sm">{spec.desc}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setSpecForm(spec); setEditingSpecIndex(idx); }} className="px-2 py-1 bg-gold text-black rounded">Modify</button>
                                <button onClick={() => { setSpecialties(specialties.filter((_, i) => i !== idx)); setEditingSpecIndex(null); setSpecForm({ image: '', title: '', desc: '' }); }} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                                <button onClick={() => { if (idx > 0) { const list = [...specialties];[list[idx], list[idx - 1]] = [list[idx - 1], list[idx]]; setSpecialties(list); } }} disabled={idx === 0} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↑</button>
                                <button onClick={() => { if (idx < specialties.length - 1) { const list = [...specialties];[list[idx], list[idx + 1]] = [list[idx + 1], list[idx]]; setSpecialties(list); } }} disabled={idx === specialties.length - 1} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↓</button>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={async () => { await supabase.from('settings').upsert({ key: 'about_specialties', value: JSON.stringify(specialties) }); toast.success('Specialties saved!'); }} className="px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200">Save specialties</button>
            </div>
            {/* Stats */}
            <div className="mb-10">
                <h3 className="text-xl font-bold text-gold mb-4">Key Statistics</h3>
                <form onSubmit={e => {
                    e.preventDefault();
                    const list = [...aboutStats];
                    if (editingStatIndex !== null) {
                        list[editingStatIndex] = { ...statForm, id: list[editingStatIndex].id };
                    } else {
                        list.push({ ...statForm, id: uuidv4() });
                    }
                    setAboutStats(list);
                    setStatForm({ icon: 'Camera', number: '', label: '', color: '#fff', size: '2rem' });
                    setEditingStatIndex(null);
                }} className="space-y-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <select name="icon" value={statForm.icon} onChange={e => setStatForm(f => ({ ...f, icon: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg text-white p-2">
                            {availableIcons.map(ic => <option key={ic.name} value={ic.name}>{ic.name}</option>)}
                        </select>
                        <input type="text" name="number" value={statForm.number} onChange={e => setStatForm(f => ({ ...f, number: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="500+" />
                        <input type="text" name="label" value={statForm.label} onChange={e => setStatForm(f => ({ ...f, label: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="Title" />
                        <input type="color" name="color" value={statForm.color} onChange={e => setStatForm(f => ({ ...f, color: e.target.value }))} className="w-16 h-10 p-0 border-0 bg-transparent" />
                        <input type="text" name="size" value={statForm.size} onChange={e => setStatForm(f => ({ ...f, size: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="2rem" />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">{editingStatIndex !== null ? 'Modify' : 'Add'}</button>
                        {editingStatIndex !== null && <button type="button" onClick={() => { setEditingStatIndex(null); setStatForm({ icon: 'Camera', number: '', label: '', color: '#fff', size: '2rem' }); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg">Cancel</button>}
                    </div>
                </form>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                    {aboutStats.map((stat, idx) => {
                        const Icon = availableIcons.find(ic => ic.name === stat.icon)?.icon || Camera;
                        return (
                            <div key={stat.id} className="bg-gray-800 rounded-lg p-4 flex flex-col items-center relative shadow-lg">
                                <Icon className="mb-2" style={{ color: stat.color, fontSize: stat.size }} />
                                <div className="text-2xl font-bold mb-1" style={{ color: stat.color, fontSize: stat.size }}>{stat.number}</div>
                                <div className="text-gray-300">{stat.label}</div>
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => { setStatForm(stat); setEditingStatIndex(idx); }} className="px-2 py-1 bg-gold text-black rounded">Modify</button>
                                    <button onClick={() => { setAboutStats(aboutStats.filter((_, i) => i !== idx)); setEditingStatIndex(null); setStatForm({ icon: 'Camera', number: '', label: '', color: '#fff', size: '2rem' }); }} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                                    <button onClick={() => { if (idx > 0) { const list = [...aboutStats];[list[idx], list[idx - 1]] = [list[idx - 1], list[idx]]; setAboutStats(list); } }} disabled={idx === 0} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↑</button>
                                    <button onClick={() => { if (idx < aboutStats.length - 1) { const list = [...aboutStats];[list[idx], list[idx + 1]] = [list[idx + 1], list[idx]]; setAboutStats(list); } }} disabled={idx === aboutStats.length - 1} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↓</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button onClick={async () => { await supabase.from('settings').upsert({ key: 'about_stats', value: JSON.stringify(aboutStats) }); toast.success('Stats saved!'); }} className="px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200">Save stats</button>
            </div>
            {/* CTA */}
            <div className="mb-10">
                <h3 className="text-xl font-bold text-gold mb-4">Call to Action Block</h3>
                <form onSubmit={async e => {
                    e.preventDefault(); await supabase.from('settings').upsert([
                        { key: 'about_cta_title', value: cta.title },
                        { key: 'about_cta_desc', value: cta.desc },
                        { key: 'about_cta_btn', value: cta.btn },
                        { key: 'about_cta_btn_link', value: cta.btnLink },
                        { key: 'about_cta_btn_color', value: cta.btnColor },
                        { key: 'about_cta_title_size', value: cta.titleSize },
                    ]); toast.success('CTA block saved!');
                }} className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                        <input type="text" value={cta.title} onChange={e => setCta(f => ({ ...f, title: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="CTA title" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Title size (ex: 2rem, 2.5rem, 48px...)</label>
                        <input type="text" value={cta.titleSize} onChange={e => setCta(f => ({ ...f, titleSize: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="2rem" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea value={cta.desc} onChange={e => setCta(f => ({ ...f, desc: e.target.value }))} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="CTA description" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Button text</label>
                        <input type="text" value={cta.btn} onChange={e => setCta(f => ({ ...f, btn: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="Button text" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Button link</label>
                        <input type="url" value={cta.btnLink} onChange={e => setCta(f => ({ ...f, btnLink: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Button color</label>
                        <input type="color" value={cta.btnColor} onChange={e => setCta(f => ({ ...f, btnColor: e.target.value }))} className="w-16 h-10 p-0 border-0 bg-transparent" />
                        <span className="ml-4 text-gray-300">{cta.btnColor}</span>
                    </div>
                    <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">Save</button>
                </form>
            </div>
        </div>
    );
};

export default AboutSettings; 