import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { bindToken } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tg_user_id, tg_chat_id } = body;

    if (!tg_user_id || !tg_chat_id) {
      return NextResponse.json(
        { error: "Missing telegram parameters" },
        { status: 400 }
      );
    }

    // 生成唯一的 bind_token 和 state
    const token = nanoid(32);
    const state = nanoid(16);
    
    // 设置过期时间（10分钟）
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 清理该用户之前未使用的 bind_token
    await db.delete(bindToken)
      .where(
        and(
          eq(bindToken.userId, session.user.id),
          eq(bindToken.used, false)
        )
      );

    // 创建新的 bind_token
    await db.insert(bindToken).values({
      id: nanoid(),
      token,
      userId: session.user.id,
      state,
      telegramChatId: tg_chat_id,
      telegramUserId: tg_user_id,
      expiresAt,
      used: false,
    });

    return NextResponse.json({
      success: true,
      bind_token: token,
      state,
      expires_at: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error("Error generating bind token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}