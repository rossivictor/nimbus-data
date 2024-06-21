import SearchComponent from "../components/SearchComponent";

export default function Home() {
  return (
    <div className="w-full text-center">
      <h1 className="text-red-400 font-bold mb-4 dark:text-red-100">
        Nimbus Data
      </h1>
      <em>Varredura e captura de dados de empresas em segundos!</em>
      <SearchComponent />
    </div>
  );
}
