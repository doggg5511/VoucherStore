import { LoaderIcon } from "lucide-react";
import {cn} from "@/lib/utils.ts";

const Loader = ({className}: {className?: string}) => {
  return <LoaderIcon className={cn("mr-2 h-4 w-4 animate-spin", className)} />;
};

export default Loader;
