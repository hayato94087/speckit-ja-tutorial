import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTask } from "@/lib/task-factory";

describe("createTask", () => {
  beforeEach(() => {
    // 固定の日時をモック
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-03T10:00:00.000Z"));
  });

  it("正しい構造のタスクを生成する", () => {
    const task = createTask("牛乳を買う");

    expect(task).toMatchObject({
      title: "牛乳を買う",
      completed: false,
      createdAt: "2026-02-03T10:00:00.000Z",
    });
    expect(task.id).toBeDefined();
    expect(typeof task.id).toBe("string");
    expect(task.id.length).toBeGreaterThan(0);
    expect(task.updatedAt).toBeUndefined();
  });

  it("タスク名の前後の空白をトリムする", () => {
    const task = createTask("  牛乳を買う  ");
    expect(task.title).toBe("牛乳を買う");
  });

  it("各呼び出しで一意のIDを生成する", () => {
    const task1 = createTask("タスク1");
    const task2 = createTask("タスク2");
    expect(task1.id).not.toBe(task2.id);
  });

  it("新規タスクはcompleted: falseで生成される", () => {
    const task = createTask("新しいタスク");
    expect(task.completed).toBe(false);
  });
});
