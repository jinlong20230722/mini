// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { User, Settings, LogOut, Shield, ChevronRight, Phone, Mail, MapPin, Camera, Upload, X, Calendar, Clock } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
export default function Profile(props) {
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [personnelInfo, setPersonnelInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    setUser(props.$w.auth.currentUser || {
      name: '访客',
      userId: 'guest'
    });
    loadProfileData();
  }, []);
  const loadProfileData = async () => {
    try {
      setLoading(true);
      const userId = props.$w.auth.currentUser?.userId || 'guest';
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: userId
                }
              }]
            }
          },
          select: {
            $master: true
          },
          pageSize: 1
        }
      });
      if (result.records && result.records.length > 0) {
        setPersonnelInfo(result.records[0]);
      }
    } catch (error) {
      console.error('加载个人信息失败:', error);
      toast({
        title: '加载个人信息失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 计算入职时长（年月日）
  const calculateJoinDuration = joinDate => {
    if (!joinDate) return {
      years: 0,
      months: 0,
      days: 0
    };
    const join = new Date(joinDate);
    const now = new Date();
    let years = now.getFullYear() - join.getFullYear();
    let months = now.getMonth() - join.getMonth();
    let days = now.getDate() - join.getDate();
    if (days < 0) {
      months--;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return {
      years,
      months,
      days
    };
  };

  // 计算在职时长（年月日）
  const calculateWorkDuration = (joinDate, status) => {
    if (status !== '在职' || !joinDate) return {
      years: 0,
      months: 0,
      days: 0
    };
    return calculateJoinDuration(joinDate);
  };
  const handleLogout = async () => {
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      await tcb.auth().signOut();
      await tcb.auth().signInAnonymously();
      await props.$w.auth.getUserInfo({
        force: true
      });
      toast({
        title: '退出成功',
        description: '您已成功退出登录'
      });
      props.$w.utils.navigateTo({
        pageId: 'home',
        params: {}
      });
    } catch (error) {
      console.error('退出登录失败:', error);
      toast({
        title: '退出失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
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

  // 打开证件上传/替换弹窗
  const handleDocumentClick = index => {
    setSelectedDocumentIndex(index);
    setShowDocumentModal(true);
  };

  // 关闭证件弹窗
  const handleCloseDocumentModal = () => {
    setShowDocumentModal(false);
    setSelectedDocumentIndex(null);
  };

  // 上传证件
  const handleDocumentUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '文件类型错误',
        description: '请上传图片文件',
        variant: 'destructive'
      });
      return;
    }

    // 验证文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '文件大小不能超过 10MB',
        variant: 'destructive'
      });
      return;
    }
    try {
      setUploading(true);

      // 上传到云存储
      const tcb = await props.$w.cloud.getCloudInstance();
      const uploadResult = await tcb.uploadFile({
        cloudPath: `documents/${Date.now()}_${file.name}`,
        filePath: file
      });

      // 获取文件 URL
      const fileUrl = await tcb.getTempFileURL({
        fileList: [uploadResult.fileID]
      });

      // 更新证件列表
      const updatedDocuments = [...(personnelInfo.documents || [])];
      if (selectedDocumentIndex !== null && selectedDocumentIndex < updatedDocuments.length) {
        // 替换现有证件
        updatedDocuments[selectedDocumentIndex] = fileUrl.fileList[0].tempFileURL;
      } else {
        // 添加新证件
        updatedDocuments.push(fileUrl.fileList[0].tempFileURL);
      }

      // 更新人员信息
      await props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaUpdateV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: personnelInfo._id
                }
              }]
            }
          },
          data: {
            documents: updatedDocuments
          }
        }
      });

      // 更新本地状态
      setPersonnelInfo({
        ...personnelInfo,
        documents: updatedDocuments
      });
      toast({
        title: '上传成功',
        description: '证件信息已更新'
      });
      handleCloseDocumentModal();
    } catch (error) {
      console.error('上传证件失败:', error);
      toast({
        title: '上传失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  // 删除证件
  const handleDocumentDelete = async index => {
    try {
      const updatedDocuments = personnelInfo.documents.filter((_, i) => i !== index);
      await props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaUpdateV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: personnelInfo._id
                }
              }]
            }
          },
          data: {
            documents: updatedDocuments
          }
        }
      });
      setPersonnelInfo({
        ...personnelInfo,
        documents: updatedDocuments
      });
      toast({
        title: '删除成功',
        description: '证件已删除'
      });
    } catch (error) {
      console.error('删除证件失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>;
  }
  const joinDuration = calculateJoinDuration(personnelInfo?.joinDate);
  const workDuration = calculateWorkDuration(personnelInfo?.joinDate, personnelInfo?.status);
  return <div className="min-h-screen bg-[#F5F7FA] pb-20">
      {/* 顶部个人信息卡片 */}
      <div className="bg-[#0A2463] text-white p-6 pb-16 shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-800 text-3xl font-bold font-['Space_Grotesk'] shadow-lg">
              {personnelInfo?.name?.charAt(0) || user?.nickName?.charAt(0) || '保'}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-['Space_Grotesk']">
                {personnelInfo?.name || user?.nickName || '安保人员'}
              </h1>
              <p className="text-blue-100 text-sm mt-1 font-['JetBrains_Mono']">{personnelInfo?.position || '安保人员'}</p>
              <p className="text-blue-200 text-xs mt-1 font-['JetBrains_Mono']">{personnelInfo?.department || '未设置部门'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8">
        {/* 统计卡片 - 装饰边框 */}
        





















        {/* 证件信息 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-4 animate-fade-in-up hover-lift" style={{
        animationDelay: '0.2s'
      }}>

          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 font-['Space_Grotesk']">证件信息</h2>
            <button onClick={() => handleDocumentClick(null)} className="flex items-center gap-2 text-slate-700 text-sm hover:text-slate-900 transition-all duration-300 button-press">
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-1.5 rounded-lg">
                <Upload size={16} className="text-white" />
              </div>
              <span className="font-['JetBrains_Mono']">添加证件</span>
            </button>
          </div>
          
          {personnelInfo?.documents && personnelInfo.documents.length > 0 ? <div className="p-4 grid grid-cols-2 gap-4">
              {personnelInfo.documents.map((doc, index) => <div key={index} className="relative group">
                  <div onClick={() => handleDocumentClick(index)} className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-slate-700 transition-all duration-300 hover-lift">
                    <img src={doc} alt={`证件${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                    </div>
                  </div>
                  <button onClick={e => {
              e.stopPropagation();
              handleDocumentDelete(index);
            }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-300 button-press shadow-md">
                    <X size={14} />
                  </button>
                  <p className="text-xs text-slate-500 mt-2 text-center font-['JetBrains_Mono']">证件 {index + 1}</p>
                </div>)}
            </div> : <div className="p-8 text-center text-slate-400">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                <Camera size={32} className="text-slate-400" />
              </div>
              <p className="font-['Space_Grotesk']">暂无证件信息</p>
              <p className="text-sm mt-1 font-['JetBrains_Mono']">点击上方按钮添加证件</p>
            </div>}
        </div>

        {/* 个人信息列表 - 装饰边框 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-4 border-l-4 border-slate-700 animate-fade-in-up hover-lift" style={{
        animationDelay: '0.3s'
      }}>

          <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 font-['Space_Grotesk']">个人信息</h2>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-2 rounded-lg">
                  <Phone className="text-slate-600" size={20} />
                </div>
                <span className="text-slate-600 font-['JetBrains_Mono']">手机号</span>
              </div>
              <span className="text-slate-800 font-medium font-['JetBrains_Mono']">{personnelInfo?.phone || '未设置'}</span>
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-2 rounded-lg">
                  <User className="text-slate-600" size={20} />
                </div>
                <span className="text-slate-600 font-['JetBrains_Mono']">身份证号</span>
              </div>
              <span className="text-slate-800 font-medium font-['JetBrains_Mono']">{personnelInfo?.idCard || '未设置'}</span>
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-2 rounded-lg">
                  <MapPin className="text-slate-600" size={20} />
                </div>
                <span className="text-slate-600 font-['JetBrains_Mono']">户籍所在地</span>
              </div>
              <span className="text-slate-800 font-medium font-['JetBrains_Mono']">
                {personnelInfo?.registeredResidence || '未设置'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-2 rounded-lg">
                  <User className="text-slate-600" size={20} />
                </div>
                <span className="text-slate-600 font-['JetBrains_Mono']">紧急联系人</span>
              </div>
              <span className="text-slate-800 font-medium font-['JetBrains_Mono']">
                {personnelInfo?.emergencyContact || '未设置'}
              </span>
            </div>
          </div>
        </div>

        {/* 功能菜单 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-4 animate-fade-in-up hover-lift" style={{
        animationDelay: '0.4s'
      }}>

          <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 font-['Space_Grotesk']">功能设置</h2>
          </div>
          <div className="divide-y divide-slate-100">
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all duration-300 button-press">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-2 rounded-lg">
                  <Shield className="text-white" size={20} />
                </div>
                <span className="text-slate-800 font-['Space_Grotesk']">账号安全</span>
              </div>
              <ChevronRight className="text-slate-400" size={20} />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all duration-300 button-press">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-2 rounded-lg">
                  <Settings className="text-white" size={20} />
                </div>
                <span className="text-slate-800 font-['Space_Grotesk']">系统设置</span>
              </div>
              <ChevronRight className="text-slate-400" size={20} />
            </button>
            <button onClick={() => props.$w.utils.navigateTo({
            pageId: 'feedback',
            params: {}
          })} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all duration-300 button-press">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-2 rounded-lg">
                  <Mail className="text-white" size={20} />
                </div>
                <span className="text-slate-800 font-['Space_Grotesk']">意见反馈</span>
              </div>
              <ChevronRight className="text-slate-400" size={20} />
            </button>
          </div>
        </div>

        {/* 退出登录按钮 */}
        <button onClick={handleLogout} className="w-full bg-white rounded-xl shadow-card p-4 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 transition-all duration-300 button-press animate-fade-in-up hover-lift" style={{
        animationDelay: '0.5s'
      }}>

          <div className="bg-red-100 p-2 rounded-lg">
            <LogOut size={20} className="text-red-600" />
          </div>
          <span className="font-medium font-['Space_Grotesk']">退出登录</span>
        </button>

      </div>

      {/* 证件上传弹窗 */}
      {showDocumentModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-card">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 font-['Space_Grotesk']">
              {selectedDocumentIndex !== null ? '替换证件' : '添加证件'}
            </h3>
            <p className="text-sm text-slate-600 mb-4 font-['JetBrains_Mono']">
              请上传证件照片（支持 JPG、PNG 格式，最大 10MB）
            </p>
            <input type="file" accept="image/*" onChange={handleDocumentUpload} disabled={uploading} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700 font-['JetBrains_Mono']" />
            <div className="flex gap-3 mt-4">
              <button onClick={handleCloseDocumentModal} disabled={uploading} className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-300 button-press disabled:opacity-50 font-['JetBrains_Mono']">
                取消
              </button>
              <button onClick={() => document.querySelector('input[type="file"]').click()} disabled={uploading} className="flex-1 py-2 px-4 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-all duration-300 button-press disabled:opacity-50 font-['JetBrains_Mono']">
                {uploading ? '上传中...' : '确认上传'}
              </button>
            </div>
          </div>
        </div>}

      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}