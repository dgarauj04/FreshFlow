import React from 'react';
import { Ban, Clock, Hourglass, Eye, Check } from 'lucide-react';
import { getUrgencyMetadata } from '../../utils/rules';

export default function UrgencyBadge({ daysRemaining }) {
  const meta = getUrgencyMetadata(daysRemaining);

  const icons = {
    ban: <Ban className="w-3.5 h-3.5 stroke-[2.2]" />,
    clock: <Clock className="w-3.5 h-3.5 stroke-[2.2]" />,
    hourglass: <Hourglass className="w-3.5 h-3.5 stroke-[2.2]" />,
    eye: <Eye className="w-3.5 h-3.5 stroke-[2.2]" />,
    check: <Check className="w-3.5 h-3.5 stroke-[2.2]" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
    >
      {icons[meta.icon]}
      <span>{meta.label}</span>
    </span>
  );
}
