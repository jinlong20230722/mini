// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ArrowLeft, Lightbulb, AlertCircle, MessageSquare, Send, CheckCircle } from 'lucide-react';
// @ts-ignore;
import { useToast, Button, Textarea, RadioGroup, RadioGroupItem, Label } from '@/components/ui';

export default function Feedback(props) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState('建议');
  const [content, setContent] = useState('');
  const [user, setUser] = useState(null);
  useEffect(() => {
    checkLoginAndLoadData();
  }, []);
  const checkLoginAndLoadData = async () => {
    setUser(props.$w.auth.currentUser || {
      name: '访客',
      userId: 'guest'
    });
    setLoading(false);
  };
  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: '提示',
        description: '请输入反馈内容',
        variant: 'destructive'
      });
      return;
    }
    try {
      setSubmitting(true);

      // 调用数据源 API 创建反馈记录
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'feedback',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            feedbackType: feedbackType,
            content: content.trim(),
            submitterName: props.$w.auth.currentUser?.name || '访客',
            submitterId: props.$w.auth.currentUser?.userId || 'guest',
            submitTime: Date.now(),
            processStatus: '待处理'
          }
        }
      });
      if (result.success) {
        toast({
          title: '提交成功'
        });

        // 清空表单
        setFeedbackType('建议');
        setContent('');

        // 延迟跳转回首页
        setTimeout(() => {
          props.$w.utils.navigateTo({
            pageId: 'home',
            params: {}
          });
        }, 1500);
      } else {
        throw new Error(result.message || '提交失败');
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      toast({
        title: '提交失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleBack = () => {
    props.$w.utils.navigateTo({
      pageId: 'home',
      params: {}
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p className="text-[#999999]">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-[#F5F7FA]">
      {/* 顶部导航栏 - 深蓝色 */}
      <div className="bg-[#003366] text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={handleBack} className="flex items-center space-x-2 hover:bg-[#004488] px-3 py-2 rounded-[8px] transition-colors button-press">
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </button>
          <h1 className="text-[16px] font-semibold">意见反馈</h1>
          <div className="w-14"></div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-3">
        {/* 反馈类型选择 */}
        <div className="bg-white rounded-[8px] shadow-md p-4 mb-3">
          <h2 className="text-[14px] font-bold text-[#333333] mb-3 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-[#003366]" />
            反馈类型
          </h2>
          <RadioGroup value={feedbackType} onValueChange={setFeedbackType}>
            <div className="space-y-2">
              <div className={`flex items-center space-x-3 p-3 rounded-[8px] border-2 transition-all cursor-pointer button-press button-hover ${feedbackType === '建议' ? 'border-[#003366] bg-[#E6F7FF]' : 'border-[#E8E8E8] hover:border-[#003366]'}`} onClick={() => setFeedbackType('建议')}>
                <RadioGroupItem value="建议" id="suggestion" className="hidden" />
                <Label htmlFor="suggestion" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${feedbackType === '建议' ? 'bg-[#003366]' : 'bg-[#E8E8E8]'}`}>
                    <Lightbulb className={`w-4 h-4 ${feedbackType === '建议' ? 'text-white' : 'text-[#333333]'}`} />
                  </div>
                  <div>
                    <div className={`font-medium text-[14px] ${feedbackType === '建议' ? 'text-[#003366]' : 'text-[#333333]'}`}>建议</div>
                    <div className="text-[12px] text-[#999999]">提出改进建议和意见</div>
                  </div>
                </Label>
                {feedbackType === '建议' && <CheckCircle className="w-4 h-4 text-[#003366]" />}
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-[8px] border-2 transition-all cursor-pointer button-press button-hover ${feedbackType === '投诉' ? 'border-[#FA8C16] bg-[#FFF7E6]' : 'border-[#E8E8E8] hover:border-[#FA8C16]'}`} onClick={() => setFeedbackType('投诉')}>
                <RadioGroupItem value="投诉" id="complaint" className="hidden" />
                <Label htmlFor="complaint" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${feedbackType === '投诉' ? 'bg-[#FA8C16]' : 'bg-[#E8E8E8]'}`}>
                    <AlertCircle className={`w-4 h-4 ${feedbackType === '投诉' ? 'text-white' : 'text-[#333333]'}`} />
                  </div>
                  <div>
                    <div className={`font-medium text-[14px] ${feedbackType === '投诉' ? 'text-[#FA8C16]' : 'text-[#333333]'}`}>投诉</div>
                    <div className="text-[12px] text-[#999999]">反映问题和投诉</div>
                  </div>
                </Label>
                {feedbackType === '投诉' && <CheckCircle className="w-4 h-4 text-[#FA8C16]" />}
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-[8px] border-2 transition-all cursor-pointer button-press button-hover ${feedbackType === '其他' ? 'border-[#003366] bg-[#E6F7FF]' : 'border-[#E8E8E8] hover:border-[#003366]'}`} onClick={() => setFeedbackType('其他')}>
                <RadioGroupItem value="其他" id="other" className="hidden" />
                <Label htmlFor="other" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${feedbackType === '其他' ? 'bg-[#003366]' : 'bg-[#E8E8E8]'}`}>
                    <MessageSquare className={`w-4 h-4 ${feedbackType === '其他' ? 'text-white' : 'text-[#333333]'}`} />
                  </div>
                  <div>
                    <div className={`font-medium text-[14px] ${feedbackType === '其他' ? 'text-[#003366]' : 'text-[#333333]'}`}>其他</div>
                    <div className="text-[12px] text-[#999999]">其他类型的反馈</div>
                  </div>
                </Label>
                {feedbackType === '其他' && <CheckCircle className="w-4 h-4 text-[#003366]" />}
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* 反馈内容输入 */}
        <div className="bg-white rounded-[8px] shadow-md p-4 mb-3">
          <h2 className="text-[14px] font-bold text-[#333333] mb-3 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-[#003366]" />
            反馈内容
          </h2>
          <Textarea placeholder="请详细描述您的反馈内容..." value={content} onChange={e => setContent(e.target.value)} className="min-h-[120px] resize-none border-[#E8E8E8] focus:border-[#003366] focus:ring-[#003366] rounded-[8px]" maxLength={500} />
          <div className="text-right text-[12px] text-[#999999] mt-2">
            {content.length}/500
          </div>
        </div>

        {/* 提交按钮 - 深蓝色 */}
        <Button onClick={handleSubmit} disabled={submitting || !content.trim()} className="w-full bg-[#003366] hover:bg-[#004488] text-white font-semibold py-4 text-[16px] shadow-lg rounded-[8px] button-press button-hover transition-all">
          {submitting ? <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              提交中...
            </> : <>
              <Send className="w-4 h-4 mr-2" />
              提交反馈
            </>}
        </Button>

        {/* 提示信息 */}
        <div className="mt-3 text-center text-[12px] text-[#999999]">
          <p>您的反馈将帮助我们改进服务质量</p>
          <p className="mt-0.5">我们会在 1-3 个工作日内处理您的反馈</p>
        </div>
      </div>
    </div>;
}