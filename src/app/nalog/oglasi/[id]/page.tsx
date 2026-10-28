import { redirect } from "next/navigation";

export default async function OldPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/pregled/${id}`);
}
