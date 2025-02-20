import { RouteContext } from "@redwoodjs/sdk/router";

export function Detail({ params, ctx }: RouteContext<{ id: string }>) {
  return <div>Detail {params.id}</div>;
}
