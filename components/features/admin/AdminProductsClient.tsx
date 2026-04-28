"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toaster";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { ImageUploader } from "./ImageUploader";

const productSchema = z.object({
  name:         z.string().min(2, "Name required"),
  description:  z.string().min(10, "Description required"),
  price:        z.coerce.number().positive("Price must be positive"),
  comparePrice: z.coerce.number().positive().optional().or(z.literal("")),
  images:       z.array(z.string()).min(1, "At least one image required"),
  category:     z.string().min(2, "Category required"),
  tags:         z.string().optional(),
  stock:        z.coerce.number().int().min(0, "Stock cannot be negative"),
  isPublished:  z.boolean().default(true),
  isFeatured:   z.boolean().default(false),
});
type ProductForm = z.infer<typeof productSchema>;

export function AdminProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products,   setProducts]   = useState(initialProducts);
  const [search,     setSearch]     = useState("");
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setDeleteId(id); // open modal
  };

  const { register, handleSubmit, reset, control, formState: { errors } } =
    useForm<ProductForm>({ resolver: zodResolver(productSchema) });

  function openCreate() {
    setEditing(null);
    reset({ name: "", description: "", price: 0, stock: 0, category: "", images: [], isPublished: true, isFeatured: false });
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    reset({
      name:         product.name,
      description:  product.description,
      price:        product.price,
      comparePrice: product.comparePrice ?? undefined,
      images:       product.images,
      category:     product.category,
      tags:         product.tags.join(", "),
      stock:        product.stock,
      isPublished:  product.isPublished,
      isFeatured:   product.isFeatured,
    });
    setModalOpen(true);
  }

  async function onSubmit(data: ProductForm) {
    setSaving(true);
    try {
      const payload = {
        ...data,
        tags:         data.tags ? data.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
        comparePrice: data.comparePrice !== "" && data.comparePrice ? Number(data.comparePrice) : undefined,
      };

      if (editing) {
        const res = await fetch(`/api/admin/products/${editing.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { data: updated } = await res.json();
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          toast.success("Product updated");
        } else {
          toast.error("Update failed");
        }
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { data: created } = await res.json();
          setProducts((prev) => [created, ...prev]);
          toast.success("Product created");
        } else {
          toast.error("Create failed");
        }
      }
      setModalOpen(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // async function handleDelete(id: string) {
  //   if (!confirm("Delete this product? This cannot be undone.")) return;
  //   setDeletingId(id);
  //   try {
  //     await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
  //     setProducts((prev) => prev.filter((p) => p.id !== id));
  //     toast.info("Product deleted");
  //   } catch {
  //     toast.error("Delete failed");
  //   } finally {
  //     setDeletingId(null);
  //   }
  // }

  async function confirmDelete() {
  if (!deleteId) return;

  setDeletingId(deleteId);

  try {
    await fetch(`/api/admin/products/${deleteId}`, { method: "DELETE" });

    setProducts((prev) => prev.filter((p) => p.id !== deleteId));

    toast.info("Product deleted");
  } catch {
    toast.error("Delete failed");
  } finally {
    setDeletingId(null);
    setDeleteId(null);
  }
}

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-50">
          <Input placeholder="Search products…" leftIcon={<Search size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus size={15} /> Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="surface rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border)" style={{ background: "var(--color-surface-2)" }}>
                {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3"
                    style={{ color: "var(--color-text-subtle)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-(--color-border) last:border-0 transition-colors hover:bg-(--color-surface-2)">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0"
                        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
                        {product.images[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={14} style={{ color: "var(--color-text-subtle)" }} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-40" style={{ color: "var(--color-text)" }}>{product.name}</p>
                        <p className="text-[11px] font-mono" style={{ color: "var(--color-text-subtle)" }}>{product.id.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize" style={{ color: "var(--color-text-muted)" }}>{product.category}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--color-text)" }}>{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span style={{ color: product.stock === 0 ? "var(--color-error)" : product.stock < 10 ? "var(--color-warning)" : "var(--color-text-muted)" }}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={product.isPublished ? "success" : "default"}>{product.isPublished ? "Published" : "Draft"}</Badge>
                      {product.isFeatured && <Badge variant="accent">Featured</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(product)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-(--color-surface)"
                        style={{ color: "var(--color-text-muted)" }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} disabled={deletingId === product.id}
                        className="p-1.5 rounded-lg transition-colors hover:bg-(--color-error)/10 disabled:opacity-50"
                        style={{ color: "var(--color-text-muted)" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
              <Package size={32} className="mx-auto mb-3 opacity-30" />
              <p>No products found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Product" : "Add New Product"} size="xl">
        <div className="max-h-[80vh] overflow-y-auto pr-2">

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
          <div className="sm:col-span-2">
            <Input label="Product Name" {...register("name")} error={errors.name?.message} placeholder="Premium Wireless Headphones" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--color-text-muted)" }}>Description</label>
            <textarea {...register("description")} rows={3} placeholder="Detailed product description…"
              className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
              style={{
                background: "var(--color-surface)",
                border: `1px solid ${errors.description ? "var(--color-error)" : "var(--color-border)"}`,
                color: "var(--color-text)",
              }}
            />
            {errors.description && <p className="text-xs mt-1" style={{ color: "var(--color-error)" }}>{errors.description.message}</p>}
          </div>

          {/* Image Uploader */}
          <div className="sm:col-span-2">
            <label className="text-sm font-medium block mb-2" style={{ color: "var(--color-text-muted)" }}>
              Product Images
            </label>
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <ImageUploader value={field.value ?? []} onChange={field.onChange} />
              )}
            />
            {errors.images && <p className="text-xs mt-1" style={{ color: "var(--color-error)" }}>{errors.images.message}</p>}
          </div>

          <Input label="Price (₹)" type="number" step="0.01" {...register("price")} error={errors.price?.message} placeholder="999" />
          <Input label="Compare Price (₹, optional)" type="number" step="0.01" {...register("comparePrice")} placeholder="1499" />
          <Input label="Category" {...register("category")} error={errors.category?.message} placeholder="Electronics" />
          <Input label="Stock" type="number" {...register("stock")} error={errors.stock?.message} placeholder="100" />
          <div className="sm:col-span-2">
            <Input label="Tags (comma separated)" {...register("tags")} placeholder="wireless, audio, premium" />
          </div>
          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register("isPublished")} className="w-4 h-4 rounded accent-(--color-accent-2)" />
              <span style={{ color: "var(--color-text-muted)" }}>Published</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register("isFeatured")} className="w-4 h-4 rounded accent-(--color-accent-2)" />
              <span style={{ color: "var(--color-text-muted)" }}>Featured</span>
            </label>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? "Save Changes" : "Create Product"}</Button>
          </div>
        </form>
        </div>
      </Modal>

      <Modal
  open={!!deleteId}
  onClose={() => setDeleteId(null)}
  title="Delete Product"
  size="sm"
>
  <div className="space-y-4">
    <p className="text-sm text-(--color-text-muted)">
      Are you sure you want to delete this product? This action cannot be undone.
    </p>

    <div className="flex justify-end gap-3">
      <Button variant="ghost" onClick={() => setDeleteId(null)}>
        Cancel
      </Button>
      <Button
        variant="secondary"
        loading={deletingId === deleteId}
        onClick={confirmDelete}
      >
        Delete
      </Button>
    </div>
  </div>
</Modal>
    </>
  );
}