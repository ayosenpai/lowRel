'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
    ArrowDown,
    ArrowUp,
    Bookmark,
    ChevronDown,
    ExternalLink,
    Eye,
    EyeOff,
    GripVertical,
    Monitor,
    Plus,
    RotateCcw,
    Save,
    Smartphone,
    Tablet,
    Trash2,
} from 'lucide-react';
import {
    deleteHomepageLayout,
    saveHomepageDraft,
    saveHomepageLayout,
    saveHomepageSections,
} from '@/lib/actions/homepage';
import {
    HOMEPAGE_SECTION_TYPES,
    SECTION_DEFINITIONS,
    createHomepageSection,
    defaultHomepageSections,
    type HomepageLayoutRecord,
    type HomepageSection,
    type HomepageSectionConfig,
    type HomepageSectionType,
} from '@/lib/homepage-sections';

export interface HomepageProductOption {
    id: string;
    name: string;
    category: string | null;
    image: string | null;
}

interface HomepageEditorProps {
    initialSections: HomepageSection[];
    initialLayouts: HomepageLayoutRecord[];
    products: HomepageProductOption[];
    categories: string[];
}

const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-[#0F172A] outline-none transition-colors focus:border-[#d8a4bc] focus:ring-1 focus:ring-[#d8a4bc]';

const PREVIEW_DEVICES = [
    { id: 'desktop', label: 'Desktop', icon: Monitor, maxWidth: '100%' },
    { id: 'tablet', label: 'Tablet', icon: Tablet, maxWidth: '820px' },
    { id: 'mobile', label: 'Mobile', icon: Smartphone, maxWidth: '390px' },
] as const;

function Field({
    label,
    hint,
    children,
    className = '',
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <label className={`block space-y-1.5 ${className}`}>
            <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">
                {label}
            </span>
            {children}
            {hint && <span className="block text-[10px] leading-relaxed text-gray-400">{hint}</span>}
        </label>
    );
}

function categoryOptions(categories: string[], current?: string) {
    const values = [...categories];
    if (current && !values.includes(current)) values.unshift(current);
    return values;
}

export default function HomepageEditor({
    initialSections,
    initialLayouts,
    products,
    categories,
}: HomepageEditorProps) {
    const [sections, setSections] = useState<HomepageSection[]>(initialSections);
    const [expandedId, setExpandedId] = useState<string | null>(initialSections[0]?.id ?? null);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

    // Draft preview: autosaved to an unpublished row, never to the live layout.
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [previewVersion, setPreviewVersion] = useState(0);
    const [draftState, setDraftState] = useState<'saved' | 'saving' | 'error'>('saved');
    const lastDraftRef = useRef('');

    // Named layout slots.
    const [layouts, setLayouts] = useState<HomepageLayoutRecord[]>(initialLayouts);
    const [slotName, setSlotName] = useState('');
    const [slotBusy, setSlotBusy] = useState(false);

    useEffect(() => {
        const payload = JSON.stringify(sections);
        if (payload === lastDraftRef.current) return;

        setDraftState('saving');
        const timer = setTimeout(async () => {
            try {
                await saveHomepageDraft(sections);
                lastDraftRef.current = payload;
                setPreviewVersion((version) => version + 1);
                setDraftState('saved');
            } catch {
                setDraftState('error');
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [sections]);

    const visibleCount = useMemo(
        () => sections.filter((section) => section.isVisible).length,
        [sections]
    );

    const mutate = (updater: (current: HomepageSection[]) => HomepageSection[]) => {
        setSections((current) => updater(current));
        setDirty(true);
        setStatus(null);
    };

    const addSection = (type: HomepageSectionType) => {
        const section = createHomepageSection(type);
        mutate((current) => [...current, section]);
        setExpandedId(section.id);
    };

    const removeSection = (id: string) => {
        const section = sections.find((entry) => entry.id === id);
        if (!section) return;
        if (!window.confirm(`Remove the "${SECTION_DEFINITIONS[section.type].label}" section?`)) return;
        mutate((current) => current.filter((entry) => entry.id !== id));
        if (expandedId === id) setExpandedId(null);
    };

    const moveSection = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= sections.length) return;
        mutate((current) => {
            const next = [...current];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const updateSection = (id: string, patch: Partial<HomepageSection>) => {
        mutate((current) =>
            current.map((section) => (section.id === id ? { ...section, ...patch } : section))
        );
    };

    const updateConfig = (id: string, patch: HomepageSectionConfig) => {
        mutate((current) =>
            current.map((section) =>
                section.id === id
                    ? { ...section, config: { ...section.config, ...patch } }
                    : section
            )
        );
    };

    const toggleProduct = (section: HomepageSection, productId: string) => {
        const ids = section.config.productIds ?? [];
        const next = ids.includes(productId)
            ? ids.filter((id) => id !== productId)
            : [...ids, productId];
        updateConfig(section.id, { productIds: next });
    };

    const updateTile = (section: HomepageSection, index: number, patch: Record<string, string>) => {
        const items = [...(section.config.items ?? [])];
        items[index] = { ...items[index], ...patch };
        updateConfig(section.id, { items });
    };

    const addTile = (section: HomepageSection) => {
        const items = [...(section.config.items ?? []), { title: 'New tile', href: '/collections/all', image: '' }];
        updateConfig(section.id, { items });
    };

    const removeTile = (section: HomepageSection, index: number) => {
        const items = (section.config.items ?? []).filter((_, i) => i !== index);
        updateConfig(section.id, { items });
    };

    const resetToDefault = () => {
        if (!window.confirm('Replace the current layout with the default homepage layout? You still need to save.')) {
            return;
        }
        setSections(defaultHomepageSections());
        setExpandedId(null);
        setDirty(true);
        setStatus(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            const result = await saveHomepageSections(sections);
            setSections(result.sections);
            setDirty(false);
            setStatus({ kind: 'success', text: 'Published. The live homepage now uses this layout.' });
        } catch (error) {
            setStatus({
                kind: 'error',
                text: error instanceof Error ? error.message : 'Could not save the homepage layout.',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSlot = async () => {
        const name = slotName.trim();
        if (!name) {
            setStatus({ kind: 'error', text: 'Give the layout slot a name first.' });
            return;
        }

        setSlotBusy(true);
        try {
            const result = await saveHomepageLayout(name, sections);
            setLayouts(result.layouts);
            const saved = result.layouts.find((layout) => layout.id === result.savedId);
            setSlotName('');
            setStatus({
                kind: 'success',
                text: `Saved "${saved?.name ?? name}" (${saved?.sectionCount ?? sections.length} sections). Still unpublished.`,
            });
        } catch (error) {
            setStatus({
                kind: 'error',
                text: error instanceof Error ? error.message : 'Could not save the layout slot.',
            });
        } finally {
            setSlotBusy(false);
        }
    };

    const handleLoadSlot = (layout: HomepageLayoutRecord) => {
        if (
            dirty &&
            !window.confirm(`Load "${layout.name}"? Your unpublished edits will be replaced.`)
        ) {
            return;
        }

        setSections(JSON.parse(JSON.stringify(layout.sections)) as HomepageSection[]);
        setExpandedId(null);
        setDirty(true);
        setPreviewOpen(true);
        setStatus({
            kind: 'success',
            text: `Loaded "${layout.name}" into the editor. Publish to make it live.`,
        });
    };

    const handleDeleteSlot = async (layout: HomepageLayoutRecord) => {
        if (
            !window.confirm(
                `Delete the saved layout "${layout.name}"? This does not affect the live homepage.`
            )
        ) {
            return;
        }

        setSlotBusy(true);
        try {
            const result = await deleteHomepageLayout(layout.id);
            setLayouts(result.layouts);
            setStatus({ kind: 'success', text: `Deleted "${layout.name}".` });
        } catch (error) {
            setStatus({
                kind: 'error',
                text: error instanceof Error ? error.message : 'Could not delete the layout slot.',
            });
        } finally {
            setSlotBusy(false);
        }
    };

    return (
        <div className="space-y-8 pb-24">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                    <p className="lr-kicker">Storefront</p>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-[#0F172A]">
                        Homepage Layout
                    </h1>
                    <p className="max-w-2xl text-[11px] font-medium leading-relaxed text-gray-500">
                        Stack sections in any order, choose what each one shows, and control the links
                        customers land on. Changes are published with one save.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-[#0F172A] transition-colors hover:border-black"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View site
                    </Link>
                    <button
                        type="button"
                        onClick={() => setPreviewOpen((open) => !open)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-[9px] font-black uppercase tracking-[0.16em] transition-colors ${
                            previewOpen
                                ? 'border-[#d8a4bc] bg-[#d8a4bc]/15 text-[#0F172A]'
                                : 'border-gray-200 bg-white text-[#0F172A] hover:border-black'
                        }`}
                    >
                        <Eye className="h-3.5 w-3.5" />
                        {previewOpen ? 'Hide preview' : 'Preview'}
                    </button>
                    <button
                        type="button"
                        onClick={resetToDefault}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-gray-500 transition-colors hover:border-black hover:text-black"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-[#d8a4bc] shadow-lg transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-3.5 w-3.5" />
                        {saving ? 'Publishing…' : dirty ? 'Save & Publish' : 'Saved'}
                    </button>
                </div>
            </div>

            {status && (
                <div
                    className={`rounded-xl border px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] ${
                        status.kind === 'success'
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                >
                    {status.text}
                </div>
            )}

            {previewOpen && (
                <div className="admin-card rounded-2xl p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-tight text-[#0F172A]">
                                Draft preview
                            </h2>
                            <p
                                className={`mt-1 text-[10px] font-medium leading-relaxed ${
                                    draftState === 'error' ? 'text-red-500' : 'text-gray-400'
                                }`}
                            >
                                {draftState === 'saving'
                                    ? 'Saving draft…'
                                    : draftState === 'error'
                                      ? 'Draft autosave failed — the preview may be out of date.'
                                      : 'Unsaved edits, shown live. The public homepage stays exactly as it is until you publish.'}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5">
                                {PREVIEW_DEVICES.map((device) => {
                                    const DeviceIcon = device.icon;
                                    return (
                                        <button
                                            key={device.id}
                                            type="button"
                                            title={device.label}
                                            onClick={() => setPreviewDevice(device.id)}
                                            className={`rounded-md p-2 transition-colors ${
                                                previewDevice === device.id
                                                    ? 'bg-[#0F172A] text-[#d8a4bc]'
                                                    : 'text-gray-400 hover:text-black'
                                            }`}
                                        >
                                            <DeviceIcon className="h-4 w-4" />
                                        </button>
                                    );
                                })}
                            </div>
                            <a
                                href="/preview/homepage"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-[#0F172A] transition-colors hover:border-black"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Full screen
                            </a>
                        </div>
                    </div>

                    <div
                        className="mx-auto mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white"
                        style={{ maxWidth: PREVIEW_DEVICES.find((d) => d.id === previewDevice)?.maxWidth }}
                    >
                        <iframe
                            key={previewVersion}
                            src="/preview/homepage"
                            title="Homepage draft preview"
                            className="h-[70vh] w-full"
                        />
                    </div>
                </div>
            )}

            <div className="admin-card rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#d8a4bc]/15">
                        <Bookmark className="h-4 w-4 text-[#b9849f]" />
                    </span>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-tight text-[#0F172A]">
                            Layout slots
                        </h2>
                        <p className="mt-1 text-[10px] font-medium leading-relaxed text-gray-400">
                            Save the current editor state under a name and load it later. Slots never
                            change the live site until you publish. Reusing a name overwrites that slot.
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input
                        className={inputClass}
                        value={slotName}
                        onChange={(event) => setSlotName(event.target.value)}
                        placeholder='e.g. "Drop week 1"'
                        maxLength={80}
                    />
                    <button
                        type="button"
                        onClick={handleSaveSlot}
                        disabled={slotBusy}
                        className="flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-[#d8a4bc] transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-3.5 w-3.5" />
                        {slotBusy ? 'Saving…' : 'Save slot'}
                    </button>
                </div>

                {layouts.length === 0 ? (
                    <p className="mt-4 rounded-lg border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gray-300">
                        No saved slots yet
                    </p>
                ) : (
                    <ul className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                        {layouts.map((layout) => (
                            <li
                                key={layout.id}
                                className="flex items-center justify-between gap-3 px-4 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-[#0F172A]">
                                        {layout.name}
                                    </p>
                                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                        {layout.sectionCount} sections · {layout.updatedAt.slice(0, 10)}
                                    </p>
                                </div>
                                <div className="flex flex-shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleLoadSlot(layout)}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-gray-600 transition-colors hover:border-black hover:text-black"
                                    >
                                        Load
                                    </button>
                                    <button
                                        type="button"
                                        title="Delete slot"
                                        onClick={() => handleDeleteSlot(layout)}
                                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="admin-card rounded-2xl p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-tight text-[#0F172A]">
                            Add a section
                        </h2>
                        <p className="mt-1 text-[10px] font-medium text-gray-400">
                            Sections appear in the order below. {visibleCount} of {sections.length} visible.
                        </p>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
                    {HOMEPAGE_SECTION_TYPES.map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => addSection(type)}
                            className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-3 py-3 text-left text-[9px] font-black uppercase tracking-[0.12em] text-gray-600 transition-colors hover:border-[#d8a4bc] hover:bg-[#d8a4bc]/10 hover:text-black"
                        >
                            <Plus className="h-3.5 w-3.5 flex-shrink-0" />
                            {SECTION_DEFINITIONS[type].label}
                        </button>
                    ))}
                </div>
            </div>

            {sections.length === 0 ? (
                <div className="admin-card rounded-2xl p-12 text-center">
                    <p className="text-sm font-black uppercase tracking-widest text-gray-400">
                        No sections yet
                    </p>
                    <p className="mt-2 text-[11px] text-gray-400">
                        Add a section above, then save to publish it.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sections.map((section, index) => {
                        const definition = SECTION_DEFINITIONS[section.type];
                        const isExpanded = expandedId === section.id;

                        return (
                            <div
                                key={section.id}
                                className={`admin-card overflow-hidden rounded-2xl ${
                                    section.isVisible ? '' : 'opacity-60'
                                }`}
                            >
                                <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:p-5">
                                    <div className="flex min-w-0 items-center gap-4">
                                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#0F172A] text-[10px] font-black text-[#d8a4bc]">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <GripVertical className="hidden h-4 w-4 flex-shrink-0 text-gray-300 md:block" />
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0F172A]">
                                                    {definition.label}
                                                </p>
                                                {!section.isVisible && (
                                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-gray-400">
                                                        Hidden
                                                    </span>
                                                )}
                                                {section.config.source === 'manual' && (
                                                    <span className="rounded-full bg-[#d8a4bc]/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#b9849f]">
                                                        Manual
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 truncate text-[11px] font-medium text-gray-400">
                                                {section.title || definition.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-shrink-0 items-center gap-1 self-end md:self-auto">
                                        <button
                                            type="button"
                                            title="Move up"
                                            disabled={index === 0}
                                            onClick={() => moveSection(index, -1)}
                                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            title="Move down"
                                            disabled={index === sections.length - 1}
                                            onClick={() => moveSection(index, 1)}
                                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            title={section.isVisible ? 'Hide section' : 'Show section'}
                                            onClick={() =>
                                                updateSection(section.id, { isVisible: !section.isVisible })
                                            }
                                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
                                        >
                                            {section.isVisible ? (
                                                <Eye className="h-4 w-4" />
                                            ) : (
                                                <EyeOff className="h-4 w-4" />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            title="Edit section"
                                            onClick={() =>
                                                setExpandedId(isExpanded ? null : section.id)
                                            }
                                            className={`rounded-lg p-2 transition-colors hover:bg-gray-100 hover:text-black ${
                                                isExpanded ? 'bg-[#d8a4bc]/20 text-black' : 'text-gray-400'
                                            }`}
                                        >
                                            <ChevronDown
                                                className={`h-4 w-4 transition-transform ${
                                                    isExpanded ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            title="Remove section"
                                            onClick={() => removeSection(section.id)}
                                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="space-y-5 border-t border-gray-100 bg-gray-50/40 p-4 md:p-6">
                                        {section.type !== 'hero' && section.type !== 'category-grid' && (
                                            <Field
                                                label="Section heading"
                                                hint="Leave blank to show the products without a heading."
                                            >
                                                <input
                                                    className={inputClass}
                                                    value={section.title}
                                                    onChange={(event) =>
                                                        updateSection(section.id, {
                                                            title: event.target.value,
                                                        })
                                                    }
                                                    placeholder="e.g. New Arrivals"
                                                />
                                            </Field>
                                        )}

                                        {section.type === 'hero' && (
                                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                <Field label="Media">
                                                    <select
                                                        className={inputClass}
                                                        value={section.config.mediaType ?? 'video'}
                                                        onChange={(event) =>
                                                            updateConfig(section.id, {
                                                                mediaType: event.target
                                                                    .value as 'video' | 'image',
                                                            })
                                                        }
                                                    >
                                                        <option value="video">Video</option>
                                                        <option value="image">Image</option>
                                                    </select>
                                                </Field>
                                                <Field label="Height">
                                                    <select
                                                        className={inputClass}
                                                        value={section.config.height ?? 'screen'}
                                                        onChange={(event) =>
                                                            updateConfig(section.id, {
                                                                height: event.target.value as
                                                                    | 'screen'
                                                                    | 'large'
                                                                    | 'medium',
                                                            })
                                                        }
                                                    >
                                                        <option value="screen">Full screen</option>
                                                        <option value="large">Large</option>
                                                        <option value="medium">Medium</option>
                                                    </select>
                                                </Field>

                                                {(section.config.mediaType ?? 'video') === 'video' ? (
                                                    <>
                                                        <Field label="MP4 URL">
                                                            <input
                                                                className={inputClass}
                                                                value={section.config.videoUrl ?? ''}
                                                                onChange={(event) =>
                                                                    updateConfig(section.id, {
                                                                        videoUrl: event.target.value,
                                                                    })
                                                                }
                                                                placeholder="/hero/hero.mp4"
                                                            />
                                                        </Field>
                                                        <Field label="WebM fallback (optional)">
                                                            <input
                                                                className={inputClass}
                                                                value={section.config.videoWebmUrl ?? ''}
                                                                onChange={(event) =>
                                                                    updateConfig(section.id, {
                                                                        videoWebmUrl: event.target.value,
                                                                    })
                                                                }
                                                                placeholder="/hero/hero.webm"
                                                            />
                                                        </Field>
                                                    </>
                                                ) : (
                                                    <Field label="Image URL">
                                                        <input
                                                            className={inputClass}
                                                            value={section.config.imageUrl ?? ''}
                                                            onChange={(event) =>
                                                                updateConfig(section.id, {
                                                                    imageUrl: event.target.value,
                                                                })
                                                            }
                                                            placeholder="https://…"
                                                        />
                                                    </Field>
                                                )}

                                                <Field label="Headline (optional)">
                                                    <input
                                                        className={inputClass}
                                                        value={section.config.headline ?? ''}
                                                        onChange={(event) =>
                                                            updateConfig(section.id, {
                                                                headline: event.target.value,
                                                            })
                                                        }
                                                        placeholder="The accessories drop"
                                                    />
                                                </Field>
                                                <Field label="Subheadline (optional)">
                                                    <input
                                                        className={inputClass}
                                                        value={section.config.subheadline ?? ''}
                                                        onChange={(event) =>
                                                            updateConfig(section.id, {
                                                                subheadline: event.target.value,
                                                            })
                                                        }
                                                        placeholder="Small text under the headline"
                                                    />
                                                </Field>
                                                <Field label="Button label (optional)">
                                                    <input
                                                        className={inputClass}
                                                        value={section.config.ctaLabel ?? ''}
                                                        onChange={(event) =>
                                                            updateConfig(section.id, {
                                                                ctaLabel: event.target.value,
                                                            })
                                                        }
                                                        placeholder="Shop now"
                                                    />
                                                </Field>
                                                <Field label="Button link">
                                                    <input
                                                        className={inputClass}
                                                        value={section.config.ctaHref ?? ''}
                                                        onChange={(event) =>
                                                            updateConfig(section.id, {
                                                                ctaHref: event.target.value,
                                                            })
                                                        }
                                                        placeholder="/collections/accessories"
                                                    />
                                                </Field>
                                            </div>
                                        )}

                                        {section.type === 'category-grid' && (
                                            <div className="space-y-5">
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <Field label="Columns">
                                                        <select
                                                            className={inputClass}
                                                            value={section.config.columns ?? 2}
                                                            onChange={(event) =>
                                                                updateConfig(section.id, {
                                                                    columns: Number(event.target.value),
                                                                })
                                                            }
                                                        >
                                                            <option value={2}>2 columns</option>
                                                            <option value={3}>3 columns</option>
                                                            <option value={4}>4 columns</option>
                                                        </select>
                                                    </Field>
                                                    <Field
                                                        label="Fallback image pool"
                                                        hint="Tiles without an image URL pull from this category."
                                                    >
                                                        <select
                                                            className={inputClass}
                                                            value={section.config.poolCategory ?? 'Tops'}
                                                            onChange={(event) =>
                                                                updateConfig(section.id, {
                                                                    poolCategory: event.target.value,
                                                                })
                                                            }
                                                        >
                                                            {categoryOptions(
                                                                categories,
                                                                section.config.poolCategory
                                                            ).map((category) => (
                                                                <option key={category} value={category}>
                                                                    {category}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </Field>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">
                                                            Tiles
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() => addTile(section)}
                                                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[8px] font-black uppercase tracking-[0.14em] text-gray-600 hover:border-black hover:text-black"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add tile
                                                        </button>
                                                    </div>

                                                    {(section.config.items ?? []).length === 0 && (
                                                        <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gray-300">
                                                            No tiles — this section will be hidden.
                                                        </p>
                                                    )}

                                                    {(section.config.items ?? []).map((item, itemIndex) => (
                                                        <div
                                                            key={itemIndex}
                                                            className="grid gap-2 rounded-xl border border-gray-200 bg-white p-3 md:grid-cols-[1fr_1fr_1fr_auto]"
                                                        >
                                                            <input
                                                                className={inputClass}
                                                                value={item.title}
                                                                onChange={(event) =>
                                                                    updateTile(section, itemIndex, {
                                                                        title: event.target.value,
                                                                    })
                                                                }
                                                                placeholder="Tile label"
                                                            />
                                                            <input
                                                                className={inputClass}
                                                                value={item.href}
                                                                onChange={(event) =>
                                                                    updateTile(section, itemIndex, {
                                                                        href: event.target.value,
                                                                    })
                                                                }
                                                                placeholder="/collections/tops"
                                                            />
                                                            <input
                                                                className={inputClass}
                                                                value={item.image ?? ''}
                                                                onChange={(event) =>
                                                                    updateTile(section, itemIndex, {
                                                                        image: event.target.value,
                                                                    })
                                                                }
                                                                placeholder="Image URL (optional)"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTile(section, itemIndex)}
                                                                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                                                title="Remove tile"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {(section.type === 'product-grid' ||
                                            section.type === 'product-carousel' ||
                                            section.type === 'product-strip') && (
                                            <div className="space-y-5">
                                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                                    <Field label="What to show">
                                                        <select
                                                            className={inputClass}
                                                            value={section.config.source ?? 'category'}
                                                            onChange={(event) =>
                                                                updateConfig(section.id, {
                                                                    source: event.target
                                                                        .value as HomepageSectionConfig['source'],
                                                                })
                                                            }
                                                        >
                                                            <option value="category">One category</option>
                                                            <option value="all">All products</option>
                                                            <option value="new">New arrivals</option>
                                                            <option value="sale">Sale items</option>
                                                            <option value="manual">Pick products</option>
                                                        </select>
                                                    </Field>

                                                    {section.config.source === 'category' && (
                                                        <Field label="Category">
                                                            <select
                                                                className={inputClass}
                                                                value={section.config.category ?? 'Tops'}
                                                                onChange={(event) =>
                                                                    updateConfig(section.id, {
                                                                        category: event.target.value,
                                                                    })
                                                                }
                                                            >
                                                                {categoryOptions(
                                                                    categories,
                                                                    section.config.category
                                                                ).map((category) => (
                                                                    <option key={category} value={category}>
                                                                        {category}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </Field>
                                                    )}

                                                    <Field label="Maximum products">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={48}
                                                            className={inputClass}
                                                            value={section.config.limit ?? 9}
                                                            onChange={(event) =>
                                                                updateConfig(section.id, {
                                                                    limit: Number(event.target.value) || 1,
                                                                })
                                                            }
                                                        />
                                                    </Field>

                                                    {section.type === 'product-grid' && (
                                                        <Field label="Grid columns">
                                                            <select
                                                                className={inputClass}
                                                                value={section.config.columns ?? 3}
                                                                onChange={(event) =>
                                                                    updateConfig(section.id, {
                                                                        columns: Number(event.target.value),
                                                                    })
                                                                }
                                                            >
                                                                <option value={2}>2 columns</option>
                                                                <option value={3}>3 columns</option>
                                                                <option value={4}>4 columns</option>
                                                                <option value={5}>5 columns</option>
                                                            </select>
                                                        </Field>
                                                    )}

                                                    {section.type === 'product-carousel' && (
                                                        <Field label="Cards per view">
                                                            <select
                                                                className={inputClass}
                                                                value={section.config.itemsPerView ?? 4}
                                                                onChange={(event) =>
                                                                    updateConfig(section.id, {
                                                                        itemsPerView: Number(
                                                                            event.target.value
                                                                        ),
                                                                    })
                                                                }
                                                            >
                                                                <option value={2}>2 (large)</option>
                                                                <option value={3}>3</option>
                                                                <option value={4}>4</option>
                                                                <option value={5}>5 (small)</option>
                                                            </select>
                                                        </Field>
                                                    )}
                                                </div>

                                                {section.config.source === 'manual' && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">
                                                                Products ({section.config.productIds?.length ?? 0} selected)
                                                            </p>
                                                            {(section.config.productIds?.length ?? 0) > 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        updateConfig(section.id, {
                                                                            productIds: [],
                                                                        })
                                                                    }
                                                                    className="text-[8px] font-black uppercase tracking-[0.12em] text-gray-400 hover:text-red-600"
                                                                >
                                                                    Clear all
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="grid max-h-64 gap-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 md:grid-cols-2">
                                                            {products.map((product) => {
                                                                const checked = (
                                                                    section.config.productIds ?? []
                                                                ).includes(product.id);
                                                                return (
                                                                    <label
                                                                        key={product.id}
                                                                        className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                                                                            checked
                                                                                ? 'bg-[#d8a4bc]/15 text-black'
                                                                                : 'text-gray-500 hover:bg-gray-50'
                                                                        }`}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={checked}
                                                                            onChange={() =>
                                                                                toggleProduct(
                                                                                    section,
                                                                                    product.id
                                                                                )
                                                                            }
                                                                            className="h-3.5 w-3.5 accent-[#0F172A]"
                                                                        />
                                                                        <span className="min-w-0 flex-1 truncate">
                                                                            {product.name}
                                                                        </span>
                                                                        <span className="flex-shrink-0 text-[8px] text-gray-400">
                                                                            {product.category}
                                                                        </span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                        <p className="text-[10px] text-gray-400">
                                                            Selection order is preserved on the storefront.
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="grid gap-4 border-t border-gray-200 pt-4 md:grid-cols-2">
                                                    <Field
                                                        label="View-all label (optional)"
                                                        hint="Shown beside the section heading."
                                                    >
                                                        <input
                                                            className={inputClass}
                                                            value={section.config.ctaLabel ?? ''}
                                                            onChange={(event) =>
                                                                updateConfig(section.id, {
                                                                    ctaLabel: event.target.value,
                                                                })
                                                            }
                                                            placeholder="View all"
                                                        />
                                                    </Field>
                                                    <Field label="View-all link">
                                                        <input
                                                            className={inputClass}
                                                            value={section.config.ctaHref ?? ''}
                                                            onChange={(event) =>
                                                                updateConfig(section.id, {
                                                                    ctaHref: event.target.value,
                                                                })
                                                            }
                                                            placeholder="/collections/tops"
                                                        />
                                                    </Field>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="flex flex-col gap-3 rounded-2xl border border-[#d8a4bc]/40 bg-[#d8a4bc]/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b9849f]">
                    {dirty ? 'You have unpublished changes.' : 'Everything is published.'}
                </p>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-6 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-[#d8a4bc] transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? 'Publishing…' : 'Save & Publish'}
                </button>
            </div>
        </div>
    );
}
