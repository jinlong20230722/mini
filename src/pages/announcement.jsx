// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ChevronDown, ChevronUp, Megaphone, Calendar, User, ArrowLeft, Search, Filter } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
export default function Announcement(props) {
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('announcement');
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedType, setSelectedType] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const handleTabChange = tabId => {
    setActiveTab(tabId);
    const pageMap = {
      'home': 'home',
      'duty': 'duty',
      'announcement': 'announcement',
      'profile': 'profile'
    };
    const targetPage = pageMap[tabId];
    if (targetPage) {
      props.$w.utils.navigateTo({
        pageId: targetPage,
        params: {}
      });
    }
  };
  useEffect(() => {
    loadAnnouncements();
  }, []);
  useEffect(() => {
    filterAnnouncements();
  }, [announcements, selectedType, searchKeyword]);
  const filterAnnouncements = () => {
    let filtered = announcements;

    // 按类型筛选
    if (selectedType !== '全部') {
      filtered = filtered.filter(item => item.announcementType === selectedType);
    }

    // 按关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(item => item.title.toLowerCase().includes(keyword) || item.content.toLowerCase().includes(keyword));
    }
    setFilteredAnnouncements(filtered);
  };
  const loadAnnouncements = async () => {
    try {
      setLoading(true);

      // 从数据源加载公告
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'announcement',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {},
            orderBy: [{
              publishTime: 'desc'
            }]
          },
          select: {
            $master: true
          },
          getCount: true
        }
      });
      setAnnouncements(result.records || []);
      setLoading(false);
    } catch (error) {
      console.error('加载公告失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '加载公告信息失败，请稍后重试',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };
  const toggleExpand = id => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const getTypeColor = type => {
    switch (type) {
      case '表彰公告':
        return 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]';
      case '公司通知':
        return 'bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD]';
      case '活动通知':
        return 'bg-[#D1FAE5] text-[#047857] border-[#6EE7B7]';
      default:
        return 'bg-[#F8FAFC] text-[#1E293B] border-[#E2E8F0]';
    }
  };
  const getTypeIcon = type => {
    switch (type) {
      case '表彰公告':
        return '🏆';
      case '公司通知':
        return '📢';
      case '活动通知':
        return '🎉';
      default:
        return '📋';
    }
  };
  const formatDate = timestamp => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
  const handleBack = () => {
    props.$w.utils.navigateBack();
  };
  if (loading) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-slate-600">加载中...</div>
      </div>;
  }
  return <div className="min-h-screen bg-[#F8FAFC]">
      {/* 顶部导航栏 */}
      <div className="bg-[#6366F1] text-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-full mr-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold font-['Space_Grotesk']">公告信息</h1>
          </div>
          <div className="bg-white/10 p-2 rounded-lg">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 筛选和搜索区域 */}
      <div className="bg-white px-4 py-3 shadow-sm border-b border-[#E2E8F0]">
        <div className="flex items-center space-x-3">
          {/* 类型筛选按钮 */}
          <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${showFilter ? 'bg-[#6366F1] text-white' : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'}`}>
            <Filter className="w-4 h-4 mr-1.5" />
            筛选
          </button>

          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" placeholder="搜索公告标题或内容..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all font-['JetBrains_Mono']" />
          </div>
        </div>

        {/* 类型筛选标签 */}
        {showFilter && <div className="mt-3 flex flex-wrap gap-2">
            {['全部', '表彰公告', '公司通知', '活动通知'].map(type => <button key={type} onClick={() => setSelectedType(type)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedType === type ? 'bg-[#6366F1] text-white' : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'} font-['Space_Grotesk']`}>
                {type}
              </button>)}
          </div>}
      </div>

      {/* 主内容区域 */}
      <div className="px-4 py-4 pb-8">
        {/* 公告列表 */}
        {filteredAnnouncements.length === 0 ? <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-[#E2E8F0]">
            <div className="bg-[#F8FAFC] rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <Megaphone className="w-8 h-8 text-[#94A3B8]" />
            </div>
            <p className="text-[#64748B] text-sm font-['JetBrains_Mono'] mb-2">
              {searchKeyword || selectedType !== '全部' ? '未找到匹配的公告' : '暂无公告信息'}
            </p>
            {(searchKeyword || selectedType !== '全部') && <button onClick={() => {
          setSearchKeyword('');
          setSelectedType('全部');
        }} className="text-sm text-[#6366F1] hover:text-[#4F46E5] font-medium mt-2">
                清除筛选条件
              </button>}
          </div> : <div className="space-y-3">
            {filteredAnnouncements.map((item, index) => <div key={item._id} className={`bg-white rounded-xl shadow-sm overflow-hidden border border-[#E2E8F0] transition-all hover:shadow-md ${expandedItems[item._id] ? 'ring-2 ring-[#6366F1] ring-opacity-20' : ''}`}>
                {/* 公告头部 */}
                <div className={`p-4 cursor-pointer ${expandedItems[item._id] ? 'bg-gradient-to-r from-[#F8FAFC] to-white' : ''}`} onClick={() => toggleExpand(item._id)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-3">
                      <div className="flex items-center mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(item.announcementType)} mr-2`}>
                          {getTypeIcon(item.announcementType)} {item.announcementType}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-[#0F172A] leading-snug font-['Space_Grotesk']">
                        {item.title}
                      </h3>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {expandedItems[item._id] ? <ChevronUp className="w-5 h-5 text-[#6366F1]" /> : <ChevronDown className="w-5 h-5 text-[#94A3B8]" />}
                    </div>
                  </div>

                  {/* 发布信息 */}
                  <div className="flex items-center text-xs text-[#94A3B8] space-x-4 font-['JetBrains_Mono']">
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      <span>{formatDate(item.publishTime)}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1.5" />
                      <span>{item.publisher || '系统'}</span>
                    </div>
                  </div>
                </div>

                {/* 公告内容（展开时显示） */}
                {expandedItems[item._id] && <div className="px-4 pb-4 pt-0">
                    <div className="border-t border-[#E2E8F0] pt-4">
                      <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-wrap font-['JetBrains_Mono']">
                        {item.content}
                      </p>
                    </div>
                  </div>}
              </div>)}
          </div>}

        {/* 底部提示 */}
        {filteredAnnouncements.length > 0 && <div className="mt-6 text-center">
            <p className="text-xs text-[#94A3B8] font-['JetBrains_Mono']">
              共 {filteredAnnouncements.length} 条公告信息
              {announcements.length !== filteredAnnouncements.length && `（共 ${announcements.length} 条）`}
            </p>
          </div>}
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}