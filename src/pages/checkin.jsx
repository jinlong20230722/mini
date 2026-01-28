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
    address: '正在获取位置...',
    detail: '',
    province: '',
    city: '',
    district: '',
    township: '',
    street: '',
    streetNumber: ''
  });
  const [status, setStatus] = useState('normal'); // normal: 正常, abnormal: 异常
  const [attachments, setAttachments] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 逆地理编码：将经纬度转换为详细地址
  const reverseGeocode = async (latitude, longitude) => {
    // 诊断信息
    const diagnosticInfo = {
      timestamp: new Date().toISOString(),
      coordinates: {
        latitude,
        longitude
      },
      userAgent: navigator.userAgent,
      providers: []
    };
    console.log('='.repeat(60));
    console.log('🔍 开始逆地理编码诊断');
    console.log('📍 坐标信息:', {
      latitude,
      longitude
    });
    console.log('🌐 User Agent:', navigator.userAgent);
    console.log('='.repeat(60));

    // 尝试多个地图 API，提高成功率
    const providers = [{
      name: '腾讯地图',
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=J5BBZ-YPECN-XOBFC-STPG6-YSTRV-3FBCK&get_poi=1&coord_type=1`,
      parse: data => {
        if (data.status === 0 && data.result) {
          const addr = data.result.address_component || {};
          return {
            formatted: data.result.address || '',
            province: addr.province || '',
            city: addr.city || '',
            district: addr.district || '',
            township: addr.township || '',
            street: addr.street || '',
            streetNumber: addr.street_number || ''
          };
        }
        return null;
      }
    }, {
      name: '高德地图',
      url: `https://restapi.amap.com/v3/geocode/regeo?output=json&location=${longitude},${latitude}&key=YOUR_AMAP_KEY&radius=1000&extensions=base`,
      parse: data => {
        if (data.status === '1' && data.regeocode) {
          const addr = data.regeocode.addressComponent || {};
          return {
            formatted: data.regeocode.formatted_address || '',
            province: addr.province || '',
            city: addr.city || '',
            district: addr.district || '',
            township: addr.township || '',
            street: addr.street || '',
            streetNumber: addr.streetNumber || ''
          };
        }
        return null;
      }
    }];

    // 依次尝试各个地图 API
    for (const provider of providers) {
      const providerInfo = {
        name: provider.name,
        url: provider.url,
        success: false,
        error: null,
        responseTime: 0,
        httpStatus: null,
        apiStatus: null,
        apiMessage: null
      };
      try {
        console.log(`\n🔄 [${provider.name}] 开始请求...`);
        console.log(`📡 请求 URL:`, provider.url);
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时

        const response = await fetch(provider.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        providerInfo.responseTime = responseTime;
        providerInfo.httpStatus = response.status;
        console.log(`⏱️ 响应时间: ${responseTime}ms`);
        console.log(`📊 HTTP 状态: ${response.status} ${response.statusText}`);
        if (!response.ok) {
          const errorText = await response.text();
          providerInfo.error = `HTTP ${response.status}: ${errorText}`;
          console.error(`❌ [${provider.name}] HTTP 错误:`, response.status, errorText);
          console.error(`📄 错误响应:`, errorText);
          diagnosticInfo.providers.push(providerInfo);
          continue; // 尝试下一个 provider
        }
        const data = await response.json();
        console.log(`📦 [${provider.name}] API 返回数据:`, JSON.stringify(data, null, 2));

        // 检查 API 状态
        if (data.status !== undefined) {
          providerInfo.apiStatus = data.status;
          providerInfo.apiMessage = data.message || data.info || '';
          console.log(`🔍 API 状态码:`, data.status);
          console.log(`📝 API 消息:`, data.message || data.info || '');
        }
        const result = provider.parse(data);
        if (result) {
          providerInfo.success = true;
          console.log(`✅ [${provider.name}] 解析成功!`);
          console.log(`📍 解析结果:`, result);

          // 组合详细地址
          let detailAddress = '';
          if (result.province) detailAddress += result.province;
          if (result.city && result.city !== result.province) detailAddress += result.city;
          if (result.district) detailAddress += result.district;
          if (result.township) detailAddress += result.township;
          if (result.street) detailAddress += result.street;
          if (result.streetNumber) detailAddress += result.streetNumber;
          console.log(`🏠 完整地址:`, detailAddress);
          console.log('='.repeat(60));
          diagnosticInfo.providers.push(providerInfo);
          console.log('📊 诊断信息汇总:', JSON.stringify(diagnosticInfo, null, 2));
          return {
            formatted: result.formatted,
            detail: detailAddress,
            province: result.province,
            city: result.city,
            district: result.district,
            township: result.township,
            street: result.street,
            streetNumber: result.streetNumber
          };
        } else {
          providerInfo.error = `API 返回状态: ${data.status}, 消息: ${data.message || data.info || '未知错误'}`;
          console.error(`❌ [${provider.name}] API 返回错误:`, data);
          console.error(`🔍 错误详情:`, {
            status: data.status,
            message: data.message,
            info: data.info
          });
        }
      } catch (error) {
        providerInfo.error = error.message || error.toString();
        console.error(`❌ [${provider.name}] 逆地理编码失败:`, error);
        console.error(`🔍 错误类型:`, error.name);
        console.error(`🔍 错误消息:`, error.message);
        console.error(`🔍 错误堆栈:`, error.stack);
      }
      diagnosticInfo.providers.push(providerInfo);
    }

    // 所有 API 都失败了
    console.error('\n' + '='.repeat(60));
    console.error('❌ 所有地图 API 都失败了');
    console.error('📊 诊断信息汇总:', JSON.stringify(diagnosticInfo, null, 2));
    console.error('='.repeat(60));

    // 显示友好的错误提示
    const errorDetails = diagnosticInfo.providers.map(p => `${p.name}: ${p.error || '未知错误'} (HTTP ${p.httpStatus || 'N/A'}, API ${p.apiStatus || 'N/A'})`).join('; ');
    return {
      formatted: '地址解析失败',
      detail: `所有地图服务都无法获取地址信息。\n\n诊断信息:\n${errorDetails}\n\n请检查:\n1. 网络连接是否正常\n2. 腾讯地图 API Key 配置是否正确\n3. 是否在微信小程序环境中运行`,
      province: '',
      city: '',
      district: '',
      township: '',
      street: '',
      streetNumber: ''
    };
  };

  // 获取当前位置
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async position => {
        const {
          latitude,
          longitude
        } = position.coords;

        // 先显示经纬度
        setLocation({
          latitude,
          longitude,
          address: '正在获取详细地址...'
        });

        // 进行逆地理编码
        const addressInfo = await reverseGeocode(latitude, longitude);

        // 更新地址信息
        setLocation({
          latitude,
          longitude,
          address: addressInfo.formatted || addressInfo.detail,
          detail: addressInfo.detail,
          province: addressInfo.province,
          city: addressInfo.city,
          district: addressInfo.district,
          township: addressInfo.township,
          street: addressInfo.street,
          streetNumber: addressInfo.streetNumber
        });
        toast({
          title: '位置获取成功',
          description: addressInfo.formatted || addressInfo.detail,
          variant: 'default'
        });
      }, error => {
        console.error('获取位置失败:', error);
        let errorMsg = '位置获取失败';
        if (error.code === 1) {
          errorMsg = '定位权限被拒绝，请在浏览器设置中开启定位权限';
        } else if (error.code === 2) {
          errorMsg = '无法获取位置信息，请检查网络连接';
        } else if (error.code === 3) {
          errorMsg = '定位超时，请重试';
        }
        toast({
          title: '位置获取失败',
          description: errorMsg,
          variant: 'destructive'
        });
        setLocation({
          latitude: null,
          longitude: null,
          address: errorMsg
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
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p className="text-[#999999]">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* 顶部导航栏 - 明亮蓝色 */}
      <div className="bg-[#3B82F6] text-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => $w.utils.navigateBack()} className="flex items-center text-white hover:text-[#E8E8E8] transition-colors">
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
          <Card className="shadow-sm border-l-4 border-l-[#3B82F6] rounded-[4px]">
            <CardHeader className="pb-1.5 pt-3 px-3">
              <CardTitle className="text-[12px] flex items-center text-[#3B82F6]">
                <Clock className="w-3.5 h-3.5 mr-1" />
                当前时间
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3 pb-3">
              <div className="text-[18px] font-bold text-[#3B82F6] font-mono">
                {currentTime}
              </div>
            </CardContent>
          </Card>

          {/* 位置信息卡片 */}
          <Card className="shadow-sm border-l-4 border-l-[#3B82F6] rounded-[4px]">
            <CardHeader className="pb-1.5 pt-3 px-3">
              <CardTitle className="text-[12px] flex items-center text-[#3B82F6]">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                打卡位置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 px-3 pb-3">
              {/* 详细地址 */}
              <div className="flex items-start space-x-1">
                <Navigation className="w-3 h-3 mt-0.5 text-[#999999] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[12px] text-[#999999] mb-0.5">详细地址</p>
                  <p className="text-[12px] font-medium text-[#333333] line-clamp-2 leading-relaxed">{location.address}</p>
                </div>
              </div>
              
              {/* 行政区划信息 */}
              {location.province && <div className="flex items-start space-x-1">
                  <div className="w-3 h-3 rounded-full bg-[#BFBFBF] flex-shrink-0 mt-0.5"></div>
                  <div className="flex-1">
                    <p className="text-[12px] text-[#999999] mb-0.5">行政区划</p>
                    <p className="text-[12px] text-[#666666] leading-relaxed">
                      {location.province}
                      {location.city && location.city !== location.province && ` ${location.city}`}
                      {location.district && ` ${location.district}`}
                    </p>
                  </div>
                </div>}
              
              {/* 街道信息 */}
              {location.street && <div className="flex items-start space-x-1">
                  <div className="w-3 h-3 rounded-full bg-[#BFBFBF] flex-shrink-0 mt-0.5"></div>
                  <div className="flex-1">
                    <p className="text-[12px] text-[#999999] mb-0.5">街道信息</p>
                    <p className="text-[12px] text-[#666666] leading-relaxed">
                      {location.street}
                      {location.streetNumber && ` ${location.streetNumber}`}
                    </p>
                  </div>
                </div>}
              

              
              {/* 重新定位按钮 */}
              <Button onClick={getCurrentLocation} variant="outline" size="sm" className="w-full mt-1 h-7 text-[12px] rounded-[4px] border-[#3B82F6] text-[#3B82F6] hover:bg-[#DBEAFE]">
                <Navigation className="w-3 h-3 mr-1" />
                重新定位
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 签到状态选择 */}
        <Card className="shadow-sm rounded-[4px]">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-[14px] text-[#333333] font-bold">签到状态</CardTitle>
            <CardDescription className="text-[12px] text-[#999999]">请选择您的签到状态</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-3">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setStatus('normal')} className={`p-3 rounded-[4px] border-2 ${status === 'normal' ? 'border-[#10B981] bg-[#D1FAE5]' : 'border-[#E2E8F0] bg-white'}`}>
                <CheckCircle className={`w-6 h-6 mx-auto mb-1 ${status === 'normal' ? 'text-[#10B981]' : 'text-[#9CA3AF]'}`} />
                <p className={`text-[14px] font-medium ${status === 'normal' ? 'text-[#10B981]' : 'text-[#1E293B]'}`}>正常</p>
              </button>
              <button onClick={() => setStatus('abnormal')} className={`p-3 rounded-[4px] border-2 ${status === 'abnormal' ? 'border-[#F59E0B] bg-[#FEF3C7]' : 'border-[#E2E8F0] bg-white'}`}>
                <AlertCircle className={`w-6 h-6 mx-auto mb-1 ${status === 'abnormal' ? 'text-[#F59E0B]' : 'text-[#9CA3AF]'}`} />
                <p className={`text-[14px] font-medium ${status === 'abnormal' ? 'text-[#F59E0B]' : 'text-[#1E293B]'}`}>异常</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 附件上传 */}
        <Card className="shadow-sm rounded-[4px]">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-[14px] text-[#333333] font-bold">打卡凭证</CardTitle>
            <CardDescription className="text-[12px] text-[#999999]">请拍照或录制视频作为打卡凭证</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 px-4 pb-3">
            {previewUrl ? <div className="relative">
                {attachments[0]?.type.startsWith('image/') ? <img src={previewUrl} alt="预览" className="w-full h-36 object-cover rounded-[4px]" /> : <video src={previewUrl} controls className="w-full h-36 object-cover rounded-[4px]" />}
                <button onClick={clearAttachment} className="absolute top-2 right-2 bg-[#D92121] text-white rounded-full p-1.5 shadow-lg hover:bg-[#B91C1C] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div> : <div className="grid grid-cols-2 gap-2">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <div className="p-3 border-2 border-dashed border-[#E2E8F0] rounded-[4px] hover:border-[#3B82F6] hover:bg-[#DBEAFE] transition-all text-center">
                    <Camera className="w-6 h-6 mx-auto mb-1 text-[#9CA3AF]" />
                    <p className="text-[12px] font-medium text-[#1E293B]">拍照</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                  <div className="p-3 border-2 border-dashed border-[#E2E8F0] rounded-[4px] hover:border-[#3B82F6] hover:bg-[#DBEAFE] transition-all text-center">
                    <Video className="w-6 h-6 mx-auto mb-1 text-[#9CA3AF]" />
                    <p className="text-[12px] font-medium text-[#1E293B]">录像</p>
                  </div>
                </label>
              </div>}
          </CardContent>
        </Card>

        {/* 提交按钮 - 明亮绿色 */}
        <Button onClick={handleSubmit} disabled={submitting} className="w-full h-11 text-[16px] font-bold bg-[#10B981] hover:bg-[#059669] shadow-sm rounded-[4px]">
          {submitting ? <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              提交中...
            </> : '提交打卡'}
        </Button>
      </div>
    </div>;
}