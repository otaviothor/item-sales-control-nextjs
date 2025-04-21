import { List } from "./components/list";

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Controle de venda de itens
      </h1>
      <p className="mb-4">
        I'm a Vim enthusiast and tab advocate, finding unmatched efficiency in
        Vim's keystroke commands and tabs' flexibility for personal viewing
        preferences.
      </p>
      <div className="mb-4">
        <List />
      </div>
    </section>
  );
}
