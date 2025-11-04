import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <main className="flex flex-col items-center justify-center gap-8 text-center max-w-2xl">
        <div className="w-full max-w-md">
          <Image
            src="/undraw_vibe-coding_mjme.svg"
            alt="Under Construction"
            width={400}
            height={300}
            className="w-full h-auto"
            priority
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Under Construction
          </h1>
          <p className="text-lg text-gray-600 max-w-md">
            We're working hard to bring you something amazing.
            Stay tuned!
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Building in progress...</span>
        </div>
      </main>
    </div>
  );
}
