// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { Calendar, Clock, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft, UserCheck, RefreshCw } from 'lucide-react';

import { useForm } from 'react-hook-form';
export default function LeavePage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('apply');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [approvalRecords, setApprovalRecords] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const form = useForm({
    defaultValues: {
      leaveType: '',
      startTime: '',
      endTime: '',
      reason: ''
    }
  });

  // 检查权限
  useEffect(() => {
    checkPermission();
  }, []);

  // 加载数据
  useEffect(() => {
    if (hasPermission) {
      loadLeaveRecords();
      loadApprovalRecords();
    }
  }, [hasPermission, refreshKey]);
  const checkPermission = async () => {
    try {
      // 移除权限检查，允许所有用户访问
      setHasPermission(true);
      setLoading(false);
    } catch (error) {
      console.error('检查权限失败:', error);
      setHasPermission(true);
      setLoading(false);
    }
  };
  const loadLeaveRecords = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const _ = db.command;
      const result = await db.collection('leave_request').where({
        _openid: _.eq($w.auth.currentUser?.userId || 'guest')
      }).orderBy('startTime', 'desc').get();
      setLeaveRecords(result.data);
    } catch (error) {
      console.error('加载请假记录失败:', error);
    }
  };
  const loadApprovalRecords = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const _ = db.command;

      // 根据当前用户职务确定审批目标
      let approvalTarget = '';
      if (userInfo && ['部长', '开发者'].includes(userInfo.position)) {
        approvalTarget = '部长';
      } else if (userInfo && ['部长', '办公室人员', '开发者'].includes(userInfo.position)) {
        approvalTarget = '人事部';
      }

      // 查询待审批的记录，且审批目标与当前用户匹配
      if (approvalTarget) {
        const result = await db.collection('leave_request').where({
          approvalStatus: _.eq('待审批'),
          approvalTarget: _.eq(approvalTarget)
        }).orderBy('startTime', 'desc').get();
        setApprovalRecords(result.data);
      } else {
        setApprovalRecords([]);
      }
    } catch (error) {
      console.error('加载审批记录失败:', error);
    }
  };
  const onSubmit = async data => {
    if (!data.leaveType) {
      toast({
        title: '请选择请假类型',
        variant: 'destructive'
      });
      return;
    }
    if (!data.startTime || !data.endTime) {
      toast({
        title: '请选择请假时间',
        variant: 'destructive'
      });
      return;
    }
    if (!data.reason) {
      toast({
        title: '请填写请假原因',
        variant: 'destructive'
      });
      return;
    }
    setSubmitting(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 根据职务确定审批目标
      let approvalTarget = '';
      if (['班长', '队长'].includes(userInfo.position)) {
        approvalTarget = '部长';
      } else if (['部长', '办公室人员', '开发者'].includes(userInfo.position)) {
        approvalTarget = '人事部';
      }
      await db.collection('leave_request').add({
        personnelName: userInfo.name,
        personnelId: userInfo.personnelId,
        position: userInfo.position,
        leaveType: data.leaveType,
        startTime: new Date(data.startTime).getTime(),
        endTime: new Date(data.endTime).getTime(),
        reason: data.reason,
        approvalStatus: '待审批',
        approvalTarget: approvalTarget,
        _openid: $w.auth.currentUser?.userId || 'guest',
        createTime: Date.now()
      });
      toast({
        title: '提交成功',
        description: `请假申请已提交，等待${approvalTarget}审批`
      });
      form.reset();
      setRefreshKey(prev => prev + 1);
      setActiveTab('myLeave');
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
  const handleApprove = async (record, status) => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const _ = db.command;
      await db.collection('leave_request').where({
        _id: _.eq(record._id)
      }).update({
        approvalStatus: status,
        approver: userInfo.name,
        approvalTime: Date.now()
      });
      toast({
        title: '操作成功',
        description: status === '已通过' ? '已通过该请假申请' : '已驳回该请假申请'
      });
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('操作失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleReturn = async record => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const _ = db.command;
      await db.collection('leave_request').where({
        _id: _.eq(record._id)
      }).update({
        approvalStatus: '已销假',
        returnTime: Date.now()
      });
      toast({
        title: '销假成功',
        description: '已成功销假'
      });
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('销假失败:', error);
      toast({
        title: '销假失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const getStatusBadge = status => {
    const statusConfig = {
      '待审批': {
        bg: 'bg-[#FFF7E6]',
        text: 'text-[#FA8C16]',
        icon: Clock
      },
      '已通过': {
        bg: 'bg-[#E8F0E8]',
        text: 'text-[#3D5A3D]',
        icon: CheckCircle
      },
      '已驳回': {
        bg: 'bg-[#FFF1F0]',
        text: 'text-[#D92121]',
        icon: XCircle
      },
      '已销假': {
        bg: 'bg-[#E6F7FF]',
        text: 'text-[#0A2463]',
        icon: UserCheck
      }
    };
    const config = statusConfig[status] || statusConfig['待审批'];
    const Icon = config.icon;
    return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[12px] font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>;
  };
  const formatDate = timestamp => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2463]"></div>
          <p className="mt-4 text-[#999999]">加载中...</p>
        </div>
      </div>;
  }
  if (!hasPermission) {
    return <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-[8px] shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-[#D92121] mx-auto mb-4" />
          <h2 className="text-[20px] font-bold text-[#333333] mb-2">权限不足</h2>
          <p className="text-[#999999] mb-6">仅班长、队长、部长、办公室人员、开发者可访问此页面</p>
          <Button onClick={() => $w.utils.navigateTo({
          pageId: 'home',
          params: {}
        })} className="w-full bg-[#0A2463] hover:bg-[#0D2E7A] rounded-[8px] button-press button-hover">
            返回首页
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-[#F5F7FA] pb-20">
      {/* 顶部导航栏 - 深蓝色 */}
      <div className="bg-[#0A2463] text-white px-4 py-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => $w.utils.navigateTo({
            pageId: 'home',
            params: {}
          })} className="text-white hover:bg-[#0D2E7A] button-press">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-[18px] font-bold">请销假管理</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setRefreshKey(prev => prev + 1)} className="text-white hover:bg-[#0D2E7A] button-press">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Tab 切换 */}
        <div className="bg-white rounded-[8px] shadow-md p-1 mb-4 flex gap-1">
          {[{
          id: 'apply',
          label: '请假申请',
          icon: FileText
        }, {
          id: 'myLeave',
          label: '我的请假',
          icon: UserCheck
        }, {
          id: 'approval',
          label: '审批记录',
          icon: CheckCircle
        }, {
          id: 'return',
          label: '销假管理',
          icon: RefreshCw
        }].map(tab => {
          const Icon = tab.icon;
          return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-[8px] text-[14px] font-medium transition-all button-press button-hover ${activeTab === tab.id ? 'bg-[#0A2463] text-white shadow-md' : 'text-[#333333] hover:bg-[#F5F7FA]'}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>;
        })}
        </div>

        {/* 请假申请表单 */}
        {activeTab === 'apply' && <div className="bg-white rounded-[8px] shadow-md p-6">
            <h2 className="text-[18px] font-bold text-[#333333] mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0A2463]" />
              请假申请
            </h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="leaveType" render={({
              field
            }) => <FormItem>
                      <FormLabel className="text-[#333333] font-medium">请假类型 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full rounded-[8px]">
                            <SelectValue placeholder="请选择请假类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="事假">事假</SelectItem>
                          <SelectItem value="病假">病假</SelectItem>
                          <SelectItem value="年假">年假</SelectItem>
                          <SelectItem value="调休">调休</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="startTime" render={({
              field
            }) => <FormItem>
                      <FormLabel className="text-[#333333] font-medium">开始时间 *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} className="w-full rounded-[8px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="endTime" render={({
              field
            }) => <FormItem>
                      <FormLabel className="text-[#333333] font-medium">结束时间 *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} className="w-full rounded-[8px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="reason" render={({
              field
            }) => <FormItem>
                      <FormLabel className="text-[#333333] font-medium">请假原因 *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="请详细说明请假原因" {...field} className="w-full min-h-[100px] resize-none rounded-[8px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <Button type="submit" disabled={submitting} className="w-full bg-[#0A2463] hover:bg-[#0D2E7A] rounded-[8px] button-press button-hover">
                  {submitting ? '提交中...' : '提交申请'}
                </Button>
              </form>
            </Form>
          </div>}

        {/* 我的请假记录 */}
        {activeTab === 'myLeave' && <div className="space-y-4">
            {leaveRecords.length === 0 ? <div className="bg-white rounded-[8px] shadow-md p-8 text-center">
                <FileText className="w-16 h-16 text-[#BFBFBF] mx-auto mb-4" />
                <p className="text-[#999999]">暂无请假记录</p>
              </div> : leaveRecords.map(record => <div key={record._id} className="bg-white rounded-[8px] shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#333333]">{record.leaveType}</span>
                        {getStatusBadge(record.approvalStatus)}
                      </div>
                      <p className="text-[14px] text-[#999999]">
                        {formatDate(record.startTime)} - {formatDate(record.endTime)}
                      </p>
                    </div>
                  </div>
                  {record.approver && <div className="text-[14px] text-[#999999]">
                      <span className="font-medium">审批人：</span>
                      {record.approver}
                    </div>}
                  {record.approvalTarget && !record.approver && <div className="text-[14px] text-[#0A2463] mt-1">
                      <span className="font-medium">审批目标：</span>
                      {record.approvalTarget}
                    </div>}
                  {record.reason && <div className="text-[14px] text-[#999999] mt-1">
                      <span className="font-medium">请假原因：</span>
                      {record.reason}
                    </div>}
                  {record.returnTime && <div className="text-[14px] text-[#999999] mt-1">
                      <span className="font-medium">销假时间：</span>
                      {formatDate(record.returnTime)}
                    </div>}
                </div>)}
          </div>}

        {/* 审批记录 */}
        {activeTab === 'approval' && <div className="space-y-4">
            {approvalRecords.length === 0 ? <div className="bg-white rounded-[8px] shadow-md p-8 text-center">
                <CheckCircle className="w-16 h-16 text-[#BFBFBF] mx-auto mb-4" />
                <p className="text-[#999999]">暂无待审批记录</p>
              </div> : approvalRecords.map(record => <div key={record._id} className="bg-white rounded-[8px] shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#333333]">{record.personnelName}</span>
                        <span className="text-[14px] text-[#999999]">{record.position}</span>
                        {getStatusBadge(record.approvalStatus)}
                      </div>
                      <p className="text-[14px] text-[#999999]">
                        {record.leaveType} | {formatDate(record.startTime)} - {formatDate(record.endTime)}
                      </p>
                      {record.reason && <p className="text-[14px] text-[#999999] mt-1">
                          原因：{record.reason}
                        </p>}
                      {record.approvalTarget && <p className="text-[12px] text-[#0A2463] mt-1">
                          审批目标：{record.approvalTarget}
                        </p>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => handleApprove(record, '已通过')} className="flex-1 bg-[#3D5A3D] hover:bg-[#2D4A2D] rounded-[8px] button-press button-hover">
                      通过
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleApprove(record, '已驳回')} className="flex-1 bg-[#D92121] hover:bg-[#B91C1C] rounded-[8px] button-press button-hover">
                      驳回
                    </Button>
                  </div>
                </div>)}
          </div>}

        {/* 销假管理 */}
        {activeTab === 'return' && <div className="space-y-4">
            {leaveRecords.length === 0 ? <div className="bg-white rounded-[8px] shadow-md p-8 text-center">
                <RefreshCw className="w-16 h-16 text-[#BFBFBF] mx-auto mb-4" />
                <p className="text-[#999999]">暂无请假记录</p>
              </div> : leaveRecords.filter(record => record.approvalStatus === '已通过').map(record => <div key={record._id} className="bg-white rounded-[8px] shadow-md p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[#333333]">{record.leaveType}</span>
                          {getStatusBadge(record.approvalStatus)}
                        </div>
                        <p className="text-[14px] text-[#999999]">
                          {formatDate(record.startTime)} - {formatDate(record.endTime)}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleReturn(record)} className="w-full bg-[#0A2463] hover:bg-[#0D2E7A] rounded-[8px] button-press button-hover">
                      销假
                    </Button>
                  </div>)}
          </div>}
      </div>
    </div>;
}