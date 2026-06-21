import React from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: React.ElementType;
  rightContent?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  rightContent,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px]"></div>
      <div className="relative z-10 flex items-center gap-5">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
          <Icon className="w-8 h-8 text-blue-200" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-blue-200 mt-1 text-sm font-medium">{description}</p>
        </div>
      </div>

      {rightContent && (
        <div className="relative z-10">
          {rightContent}
        </div>
      )}
    </div>
  );
}
