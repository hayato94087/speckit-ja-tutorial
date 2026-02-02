import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { z } from "zod";

const TestSchema = z.object({
  name: z.string(),
  value: z.number(),
});

describe("useLocalStorage", () => {
  const TEST_KEY = "test-key";

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("初期状態ではnullを返す", () => {
    const { result } = renderHook(() =>
      useLocalStorage(TEST_KEY, TestSchema)
    );

    expect(result.current.value).toBeNull();
    expect(result.current.isLoaded).toBe(true);
  });

  it("保存された値を読み込む", () => {
    localStorage.setItem(
      TEST_KEY,
      JSON.stringify({ name: "test", value: 42 })
    );

    const { result } = renderHook(() =>
      useLocalStorage(TEST_KEY, TestSchema)
    );

    expect(result.current.value).toEqual({ name: "test", value: 42 });
  });

  it("値を保存できる", () => {
    const { result } = renderHook(() =>
      useLocalStorage(TEST_KEY, TestSchema)
    );

    act(() => {
      result.current.setValue({ name: "new", value: 100 });
    });

    expect(result.current.value).toEqual({ name: "new", value: 100 });
    expect(JSON.parse(localStorage.getItem(TEST_KEY)!)).toEqual({
      name: "new",
      value: 100,
    });
  });

  it("値を削除できる", () => {
    localStorage.setItem(
      TEST_KEY,
      JSON.stringify({ name: "test", value: 42 })
    );

    const { result } = renderHook(() =>
      useLocalStorage(TEST_KEY, TestSchema)
    );

    act(() => {
      result.current.removeValue();
    });

    expect(result.current.value).toBeNull();
    expect(localStorage.getItem(TEST_KEY)).toBeNull();
  });

  it("無効なJSONの場合はエラーを設定する", () => {
    localStorage.setItem(TEST_KEY, "invalid json");

    const { result } = renderHook(() =>
      useLocalStorage(TEST_KEY, TestSchema)
    );

    expect(result.current.value).toBeNull();
    expect(result.current.error).not.toBeNull();
  });

  it("スキーマに合わない場合はエラーを設定する", () => {
    localStorage.setItem(TEST_KEY, JSON.stringify({ invalid: "data" }));

    const { result } = renderHook(() =>
      useLocalStorage(TEST_KEY, TestSchema)
    );

    expect(result.current.value).toBeNull();
    expect(result.current.error).not.toBeNull();
  });
});
