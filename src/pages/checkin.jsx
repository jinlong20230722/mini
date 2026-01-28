// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { MapPin, Clock, Camera, Video, CheckCircle, AlertCircle, Navigation } from 'lucide-react';

export default function CheckIn(props) {
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;
  const currentUser = $w?.auth?.currentUser;

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    address: '正在获取位置...'
  });
  const [status, setStatus] = useState('normal'); // normal: 正常, abnormal: 异常
  const [attachments, setAttachments] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 获取当前位置
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async position => {
        const {
          latitude,
          longitude
        } = position.coords;

        // 模拟逆地理编码（实际项目中可以使用高德、百度等地图 API）
        const mockAddress = `经度: ${longitude.toFixed(6)}, 纬度: ${latitude.toFixed(6)}`;
        setLocation({
          latitude,
          longitude,
          address: mockAddress
        });
        toast({
          title: '位置获取成功',
          description: mockAddress,
          variant: 'default'
        });
      }, error => {
        console.error('获取位置失败:', error);
        toast({
          title: '位置获取失败',
          description: '请检查定位权限设置',
          variant: 'destructive'
        });
        setLocation({
          latitude: null,
          longitude: null,
          address: '位置获取失败'
        });
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    } else {
      toast({
        title: '不支持定位',
        description: '您的浏览器不支持地理定位',
        variant: 'destructive'
      });
      setLocation({
        latitude: null,
        longitude: null,
        address: '不支持定位'
      });
    }
  };

  // 更新当前时间
  const updateCurrentTime = () => {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    setCurrentTime(timeStr);
  };

  // 处理文件选择（拍照或录像）
  const handleFileSelect = e => {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: '文件类型错误',
        description: '仅支持图片和视频文件',
        variant: 'destructive'
      });
      return;
    }

    // 验证文件大小（最大 50MB）
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '文件大小不能超过 50MB',
        variant: 'destructive'
      });
      return;
    }

    // 创建预览 URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAttachments([file]);
    toast({
      title: '文件已选择',
      description: file.type.startsWith('image/') ? '图片已选择' : '视频已选择',
      variant: 'default'
    });
  };

  // 清除附件
  const clearAttachment = () => {
    setAttachments([]);
    setPreviewUrl(null);
  };

  // 提交打卡记录
  const handleSubmit = async () => {
    // 验证位置
    if (!location.latitude || !location.longitude) {
      toast({
        title: '位置信息缺失',
        description: '请等待位置获取完成',
        variant: 'destructive'
      });
      return;
    }

    // 验证附件
    if (attachments.length === 0) {
      toast({
        title: '请上传附件',
        description: '请拍照或录制视频作为打卡凭证',
        variant: 'destructive'
      });
      return;
    }
    setSubmitting(true);
    try {
      // 获取云开发实例
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const _ = tcb.command;

      // 上传附件到云存储
      const uploadPromises = attachments.map(async file => {
        const fileName = `checkin_${Date.now()}_${file.name}`;
        const uploadResult = await tcb.uploadFile({
          cloudPath: `attendance/${fileName}`,
          filePath: file
        });
        return {
          url: uploadResult.fileID,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        };
      });
      const uploadedAttachments = await Promise.all(uploadPromises);

      // 创建打卡记录
      const record = {
        personnelName: currentUser?.nickName || currentUser?.name || '未知',
        personnelId: currentUser?.userId || '',
        checkInTime: Date.now(),
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        status: status,
        attachments: uploadedAttachments,
        _openid: currentUser?.userId || ''
      };
      await db.collection('attendance').add(record);
      toast({
        title: '打卡成功',
        description: '打卡记录已同步至后台',
        variant: 'default'
      });

      // 延迟跳转回首页
      setTimeout(() => {
        $w.utils.navigateTo({
          pageId: 'home',
          params: {}
        });
      }, 1500);
    } catch (error) {
      console.error('提交失败:', error);
      toast({
        title: '提交失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 初始化
  useEffect(() => {
    setLoading(true);

    // 获取位置
    getCurrentLocation();

    // 更新时间
    updateCurrentTime();
    const timer = setInterval(updateCurrentTime, 1000);
    setLoading(false);
    return () => {
      clearInterval(timer);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);
  if (loading) {
    return <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2463] mx-auto mb-4"></div>
          <p className="text-[#999999]">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* 顶部导航栏 - 深蓝色 */}
      <div className="bg-[#0A2463] text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <button onClick={() => $w.utils.navigateBack()} className="flex items-center text-white hover:text-[#E8E8E8] transition-colors button-press">
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-[18px] font-bold">打卡签到</h1>
          <div className="w-14"></div>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* 当前时间和位置信息 - 1x1 并排布局 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 当前时间卡片 */}
          <Card className="shadow-md border-l-4 border-l-[#0A2463] rounded-[8px]">
            <CardHeader className="pb-1.5 pt-3 px-3">
              <CardTitle className="text-[12px] flex items-center text-[#0A2463]">
                <Clock className="w-3.5 h-3.5 mr-1" />
                当前时间
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3 pb-3">
              <div className="text-[18px] font-bold text-[#0A2463] font-mono">
                {currentTime}
              </div>
            </CardContent>
          </Card>

          {/* 位置信息卡片 */}
          <Card className="shadow-md border-l-4 border-l-[#0A2463] rounded-[8px]">
            <CardHeader className="pb-1.5 pt-3 px-3">
              <CardTitle className="text-[12px] flex items-center text-[#0A2463]">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                打卡位置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0 px-3 pb-3">
              <div className="flex items-start space-x-1">
                <Navigation className="w-3 h-3 mt-0.5 text-[#999999] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[12px] text-[#999999] mb-0.5">详细地址</p>
                  <p className="text-[12px] font-medium text-[#333333] line-clamp-2">{location.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-[#BFBFBF] flex-shrink-0"></div>
                <p className="text-[12px] text-[#999999]">
                  {location.longitude?.toFixed(4) || '--'}, {location.latitude?.toFixed(4) || '--'}
                </p>
              </div>
              <Button onClick={getCurrentLocation} variant="outline" size="sm" className="w-full mt-1 h-7 text-[12px] rounded-[8px] button-press button-hover">
                <Navigation className="w-3 h-3 mr-1" />
                重新定位
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 签到状态选择 */}
        <Card className="shadow-md rounded-[8px]">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-[14px] text-[#333333] font-bold">签到状态</CardTitle>
            <CardDescription className="text-[12px] text-[#999999]">请选择您的签到状态</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-3">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setStatus('normal')} className={`p-3 rounded-[8px] border-2 transition-all button-press button-hover ${status === 'normal' ? 'border-[#007A5A] bg-[#E8F5E9]' : 'border-[#E8E8E8] bg-white hover:border-[#007A5A]'}`}>
                <CheckCircle className={`w-6 h-6 mx-auto mb-1 ${status === 'normal' ? 'text-[#007A5A]' : 'text-[#BFBFBF]'}`} />
                <p className={`text-[14px] font-medium ${status === 'normal' ? 'text-[#007A5A]' : 'text-[#333333]'}`}>正常</p>
              </button>
              <button onClick={() => setStatus('abnormal')} className={`p-3 rounded-[8px] border-2 transition-all button-press button-hover ${status === 'abnormal' ? 'border-[#FA8C16] bg-[#FFF7E6]' : 'border-[#E8E8E8] bg-white hover:border-[#FA8C16]'}`}>
                <AlertCircle className={`w-6 h-6 mx-auto mb-1 ${status === 'abnormal' ? 'text-[#FA8C16]' : 'text-[#BFBFBF]'}`} />
                <p className={`text-[14px] font-medium ${status === 'abnormal' ? 'text-[#FA8C16]' : 'text-[#333333]'}`}>异常</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 附件上传 */}
        <Card className="shadow-md rounded-[8px]">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-[14px] text-[#333333] font-bold">打卡凭证</CardTitle>
            <CardDescription className="text-[12px] text-[#999999]">请拍照或录制视频作为打卡凭证</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 px-4 pb-3">
            {previewUrl ? <div className="relative">
                {attachments[0]?.type.startsWith('image/') ? <img src={previewUrl} alt="预览" className="w-full h-36 object-cover rounded-[8px]" /> : <video src={previewUrl} controls className="w-full h-36 object-cover rounded-[8px]" />}
                <button onClick={clearAttachment} className="absolute top-2 right-2 bg-[#D92121] text-white rounded-full p-1.5 shadow-lg hover:bg-[#B91C1C] transition-colors button-press">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div> : <div className="grid grid-cols-2 gap-2">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <div className="p-3 border-2 border-dashed border-[#E8E8E8] rounded-[8px] hover:border-[#0A2463] hover:bg-[#F5F7FA] transition-all text-center button-press">
                    <Camera className="w-6 h-6 mx-auto mb-1 text-[#BFBFBF]" />
                    <p className="text-[12px] font-medium text-[#333333]">拍照</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                  <div className="p-3 border-2 border-dashed border-[#E8E8E8] rounded-[8px] hover:border-[#0A2463] hover:bg-[#F5F7FA] transition-all text-center button-press">
                    <Video className="w-6 h-6 mx-auto mb-1 text-[#BFBFBF]" />
                    <p className="text-[12px] font-medium text-[#333333]">录像</p>
                  </div>
                </label>
              </div>}
          </CardContent>
        </Card>

        {/* 提交按钮 - 深绿色 */}
        <Button onClick={handleSubmit} disabled={submitting} className="w-full h-11 text-[16px] font-bold bg-[#007A5A] hover:bg-[#006648] shadow-lg rounded-[8px] button-press button-hover">
          {submitting ? <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              提交中...
            </> : '提交打卡'}
        </Button>
      </div>
    </div>;
}