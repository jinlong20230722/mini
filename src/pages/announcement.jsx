// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ChevronDown, ChevronUp, Megaphone, Calendar, User, ArrowLeft } from 'lucide-react';
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
  const [expandedItems, setExpandedItems] = useState({});
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
  const loadAnnouncements = async () => {
    try {
      setLoading(true);

      // 尝试从数据源加载公告
      try {
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
      } catch (dataSourceError) {
        // 如果数据源不存在，使用模拟数据
        console.warn('数据源 announcement 不存在，使用模拟数据:', dataSourceError);
        const mockData = [{
          _id: '1',
          title: '关于2024年度优秀员工表彰的通知',
          content: '为表彰先进，树立典型，激励全体员工的工作积极性和创造性，经公司研究决定，对2024年度表现突出的优秀员工进行表彰。获奖名单如下：张三、李四、王五。希望受表彰的员工珍惜荣誉，再接再厉，在今后的工作中发挥模范带头作用。全体员工要以受表彰的员工为榜样，爱岗敬业，锐意进取，为公司的发展做出更大的贡献。',
          announcementType: '表彰公告',
          publishTime: 1737936600000,
          publisher: '王五'
        }, {
          _id: '2',
          title: '关于春节放假安排的通知',
          content: '根据国家法定节假日安排，结合公司实际情况，现将2024年春节放假安排通知如下：2024年2月9日至2月17日放假，共9天。2月18日（星期日）正常上班。请各部门提前做好工作安排，确保假期期间工作的正常运转。放假期间，请各位员工注意安全，度过一个愉快的春节假期。',
          announcementType: '公司通知',
          publishTime: 1738023000000,
          publisher: '王五'
        }, {
          _id: '3',
          title: '关于举办公司年度团建活动的通知',
          content: '为增强团队凝聚力，促进员工之间的交流与合作，公司决定于2024年3月15日举办年度团建活动。活动地点：北京市怀柔区雁栖湖景区。活动内容：户外拓展、团队游戏、篝火晚会等。请各部门组织员工积极参加，并于3月10日前将参加人员名单报至人力资源部。活动期间，公司将统一安排交通和餐饮。',
          announcementType: '活动通知',
          publishTime: 1738109400000,
          publisher: '王五'
        }, {
          _id: '4',
          title: '关于调整办公时间的通知',
          content: '为提高工作效率，更好地服务客户，经公司研究决定，自2024年4月1日起，调整公司办公时间。新的办公时间为：上午9:00-12:00，下午13:30-18:00。请各部门员工严格遵守新的办公时间安排，确保工作的正常开展。如有特殊情况，需提前向部门负责人请假。',
          announcementType: '公司通知',
          publishTime: 1738195800000,
          publisher: '王五'
        }, {
          _id: '5',
          title: '关于表彰技术部优秀团队的决定',
          content: '技术部在2024年度工作中表现突出，成功完成了多个重要项目，为公司的发展做出了重要贡献。为表彰技术部的优秀表现，公司决定授予技术部"优秀团队"荣誉称号，并给予团队奖金奖励。希望技术部珍惜荣誉，再创佳绩。其他部门要以技术部为榜样，团结协作，努力工作，为公司的发展贡献力量。',
          announcementType: '表彰公告',
          publishTime: 1738282200000,
          publisher: '王五'
        }, {
          _id: '6',
          title: '关于开展员工技能培训的通知',
          content: '为提升员工的专业技能和综合素质，公司决定于2024年5月开展员工技能培训活动。培训内容包括：项目管理、沟通技巧、专业技能提升等。培训时间：2024年5月6日至5月10日，每天9:00-17:00。培训地点：公司会议室。请各部门员工根据自身需求报名参加，并于4月30日前将报名表提交至人力资源部。培训期间，公司将提供午餐和培训资料。',
          announcementType: '活动通知',
          publishTime: 1738368600000,
          publisher: '王五'
        }, {
          _id: '7',
          title: '关于加强办公安全管理的通知',
          content: '为确保公司财产和员工人身安全，现就加强办公安全管理通知如下：一、各部门要定期检查办公设备的安全状况，发现问题及时上报维修。二、员工离开办公室时，要关闭电脑、空调等电器设备，锁好门窗。三、严禁在办公区域使用明火和违规电器。四、发现安全隐患要及时向行政部报告。请各部门员工严格遵守上述规定，共同维护公司的安全稳定。',
          announcementType: '公司通知',
          publishTime: 1738455000000,
          publisher: '王五'
        }, {
          _id: '8',
          title: '关于表彰市场部销售冠军的公告',
          content: '市场部员工李四在2024年第一季度销售工作中表现优异，销售额突破500万元，创公司历史新高。为表彰李四的突出贡献，公司决定授予李四"销售冠军"荣誉称号，并给予个人奖金奖励。希望李四珍惜荣誉，再接再厉，在今后的工作中继续发挥模范带头作用。全体员工要以李四为榜样，积极进取，为公司的发展做出更大的贡献。',
          announcementType: '表彰公告',
          publishTime: 1738541400000,
          publisher: '王五'
        }];
        setAnnouncements(mockData);
      }
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
      <div className="bg-[#3B82F6] text-white px-4 py-4 shadow-sm sticky top-0 z-10">
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

      {/* 主内容区域 */}
      <div className="px-4 py-6 pb-8">
        {/* 页面说明 - 装饰边框 */}
        <div className="bg-[#F8FAFC] rounded-[4px] p-4 mb-6 border-l-4 border-[#3B82F6]">
          <div className="flex items-start">
            <div className="bg-[#3B82F6] rounded-full p-2 mr-3">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-[#1E293B] mb-1 font-['Space_Grotesk']">信息宣发</h4>
              <p className="text-xs text-[#64748B] leading-relaxed font-['JetBrains_Mono']">
                及时了解公司政策、好人好事表彰及重要通知，共同营造积极向上的工作氛围。
              </p>
            </div>
          </div>
        </div>

        {/* 公告列表 */}
        {announcements.length === 0 ? <div className="bg-white rounded-[4px] shadow-sm p-8 text-center border border-[#E8E8E8]">
            <Megaphone className="w-12 h-12 text-[#BFBFBF] mx-auto mb-3" />
            <p className="text-[#999999] text-sm font-['JetBrains_Mono']">暂无公告信息</p>
          </div> : <div className="space-y-4">
            {announcements.map((item, index) => <div key={item._id} className="bg-white rounded-[4px] shadow-sm overflow-hidden border border-[#E8E8E8]">
                {/* 公告头部 */}
                <div className="p-4 cursor-pointer" onClick={() => toggleExpand(item._id)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(item.announcementType)} mr-2`}>
                          {getTypeIcon(item.announcementType)} {item.announcementType}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-[#333333] leading-snug font-['Space_Grotesk']">
                        {item.title}
                      </h3>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {expandedItems[item._id] ? <ChevronUp className="w-5 h-5 text-[#999999]" /> : <ChevronDown className="w-5 h-5 text-[#999999]" />}
                    </div>
                  </div>

                  {/* 发布信息 */}
                  <div className="flex items-center text-xs text-[#999999] space-x-4 font-['JetBrains_Mono']">
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      <span>{formatDate(item.publishTime)}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1" />
                      <span>{item.publisher || '系统'}</span>
                    </div>
                  </div>
                </div>

                {/* 公告内容（展开时显示） */}
                {expandedItems[item._id] && <div className="px-4 pb-4 pt-0">
                    <div className="border-t border-[#E8E8E8] pt-3">
                      <p className="text-sm text-[#666666] leading-relaxed whitespace-pre-wrap font-['JetBrains_Mono']">
                        {item.content}
                      </p>
                    </div>
                  </div>}
              </div>)}
          </div>}

        {/* 底部提示 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#999999] font-['JetBrains_Mono']">
            共 {announcements.length} 条公告信息
          </p>
        </div>
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}