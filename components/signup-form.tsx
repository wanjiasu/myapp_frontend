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
  const [bindToken, setBindToken] = useState<string | null>(null)
  const [isBindingLoading, setIsBindingLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 获取 Telegram 参数
  const tgUserId = searchParams.get('tg_user_id')
  const tgChatId = searchParams.get('tg_chat_id')
  const tgStartParam = searchParams.get('tg_start_param')
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // 检查用户是否已登录并生成 bind_token
  useEffect(() => {
    const checkAuthAndGenerateToken = async () => {
      if (tgUserId && tgChatId) {
        try {
          // 检查用户是否已登录
          const session = await authClient.getSession()
          if (session?.data?.user) {
            // 生成 bind_token
            const response = await fetch('/api/telegram/bind-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                tg_user_id: tgUserId,
                tg_chat_id: tgChatId,
              }),
            })
            
            if (response.ok) {
              const data = await response.json()
              setBindToken(data.bind_token)
            }
          }
        } catch (error) {
          console.error('Error generating bind token:', error)
        }
      }
    }
    
    checkAuthAndGenerateToken()
  }, [tgUserId, tgChatId])

  const handleTelegramBind = async () => {
    if (!bindToken) return
    
    setIsBindingLoading(true)
    try {
      const response = await fetch('/api/bind/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bind_token: bindToken,
          tg_start_param: tgStartParam,
        }),
      })
      
      if (response.ok) {
        toast.success('Telegram 账户绑定成功！')
        router.push('/')
      } else {
        const error = await response.json()
        toast.error(error.error || '绑定失败')
      }
    } catch (error) {
      console.error('Binding error:', error)
      toast.error('绑定过程中发生错误')
    } finally {
      setIsBindingLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsloading(true)
    const {success, message} = await signUp(values.username, values.email, values.password)
      if (success)  {
        toast.success(message as string)
        router.push("/")
      } else {
        toast.error(message as string)
      }
      setIsloading(false)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Sign up with your Google account or email
          </CardDescription>
        </CardHeader>
        <CardContent>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6">
              {/* 显示一键绑定按钮（如果有 Telegram 参数且用户已登录） */}
              {bindToken && (
                <div className="flex flex-col gap-4">
                  <div className="text-center text-sm text-muted-foreground">
                    检测到 Telegram 账户，可以直接绑定
                  </div>
                  <Button 
                    variant="default" 
                    className="w-full" 
                    type="button" 
                    onClick={handleTelegramBind}
                    disabled={isBindingLoading}
                  >
                    {isBindingLoading ? "绑定中..." : "🔗 一键绑定 Telegram"}
                  </Button>
                  <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                      或者继续注册新账户
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full" type="button" onClick={signInWithGoogle}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Google
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
                  {isloading ? "Loading..." : "Sign up"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Login
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
