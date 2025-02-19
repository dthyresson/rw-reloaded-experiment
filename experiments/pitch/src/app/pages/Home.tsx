import { db } from "@/db";
export async function Home() {
  const users = await db.user.findMany();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Hello World</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
      {users.map((user) => (
        <ul key={user.id} className="text-3xl font-bold underline">
          <li>{user.email}</li>
        </ul>
      ))}
    </div>
  );
}
