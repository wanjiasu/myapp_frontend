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
import { signUp } from "@/server/user"

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
import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"

const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
  email: z.string().email(),
  password: z.string().min(8),
})

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [isloading, setIsloading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 获取 Telegram 参数
  const tgUserId = searchParams.get('tg_user_id')
  const tgChatId = searchParams.get('tg_chat_id')
  const tgStartParam = searchParams.get('tg_start_param')
  
  // 检查是否来自 Telegram
  const isFromTelegram = !!(tgUserId && tgChatId)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // 自动绑定 Telegram 账户的函数
  const autoBindTelegram = async () => {
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
        toast.success('🎉 Telegram 账户绑定成功！页面将在 3 秒后自动关闭')
        
        // 延迟 3 秒后关闭页面
        setTimeout(() => {
          // 尝试关闭当前窗口
          if (window.opener) {
            // 如果是弹出窗口，关闭自己
            window.close()
          } else {
            // 如果不是弹出窗口，尝试返回上一页或关闭标签页
            try {
              window.close()
            } catch (e) {
              // 如果无法关闭，显示提示
              toast.info('请手动关闭此页面返回 Telegram')
            }
          }
        }, 3000)
      } else {
        const error = await bindResponse.json()
        toast.error(error.error || '绑定失败')
      }
    } catch (error) {
      console.error('Auto binding error:', error)
      toast.error('自动绑定过程中发生错误')
    }
  }

  // Google 登录并自动绑定
  const signInWithGoogle = async () => {
    setIsGoogleLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      
      // 登录成功后检查会话并自动绑定
      if (isFromTelegram) {
        // 等待一下让登录状态更新
        setTimeout(async () => {
          const session = await authClient.getSession()
          if (session?.data?.user) {
            await autoBindTelegram()
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Google 登录失败')
    } finally {
      setIsGoogleLoading(false)
    }
  };
 
  // 邮箱注册并自动绑定
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsloading(true)
    try {
      const {success, message} = await signUp(values.username, values.email, values.password)
      if (success) {
        toast.success(message as string)
        
        // 注册成功后自动绑定 Telegram
        if (isFromTelegram) {
          await autoBindTelegram()
        }
        
        router.push("/")
      } else {
        toast.error(message as string)
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('注册过程中发生错误')
    } finally {
      setIsloading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {isFromTelegram ? "绑定 Telegram 账号" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {isFromTelegram 
              ? "检测到来自 Telegram，注册或登录后将自动绑定您的 Telegram 账号" 
              : "Sign up with your Google account or email"
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
                    ? "登录中..." 
                    : isFromTelegram 
                      ? "🔗 使用 Google 立即绑定账号" 
                      : "Sign up with Google"
                  }
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">

                <div className="grid gap-3">
                    <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className="grid gap-3">
                    <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
    
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isloading}>
                  {isloading 
                    ? "处理中..." 
                    : isFromTelegram 
                      ? "🔗 注册并绑定 Telegram" 
                      : "Sign up"
                  }
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a 
                  href={isFromTelegram 
                    ? `/login?tg_user_id=${tgUserId}&tg_chat_id=${tgChatId}${tgStartParam ? `&tg_start_param=${tgStartParam}` : ''}` 
                    : "/login"
                  } 
                  className="underline underline-offset-4"
                >
                  {isFromTelegram ? "登录并绑定" : "Login"}
                </a>
              </div>
            </div>
          </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
