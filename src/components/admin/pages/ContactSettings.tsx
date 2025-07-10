import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Edit, Trash2, Eye, EyeOff, List, CheckSquare, XSquare } from 'lucide-react';

// Préparation pour les liens de contact (sera complété ensuite)
type ContactLink = { id: string; name: string; url: string; icon: string; visible: boolean };
type ContactField = {
    id: string;
    label: string;
    type: 'text' | 'email' | 'textarea' | 'tel';
    placeholder: string;
    required: boolean;
    visible: boolean;
    validation?: string;
    order: number;
};
const ContactSettings: React.FC = () => {
    const [intro, setIntro] = useState('');
    const [loading, setLoading] = useState(true);
    const [showSocialHero, setShowSocialHero] = useState(true);
    const [links, setLinks] = useState<ContactLink[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [form, setForm] = useState<{ name: string; url: string; icon: string; file: File | null; visible: boolean }>({ name: '', url: '', icon: '', file: null, visible: true });
    const [uploading, setUploading] = useState(false);
    const [iconPreview, setIconPreview] = useState<string>('');
    const [fields, setFields] = useState<ContactField[]>([]);
    const [fieldModalOpen, setFieldModalOpen] = useState(false);
    const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
    const [fieldForm, setFieldForm] = useState<Omit<ContactField, 'id' | 'order'>>({ label: '', type: 'text', placeholder: '', required: false, visible: true, validation: '' });
    const [showContactForm, setShowContactForm] = useState(true);

    useEffect(() => { fetchContactSettings(); }, []);
    // Chargement des champs dynamiques
    useEffect(() => { fetchContactFields(); }, []);
    useEffect(() => {
        // Charger la valeur depuis Supabase
        const fetchShowContactForm = async () => {
            const { data } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'show_contact_form')
                .maybeSingle();
            setShowContactForm(data?.value !== 'false');
        };
        fetchShowContactForm();
    }, []);

    const fetchContactSettings = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('settings')
            .select('key, value')
            .in('key', ['contact_intro', 'contact_links', 'show_social_hero']);
        setIntro(data?.find((row) => row.key === 'contact_intro')?.value || '');
        setShowSocialHero(data?.find((row) => row.key === 'show_social_hero')?.value !== 'false');
        let linksArr = [];
        try { linksArr = JSON.parse(data?.find((row) => row.key === 'contact_links')?.value || '[]'); } catch { linksArr = []; }
        setLinks(Array.isArray(linksArr) ? linksArr : []);
        setLoading(false);
    };

    const saveLinks = async (newLinks: ContactLink[]) => {
        setLinks(newLinks);
        await supabase.from('settings').upsert({ key: 'contact_links', value: JSON.stringify(newLinks) });
        toast.success('Links saved!');
    };

    const openModal = (idx: number | null = null) => {
        setEditingIndex(idx);
        if (idx !== null) {
            const l = links[idx];
            setForm({ name: l.name, url: l.url, icon: l.icon, file: null, visible: l.visible });
            setIconPreview(l.icon);
        } else {
            setForm({ name: '', url: '', icon: '', file: null, visible: true });
            setIconPreview('');
        }
        setModalOpen(true);
    };
    const closeModal = () => { setModalOpen(false); setEditingIndex(null); setForm({ name: '', url: '', icon: '', file: null, visible: true }); setIconPreview(''); };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm(f => ({ ...f, file }));
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.url.trim() || (!form.icon && !form.file)) {
            toast.error('All fields are required, including the icon.');
            return;
        }
        let iconUrl = form.icon;
        if (form.file) {
            setUploading(true);
            const ext = form.file.name.split('.').pop();
            const fileName = `contact-icons/${uuidv4()}.${ext}`;
            const { error } = await supabase.storage.from('public').upload(fileName, form.file, { upsert: true });
            if (error) { toast.error('Icon upload error'); setUploading(false); return; }
            const { data: urlData } = supabase.storage.from('public').getPublicUrl(fileName);
            iconUrl = urlData.publicUrl;
            setUploading(false);
        }
        const newLinks = [...links];
        if (editingIndex !== null) {
            newLinks[editingIndex] = { ...newLinks[editingIndex], name: form.name, url: form.url, icon: iconUrl, visible: form.visible };
        } else {
            newLinks.push({ id: uuidv4(), name: form.name, url: form.url, icon: iconUrl, visible: form.visible });
        }
        await saveLinks(newLinks);
        closeModal();
    };

    const handleDelete = (idx: number) => {
        if (!window.confirm('Delete this link?')) return;
        const newLinks = links.filter((_, i) => i !== idx);
        saveLinks(newLinks);
    };

    const handleToggleVisible = (idx: number) => {
        const newLinks = [...links];
        newLinks[idx].visible = !newLinks[idx].visible;
        saveLinks(newLinks);
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newLinks = Array.from(links);
        const [removed] = newLinks.splice(result.source.index, 1);
        newLinks.splice(result.destination.index, 0, removed);
        saveLinks(newLinks);
    };

    const saveIntro = async (e: React.FormEvent) => {
        e.preventDefault();
        await supabase.from('settings').upsert({ key: 'contact_intro', value: intro });
        toast.success('Contact text saved!');
    };

    const saveShowSocialHero = async () => {
        await supabase.from('settings').upsert({ key: 'show_social_hero', value: showSocialHero ? 'true' : 'false' });
        toast.success('Option saved!');
    };

    // Chargement des champs dynamiques
    const fetchContactFields = async () => {
        const { data } = await supabase.from('settings').select('value').eq('key', 'contact_form_fields').single();
        let arr: ContactField[] = [];
        try { arr = data?.value ? JSON.parse(data.value) : []; } catch { arr = []; }
        setFields(Array.isArray(arr) ? arr : []);
    };
    const saveFields = async (newFields: ContactField[]) => {
        setFields(newFields);
        await supabase.from('settings').upsert({ key: 'contact_form_fields', value: JSON.stringify(newFields) });
        toast.success('Contact form fields saved!');
    };
    const openFieldModal = (idx: number | null = null) => {
        setEditingFieldIndex(idx);
        if (idx !== null) {
            const f = fields[idx];
            setFieldForm({ label: f.label, type: f.type, placeholder: f.placeholder, required: f.required, visible: f.visible, validation: f.validation || '' });
        } else {
            setFieldForm({ label: '', type: 'text', placeholder: '', required: false, visible: true, validation: '' });
        }
        setFieldModalOpen(true);
    };
    const closeFieldModal = () => { setFieldModalOpen(false); setEditingFieldIndex(null); setFieldForm({ label: '', type: 'text', placeholder: '', required: false, visible: true, validation: '' }); };
    const handleFieldFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        setFieldForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleFieldSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fieldForm.label.trim()) { toast.error('Label is required'); return; }
        let newFields = [...fields];
        if (editingFieldIndex !== null) {
            newFields[editingFieldIndex] = { ...newFields[editingFieldIndex], ...fieldForm };
        } else {
            newFields.push({ id: uuidv4(), ...fieldForm, order: newFields.length });
        }
        saveFields(newFields);
        closeFieldModal();
    };
    const handleFieldDelete = (idx: number) => {
        if (!window.confirm('Delete this field?')) return;
        const newFields = fields.filter((_, i) => i !== idx);
        saveFields(newFields);
    };
    const handleFieldToggleVisible = (idx: number) => {
        const newFields = [...fields];
        newFields[idx].visible = !newFields[idx].visible;
        saveFields(newFields);
    };
    const onFieldDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newFields = Array.from(fields);
        const [removed] = newFields.splice(result.source.index, 1);
        newFields.splice(result.destination.index, 0, removed);
        // Recalcule l'ordre
        newFields.forEach((f, i) => f.order = i);
        saveFields(newFields);
    };

    const handleToggleShowContactForm = async () => {
        const newValue = !showContactForm;
        setShowContactForm(newValue);
        await supabase
            .from('settings')
            .upsert({ key: 'show_contact_form', value: newValue ? 'true' : 'false' });
        toast.success('Option saved!');
    };

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Contact Page Settings</h2>
            {loading ? (
                <div className="text-gray-400">Loading…</div>
            ) : (
                <>
                    {/* Texte d'intro/contact */}
                    <form onSubmit={saveIntro} className="mb-8">
                        <label className="block text-lg font-semibold mb-2">Introduction Text</label>
                        <textarea value={intro} onChange={e => setIntro(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-3 mb-2" placeholder="Your contact text…" />
                        <button type="submit" className="px-4 py-2 bg-gold text-black rounded-lg font-semibold">Save</button>
                    </form>

                    {/* Option affichage icônes réseaux sociaux sous le Hero */}
                    <div className="mb-8 flex items-center gap-4">
                        <label className="text-lg font-semibold">Show social icons under the Hero</label>
                        <input type="checkbox" checked={showSocialHero} onChange={e => setShowSocialHero(e.target.checked)} onBlur={saveShowSocialHero} className="w-6 h-6" />
                    </div>

                    {/* Switch afficher/cacher le formulaire de contact */}
                    <div className="mb-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={showContactForm} onChange={handleToggleShowContactForm} />
                            <span className="text-white">Show contact form</span>
                        </label>
                    </div>

                    {/* Liens de contact - Drag & drop + actions */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gold">Contact Links</h3>
                            <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-gold text-black rounded-lg font-semibold"><Plus className="w-4 h-4" />Add a link</button>
                        </div>
                        {links.length === 0 ? (
                            <div className="text-gray-400">No links added.</div>
                        ) : (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="contact-links">
                                    {(provided: any) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                                            {links.map((link, idx) => (
                                                <Draggable key={link.id} draggableId={link.id} index={idx}>
                                                    {(prov: any, snapshot: any) => (
                                                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className={`flex items-center bg-gray-800 rounded-lg p-3 shadow-lg gap-4 transition-all ${snapshot.isDragging ? 'ring-2 ring-gold' : ''}`}>
                                                            <img src={link.icon} alt={link.name} className="w-10 h-10 object-contain rounded bg-gray-900 border border-gray-700" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-gold truncate">{link.name}</div>
                                                                <div className="text-gray-300 text-sm truncate">{link.url}</div>
                                                            </div>
                                                            <button onClick={() => handleToggleVisible(idx)} className="p-2" title={link.visible ? 'Hide' : 'Show'}>{link.visible ? <Eye className="w-5 h-5 text-gold" /> : <EyeOff className="w-5 h-5 text-gray-500" />}</button>
                                                            <button onClick={() => openModal(idx)} className="p-2" title="Edit"><Edit className="w-5 h-5 text-blue-400" /></button>
                                                            <button onClick={() => handleDelete(idx)} className="p-2" title="Delete"><Trash2 className="w-5 h-5 text-red-500" /></button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </div>

                    {/* Modal ajout/édition */}
                    {modalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                            <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md relative">
                                <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-white"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
                                <h4 className="text-xl font-bold mb-6">{editingIndex !== null ? 'Edit Link' : 'Add a Link'}</h4>
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input name="name" value={form.name} onChange={handleFormChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">URL</label>
                                        <input name="url" value={form.url} onChange={handleFormChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2" required type="url" pattern="https?://.+" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Icon (SVG, PNG, JPG)</label>
                                        <input type="file" accept="image/*,.svg" onChange={handleFileChange} className="w-full" />
                                        {iconPreview && <img src={iconPreview} alt="Icon preview" className="w-12 h-12 mt-2 object-contain rounded bg-gray-800 border border-gray-700" />}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm font-medium">Show this link</label>
                                        <input type="checkbox" name="visible" checked={form.visible} onChange={handleFormChange} />
                                    </div>
                                    <button type="submit" className="w-full py-2 bg-gold text-black rounded-lg font-semibold mt-4" disabled={uploading}>{uploading ? 'Uploading…' : 'Save'}</button>
                                </form>
                            </div>
                        </div>
                    )}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gold">Contact Form Fields</h3>
                            <button onClick={() => openFieldModal()} className="flex items-center gap-2 px-4 py-2 bg-gold text-black rounded-lg font-semibold"><Plus className="w-4 h-4" />Add a field</button>
                        </div>
                        {fields.length === 0 ? (
                            <div className="text-gray-400">No fields defined.</div>
                        ) : (
                            <DragDropContext onDragEnd={onFieldDragEnd}>
                                <Droppable droppableId="contact-fields">
                                    {(provided: any) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                                            {fields.map((field, idx) => (
                                                <Draggable key={field.id} draggableId={field.id} index={idx}>
                                                    {(prov: any, snapshot: any) => (
                                                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className={`flex items-center bg-gray-800 rounded-lg p-3 shadow-lg gap-4 transition-all ${snapshot.isDragging ? 'ring-2 ring-gold' : ''}`}>
                                                            <List className="w-5 h-5 text-gold cursor-move" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-gold truncate">{field.label} <span className="text-xs text-gray-400">[{field.type}]</span></div>
                                                                <div className="text-gray-300 text-sm truncate">{field.placeholder}</div>
                                                                <div className="text-xs text-gray-400">{field.required ? <CheckSquare className="inline w-4 h-4 text-green-400" /> : <XSquare className="inline w-4 h-4 text-gray-500" />} {field.visible ? 'Visible' : 'Hidden'}</div>
                                                            </div>
                                                            <button onClick={() => handleFieldToggleVisible(idx)} className="p-2" title={field.visible ? 'Hide' : 'Show'}>{field.visible ? <Eye className="w-5 h-5 text-gold" /> : <EyeOff className="w-5 h-5 text-gray-500" />}</button>
                                                            <button onClick={() => openFieldModal(idx)} className="p-2" title="Edit"><Edit className="w-5 h-5 text-blue-400" /></button>
                                                            <button onClick={() => handleFieldDelete(idx)} className="p-2" title="Delete"><Trash2 className="w-5 h-5 text-red-500" /></button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                        {/* Modal ajout/édition de champ */}
                        {fieldModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                                <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md relative">
                                    <button onClick={closeFieldModal} className="absolute top-3 right-3 text-gray-400 hover:text-white"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
                                    <h4 className="text-xl font-bold mb-6">{editingFieldIndex !== null ? 'Edit Field' : 'Add a Field'}</h4>
                                    <form onSubmit={handleFieldSave} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Label</label>
                                            <input name="label" value={fieldForm.label} onChange={handleFieldFormChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Type</label>
                                            <select name="type" value={fieldForm.type} onChange={handleFieldFormChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2">
                                                <option value="text">Text</option>
                                                <option value="email">Email</option>
                                                <option value="tel">Phone</option>
                                                <option value="textarea">Textarea</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Placeholder</label>
                                            <input name="placeholder" value={fieldForm.placeholder} onChange={handleFieldFormChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <label className="text-sm font-medium">Required</label>
                                            <input type="checkbox" name="required" checked={fieldForm.required} onChange={handleFieldFormChange} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Validation (regex, optional)</label>
                                            <input name="validation" value={fieldForm.validation} onChange={handleFieldFormChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2" placeholder="ex: ^[0-9]+$" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <label className="text-sm font-medium">Visible</label>
                                            <input type="checkbox" name="visible" checked={fieldForm.visible} onChange={handleFieldFormChange} />
                                        </div>
                                        <button type="submit" className="w-full py-2 bg-gold text-black rounded-lg font-semibold mt-4">Save</button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ContactSettings; 