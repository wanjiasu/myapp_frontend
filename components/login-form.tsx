'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { signIn } from "@/server/user"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { z } from "zod";
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { useTranslations } from 'next-intl'

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export function LoginForm({
  className,
  onShowSignup,
  ...props
}: React.ComponentProps<"div"> & {
  onShowSignup?: () => void
}) {

  const t = useTranslations('auth')
  const [isloading, setIsloading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 获取 Telegram 参数
  const tgUserId = searchParams.get('tg_user_id')
  const tgChatId = searchParams.get('tg_chat_id')
  const tgStartParam = searchParams.get('tg_start_param')
  const googleCallback = searchParams.get('google_callback')
  
  // 检查是否来自 Telegram
  const isFromTelegram = !!(tgUserId && tgChatId)
  
  // 自动绑定 Telegram 账户的函数
  const autoBindTelegram = useCallback(async () => {
    if (!isFromTelegram) return
    
    try {
      // 1. 生成 bind_token
      const tokenResponse = await fetch('/api/telegram/bind-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tg_user_id: tgUserId,
          tg_chat_id: tgChatId,
        }),
      })
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to generate bind token')
      }
      
      const tokenData = await tokenResponse.json()
      
      // 2. 确认绑定
      const bindResponse = await fetch('/api/bind/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bind_token: tokenData.bind_token,
          tg_start_param: tgStartParam,
        }),
      })
      
      if (bindResponse.ok) {
        toast.success('🎉 Telegram 账户绑定成功！页面将立即关闭')
        
        // 发送绑定成功通知到 Telegram
        try {
          const session = await authClient.getSession()
          const userName = (session?.data?.user?.name || session?.data?.user?.email || '用户') as string
          
          await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/telegram/binding-success', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: parseInt(tgChatId!),
              user_name: userName,
            }),
          })
        } catch (error) {
          console.error('Failed to send binding success notification:', error)
        }
        
        // 立即关闭页面，不再等待 3 秒
        // 尝试关闭当前窗口
        if (window.opener) {
          // 如果是弹出窗口，关闭自己
          window.close()
        } else {
          // 如果不是弹出窗口，尝试返回上一页或关闭标签页
          try {
            window.close()
          } catch {
            // 如果无法关闭，显示提示
            toast.info('请手动关闭此页面返回 Telegram')
          }
        }
      } else {
        const error = await bindResponse.json()
        toast.error(error.error || '绑定失败')
      }
    } catch (error) {
      console.error('Auto binding error:', error)
      toast.error('自动绑定过程中发生错误')
    }
  }, [isFromTelegram, tgUserId, tgChatId, tgStartParam])
  
  // 处理 Google 登录回调后的自动绑定
  useEffect(() => {
    const handleGoogleCallback = async () => {
      if (googleCallback && isFromTelegram) {
        setTimeout(async () => {
          const session = await authClient.getSession()
          if (session?.data?.user) {
            await autoBindTelegram()
          }
        }, 1000)
      }
    }
    
    handleGoogleCallback()
  }, [googleCallback, isFromTelegram, autoBindTelegram])
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Google 登录并自动绑定
  const signInWithGoogle = async () => {
    setIsGoogleLoading(true)
    try {
      // 如果是从 Telegram 来的，构建带参数的回调 URL
      let callbackURL = "/"
      if (isFromTelegram) {
        callbackURL = `/login?tg_user_id=${tgUserId}&tg_chat_id=${tgChatId}&tg_start_param=${tgStartParam}&google_callback=true`
      }
      
      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackURL,
      });
      
      // 注意：Google 登录会跳转，所以这里的代码在回调后才会执行
      // 实际的绑定逻辑会在页面重新加载后的 useEffect 中处理
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Google 登录失败')
    } finally {
      setIsGoogleLoading(false)
    }
  };
 
  // 邮箱登录并自动绑定
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsloading(true)
    try {
      const {success, message} = await signIn(values.email, values.password)
      if (success) {
        toast.success(message as string)
        
        // 登录成功后自动绑定 Telegram
        if (isFromTelegram) {
          await autoBindTelegram()
          // 如果是从 Telegram 来的，不跳转首页，让页面关闭逻辑处理
        } else {
          // 只有非 Telegram 用户才跳转首页
          router.push("/")
        }
      } else {
        toast.error(message as string)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('登录过程中发生错误')
    } finally {
      setIsloading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {isFromTelegram ? t('bindTelegramAccount') : t('login')}
          </CardTitle>
          <CardDescription>
            {isFromTelegram 
              ? t('telegramBindingDescription') 
              : t('loginWithGoogle')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  type="button" 
                  onClick={signInWithGoogle}
                  disabled={isGoogleLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {isGoogleLoading 
                    ? t('signingIn') 
                    : isFromTelegram 
                      ? t('bindWithGoogle') 
                      : t('loginWithGoogle')
                  }
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  {t('orContinueWith')}
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input placeholder={t('emailPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
                <div className="grid gap-3">
                  <div className="flex flex-col gap-2">
                    <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('password')}</FormLabel>
              <FormControl>
                <Input placeholder={t('passwordPlaceholder')} {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
    
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isloading}>
                  {isloading 
                    ? t('processing') 
                    : isFromTelegram 
                      ? t('loginAndBind') 
                      : t('login')
                  }
                </Button>
              </div>
            </div>
          </form>
          </Form>
          <div className="text-center text-sm">
            {t('dontHaveAccount')}{" "}
            {onShowSignup ? (
              <button 
                onClick={onShowSignup}
                className="underline underline-offset-4 hover:text-primary cursor-pointer"
              >
                {isFromTelegram ? t('signupAndBindTelegram') : t('signup')}
              </button>
            ) : (
              <Link 
                href={isFromTelegram 
                  ? `/signup?tg_user_id=${tgUserId}&tg_chat_id=${tgChatId}${tgStartParam ? `&tg_start_param=${tgStartParam}` : ''}` 
                  : "/signup"
                } 
                className="underline underline-offset-4 hover:text-primary cursor-pointer"
              >
                {isFromTelegram ? t('signupAndBindTelegram') : t('signup')}
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        {t('agreementText') || 'By clicking continue, you agree to our'}{" "}
        <Link href="/termsofservice">{t('termsOfService')}</Link>{" "}
        {t('and') || 'and'}{" "}
        <Link href="/privacypolicy">{t('privacyPolicy')}</Link>.
      </div>
    </div>
  )
}
