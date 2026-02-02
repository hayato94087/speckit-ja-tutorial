import { describe, it, expect } from "vitest";
import { validateTaskTitle } from "@/lib/validation";

describe("validateTaskTitle", () => {
  describe("有効なタスク名", () => {
    it("通常のタスク名は有効", () => {
      const result = validateTaskTitle("牛乳を買う");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("1文字のタスク名は有効", () => {
      const result = validateTaskTitle("A");
      expect(result.valid).toBe(true);
    });

    it("255文字のタスク名は有効", () => {
      const title = "あ".repeat(255);
      const result = validateTaskTitle(title);
      expect(result.valid).toBe(true);
    });

    it("前後に空白があるタスク名はトリムされて有効", () => {
      const result = validateTaskTitle("  牛乳を買う  ");
      expect(result.valid).toBe(true);
    });
  });

  describe("無効なタスク名", () => {
    it("空文字は無効", () => {
      const result = validateTaskTitle("");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("タスク名を入力してください");
    });

    it("空白のみは無効", () => {
      const result = validateTaskTitle("   ");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("タスク名を入力してください");
    });

    it("256文字以上は無効", () => {
      const title = "あ".repeat(256);
      const result = validateTaskTitle(title);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("タスク名は255文字以内で入力してください");
    });
  });
});
