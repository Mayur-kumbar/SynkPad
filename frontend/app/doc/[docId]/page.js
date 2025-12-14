import DocEditor from "./DocEditor"

export default async function Page({ params }) {
  const { docId } = params
  return <DocEditor docId={docId} />
}
