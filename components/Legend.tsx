"use client";
import { colorMapping } from "@/lib/constants";
// import { colorMapping, exchangeServerLogos } from "@/lib/constants";
// import Image from "next/image";

const Legend = () => {
  return (
    <div className="absolute bottom-6 left-6 rounded-lg bg-black/40 py-4 px-5">
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-2 font-semibold text-xl">Cloud Providers</p>
          <div className="flex flex-col gap-2 font-medium">
            {Object.entries(colorMapping)?.map(([provider, color]) => (
              <div
                className="flex items-center gap-3"
                key={`${provider}-${color}`}
              >
                <div
                  className={`border-3 rounded-full w-9 h-9`}
                  style={{ borderColor: color }}
                />
                <span>{provider}</span>
              </div>
            ))}
          </div>
        </div>
        {/* <div>
          <p className="mb-2 font-semibold text-xl">Exchange Servers</p>
          <div className="flex flex-col gap-2 font-medium">
            {Object.entries(exchangeServerLogos)?.map(([server, logoUrl]) => (
              <div className="flex items-center gap-3" key={logoUrl}>
                <div className="rounded-full w-9 h-9 overflow-hidden bg-white">
                  <Image src={logoUrl} alt={server} width={50} height={50} />
                </div>
                <span>{server}</span>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Legend;
