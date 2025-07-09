import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Link,
  Award,
  Camera,
  Heart,
  Star
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';

interface SettingsForm {
  site_title: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_instagram: string;
  social_facebook: string;
  social_twitter: string;
  social_youtube: string;
  social_tiktok: string;
  social_linkedin: string;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [blockedIPs, setBlockedIPs] = useState<Array<{ id: string; ip_address: string; reason?: string; created_at: string }>>([]);
  const [newIP, setNewIP] = useState('');
  const [newIPReason, setNewIPReason] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [contentSettings, setContentSettings] = useState({
    about_text: '',
    contact_text: '',
    bio_link: '',
    about_journey: '',
    about_achievements: '',
    about_specialties: ''
  });
  const [heroSlidesList, setHeroSlidesList] = useState([
    { image: '', title: '', subtitle: '' }
  ]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [slideForm, setSlideForm] = useState({ image: '', title: '', subtitle: '' });
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');

  // Achievements (About)
  const [achievementsList, setAchievementsList] = useState([
    { id: uuidv4(), image: '', title: '', desc: '' }
  ]);
  const [editingAchIndex, setEditingAchIndex] = useState<number | null>(null);
  const [achForm, setAchForm] = useState({ image: '', title: '', desc: '' });
  const [loadingAch, setLoadingAch] = useState(false);

  // Specialties (About)
  const [specialtiesList, setSpecialtiesList] = useState([
    { id: uuidv4(), image: '', title: '', desc: '' }
  ]);
  const [editingSpecIndex, setEditingSpecIndex] = useState<number | null>(null);
  const [specForm, setSpecForm] = useState({ image: '', title: '', desc: '' });
  const [loadingSpec, setLoadingSpec] = useState(false);

  const [primaryColor, setPrimaryColor] = useState('#d4af37');
  const [buttonColor, setButtonColor] = useState('#d4af37');
  const [loadingAppearance, setLoadingAppearance] = useState(true);

  const [featuredTitle, setFeaturedTitle] = useState('');
  const [featuredTitleColor, setFeaturedTitleColor] = useState('#fff');
  const [featuredTitleSize, setFeaturedTitleSize] = useState('3rem');
  const [featuredDesc, setFeaturedDesc] = useState('');
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const { register, handleSubmit, reset } = useForm<SettingsForm>();

  // Stats About
  const [aboutStats, setAboutStats] = useState([
    { id: uuidv4(), icon: 'Camera', number: '500+', label: 'Photo Shoots', color: '#fff', size: '2rem' }
  ]);
  const [editingStatIndex, setEditingStatIndex] = useState<number | null>(null);
  const [statForm, setStatForm] = useState({ icon: 'Camera', number: '', label: '', color: '#fff', size: '2rem' });
  const [loadingStats, setLoadingStats] = useState(false);

  // CTA About
  const [ctaTitle, setCtaTitle] = useState('');
  const [ctaDesc, setCtaDesc] = useState('');
  const [ctaBtn, setCtaBtn] = useState('');
  const [ctaBtnLink, setCtaBtnLink] = useState('');
  const [ctaBtnColor, setCtaBtnColor] = useState('#d4af37');
  const [ctaTitleSize, setCtaTitleSize] = useState('2rem');
  const [loadingCta, setLoadingCta] = useState(false);

  const availableIcons = [
    { name: 'Camera', icon: Camera },
    { name: 'Award', icon: Award },
    { name: 'Heart', icon: Heart },
    { name: 'Star', icon: Star },
  ];

  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [contactInstagram, setContactInstagram] = useState('');
  const [contactLinks, setContactLinks] = useState<{ id: string; name: string; url: string }[]>([]);
  const [linkForm, setLinkForm] = useState({ name: '', url: '' });
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);

  const [heroShowSocials, setHeroShowSocials] = useState(true);

  useEffect(() => {
    fetchBlockedIPs();
    loadSettings();
    fetchContentSettings();
    fetchHeroSlides();
    fetchAchievements();
    fetchSpecialties();
    fetchHeroTitleSubtitle();
    fetchAppearance();
    fetchAboutStats();
    fetchAboutCta();
    fetchFeaturedSettings();
    fetchContactInfos();
    fetchContactLinks();
    fetchHeroShowSocials();
  }, []);

  const loadSettings = () => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('portfolio_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      reset(settings);
    }
  };

  const fetchBlockedIPs = async () => {
    try {
      const { data } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('created_at', { ascending: false });
      setBlockedIPs(data || []);
    } catch {
      toast.error('Erreur lors du chargement des IPs bloquées');
    }
  };

  const fetchContentSettings = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          'about_text', 'contact_text', 'bio_link',
          'about_journey', 'about_achievements', 'about_specialties'
        ]);
      const settings: typeof contentSettings = { ...contentSettings };
      data?.forEach((row) => {
        if (row.key in settings) (settings as Record<string, string>)[row.key] = row.value;
      });
      setContentSettings(settings);
    } catch { }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContentSettings({ ...contentSettings, [e.target.name]: e.target.value });
  };

  const saveContentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      (['about_text', 'contact_text', 'bio_link', 'about_journey', 'about_achievements', 'about_specialties'] as const).forEach(async (key) => {
        await supabase.from('settings').upsert({ key, value: contentSettings[key] });
      });
      toast.success('Contenus sauvegardés avec succès');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const onSubmit = async (data: SettingsForm) => {
    try {
      // Save settings to localStorage (in a real app, you'd save to database)
      localStorage.setItem('portfolio_settings', JSON.stringify(data));
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const addBlockedIP = async () => {
    if (!newIP.trim()) {
      toast.error('Veuillez entrer une adresse IP');
      return;
    }
    try {
      await supabase
        .from('blocked_ips')
        .insert([{
          ip_address: newIP.trim(),
          reason: newIPReason.trim() || null,
          blocked_by: user?.id
        }]);
      setNewIP('');
      setNewIPReason('');
      fetchBlockedIPs();
      toast.success('IP bloquée avec succès');
    } catch {
      toast.error('Erreur lors du blocage de l\'IP');
    }
  };

  const removeBlockedIP = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir débloquer cette IP ?')) return;
    try {
      await supabase
        .from('blocked_ips')
        .delete()
        .eq('id', id);
      fetchBlockedIPs();
      toast.success('IP débloquée avec succès');
    } catch {
      toast.error('Erreur lors du déblocage de l\'IP');
    }
  };

  const fetchHeroSlides = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'hero_slides')
        .single();
      let slides = [];
      try {
        slides = data?.value ? JSON.parse(data.value) : [];
      } catch { slides = []; }
      if (!slides.length) slides = [{ image: '', title: '', subtitle: '' }];
      setHeroSlidesList(slides);
    } catch {
      toast.error('Erreur lors du chargement des slides Hero');
    } finally {
    }
  };

  const saveHeroSlides = async () => {
    try {
      await supabase.from('settings').upsert({ key: 'hero_slides', value: JSON.stringify(heroSlidesList) });
      toast.success('Slides Hero sauvegardées !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleSlideFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSlideForm({ ...slideForm, [e.target.name]: e.target.value });
  };

  const addOrEditSlide = (e: React.FormEvent) => {
    e.preventDefault();
    const slides = [...heroSlidesList];
    if (editingIndex !== null) {
      slides[editingIndex] = { ...slideForm };
    } else {
      slides.push({ ...slideForm });
    }
    setHeroSlidesList(slides);
    setSlideForm({ image: '', title: '', subtitle: '' });
    setEditingIndex(null);
  };

  const editSlide = (idx: number) => {
    setSlideForm({ ...heroSlidesList[idx] });
    setEditingIndex(idx);
  };

  const deleteSlide = (idx: number) => {
    if (!window.confirm('Supprimer cette slide ?')) return;
    setHeroSlidesList(heroSlidesList.filter((_, i) => i !== idx));
    setEditingIndex(null);
    setSlideForm({ image: '', title: '', subtitle: '' });
  };

  const moveSlide = (idx: number, dir: number) => {
    const slides = [...heroSlidesList];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= slides.length) return;
    [slides[idx], slides[newIdx]] = [slides[newIdx], slides[idx]];
    setHeroSlidesList(slides);
  };

  const fetchAchievements = async () => {
    setLoadingAch(true);
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'about_achievements')
        .single();
      let achievements = [];
      try {
        achievements = data?.value ? JSON.parse(data.value) : [];
      } catch { achievements = []; }
      if (!achievements.length) achievements = [{ id: uuidv4(), image: '', title: '', desc: '' }];
      setAchievementsList(achievements);
    } catch {
      toast.error('Erreur lors du chargement des achievements');
    } finally {
      setLoadingAch(false);
    }
  };

  const saveAchievements = async () => {
    try {
      await supabase.from('settings').upsert({ key: 'about_achievements', value: JSON.stringify(achievementsList) });
      toast.success('Achievements sauvegardés !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleAchFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAchForm({ ...achForm, [e.target.name]: e.target.value });
  };

  const addOrEditAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    const list = [...achievementsList];
    if (editingAchIndex !== null) {
      list[editingAchIndex] = { ...achForm, id: list[editingAchIndex].id };
    } else {
      list.push({ ...achForm, id: uuidv4() });
    }
    setAchievementsList(list);
    setAchForm({ image: '', title: '', desc: '' });
    setEditingAchIndex(null);
  };

  const editAchievement = (idx: number) => {
    setAchForm({ ...achievementsList[idx] });
    setEditingAchIndex(idx);
  };

  const deleteAchievement = (idx: number) => {
    if (!window.confirm('Supprimer cet achievement ?')) return;
    setAchievementsList(achievementsList.filter((_, i) => i !== idx));
    setEditingAchIndex(null);
    setAchForm({ image: '', title: '', desc: '' });
  };

  const moveAchievement = (idx: number, dir: number) => {
    const list = [...achievementsList];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= list.length) return;
    [list[idx], list[newIdx]] = [list[newIdx], list[idx]];
    setAchievementsList(list);
  };

  // Specialties (mêmes fonctions que achievements)
  const fetchSpecialties = async () => {
    setLoadingSpec(true);
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'about_specialties')
        .single();
      let specs = [];
      try {
        specs = data?.value ? JSON.parse(data.value) : [];
      } catch { specs = []; }
      if (!specs.length) specs = [{ id: uuidv4(), image: '', title: '', desc: '' }];
      setSpecialtiesList(specs);
    } catch {
      toast.error('Erreur lors du chargement des specialties');
    } finally {
      setLoadingSpec(false);
    }
  };

  const saveSpecialties = async () => {
    try {
      await supabase.from('settings').upsert({ key: 'about_specialties', value: JSON.stringify(specialtiesList) });
      toast.success('Specialties sauvegardées !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleSpecFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSpecForm({ ...specForm, [e.target.name]: e.target.value });
  };

  const addOrEditSpecialty = (e: React.FormEvent) => {
    e.preventDefault();
    const list = [...specialtiesList];
    if (editingSpecIndex !== null) {
      list[editingSpecIndex] = { ...specForm, id: list[editingSpecIndex].id };
    } else {
      list.push({ ...specForm, id: uuidv4() });
    }
    setSpecialtiesList(list);
    setSpecForm({ image: '', title: '', desc: '' });
    setEditingSpecIndex(null);
  };

  const editSpecialty = (idx: number) => {
    setSpecForm({ ...specialtiesList[idx] });
    setEditingSpecIndex(idx);
  };

  const deleteSpecialty = (idx: number) => {
    if (!window.confirm('Supprimer cette spécialité ?')) return;
    setSpecialtiesList(specialtiesList.filter((_, i) => i !== idx));
    setEditingSpecIndex(null);
    setSpecForm({ image: '', title: '', desc: '' });
  };

  const moveSpecialty = (idx: number, dir: number) => {
    const list = [...specialtiesList];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= list.length) return;
    [list[idx], list[newIdx]] = [list[newIdx], list[idx]];
    setSpecialtiesList(list);
  };

  const fetchHeroTitleSubtitle = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['hero_title', 'hero_subtitle']);
      setHeroTitle(data?.find((row) => row.key === 'hero_title')?.value || '');
      setHeroSubtitle(data?.find((row) => row.key === 'hero_subtitle')?.value || '');
    } catch {
      toast.error('Erreur lors du chargement du titre/sous-titre Hero');
    }
  };

  const saveHeroTitleSubtitle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('settings').upsert([{ key: 'hero_title', value: heroTitle }, { key: 'hero_subtitle', value: heroSubtitle }]);
      toast.success('Titre et sous-titre du Hero sauvegardés !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const fetchAppearance = async () => {
    setLoadingAppearance(true);
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['primary_color', 'button_color']);
      setPrimaryColor(data?.find((row) => row.key === 'primary_color')?.value || '#d4af37');
      setButtonColor(data?.find((row) => row.key === 'button_color')?.value || '#d4af37');
    } catch {
      toast.error('Erreur lors du chargement des couleurs');
    } finally {
      setLoadingAppearance(false);
    }
  };

  const saveAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('settings').upsert([
        { key: 'primary_color', value: primaryColor },
        { key: 'button_color', value: buttonColor }
      ]);
      toast.success('Couleurs sauvegardées !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const fetchFeaturedSettings = async () => {
    setLoadingFeatured(true);
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['featured_title', 'featured_title_color', 'featured_title_size', 'featured_desc']);
      setFeaturedTitle(data?.find((row) => row.key === 'featured_title')?.value || '');
      setFeaturedTitleColor(data?.find((row) => row.key === 'featured_title_color')?.value || '#fff');
      setFeaturedTitleSize(data?.find((row) => row.key === 'featured_title_size')?.value || '3rem');
      setFeaturedDesc(data?.find((row) => row.key === 'featured_desc')?.value || '');
    } catch {
      toast.error('Erreur lors du chargement des paramètres Featured Photos');
    } finally {
      setLoadingFeatured(false);
    }
  };

  const saveFeaturedSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('settings').upsert([
        { key: 'featured_title', value: featuredTitle },
        { key: 'featured_title_color', value: featuredTitleColor },
        { key: 'featured_title_size', value: featuredTitleSize },
        { key: 'featured_desc', value: featuredDesc }
      ]);
      toast.success('Paramètres Featured Photos sauvegardés !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const fetchAboutStats = async () => {
    setLoadingStats(true);
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'about_stats')
        .single();
      let stats = [];
      try {
        stats = data?.value ? JSON.parse(data.value) : [];
      } catch { stats = []; }
      if (!stats.length) stats = [{ id: uuidv4(), icon: 'Camera', number: '500+', label: 'Photo Shoots', color: '#fff', size: '2rem' }];
      setAboutStats(stats);
    } catch {
      toast.error('Erreur lors du chargement des stats');
    } finally {
      setLoadingStats(false);
    }
  };

  const saveAboutStats = async () => {
    try {
      await supabase.from('settings').upsert({ key: 'about_stats', value: JSON.stringify(aboutStats) });
      toast.success('Stats sauvegardées !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleStatFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStatForm({ ...statForm, [e.target.name]: e.target.value });
  };

  const addOrEditStat = (e: React.FormEvent) => {
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
  };

  const editStat = (idx: number) => {
    setStatForm({ ...aboutStats[idx] });
    setEditingStatIndex(idx);
  };

  const deleteStat = (idx: number) => {
    if (!window.confirm('Supprimer cette stat ?')) return;
    setAboutStats(aboutStats.filter((_, i) => i !== idx));
    setEditingStatIndex(null);
    setStatForm({ icon: 'Camera', number: '', label: '', color: '#fff', size: '2rem' });
  };

  const moveStat = (idx: number, dir: number) => {
    const list = [...aboutStats];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= list.length) return;
    [list[idx], list[newIdx]] = [list[newIdx], list[idx]];
    setAboutStats(list);
  };

  // CTA
  const fetchAboutCta = async () => {
    setLoadingCta(true);
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['about_cta_title', 'about_cta_desc', 'about_cta_btn', 'about_cta_btn_link', 'about_cta_btn_color', 'about_cta_title_size']);
      setCtaTitle(data?.find((row) => row.key === 'about_cta_title')?.value || '');
      setCtaDesc(data?.find((row) => row.key === 'about_cta_desc')?.value || '');
      setCtaBtn(data?.find((row) => row.key === 'about_cta_btn')?.value || '');
      setCtaBtnLink(data?.find((row) => row.key === 'about_cta_btn_link')?.value || '');
      setCtaBtnColor(data?.find((row) => row.key === 'about_cta_btn_color')?.value || '#d4af37');
      setCtaTitleSize(data?.find((row) => row.key === 'about_cta_title_size')?.value || '2rem');
    } catch {
      toast.error('Erreur lors du chargement du CTA');
    } finally {
      setLoadingCta(false);
    }
  };

  const saveAboutCta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('settings').upsert([
        { key: 'about_cta_title', value: ctaTitle },
        { key: 'about_cta_desc', value: ctaDesc },
        { key: 'about_cta_btn', value: ctaBtn },
        { key: 'about_cta_btn_link', value: ctaBtnLink },
        { key: 'about_cta_btn_color', value: ctaBtnColor },
        { key: 'about_cta_title_size', value: ctaTitleSize },
      ]);
      toast.success('CTA sauvegardé !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const fetchContactInfos = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          'contact_phone', 'contact_email', 'contact_address', 'contact_whatsapp', 'contact_instagram'
        ]);
      setContactPhone(data?.find((row) => row.key === 'contact_phone')?.value || '');
      setContactEmail(data?.find((row) => row.key === 'contact_email')?.value || '');
      setContactAddress(data?.find((row) => row.key === 'contact_address')?.value || '');
      setContactWhatsapp(data?.find((row) => row.key === 'contact_whatsapp')?.value || '');
      setContactInstagram(data?.find((row) => row.key === 'contact_instagram')?.value || '');
    } catch { }
  };

  const saveContactInfos = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('settings').upsert([
        { key: 'contact_phone', value: contactPhone },
        { key: 'contact_email', value: contactEmail },
        { key: 'contact_address', value: contactAddress },
        { key: 'contact_whatsapp', value: contactWhatsapp },
        { key: 'contact_instagram', value: contactInstagram },
      ]);
      toast.success('Infos contact sauvegardées !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const fetchContactLinks = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'contact_links')
        .single();
      let links = [];
      try {
        links = data?.value ? JSON.parse(data.value) : [];
      } catch { links = []; }
      setContactLinks(Array.isArray(links) ? links : []);
    } catch { }
  };

  const saveContactLinks = async () => {
    try {
      await supabase.from('settings').upsert({ key: 'contact_links', value: JSON.stringify(contactLinks) });
      toast.success('Liens de contact sauvegardés !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleLinkFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLinkForm({ ...linkForm, [e.target.name]: e.target.value });
  };

  const addOrEditLink = (e: React.FormEvent) => {
    e.preventDefault();
    let links = [...contactLinks];
    if (editingLinkIndex !== null) {
      links[editingLinkIndex] = { ...linkForm, id: links[editingLinkIndex].id };
    } else {
      links.push({ ...linkForm, id: uuidv4() });
    }
    setContactLinks(links);
    setLinkForm({ name: '', url: '' });
    setEditingLinkIndex(null);
  };

  const editLink = (idx: number) => {
    setLinkForm({ ...contactLinks[idx] });
    setEditingLinkIndex(idx);
  };

  const deleteLink = (idx: number) => {
    if (!window.confirm('Supprimer ce lien ?')) return;
    setContactLinks(contactLinks.filter((_, i) => i !== idx));
    setEditingLinkIndex(null);
    setLinkForm({ name: '', url: '' });
  };

  const moveLink = (idx: number, dir: number) => {
    const links = [...contactLinks];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= links.length) return;
    [links[idx], links[newIdx]] = [links[newIdx], links[idx]];
    setContactLinks(links);
  };

  const fetchHeroShowSocials = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'hero_show_socials')
        .single();
      setHeroShowSocials(data?.value === 'false' ? false : true);
    } catch { }
  };

  const saveHeroShowSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('settings').upsert({ key: 'hero_show_socials', value: heroShowSocials ? 'true' : 'false' });
      toast.success('Affichage des réseaux sociaux mis à jour !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const tabs = [
    { id: 'general', label: 'Général' },
    { id: 'appearance', label: 'Apparence' },
    { id: 'about', label: 'À propos' },
    { id: 'contact', label: 'Contact' },
    { id: 'hero', label: 'Hero' },
    { id: 'photos', label: 'Photos' },
    { id: 'security', label: 'Sécurité' },
  ];

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
          <p className="text-gray-400">Configurez votre portfolio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-4">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded font-semibold transition-colors ${activeTab === tab.id ? 'bg-gold text-black' : 'bg-gray-800 text-gray-300 hover:bg-gold/20'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 rounded-lg p-6">
              {activeTab === 'general' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Paramètres généraux</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Titre du site
                        </label>
                        <input
                          {...register('site_title')}
                          type="text"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          placeholder="Mon Portfolio"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email de contact
                        </label>
                        <input
                          {...register('contact_email')}
                          type="email"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          placeholder="contact@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description du site
                      </label>
                      <textarea
                        {...register('site_description')}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                        placeholder="Description de votre portfolio..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Téléphone
                        </label>
                        <input
                          {...register('contact_phone')}
                          type="tel"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Adresse
                        </label>
                        <input
                          {...register('contact_address')}
                          type="text"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          placeholder="Paris, France"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      <span>Sauvegarder</span>
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'social' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Réseaux sociaux</h2>
                  <div className="space-y-6">
                    {[
                      { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
                      { key: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
                      { key: 'social_twitter', label: 'Twitter', placeholder: 'https://twitter.com/username' },
                      { key: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/channel/...' },
                      { key: 'social_tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
                      { key: 'social_linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                    ].map((social) => (
                      <div key={social.key}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Link className="w-4 h-4 inline mr-2" />
                          {social.label}
                        </label>
                        <input
                          {...register(social.key as keyof SettingsForm)}
                          type="url"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          placeholder={social.placeholder}
                        />
                      </div>
                    ))}

                    <button
                      onClick={handleSubmit(onSubmit)}
                      className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      <span>Sauvegarder les liens</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Sécurité</h2>

                  {/* Blocked IPs */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">IPs bloquées</h3>

                    {/* Add new blocked IP */}
                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <input
                          type="text"
                          value={newIP}
                          onChange={(e) => setNewIP(e.target.value)}
                          placeholder="Adresse IP (ex: 192.168.1.1)"
                          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                        <input
                          type="text"
                          value={newIPReason}
                          onChange={(e) => setNewIPReason(e.target.value)}
                          placeholder="Raison (optionnel)"
                          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                        <button
                          onClick={addBlockedIP}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Bloquer</span>
                        </button>
                      </div>
                    </div>

                    {/* Blocked IPs list */}
                    <div className="space-y-2">
                      {blockedIPs.map((ip) => (
                        <div key={ip.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                          <div>
                            <span className="text-white font-medium">{ip.ip_address}</span>
                            {ip.reason && (
                              <p className="text-gray-400 text-sm">{ip.reason}</p>
                            )}
                            <p className="text-gray-500 text-xs">
                              Bloquée le {new Date(ip.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <button
                            onClick={() => removeBlockedIP(ip.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            title="Débloquer cette IP"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {blockedIPs.length === 0 && (
                        <div className="text-center py-8">
                          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400">Aucune IP bloquée</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Change Password */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Changer le mot de passe</h3>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Mot de passe actuel
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                              placeholder="Mot de passe actuel"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Nouveau mot de passe
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                              placeholder="Nouveau mot de passe"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Confirmer le mot de passe
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                              placeholder="Confirmer le mot de passe"
                            />
                          </div>
                        </div>

                        <button
                          className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
                        >
                          <Save className="w-5 h-5" />
                          <span>Changer le mot de passe</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4">Apparence du site</h2>
                  {loadingAppearance ? (
                    <div className="text-gray-400">Chargement...</div>
                  ) : (
                    <form onSubmit={saveAppearance} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Couleur principale</label>
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={e => setPrimaryColor(e.target.value)}
                          className="w-16 h-10 p-0 border-0 bg-transparent"
                        />
                        <span className="ml-4 text-gray-300">{primaryColor}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Couleur des boutons</label>
                        <input
                          type="color"
                          value={buttonColor}
                          onChange={e => setButtonColor(e.target.value)}
                          className="w-16 h-10 p-0 border-0 bg-transparent"
                        />
                        <span className="ml-4 text-gray-300">{buttonColor}</span>
                      </div>
                      <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">Sauvegarder</button>
                    </form>
                  )}
                </motion.div>
              )}

              {activeTab === 'about' && (
                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Section À propos</h2>
                  {/* Texte À propos */}
                  <div id="about-section" className="mb-10 scroll-mt-24">
                    <h3 className="text-xl font-bold text-gold mb-4">À propos</h3>
                    <form onSubmit={saveContentSettings} className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Texte "À propos"</label>
                        <textarea
                          name="about_text"
                          value={contentSettings.about_text}
                          onChange={handleContentChange}
                          rows={5}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-3"
                          placeholder="Présentez-vous, votre parcours, votre vision..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Section "My Journey"</label>
                        <textarea
                          name="about_journey"
                          value={contentSettings.about_journey}
                          onChange={handleContentChange}
                          rows={5}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-3"
                          placeholder="Racontez votre parcours, votre histoire..."
                        />
                      </div>
                      <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">Sauvegarder</button>
                    </form>
                  </div>
                  {/* Achievements */}
                  <div id="achievements-section" className="mb-10 scroll-mt-24">
                    <h3 className="text-xl font-bold text-gold mb-4">Achievements</h3>
                    {loadingAch ? (
                      <div className="text-gray-400">Chargement...</div>
                    ) : (
                      <>
                        <form onSubmit={addOrEditAchievement} className="space-y-4 mb-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Image (URL)</label>
                              <input
                                type="url"
                                name="image"
                                value={achForm.image}
                                onChange={handleAchFormChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
                              <input
                                type="text"
                                name="title"
                                value={achForm.title}
                                onChange={handleAchFormChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                                placeholder="Titre de l'achievement"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                              <textarea
                                name="desc"
                                value={achForm.desc}
                                onChange={handleAchFormChange}
                                rows={2}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                                placeholder="Description de l'achievement"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">
                              {editingAchIndex !== null ? 'Modifier' : 'Ajouter'}
                            </button>
                            {editingAchIndex !== null && (
                              <button type="button" onClick={() => { setEditingAchIndex(null); setAchForm({ image: '', title: '', desc: '' }); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg">Annuler</button>
                            )}
                          </div>
                        </form>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                          {achievementsList.map((achievement, idx) => (
                            <div key={achievement.id} className="bg-gray-800 rounded-lg p-4 flex flex-col items-center relative shadow-lg">
                              <img src={achievement.image || 'https://via.placeholder.com/150x150?text=Image'} alt="achievement" className="w-20 h-20 object-contain rounded-full mb-3" />
                              <h4 className="text-lg font-bold text-gold mb-1">{achievement.title}</h4>
                              <p className="text-gray-300 mb-2">{achievement.desc}</p>
                              <div className="flex gap-2 mt-auto">
                                <button onClick={() => editAchievement(idx)} className="px-2 py-1 bg-gold text-black rounded">Modifier</button>
                                <button onClick={() => deleteAchievement(idx)} className="px-2 py-1 bg-red-600 text-white rounded">Supprimer</button>
                              </div>
                              <div className="absolute top-2 right-2 flex flex-col gap-1">
                                <button onClick={() => moveAchievement(idx, -1)} disabled={idx === 0} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↑</button>
                                <button onClick={() => moveAchievement(idx, 1)} disabled={idx === achievementsList.length - 1} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↓</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button onClick={saveAchievements} className="px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200">
                          Sauvegarder les achievements
                        </button>
                      </>
                    )}
                  </div>
                  {/* Specialties */}
                  <div id="specialties-section" className="mb-10 scroll-mt-24">
                    <h3 className="text-xl font-bold text-gold mb-4">Specialties</h3>
                    {loadingSpec ? (
                      <div className="text-gray-400">Chargement...</div>
                    ) : (
                      <>
                        <form onSubmit={addOrEditSpecialty} className="space-y-4 mb-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Image (URL)</label>
                              <input
                                type="url"
                                name="image"
                                value={specForm.image}
                                onChange={handleSpecFormChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
                              <input
                                type="text"
                                name="title"
                                value={specForm.title}
                                onChange={handleSpecFormChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                                placeholder="Titre de la spécialité"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                              <textarea
                                name="desc"
                                value={specForm.desc}
                                onChange={handleSpecFormChange}
                                rows={2}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                                placeholder="Description de la spécialité"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">
                              {editingSpecIndex !== null ? 'Modifier' : 'Ajouter'}
                            </button>
                            {editingSpecIndex !== null && (
                              <button type="button" onClick={() => { setEditingSpecIndex(null); setSpecForm({ image: '', title: '', desc: '' }); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg">Annuler</button>
                            )}
                          </div>
                        </form>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                          {specialtiesList.map((specialty, idx) => (
                            <div key={specialty.id} className="bg-gray-800 rounded-lg p-4 flex flex-col items-center relative shadow-lg">
                              <img src={specialty.image || 'https://via.placeholder.com/150x150?text=Image'} alt="specialty" className="w-20 h-20 object-contain rounded-full mb-3" />
                              <h4 className="text-lg font-bold text-gold mb-1">{specialty.title}</h4>
                              <p className="text-gray-300 mb-2">{specialty.desc}</p>
                              <div className="flex gap-2 mt-auto">
                                <button onClick={() => editSpecialty(idx)} className="px-2 py-1 bg-gold text-black rounded">Modifier</button>
                                <button onClick={() => deleteSpecialty(idx)} className="px-2 py-1 bg-red-600 text-white rounded">Supprimer</button>
                              </div>
                              <div className="absolute top-2 right-2 flex flex-col gap-1">
                                <button onClick={() => moveSpecialty(idx, -1)} disabled={idx === 0} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↑</button>
                                <button onClick={() => moveSpecialty(idx, 1)} disabled={idx === specialtiesList.length - 1} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↓</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button onClick={saveSpecialties} className="px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200">
                          Sauvegarder les specialties
                        </button>
                      </>
                    )}
                  </div>
                  {/* Stats About */}
                  <div id="about-stats-section" className="mb-10 scroll-mt-24">
                    <h3 className="text-xl font-bold text-gold mb-4">Statistiques clés</h3>
                    {loadingStats ? (
                      <div className="text-gray-400">Chargement...</div>
                    ) : (
                      <>
                        <form onSubmit={addOrEditStat} className="space-y-4 mb-6">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Icône</label>
                              <select
                                name="icon"
                                value={statForm.icon}
                                onChange={e => setStatForm({ ...statForm, icon: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                              >
                                {availableIcons.map((ic) => (
                                  <option key={ic.name} value={ic.name}>{ic.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                              <input
                                type="text"
                                name="number"
                                value={statForm.number}
                                onChange={handleStatFormChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                                placeholder="500+"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
                              <input
                                type="text"
                                name="label"
                                value={statForm.label}
                                onChange={handleStatFormChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                                placeholder="Photo Shoots"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Couleur</label>
                              <input
                                type="color"
                                name="color"
                                value={statForm.color}
                                onChange={handleStatFormChange}
                                className="w-16 h-10 p-0 border-0 bg-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Taille police</label>
                              <input
                                type="text"
                                name="size"
                                value={statForm.size}
                                onChange={handleStatFormChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                                placeholder="2rem"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">
                              {editingStatIndex !== null ? 'Modifier' : 'Ajouter'}
                            </button>
                            {editingStatIndex !== null && (
                              <button type="button" onClick={() => { setEditingStatIndex(null); setStatForm({ icon: 'Camera', number: '', label: '', color: '#fff', size: '2rem' }); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg">Annuler</button>
                            )}
                          </div>
                        </form>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                          {aboutStats.map((stat, idx) => {
                            const Icon = availableIcons.find(ic => ic.name === stat.icon)?.icon || Camera;
                            return (
                              <div key={stat.id} className="bg-gray-800 rounded-lg p-4 flex flex-col items-center relative shadow-lg">
                                <Icon className="mb-2" style={{ color: stat.color, fontSize: stat.size }} />
                                <div className="text-2xl font-bold mb-1" style={{ color: stat.color, fontSize: stat.size }}>{stat.number}</div>
                                <div className="text-gray-300">{stat.label}</div>
                                <div className="flex gap-2 mt-2">
                                  <button onClick={() => editStat(idx)} className="px-2 py-1 bg-gold text-black rounded">Modifier</button>
                                  <button onClick={() => deleteStat(idx)} className="px-2 py-1 bg-red-600 text-white rounded">Supprimer</button>
                                </div>
                                <div className="absolute top-2 right-2 flex flex-col gap-1">
                                  <button onClick={() => moveStat(idx, -1)} disabled={idx === 0} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↑</button>
                                  <button onClick={() => moveStat(idx, 1)} disabled={idx === aboutStats.length - 1} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↓</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <button onClick={saveAboutStats} className="px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200">
                          Sauvegarder les stats
                        </button>
                      </>
                    )}
                  </div>
                  {/* Bloc CTA About */}
                  <div id="about-cta-section" className="mb-10 scroll-mt-24">
                    <h3 className="text-xl font-bold text-gold mb-4">Bloc Call to Action</h3>
                    {loadingCta ? (
                      <div className="text-gray-400">Chargement...</div>
                    ) : (
                      <form onSubmit={saveAboutCta} className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
                          <input
                            type="text"
                            value={ctaTitle}
                            onChange={e => setCtaTitle(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                            placeholder="Titre du bloc"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Taille du titre (ex: 2rem, 2.5rem, 48px...)</label>
                          <input
                            type="text"
                            value={ctaTitleSize}
                            onChange={e => setCtaTitleSize(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                            placeholder="2rem"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                          <textarea
                            value={ctaDesc}
                            onChange={e => setCtaDesc(e.target.value)}
                            rows={2}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                            placeholder="Description du bloc"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Texte du bouton</label>
                          <input
                            type="text"
                            value={ctaBtn}
                            onChange={e => setCtaBtn(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                            placeholder="Texte du bouton"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Lien du bouton</label>
                          <input
                            type="url"
                            value={ctaBtnLink}
                            onChange={e => setCtaBtnLink(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Couleur du bouton</label>
                          <input
                            type="color"
                            value={ctaBtnColor}
                            onChange={e => setCtaBtnColor(e.target.value)}
                            className="w-16 h-10 p-0 border-0 bg-transparent"
                          />
                          <span className="ml-4 text-gray-300">{ctaBtnColor}</span>
                        </div>
                        <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">Sauvegarder</button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Section Contact</h2>
                  <form onSubmit={saveContentSettings} className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Texte de contact</label>
                      <textarea
                        name="contact_text"
                        value={contentSettings.contact_text}
                        onChange={handleContentChange}
                        rows={3}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-3"
                        placeholder="Message d'accueil ou informations complémentaires pour la page contact."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Lien bio (ex : Linktree, site perso...)</label>
                      <input
                        type="url"
                        name="bio_link"
                        value={contentSettings.bio_link}
                        onChange={handleContentChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-3"
                        placeholder="https://votre-lien-bio.com"
                      />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">Sauvegarder</button>
                  </form>
                  <form onSubmit={saveContactInfos} className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={e => setContactPhone(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-3"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-3"
                        placeholder="contact@votre-site.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
                      <input
                        type="text"
                        value={contactAddress}
                        onChange={e => setContactAddress(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-3"
                        placeholder="Paris, France"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp (lien complet)</label>
                      <input
                        type="url"
                        value={contactWhatsapp}
                        onChange={e => setContactWhatsapp(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-3"
                        placeholder="https://wa.me/33612345678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Instagram (lien complet)</label>
                      <input
                        type="url"
                        value={contactInstagram}
                        onChange={e => setContactInstagram(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-3"
                        placeholder="https://instagram.com/votreprofil"
                      />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">Sauvegarder les infos contact</button>
                  </form>
                  {/* Liens dynamiques */}
                  <div className="mb-10">
                    <h3 className="text-xl font-bold text-gold mb-4">Liens de contact dynamiques</h3>
                    <form onSubmit={addOrEditLink} className="flex flex-col md:flex-row gap-4 mb-4">
                      <input
                        type="text"
                        name="name"
                        value={linkForm.name}
                        onChange={handleLinkFormChange}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg text-white p-3"
                        placeholder="Nom du canal (WhatsApp, Telegram, etc.)"
                        required
                      />
                      <input
                        type="url"
                        name="url"
                        value={linkForm.url}
                        onChange={handleLinkFormChange}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg text-white p-3"
                        placeholder="Lien complet (https://...)"
                        required
                      />
                      <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">
                        {editingLinkIndex !== null ? 'Modifier' : 'Ajouter'}
                      </button>
                      {editingLinkIndex !== null && (
                        <button type="button" onClick={() => { setEditingLinkIndex(null); setLinkForm({ name: '', url: '' }); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg">Annuler</button>
                      )}
                    </form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contactLinks.map((link, idx) => (
                        <div key={link.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between shadow-lg">
                          <div>
                            <span className="font-semibold text-gold mr-2">{link.name}</span>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline break-all">{link.url}</a>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => editLink(idx)} className="px-2 py-1 bg-gold text-black rounded">Modifier</button>
                            <button onClick={() => deleteLink(idx)} className="px-2 py-1 bg-red-600 text-white rounded">Supprimer</button>
                            <button onClick={() => moveLink(idx, -1)} disabled={idx === 0} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↑</button>
                            <button onClick={() => moveLink(idx, 1)} disabled={idx === contactLinks.length - 1} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↓</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={saveContactLinks} className="mt-4 px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200">Sauvegarder les liens</button>
                  </div>
                </div>
              )}

              {activeTab === 'hero' && (
                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Section Hero</h2>
                  {/* Titre et sous-titre Hero */}
                  <form onSubmit={saveHeroTitleSubtitle} className="space-y-4 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Titre du Hero</label>
                      <input
                        type="text"
                        value={heroTitle}
                        onChange={e => setHeroTitle(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                        placeholder="Titre principal du Hero"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Sous-titre du Hero</label>
                      <input
                        type="text"
                        value={heroSubtitle}
                        onChange={e => setHeroSubtitle(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                        placeholder="Sous-titre du Hero"
                      />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">Sauvegarder</button>
                  </form>
                  {/* Slides Hero (déjà présent) */}
                  <h2 className="text-2xl font-bold text-white mb-4">Slides du Hero</h2>
                  {/* loadingHero && !heroInit ? ( // loadingHero is no longer used
                    <div className="text-gray-400">Chargement...</div>
                  ) : ( */}
                  <>
                    <form onSubmit={addOrEditSlide} className="space-y-4 mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Image (URL)</label>
                          <input
                            type="url"
                            name="image"
                            value={slideForm.image}
                            onChange={handleSlideFormChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
                          <input
                            type="text"
                            name="title"
                            value={slideForm.title}
                            onChange={handleSlideFormChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                            placeholder="Titre de la slide"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Sous-titre</label>
                          <input
                            type="text"
                            name="subtitle"
                            value={slideForm.subtitle}
                            onChange={handleSlideFormChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                            placeholder="Sous-titre de la slide"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">
                          {editingIndex !== null ? 'Modifier la slide' : 'Ajouter la slide'}
                        </button>
                        {editingIndex !== null && (
                          <button type="button" onClick={() => { setEditingIndex(null); setSlideForm({ image: '', title: '', subtitle: '' }); }} className="px-4 py-2 bg-gray-700 text-white rounded-lg">Annuler</button>
                        )}
                      </div>
                    </form>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {heroSlidesList.map((slide, idx) => (
                        <div key={idx} className="bg-gray-800 rounded-lg p-4 flex flex-col items-center relative shadow-lg">
                          <img src={slide.image || 'https://via.placeholder.com/400x250?text=Image'} alt="slide" className="w-full h-40 object-cover rounded mb-3" />
                          <h4 className="text-lg font-bold text-gold mb-1">{slide.title}</h4>
                          <p className="text-gray-300 mb-2">{slide.subtitle}</p>
                          <div className="flex gap-2 mt-auto">
                            <button onClick={() => editSlide(idx)} className="px-2 py-1 bg-gold text-black rounded">Modifier</button>
                            <button onClick={() => deleteSlide(idx)} className="px-2 py-1 bg-red-600 text-white rounded">Supprimer</button>
                          </div>
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↑</button>
                            <button onClick={() => moveSlide(idx, 1)} disabled={idx === heroSlidesList.length - 1} className="text-xs px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-30">↓</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={saveHeroSlides} className="px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200">
                      Sauvegarder les slides
                    </button>
                  </>
                  {/* )} */}
                  <form onSubmit={saveHeroShowSocials} className="flex items-center gap-4 mb-8">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={heroShowSocials}
                        onChange={e => setHeroShowSocials(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-gold"
                      />
                      <span className="ml-2 text-gray-200">Afficher les icônes réseaux sociaux sous la description</span>
                    </label>
                    <button type="submit" className="px-4 py-2 bg-gold text-black rounded-lg font-semibold">Sauvegarder</button>
                  </form>
                </div>
              )}

              {activeTab === 'photos' && (
                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Section Featured Photos</h2>
                  {loadingFeatured ? (
                    <div className="text-gray-400">Chargement...</div>
                  ) : (
                    <form onSubmit={saveFeaturedSettings} className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
                        <input
                          type="text"
                          value={featuredTitle}
                          onChange={e => setFeaturedTitle(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                          placeholder="Titre de la section"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Couleur du titre</label>
                        <input
                          type="color"
                          value={featuredTitleColor}
                          onChange={e => setFeaturedTitleColor(e.target.value)}
                          className="w-16 h-10 p-0 border-0 bg-transparent"
                        />
                        <span className="ml-4 text-gray-300">{featuredTitleColor}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Taille du titre (ex: 3rem, 2.5rem, 48px...)</label>
                        <input
                          type="text"
                          value={featuredTitleSize}
                          onChange={e => setFeaturedTitleSize(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                          placeholder="3rem"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                          value={featuredDesc}
                          onChange={e => setFeaturedDesc(e.target.value)}
                          rows={2}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                          placeholder="Description de la section"
                        />
                      </div>
                      <button type="submit" className="px-6 py-2 bg-gold text-black rounded-lg font-semibold">Sauvegarder</button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;