import { RouteContext } from "@redwoodjs/sdk/router";
import { db } from "@/db";
import { link } from "src/shared/links";

export async function List({ ctx }: RouteContext<{}>) {
  const portfolioItems = await db.user.findMany();
  return (
    <div>
      {portfolioItems.map((item: any) => (
        <div key={item.id}>
          <a href={link("/portfolio/:id", { id: item.id })}>{item.id}</a>
        </div>
      ))}
    </div>
  );
}
