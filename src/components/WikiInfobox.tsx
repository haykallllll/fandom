import React from 'react';
import { CharacterInfo } from '@/src/types';
import { User, Clock, MapPin, Users, Heart, Shield, Zap, Globe } from 'lucide-react';

interface WikiInfoboxProps {
  character: CharacterInfo;
  category?: string;
}

export default function WikiInfobox({ character, category }: WikiInfoboxProps) {
  return (
    <aside className="w-full md:w-[320px] shrink-0">
      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm sticky top-24">
        {/* Header */}
        <div className="bg-slate-900 p-4 text-center">
          <h2 className="text-xl font-sans font-black text-white tracking-tight uppercase leading-tight">
            {character.name}
          </h2>
          {character.alias && (
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1 italic">
              "{character.alias}"
            </p>
          )}
        </div>

        {/* Image */}
        <div className="aspect-[2/3] bg-slate-100 relative overflow-hidden group">
          <img 
            src={character.image_url || `https://picsum.photos/seed/${character.name}/600/900`} 
            alt={character.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
        </div>

        {/* Stats / Info */}
        <div className="p-1">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              {character.gender && (
                <InfoRow label="Gender" value={character.gender} icon={<User size={12} />} />
              )}
              {character.age && (
                <InfoRow label="Age" value={character.age} icon={<Clock size={12} />} />
              )}
              {character.origin && (
                <InfoRow label="Origin" value={character.origin} icon={<Globe size={12} />} />
              )}
              {character.affiliation && (
                <InfoRow label="Affiliation" value={character.affiliation} icon={<Users size={12} />} />
              )}
              <InfoRow label="Universe" value={category || 'Unknown'} icon={<Zap size={12} />} />
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-100">
          <div className="flex items-center justify-between opacity-60">
            <div className="flex items-center gap-2">
              <Shield size={10} />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Wiki Verified</span>
            </div>
            <Heart size={10} className="text-red-500 fill-current" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function InfoRow({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <tr className="group hover:bg-slate-50 transition-colors">
      <th className="py-3 px-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[9px] w-1/3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="text-slate-300">{icon}</span>
          {label}
        </div>
      </th>
      <td className="py-3 px-4 text-slate-900 font-bold text-sm bg-white">
        {value}
      </td>
    </tr>
  );
}
