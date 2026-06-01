import { useAdminEmails } from '../hooks/useAdminMarketing';
import { Mail, Send, Eye, Users } from 'lucide-react';

export function AdminEmailsPage() {
  const { templates, isLoading } = useAdminEmails();

  return (
    <div className="flex-1 p-8 bg-[#F8F5F1] min-h-screen">
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-[#172E42] mb-1">Campagnes Email</h1>
        <p className="text-[14px] font-semibold text-[#5a7a99]">Communication et marketing direct</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] shadow-soft border border-ink-100">
          <h3 className="text-[18px] font-black text-[#172E42] mb-6 flex items-center gap-2">
            <Mail size={20} className="text-[#D27A2D]" /> Templates disponibles
          </h3>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center py-10 font-bold text-[#5a7a99]">Chargement...</p>
            ) : templates.map((tpl) => (
              <div key={tpl.id} className="p-5 rounded-2xl border border-gray-100 hover:border-[#D27A2D]/30 hover:bg-orange-50/10 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-[15px] font-black text-[#172E42]">{tpl.name}</h4>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-2 bg-white rounded-lg shadow-sm text-[#5a7a99] hover:text-[#D27A2D]">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 bg-[#D27A2D] rounded-lg shadow-sm text-white hover:bg-black">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-[13px] font-semibold text-[#5a7a99] mb-1">{tpl.subject}</p>
                <p className="text-[11px] font-bold text-[#5a7a99] opacity-60 uppercase">{tpl.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-navy p-8 rounded-[32px] text-white shadow-card">
          <h3 className="text-[18px] font-black mb-6 flex items-center gap-2">
            <Users size={20} className="text-[#D27A2D]" /> Envoi par segment
          </h3>
          <p className="text-[14px] font-semibold text-white/70 mb-8 leading-relaxed">
            Envoyez une campagne de communication à un groupe ciblé d'utilisateurs en un clic.
          </p>
          
          <div className="space-y-6">
            <SegmentAction 
              title="Upsell Premium" 
              desc="Envoyé aux utilisateurs Apprenti très actifs."
              target="24 prospects"
            />
            <SegmentAction 
              title="Relance Coaching" 
              desc="Envoyé aux abonnés avec une faible précision."
              target="12 joueurs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SegmentAction({ title, desc, target }: any) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[16px] font-black text-white">{title}</h4>
        <span className="text-[11px] font-black px-2 py-1 rounded bg-[#D27A2D] text-white uppercase">{target}</span>
      </div>
      <p className="text-[13px] font-semibold text-white/60 mb-6">{desc}</p>
      <button className="w-full h-11 rounded-xl bg-white text-navy font-black text-[13px] hover:bg-[#D27A2D] hover:text-white transition-all">
        Préparer l'envoi
      </button>
    </div>
  );
}
