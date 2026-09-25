import { useEffect, useState } from "react";
import { Tag, Trash2, Loader2, Plus, Pencil, X } from "lucide-react";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "@/service/CategoryService";
import type { Category } from "@/models/Category";
import { toast } from "react-toastify";

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    // Edit Modal States
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [updating, setUpdating] = useState(false);

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

    const handleOpenEdit = (cat: Category) => {
        setEditingCategory(cat);
        setEditName(cat.name);
        setEditDescription(cat.description || "");
    };

    const handleCloseEdit = () => {
        setEditingCategory(null);
        setEditName("");
        setEditDescription("");
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        if (!editName.trim()) {
            toast.error("Category name is required");
            return;
        }
        try {
            setUpdating(true);
            await updateCategory(editingCategory.id, {
                name: editName.trim(),
                description: editDescription.trim() || undefined,
            });
            toast.success("Category updated successfully");
            handleCloseEdit();
            loadCategories();
        } catch (err) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Failed to update category";
            toast.error(msg);
        } finally {
            setUpdating(false);
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
                                        <div className="flex items-center gap-2">
                                            {/* Edit */}
                                            <button
                                            onClick={() => handleOpenEdit(cat)}
                                            className="flex items-center justify-center gap-1.5 w-[85px] py-2 bg-gray-700/40 hover:bg-red-600 text-gray-300 hover:text-white text-xs font-medium rounded-lg border border-gray-700 hover:border-red-600 transition cursor-pointer"
                                            >
                                            <Pencil size={13} />
                                            Edit
                                            </button>

                                            {/* Delete */}
                                            <button
                                            onClick={() => handleDelete(cat)}
                                            disabled={deletingId === cat.id}
                                            className="flex items-center justify-center gap-1.5 w-[85px] py-2 bg-gray-700/40 hover:bg-red-600 text-gray-300 hover:text-white text-xs font-medium rounded-lg border border-gray-700 hover:border-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                            {deletingId === cat.id ? (
                                                <Loader2 size={13} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={13} />
                                            )}
                                            {deletingId === cat.id ? "..." : "Delete"}
                                            </button>                                                                       
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Category Modal */}
            {editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                    <div
                        className="w-full max-w-lg bg-[#181818] border border-gray-800 rounded-2xl shadow-2xl p-6 animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                            <Pencil size={18} className="text-red-500" />
                                Edit Category
                            </h2>
                            <button
                                onClick={handleCloseEdit}
                                className="text-gray-400 hover:text-white transition cursor-pointer p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                    Category Name {editingCategory.slug === "other" && <span className="text-yellow-500 text-xs">(Reserved category name cannot be modified)</span>}
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={editingCategory.slug === "other"}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Category name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-white placeholder-gray-600 resize-none"
                                    placeholder="Category description (optional)"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={handleCloseEdit}
                                    disabled={updating}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 cursor-pointer"
                                    >
                                    {updating && (
                                        <Loader2 size={15} className="animate-spin" />
                                    )}

                                    {updating ? "Saving..." : "Save Changes"}
                                    </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
