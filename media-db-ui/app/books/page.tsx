import { CollectionPage, collectionMetadata } from "@/components/collection-page";

export const metadata = collectionMetadata("books");

export default function Page({ searchParams }: PageProps<"/books">) {
  return <CollectionPage collection="books" searchParams={searchParams} />;
}
