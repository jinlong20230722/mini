// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, Shield, Bell, User } from 'lucide-react';

export function TabBar({
  activeTab,
  onTabChange
}) {
  const tabs = [{
    id: 'home',
    label: '首页',
    icon: Home
  }, {
    id: 'duty',
    label: '职责',
    icon: Shield
  }, {
    id: 'announcement',
    label: '公告',
    icon: Bell
  }, {
    id: 'profile',
    label: '我的',
    icon: User
  }];
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D5D8DC] px-4 py-2 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center">
        {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 button-press button-hover ${isActive ? 'text-[#1A3A52] bg-[#F0F2F5] tab-active' : 'text-[#7F8C8D] hover:text-[#2C3E50]'}`}>
              <Icon size={24} className={isActive ? 'text-[#1A3A52]' : 'text-[#7F8C8D]'} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>;
      })}
      </div>
    </div>;
}