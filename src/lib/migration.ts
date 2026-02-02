import {
  StorageData,
  StorageDataSchema,
  CURRENT_STORAGE_VERSION,
} from "@/types/todo";

/**
 * データをマイグレーションする（data-model.md §6準拠）
 * @param data - マイグレーション対象のデータ
 * @returns マイグレーション後のデータ、または復元不可の場合はnull
 */
export function migrateData(data: unknown): StorageData | null {
  // null/undefinedチェック
  if (data === null || data === undefined) {
    return null;
  }

  // オブジェクト以外は無効
  if (typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const parsed = data as Record<string, unknown>;

  // バージョンがない場合は無効
  if (typeof parsed.version !== "number") {
    return null;
  }

  const version = parsed.version;

  // 未来のバージョンは処理できない
  if (version > CURRENT_STORAGE_VERSION) {
    return null;
  }

  // 現在のバージョンならバリデーションして返す
  if (version === CURRENT_STORAGE_VERSION) {
    const result = StorageDataSchema.safeParse(data);
    if (result.success) {
      return result.data;
    }
    return null;
  }

  // 古いバージョンのマイグレーション（将来の拡張用）
  // 現時点ではv1のみなので、v0からのマイグレーションは未実装
  return null;
}
