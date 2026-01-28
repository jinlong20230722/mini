// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, Button, useToast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { User, Phone, Building2, Briefcase, IdCard, MapPin, UserPlus, PhoneCall, Calendar, Upload, CheckCircle2, AlertCircle, X, ChevronRight } from 'lucide-react';

import { useForm } from 'react-hook-form';
export default function RegistrationPage(props) {
  const {
    toast
  } = useToast();
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [otherDocuments, setOtherDocuments] = useState([]);
  const [recordId, setRecordId] = useState(null);
  const form = useForm({
    defaultValues: {
      name: '',
      phone: '',
      department: '',
      position: '',
      idCard: '',
      registeredResidence: '',
      emergencyContact: '',
      emergencyPhone: '',
      joinDate: new Date().toISOString().split('T')[0],
      status: '在职'
    }
  });

  // 检查用户是否已登记
  useEffect(() => {
    checkRegistrationStatus();
  }, []);
  const checkRegistrationStatus = async () => {
    try {
      const currentUser = props.$w.auth.currentUser || {
        userId: 'guest'
      };
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                _openid: {
                  $eq: currentUser.userId
                }
              }]
            }
          },
          select: {
            $master: true
          },
          pageSize: 1,
          pageNumber: 1
        }
      });
      if (result.records && result.records.length > 0) {
        const record = result.records[0];
        setIsRegistered(true);
        setRecordId(record._id);
        // 填充表单数据
        form.reset({
          name: record.name || '',
          phone: record.phone || '',
          department: record.department || '',
          position: record.position || '',
          idCard: record.idCard || '',
          registeredResidence: record.registeredResidence || '',
          emergencyContact: record.emergencyContact || '',
          emergencyPhone: record.emergencyPhone || '',
          joinDate: record.joinDate ? record.joinDate.split('T')[0] : new Date().toISOString().split('T')[0],
          status: record.status || '在职'
        });
        // 设置证件图片
        if (record.documents && record.documents.length > 0) {
          const docs = record.documents;
          if (docs[0]) setIdCardFront(docs[0]);
          if (docs[1]) setIdCardBack(docs[1]);
          if (docs.length > 2) {
            setOtherDocuments(docs.slice(2));
          }
        }
      }
    } catch (error) {
      console.error('查询登记状态失败:', error);
      toast({
        title: '查询失败',
        description: error.message || '查询登记状态失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 模拟身份证识别
  const recognizeIdCard = (image, type) => {
    return new Promise(resolve => {
      setTimeout(() => {
        // 模拟识别结果
        if (type === 'front') {
          resolve({
            idCard: '110101199001011234',
            registeredResidence: '北京市东城区'
          });
        } else {
          resolve({});
        }
      }, 1000);
    });
  };

  // 处理身份证正面上传
  const handleIdCardFrontUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '文件类型错误',
        description: '请上传图片文件',
        variant: 'destructive'
      });
      return;
    }

    // 检查文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '图片大小不能超过5MB',
        variant: 'destructive'
      });
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = async event => {
        const imageData = event.target.result;
        setIdCardFront(imageData);

        // 模拟身份证识别
        toast({
          title: '正在识别身份证',
          description: '请稍候...'
        });
        const result = await recognizeIdCard(imageData, 'front');
        if (result.idCard) {
          form.setValue('idCard', result.idCard);
          form.setValue('registeredResidence', result.registeredResidence);
          toast({
            title: '识别成功',
            description: '身份证信息已自动填充'
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: '上传失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 处理身份证背面上传
  const handleIdCardBackUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: '文件类型错误',
        description: '请上传图片文件',
        variant: 'destructive'
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '图片大小不能超过5MB',
        variant: 'destructive'
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      setIdCardBack(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 处理其他证件上传
  const handleOtherDocumentUpload = e => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: '文件类型错误',
          description: `${file.name} 不是图片文件`,
          variant: 'destructive'
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: '文件过大',
          description: `${file.name} 大小超过5MB`,
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        setOtherDocuments(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 删除证件图片
  const removeDocument = (index, type) => {
    if (type === 'front') {
      setIdCardFront(null);
    } else if (type === 'back') {
      setIdCardBack(null);
    } else {
      setOtherDocuments(prev => prev.filter((_, i) => i !== index));
    }
  };

  // 提交表单
  const onSubmit = async data => {
    // 验证身份证正反面
    if (!idCardFront) {
      toast({
        title: '请上传身份证正面',
        description: '身份证正面照片为必填项',
        variant: 'destructive'
      });
      return;
    }
    if (!idCardBack) {
      toast({
        title: '请上传身份证背面',
        description: '身份证背面照片为必填项',
        variant: 'destructive'
      });
      return;
    }
    setSubmitting(true);
    try {
      const currentUser = props.$w.auth.currentUser;

      // 组装证件图片数组
      const documents = [idCardFront, idCardBack, ...otherDocuments];
      const submitData = {
        ...data,
        documents,
        _openid: currentUser?.userId || 'guest'
      };
      let result;
      if (isRegistered && recordId) {
        // 更新已有记录
        result = await props.$w.cloud.callDataSource({
          dataSourceName: 'personnel',
          methodName: 'wedaUpdateV2',
          params: {
            data: submitData,
            filter: {
              where: {
                $and: [{
                  _id: {
                    $eq: recordId
                  }
                }]
              }
            }
          }
        });
      } else {
        // 创建新记录
        result = await props.$w.cloud.callDataSource({
          dataSourceName: 'personnel',
          methodName: 'wedaCreateV2',
          params: {
            data: submitData
          }
        });
      }
      toast({
        title: '提交成功',
        description: isRegistered ? '入职信息已更新' : '入职登记已提交'
      });
      setIsRegistered(true);
      if (result.id) {
        setRecordId(result.id);
      }

      // 延迟跳转回首页
      setTimeout(() => {
        props.$w.utils.navigateTo({
          pageId: 'home',
          params: {}
        });
      }, 1500);
    } catch (error) {
      console.error('提交失败:', error);
      toast({
        title: '提交失败',
        description: error.message || '提交入职信息失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* 顶部导航栏 */}
      <div className="bg-[#003366] text-white px-4 py-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <button onClick={() => props.$w.utils.navigateTo({
          pageId: 'home',
          params: {}
        })} className="flex items-center text-white hover:text-blue-200 transition-colors">
            <ChevronRight className="w-6 h-6 rotate-180" />
            <span className="ml-1">返回</span>
          </button>
          <h1 className="text-lg font-semibold">入职登记</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* 状态卡片 */}
        <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 shadow-md ${isRegistered ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' : 'bg-gradient-to-r from-blue-900 to-blue-800 text-white'}`}>
          {isRegistered ? <CheckCircle2 className="w-8 h-8 flex-shrink-0" /> : <AlertCircle className="w-8 h-8 flex-shrink-0" />}
          <div>
            <p className="font-semibold text-lg">
              {isRegistered ? '已登记' : '待登记'}
            </p>
            <p className="text-sm opacity-90">
              {isRegistered ? '您的入职信息已完善' : '请完善您的入职信息'}
            </p>
          </div>
        </div>

        {/* 表单 */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 基本信息 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-900" />
                基本信息
              </h2>
              
              <div className="space-y-3">
                <FormField control={form.control} name="name" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-slate-700">姓名 *</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入姓名" {...field} className="border-slate-200 focus:border-blue-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="phone" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-slate-700">手机号 *</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入手机号" type="tel" {...field} className="border-slate-200 focus:border-blue-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="department" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-slate-700">部门 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-slate-200 focus:border-blue-900">
                            <SelectValue placeholder="请选择部门" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="保安一部">保安一部</SelectItem>
                          <SelectItem value="保安二部">保安二部</SelectItem>
                          <SelectItem value="保安三部">保安三部</SelectItem>
                          <SelectItem value="保安四部">保安四部</SelectItem>
                          <SelectItem value="保安五部">保安五部</SelectItem>
                          <SelectItem value="保安六部">保安六部</SelectItem>
                          <SelectItem value="保安七部">保安七部</SelectItem>
                          <SelectItem value="保安八部">保安八部</SelectItem>
                          <SelectItem value="直属部门">直属部门</SelectItem>
                          <SelectItem value="运营部">运营部</SelectItem>
                          <SelectItem value="人事部">人事部</SelectItem>
                          <SelectItem value="财务部">财务部</SelectItem>
                          <SelectItem value="外勤部">外勤部</SelectItem>
                          <SelectItem value="物资部">物资部</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="position" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-slate-700">职务 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-slate-200 focus:border-blue-900">
                            <SelectValue placeholder="请选择职务" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="保安">保安</SelectItem>
                          <SelectItem value="班长">班长</SelectItem>
                          <SelectItem value="队长">队长</SelectItem>
                          <SelectItem value="部长">部长</SelectItem>
                          <SelectItem value="办公室人员">办公室人员</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="joinDate" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-slate-700">入职时间 *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="border-slate-200 focus:border-blue-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
            </div>

            {/* 身份证信息 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <IdCard className="w-5 h-5 text-blue-900" />
                身份证信息
              </h2>

              <div className="space-y-4">
                {/* 身份证上传 - 左右居中摆放 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
                      身份证正面 *
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-900 transition-colors">
                      {idCardFront ? <div className="relative">
                          <img src={idCardFront} alt="身份证正面" className="w-full h-40 object-cover rounded-lg" />
                          <button type="button" onClick={() => removeDocument(null, 'front')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div> : <label className="flex flex-col items-center justify-center cursor-pointer">
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="text-sm text-slate-600">点击上传身份证正面</span>
                          <input type="file" accept="image/*" onChange={handleIdCardFrontUpload} className="hidden" />
                        </label>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
                      身份证背面 *
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-900 transition-colors">
                      {idCardBack ? <div className="relative">
                          <img src={idCardBack} alt="身份证背面" className="w-full h-40 object-cover rounded-lg" />
                          <button type="button" onClick={() => removeDocument(null, 'back')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div> : <label className="flex flex-col items-center justify-center cursor-pointer">
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="text-sm text-slate-600">点击上传身份证背面</span>
                          <input type="file" accept="image/*" onChange={handleIdCardBackUpload} className="hidden" />
                        </label>}
                    </div>
                  </div>
                </div>

                {/* 自动识别信息 */}
                <div className="space-y-3">
                  <FormField control={form.control} name="idCard" render={({
                  field
                }) => <FormItem>
                        <FormLabel className="text-slate-700">身份证号码 *</FormLabel>
                        <FormControl>
                          <Input placeholder="上传身份证正面自动识别" {...field} readOnly className="bg-slate-50 border-slate-200" />
                        </FormControl>
                        <FormDescription className="text-xs">
                          上传身份证正面照片可自动识别
                        </FormDescription>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="registeredResidence" render={({
                  field
                }) => <FormItem>
                        <FormLabel className="text-slate-700">户籍所在地 *</FormLabel>
                        <FormControl>
                          <Input placeholder="上传身份证正面自动识别" {...field} className="border-slate-200 focus:border-blue-900" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>
              </div>
            </div>

            {/* 紧急联系人 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-blue-900" />
                紧急联系人
              </h2>

              <div className="space-y-3">
                <FormField control={form.control} name="emergencyContact" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-slate-700">紧急联系人 *</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入紧急联系人姓名" {...field} className="border-slate-200 focus:border-blue-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="emergencyPhone" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-slate-700">紧急联系电话 *</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入紧急联系电话" type="tel" {...field} className="border-slate-200 focus:border-blue-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
            </div>

            {/* 其他证件 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-900" />
                其他证件
              </h2>

              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-900 transition-colors">
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600">点击上传其他证件（可多选）</span>
                  <span className="text-xs text-slate-400 mt-1">保安证/消防证/退伍证/毕业证/其他证件</span>
                  <input type="file" accept="image/*" multiple onChange={handleOtherDocumentUpload} className="hidden" />
                </label>
              </div>

              {otherDocuments.length > 0 && <div className="mt-4 grid grid-cols-3 gap-3">
                  {otherDocuments.map((doc, index) => <div key={index} className="relative">
                      <img src={doc} alt={`证件${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeDocument(index, 'other')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>)}
                </div>}
            </div>

            {/* 提交按钮 */}
            <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold py-6 text-lg shadow-lg">
              {submitting ? <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  提交中...
                </span> : <span className="flex items-center gap-2">
                  {isRegistered ? '更新信息' : '提交登记'}
                  <ChevronRight className="w-5 h-5" />
                </span>}
            </Button>
          </form>
        </Form>
      </div>
    </div>;
}