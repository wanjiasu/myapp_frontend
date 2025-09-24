import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { bindToken, telegramBinding } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bind_token, tg_start_param } = body;

    if (!bind_token) {
      return NextResponse.json(
        { error: "Missing bind_token" },
        { status: 400 }
      );
    }

    // 查找有效的 bind_token
    const tokenRecord = await db.select()
      .from(bindToken)
      .where(
        and(
          eq(bindToken.token, bind_token),
          eq(bindToken.used, false)
        )
      )
      .limit(1);

    if (tokenRecord.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired bind_token" },
        { status: 400 }
      );
    }

    const token = tokenRecord[0];

    // 检查是否过期
    if (new Date() > token.expiresAt) {
      return NextResponse.json(
        { error: "Bind token has expired" },
        { status: 400 }
      );
    }

    // 检查是否已经绑定过这个 Telegram 账户
    const existingBinding = await db.select()
      .from(telegramBinding)
      .where(eq(telegramBinding.telegramChatId, token.telegramChatId!))
      .limit(1);

    if (existingBinding.length > 0) {
      // 更新现有绑定
      await db.update(telegramBinding)
        .set({
          userId: token.userId,
          telegramUserId: token.telegramUserId!,
          updatedAt: new Date(),
        })
        .where(eq(telegramBinding.telegramChatId, token.telegramChatId!));
    } else {
      // 创建新绑定
      await db.insert(telegramBinding).values({
        id: nanoid(),
        userId: token.userId,
        telegramChatId: token.telegramChatId!,
        telegramUserId: token.telegramUserId!,
      });
    }

    // 标记 token 为已使用
    await db.update(bindToken)
      .set({ used: true })
      .where(eq(bindToken.id, token.id));

    return NextResponse.json({
      success: true,
      message: "Telegram account successfully bound",
      user_id: token.userId,
      telegram_chat_id: token.telegramChatId,
    });

  } catch (error) {
    console.error("Error confirming bind:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}