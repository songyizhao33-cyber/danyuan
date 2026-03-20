import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { questionnaireApi } from '../services/api';

// 问卷验证模式
const questionnaireSchema = z.object({
  basicInfo: z.object({
    gender: z.string().optional(),
    preferredGender: z.string().optional(),
    purpose: z.string().optional(),
    age: z.number().optional(),
    campus: z.string().optional(),
    hometown: z.string().optional(),
    education: z.string().optional(),
  }),
  familyAttitude: z.object({
    marriageIntention: z.number().min(1).max(7).optional(),
    familyLifeView: z.string().optional(),
    childrenAttitude: z.number().min(1).max(7).optional(),
  }),
  lifestyle: z.object({
    consumptionStyle: z.number().min(1).max(7).optional(),
    drinking: z.union([z.boolean(), z.string()]).optional(),
    freeTimeActivities: z.array(z.string()).optional(),
    sleepSchedule: z.string().optional(),
  }),
  interests: z.object({
    hobbies: z.array(z.string()).optional(),
    sports: z.array(z.string()).optional(),
    music: z.array(z.string()).optional(),
    movies: z.array(z.string()).optional(),
  }),
  personality: z.object({
    relationshipAttitude: z.object({}).optional(),
    socialHabits: z.number().min(1).max(7).optional(),
    jungianType: z.string().optional(),
  }),
});

type QuestionnaireFormData = z.infer<typeof questionnaireSchema>;

const Questionnaire: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      basicInfo: {},
      familyAttitude: {},
      lifestyle: {
        freeTimeActivities: [],
      },
      interests: {
        hobbies: [],
        sports: [],
        music: [],
        movies: [],
      },
      personality: {
        relationshipAttitude: {},
      },
    },
  });

  // 加载问卷数据
  useEffect(() => {
    const loadQuestionnaire = async () => {
      try {
        const response = await questionnaireApi.getQuestionnaire();
        if (response.questionnaire) {
          // 设置表单值
          Object.entries(response.questionnaire).forEach(([key, value]) => {
            if (key !== '_id' && key !== 'userId' && key !== 'progress' && key !== 'isCompleted' && key !== 'updatedAt' && key !== 'completedAt') {
              setValue(key as keyof QuestionnaireFormData, value as any);
            }
          });
          // 设置当前步骤
          const progress = response.questionnaire.progress || 0;
          setCurrentStep(Math.min(Math.floor(progress / 20), 4));
        }
      } catch (error) {
        setLoadError('加载问卷失败，请刷新页面重试');
      }
    };

    loadQuestionnaire();
  }, [setValue]);

  // 自动保存
  useEffect(() => {
    const formData = watch();
    const timer = setTimeout(() => {
      saveQuestionnaire(formData);
    }, 3000);

    return () => clearTimeout(timer);
  }, [watch]);

  // 保存问卷
  const saveQuestionnaire = async (data: QuestionnaireFormData) => {
    try {
      // 处理drinking值，将字符串转换为布尔值
      const processedData = {
        ...data,
        lifestyle: {
          ...data.lifestyle,
          drinking: data.lifestyle?.drinking === 'true'
        },
        progress: (currentStep + 1) * 20,
      };
      
      await questionnaireApi.saveQuestionnaire(processedData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('保存问卷失败:', error);
    }
  };

  // 提交问卷
  const onSubmit = async (data: QuestionnaireFormData) => {
    setSubmitError('');
    try {
      // 处理drinking值，将字符串转换为布尔值
      const processedData = {
        ...data,
        lifestyle: {
          ...data.lifestyle,
          drinking: data.lifestyle?.drinking === 'true'
        }
      };
      
      await questionnaireApi.submitQuestionnaire(processedData);
      setSubmitSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      setSubmitError((error as Error).message || '提交问卷失败，请稍后重试');
    }
  };

  // 步骤配置
  const steps = [
    {
      title: '基础信息',
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">性别</label>
            <div className="flex space-x-4">
              {['男', '女', '其他'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    {...register('basicInfo.gender')}
                    value={option}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">希望匹配性别</label>
            <div className="flex space-x-4">
              {['男', '女', '不限'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    {...register('basicInfo.preferredGender')}
                    value={option}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">来本平台目的</label>
            <select {...register('basicInfo.purpose')} className="w-full px-4 py-2 border border-gray-300 rounded-md">
              <option value="">请选择</option>
              <option value="恋爱">恋爱</option>
              <option value="交友">交友</option>
              <option value="婚姻">婚姻</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">年龄</label>
            <input
              type="number"
              {...register('basicInfo.age')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="请输入年龄"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">校区</label>
            <input
              type="text"
              {...register('basicInfo.campus')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="请输入校区"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">家乡</label>
            <input
              type="text"
              {...register('basicInfo.hometown')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="请输入家乡"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">教育程度</label>
            <input
              type="text"
              {...register('basicInfo.education')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="请输入教育程度"
            />
          </div>
        </div>
      ),
    },
    {
      title: '家庭婚育态度',
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">对恋爱直达婚姻的意愿强度</label>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <label key={value} className="flex flex-col items-center">
                  <input
                    type="radio"
                    {...register('familyAttitude.marriageIntention')}
                    value={value}
                    className="mr-2"
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>非常不愿意</span>
              <span>非常愿意</span>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">家庭生活观</label>
            <textarea
              {...register('familyAttitude.familyLifeView')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="请描述您的家庭生活观"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">对生育的态度</label>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <label key={value} className="flex flex-col items-center">
                  <input
                    type="radio"
                    {...register('familyAttitude.childrenAttitude')}
                    value={value}
                    className="mr-2"
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>非常不愿意</span>
              <span>非常愿意</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '日常生活习惯和观念',
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">消费风格</label>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <label key={value} className="flex flex-col items-center">
                  <input
                    type="radio"
                    {...register('lifestyle.consumptionStyle')}
                    value={value}
                    className="mr-2"
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>非常节俭</span>
              <span>非常大手大脚</span>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">是否饮酒</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('lifestyle.drinking')}
                    value="true"
                    className="mr-2"
                  />
                  是
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('lifestyle.drinking')}
                    value="false"
                    className="mr-2"
                  />
                  否
                </label>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">如何度过空余时间</label>
            <div className="grid grid-cols-2 gap-2">
              {['阅读', '运动', '看电影', '听音乐', '旅行', '打游戏', '社交', '学习'].map((activity) => (
                <label key={activity} className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const current = watch('lifestyle.freeTimeActivities') || [];
                      if (e.target.checked) {
                        setValue('lifestyle.freeTimeActivities', [...current, activity]);
                      } else {
                        setValue('lifestyle.freeTimeActivities', current.filter((item) => item !== activity));
                      }
                    }}
                    className="mr-2"
                  />
                  {activity}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">作息时间</label>
            <input
              type="text"
              {...register('lifestyle.sleepSchedule')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="例如：晚上12点睡，早上8点起"
            />
          </div>
        </div>
      ),
    },
    {
      title: '兴趣爱好',
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">兴趣爱好</label>
            <div className="grid grid-cols-2 gap-2">
              {['阅读', '运动', '音乐', '电影', '旅行', '摄影', '烹饪', '手工', '科技', '艺术'].map((hobby) => (
                <label key={hobby} className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const current = watch('interests.hobbies') || [];
                      if (e.target.checked) {
                        setValue('interests.hobbies', [...current, hobby]);
                      } else {
                        setValue('interests.hobbies', current.filter((item) => item !== hobby));
                      }
                    }}
                    className="mr-2"
                  />
                  {hobby}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">运动爱好</label>
            <div className="grid grid-cols-2 gap-2">
              {['篮球', '足球', '羽毛球', '乒乓球', '跑步', '游泳', '健身', '瑜伽'].map((sport) => (
                <label key={sport} className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const current = watch('interests.sports') || [];
                      if (e.target.checked) {
                        setValue('interests.sports', [...current, sport]);
                      } else {
                        setValue('interests.sports', current.filter((item) => item !== sport));
                      }
                    }}
                    className="mr-2"
                  />
                  {sport}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">音乐偏好</label>
            <div className="grid grid-cols-2 gap-2">
              {['流行', '摇滚', '古典', '爵士', '电子', '民谣', '说唱', '其他'].map((music) => (
                <label key={music} className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const current = watch('interests.music') || [];
                      if (e.target.checked) {
                        setValue('interests.music', [...current, music]);
                      } else {
                        setValue('interests.music', current.filter((item) => item !== music));
                      }
                    }}
                    className="mr-2"
                  />
                  {music}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">电影偏好</label>
            <div className="grid grid-cols-2 gap-2">
              {['动作', '喜剧', '爱情', '科幻', '悬疑', '恐怖', '纪录片', '其他'].map((movie) => (
                <label key={movie} className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const current = watch('interests.movies') || [];
                      if (e.target.checked) {
                        setValue('interests.movies', [...current, movie]);
                      } else {
                        setValue('interests.movies', current.filter((item) => item !== movie));
                      }
                    }}
                    className="mr-2"
                  />
                  {movie}
                </label>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '人格测试',
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">个人社交习惯</label>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <label key={value} className="flex flex-col items-center">
                  <input
                    type="radio"
                    {...register('personality.socialHabits')}
                    value={value}
                    className="mr-2"
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>极度内向</span>
              <span>极度外向</span>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">荣格八维测试结果</label>
            <input
              type="text"
              {...register('personality.jungianType')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="例如：INTJ"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">对亲密关系问题的测评</label>
            <textarea
              {...register('personality.relationshipAttitude')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="请描述您对亲密关系的态度"
              rows={3}
            />
          </div>
        </div>
      ),
    },
  ];

  // 下一步
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 上一步
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-oxford-light p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-oxford-blue mb-4">加载失败</h2>
            <p className="text-red-500 mb-6">{loadError}</p>
            <button
              className="bg-oxford-blue text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition"
              onClick={() => window.location.reload()}
            >
              刷新页面
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-oxford-light p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-oxford-blue mb-4">提交成功</h2>
            <p className="text-green-500 mb-6">问卷已提交，正在跳转...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-oxford-light p-4">
      <div className="max-w-4xl mx-auto">
        <header className="bg-oxford-blue text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">旦缘</h1>
            <button 
              className="bg-white text-oxford-blue px-4 py-2 rounded-md hover:bg-opacity-90 transition"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth';
              }}
            >
              退出登录
            </button>
          </div>
        </header>
        
        <main className="bg-white p-6 rounded-b-lg shadow-lg">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">问卷</h2>
            <p className="text-gray-600 mb-4">请完成以下问卷，帮助我们为您找到合适的匹配对象</p>
            
            {/* 进度条 */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div 
                className="bg-oxford-blue h-2.5 rounded-full" 
                style={{ width: `${(currentStep + 1) * 20}%` }}
              ></div>
            </div>
            
            {/* 步骤导航 */}
            <div className="flex justify-between mb-6">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${index <= currentStep ? 'bg-oxford-blue text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {index + 1}
                  </div>
                  <span className={`text-sm ${index <= currentStep ? 'text-oxford-blue font-medium' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 自动保存提示 */}
          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              问卷已自动保存
            </div>
          )}
          
          {/* 提交错误提示 */}
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {submitError}
            </div>
          )}
          
          {/* 问卷表单 */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {steps[currentStep].fields}
            
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                className={`px-6 py-3 rounded-md ${currentStep > 0 ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                上一步
              </button>
              
              {currentStep === steps.length - 1 ? (
                <button
                  type="submit"
                  className="bg-oxford-blue text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition"
                >
                  提交问卷
                </button>
              ) : (
                <button
                  type="button"
                  className="bg-oxford-blue text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition"
                  onClick={handleNext}
                >
                  下一步
                </button>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Questionnaire;