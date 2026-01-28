// @ts-ignore;
import React, { useState, useMemo } from 'react';
// @ts-ignore;
import { Shield, ChevronDown, ChevronUp, MapPin, Eye, Droplets, Car, UserCheck, AlertTriangle, Search, ChevronRight, ChevronLeft } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function Duty(props) {
  const [activeTab, setActiveTab] = useState('duty');
  const [expandedSections, setExpandedSections] = useState({
    ethics: true,
    gate: false,
    patrol: false,
    fire: false,
    parking: false,
    image: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const toggleSection = section => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  const expandAll = () => {
    setExpandedSections({
      ethics: true,
      gate: true,
      patrol: true,
      fire: true,
      parking: true,
      image: true
    });
  };
  const collapseAll = () => {
    setExpandedSections({
      ethics: false,
      gate: false,
      patrol: false,
      fire: false,
      parking: false,
      image: false
    });
  };
  const handleTabChange = tabId => {
    setActiveTab(tabId);
    const pageMap = {
      home: 'home',
      duty: 'duty',
      announcement: 'announcement',
      profile: 'profile'
    };
    props.$w.utils.navigateTo({
      pageId: pageMap[tabId],
      params: {}
    });
  };

  // 保安职业道德内容
  const ethicsContent = {
    title: '保安职业道德',
    icon: Shield,
    items: [{
      title: '爱岗敬业',
      content: '热爱本职工作，恪尽职守，勤奋工作，不断提高业务能力和服务水平。'
    }, {
      title: '诚实守信',
      content: '言行一致，信守承诺，不弄虚作假，不徇私舞弊，维护保安队伍的良好形象。'
    }, {
      title: '文明执勤',
      content: '着装整齐，举止端庄，语言文明，态度和蔼，尊重他人，维护良好的服务形象。'
    }, {
      title: '遵纪守法',
      content: '严格遵守国家法律法规和公司规章制度，依法履行职责，维护社会秩序。'
    }, {
      title: '团结协作',
      content: '发扬团队精神，互相支持，密切配合，共同完成安保工作任务。'
    }, {
      title: '保守秘密',
      content: '严守工作秘密和客户隐私，不泄露任何敏感信息，确保信息安全。'
    }]
  };

  // 各岗位职责内容
  const dutySections = [{
    id: 'gate',
    title: '门岗职责',
    icon: MapPin,
    color: 'blue',
    duties: ['严格执行门卫制度，对进出人员、车辆进行登记和查验', '认真核对出入证件，确保人员、车辆身份信息准确无误', '维护出入口秩序，防止拥挤、堵塞等安全隐患', '发现可疑人员或物品，及时报告并采取相应措施', '保持门岗区域整洁卫生，树立良好窗口形象', '协助处理突发事件，配合相关部门做好应急处置', '做好交接班记录，确保工作连续性和可追溯性', '定期检查门禁系统、监控设备，确保正常运行']
  }, {
    id: 'patrol',
    title: '巡逻岗职责',
    icon: Eye,
    color: 'green',
    duties: ['按照规定路线和时间进行巡逻，确保巡逻覆盖全面', '密切观察巡逻区域安全状况，及时发现安全隐患', '检查门窗、锁具、消防设施等安全设备是否完好', '发现异常情况立即报告，并采取初步处置措施', '制止违规行为，维护巡逻区域正常秩序', '做好巡逻记录，详细记录发现的问题和处理情况', '协助处理突发事件，配合相关部门开展救援工作', '保持通讯畅通，确保与指挥中心实时联络']
  }, {
    id: 'fire',
    title: '消防岗职责',
    icon: Droplets,
    color: 'red',
    duties: ['熟悉消防设施位置和使用方法，确保消防器材完好有效', '定期检查消防栓、灭火器、消防通道等消防设施', '开展消防安全巡查，及时发现和消除火灾隐患', '掌握火灾应急处置流程，能够快速响应火灾报警', '组织消防演练，提高全员消防安全意识和应急能力', '做好消防设施维护保养记录，确保设备正常运行', '协助消防部门开展火灾调查和事故处理', '宣传消防安全知识，提高全员防火意识']
  }, {
    id: 'parking',
    title: '车场岗职责',
    icon: Car,
    color: 'purple',
    duties: ['引导车辆有序停放，确保停车场秩序井然', '核对车辆信息，做好车辆进出登记', '维护停车场设施，确保照明、监控等设备正常运行', '发现车辆异常情况及时通知车主并做好记录', '制止违规停车行为，维护停车场正常秩序', '协助处理车辆剐蹭、被盗等突发事件', '做好停车场安全巡查，防范盗窃、破坏等行为', '保持停车场清洁卫生，提供良好停车环境']
  }, {
    id: 'image',
    title: '形象岗职责',
    icon: UserCheck,
    color: 'orange',
    duties: ['保持仪容仪表整洁，着装规范，树立良好形象', '站姿端正，精神饱满，展现专业素养', '礼貌待人，热情服务，提供优质安保服务', '维护岗位区域秩序，确保环境整洁有序', '协助接待访客，提供必要的引导和帮助', '及时报告岗位区域异常情况，确保安全稳定', '遵守服务规范，提升服务质量和客户满意度', '配合其他岗位工作，共同完成安保任务']
  }];
  const filteredDutySections = useMemo(() => {
    return dutySections.filter(section => {
      const matchesFilter = selectedFilter === 'all' || section.id === selectedFilter;
      const matchesSearch = searchQuery === '' || section.title.toLowerCase().includes(searchQuery.toLowerCase()) || section.duties.some(duty => duty.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [selectedFilter, searchQuery]);
  const filteredEthicsItems = useMemo(() => {
    if (searchQuery === '') return ethicsContent.items;
    return ethicsContent.items.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.content.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);
  const colorClasses = {
    blue: {
      bg: 'bg-[#DBEAFE]',
      text: 'text-[#1E40AF]',
      border: 'border-[#93C5FD]',
      icon: 'text-[#1E40AF]'
    },
    green: {
      bg: 'bg-[#D1FAE5]',
      text: 'text-[#047857]',
      border: 'border-[#6EE7B7]',
      icon: 'text-[#047857]'
    },
    red: {
      bg: 'bg-[#FEE2E2]',
      text: 'text-[#DC2626]',
      border: 'border-[#FCA5A5]',
      icon: 'text-[#DC2626]'
    },
    purple: {
      bg: 'bg-[#EDE9FE]',
      text: 'text-[#7C3AED]',
      border: 'border-[#C4B5FD]',
      icon: 'text-[#7C3AED]'
    },
    orange: {
      bg: 'bg-[#FEF3C7]',
      text: 'text-[#D97706]',
      border: 'border-[#FCD34D]',
      icon: 'text-[#D97706]'
    }
  };
  return <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 顶部导航栏 */}
      <div className="bg-[#6366F1] text-white px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[18px] font-bold">岗位职责</h1>
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all duration-200">
              全部展开
            </button>
            <button onClick={collapseAll} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all duration-200">
              全部收起
            </button>
          </div>
        </div>
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
          <input type="text" placeholder="搜索职责内容..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/20 text-white placeholder-white/60 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-200" />
        </div>
      </div>

      {/* 快速筛选标签 */}
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setSelectedFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${selectedFilter === 'all' ? 'bg-[#6366F1] text-white shadow-md' : 'bg-white text-[#64748B] hover:bg-gray-50'}`}>
            全部
          </button>
          {dutySections.map(section => {
          const colors = colorClasses[section.color];
          return <button key={section.id} onClick={() => setSelectedFilter(section.id)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${selectedFilter === section.id ? `${colors.bg} ${colors.text} shadow-md` : 'bg-white text-[#64748B] hover:bg-gray-50'}`}>
                {section.title}
              </button>;
        })}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-4 space-y-3">
        {/* 保安职业道德 */}
        {(selectedFilter === 'all' || selectedFilter === 'ethics') && <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-in-up hover:shadow-md transition-shadow duration-300" style={{
        animationDelay: '0.1s'
      }}>
            <div className={`p-4 cursor-pointer flex items-center justify-between transition-all duration-300 ease-in-out ${expandedSections.ethics ? 'bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white' : 'bg-gray-50 hover:bg-gray-100'}`} onClick={() => toggleSection('ethics')}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${expandedSections.ethics ? 'bg-white/20' : 'bg-[#F8FAFC]'}`}>
                  <Shield size={22} className={expandedSections.ethics ? 'text-white' : 'text-[#6366F1]'} />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold font-['Space_Grotesk']">职业道德</h2>
                  <p className={`text-xs mt-0.5 ${expandedSections.ethics ? 'text-white/80' : 'text-[#94A3B8]'}`}>
                    {filteredEthicsItems.length} 条规范
                  </p>
                </div>
              </div>
              {expandedSections.ethics ? <ChevronUp size={20} className="transition-transform duration-300 ease-in-out" /> : <ChevronDown size={20} className="text-[#94A3B8] transition-transform duration-300 ease-in-out" />}
            </div>
            
            {expandedSections.ethics && <div className="p-4 space-y-3 transition-all duration-300 ease-in-out">
                {filteredEthicsItems.length > 0 ? filteredEthicsItems.map((item, index) => <div key={index} className="p-3.5 bg-gradient-to-r from-[#F8FAFC] to-white rounded-xl border-l-4 border-[#6366F1] transition-all duration-300 ease-in-out hover:shadow-md hover:translate-x-1">
                      <h3 className="font-semibold text-[#0F172A] mb-1.5 font-['Space_Grotesk'] text-sm">{item.title}</h3>
                      <p className="text-[#475569] text-xs leading-relaxed font-['JetBrains_Mono']">{item.content}</p>
                    </div>) : <div className="text-center py-8 text-[#94A3B8] text-sm">
                    未找到匹配的职业道德内容
                  </div>}
              </div>}
          </div>}

        {/* 各岗位职责 */}
        {filteredDutySections.map((section, index) => {
        const Icon = section.icon;
        const colors = colorClasses[section.color];
        const isExpanded = expandedSections[section.id];
        return <div key={section.id} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-in-up hover:shadow-md transition-shadow duration-300" style={{
          animationDelay: `${0.2 + index * 0.1}s`
        }}>
              <div className={`p-4 cursor-pointer flex items-center justify-between transition-all duration-300 ease-in-out ${isExpanded ? colors.bg : 'bg-gray-50 hover:bg-gray-100'}`} onClick={() => toggleSection(section.id)}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isExpanded ? 'bg-white/50' : 'bg-[#F8FAFC]'}`}>
                    <Icon size={20} className={isExpanded ? colors.icon : 'text-[#64748B]'} />
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-base font-semibold ${isExpanded ? colors.text : 'text-[#0F172A]'} font-['Space_Grotesk']`}>{section.title}</h2>
                    <p className={`text-xs mt-0.5 ${isExpanded ? colors.text.replace('text-', 'text-').replace('700', '500').replace('600', '400') : 'text-[#94A3B8]'}`}>
                      {section.duties.length} 条职责
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} className={`${colors.text} transition-transform duration-300 ease-in-out`} /> : <ChevronDown size={20} className="text-[#94A3B8] transition-transform duration-300 ease-in-out" />}
              </div>
              
              {isExpanded && <div className={`p-4 ${colors.bg} transition-all duration-300 ease-in-out`}>
                  <ul className="space-y-2.5">
                    {section.duties.map((duty, index) => <li key={index} className="flex items-start gap-3 transition-all duration-300 ease-in-out hover:translate-x-1">
                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${colors.icon.replace('text', 'bg')}`} />
                        <span className={`text-xs ${colors.text} leading-relaxed font-['JetBrains_Mono']`}>{duty}</span>
                      </li>)}
                  </ul>
                </div>}
            </div>;
      })}

        {/* 空状态 */}
        {filteredDutySections.length === 0 && selectedFilter !== 'all' && <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F8FAFC] mb-4">
              <Search className="text-[#94A3B8]" size={32} />
            </div>
            <p className="text-[#94A3B8] text-sm mb-2">未找到匹配的职责内容</p>
            <button onClick={() => {
          setSelectedFilter('all');
          setSearchQuery('');
        }} className="text-[#6366F1] text-sm font-medium hover:underline">
              清除筛选条件
            </button>
          </div>}

        {/* 底部提示 */}
        <div className="bg-gradient-to-r from-[#F8FAFC] to-white rounded-2xl p-4 border-l-4 border-[#6366F1] animate-fade-in-up hover:shadow-md transition-shadow duration-300" style={{
        animationDelay: '0.8s'
      }}>
          <div className="flex items-start gap-3">
            <div className="bg-[#6366F1] p-2.5 rounded-xl">
              <AlertTriangle className="text-white flex-shrink-0" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#0F172A] mb-1.5 font-['Space_Grotesk'] text-sm">温馨提示</h3>
              <p className="text-xs text-[#475569] leading-relaxed font-['JetBrains_Mono']">
                请严格遵守保安职业道德和岗位规范，认真履行职责，确保安保工作质量。如有疑问，请及时向上级汇报。
              </p>
            </div>
          </div>
        </div>

        {/* 底部统计信息 */}
        <div className="text-center py-3">
          <p className="text-xs text-[#94A3B8]">
            {selectedFilter === 'all' ? `共 ${dutySections.length} 个岗位，${dutySections.reduce((sum, s) => sum + s.duties.length, 0)} 条职责` : `当前显示 ${filteredDutySections.length} 个岗位`}
          </p>
        </div>
      </div>

      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}