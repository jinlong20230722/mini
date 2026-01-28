// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { UserCheck, MapPin, Calendar, AlertTriangle, MessageSquare, Settings, Bell } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
export default function Home(props) {
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const [pageLoaded, setPageLoaded] = useState(false);
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
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({
    todayCount: 0,
    monthCount: 0,
    lastTime: '-',
    lastStatus: '-'
  });
  const [eventStats, setEventStats] = useState({
    todayCount: 0,
    monthCount: 0,
    lastTime: '-',
    lastType: '-'
  });
  useEffect(() => {
    checkLoginAndLoadData();
    setTimeout(() => setPageLoaded(true), 100);
  }, []);
  const checkLoginAndLoadData = async () => {
    setUser(props.$w.auth.currentUser || {
      name: '访客',
      userId: 'guest'
    });
    await checkRegistrationStatus();
    await loadRealTimeData();
  };
  const checkRegistrationStatus = async () => {
    try {
      setLoading(true);
      const userId = props.$w.auth.currentUser?.userId || 'guest';
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              _openid: {
                $eq: userId
              }
            }
          },
          select: {
            $master: true
          },
          getCount: true
        }
      });
      setHasRegistered(result.total > 0);
      setLoading(false);
    } catch (error) {
      console.error('检查登记状态失败:', error);
      setLoading(false);
    }
  };
  const loadRealTimeData = async () => {
    try {
      const userId = props.$w.auth.currentUser?.userId || 'guest';
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
      const attendanceResult = await props.$w.cloud.callDataSource({
        dataSourceName: 'attendance',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              _openid: {
                $eq: userId
              }
            }
          },
          select: {
            $master: true
          },
          getCount: true
        }
      });
      if (attendanceResult.records && attendanceResult.records.length > 0) {
        const records = attendanceResult.records;
        const todayRecords = records.filter(r => r.checkInTime >= todayStart);
        const monthRecords = records.filter(r => r.checkInTime >= monthStart);
        const sortedRecords = records.sort((a, b) => b.checkInTime - a.checkInTime);
        const lastRecord = sortedRecords[0];
        setAttendanceStats({
          todayCount: todayRecords.length,
          monthCount: monthRecords.length,
          lastTime: lastRecord.checkInTime ? new Date(lastRecord.checkInTime).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : '-',
          lastStatus: lastRecord.status || '-'
        });
      }
      const eventResult = await props.$w.cloud.callDataSource({
        dataSourceName: 'event_report',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              _openid: {
                $eq: userId
              }
            }
          },
          select: {
            $master: true
          },
          getCount: true
        }
      });
      if (eventResult.records && eventResult.records.length > 0) {
        const records = eventResult.records;
        const todayRecords = records.filter(r => r.reportTime >= todayStart);
        const monthRecords = records.filter(r => r.reportTime >= monthStart);
        const sortedRecords = records.sort((a, b) => b.reportTime - a.reportTime);
        const lastRecord = sortedRecords[0];
        setEventStats({
          todayCount: todayRecords.length,
          monthCount: monthRecords.length,
          lastTime: lastRecord.reportTime ? new Date(lastRecord.reportTime).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : '-',
          lastType: lastRecord.eventType || '-'
        });
      }
    } catch (error) {
      console.error('加载实时数据失败:', error);
    }
  };
  const handleFunctionClick = functionName => {
    switch (functionName) {
      case 'register':
        props.$w.utils.navigateTo({
          pageId: 'registration',
          params: {}
        });
        break;
      case 'checkIn':
        props.$w.utils.navigateTo({
          pageId: 'checkin',
          params: {}
        });
        break;
      case 'leave':
        props.$w.utils.navigateTo({
          pageId: 'leave',
          params: {}
        });
        break;
      case 'event':
        props.$w.utils.navigateTo({
          pageId: 'event',
          params: {}
        });
        break;
      case 'feedback':
        props.$w.utils.navigateTo({
          pageId: 'feedback',
          params: {}
        });
        break;
      case 'announcement':
        props.$w.utils.navigateTo({
          pageId: 'announcement',
          params: {}
        });
        break;
      default:
        break;
    }
  };
  const handleTopRightAction = () => {
    props.$w.utils.navigateTo({
      pageId: 'registration',
      params: {}
    });
  };
  const functionModules = [{
    id: 'checkIn',
    name: '打卡签到',
    icon: MapPin,
    color: '#00A8E8',
    description: '位置打卡',
    isPrimary: true
  }, {
    id: 'event',
    name: '事件上报',
    icon: AlertTriangle,
    color: '#FF6B35',
    description: '异常事件',
    isPrimary: true
  }, {
    id: 'leave',
    name: '请销假',
    icon: Calendar,
    color: '#9B59B6',
    textColor: '#FFFFFF',
    description: '班长/队长及以上人员',
    isPrimary: false
  }, {
    id: 'feedback',
    name: '意见反馈',
    icon: MessageSquare,
    color: '#1ABC9C',
    textColor: '#FFFFFF',
    description: '现场/公司管理建议',
    isPrimary: false
  }];
  if (loading) {
    return <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="text-[#7F8C8D]">加载中...</div>
      </div>;
  }
  return <div className="min-h-screen bg-[#F0F2F5] pb-20">
      {/* 顶部导航栏 - 警务蓝色背景 */}
      <div className="bg-[#0A2463] text-white px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-[24px]">天顺保安</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={handleTopRightAction} className="flex items-center space-x-1 text-[14px] text-[#0A2463] bg-white rounded-[4px] px-3 py-2">
              <UserCheck className="w-4 h-4" />
              <span className="font-medium">入职登记</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className={`px-4 py-6 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* 欢迎卡片 */}
        <div className="bg-white rounded-[4px] shadow-sm p-5 mb-6">

          <h2 className="text-[18px] font-bold text-[#2C3E50] mb-2">工作概览</h2>
          <p className="text-[14px] text-[#7F8C8D]">
            {hasRegistered ? '您已完成入职登记，可正常使用各项功能' : '请先完成入职登记，以便使用全部功能'}
          </p>
        </div>

        {/* 功能模块网格 - 调整间距 */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          {functionModules.map((module, index) => {
          const Icon = module.icon;
          const isPrimary = module.isPrimary;
          const isCheckIn = module.id === 'checkIn';
          const isEvent = module.id === 'event';

          // 核心功能卡片尺寸：160px × 180px
          // 次要功能卡片尺寸：140px × 150px
          const cardWidth = isPrimary ? 'w-[160px]' : 'w-[140px]';
          const cardHeight = isPrimary ? 'h-[180px]' : 'h-[150px]';
          const shadowClass = isPrimary ? 'shadow-[0_2px_6px_rgba(0,0,0,0.1)]' : 'shadow-[0_1px_3px_rgba(0,0,0,0.08)]';
          const bgColor = isPrimary ? module.color : module.color;
          const textColor = isPrimary ? 'text-white' : 'text-[#2C3E50]';
          const iconBg = isPrimary ? 'bg-white/20' : 'bg-[#D5D8DC]';
          const iconColor = isPrimary ? 'text-white' : 'text-[#2C3E50]';
          const descColor = isPrimary ? 'text-white/90' : 'text-[#7F8C8D]';
          return <button key={module.id} onClick={() => handleFunctionClick(module.id)} className={`${cardWidth} ${cardHeight} ${shadowClass} rounded-[4px] p-4 flex flex-col items-center justify-center`} style={{
            backgroundColor: bgColor,
            boxShadow: isPrimary ? '0 2px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.08)'
          }}>

              <div className={`${iconBg} w-12 h-12 rounded-[8px] flex items-center justify-center mb-2`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <h3 className={`font-bold text-[16px] mb-1 ${textColor}`}>{module.name}</h3>
              <p className={`text-[12px] text-center leading-relaxed ${descColor}`}>{module.description}</p>
              {isPrimary}



            </button>;
        })}
        </div>

        {/* 实时数据统计 */}
        <div className="mt-6 space-y-4">
          <h3 className="text-[18px] font-bold text-[#2C3E50] mb-4">实时数据</h3>
          
          {/* 打卡签到统计 */}
          <div className="bg-white rounded-[4px] shadow-sm p-5">

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-[#00A8E8] p-2 rounded-[8px]">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-[#2C3E50]">打卡签到</h4>
              </div>
              <span className="text-[12px] text-[#7F8C8D] bg-[#F0F2F5] px-2 py-1 rounded-full">实时更新</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-[24px] font-bold text-[#00A8E8]">{attendanceStats.todayCount}</div>
                <div className="text-[12px] text-[#7F8C8D] mt-1">今日打卡</div>
              </div>
              <div className="text-center">
                <div className="text-[24px] font-bold text-[#00A8E8]">{attendanceStats.monthCount}</div>
                <div className="text-[12px] text-[#7F8C8D] mt-1">本月打卡</div>
              </div>
              <div className="text-center">
                <div className={`text-[14px] font-semibold ${attendanceStats.lastStatus === '正常' ? 'text-[#00A8E8]' : 'text-[#FF6B35]'}`}>
                  {attendanceStats.lastStatus}
                </div>
                <div className="text-[12px] text-[#7F8C8D] mt-1">最近状态</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#D5D8DC]">
              <div className="flex items-center justify-between text-[12px] text-[#7F8C8D]">
                <span>最近打卡时间</span>
                <span className="font-medium text-[#2C3E50]">{attendanceStats.lastTime}</span>
              </div>
            </div>
          </div>

          {/* 事件上报统计 */}
          <div className="bg-white rounded-[4px] shadow-sm p-5">

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-[#FF6B35] p-2 rounded-[8px]">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-[#2C3E50]">事件上报</h4>
              </div>
              <span className="text-[12px] text-[#7F8C8D] bg-[#F0F2F5] px-2 py-1 rounded-full">实时更新</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-[24px] font-bold text-[#FF6B35]">{eventStats.todayCount}</div>
                <div className="text-[12px] text-[#7F8C8D] mt-1">今日上报</div>
              </div>
              <div className="text-center">
                <div className="text-[24px] font-bold text-[#FF6B35]">{eventStats.monthCount}</div>
                <div className="text-[12px] text-[#7F8C8D] mt-1">本月上报</div>
              </div>
              <div className="text-center">
                <div className="text-[14px] font-semibold text-[#2C3E50] truncate px-1">
                  {eventStats.lastType}
                </div>
                <div className="text-[12px] text-[#7F8C8D] mt-1">最近类型</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#D5D8DC]">
              <div className="flex items-center justify-between text-[12px] text-[#7F8C8D]">
                <span>最近上报时间</span>
                <span className="font-medium text-[#2C3E50]">{eventStats.lastTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}