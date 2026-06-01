import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { IPlan, IPlanFormData } from '../../hooks/useAdminMarketing';

interface PlanModalProps {
  isOpen: boolean;
  plan: IPlan | null;
  onClose: () => void;
  onSave: (data: IPlanFormData) => void;
}

const EMPTY_FORM: IPlanFormData = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  intervalMonths: 1,
  features: [],
  isActive: true,
  order: 0,
};

export function PlanModal({ isOpen, plan, onClose, onSave }: PlanModalProps) {
  const [form, setForm] = useState<IPlanFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [featureInput, setFeatureInput] = useState('');
  const featureRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (plan) {
        setForm({
          name: plan.name,
          slug: plan.slug,
          description: plan.description ?? '',
          price: plan.price,
          intervalMonths: plan.intervalMonths,
          features: plan.features ?? [],
          isActive: plan.isActive,
          order: plan.order,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
      setFeatureInput('');
    }
  }, [isOpen, plan]);

  if (!isOpen) return null;

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Le nom est requis';
    if (!form.slug.trim()) errs.slug = 'Le slug est requis';
    if (form.price <= 0) errs.price = 'Le prix doit etre superieur a 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
    onClose();
  }

  function addFeature() {
    const val = featureInput.trim();
    if (!val) return;
    setForm((prev) => ({ ...prev, features: [...prev.features, val] }));
    setFeatureInput('');
    featureRef.current?.focus();
  }

  function removeFeature(idx: number) {
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  }

  function handleFeatureKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ border: '1px solid rgba(23,46,66,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-[20px] font-black text-[#172E42]">
            {plan ? 'Modifier le plan' : 'Nouveau plan'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={18} color="#172E42" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Nom */}
          <div>
            <label className="block text-[13px] font-black text-[#172E42] uppercase tracking-wider mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full h-11 px-4 rounded-[12px] border border-gray-200 text-[14px] font-semibold text-[#172E42] outline-none focus:border-[#D27A2D] transition-colors"
              placeholder="Ex: Pro Mensuel"
            />
            {errors.name && <p className="text-red-500 text-[12px] mt-1">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-[13px] font-black text-[#172E42] uppercase tracking-wider mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              className="w-full h-11 px-4 rounded-[12px] border border-gray-200 text-[14px] font-semibold text-[#172E42] outline-none focus:border-[#D27A2D] transition-colors"
              placeholder="ex: pro-mensuel"
            />
            {errors.slug && <p className="text-red-500 text-[12px] mt-1">{errors.slug}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-black text-[#172E42] uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-[12px] border border-gray-200 text-[14px] font-semibold text-[#172E42] outline-none focus:border-[#D27A2D] transition-colors resize-none"
              rows={2}
              placeholder="Description du plan..."
            />
          </div>

          {/* Prix + Duree */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-black text-[#172E42] uppercase tracking-wider mb-1">
                Prix (EUR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={form.price || ''}
                onChange={(e) => setForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                className="w-full h-11 px-4 rounded-[12px] border border-gray-200 text-[14px] font-semibold text-[#172E42] outline-none focus:border-[#D27A2D] transition-colors"
                placeholder="29.99"
              />
              {errors.price && <p className="text-red-500 text-[12px] mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-black text-[#172E42] uppercase tracking-wider mb-1">
                Duree (mois)
              </label>
              <input
                type="number"
                min={1}
                value={form.intervalMonths}
                onChange={(e) => setForm((p) => ({ ...p, intervalMonths: parseInt(e.target.value) || 1 }))}
                className="w-full h-11 px-4 rounded-[12px] border border-gray-200 text-[14px] font-semibold text-[#172E42] outline-none focus:border-[#D27A2D] transition-colors"
              />
            </div>
          </div>

          {/* Ordre */}
          <div>
            <label className="block text-[13px] font-black text-[#172E42] uppercase tracking-wider mb-1">
              Ordre d'affichage
            </label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
              className="w-full h-11 px-4 rounded-[12px] border border-gray-200 text-[14px] font-semibold text-[#172E42] outline-none focus:border-[#D27A2D] transition-colors"
            />
          </div>

          {/* Actif toggle */}
          <div className="flex items-center justify-between p-4 rounded-[12px] bg-gray-50 border border-gray-100">
            <span className="text-[14px] font-black text-[#172E42]">Plan actif</span>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ background: form.isActive ? '#D27A2D' : '#d1d5db' }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: form.isActive ? 'translateX(24px)' : 'translateX(2px)' }}
              />
            </button>
          </div>

          {/* Features */}
          <div>
            <label className="block text-[13px] font-black text-[#172E42] uppercase tracking-wider mb-2">
              Fonctionnalites incluses
            </label>
            <div className="flex gap-2 mb-2">
              <input
                ref={featureRef}
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={handleFeatureKeyDown}
                className="flex-1 h-10 px-3 rounded-[10px] border border-gray-200 text-[13px] font-semibold text-[#172E42] outline-none focus:border-[#D27A2D] transition-colors"
                placeholder="Ajouter une fonctionnalite..."
              />
              <button
                type="button"
                onClick={addFeature}
                className="w-10 h-10 rounded-[10px] flex items-center justify-center border-none cursor-pointer transition-colors"
                style={{ background: 'linear-gradient(135deg, #D27A2D, #F59E0B)' }}
              >
                <Plus size={16} color="white" />
              </button>
            </div>
            {form.features.length > 0 && (
              <ul className="flex flex-col gap-1">
                {form.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded-[8px] bg-gray-50 border border-gray-100"
                  >
                    <span className="text-[13px] font-semibold text-[#172E42] flex-1">{f}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      className="ml-2 p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-[14px] border border-gray-200 font-extrabold text-[14px] text-[#172E42] bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-[14px] border-none font-extrabold text-[14px] text-white cursor-pointer transition-all hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, #D27A2D, #F59E0B)' }}
            >
              {plan ? 'Enregistrer' : 'Creer le plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
