import { FormEvent, useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  description: string | null;
};

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Missing user session. Please log in again.");

      const response = await fetch("/api/categories", {
        headers: { "X-USER-ID": userId },
      });

      if (!response.ok) {
        throw new Error(`Failed to load categories (${response.status})`);
      }

      const data: Category[] = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Missing user session. Please log in again.");

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-USER-ID": userId,
        },
        body: JSON.stringify({
          name: trimmedName,
          description: trimmedDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add category (${response.status})`);
      }

      setName("");
      setDescription("");
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add category.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description ?? "");
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleUpdate = async (id: number) => {
    setError(null);

    const trimmedName = editName.trim();
    const trimmedDescription = editDescription.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Missing user session. Please log in again.");

      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-USER-ID": userId,
        },
        body: JSON.stringify({
          name: trimmedName,
          description: trimmedDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update category (${response.status})`);
      }

      cancelEdit();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    if (!window.confirm("Delete this category?")) return;

    setSaving(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Missing user session. Please log in again.");

      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          "X-USER-ID": userId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete category (${response.status})`);
      }

      if (editingId === id) cancelEdit();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-5xl p-4">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">Categories</h2>

        {error && (
          <div className="mb-3 border border-red-300 bg-red-50 p-2 text-red-700">{error}</div>
        )}

        <form onSubmit={handleAdd} className="mb-4 border p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <input
              type="text"
              placeholder="Category name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full border border-gray-300 p-2"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full border border-gray-300 p-2"
            />
          </div>
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer bg-gray-900 px-3 py-2 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Adding..." : "+ Add Category"}
            </button>
          </div>
        </form>

        <div className="overflow-x-auto border">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-gray-600">
                    Loading categories...
                  </td>
                </tr>
              )}
              {!loading && categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-gray-600">
                    No categories yet.
                  </td>
                </tr>
              )}
              {!loading &&
                categories.map((category) => (
                  <tr key={category.id} className="border-b">
                    <td className="px-3 py-2">
                      {editingId === category.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          className="w-full border border-gray-300 p-2"
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {editingId === category.id ? (
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(event) => setEditDescription(event.target.value)}
                          className="w-full border border-gray-300 p-2"
                        />
                      ) : (
                        category.description || "-"
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === category.id ? (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void handleUpdate(category.id)}
                            className="cursor-pointer text-gray-700 transition hover:text-black hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={cancelEdit}
                            className="cursor-pointer text-gray-700 transition hover:text-black hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => startEdit(category)}
                            className="cursor-pointer text-gray-700 transition hover:text-black hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void handleDelete(category.id)}
                            className="cursor-pointer text-gray-700 transition hover:text-black hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
