import { CollectionPage, collectionMetadata } from "@/components/collection-page";

export const metadata = collectionMetadata("movies");

export default function Page({ searchParams }: PageProps<"/movies">) {
  return <CollectionPage collection="movies" searchParams={searchParams} />;
}
