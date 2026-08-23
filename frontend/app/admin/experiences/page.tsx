'use client';

import React, { useState } from 'react';
import { ClockIcon, MailIcon, MountainIcon, PencilIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useHotel } from '../_lib/contexts/HotelDataContext';
import { Modal } from '../_components/ui/Modal';
import { Field, inputClass } from '../_components/ui/Field';
import type { Experience, ExperienceCategory } from '../_lib/types/hotel';
import { IMAGES } from '../_lib/data/rooms';
import { moneyShort } from '../_lib/utils/format';

const categories: Array<ExperienceCategory | 'All'> = ['All', 'Rainforest', 'Adventure', 'River', 'Wellness'];
const difficulties: Experience['difficulty'][] = ['Easy', 'Moderate', 'Challenging'];

const emptyForm = {
  title: '',
  category: 'Rainforest' as ExperienceCategory,
  duration: '2 hrs',
  difficulty: 'Easy' as Experience['difficulty'],
  image: IMAGES.trek,
  summary: '',
  description: '',
  price: 30,
};

export default function AdminExperiences() {
  const { experiences, addExperience, updateExperience, deleteExperience } = useHotel();
  const [category, setCategory] = useState<ExperienceCategory | 'All'>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [editing, setEditing] = useState<Experience | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [viewing, setViewing] = useState<Experience | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const visible = experiences.filter((e) => category === 'All' || e.category === category);
  const active = experiences.filter((e) => e.active).length;
  const topCategory =
    experiences.length > 0
      ? [...experiences]
          .reduce<[ExperienceCategory, number][]>((acc, e) => {
            const found = acc.find(([c]) => c === e.category);
            if (found) found[1] += 1;
            else acc.push([e.category, 1]);
            return acc;
          }, [])
          .sort((a, b) => b[1] - a[1])[0][0]
      : '—';
  const avgDuration = experiences.length
    ? (experiences.reduce((s, e) => s + e.durationHours, 0) / experiences.length).toFixed(1)
    : '0';

  const validate = (f: typeof emptyForm) => {
    const next: { [k: string]: string } = {};
    if (f.title.trim().length < 3) next.title = 'Title is required.';
    if (!/\d/.test(f.duration)) next.duration = 'Include a number, e.g. “2.5 hrs”.';
    if (f.summary.trim().length < 10) next.summary = 'Write a short one-line summary.';
    if (f.description.trim().length < 30) next.description = 'Add at least 30 characters of description.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(form)) {
      toast.error('Check the highlighted fields.');
      return;
    }
    addExperience(form);
    setAddOpen(false);
    setForm(emptyForm);
    toast.success(`${form.title} published to the experiences catalog`);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!validate(editForm)) {
      toast.error('Check the highlighted fields.');
      return;
    }
    updateExperience(editing.id, editForm);
    toast.success(`${editForm.title} updated`);
    setEditing(null);
  };

  const openEdit = (exp: Experience) => {
    setEditing(exp);
    setEditForm({
      title: exp.title,
      category: exp.category,
      duration: exp.duration,
      difficulty: exp.difficulty,
      image: exp.image,
      summary: exp.summary,
      description: exp.description,
      price: exp.price,
    });
  };

  const formFields = (f: typeof emptyForm, set: (patch: Partial<typeof emptyForm>) => void, idPrefix: string) => (
    <>
      <Field label="Title" error={errors.title} htmlFor={`${idPrefix}-title`} className="sm:col-span-2">
        <input id={`${idPrefix}-title`} value={f.title} onChange={(e) => set({ title: e.target.value })} className={inputClass('dark', !!errors.title)} />
      </Field>
      <Field label="Category" htmlFor={`${idPrefix}-cat`}>
        <select id={`${idPrefix}-cat`} value={f.category} onChange={(e) => set({ category: e.target.value as ExperienceCategory })} className={inputClass()}>
          {categories.filter((c) => c !== 'All').map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="Duration" error={errors.duration} htmlFor={`${idPrefix}-dur`}>
        <input id={`${idPrefix}-dur`} value={f.duration} onChange={(e) => set({ duration: e.target.value })} placeholder="2.5 hrs" className={inputClass('dark', !!errors.duration)} />
      </Field>
      <Field label="Difficulty" htmlFor={`${idPrefix}-diff`}>
        <select id={`${idPrefix}-diff`} value={f.difficulty} onChange={(e) => set({ difficulty: e.target.value as Experience['difficulty'] })} className={inputClass()}>
          {difficulties.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Field>
      <Field label="Price per guest (USD)" htmlFor={`${idPrefix}-price`}>
        <input id={`${idPrefix}-price`} type="number" min={0} value={f.price} onChange={(e) => set({ price: Number(e.target.value) })} className={inputClass()} />
      </Field>
      <Field label="Image URL" htmlFor={`${idPrefix}-img`} className="sm:col-span-2">
        <input id={`${idPrefix}-img`} value={f.image} onChange={(e) => set({ image: e.target.value })} className={inputClass()} />
      </Field>
      <Field label="Summary" error={errors.summary} htmlFor={`${idPrefix}-sum`} className="sm:col-span-2">
        <input id={`${idPrefix}-sum`} value={f.summary} onChange={(e) => set({ summary: e.target.value })} className={inputClass('dark', !!errors.summary)} />
      </Field>
      <Field label="Description" error={errors.description} htmlFor={`${idPrefix}-desc`} className="sm:col-span-2">
        <textarea
          id={`${idPrefix}-desc`}
          rows={4}
          value={f.description}
          onChange={(e) => set({ description: e.target.value })}
          className={`${inputClass('dark', !!errors.description)} resize-none`}
        />

      </Field>
    </>
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-jungle-dark">Experiences catalog</h1>
          <p className="mt-1 text-sm text-jungle/60">Guided activities offered to in-house guests.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-jungle-dark px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle">

          <PlusIcon className="h-4 w-4" /> Add New Experience
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Active Experiences', String(active), 'text-jungle-dark'],
          ['Top Category', String(topCategory), 'text-emerald-700'],
          ['Avg Duration', `${avgDuration} hrs`, 'text-cyan-700'],
        ].map(([label, value, tone]) => (
          <div key={label} className="rounded-xl border border-sand bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-jungle/60">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
              category === c
                ? 'border-clay bg-clay/15 text-clay'
                : 'border-sand text-jungle/60 hover:border-sage hover:text-jungle'
            }`}>

            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((exp) => (
          <article key={exp.id} className="flex flex-col overflow-hidden rounded-xl border border-sand bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={exp.image} alt={exp.title} className="h-36 w-full object-cover" />
            <div className="flex flex-1 flex-col p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-clay">{exp.category}</p>
              <h2 className="mt-1 text-sm font-semibold text-jungle-dark">{exp.title}</h2>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-jungle/60">{exp.summary}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-jungle/60">
                <span className="flex items-center gap-1.5"><ClockIcon className="h-3.5 w-3.5" /> {exp.duration}</span>
                <span className="flex items-center gap-1.5"><MountainIcon className="h-3.5 w-3.5" /> {exp.difficulty}</span>
                <span className="font-semibold text-jungle">{moneyShort(exp.price)}</span>
              </div>
              <div className="mt-auto flex gap-2 border-t border-sand pt-4">
                <button
                  type="button"
                  onClick={() => openEdit(exp)}
                  className="flex items-center gap-1.5 rounded-md border border-sand px-2.5 py-1.5 text-[11px] font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

                  <PencilIcon className="h-3.5 w-3.5" /> Edit Experience
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewing(exp);
                    setConfirmDelete(false);
                  }}
                  className="rounded-md border border-sand px-2.5 py-1.5 text-[11px] font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

                  View Details & Delete
                </button>
              </div>
            </div>
          </article>
        ))}
        {visible.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-sand py-16 text-center text-sm text-jungle/45">
            No experiences in this category.
          </p>
        )}
      </div>

      {/* Add */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add new experience"
        description="Publishes immediately to the guest website."
        footer={
          <>
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="rounded-lg border border-sand px-4 py-2 text-sm font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

              Cancel
            </button>
            <button
              type="submit"
              form="add-exp"
              className="rounded-lg bg-jungle-dark px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle">

              Publish experience
            </button>
          </>
        }>

        <form id="add-exp" onSubmit={submitAdd} className="grid gap-4 sm:grid-cols-2">
          {formFields(form, (patch) => setForm({ ...form, ...patch }), 'a')}
        </form>
      </Modal>

      {/* Edit */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.title ?? 'experience'}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-sand px-4 py-2 text-sm font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

              Cancel
            </button>
            <button
              type="submit"
              form="edit-exp"
              className="rounded-lg bg-jungle-dark px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle">

              Save changes
            </button>
          </>
        }>

        <form id="edit-exp" onSubmit={submitEdit} className="grid gap-4 sm:grid-cols-2">
          {formFields(editForm, (patch) => setEditForm({ ...editForm, ...patch }), 'e')}
        </form>
      </Modal>

      {/* View & delete */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.title ?? 'Experience'}
        description={viewing ? `${viewing.category} · ${viewing.duration} · ${viewing.difficulty}` : undefined}
        footer={
          confirmDelete ? (
            <>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-sand px-4 py-2 text-sm font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

                Keep experience
              </button>
              <button
                type="button"
                onClick={() => {
                  if (viewing) {
                    deleteExperience(viewing.id);
                    toast.success(`${viewing.title} removed from the catalog`);
                  }
                  setViewing(null);
                  setConfirmDelete(false);
                }}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-rose-600">

                Confirm delete
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded-lg border border-rose-500/40 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors duration-150 hover:bg-rose-500/10">

                Delete experience
              </button>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded-lg bg-jungle-dark px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle">

                Close
              </button>
            </>
          )
        }>

        {viewing && (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewing.image} alt={viewing.title} className="h-44 w-full rounded-lg object-cover" />
            <p className="mt-4 text-sm leading-relaxed text-jungle">{viewing.description}</p>
            <dl className="mt-5 grid grid-cols-2 gap-4 rounded-lg border border-sand bg-sand-light p-4 text-sm">
              <div>
                <dt className="text-xs text-jungle/45">Price per guest</dt>
                <dd className="mt-0.5 font-medium text-jungle-dark">{moneyShort(viewing.price)}</dd>
              </div>
              <div>
                <dt className="text-xs text-jungle/45">Duration</dt>
                <dd className="mt-0.5 font-medium text-jungle-dark">{viewing.duration}</dd>
              </div>
            </dl>
            <p className="mt-4 flex items-center gap-2 text-xs text-jungle/60">
              <MailIcon className="h-3.5 w-3.5" /> Guest inquiries: hello@rivernest.eco
            </p>
            {confirmDelete && (
              <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-700">
                Deleting removes this experience from the guest website immediately. This cannot be undone.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
