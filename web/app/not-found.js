import Link from "next/link";
import Button from "@/components/Button";
import { Tote } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-blush grid place-items-center mb-6 text-plum">
        <Tote size={44} weight="light" />
      </div>
      <h1 className="text-4xl font-sans font-extrabold text-plum-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-muted mb-8 max-w-sm">
        The piece or collection you are looking for might have been moved or is no longer available.
      </p>
      <div className="flex gap-3">
        <Button href="/" variant="primary">
          Back to Home
        </Button>
        <Button href="/shop" variant="outline">
          Explore Shop
        </Button>
      </div>
    </div>
  );
}

