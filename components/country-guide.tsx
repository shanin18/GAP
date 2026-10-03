import type { ComponentProps, ReactNode } from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { AnimatedDisclosure } from "@/components/ui/animated-disclosure";
import { CanadaFacts, CanadaGuideSection } from "@/components/canada-guide-sections";
import { DestinationFacts, DestinationGuideSection } from '@/components/destination-guide-sections';
import { getDestinationGuide } from '@/lib/destination-study-guides';

type Body = ComponentProps<typeof RichText>["data"];
type Node = Body["root"]["children"][number] & { text?: string; tag?: string; children?: Node[] };
function textOf(node: Node): string {
  if (typeof node.text === "string") return node.text;
  return Array.isArray(node.children) ? node.children.map(child => textOf(child as Node)).join("") : "";
}
function sectionId(title: string) {
  if (/admission|requirement/i.test(title)) return "requirements";
  if (/intake|deadline/i.test(title)) return "intakes";
  if (/program|study level/i.test(title)) return "programs";
  if (/universit/i.test(title)) return "universities";
  if (/cost|tuition/i.test(title)) return "costs";
  if (/cities/i.test(title)) return "cities";
  if (/work/i.test(title)) return "work";
  if (/article|reading/i.test(title)) return "articles";
  if (/question|answer/i.test(title)) return "faq";
  return "overview";
}
const labels: Record<string, string> = { overview: "Overview", requirements: "Admission requirements", intakes: "Intakes", programs: "Programs", universities: "Universities", costs: "Costs", cities: "Cities", work: "Work opportunities", articles: "Articles", faq: "Questions & answers" };

export function CountryGuide({ body, countryName, universities, articles }: { body: Body; countryName: string; universities: ReactNode; articles: ReactNode }) {
  const hasGuide = countryName === 'Canada' || Boolean(getDestinationGuide(countryName));
  const Details = countryName === 'Canada' ? CanadaGuideSection : ({ id }: { id: string }) => <DestinationGuideSection countryName={countryName} id={id} />;
  const sections: { title: string; id: string; nodes: Node[] }[] = [];
  let current: typeof sections[number] | undefined;
  for (const node of body.root.children as Node[]) {
    if (node.type === "heading" && node.tag === "h2") {
      const title = textOf(node);
      const id = sectionId(title);
      const existing = sections.find(section => section.id === id);
      if (existing) { existing.nodes.push(node); current = existing; }
      else { current = { title, id, nodes: [] }; sections.push(current); }
    } else {
      if (!current) { current = { title: "Overview", id: "overview", nodes: [] }; sections.push(current); }
      current.nodes.push(node);
    }
  }
  return <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
    <nav aria-label="Country guide sections" className="sticky top-[73px] z-30 mb-8 overflow-x-auto rounded-xl border border-border bg-background px-4 py-2 shadow-sm sm:top-[81px]">
      <ul className="flex w-max min-w-full items-center gap-5">{sections.map(section => <li key={section.id}><a href={`#${section.id}`} className="inline-flex min-h-10 items-center whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">{labels[section.id]}</a></li>)}</ul>
    </nav>
    <div>
      <div className="min-w-0">{sections.map(section => <section key={section.id} id={section.id} className="scroll-mt-44 border-b border-border py-9 first:pt-0 last:border-0 lg:scroll-mt-36">
        <h2 className="mb-5 font-display text-2xl leading-tight sm:text-3xl">{section.title}</h2>
        {section.id === "faq" ? <GuideQuestions nodes={section.nodes} body={body} /> : hasGuide && section.id === "requirements" ? <Details id={section.id} /> : <GuideText nodes={section.nodes} body={body} />}
        {countryName === "Canada" && section.id === "overview" && <CanadaFacts />}
        {countryName !== 'Canada' && section.id === 'overview' && <DestinationFacts countryName={countryName} />}
        {hasGuide && !["overview", "requirements", "faq", "universities", "articles"].includes(section.id) && <Details id={section.id} />}
        {section.id === "universities" && universities}
        {section.id === "articles" && articles}
      </section>)}</div>
    </div>
  </div>;
}
function GuideText({ nodes, body }: { nodes: Node[]; body: Body }) {
  return <RichText data={{ ...body, root: { ...body.root, children: nodes } }} className="text-sm leading-7 text-muted-foreground sm:text-base [&_p]:mb-4 [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-semibold [&_h3]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_a]:underline [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:p-3" />;
}
function GuideQuestions({ nodes, body }: { nodes: Node[]; body: Body }) {
  const questions: { title: string; nodes: Node[] }[] = [];
  for (const node of nodes) {
    if (node.type === "heading") questions.push({ title: textOf(node), nodes: [] });
    else if (questions.length) questions[questions.length - 1].nodes.push(node);
    else questions.push({ title: "Which course should I choose?", nodes: [node] });
  }
  return <div className="space-y-3">{questions.map((question, i) => <AnimatedDisclosure key={`${question.title}-${i}`} title={question.title}><GuideText nodes={question.nodes} body={body} /></AnimatedDisclosure>)}</div>;
}
