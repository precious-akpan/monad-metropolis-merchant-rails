import { PayClient } from "./PayClient";

export default async function PayPage({ params }: PageProps<"/pay/[id]">) {
  const { id } = await params;
  return <PayClient id={id as `0x${string}`} />;
}
