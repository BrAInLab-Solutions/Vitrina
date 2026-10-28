export function slugify(input: string) {
  const map: Record<string, string> = {
    đ: "dj",
    Đ: "dj",
    č: "c",
    ć: "c",
    š: "s",
    ž: "z",
    Č: "c",
    Ć: "c",
    Š: "s",
    Ž: "z",
  };
  const replaced = input.replace(/[đĐčćšžČĆŠŽ]/g, (char) => map[char] ?? char);
  const base = replaced
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "sajt";
}
