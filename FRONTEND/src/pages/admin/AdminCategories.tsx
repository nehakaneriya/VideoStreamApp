import { useEffect, useState } from "react";
import { Tag, Trash2, Loader2, Plus } from "lucide-react";
import { getAllCategories, createCategory, deleteCategory } from "@/service/CategoryService";
import type { Category } from "@/models/Category";
import { toast } from "react-toastify";

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await getAllCategories();
            setCategories(data);
        } catch {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Category name is required");
            return;
        }
        try {
            setCreating(true);
            await createCategory({ name: name.trim(), description: description.trim() || undefined });
            toast.success("Category added");
            setName("");
            setDescription("");
            loadCategories();
        } catch (err) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Failed to add category";
            toast.error(msg);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (cat: Category) => {
        const confirmMsg =
            cat.slug === "other"
                ? "The 'Other' category cannot be deleted."
                : `Delete "${cat.name}"? Videos in this category will move to 'Other'.`;
        if (!window.confirm(confirmMsg)) return;

        try {
            setDeletingId(cat.id);
            const result = await deleteCategory(cat.id);
            toast.success(result.message || "Category deleted");
            loadCategories();
        } catch (err) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Failed to delete category";
            toast.error(msg);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-2">

            {/* Header */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold">
                    <span className="text-red-600">Manage</span> Categories
                </h1>
                {!loading && (
                    <span className="text-sm text-gray-400 bg-[#181818] border border-gray-700 px-3 py-1 rounded-full">
                        {categories.length} total
                    </span>
                )}
            </div>

            {/* Add form */}
            <form
                onSubmit={handleCreate}
                className="bg-[#181818] border border-gray-800 rounded-xl p-5 mb-8"
            >
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-red-600" />
                    Add New Category
                </h2>
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Category name (e.g. Sports)"
                        className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 outline-none text-white placeholder-gray-600"
                    />
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 outline-none text-white placeholder-gray-600"
                    />
                    <button
                        type="submit"
                        disabled={creating}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition disabled:opacity-50 cursor-pointer"
                    >
                        {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        {creating ? "Adding..." : "Add Category"}
                    </button>
                </div>
            </form>

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 size={36} className="animate-spin text-red-600" />
                </div>

            /* Empty */
            ) : categories.length === 0 ? (
                <div className="bg-[#181818] border border-gray-800 rounded-xl p-16 text-center">
                    <Tag size={52} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg font-medium">No categories yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Add your first category using the form above
                    </p>
                </div>

            /* Category list */
            ) : (
                <div className="bg-[#181818] border border-gray-800 rounded-xl overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-[#111] border-b border-gray-800">
                            <tr>
                                <th className="p-4 text-gray-400 text-sm">Name</th>
                                <th className="p-4 text-gray-400 text-sm">Slug</th>
                                <th className="p-4 text-gray-400 text-sm">Description</th>
                                <th className="p-4 text-gray-400 text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr
                                    key={cat.id}
                                    className="border-b border-gray-800 hover:bg-[#1f1f1f] transition"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-red-600/20 flex items-center justify-center">
                                                <Tag size={14} className="text-red-500" />
                                            </div>
                                            <span className="font-medium">{cat.name}</span>
                                            {cat.slug === "other" && (
                                                <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full uppercase">
                                                    Reserved
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">{cat.slug}</td>
                                    <td className="p-4 text-gray-400 text-sm max-w-[250px] truncate">
                                        {cat.description || "—"}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDelete(cat)}
                                            disabled={deletingId === cat.id}
                                            className="flex items-center gap-1 px-3 py-1 bg-red-600/10 text-red-500 rounded hover:bg-red-600 hover:text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition border border-red-600/20"
                                        >
                                            {deletingId === cat.id
                                                ? <Loader2 size={14} className="animate-spin" />
                                                : <Trash2 size={14} />
                                            }
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
