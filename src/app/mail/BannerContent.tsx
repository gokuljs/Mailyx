import React from "react";

type Props = {
  heading: string;
  credits?: number;
  total?: number;
  subtext?: string;
};

const BannerContent = ({ heading, credits, total, subtext }: Props) => {
  return (
    <div className="z-40">
      <div className="flex items-center gap-2 bg-gradient-to-r from-white to-stone-950 bg-clip-text text-xl font-semibold text-transparent">
        {heading}
      </div>
      {total && credits && total >= 0 && credits >= 0 && (
        <div className="mt-1 flex gap-1 text-sm text-zinc-300">
          <span className="text-orange-400">{credits}</span>/
          <span>{total}</span> <span>Messages remaining</span>
        </div>
      )}
      <div className="mt-1 w-[70%] text-xs text-zinc-400">{subtext}</div>
    </div>
  );
};

export default BannerContent;
