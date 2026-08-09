type HeaderProps = {
  tokenName: string;
  symbol: string;
  supply: string;
  network: string;
};

export default function Header({
  tokenName,
  symbol,
  supply,
  network,
}: HeaderProps) {
  return (
    <div className="mb-8">

      <div className="flex flex-col items-center">

        <img
          src="/aethel.png"
          alt="Aethel"
          className="w-28 h-28 drop-shadow-2xl"
        />

        <h1 className="mt-4 text-4xl font-bold text-amber-300">
          {tokenName || "Aethel"}
        </h1>

        <p className="text-gray-400 mt-1">
          {symbol || "AETH"}
        </p>

      </div>

      <div className="mt-8 rounded-2xl bg-slate-900 border border-slate-700 p-5">

        <div className="flex justify-between mb-3">
          <span className="text-gray-400">
            Supply
          </span>

          <span className="font-semibold text-white">
            {supply || "..."} {symbol}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">
            Red
          </span>

          <span className="font-semibold text-green-400">
            {network}
          </span>
        </div>

      </div>

    </div>
  );
}