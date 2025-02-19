import { db } from "@/db";
export async function Home() {
  const users = await db.user.findMany();

  return (
    <div>
      <h1>Hello World</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
      {users.map((user) => (
        <ul key={user.id}>
          <li>{user.email}</li>
        </ul>
      ))}
    </div>
  );
}
