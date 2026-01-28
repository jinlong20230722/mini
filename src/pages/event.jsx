// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { ArrowLeft, Camera, Video, Mic, MapPin, Send, CheckCircle, AlertCircle, Shield, Heart, AlertTriangle, Flame, Users, Clock, X, ChevronRight } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

export default function EventReport(props) {
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // 事件类型配置
  const eventTypes = [{
    id: '培训演习',
    label: '培训演习',
    icon: Shield,
    color: 'bg-[#0A2463]',
    desc: '培训、演练活动'
  }, {
    id: '好人好事',
    label: '好人好事',
    icon: Heart,
    color: 'bg-[#3D5A3D]',
    desc: '拾金不昧、助人为乐'
  }, {
    id: '应急处突',
    label: '应急处突',
    icon: AlertTriangle,
    color: 'bg-[#FA8C16]',
    desc: '突发事件处理'
  }, {
    id: '治安消防',
    label: '治安消防',
    icon: Flame,
    color: 'bg-[#D92121]',
    desc: '治安、消防事件'
  }, {
    id: '警保联动',
    label: '警保联动',
    icon: Users,
    color: 'bg-[#0A2463]',
    desc: '警保协同工作'
  }, {
    id: '临时勤务',
    label: '临时勤务',
    icon: Clock,
    color: 'bg-[#3D5A3D]',
    desc: '临时任务安排'
  }];

  // 获取当前位置
  useEffect(() => {
    getCurrentLocation();
    initSpeechRecognition();
  }, []);
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const {
          latitude,
          longitude
        } = position.coords;
        setCurrentLocation({
          latitude,
          longitude
        });
        // 模拟逆地理编码
        setAddress(`纬度: ${latitude.toFixed(6)}, 经度: ${longitude.toFixed(6)}`);
        setLoading(false);
      }, error => {
        console.error('获取位置失败:', error);
        toast({
          title: '位置获取失败',
          description: '请检查定位权限设置',
          variant: 'destructive'
        });
        setLoading(false);
      }, {
        enableHighAccuracy: true,
        timeout: 10000
      });
    } else {
      toast({
        title: '定位不支持',
        description: '您的浏览器不支持定位功能',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  // 初始化语音识别
  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = event => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setDescription(prev => prev + finalTranscript);
        }
      };
      recognition.onerror = event => {
        console.error('语音识别错误:', event.error);
        setIsRecording(false);
        if (event.error !== 'no-speech') {
          toast({
            title: '语音识别失败',
            description: '请重试或使用文字输入',
            variant: 'destructive'
          });
        }
      };
      recognition.onend = () => {
        setIsRecording(false);
      };
      setRecognition(recognition);
    }
  };

  // 开始录音
  const startRecording = () => {
    if (!recognition) {
      toast({
        title: '语音识别不支持',
        description: '您的浏览器不支持语音识别功能',
        variant: 'destructive'
      });
      return;
    }
    try {
      recognition.start();
      setIsRecording(true);
    } catch (error) {
      console.error('启动录音失败:', error);
      toast({
        title: '录音启动失败',
        description: '请重试',
        variant: 'destructive'
      });
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  // 处理按钮按下事件
  const handleVoicePressStart = e => {
    e.preventDefault();
    startRecording();
  };

  // 处理按钮释放事件
  const handleVoicePressEnd = e => {
    e.preventDefault();
    stopRecording();
  };

  // 选择事件类型
  const handleSelectType = typeId => {
    setSelectedType(typeId);
  };

  // 处理文件上传
  const handleFileUpload = e => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    files.forEach(file => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
          title: '文件类型错误',
          description: '仅支持图片和视频文件',
          variant: 'destructive'
        });
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: '文件过大',
          description: '文件大小不能超过 50MB',
          variant: 'destructive'
        });
        return;
      }
      validFiles.push(file);
    });
    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
      toast({
        title: '文件添加成功',
        description: `已添加 ${validFiles.length} 个文件`
      });
    }
  };

  // 删除附件
  const handleRemoveAttachment = index => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // 上传文件到云存储
  const uploadFiles = async files => {
    const tcb = await $w.cloud.getCloudInstance();
    const uploadPromises = files.map(async file => {
      const fileName = `event_${Date.now()}_${file.name}`;
      const result = await tcb.uploadFile({
        cloudPath: `event_attachments/${fileName}`,
        filePath: file
      });
      return {
        url: result.fileID,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        name: file.name
      };
    });
    return Promise.all(uploadPromises);
  };

  // 提交事件上报
  const handleSubmit = async () => {
    if (!selectedType) {
      toast({
        title: '请选择事件类型',
        description: '请选择一个事件类型',
        variant: 'destructive'
      });
      return;
    }
    if (!description.trim()) {
      toast({
        title: '请输入事件描述',
        description: '请描述事件详情',
        variant: 'destructive'
      });
      return;
    }
    if (!currentLocation) {
      toast({
        title: '位置信息缺失',
        description: '请等待位置信息加载',
        variant: 'destructive'
      });
      return;
    }
    setSubmitting(true);
    try {
      // 上传附件
      let uploadedAttachments = [];
      if (attachments.length > 0) {
        uploadedAttachments = await uploadFiles(attachments);
      }

      // 获取用户信息
      const currentUser = $w.auth.currentUser;
      const reporterName = currentUser?.nickName || currentUser?.name || '未知';
      const reporterId = currentUser?.userId || '';

      // 创建事件记录
      await $w.cloud.callDataSource({
        dataSourceName: 'event_report',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            eventType: selectedType,
            description: description,
            voiceToText: description,
            // 语音转文字内容
            reporterName: reporterName,
            reporterId: reporterId,
            reportTime: Date.now(),
            address: address,
            attachments: uploadedAttachments,
            _openid: reporterId
          }
        }
      });
      toast({
        title: '上报成功',
        description: '事件已成功上报'
      });

      // 重置表单
      setSelectedType('');
      setDescription('');
      setAttachments([]);

      // 跳转回首页
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
  if (loading) {
    return <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2463] mx-auto mb-4"></div>
          <p className="text-[#999999]">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-[#F5F7FA]">
      {/* 顶部导航栏 - 深蓝色 */}
      <div className="bg-[#0A2463] text-white px-4 py-4 flex items-center justify-between shadow-lg">
        <button onClick={() => $w.utils.navigateBack()} className="flex items-center space-x-2 hover:bg-[#0D2E7A] px-3 py-2 rounded-[8px] transition-colors button-press">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">返回</span>
        </button>
        <h1 className="text-[18px] font-bold">事件上报</h1>
        <div className="w-20"></div>
      </div>

      <div className="p-4 pb-24 space-y-4">
        {/* 事件类型选择 */}
        <div className="bg-white rounded-[8px] shadow-md p-4">
          <h2 className="text-[14px] font-bold text-[#333333] mb-3">选择事件类型</h2>
          <div className="grid grid-cols-2 gap-3">
            {eventTypes.map(type => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return <button key={type.id} onClick={() => handleSelectType(type.id)} className={`p-4 rounded-[8px] border-2 transition-all button-press button-hover ${isSelected ? `${type.color} border-transparent text-white shadow-lg scale-105` : 'border-[#E8E8E8] hover:border-[#0A2463] hover:shadow-md'}`}>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-[#333333]'}`} />
                    <div>
                      <p className={`text-[14px] font-semibold ${isSelected ? 'text-white' : 'text-[#333333]'}`}>
                        {type.label}
                      </p>
                      <p className={`text-[12px] ${isSelected ? 'text-white/80' : 'text-[#999999]'}`}>
                        {type.desc}
                      </p>
                    </div>
                  </div>
                </button>;
          })}
          </div>
        </div>

        {/* 事件描述 */}
        <div className="bg-white rounded-[8px] shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-bold text-[#333333]">事件描述</h2>
            <button onMouseDown={handleVoicePressStart} onMouseUp={handleVoicePressEnd} onMouseLeave={handleVoicePressEnd} onTouchStart={handleVoicePressStart} onTouchEnd={handleVoicePressEnd} className={`flex items-center space-x-2 px-4 py-2 rounded-[8px] text-[14px] font-medium transition-all select-none touch-manipulation button-press button-hover ${isRecording ? 'bg-[#D92121] text-white animate-pulse scale-105' : 'bg-[#0A2463] text-white hover:bg-[#0D2E7A]'}`}>
              <Mic className="w-5 h-5" />
              <span>{isRecording ? '松开停止' : '按住语音输入'}</span>
            </button>
          </div>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="请详细描述事件情况..." className="w-full h-32 px-4 py-3 border border-[#E8E8E8] rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0A2463] focus:border-transparent resize-none" />
          <p className="text-[12px] text-[#999999] mt-2">支持语音输入自动转文字</p>
        </div>

        {/* 附件上传 */}
        <div className="bg-white rounded-[8px] shadow-md p-4">
          <h2 className="text-[14px] font-bold text-[#333333] mb-3">附件（可选）</h2>
          <div className="space-y-3">
            {/* 上传按钮区域 */}
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                <div className="p-4 border-2 border-dashed border-[#E8E8E8] rounded-[8px] hover:border-[#0A2463] hover:bg-[#F5F7FA] transition-all text-center button-press">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-[#BFBFBF]" />
                  <p className="text-[12px] font-medium text-[#333333]">拍照</p>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="file" accept="video/*" multiple onChange={handleFileUpload} className="hidden" />
                <div className="p-4 border-2 border-dashed border-[#E8E8E8] rounded-[8px] hover:border-[#0A2463] hover:bg-[#F5F7FA] transition-all text-center button-press">
                  <Video className="w-8 h-8 mx-auto mb-2 text-[#BFBFBF]" />
                  <p className="text-[12px] font-medium text-[#333333]">录像</p>
                </div>
              </label>
            </div>

            {/* 已上传的附件 */}
            {attachments.length > 0 && <div className="grid grid-cols-3 gap-3">
                {attachments.map((file, index) => {
              const isVideo = file.type.startsWith('video/');
              return <div key={index} className="relative aspect-square rounded-[8px] overflow-hidden">
                      {isVideo ? <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" /> : <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />}
                      <button onClick={() => handleRemoveAttachment(index)} className="absolute top-1 right-1 w-6 h-6 bg-[#D92121] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#B91C1C] transition-colors button-press">
                        <X className="w-4 h-4" />
                      </button>
                      {isVideo && <div className="absolute bottom-1 left-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center">
                          <Video className="w-3 h-3" />
                        </div>}
                    </div>;
            })}
              </div>}
          </div>
          <p className="text-[12px] text-[#999999] mt-2">支持图片和视频，单个文件最大 50MB</p>
        </div>

        {/* 位置信息 */}
        <div className="bg-white rounded-[8px] shadow-md p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#E8F5E9] rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#3D5A3D]" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] text-[#999999] mb-1">当前位置</p>
              <p className="text-[14px] font-medium text-[#333333] truncate">{address || '获取中...'}</p>
            </div>
            <button onClick={getCurrentLocation} className="px-3 py-1.5 bg-[#F5F7FA] text-[#0A2463] text-[12px] font-medium rounded-[8px] hover:bg-[#E8E8E8] transition-colors button-press button-hover">
              重新定位
            </button>
          </div>
        </div>

        {/* 提交按钮 - 红色 */}
        <button onClick={handleSubmit} disabled={submitting} className={`w-full py-4 rounded-[8px] font-semibold text-white shadow-lg transition-all button-press button-hover ${submitting ? 'bg-[#BFBFBF] cursor-not-allowed' : 'bg-[#D92121] hover:bg-[#B91C1C]'}`}>
          {submitting ? <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>提交中...</span>
            </div> : <div className="flex items-center justify-center space-x-2">
              <Send className="w-5 h-5" />
              <span>快速提交</span>
            </div>}
        </button>
      </div>
    </div>;
}