import { CollectionPage, collectionMetadata } from "@/components/collection-page";

export const metadata = collectionMetadata("games");

export default function Page({ searchParams }: PageProps<"/games">) {
  return <CollectionPage collection="games" searchParams={searchParams} />;
}
