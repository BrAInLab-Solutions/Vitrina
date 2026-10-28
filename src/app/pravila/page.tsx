import type { Metadata } from "next";
import { RuleCard } from "@/components/rule-card";

export const metadata: Metadata = { title: "Pravila" };

export default function RulesPage() {
  const rules = [
    ["Ponude", "Prihvaćena ponuda ostaje u evidenciji. Pobednik je najviša ponuda na zatvaranju."],
    ["Produženje", "Ponuda pred kraj kratko produžava aukciju."],
    ["Plaćanje", "Kartice se ne čuvaju ovde. U ovoj verziji uplatu potvrđuje administrator."],
    ["Provizija", "Naši sajtovi: 100% firmi. Eksterni: 90% kreatoru, 10% platformi."],
    ["Predaja", "Posle uplate: kod, resursi i dogovoreni pristupi."],
    ["Sporovi", "Prijava se šalje uz opis. Administrator donosi odluku."],
  ];

  return (
    <div className="wrap py-14">
      <h1 className="serif text-5xl">Pravila</h1>
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {rules.map(([title, text]) => (
          <RuleCard key={title} title={title} text={text} />
        ))}
      </div>
    </div>
  );
}
