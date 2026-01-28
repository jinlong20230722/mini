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
      if (result && result.id) {
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
        throw new Error(result?.message || '提交失败，未返回有效数据');
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
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p className="text-[#999999]">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-[#F8FAFC]">
      {/* 顶部导航栏 - 明亮蓝色 */}
      <div className="bg-[#3B82F6] text-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={handleBack} className="flex items-center space-x-2 hover:bg-[#2563EB] px-3 py-2 rounded-[4px] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </button>
          <h1 className="text-[16px] font-semibold">意见反馈</h1>
          <div className="w-14"></div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-3">
        {/* 反馈类型选择 */}
        <div className="bg-white rounded-[4px] shadow-sm p-4 mb-3">
          <h2 className="text-[14px] font-bold text-[#1E293B] mb-3 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-[#3B82F6]" />
            反馈类型
          </h2>
          <RadioGroup value={feedbackType} onValueChange={setFeedbackType}>
            <div className="space-y-2">
              <div className={`flex items-center space-x-3 p-3 rounded-[4px] border-2 transition-all cursor-pointer ${feedbackType === '建议' ? 'border-[#3B82F6] bg-[#DBEAFE]' : 'border-[#E2E8F0] hover:border-[#3B82F6]'}`} onClick={() => setFeedbackType('建议')}>
                <RadioGroupItem value="建议" id="suggestion" className="hidden" />
                <Label htmlFor="suggestion" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${feedbackType === '建议' ? 'bg-[#3B82F6]' : 'bg-[#E2E8F0]'}`}>
                    <Lightbulb className={`w-4 h-4 ${feedbackType === '建议' ? 'text-white' : 'text-[#1E293B]'}`} />
                  </div>
                  <div>
                    <div className={`font-medium text-[14px] ${feedbackType === '建议' ? 'text-[#3B82F6]' : 'text-[#1E293B]'}`}>建议</div>
                    <div className="text-[12px] text-[#64748B]">提出改进建议和意见</div>
                  </div>
                </Label>
                {feedbackType === '建议' && <CheckCircle className="w-4 h-4 text-[#3B82F6]" />}
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-[4px] border-2 transition-all cursor-pointer ${feedbackType === '投诉' ? 'border-[#F59E0B] bg-[#FEF3C7]' : 'border-[#E2E8F0] hover:border-[#F59E0B]'}`} onClick={() => setFeedbackType('投诉')}>
                <RadioGroupItem value="投诉" id="complaint" className="hidden" />
                <Label htmlFor="complaint" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${feedbackType === '投诉' ? 'bg-[#F59E0B]' : 'bg-[#E2E8F0]'}`}>
                    <AlertCircle className={`w-4 h-4 ${feedbackType === '投诉' ? 'text-white' : 'text-[#1E293B]'}`} />
                  </div>
                  <div>
                    <div className={`font-medium text-[14px] ${feedbackType === '投诉' ? 'text-[#F59E0B]' : 'text-[#1E293B]'}`}>投诉</div>
                    <div className="text-[12px] text-[#64748B]">反映问题和投诉</div>
                  </div>
                </Label>
                {feedbackType === '投诉' && <CheckCircle className="w-4 h-4 text-[#F59E0B]" />}
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-[4px] border-2 transition-all cursor-pointer ${feedbackType === '其他' ? 'border-[#3B82F6] bg-[#DBEAFE]' : 'border-[#E2E8F0] hover:border-[#3B82F6]'}`} onClick={() => setFeedbackType('其他')}>
                <RadioGroupItem value="其他" id="other" className="hidden" />
                <Label htmlFor="other" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${feedbackType === '其他' ? 'bg-[#3B82F6]' : 'bg-[#E2E8F0]'}`}>
                    <MessageSquare className={`w-4 h-4 ${feedbackType === '其他' ? 'text-white' : 'text-[#1E293B]'}`} />
                  </div>
                  <div>
                    <div className={`font-medium text-[14px] ${feedbackType === '其他' ? 'text-[#3B82F6]' : 'text-[#1E293B]'}`}>其他</div>
                    <div className="text-[12px] text-[#64748B]">其他类型的反馈</div>
                  </div>
                </Label>
                {feedbackType === '其他' && <CheckCircle className="w-4 h-4 text-[#3B82F6]" />}
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* 反馈内容输入 */}
        <div className="bg-white rounded-[4px] shadow-sm p-4 mb-3">
          <h2 className="text-[14px] font-bold text-[#1E293B] mb-3 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-[#3B82F6]" />
            反馈内容
          </h2>
          <Textarea placeholder="请详细描述您的反馈内容..." value={content} onChange={e => setContent(e.target.value)} className="min-h-[120px] resize-none border-[#E2E8F0] focus:border-[#3B82F6] focus:ring-[#3B82F6] rounded-[4px]" maxLength={500} />
          <div className="text-right text-[12px] text-[#64748B] mt-2">
            {content.length}/500
          </div>
        </div>

        {/* 提交按钮 - 明亮蓝色 */}
        <Button onClick={handleSubmit} disabled={submitting || !content.trim()} className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-4 text-[16px] shadow-sm rounded-[4px] transition-all">
          {submitting ? <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              提交中...
            </> : <>
              <Send className="w-4 h-4 mr-2" />
              提交反馈
            </>}
        </Button>

        {/* 提示信息 */}
        <div className="mt-3 text-center text-[12px] text-[#64748B]">
          <p>您的反馈将帮助我们改进服务质量</p>
          <p className="mt-0.5">我们会在 1-3 个工作日内处理您的反馈</p>
        </div>
      </div>
    </div>;
}