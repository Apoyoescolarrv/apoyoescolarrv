import { PREFIX } from "@/lib/constants";

export default async function Home() {
  const data = await fetch(`${PREFIX}/api`);
  const json = await data.json();
  return <div className="container">{json.message}</div>;
}
